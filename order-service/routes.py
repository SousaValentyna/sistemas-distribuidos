import uuid
import os
import logging
import requests
from flask import Blueprint, request, jsonify

from models import (
    create_order, get_order, update_status,
    update_driver, append_retry_event, serialize_order,
)
from resilience import call_with_retry

logger = logging.getLogger("routes")

bp = Blueprint("orders", __name__)

PAYMENT_URL   = os.environ.get("PAYMENT_SERVICE_URL",  "http://localhost:5002")
LOGISTICS_URL = os.environ.get("LOGISTICS_SERVICE_URL", "http://localhost:5003")


@bp.route("/health", methods=["GET"])
def health():
    return jsonify({"service": "order-service", "status": "ok"})


@bp.route("/orders", methods=["POST"])
def create_order_route():
    body = request.get_json(force=True)

    order_id   = body.get("order_id") or str(uuid.uuid4())
    customer   = body.get("customer", "Anônimo")
    restaurant = body.get("restaurant", "Restaurante")
    items      = body.get("items", [])
    total      = float(body.get("total", 0.0))

    # Idempotency guard: return existing order without re-processing
    existing = get_order(order_id)
    if existing:
        return jsonify(serialize_order(existing)), 200

    create_order(order_id, customer, restaurant, items, total)

    # ── Step 1: Payment ──────────────────────────────────────────────────────
    update_status(order_id, "payment_processing")
    try:
        resp = call_with_retry(
            url=f"{PAYMENT_URL}/payments",
            payload={"order_id": order_id, "amount": total},
            order_id=order_id,
            service_name="payment-service",
            append_fn=append_retry_event,
            timeout=3,
        )
        if resp.status_code != 200:
            update_status(order_id, "payment_failed")
            return jsonify(serialize_order(get_order(order_id))), 200
    except (requests.Timeout, requests.ConnectionError) as exc:
        logger.error("Pagamento esgotou retentativas para pedido %s: %s", order_id, exc)
        update_status(order_id, "payment_failed")
        return jsonify(serialize_order(get_order(order_id))), 200

    # ── Step 2: Logistics ────────────────────────────────────────────────────
    update_status(order_id, "logistics_assigning")
    try:
        resp = call_with_retry(
            url=f"{LOGISTICS_URL}/logistics/assign",
            payload={"order_id": order_id, "restaurant": restaurant},
            order_id=order_id,
            service_name="logistics-service",
            append_fn=append_retry_event,
            timeout=3,
        )
        if resp.status_code == 200:
            driver = resp.json().get("driver", "Entregador")
            update_driver(order_id, driver)
        else:
            update_status(order_id, "pending_logistics")
    except (requests.Timeout, requests.ConnectionError):
        # FALLBACK: logistics is down — queue order instead of crashing
        logger.warning(
            "Logística indisponível para pedido %s — fallback: pending_logistics", order_id
        )
        update_status(order_id, "pending_logistics")

    return jsonify(serialize_order(get_order(order_id))), 200


@bp.route("/orders/<order_id>", methods=["GET"])
def get_order_route(order_id):
    order = get_order(order_id)
    if order is None:
        return jsonify({"error": "Pedido não encontrado"}), 404
    return jsonify(serialize_order(order)), 200

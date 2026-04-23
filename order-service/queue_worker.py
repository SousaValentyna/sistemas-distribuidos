import json
import logging
import os
import threading
import time

import redis
import requests

from models import append_retry_event, get_order, update_driver, update_status

logger = logging.getLogger("queue_worker")
logging.basicConfig(level=logging.INFO)

REDIS_URL     = os.environ.get("REDIS_URL", "redis://localhost:6379")
LOGISTICS_URL = os.environ.get("LOGISTICS_SERVICE_URL", "http://localhost:5003")
QUEUE_KEY     = "logistics:pending"
RETRY_DELAY   = 5  # seconds to wait before re-queuing a failed attempt

_client: redis.Redis | None = None
_lock = threading.Lock()


def _get_client() -> redis.Redis:
    global _client
    with _lock:
        if _client is None:
            _client = redis.from_url(
                REDIS_URL, decode_responses=True, socket_connect_timeout=3
            )
        return _client


def _reset_client() -> None:
    global _client
    with _lock:
        _client = None


# ── Public API ────────────────────────────────────────────────────────────────

def enqueue_logistics(order_id: str, restaurant: str) -> None:
    """Push one order onto the logistics Redis queue and log the event."""
    payload = json.dumps({"order_id": order_id, "restaurant": restaurant})
    try:
        r = _get_client()
        r.rpush(QUEUE_KEY, payload)
        queue_size = r.llen(QUEUE_KEY)
        msg = (
            f"[QUEUE] Pedido {order_id} adicionado à fila de logística "
            f"(posição {queue_size} na fila)"
        )
        logger.info(msg)
        append_retry_event(order_id, msg)
    except redis.RedisError as exc:
        logger.error("[QUEUE] Falha ao enfileirar pedido %s: %s", order_id, exc)


# ── Worker internals ──────────────────────────────────────────────────────────

def _process(r: redis.Redis, item_str: str) -> None:
    item       = json.loads(item_str)
    order_id   = item["order_id"]
    restaurant = item.get("restaurant", "")

    order = get_order(order_id)
    if not order:
        logger.warning(
            "[QUEUE-WORKER] Pedido %s não encontrado no banco — descartando", order_id
        )
        return

    if order["status"] not in ("pending_logistics",):
        logger.info(
            "[QUEUE-WORKER] Pedido %s já com status '%s' — ignorando",
            order_id, order["status"],
        )
        return

    attempt_msg = f"[QUEUE-WORKER] Tentativa de despacho via fila | pedido {order_id}"
    logger.info(attempt_msg)
    append_retry_event(order_id, attempt_msg)

    try:
        resp = requests.post(
            f"{LOGISTICS_URL}/logistics/assign",
            json={"order_id": order_id, "restaurant": restaurant},
            timeout=5,
        )
        if resp.status_code == 200:
            driver      = resp.json().get("driver", "Entregador")
            update_driver(order_id, driver)
            success_msg = (
                f"[QUEUE-WORKER] ✓ Logística restaurada! "
                f"Pedido {order_id} despachado — Entregador: {driver}"
            )
            logger.info(success_msg)
            append_retry_event(order_id, success_msg)
        else:
            warn_msg = (
                f"[QUEUE-WORKER] Logística retornou HTTP {resp.status_code} "
                f"para pedido {order_id} — reenfileirando em {RETRY_DELAY}s"
            )
            logger.warning(warn_msg)
            append_retry_event(order_id, warn_msg)
            time.sleep(RETRY_DELAY)
            r.rpush(QUEUE_KEY, item_str)

    except (requests.Timeout, requests.ConnectionError) as exc:
        wait_msg = (
            f"[QUEUE-WORKER] Logística ainda indisponível | "
            f"pedido {order_id} | aguardando {RETRY_DELAY}s para nova tentativa"
        )
        logger.warning("[QUEUE-WORKER] %s (%s)", wait_msg, exc)
        append_retry_event(order_id, wait_msg)
        time.sleep(RETRY_DELAY)
        r.rpush(QUEUE_KEY, item_str)


def _run() -> None:
    logger.info("[QUEUE-WORKER] Worker de fila de logística iniciado (Redis: %s)", REDIS_URL)
    r: redis.Redis | None = None

    while True:
        try:
            if r is None:
                r = _get_client()
                logger.info("[QUEUE-WORKER] Conectado ao Redis com sucesso")

            # BLPOP blocks up to 5 s; returns (key, value) or None on timeout
            result = r.blpop(QUEUE_KEY, timeout=5)
            if result:
                _, item_str = result
                logger.info("[QUEUE-WORKER] Item retirado da fila: %s", item_str)
                _process(r, item_str)

        except redis.RedisError as exc:
            logger.error(
                "[QUEUE-WORKER] Erro de conexão Redis: %s — reconectando em 5s", exc
            )
            _reset_client()
            r = None
            time.sleep(5)

        except Exception as exc:  # noqa: BLE001
            logger.error("[QUEUE-WORKER] Erro inesperado: %s", exc)
            time.sleep(2)


def start_worker() -> None:
    """Spawn the queue worker as a daemon background thread."""
    t = threading.Thread(target=_run, name="logistics-queue-worker", daemon=True)
    t.start()
    logger.info("[QUEUE-WORKER] Thread iniciada: %s", t.name)

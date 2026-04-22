import time
import random
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"service": "payment-service", "status": "ok"})


@app.route("/payments", methods=["POST"])
def process_payment():
    body     = request.get_json(force=True)
    order_id = body.get("order_id")
    amount   = body.get("amount", 0.0)

    # Artificial delay 2–4s. Combined with order-service's 3s timeout this
    # creates real Timeout events and forces tenacity retries ~50% of the time.
    delay = random.uniform(2.0, 4.0)
    time.sleep(delay)

    # 10% chance of payment decline (non-retryable)
    if random.random() < 0.10:
        return jsonify({
            "order_id": order_id,
            "status":   "declined",
            "reason":   "Saldo insuficiente",
        }), 402

    return jsonify({
        "order_id":       order_id,
        "status":         "approved",
        "amount_charged": amount,
        "transaction_id": f"txn_{str(order_id)[:8]}",
        "delay_seconds":  round(delay, 2),
    }), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=False)

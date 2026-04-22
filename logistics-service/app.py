import random
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DRIVERS = [
    "Carlos Mendes",
    "Ana Souza",
    "Pedro Lima",
    "Julia Rocha",
    "Marcos Faria",
    "Beatriz Costa",
]


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"service": "logistics-service", "status": "ok"})


@app.route("/logistics/assign", methods=["POST"])
def assign_driver():
    body       = request.get_json(force=True)
    order_id   = body.get("order_id")
    restaurant = body.get("restaurant", "")

    driver = random.choice(DRIVERS)

    return jsonify({
        "order_id":    order_id,
        "driver":      driver,
        "eta_minutes": random.randint(20, 45),
        "status":      "assigned",
    }), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5003, debug=False)

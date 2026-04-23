from flask import Flask
from flask_cors import CORS
from models import init_db
from routes import bp
from queue_worker import start_worker

app = Flask(__name__)
CORS(app)

app.register_blueprint(bp)

if __name__ == "__main__":
    init_db()
    start_worker()
    app.run(host="0.0.0.0", port=5001, debug=False)

from flask import Flask
from flask_cors import CORS
from models import init_db
from routes import bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(bp)

if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5001, debug=False)

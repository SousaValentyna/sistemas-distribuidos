import sqlite3
import json
import os
from datetime import datetime

DATABASE_PATH = os.environ.get("DATABASE_PATH", "./orders.db")

# Order status flow:
# created -> payment_processing -> payment_failed
#                               -> logistics_assigning -> delivered
#                               -> pending_logistics   (fallback when logistics is down)


def get_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id           TEXT PRIMARY KEY,
            customer     TEXT NOT NULL,
            restaurant   TEXT NOT NULL,
            items        TEXT NOT NULL,
            total        REAL NOT NULL,
            status       TEXT NOT NULL DEFAULT 'created',
            retry_events TEXT NOT NULL DEFAULT '[]',
            driver       TEXT,
            created_at   TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()


def create_order(order_id: str, customer: str, restaurant: str, items: list, total: float):
    conn = get_connection()
    conn.execute(
        """INSERT INTO orders (id, customer, restaurant, items, total, status, retry_events, created_at)
           VALUES (?, ?, ?, ?, ?, 'created', '[]', ?)""",
        (order_id, customer, restaurant, json.dumps(items), total, datetime.utcnow().isoformat())
    )
    conn.commit()
    conn.close()


def get_order(order_id: str):
    conn = get_connection()
    row = conn.execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()
    conn.close()
    if row is None:
        return None
    return dict(row)


def update_status(order_id: str, status: str):
    conn = get_connection()
    conn.execute("UPDATE orders SET status = ? WHERE id = ?", (status, order_id))
    conn.commit()
    conn.close()


def update_driver(order_id: str, driver: str):
    conn = get_connection()
    conn.execute(
        "UPDATE orders SET driver = ?, status = 'delivered' WHERE id = ?",
        (driver, order_id)
    )
    conn.commit()
    conn.close()


def append_retry_event(order_id: str, event: str):
    conn = get_connection()
    row = conn.execute("SELECT retry_events FROM orders WHERE id = ?", (order_id,)).fetchone()
    if row:
        events = json.loads(row["retry_events"])
        events.append(event)
        conn.execute(
            "UPDATE orders SET retry_events = ? WHERE id = ?",
            (json.dumps(events), order_id)
        )
        conn.commit()
    conn.close()


def serialize_order(order: dict) -> dict:
    return {
        "id":           order["id"],
        "customer":     order["customer"],
        "restaurant":   order["restaurant"],
        "items":        json.loads(order["items"]),
        "total":        order["total"],
        "status":       order["status"],
        "driver":       order["driver"],
        "retry_events": json.loads(order["retry_events"]),
        "created_at":   order["created_at"],
    }

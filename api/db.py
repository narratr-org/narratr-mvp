# api/db.py
import sqlite3, pathlib

DB_PATH = pathlib.Path(__file__).resolve().parent / "dog.db"

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

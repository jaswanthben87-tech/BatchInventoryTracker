import sqlite3
import os

db_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\backend\tracker.db"
schema_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\backend\schema.sql"

print("--- SCHEMA.SQL CHECK ---")
if os.path.exists(schema_path):
    with open(schema_path, "r", encoding="utf-8") as f:
        schema_content = f.read()
    
    # search for notifications or similar table definitions
    for chunk in schema_content.split(";"):
        if "notification" in chunk.lower() or "order" in chunk.lower():
            print(chunk.strip())
            print("-" * 50)
else:
    print("schema.sql not found")

print("\n--- SQLITE DB TABLES ---")
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("Tables in tracker.db:", tables)
    for table_name in tables:
        t_name = table_name[0]
        cursor.execute(f"PRAGMA table_info({t_name});")
        print(f"Table {t_name} schema:")
        for col in cursor.fetchall():
            print("  ", col)
    conn.close()
else:
    print("tracker.db not found")

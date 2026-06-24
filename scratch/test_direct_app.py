import sys
import os

backend_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\backend"
sys.path.append(backend_path)

from app import app
from db import query_db

print("Checking database directly:")
try:
    res = query_db("SELECT * FROM customer_order_notifications")
    print(f"Direct DB query returned {len(res)} notifications:")
    for r in res:
        print(r)
except Exception as e:
    print(f"Direct DB query failed: {e}")

print("\nTesting Flask Client:")
with app.test_client() as client:
    res = client.get('/api/admin/notifications')
    print(f"Status Code: {res.status_code}")
    print(f"Response Data: {res.get_data(as_text=True)}")

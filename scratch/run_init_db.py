import sys
import os

backend_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\backend"
sys.path.append(backend_path)

from db import init_db, query_db

try:
    init_db()
    print("init_db completed successfully!")
    
    # Query to see if the table exists and check schema
    res = query_db("PRAGMA table_info(customer_order_notifications)")
    if res:
        print("Table 'customer_order_notifications' exists! Schema details:")
        for r in res:
            print(r)
    else:
        print("Table 'customer_order_notifications' does not exist or PRAGMA failed.")
except Exception as e:
    print(f"Error: {e}")

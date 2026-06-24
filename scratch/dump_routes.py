import sys
import os

backend_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\backend"
sys.path.append(backend_path)

from app import app

print("Registered Flask URL Rules:")
for rule in app.url_map.iter_rules():
    print(f"{rule.endpoint}: {rule.rule} (Methods: {rule.methods})")

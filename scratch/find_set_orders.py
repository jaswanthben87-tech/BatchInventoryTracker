import sys

sys.stdout.reconfigure(encoding='utf-8')
frontend_app_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\frontend\src\App.jsx"

with open(frontend_app_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print("--- SEARCH FOR ORDERS STATE UPDATES ---")
for idx, line in enumerate(lines):
    if "setOrders(" in line or "orders" in line:
        if "fetch" in line.lower() or "set" in line.lower() or "res" in line.lower():
            print(f"Line {idx+1}: {line.strip()}")
            for k in range(1, 10):
                if idx + k < len(lines):
                    print(f"  +{k}: {lines[idx+k].rstrip()}")
            print("-" * 50)

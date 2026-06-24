import sys

sys.stdout.reconfigure(encoding='utf-8')
frontend_app_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\frontend\src\App.jsx"

with open(frontend_app_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print("--- ORDERS STATE HOOK ---")
for idx, line in enumerate(lines):
    if "const [orders" in line:
        print(f"Line {idx+1}: {line.strip()}")
        # print context
        for k in range(-5, 10):
            if 0 <= idx + k < len(lines):
                print(f"  {idx+1+k:4d}: {lines[idx+k].rstrip()}")
        break

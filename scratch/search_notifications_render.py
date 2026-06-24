import sys

sys.stdout.reconfigure(encoding='utf-8')
frontend_app_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\frontend\src\App.jsx"

with open(frontend_app_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print("--- NOTIFICATIONS STATE RENDER ---")
for idx, line in enumerate(lines):
    if "notifications.map" in line or "notifications.length" in line:
        print(f"Line {idx+1}: {line.strip()}")
        for k in range(1, 12):
            if idx + k < len(lines):
                print(f"  +{k}: {lines[idx+k].rstrip()}")
        print("-" * 50)

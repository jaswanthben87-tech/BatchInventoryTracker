import sys

sys.stdout.reconfigure(encoding='utf-8')
frontend_app_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\frontend\src\App.jsx"

with open(frontend_app_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print("--- DASHBOARD KEYWORDS SEARCH ---")
for idx in range(4463, 4607):
    if idx < len(lines):
        line = lines[idx]
        if any(keyword in line.lower() for keyword in ["message", "chat", "notif"]):
            print(f"Line {idx+1}: {line.strip()}")

import sys

sys.stdout.reconfigure(encoding='utf-8')
frontend_app_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\frontend\src\App.jsx"

with open(frontend_app_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print("--- STORE CATEGORY GROUP RENDERING ---")
for idx in range(3850, 3960):
    if idx < len(lines):
        cleaned = lines[idx].encode('ascii', errors='replace').decode('ascii')
        print(f"{idx+1:4d}: {cleaned.rstrip()}")

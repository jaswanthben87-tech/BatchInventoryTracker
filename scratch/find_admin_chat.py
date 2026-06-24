import sys

sys.stdout.reconfigure(encoding='utf-8')
frontend_app_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\frontend\src\App.jsx"

with open(frontend_app_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print("--- ADMIN COPILOT IMPLEMENTATION ---")
found = False
for idx, line in enumerate(lines):
    if "const handleSendAdminAIMessage" in line:
        found = True
        for k in range(0, 100):
            if idx + k < len(lines):
                cleaned = lines[idx+k].encode('ascii', errors='replace').decode('ascii')
                print(f"{idx+1+k:4d}: {cleaned}")
        break

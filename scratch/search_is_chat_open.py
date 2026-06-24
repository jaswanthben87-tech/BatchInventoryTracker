import sys

sys.stdout.reconfigure(encoding='utf-8')
frontend_app_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\frontend\src\App.jsx"

with open(frontend_app_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print("--- ALL IS_CHAT_OPEN REFERENCES ---")
for idx, line in enumerate(lines):
    if "isChatOpen" in line or "setIsChatOpen" in line:
        print(f"{idx+1:4d}: {line.strip()}")

import sys

sys.stdout.reconfigure(encoding='utf-8')
frontend_app_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\frontend\src\App.jsx"

with open(frontend_app_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print("--- SEARCH FOR CHAT TOGGLE BUTTON ---")
for idx, line in enumerate(lines):
    if "isChatOpen" in line or "setIsChatOpen" in line:
        if "button" in line or "div" in line or "style" in line:
            print(f"Line {idx+1}: {line.strip()}")
            for k in range(0, 15):
                if idx + k < len(lines):
                    print(f"  {idx+1+k:4d}: {lines[idx+k].rstrip()}")
            print("-" * 50)
            break

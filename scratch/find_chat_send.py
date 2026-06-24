import sys

sys.stdout.reconfigure(encoding='utf-8')
frontend_app_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\frontend\src\App.jsx"

with open(frontend_app_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print("--- SEARCH FOR CHAT HANDLERS AND REPLIES ---")
for idx, line in enumerate(lines):
    if "setAiMessages" in line or "handleSend" in line or "aiTyping" in line or "generate" in line or "Assistant" in line or "reply" in line or "mock" in line:
        if "chat" in line.lower() or "ai" in line.lower() or "send" in line.lower():
            print(f"\nLine {idx+1}: {line.strip()}")
            for k in range(1, 25):
                if idx + k < len(lines):
                    print(f"  +{k}: {lines[idx+k].rstrip()}")
            print("-" * 40)

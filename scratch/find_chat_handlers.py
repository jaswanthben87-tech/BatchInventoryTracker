import re
import sys

# Set standard output encoding to utf-8 for Windows command prompt compatibility
sys.stdout.reconfigure(encoding='utf-8')

frontend_app_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\frontend\src\App.jsx"

with open(frontend_app_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print("--- CHAT RELEVANT FUNCTIONS/STATE ---")
for idx, line in enumerate(lines):
    if "const handleSend" in line or "const send" in line or "const chat" in line or "aiMessages" in line or "handleChat" in line or "sendMessage" in line or "fetch(" in line:
        if any(term in line for term in ["Chat", "Send", "Message", "Ai", "ai", "bot"]):
            # Print the context lines (line, and next 12 lines) safely
            cleaned_line = line.strip().encode('ascii', errors='replace').decode('ascii')
            print(f"\nLine {idx+1}: {cleaned_line}")
            for k in range(1, 15):
                if idx + k < len(lines):
                    cleaned_ctx = lines[idx+k].strip().encode('ascii', errors='replace').decode('ascii')
                    print(f"  +{k}: {cleaned_ctx}")
            print("-" * 40)

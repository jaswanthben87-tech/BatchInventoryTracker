import re
import sys

sys.stdout.reconfigure(encoding='utf-8')
frontend_app_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\frontend\src\App.jsx"

with open(frontend_app_path, "r", encoding="utf-8") as f:
    content = f.read()

# Let's find functions starting with handleSendAdminAIMessage or handleSendClientAIMessage
# We'll extract lines starting from the match until about 150 lines later or end of function
lines = content.splitlines()
for target in ["handleSendAdminAIMessage", "handleSendClientAIMessage"]:
    found = False
    for idx, line in enumerate(lines):
        if target in line and "const" in line:
            found = True
            print(f"\n=================== FOUND {target} ===================")
            # Print next 120 lines
            for k in range(0, 120):
                if idx + k < len(lines):
                    cleaned = lines[idx+k].encode('ascii', errors='replace').decode('ascii')
                    print(f"{idx+1+k:4d}: {cleaned}")
            break

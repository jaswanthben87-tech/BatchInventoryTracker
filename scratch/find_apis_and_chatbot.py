import re
import os

backend_app_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\backend\app.py"
frontend_app_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\frontend\src\App.jsx"

print("--- BACKEND APIS ---")
if os.path.exists(backend_app_path):
    with open(backend_app_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Let's find all lines with @app.route
    routes = []
    lines = content.splitlines()
    for idx, line in enumerate(lines):
        if "@app.route" in line:
            # Get next few lines to find function name
            func_name = "unknown"
            for offset in range(1, 5):
                if idx + offset < len(lines):
                    next_line = lines[idx + offset]
                    m = re.search(r"def\s+(\w+)\(", next_line)
                    if m:
                        func_name = m.group(1)
                        break
            routes.append((idx + 1, line.strip(), func_name))
            
    print(f"Found {len(routes)} routes:")
    for line_num, route, func in routes:
        print(f"Line {line_num:4d}: {route} -> function `{func}`")
        
    print("\n--- CHATBOT BACKEND SEARCH ---")
    chat_related = [line.strip() for idx, line in enumerate(lines) if "chat" in line.lower() or "gemini" in line.lower()]
    print(f"Found {len(chat_related)} lines in backend containing 'chat' or 'gemini' (showing first 10):")
    for r in chat_related[:10]:
        print("  ", r)
else:
    print("backend/app.py not found")

print("\n--- CHATBOT FRONTEND SEARCH ---")
if os.path.exists(frontend_app_path):
    with open(frontend_app_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    lines = content.splitlines()
    chat_lines = []
    for idx, line in enumerate(lines):
        if "chat" in line.lower() or "gemini" in line.lower() or "bot" in line.lower():
            chat_lines.append((idx + 1, line.strip()))
    
    print(f"Found {len(chat_lines)} lines in frontend containing 'chat', 'gemini' or 'bot' (showing first 15):")
    for idx, (line_num, line) in enumerate(chat_lines[:15]):
        print(f"  Line {line_num:4d}: {line}")
else:
    print("frontend/src/App.jsx not found")

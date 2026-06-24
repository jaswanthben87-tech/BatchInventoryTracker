import os

app_jsx_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\frontend\src\App.jsx"

with open(app_jsx_path, 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f, 1):
        if "useRef" in line:
            print(f"Line {idx}: {line.strip()}")
            break
    else:
        print("useRef not found in App.jsx")

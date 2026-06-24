import os

app_jsx_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\frontend\src\App.jsx"

with open(app_jsx_path, 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f, 1):
        if "Messages & Order Notifications" in line:
            print(f"Line {idx}: {line.strip()}")

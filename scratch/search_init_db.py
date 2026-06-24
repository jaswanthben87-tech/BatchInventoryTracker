import os

app_py_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\backend\app.py"

with open(app_py_path, 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f, 1):
        if "init_db" in line:
            print(f"Line {idx}: {line.strip()}")

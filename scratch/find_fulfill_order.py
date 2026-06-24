import os

app_py_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\backend\app.py"

with open(app_py_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

found = -1
for idx, line in enumerate(lines):
    if "def fulfill_order" in line:
        found = idx
        break

if found != -1:
    print(f"Found fulfill_order at line {found+1}")
    for i in range(max(0, found - 5), min(len(lines), found + 80)):
        print(f"{i+1}: {lines[i]}", end="")
else:
    print("fulfill_order function not found.")

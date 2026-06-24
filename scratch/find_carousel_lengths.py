import sys

sys.stdout.reconfigure(encoding='utf-8')
frontend_app_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\frontend\src\App.jsx"

with open(frontend_app_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print("--- CAROUSEL LENGTH CONDITIONS ---")
for idx, line in enumerate(lines):
    if "catProducts.length" in line:
        print(f"Line {idx+1}: {line.strip()}")

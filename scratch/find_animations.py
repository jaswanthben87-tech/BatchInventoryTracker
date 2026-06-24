import sys

sys.stdout.reconfigure(encoding='utf-8')
css_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\frontend\src\index.css"

with open(css_path, "r", encoding="utf-8") as f:
    content = f.read()

lines = content.splitlines()

print("--- ANIMATIONS IN INDEX.CSS ---")
for idx, line in enumerate(lines):
    if "@keyframes" in line.lower() or "pulse" in line.lower():
        print(f"Line {idx+1}: {line}")
        for k in range(1, 10):
            if idx + k < len(lines):
                print(f"  +{k}: {lines[idx+k]}")
        print("-" * 50)

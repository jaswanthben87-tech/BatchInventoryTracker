import sys

sys.stdout.reconfigure(encoding='utf-8')
css_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\frontend\src\index.css"

with open(css_path, "r", encoding="utf-8") as f:
    content = f.read()

lines = content.splitlines()

print("--- CAROUSEL AND BUTTON STYLES IN INDEX.CSS ---")
for idx, line in enumerate(lines):
    if "carousel" in line.lower() or "prev" in line.lower() or "next" in line.lower():
        print(f"Line {idx+1}: {line}")
        # Print 5 lines context
        for k in range(1, 10):
            if idx + k < len(lines):
                print(f"  +{k}: {lines[idx+k]}")
        print("-" * 50)

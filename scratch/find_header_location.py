import sys

sys.stdout.reconfigure(encoding='utf-8')
frontend_app_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\frontend\src\App.jsx"

with open(frontend_app_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print("--- HEADER RENDER LOCATION ---")
for idx, line in enumerate(lines):
    if "<header" in line or "className=\"app-header\"" in line or "className=\"header\"" in line:
        print(f"Line {idx+1}: {line.strip()}")
        for k in range(1, 20):
            if idx + k < len(lines):
                print(f"  +{k}: {lines[idx+k].rstrip()}")
        print("-" * 50)
        break

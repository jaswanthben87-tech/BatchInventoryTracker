import sys

sys.stdout.reconfigure(encoding='utf-8')
frontend_app_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\frontend\src\App.jsx"

with open(frontend_app_path, "r", encoding="utf-8") as f:
    content = f.read()

lines = content.splitlines()

# Search for store view / category sections
print("--- SEARCHING FOR CATEGORY AND PRODUCTS CAROUSEL ---")
for idx, line in enumerate(lines):
    if "products.filter" in line or "map" in line:
        if "category" in line.lower() and "product" in line.lower():
            print(f"Line {idx+1}: {line.strip()}")
            for k in range(1, 15):
                if idx + k < len(lines):
                    print(f"  +{k}: {lines[idx+k].strip()}")
            print("-" * 50)

# Search for theme/dark mode buttons in header
print("\n--- SEARCHING FOR THEME/DARK MODE BUTTON IN HEADER ---")
for idx, line in enumerate(lines):
    if "theme" in line.lower() or "dark" in line.lower():
        if "button" in line.lower() or "toggle" in line.lower() or "header" in line.lower():
            if idx > 1000: # Usually in header markup
                print(f"Line {idx+1}: {line.strip()}")
                for k in range(0, 15):
                    if idx + k < len(lines):
                        print(f"  +{k}: {lines[idx+k].strip()}")
                print("-" * 50)
                break

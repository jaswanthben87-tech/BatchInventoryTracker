import sys

sys.stdout.reconfigure(encoding='utf-8')
frontend_app_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\frontend\src\App.jsx"

with open(frontend_app_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print("--- SEARCH FOR ADMIN DASHBOARD RENDER ---")
for idx, line in enumerate(lines):
    if "adminSubTab === 'dashboard'" in line or "dashboardSummary" in line:
        if "render" in line.lower() or "div" in line.lower() or "const" in line.lower() or "return" in line.lower():
            print(f"Line {idx+1}: {line.strip()}")
            for k in range(1, 15):
                if idx + k < len(lines):
                    print(f"  +{k}: {lines[idx+k].rstrip()}")
            print("-" * 50)

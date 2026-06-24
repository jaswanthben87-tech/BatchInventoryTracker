import sys

sys.stdout.reconfigure(encoding='utf-8')
frontend_app_path = r"c:\Users\Baby Priya\Downloads\Internship Project\Internship Project\frontend\src\App.jsx"

with open(frontend_app_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

print("--- FETCH DATA AND USEEFFECT CALLS ---")
for idx, line in enumerate(lines):
    if "fetchData" in line or "setInterval" in line or "useEffect(" in line:
        if any(term in line.lower() for term in ["fetch", "poll", "interval", "time", "order"]):
            print(f"Line {idx+1}: {line.strip()}")
            for k in range(1, 10):
                if idx + k < len(lines):
                    print(f"  +{k}: {lines[idx+k].rstrip()}")
            print("-" * 50)
            
print("\n--- HEADER RENDER FOR THEME TOGGLE AND ADMIN PANELS ---")
# Let's search for "Theme Toggle Button for Admin" or just render header
for idx, line in enumerate(lines):
    if "Theme Toggle Button for Admin" in line:
        print(f"Line {idx+1}: {line.strip()}")
        # print 50 lines around it to see the header buttons structure
        for k in range(-25, 25):
            if 0 <= idx + k < len(lines):
                print(f"  {idx+1+k:4d}: {lines[idx+k].rstrip()}")
        break

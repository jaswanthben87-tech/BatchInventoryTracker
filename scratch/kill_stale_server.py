import os
import subprocess
import signal

def kill_port_5001():
    try:
        print("Finding processes on port 5001...")
        # Run netstat to find PIDs on port 5001
        output = subprocess.check_output("netstat -ano", shell=True).decode('utf-8')
        pids = set()
        for line in output.splitlines():
            if ":5001 " in line and "LISTENING" in line:
                parts = line.strip().split()
                if len(parts) >= 5:
                    pid = parts[-1]
                    pids.add(int(pid))
        
        if not pids:
            print("No active listening processes found on port 5001.")
            return
            
        print(f"Found PIDs: {pids}")
        for pid in pids:
            try:
                print(f"Killing process {pid}...")
                os.kill(pid, signal.SIGTERM)
                print(f"Sent SIGTERM to {pid}")
            except Exception as e:
                print(f"Failed to kill SIGTERM {pid}: {e}")
                try:
                    # Force kill
                    os.kill(pid, signal.SIGABRT)
                    print(f"Sent SIGABRT to {pid}")
                except Exception as ex:
                    print(f"Failed to force kill {pid}: {ex}")
                    
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    kill_port_5001()

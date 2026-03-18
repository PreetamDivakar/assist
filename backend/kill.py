import os
import subprocess
import sys

def stop_fastapi():
    try:
        if sys.platform == "win32":
            # Windows: use wmic to find python processes running main.py/uvicorn
            cmd = 'wmic process where "name=\'python.exe\' and commandline like \'%uvicorn%\'" call terminate'
            result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
            
            # Since you might be running it via python main.py, check for main.py as well
            cmd2 = 'wmic process where "name=\'python.exe\' and commandline like \'%main.py%\'" call terminate'
            result2 = subprocess.run(cmd2, capture_output=True, text=True, shell=True)
            
            if ("ReturnValue" in result.stdout and "1041" not in result.stdout) or \
               ("ReturnValue" in result2.stdout and "1041" not in result2.stdout):
                print("FastAPI server stopped successfully ✅")
            else:
                print("No FastAPI server running 😴")
        else:
            # Unix-like
            result = subprocess.check_output(["pgrep", "-f", "uvicorn|main.py"])
            pids = result.decode().strip().split("\n")
            for pid in pids:
                if pid:
                    print(f"Stopping process {pid}")
                    os.kill(int(pid), 15)  # SIGTERM
            print("FastAPI server stopped successfully ✅")

    except Exception as e:
        print(f"No FastAPI server running 😴 or error occurred: {e}")

if __name__ == "__main__":
    stop_fastapi()
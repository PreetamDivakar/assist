import subprocess
import sys

def install():
    print("Installing psycopg2-binary directly via subprocess...")
    result = subprocess.run(
        [sys.executable, "-m", "pip", "install", "psycopg2-binary"],
        capture_output=True,
        text=True
    )
    print("STDOUT:", result.stdout)
    print("STDERR:", result.stderr)
    print("Return code:", result.returncode)

if __name__ == "__main__":
    install()

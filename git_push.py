import subprocess
import sys

def execute(cmd):
    print(f"Running: {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr)
    return result.returncode

def main():
    repo_url = "https://github.com/PreetamDivakar/assist.git"
    
    execute("git init")
    execute("git add .")
    execute('git commit -m "Fix Render deployment by setting Python version to 3.11.0 and updating API_BASE"')
    execute("git branch -M main")
    
    # Try adding remote, if it fails it might already exist
    execute(f"git remote add origin {repo_url}")
    # Force set url just in case
    execute(f"git remote set-url origin {repo_url}")
    
    # Push
    print("Pushing to remote...")
    push_code = execute("git push -u origin main --force")
    
    if push_code == 0:
        print("Push successful!")
    else:
        print("Push failed. Might need authentication.")

if __name__ == "__main__":
    main()

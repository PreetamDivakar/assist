import shutil
import os

source = r"C:\Users\user\.gemini\antigravity\brain\260d71bb-5b73-4d4f-a1de-7c5fd4459aa5\funky_assistant_logo_1773821834777.png"
public = r"c:\Users\user\OneDrive\Desktop\assist\frontend\public"

targets = ["apple-touch-icon.png", "icon-192.png", "icon-512.png"]

for t in targets:
    dest = os.path.join(public, t)
    shutil.copy2(source, dest)
    print(f"Copied to {dest}")

print("Deployment complete!")

from PIL import Image
import os

source_path = r"C:\Users\user\.gemini\antigravity\brain\260d71bb-5b73-4d4f-a1de-7c5fd4459aa5\funky_assistant_logo_1773821834777.png"
public_dir = r"c:\Users\user\OneDrive\Desktop\assist\frontend\public"

with Image.open(source_path) as img:
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    img_180 = img.resize((180, 180), Image.Resampling.LANCZOS)
    img_180.save(os.path.join(public_dir, "apple-touch-icon.png"), "PNG")

    img_192 = img.resize((192, 192), Image.Resampling.LANCZOS)
    img_192.save(os.path.join(public_dir, "icon-192.png"), "PNG")

    img_512 = img.resize((512, 512), Image.Resampling.LANCZOS)
    img_512.save(os.path.join(public_dir, "icon-512.png"), "PNG")

print("Icons successfully created!")

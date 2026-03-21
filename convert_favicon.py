import sys
from PIL import Image

in_path = r"C:\Users\avibh\.gemini\antigravity\brain\7648df68-ea82-4be2-8bb6-c0eb7cc8fe65\media__1773047708400.jpg"
out_path = r"c:\Users\avibh\Desktop\DESKTOP-J6OLHOJ\Avi Bhede\Avi Bhede\Documents\Avi\charitage-main\frontend\public\favicon.ico"

try:
    img = Image.open(in_path)
    # Convert image to square if needed, or simply save as ico
    # We will resize nicely
    img_bg = Image.new("RGBA", img.size, (255,255,255,0))
    img_bg.paste(img)
    img_bg.save(out_path, format="ICO", sizes=[(32, 32)])
    print("Favicon saved!")
except Exception as e:
    print(f"Error: {e}")

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

img_path = "pdf_content/assets/office_building.jpg"
im = Image.open(img_path).convert("RGBA")
W, H = im.size

overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
draw = ImageDraw.Draw(overlay)

# The entrance canopy fascia:
# Exactly between the left marble pillar and right glass corner
# Coordinates: x1=670, y1=420, x2=1140, y2=485
# Sample marble texture: dark black/brown granite marble
box = [(675, 420), (1135, 420), (1135, 485), (675, 485)]

# Draw sleek dark glass fascia panel
draw.rounded_rectangle([(675, 420), (1135, 485)], radius=6, fill=(10, 16, 26, 255), outline=(0, 210, 255, 140), width=2)

try:
    font = ImageFont.truetype("arialbd.ttf", 46)
except:
    font = ImageFont.load_default()

text = "CRYPTONOVA"
# Center text in box (width: 460, height: 65)
# text length in 46px is approx 380px
draw.text((722, 432), text, font=font, fill=(0, 255, 163, 160))
draw.text((720, 430), text, font=font, fill=(255, 255, 255, 255))

combined = Image.alpha_composite(im, overlay)
out_path = "pdf_content/assets/office_building_crypto.jpg"
combined.convert("RGB").save(out_path, quality=95)
print("Refined building sign saved to", out_path)

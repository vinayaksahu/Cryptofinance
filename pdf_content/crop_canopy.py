from PIL import Image, ImageDraw, ImageFont
import os

img_path = "pdf_content/assets/office_building.jpg"
im = Image.open(img_path).convert("RGBA")
W, H = im.size

# Let's inspect where the canopy text is
# From slide 3: x is around 68% to 85% of width, y is around 60% to 68% of height
# 1376 * 0.70 = 963, 1376 * 0.85 = 1170
# 768 * 0.60 = 460, 768 * 0.68 = 522

crop_box = (650, 420, 850, 510)
cropped = im.crop(crop_box)
cropped.save("pdf_content/assets/test_crop.png")
print("Saved test crop to inspect canopy area")

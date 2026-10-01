import re

with open("pdf_content/dubai_finance_presentation_dark_23.html", "r", encoding="utf-8") as f:
    html = f.read()

# find each slide
slides = html.split('<div class="slide"')
print(f"Number of slide splits: {len(slides)}")
for idx, s in enumerate(slides[1:], 1):
    imgs_in_slide = re.findall(r'<img([^>]+)>', s)
    classes = [re.findall(r'class=["\']([^"\']+)["\']', img) for img in imgs_in_slide]
    bgs = re.findall(r'background(?:-image)?:\s*url\([^)]+\)', s)
    print(f"Slide {idx}: {len(imgs_in_slide)} imgs ({classes}), has_bg: {len(bgs) > 0}")

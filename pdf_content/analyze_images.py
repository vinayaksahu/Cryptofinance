import re

with open("pdf_content/dubai_finance_presentation_dark_23.html", "r", encoding="utf-8") as f:
    html = f.read()

# find all img tags
imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', html)
print(f"Total img tags: {len(imgs)}")
data_uris = [i for i in imgs if i.startswith("data:")]
file_uris = [i for i in imgs if not i.startswith("data:")]
print(f"Data URIs: {len(data_uris)}, File URIs: {len(file_uris)}")

# check background images in style
bg_imgs = re.findall(r'url\(([^)]+)\)', html)
print(f"Background images: {len(bg_imgs)}")
for b in set(bg_imgs):
    if not b.startswith("data:"):
        print("  External BG:", b[:100])
    else:
        print("  Data BG:", b[:40], "... len:", len(b))

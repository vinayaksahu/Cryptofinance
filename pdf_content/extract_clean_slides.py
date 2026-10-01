import re

with open("pdf_content/dubai_finance_presentation_dark_23.html", "r", encoding="utf-8") as f:
    html = f.read()

# Split by slide
slides = re.split(r'<div class="slide(?:[^"]*)">', html)
print(f"Total parts: {len(slides)}")

with open("pdf_content/slide_contents_clean.txt", "w", encoding="utf-8") as out:
    for i, s in enumerate(slides[1:], 1):
        out.write(f"\n==================== SLIDE {i:02d} ====================\n")
        # Remove base64 data to keep it readable
        clean_s = re.sub(r'data:image/[^;]+;base64,[A-Za-z0-9+/=]+', '[BASE64_IMAGE]', s)
        out.write(clean_s)

print("Saved slide_contents_clean.txt")

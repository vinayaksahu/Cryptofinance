import re

with open("pdf_content/dubai_finance_presentation_dark_23.html", "r", encoding="utf-8") as f:
    text = f.read()

pattern = r'(<!--\s*={5,}\s*SLIDE\s*\d+[^>]*?={5,}\s*-->)'
parts = re.split(pattern, text)
print(f"Total parts: {len(parts)}")

# parts[0] is everything before slide 1 (head, style)
# parts[1] is comment for slide 1
# parts[2] is html of slide 1
# parts[3] is comment for slide 2, etc.

slide_dict = {}
for i in range(1, len(parts), 2):
    comment = parts[i].strip()
    html_block = parts[i+1].strip()
    # clean out base64 for viewing
    clean_html = re.sub(r'data:image/[^;]+;base64,[A-Za-z0-9+/=]+', '[BASE64_IMAGE]', html_block)
    slide_dict[comment] = clean_html
    print(f"{comment} -> len: {len(html_block)} (clean len: {len(clean_html)})")

with open("pdf_content/clean_slides_by_comment.txt", "w", encoding="utf-8") as out:
    for c, h in slide_dict.items():
        out.write(f"\n{c}\n")
        out.write(h + "\n")

print("Saved clean_slides_by_comment.txt successfully.")

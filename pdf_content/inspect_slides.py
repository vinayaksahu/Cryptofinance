import os

html_path = os.path.join("pdf_content", "presentation_dark_ultra.html")
if not os.path.exists(html_path):
    print("Not found:", html_path)
    exit(1)

with open(html_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

slide_starts = [i + 1 for i, line in enumerate(lines) if 'class="slide' in line]
print(f"Total slides found: {len(slide_starts)}")
for idx, line_no in enumerate(slide_starts):
    # print first 3 lines of each slide
    preview = "".join(lines[line_no - 1 : min(line_no + 4, len(lines))]).strip().replace("\n", " ")
    print(f"Slide {idx + 1} at line {line_no}: {preview[:100]}...")

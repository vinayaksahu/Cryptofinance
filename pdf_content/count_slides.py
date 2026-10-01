import re
import os

for fname in ["dubai_finance_presentation_dark_23.html", "presentation_dark_ultra.html"]:
    fpath = os.path.join("pdf_content", fname)
    if not os.path.exists(fpath):
        continue
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # find exact matches for class="slide" or class="slide ...
    matches = list(re.finditer(r'<div[^>]*class=["\']slide(?:\s+[^"\']*)?["\']', content))
    print(f"\n=== File: {fname} (Total slides: {len(matches)}) ===")
    for idx, m in enumerate(matches):
        snippet = content[m.start():m.start()+250].replace("\n", " ")
        print(f"Slide {idx+1}: {snippet[:120]}")

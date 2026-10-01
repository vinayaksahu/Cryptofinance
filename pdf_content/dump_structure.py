import re

with open("pdf_content/dubai_finance_presentation_dark_23.html", "r", encoding="utf-8") as f:
    content = f.read()

# Split slides
slides = re.split(r'<div class="slide(?:[^"]*)">', content)
# First split is before the first slide
slides = slides[1:]
print(f"Total slides found: {len(slides)}")

for idx, s in enumerate(slides, 1):
    badge = re.search(r'<div class="header-badge">([^<]+)</div>', s)
    badge_txt = badge.group(1).strip() if badge else "NO BADGE"
    cat = re.search(r'<div class="category-title">([^<]+)</div>', s)
    cat_txt = cat.group(1).strip() if cat else ""
    title = re.search(r'<(?:h1|h2)[^>]*>(.*?)</(?:h1|h2)>', s, re.DOTALL)
    title_txt = re.sub(r'<[^>]+>', '', title.group(1)).strip() if title else ""
    footer_l = re.search(r'<span class="footer-left">([^<]+)</span>', s)
    fl_txt = footer_l.group(1).strip() if footer_l else ""
    footer_r = re.search(r'<span class="footer-right">([^<]+)</span>', s)
    fr_txt = footer_r.group(1).strip() if footer_r else ""
    print(f"[{idx:02d}] Badge: {badge_txt} | Cat: {cat_txt} | Title: {title_txt[:40]} | Footer: {fl_txt} ({fr_txt})")

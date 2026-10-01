with open("pdf_content/dubai_finance_presentation_dark_23.html", "r", encoding="utf-8") as f:
    text = f.read()

# print CSS part (first 300 lines)
css_end = text.find("</style>")
print("CSS length:", css_end)
with open("pdf_content/extracted_css.css", "w", encoding="utf-8") as out:
    out.write(text[:css_end+8])
print("Saved extracted_css.css")

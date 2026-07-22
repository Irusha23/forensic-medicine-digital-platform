import fitz
import sys
import os

pdf_file = sys.argv[1]
md_file = os.path.splitext(pdf_file)[0] + ".md"

print(f"Extracting {pdf_file} to {md_file}...")

doc = fitz.open(pdf_file)
text = ""
for page in doc:
    text += page.get_text()

with open(md_file, "w", encoding="utf-8") as f:
    f.write(text)

print("Done.")

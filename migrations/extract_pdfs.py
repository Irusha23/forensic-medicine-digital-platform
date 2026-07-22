#!/usr/bin/env python3
"""Extract text from PDFs in the documents/ folder and print short summaries.

Requires: PyPDF2
"""
import os
from pathlib import Path
from PyPDF2 import PdfReader

ROOT = Path(__file__).resolve().parents[1]
DOC_DIR = ROOT / 'documents'
OUT_DIR = ROOT / 'migrations' / 'pdf_texts'
OUT_DIR.mkdir(parents=True, exist_ok=True)

def extract(pdf_path: Path):
    try:
        reader = PdfReader(str(pdf_path))
        texts = []
        for p in reader.pages:
            txt = p.extract_text() or ''
            texts.append(txt)
        full = '\n'.join(texts)
        out_file = OUT_DIR / (pdf_path.stem + '.txt')
        out_file.write_text(full, encoding='utf-8')
        print(f"Wrote {out_file} ({len(full)} chars)")
        # print first 1000 chars for quick inspection
        print(full[:1000].replace('\n',' '))
    except Exception as e:
        print(f"Failed to extract {pdf_path}: {e}")

def main():
    for f in sorted(DOC_DIR.glob('*.pdf')):
        print('---', f.name)
        extract(f)

if __name__ == '__main__':
    main()

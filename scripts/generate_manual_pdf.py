#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genera los PDFs del manual del simulador ZeroInfra Labs desde sus fuentes markdown.

Uso:
    python scripts/generate_manual_pdf.py [en|es]     # por defecto: en

Requiere reportlab (entorno local recomendado):
    python3 -m venv .venv && .venv/bin/pip install reportlab
    .venv/bin/python scripts/generate_manual_pdf.py en

Fuentes:
    manual_zilabs.md      → public/docs/manual.pdf      (español)
    manual_zilabs_en.md   → public/docs/manual-en.pdf   (inglés)
"""
import re
import sys

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    HRFlowable,
    ListFlowable,
    PageTemplate,
    Paragraph,
    Preformatted,
    Spacer,
)

# ── Fuentes (DejaVu: cobertura Unicode para ↑↓→•…) ──────────────────────
FONT_DIR = '/usr/share/fonts/truetype/dejavu'
pdfmetrics.registerFont(TTFont('DejaVu', f'{FONT_DIR}/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVu-Bold', f'{FONT_DIR}/DejaVuSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('DejaVu-Oblique', f'{FONT_DIR}/DejaVuSans-Oblique.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuMono', f'{FONT_DIR}/DejaVuSansMono.ttf'))

# ── Paleta (tonos de la app) ──────────────────────────────────────────────
ACCENT = HexColor('#047857')      # emerald-700
HEAD = HexColor('#0f172a')        # slate-900
BODY = HexColor('#1e293b')        # slate-800
CODE_BG = HexColor('#f1f5f9')     # slate-100
CODE_BORDER = HexColor('#cbd5e1') # slate-300
NOTE_BG = HexColor('#fffbeb')     # amber-50
NOTE_BORDER = HexColor('#f59e0b') # amber-500
RULE = HexColor('#cbd5e1')

SOURCES = {
    'es': ('manual_zilabs.md', 'public/docs/manual.pdf'),
    'en': ('manual_zilabs_en.md', 'public/docs/manual-en.pdf'),
}


def esc(s: str) -> str:
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def inline(s: str) -> str:
    """Convierte **negrita**, *cursiva* y `código` a XML de reportlab (tras escapar).
    Los backticks se eliminan (igual que el PDF original) y el código inline no
    lleva formato especial."""
    s = esc(s)
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
    s = re.sub(r'(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)', r'<i>\1</i>', s)
    s = re.sub(r'`([^`]+?)`', r'\1', s)
    return s


def parse_md(path: str):
    """Convierte un subset de markdown en bloques (h1/h2/h3/p/ul/code/note/hr)."""
    with open(path, encoding='utf-8') as f:
        raw = f.read().split('\n')

    blocks: list[tuple[str, object]] = []
    para: list[str] = []
    bullets: list[str] = []
    i = 0

    def flush_para():
        if para:
            blocks.append(('p', ' '.join(para)))
            para.clear()

    def flush_bullets():
        if bullets:
            blocks.append(('ul', list(bullets)))
            bullets.clear()

    while i < len(raw):
        line = raw[i]
        stripped = line.strip()
        if stripped == '---':
            flush_para()
            flush_bullets()
            blocks.append(('hr', None))
        elif stripped.startswith('#'):
            flush_para()
            flush_bullets()
            m = re.match(r'^(#{1,3})\s+(.*)$', stripped)
            blocks.append((f'h{len(m.group(1))}', m.group(2)))
        elif stripped.startswith('- '):
            flush_para()
            bullets.append(stripped[2:])
        elif stripped.startswith('```'):
            flush_para()
            flush_bullets()
            i += 1
            code = []
            while i < len(raw) and not raw[i].strip().startswith('```'):
                code.append(raw[i])
                i += 1
            blocks.append(('code', '\n'.join(code)))
        elif stripped.startswith('> '):
            flush_para()
            flush_bullets()
            note = []
            while i < len(raw) and raw[i].strip().startswith('>'):
                note.append(raw[i].strip()[2:])
                i += 1
            blocks.append(('note', ' '.join(note)))
            i -= 1  # el while externo vuelve a avanzar sobre la línea siguiente
        elif stripped == '':
            flush_para()
            flush_bullets()
        else:
            flush_bullets()
            para.append(stripped)
        i += 1

    flush_para()
    flush_bullets()
    return blocks


def build_styles() -> dict:
    return {
        'title': ParagraphStyle('title', fontName='DejaVu-Bold', fontSize=22, leading=27,
                                textColor=HEAD, spaceAfter=2),
        'h2': ParagraphStyle('h2', fontName='DejaVu-Bold', fontSize=15, leading=19,
                             textColor=HEAD, spaceBefore=16, spaceAfter=6, keepWithNext=1),
        'h3': ParagraphStyle('h3', fontName='DejaVu-Bold', fontSize=11.5, leading=15,
                             textColor=ACCENT, spaceBefore=10, spaceAfter=4, keepWithNext=1),
        'p': ParagraphStyle('p', fontName='DejaVu', fontSize=10.5, leading=15,
                            textColor=BODY, spaceAfter=6),
        'li': ParagraphStyle('li', fontName='DejaVu', fontSize=10.5, leading=15,
                             textColor=BODY),
        'code': ParagraphStyle('code', fontName='DejaVuMono', fontSize=9.5, leading=13,
                               textColor=HEAD, backColor=CODE_BG, borderColor=CODE_BORDER,
                               borderWidth=0.75, borderPadding=6, spaceBefore=4, spaceAfter=8),
        'note': ParagraphStyle('note', fontName='DejaVu', fontSize=10.5, leading=15,
                               textColor=BODY, backColor=NOTE_BG, borderColor=NOTE_BORDER,
                               borderWidth=0.9, borderPadding=8, spaceBefore=4, spaceAfter=10),
    }


def build_flowables(blocks, styles: dict):
    flow = []
    for kind, content in blocks:
        if kind == 'h1':
            flow.append(Paragraph(inline(content), styles['title']))
            flow.append(HRFlowable(width='100%', thickness=1.5, color=ACCENT,
                                   spaceBefore=2, spaceAfter=12))
        elif kind == 'h2':
            flow.append(Paragraph(inline(content), styles['h2']))
        elif kind == 'h3':
            flow.append(Paragraph(inline(content), styles['h3']))
        elif kind == 'p':
            flow.append(Paragraph(inline(content), styles['p']))
        elif kind == 'ul':
            items = [Paragraph(inline(b), styles['li']) for b in content]
            flow.append(ListFlowable(items, bulletType='bullet', start='•',
                                     bulletFontName='DejaVu', bulletFontSize=10.5,
                                     leftIndent=16, bulletOffsetY=0, spaceAfter=6))
        elif kind == 'code':
            flow.append(Preformatted(content, styles['code']))
        elif kind == 'note':
            flow.append(Paragraph(inline(content), styles['note']))
        elif kind == 'hr':
            flow.append(HRFlowable(width='100%', thickness=0.5, color=RULE,
                                   spaceBefore=8, spaceAfter=8))
    return flow


def main() -> None:
    lang = sys.argv[1] if len(sys.argv) > 1 else 'en'
    if lang not in SOURCES:
        sys.exit(f'Idioma inválido: {lang} (usar es|en)')
    src, out = SOURCES[lang]

    styles = build_styles()
    doc = BaseDocTemplate(out, pagesize=A4,
                          leftMargin=48, rightMargin=48,
                          topMargin=48, bottomMargin=48,
                          title='ZeroInfra Labs Manual',
                          author='ZeroInfra Labs')
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id='main')
    doc.addPageTemplates([PageTemplate(id='page', frames=[frame])])

    story = build_flowables(parse_md(src), styles)
    story.insert(0, Spacer(1, 4))
    doc.build(story)
    print(f'OK → {out}')


if __name__ == '__main__':
    main()

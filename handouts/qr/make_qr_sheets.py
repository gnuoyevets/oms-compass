"""Front-desk QR sheets for the patient page (handouts/index.html). One PDF per practice: page 1 English, page 2 Spanish.
Run from the repo root after changing topics: python3 handouts/qr/make_qr_sheets.py  (needs reportlab and node)."""
import json, os, subprocess
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, black
from reportlab.pdfgen import canvas
from reportlab.graphics.barcode.qr import QrCodeWidget
from reportlab.graphics.shapes import Drawing
from reportlab.graphics import renderPDF
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

OUT = os.path.dirname(os.path.abspath(__file__))
JS = "const s=require('fs').readFileSync('handouts/index.html','utf8');eval(s.slice(s.indexOf('const HO=['),s.indexOf('const LANGS=[')).replace(/const /g,'var '));console.log(JSON.stringify({ho:HO.map(h=>({id:h.id,en:h.t.en,es:h.t.es})),faq:FAQ.map(f=>({id:f.id,k:f.k,en:f.t.en,es:f.t.es}))}))"
pdfmetrics.registerFont(TTFont('Sans', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('SansB', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
T = json.loads(subprocess.run(['node', '-e', JS], capture_output=True, text=True, check=True).stdout)
BASE = 'https://gnuoyevets.github.io/oms-compass/handouts/'
SITES = {
 'young': ('Steven H. Young, DDS, OMS', '(401) 273-7802', ''),
 'bayside': ('Bayside Oral & Facial Surgery', '(508) 422-5007', '?site=bayside'),
}
UI = {
 'en': dict(h='Patient information', sub='Scan with your phone camera to open instructions and answers to common questions.',
            all='All topics', s=['After surgery', 'About your procedure', 'About your diagnosis'], ph='Questions? Call',
            foot='General information. Follow your surgeon’s instructions if they differ. Emergencies: call 911.'),
 'es': dict(h='Información para pacientes', sub='Escanee con la cámara de su teléfono para ver instrucciones y respuestas a preguntas comunes.',
            all='Todos los temas', s=['Después de la cirugía', 'Sobre su procedimiento', 'Sobre su diagnóstico'], ph='¿Preguntas? Llame al',
            foot='Información general. Si su cirujano le indicó algo diferente, siga sus indicaciones. Emergencias: llame al 911.'),
}
ACCENT, MUTED, LINE = HexColor('#0f6a5e'), HexColor('#5a6b67'), HexColor('#c9d3cc')

def qr(c, data, x, y, size):
    w = QrCodeWidget(data, barLevel='M')
    b = w.getBounds(); bw, bh = b[2] - b[0], b[3] - b[1]
    d = Drawing(size, size, transform=[size / bw, 0, 0, size / bh, 0, 0]); d.add(w)
    renderPDF.draw(d, c, x, y)

def wrap(c, text, font, size, width):
    words, lines, cur = text.split(), [], ''
    for wd in words:
        t = (cur + ' ' + wd).strip()
        if c.stringWidth(t, font, size) <= width: cur = t
        else: lines.append(cur); cur = wd
    return lines + [cur]

def page(c, site, lang):
    name, phone, q = SITES[site]; u = UI[lang]
    W, H = letter; m = 0.5 * inch
    # Header: big "all topics" code on the right
    big = 1.35 * inch
    qr(c, f'{BASE}{q}#-{lang}', W - m - big, H - m - big, big)
    c.setFont('SansB', 9); c.setFillColor(ACCENT)
    c.drawCentredString(W - m - big / 2, H - m - big - 11, u['all'])
    c.setFillColor(black); c.setFont('SansB', 22); c.drawString(m, H - m - 22, u['h'])
    c.setFont('SansB', 12.5); c.setFillColor(ACCENT); c.drawString(m, H - m - 42, name)
    c.setFillColor(black); c.setFont('Sans', 11)
    y = H - m - 62
    for ln in wrap(c, u['sub'], 'Sans', 11, W - 2 * m - big - 0.3 * inch):
        c.drawString(m, y, ln); y -= 14
    c.setFont('SansB', 11); c.drawString(m, y - 4, f"{u['ph']} {phone}")
    # Grid of topic codes, 5 per row, grouped by section
    cols, gw = 5, (W - 2 * m) / 5
    qs = 0.9 * inch
    y = H - m - big - 0.42 * inch
    groups = [T['ho'], [f for f in T['faq'] if f['k'] == 'proc'], [f for f in T['faq'] if f['k'] == 'dx']]
    for gi, items in enumerate(groups):
        c.setStrokeColor(LINE); c.setLineWidth(0.6); c.line(m, y, W - m, y)
        c.setFont('SansB', 9.5); c.setFillColor(MUTED); c.drawString(m, y - 13, u['s'][gi].upper())
        y -= 20
        for r0 in range(0, len(items), cols):
            row = items[r0:r0 + cols]
            labels = [wrap(c, it[lang], 'Sans', 8.3, gw - 8)[:4] for it in row]
            for col, (it, lines) in enumerate(zip(row, labels)):
                x = m + col * gw + (gw - qs) / 2
                qr(c, f"{BASE}{q}#{it['id']}-{lang}", x, y - qs, qs)
                c.setFillColor(black); c.setFont('Sans', 8.3)
                for k, ln in enumerate(lines):
                    c.drawCentredString(m + col * gw + gw / 2, y - qs - 10 - k * 9.2, ln)
            y -= qs + max(map(len, labels)) * 9.2 + 8
        y -= 4
    c.setFont('Sans', 8); c.setFillColor(MUTED); c.drawString(m, m - 6, u['foot'])
    c.showPage()

for site in SITES:
    c = canvas.Canvas(f'{OUT}/qr-sheet-{site}.pdf', pagesize=letter, pageCompression=1)
    c.setTitle(f'Patient information QR codes — {SITES[site][0]}')
    for lang in ('en', 'es'): page(c, site, lang)
    c.save()
print('ok')

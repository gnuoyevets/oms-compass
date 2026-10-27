"""Front-desk QR sheets for the patient page (handouts/index.html). One PDF per practice, two pages per language
(English, Español, Kriolu, 中文): page 1 = post-op instructions + procedures, page 2 = diagnoses.
Codes sit 4 per row in separate boxes with wide gaps so the camera picks one at a time.
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
JS = ("const s=require('fs').readFileSync('handouts/index.html','utf8');"
      "eval(s.slice(s.indexOf('const HO=['),s.indexOf('const LANGS=[')).replace(/const /g,'var '));"
      "console.log(JSON.stringify({ho:HO.map(h=>({id:h.id,t:h.t})),faq:FAQ.map(f=>({id:f.id,k:f.k,t:f.t}))}))")
T = json.loads(subprocess.run(['node', '-e', JS], capture_output=True, text=True, check=True).stdout)
pdfmetrics.registerFont(TTFont('Sans', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('SansB', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('CJK', '/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc', subfontIndex=0))
BASE = 'https://gnuoyevets.github.io/oms-compass/handouts/'
SITES = {
 'young': ('Steven H. Young, DDS, OMS', '(401) 273-7802', ''),
 'bayside': ('Bayside Oral & Facial Surgery', '(508) 422-5007', '?site=bayside'),
}
UI = {
 'en': dict(h='Patient information', sub='Scan with your phone camera to open instructions and answers to common questions.',
            all='All topics', s=['After surgery', 'About your procedure', 'About your diagnosis'], ph='Questions? Call',
            tip='Hold the phone close so only one code fills the screen.',
            foot='General information. Follow your surgeon’s instructions if they differ. Emergencies: call 911.'),
 'es': dict(h='Información para pacientes', sub='Escanee con la cámara de su teléfono para ver instrucciones y respuestas a preguntas comunes.',
            all='Todos los temas', s=['Después de la cirugía', 'Sobre su procedimiento', 'Sobre su diagnóstico'], ph='¿Preguntas? Llame al',
            tip='Acerque el teléfono para que solo un código llene la pantalla.',
            foot='Información general. Si su cirujano le indicó algo diferente, siga sus indicaciones. Emergencias: llame al 911.'),
 'kea': dict(h='Informason pa paciente', sub='Skania ku kámara di bu telemóvel pa abri instruson i risposta pa purgunta kumun.',
             all='Tudu asuntu', s=['Dipôs di sirurjia', 'Sobri bu prusedimentu', 'Sobri bu diagnóstiku'], ph='Purgunta? Txoma',
             tip='Txiga telemóvel pertu pa só un kódigu fika na ekran.',
             foot='Informason jeral. Si bu sirurjion fla-bu otu kuza, sigi bu sirurjion. Emerjénsia: txoma 911.'),
 'zh': dict(h='患者须知', sub='请用手机相机扫描二维码，查看术后须知和常见问题解答。',
            all='所有主题', s=['术后须知', '关于您的手术', '关于您的诊断'], ph='有疑问？请致电',
            tip='请把手机靠近，让屏幕上只出现一个二维码。',
            foot='一般性说明。如果您的医生另有指示，请遵从医生的指示。紧急情况：请拨打911。'),
}
ACCENT, MUTED, LINE = HexColor('#0f6a5e'), HexColor('#5a6b67'), HexColor('#b9c6be')
W, H = letter
M = 0.5 * inch
COLS, QS = 4, 1.05 * inch          # 4 codes per row; ~0.8 in clear space between codes
GW = (W - 2 * M) / COLS
LH = 10                              # label line height (pt)

def fonts(lang):
    return ('CJK', 'CJK') if lang == 'zh' else ('Sans', 'SansB')

def wrap(c, text, font, size, width):
    if font == 'CJK':                # no spaces in Chinese: wrap by character
        lines, cur = [], ''
        for ch in text:
            if c.stringWidth(cur + ch, font, size) <= width: cur += ch
            else: lines.append(cur); cur = ch
        return lines + [cur]
    words, lines, cur = text.split(), [], ''
    for wd in words:
        t = (cur + ' ' + wd).strip()
        if c.stringWidth(t, font, size) <= width: cur = t
        else: lines.append(cur); cur = wd
    return lines + [cur]

def qr(c, data, x, y, size):
    w = QrCodeWidget(data, barLevel='M')
    b = w.getBounds(); bw, bh = b[2] - b[0], b[3] - b[1]
    d = Drawing(size, size, transform=[size / bw, 0, 0, size / bh, 0, 0]); d.add(w)
    renderPDF.draw(d, c, x, y)

def header(c, site, lang, big_code):
    name, phone, q = SITES[site]; u = UI[lang]; f, fb = fonts(lang)
    big = 1.3 * inch
    if big_code:
        qr(c, f'{BASE}{q}#-{lang}', W - M - big, H - M - big, big)
        c.setFont(fb, 9.5); c.setFillColor(ACCENT); c.drawCentredString(W - M - big / 2, H - M - big - 11, u['all'])
    c.setFillColor(black); c.setFont(fb, 22); c.drawString(M, H - M - 22, u['h'])
    c.setFont('SansB', 12.5); c.setFillColor(ACCENT); c.drawString(M, H - M - 42, name)
    c.setFillColor(black); c.setFont(f, 11); y = H - M - 62
    for ln in wrap(c, u['sub'], f, 11, W - 2 * M - (big + 0.3 * inch if big_code else 0)):
        c.drawString(M, y, ln); y -= 14
    c.setFont(fb, 11); c.drawString(M, y - 4, f"{u['ph']} {phone}")
    return H - M - big - 0.45 * inch if big_code else y - 0.35 * inch

def section(c, title, items, lang, q, y):
    f, fb = fonts(lang)
    c.setStrokeColor(LINE); c.setLineWidth(0.6); c.line(M, y, W - M, y)
    c.setFont(fb, 10); c.setFillColor(MUTED); c.drawString(M, y - 14, title.upper() if lang != 'zh' else title)
    y -= 24
    for r0 in range(0, len(items), COLS):
        row = items[r0:r0 + COLS]
        labels = [wrap(c, it['t'][lang], f, 9, GW - 22)[:3] for it in row]
        box_h = QS + 16 + max(map(len, labels)) * LH
        for col, (it, lines) in enumerate(zip(row, labels)):
            x0 = M + col * GW + 7
            c.setStrokeColor(LINE); c.setLineWidth(0.8); c.roundRect(x0, y - box_h, GW - 14, box_h, 8)
            qr(c, f"{BASE}{q}#{it['id']}-{lang}", M + col * GW + (GW - QS) / 2, y - QS - 4, QS)
            c.setFillColor(black); c.setFont(f, 9)
            for k, ln in enumerate(lines):
                c.drawCentredString(M + col * GW + GW / 2, y - QS - 14 - k * LH, ln)
        y -= box_h + 14
    return y - 4

def footer(c, lang):
    f, _ = fonts(lang); u = UI[lang]
    c.setFont(f, 8.5); c.setFillColor(MUTED)
    c.drawString(M, M + 4, u['tip']); c.drawString(M, M - 8, u['foot'])

def pages(c, site, lang):
    q = SITES[site][2]; u = UI[lang]
    y = header(c, site, lang, True)
    y = section(c, u['s'][0], T['ho'], lang, q, y)
    section(c, u['s'][1], [f for f in T['faq'] if f['k'] == 'proc'], lang, q, y)
    footer(c, lang); c.showPage()
    y = header(c, site, lang, False)
    section(c, u['s'][2], [f for f in T['faq'] if f['k'] == 'dx'], lang, q, y)
    footer(c, lang); c.showPage()

for site in SITES:
    c = canvas.Canvas(f'{OUT}/qr-sheet-{site}.pdf', pagesize=letter, pageCompression=1)
    c.setTitle(f'Patient information QR codes — {SITES[site][0]}')
    for lang in ('en', 'es', 'kea', 'zh'): pages(c, site, lang)
    c.save()
print('ok')

"""Extract the supplied two-page anatomy TD, without its worksheet text.

Usage: python tools/extract_anatomy.py /absolute/path/to/the/supplied.pdf
The coordinates of the PDF's original arrow tips are kept in anatomy-data.js.
"""
import sys
from io import BytesIO
from pathlib import Path
import fitz
from PIL import Image

root = Path(__file__).resolve().parents[1]
out = root / 'dist/assets/diagrams'
doc = fitz.open(sys.argv[1])

def extract(xref, mask=0):
    pix = fitz.Pixmap(doc, xref)
    if mask:
        if pix.alpha:
            pix = fitz.Pixmap(pix, 0)
        pix = fitz.Pixmap(pix, fitz.Pixmap(doc, mask))
    mode = 'RGBA' if pix.alpha else 'RGB'
    image = Image.frombytes(mode, [pix.width, pix.height], pix.samples)
    if pix.alpha:
        white = Image.new('RGB', image.size, 'white')
        white.paste(image, mask=image.getchannel('A'))
        image = white
    return image

def save(image, name):
    encoded = BytesIO()
    image.save(encoded, format='WEBP', lossless=True, method=4)
    data = encoded.getvalue()
    if not data:
        raise ValueError(f'Empty image: {name}')
    with Image.open(BytesIO(data)) as check:
        check.load()
        assert check.size == image.size
    (out / name).write_bytes(data)

for name, xref in [('coronal', 11), ('sagittal', 10), ('axial', 9),
                   ('irm-coronal', 25), ('irm-axial', 26)]:
    save(extract(xref), f'td-anatomy-{name}.webp')

lateral = extract(14, 24)
save(lateral, 'td-anatomy-areas.webp')
surface = Image.new('RGB', (1200, 520), 'white')
surface.paste(lateral.resize((720, 509), Image.Resampling.LANCZOS), (0, 0))
surface.paste(extract(16).resize((430, 286), Image.Resampling.LANCZOS), (760, 120))
save(surface, 'td-anatomy-surface.webp')
source = root / 'dist/assets/td-anatomie.pdf'
source.write_bytes(Path(sys.argv[1]).read_bytes())
print('7 illustrations extraites ; PDF source conservé.')

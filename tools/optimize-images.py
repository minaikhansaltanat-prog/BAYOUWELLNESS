"""
Source photos (Photo/*.jpg) + logo.png  ->  optimized WebP/PNG in public/img/ and content/images.json

Run:  python tools/optimize-images.py
Only down-scales. Crops are label-free regions of third-party mood photos or
tight crops of the AROMATICA product photos.
"""
import json
import os
from collections import deque
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHOTO = os.path.join(ROOT, "Photo")
OUT = os.path.join(ROOT, "public", "img")
os.makedirs(OUT, exist_ok=True)

# short hash prefix -> file
def src(prefix):
    for f in os.listdir(PHOTO):
        if f.startswith(prefix):
            return os.path.join(PHOTO, f)
    raise FileNotFoundError(prefix)

# name, source prefix, crop box (l, t, r, b) or None, widths
JOBS = [
    # --- AROMATICA product photography ---
    ("root-enhancer-1", "f7276daa", None, (480, 800)),
    ("root-enhancer-2", "6954486b", None, (480, 734)),
    ("root-enhancer-3", "9f88616c", None, (480, 736)),
    ("pdrn-serum-1",    "6ac9ad63", None, (480, 500)),
    ("pdrn-serum-2",    "5d5669cd", None, (480, 735)),
    ("pdrn-serum-3",    "f6c71b89", None, (480, 735)),
    ("conditioner-1",   "9a09e49a", None, (480, 736)),
    ("shampoo-1",       "c8432737", (0, 60, 420, 620), (420,)),
    ("scrub-1",         "c8432737", (410, 430, 736, 880), (326,)),
    ("ampoule-1",       "842f2ec8", None, (480, 736)),
    ("dry-shampoo-1",   "842f2ec8", (330, 330, 736, 790), (406,)),
    ("flatlay-1",       "c8432737", None, (480, 736)),
    ("group-1",         "d93b7118", None, (480, 735)),
    # --- mood / atmosphere (label-free crops) ---
    ("mood-moss-rocks", "f978c6be", (0, 1030, 1200, 1500), (640, 1200)),
    ("mood-stones",     "efeb94f0", (0, 520, 736, 977), (480, 736)),
    ("mood-rosemary",   "5a463101", (150, 860, 1200, 1480), (640, 1050)),
    ("mood-forest",     "80e0139a", (0, 0, 688, 500), (480, 688)),
    ("mood-river",      "775ca69c", (0, 0, 735, 480), (480, 735)),
]

manifest = {}

def save_webp(im, name, widths, q=82):
    sizes = {}
    for w in widths:
        if im.width < w:
            w = im.width
        h = round(im.height * w / im.width)
        r = im.resize((w, h), Image.LANCZOS)
        fn = f"{name}-{w}.webp"
        r.save(os.path.join(OUT, fn), "WEBP", quality=q, method=6)
        sizes[w] = h
    manifest[name] = {"widths": sorted(sizes), "heights": sizes,
                      "ratio": round(im.width / im.height, 4)}

for name, prefix, box, widths in JOBS:
    im = Image.open(src(prefix)).convert("RGB")
    if box:
        im = im.crop(box)
    # dedupe widths after clamping
    ws = sorted({min(w, im.width) for w in widths})
    save_webp(im, name, ws)

# --- logo: remove the white studio background (flood fill from the border) ---
logo = Image.open(os.path.join(ROOT, "logo.png")).convert("RGB")
W, H = logo.size
px = logo.load()

def is_bg(p, thr=244):
    return p[0] >= thr and p[1] >= thr and p[2] >= thr

seen = bytearray(W * H)
dq = deque()
for x in range(W):
    for y in (0, H - 1):
        dq.append((x, y))
for y in range(H):
    for x in (0, W - 1):
        dq.append((x, y))
while dq:
    x, y = dq.popleft()
    if x < 0 or y < 0 or x >= W or y >= H:
        continue
    i = y * W + x
    if seen[i]:
        continue
    if not is_bg(px[x, y]):
        continue
    seen[i] = 1
    dq.extend(((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))

alpha = Image.new("L", (W, H), 255)
ap = alpha.load()
for y in range(H):
    row = y * W
    for x in range(W):
        if seen[row + x]:
            ap[x, y] = 0
# feather the cut edge slightly so it is not jagged
alpha = alpha.filter(ImageFilter.GaussianBlur(0.9))
rgba = logo.convert("RGBA")
rgba.putalpha(alpha)
bbox = rgba.getbbox()
rgba = rgba.crop(bbox)
rgba.save(os.path.join(OUT, "logo-full.png"), optimize=True)
for w in (240, 480, 960):
    h = round(rgba.height * w / rgba.width)
    rgba.resize((w, h), Image.LANCZOS).save(os.path.join(OUT, f"logo-{w}.webp"), "WEBP", quality=90, method=6, lossless=False)
manifest["logo"] = {"widths": [240, 480, 960], "ratio": round(rgba.width / rgba.height, 4)}

# --- emblem (leaf person inside the O) for favicon / app icons ---
emb_box = (1080, 165, 1480, 545)
emb = rgba.copy()
# rgba was cropped to bbox; recompute offset
off_x, off_y = bbox[0], bbox[1]
emb = rgba.crop((emb_box[0] - off_x, emb_box[1] - off_y, emb_box[2] - off_x, emb_box[3] - off_y))
side = max(emb.size)
canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
canvas.paste(emb, ((side - emb.width) // 2, (side - emb.height) // 2))
canvas = canvas.resize((512, 512), Image.LANCZOS)
# erase the tip of the neighbouring "Y" that falls inside the crop (top-left corner)
from PIL import ImageDraw
ImageDraw.Draw(canvas).rectangle((0, 0, 92, 142), fill=(0, 0, 0, 0))
cb = canvas.getbbox()
canvas = canvas.crop(cb)
side = max(canvas.size)
sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
sq.paste(canvas, ((side - canvas.width) // 2, (side - canvas.height) // 2))
canvas = sq
canvas.resize((512, 512), Image.LANCZOS).save(os.path.join(OUT, "emblem-512.png"), optimize=True)
canvas.resize((192, 192), Image.LANCZOS).save(os.path.join(OUT, "emblem-192.png"), optimize=True)
canvas.resize((48, 48), Image.LANCZOS).save(os.path.join(OUT, "favicon-48.png"), optimize=True)
canvas.resize((32, 32), Image.LANCZOS).save(os.path.join(OUT, "favicon-32.png"), optimize=True)
# apple touch icon needs an opaque background
ati = Image.new("RGB", (180, 180), (255, 255, 255))
e180 = canvas.resize((150, 150), Image.LANCZOS)
ati.paste(e180, (15, 15), e180)
ati.save(os.path.join(OUT, "apple-touch-icon.png"), optimize=True)

# --- Open Graph card 1200x630 ---
og = Image.new("RGB", (1200, 630), (247, 249, 246))
hero = Image.open(src("f7276daa")).convert("RGB")
hr = hero.resize((int(hero.width * 630 / hero.height), 630), Image.LANCZOS)
tile = Image.new("RGB", (hr.width, 630), (214, 232, 196))
# multiply the white-bg photo onto a sage tile
from PIL import ImageChops
tile = ImageChops.multiply(tile, hr)
og.paste(tile, (1200 - tile.width, 0))
lg = rgba.resize((640, round(rgba.height * 640 / rgba.width)), Image.LANCZOS)
og.paste(lg, (70, 150), lg)
og.save(os.path.join(OUT, "og-cover.jpg"), quality=88, optimize=True)

with open(os.path.join(ROOT, "content", "images.json"), "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=1)
print("ok", len(manifest), "image sets")

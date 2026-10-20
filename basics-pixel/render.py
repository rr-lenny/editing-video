#!/usr/bin/env python3
"""BASICS Nº01: pixel-art 9:16 video « 5 marques indispensables pour acheter tes basics » (part 1).

Art direction: a street-fashion magazine printed on an 8-bit machine. Every photo is dithered
(8x8 ordered Bayer) through a 5-tone gradient map pulled from the shoot itself, plus one spot colour per
chapter. Display type is Inter Display Black, the accent is Caladea Italic, and captions use a hand-drawn
5x7 bitmap font. Everything is drawn at 270x480 without anti-aliasing, then scaled x4 nearest to 1080x1920.
Motion runs at 12 steps/s (on twos) inside a 24 fps file, and every cut lands on the 90 BPM beat.
The lo-fi beat (FM Rhodes, dusty drums, 8-bit pulse lead, vinyl) and the SFX are synthesised here too.

usage: python3 render.py [out.mp4] | python3 render.py --preview t1,t2,... out.png
"""
import functools, math, os, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, S, FPS, STEP = 270, 480, 4, 24, 12
BEAT = 60 / 90
BAR = 4 * BEAT
DUR = 10 * BAR                                       # 26.67 s
FONT_DISP = "/usr/share/fonts/opentype/inter/InterDisplay-Black.otf"
FONT_ITAL = "/usr/share/fonts/truetype/crosextra/Caladea-Italic.ttf"


def stepped(t):
    return math.floor(t * STEP + 1e-6) / STEP


# ── palettes: 5-tone ramps (ink → paper) sampled from the shoot + one spot colour ──
RAMPS = {
    "rose":  [(30, 18, 22), (92, 36, 44), (170, 98, 104), (222, 168, 166), (244, 232, 224)],
    "olive": [(22, 20, 10), (70, 56, 26), (128, 118, 50), (188, 176, 108), (238, 230, 200)],
    "denim": [(16, 20, 22), (40, 54, 56), (112, 94, 82), (182, 158, 138), (236, 226, 212)],
    "slate": [(26, 16, 14), (80, 48, 40), (108, 136, 146), (180, 202, 204), (238, 240, 234)],
}
SPOT = {"rose": (214, 52, 40), "olive": (222, 34, 40), "denim": (84, 120, 240), "slate": (206, 92, 46)}

# ── 5x7 bitmap caption font ──────────────────────────────────────────────────
F = {
 'A': [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
 'B': ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
 'C': [".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."],
 'D': ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
 'E': ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
 'F': ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
 'G': [".###.", "#...#", "#....", "#.###", "#...#", "#...#", ".####"],
 'H': ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
 'I': [".###.", "..#..", "..#..", "..#..", "..#..", "..#..", ".###."],
 'J': ["..###", "...#.", "...#.", "...#.", "#..#.", "#..#.", ".##.."],
 'K': ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
 'L': ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
 'M': ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
 'N': ["#...#", "#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#"],
 'O': [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
 'P': ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
 'Q': [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
 'R': ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
 'S': [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
 'T': ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
 'U': ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
 'V': ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
 'W': ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "#.#.#", ".#.#."],
 'X': ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
 'Y': ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
 'Z': ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
 '0': [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
 '1': ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", ".###."],
 '2': [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
 '3': ["#####", "...#.", "..#..", "...#.", "....#", "#...#", ".###."],
 '4': ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
 '5': ["#####", "#....", "####.", "....#", "....#", "#...#", ".###."],
 '6': ["..##.", ".#...", "#....", "####.", "#...#", "#...#", ".###."],
 '7': ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
 '8': [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
 '9': [".###.", "#...#", "#...#", ".####", "....#", "...#.", ".##.."],
 ' ': ["....."] * 7,
 '!': ["..#..", "..#..", "..#..", "..#..", "..#..", ".....", "..#.."],
 '?': [".###.", "#...#", "....#", "...#.", "..#..", ".....", "..#.."],
 '.': [".....", ".....", ".....", ".....", ".....", ".....", "..#.."],
 ',': [".....", ".....", ".....", ".....", ".....", "..#..", ".#..."],
 ':': [".....", "..#..", ".....", ".....", ".....", "..#..", "....."],
 "'": ["..#..", "..#..", ".....", ".....", ".....", ".....", "....."],
 '-': [".....", ".....", ".....", ".###.", ".....", ".....", "....."],
 '/': ["....#", "....#", "...#.", "..#..", ".#...", "#....", "#...."],
 '+': [".....", "..#..", "..#..", "#####", "..#..", "..#..", "....."],
 '>': [".....", "..#..", "...#.", "#####", "...#.", "..#..", "....."],
 '@': [".....", ".#.#.", "#####", "#####", ".###.", "..#..", "....."],   # heart
 '·': [".....", ".....", ".....", "..#..", ".....", ".....", "....."],
 '€': ["..###", ".#...", "####.", ".#...", "####.", ".#...", "..###"],
 'º': [".###.", ".#.#.", ".###.", ".....", ".###.", ".....", "....."],
}
ACC = {'É': ('E', ["...#.", "..#.."]), 'È': ('E', [".#...", "..#.."]), 'Ê': ('E', ["..#..", ".#.#."]),
       'À': ('A', [".#...", "..#.."]), 'Ô': ('O', ["..#..", ".#.#."])}


def micro_w(s, sc=1):
    return len(s) * 6 * sc - sc


def micro(img, s, x, y, col, sc=1, n=None, shadow=None):
    if x == 'c':
        x = (W - micro_w(s, sc)) // 2
    if shadow is not None:
        micro(img, s, x + 1, y + 1, shadow, sc, n)
    col = np.array(col, np.uint8)
    for k, ch in enumerate(s if n is None else s[:max(0, int(n))]):
        rows, acc = (F[ACC[ch][0]], ACC[ch][1]) if ch in ACC else (F.get(ch, F['?']), None)
        for j, r in enumerate(rows):
            for i, c in enumerate(r):
                if c == '#':
                    rect(img, x + k * 6 * sc + i * sc, y + j * sc, sc, sc, col)
        for j, r in enumerate(acc or []):
            for i, c in enumerate(r):
                if c == '#':
                    rect(img, x + k * 6 * sc + i * sc, y + (j - 3) * sc, sc, sc, col)
    return x


def rect(img, x, y, w, h, col):
    x0, y0, x1, y1 = max(0, int(x)), max(0, int(y)), min(img.shape[1], int(x + w)), min(img.shape[0], int(y + h))
    if x1 > x0 and y1 > y0:
        img[y0:y1, x0:x1] = col


# ── display type: real fonts rasterised without anti-aliasing ────────────────
@functools.lru_cache(maxsize=None)
def tmask(s, font, size, track=0):
    f = ImageFont.truetype(font, size)
    asc, desc = f.getmetrics()
    wd = int(sum(f.getlength(c) + track for c in s)) + size
    im = Image.new("1", (wd, asc + desc + 4), 0)
    d = ImageDraw.Draw(im)
    d.fontmode = "1"
    x = 2
    for c in s:
        d.text((x, 2), c, font=f, fill=1)
        x += f.getlength(c) + track
    m = np.asarray(im)
    ys, xs = np.nonzero(m)
    return m[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


@functools.lru_cache(maxsize=None)
def fit(s, font, maxw, start, track=0):
    size = start
    while size > 8 and tmask(s, font, size, track).shape[1] > maxw:
        size -= 1
    return size


def put(img, m, x, y, col, reveal=1.0, mode="lr"):
    h, w = m.shape
    if x == 'c':
        x = (W - w) // 2
    if reveal < 1:
        m = m.copy()
        if mode == "lr":
            m[:, int(math.ceil(w * reveal / 4) * 4):] = False
        else:                                                     # rise from the baseline
            m[:h - int(math.ceil(h * reveal / 3) * 3), :] = False
    x0, y0 = max(0, x), max(0, y)
    x1, y1 = min(W, x + w), min(H, y + h)
    if x1 <= x0 or y1 <= y0:
        return x
    sub = m[y0 - y:y1 - y, x0 - x:x1 - x]
    img[y0:y1, x0:x1][sub] = col
    return x


def outline(m):
    p = np.pad(m, 1)
    er = p[1:-1, 1:-1] & p[:-2, 1:-1] & p[2:, 1:-1] & p[1:-1, :-2] & p[1:-1, 2:]
    return m & ~er


# ── dithering ────────────────────────────────────────────────────────────────
def bayer(n):
    m = np.array([[0]])
    while m.shape[0] < n:
        m = np.block([[4 * m, 4 * m + 2], [4 * m + 3, 4 * m + 1]])
    return (m + 0.5) / m.size


B8 = bayer(8)
TH = np.tile(B8, (H // 8 + 2, W // 8 + 2))


def thresh(x, y, w, h):
    return TH[y % 8:y % 8 + h, x % 8:x % 8 + w]


def gradient_map(lum, ramp, x, y):
    h, w = lum.shape
    n = len(ramp) - 1
    v = np.clip(lum, 0, 1) * n
    b = np.floor(v).astype(int)
    idx = np.clip(b + ((v - b) > thresh(x, y, w, h)), 0, n)
    return np.array(ramp, np.uint8)[idx]


def ink_fade(img, y0, y1, ink, a0, a1):
    """Ordered-dither a band of ink whose density goes a0 → a1 from y0 to y1."""
    y0, y1 = max(0, y0), min(H, y1)
    d = np.linspace(a0, a1, y1 - y0)[:, None]
    m = thresh(0, y0, W, y1 - y0) < d
    img[y0:y1][m] = ink


class Photo:
    def __init__(self, name, contrast=1.15, gamma=1.0):
        im = Image.open(os.path.join(HERE, "refs", name)).convert("L")
        im = ImageOps.autocontrast(im, cutoff=1)
        self.im = im.filter(ImageFilter.UnsharpMask(3, 90, 2))
        self.contrast, self.gamma = contrast, gamma

    @functools.lru_cache(maxsize=256)
    def lum(self, cx, cy, zoom, w, h):
        iw, ih = self.im.size
        a = w / h
        bw, bh = (ih * a, ih) if iw / ih > a else (iw, iw / a)
        bw, bh = bw / zoom, bh / zoom
        x0 = min(max(cx * iw - bw / 2, 0), iw - bw)
        y0 = min(max(cy * ih - bh / 2, 0), ih - bh)
        r = self.im.resize((w, h), Image.BOX, box=(x0, y0, x0 + bw, y0 + bh))
        v = np.asarray(r, np.float32) / 255
        return np.clip((v - 0.5) * self.contrast + 0.5, 0, 1) ** self.gamma

    def draw(self, img, x, y, w, h, ramp, cam, dev=1.0, t=0.0, grain=0.035):
        cx, cy, z = cam
        v = self.lum(round(cx, 3), round(cy, 3), round(z, 3), w, h)
        if grain:
            v = v + np.random.default_rng(int(stepped(t) * STEP) + x * 7 + y).normal(0, grain, v.shape)
        if dev < 1:
            v = 1 - (1 - v) * dev                                   # develops out of the paper
        tile = gradient_map(v, ramp, x, y)
        x0, y0, x1, y1 = max(0, x), max(0, y), min(W, x + w), min(H, y + h)
        if x1 > x0 and y1 > y0:
            img[y0:y1, x0:x1] = tile[y0 - y:y1 - y, x0 - x:x1 - x]


PH = {k: Photo(f) for k, f in dict(bonnet="look_bonnet.webp", debardeur="look_debardeur.png",
                                   denim="look_denim.webp", hoodie="look_hoodie_short.webp",
                                   teejean="look_tee_jean.webp", oversize="look_oversize.webp").items()}


def paper(img, ramp, seed, x=0, y=0, w=W, h=H):
    rect(img, x, y, w, h, ramp[4])
    r = np.random.default_rng(seed)
    n = int(w * h * 0.018)
    xs, ys = r.integers(x, x + w, n), r.integers(y, y + h, n)
    ok = (xs < W) & (ys < H) & (ys >= 0)
    img[ys[ok], xs[ok]] = ramp[3]


def crop_marks(img, col):
    for x, y, dx, dy in ((6, 6, 1, 1), (W - 7, 6, -1, 1), (6, H - 7, 1, -1), (W - 7, H - 7, -1, -1)):
        rect(img, min(x, x + 6 * dx), y, 7, 1, col)
        rect(img, x, min(y, y + 6 * dy), 1, 7, col)


def barcode(img, x, y, ramp, seed=4):
    r = np.random.default_rng(seed)
    rect(img, x, y, 52, 30, ramp[4])
    cx = x + 4
    while cx < x + 48:
        bw = int(r.integers(1, 3))
        rect(img, cx, y + 3, bw, 18, ramp[0])
        cx += bw + int(r.integers(1, 3))
    micro(img, "3 760 26", x + 4, y + 22, ramp[0])


def folio(img, left, right, col, rule=None, shadow=None):
    micro(img, left, 14, 44, col, shadow=shadow)
    micro(img, right, W - 14 - micro_w(right), 44, col, shadow=shadow)
    rect(img, 14, 55, W - 28, 1, rule if rule is not None else col)


def ease(x):
    x = min(1.0, max(0.0, x))
    return 1 - (1 - x) ** 3


def prog(t, t0, d):
    return ease((stepped(t) - t0) / d)


# ── content ──────────────────────────────────────────────────────────────────
T_HOOK = 0.0
BRANDS = [
    dict(num="01", name=["UNIQLO"], origin="JAPON", tag="le roi du basic.", ramp="olive",
         hero=("debardeur", (0.5, 0.42, 1.0), (0.5, 0.36, 1.07)),
         inset=("teejean", (0.53, 0.3, 2.3)), inset_lab="LOOK 01-B",
         items=["T-SHIRT U", "DÉBARDEUR", "AIRISM"], prix=4, qual=4),
    dict(num="02", name=["BERSHKA"], origin="ESPAGNE", tag="le spot tendance.", ramp="denim",
         hero=("denim", (0.5, 0.5, 1.0), (0.48, 0.44, 1.07)),
         inset=("bonnet", (0.45, 0.38, 1.35)), inset_lab="LOOK 02-B",
         items=["JEAN BAGGY", "VESTE DENIM", "BONNET"], prix=5, qual=3),
    dict(num="03", name=["HUMAN WITH", "ATTITUDE"], origin="FRANCE", tag="le streetwear à la française.",
         ramp="slate", hero=("hoodie", (0.53, 0.45, 1.0), (0.53, 0.38, 1.08)),
         inset=("oversize", (0.52, 0.66, 1.8)), inset_lab="LOOK 03-B",
         items=["HOODIE", "T-SHIRT XXL", "SHORT"], prix=2, qual=5),
]
for i, b in enumerate(BRANDS):
    b["t0"] = (i + 1) * 2 * BAR
T_OUT = 4 * 2 * BAR
STARTS = [T_HOOK] + [b["t0"] for b in BRANDS] + [T_OUT]
SLIDE = 4 / STEP                                     # page-turn: 4 steps, lands on the downbeat

MONTAGE = [("denim", "denim", (0.5, 0.3, 1.6)), ("debardeur", "olive", (0.5, 0.3, 1.3)),
           ("hoodie", "slate", (0.53, 0.5, 1.0)), ("teejean", "rose", (0.53, 0.25, 2.0)),
           ("oversize", "olive", (0.52, 0.62, 1.7)), ("denim", "slate", (0.5, 0.65, 1.2)),
           ("bonnet", "denim", (0.45, 0.35, 1.4)), ("debardeur", "rose", (0.5, 0.55, 1.0))]


def scene_cover(img, t):
    ramp = RAMPS["rose"]
    ink, pap, spot = ramp[0], ramp[4], SPOT["rose"]
    if t < 2 * BEAT * 2:                                           # montage: a new look every half-beat
        k = min(7, int(t / (BEAT / 2)))
        name, rk, (cx, cy, z) = MONTAGE[k]
        ph = (t - k * BEAT / 2) / (BEAT / 2)
        PH[name].draw(img, 0, 0, W, H, RAMPS[rk], (cx, cy, z * (1 + 0.04 * stepped(ph))), t=t)
    else:
        u = t - 4 * BEAT
        PH["bonnet"].draw(img, 0, 0, W, H, ramp, (0.45, 0.42, 1.0 + 0.05 * prog(t, 4 * BEAT, 4 * BEAT)), t=t)
    ink_fade(img, 0, 130, ink, 0.85, 0.0)
    ink_fade(img, 230, H, ink, 0.0, 0.92)
    crop_marks(img, pap)
    micro(img, "Nº01", 14, 40, spot)
    micro(img, "ÉDITION STREET · AUTOMNE 2026", W - 14 - micro_w("ÉDITION STREET · AUTOMNE 2026"), 40, pap)
    m = tmask("BASICS", FONT_DISP, fit("BASICS", FONT_DISP, W - 28, 90, -3), -3)
    put(img, m, 16, 54, ink)
    put(img, m, 14, 52, pap)
    # cover lines
    m = tmask("5 MARQUES", FONT_DISP, fit("5 MARQUES", FONT_DISP, W - 28, 60, -2), -2)
    put(img, m, 16, 266, ink)
    put(img, m, 14, 264, pap)
    m = tmask("indispensables", FONT_ITAL, 40)
    put(img, m, 14, 264 + 46, pap, reveal=prog(t, BEAT, 0.4))
    m = tmask("pour acheter tes basics.", FONT_ITAL, 21)
    put(img, m, 14, 360, pap, reveal=prog(t, 2 * BEAT, 0.4))
    if t >= 4 * BEAT:
        u = t - 4 * BEAT
        # « HELLO my name is » sticker, slapped on at the settle
        s = 1 if stepped(u) > 1 / STEP else 1.2
        sx, sy, sw, sh = 170, 150, int(78 * s), int(46 * s)
        rect(img, sx + 3, sy + 3, sw, sh, ink)
        rect(img, sx, sy, sw, sh, spot)
        micro(img, "HELLO", sx + (sw - micro_w("HELLO")) // 2, sy + 4, pap)
        rect(img, sx + 4, sy + 15, sw - 8, sh - 19, pap)
        mm = tmask("partie 1/2", FONT_ITAL, 15)
        put(img, mm, sx + (sw - mm.shape[1]) // 2, sy + 15 + (sh - 19 - mm.shape[0]) // 2, ink)
        line = "01 UNIQLO · 02 BERSHKA · 03 HWA"
        n = (stepped(u) - 0.5) / 0.03
        micro(img, line, 14, 392, pap, n=n)
        for k in range(3):
            if n > [0, 12, 25][k] + 1:
                micro(img, ["01", "02", "03"][k], 14 + [0, 12, 25][k] * 6, 392, spot)
        if u > 1.0:
            barcode(img, 14, 420, ramp)


def scene_brand(img, t, br):
    ramp = RAMPS[br["ramp"]]
    ink, pap, spot = ramp[0], ramp[4], SPOT[br["ramp"]]
    st = stepped(t)
    paper(img, ramp, 11)
    name, c0, c1 = br["hero"]
    k = ease(st / (8 * BEAT))
    cam = tuple(a + (b - a) * k for a, b in zip(c0, c1))
    dev = prog(t, 0.0, 0.55)
    if dev > 0:
        PH[name].draw(img, 0, 0, W, H, ramp, cam, dev=dev, t=t)
    ink_fade(img, 0, 120, ink, 1.0 * dev, 0.0)
    ink_fade(img, 150, H, ink, 0.0, 1.05 * dev)
    crop_marks(img, pap if dev > 0.5 else ink)
    fc = pap if dev > 0.5 else ink
    folio(img, "BASICS Nº01", "P.%02d" % (int(br["num"]) * 2), fc, shadow=ink if dev > 0.5 else None)
    # lockup, laid out bottom-up so it always ends above the shopping page
    lines = br["name"]
    sz = min(fit(l, FONT_DISP, W - 28, 64, -2) for l in lines)
    nm = [tmask(l, FONT_DISP, sz, -2) for l in lines]
    mi = tmask(br["tag"], FONT_ITAL, 24 if len(br["tag"]) < 20 else 20)
    y = 292 - mi.shape[0] - 4 - sum(m.shape[0] + 5 for m in nm)
    mn = tmask(br["num"], FONT_DISP, 24, -1)
    put(img, mn, 14, int(y) - 34, spot, prog(t, 0.25 * BEAT, 0.25), "up")
    micro(img, "/ 05 · " + br["origin"], 14 + mn.shape[1] + 5, int(y) - 34 + mn.shape[0] - 7, pap,
          n=(st - 0.4 * BEAT) / 0.03, shadow=ink)
    for li, l in enumerate(lines):
        m = tmask(l, FONT_DISP, sz, -2)
        r = prog(t, BEAT * (0.5 + 0.5 * li), 0.3)
        put(img, m, 16, int(y) + 2, ink, r, "up")
        put(img, m, 14, int(y), pap, r, "up")
        y += m.shape[0] + 5
    put(img, mi, 16, int(y) + 5, ink, prog(t, 1.6 * BEAT, 0.45))
    put(img, mi, 15, int(y) + 4, pap, prog(t, 1.6 * BEAT, 0.45))
    # second half: the shopping page rises from the bottom
    if st >= 4 * BEAT - SLIDE:
        u = st - (4 * BEAT - SLIDE)
        top = int(300 + (H - 300) * (1 - ease(u / SLIDE)))
        rect(img, 0, top - 3, W, 3, ink)
        paper(img, ramp, 12, 0, top, W, H - top)
        micro(img, "À SHOPPER", 14, top + 10, ink)
        rect(img, 72, top + 13, 82, 1, ramp[2])
        for k_, it in enumerate(br["items"]):
            tk = 4 * BEAT + (0.5 + 0.5 * k_) * BEAT
            if st >= tk:
                yy = top + 26 + k_ * 20
                micro(img, "0%d" % (k_ + 1), 14, yy + 4, spot)
                micro(img, it, 28, yy, ink, sc=2, n=(st - tk) / 0.04)
        if st >= 6.5 * BEAT:
            yy = top + 91
            for lab, val, x0 in (("PRIX", 6 - br["prix"], 14), ("QUALITÉ", br["qual"], 86)):
                micro(img, lab, x0, yy, ink)
                bx = x0 + micro_w(lab) + 5
                for s_ in range(5):
                    if s_ < val and st >= 6.5 * BEAT + s_ * 0.08:
                        rect(img, bx + s_ * 7, yy + 1, 5, 5, spot)
                    else:
                        rect(img, bx + s_ * 7, yy + 1, 5, 5, ramp[2])
                        rect(img, bx + s_ * 7 + 1, yy + 2, 3, 3, pap)
        # inset: the second look, dropped in like a print
        if st >= 4.5 * BEAT:
            v = 4.5 * BEAT
            dy = int((1 - ease((st - v) / (3 / STEP))) * -14)
            ix, iy, iw, ih = 172, top + 10 + dy, 58, 74
            rect(img, ix - 2 + 3, iy - 2 + 3, iw + 4, ih + 4, ink)
            rect(img, ix - 2, iy - 2, iw + 4, ih + 4, pap)
            iname, icam = br["inset"]
            PH[iname].draw(img, ix, iy, iw, ih, ramp, icam, dev=prog(t, v, 0.4), t=t, grain=0.02)
            micro(img, br["inset_lab"], ix, iy + ih + 5, ink)


def scene_outro(img, t):
    ramp = RAMPS["rose"]
    ink, pap, spot = ramp[0], ramp[4], SPOT["rose"]
    st = stepped(t)
    paper(img, ramp, 21)
    crop_marks(img, ink)
    folio(img, "BASICS Nº01", "P.08", ink, ramp[2])
    m = tmask("SOMMAIRE", FONT_DISP, fit("SOMMAIRE", FONT_DISP, W - 28, 60, -2), -2)
    put(img, m, 14, 64, ink, prog(t, 0.0, 0.3), "up")
    rows = [("01", "UNIQLO"), ("02", "BERSHKA"), ("03", "HUMAN WITH ATTITUDE"), ("04", None), ("05", None)]
    for k, (n, lab) in enumerate(rows):
        tk = 0.25 * BEAT + k * 0.5 * BEAT
        if st < tk:
            continue
        y = 124 + k * 24
        micro(img, n, 14, y + 4, spot)
        if lab:
            mm = tmask(lab, FONT_DISP, 17, -1)
            put(img, mm, 32, y, ink)
            ex = 32 + mm.shape[1] + 4
            micro(img, "P.%02d" % ((k + 1) * 2), W - 14 - micro_w("P.00"), y + 4, ink)
            for dx in range(ex, W - 14 - micro_w("P.00") - 4, 4):
                rect(img, dx, y + 10, 1, 1, ramp[2])
        else:                                                      # redacted: dithered ink bar
            bw = [118, 92][k - 3]
            m_ = thresh(32, y, bw, 14) < 0.62
            img[y:y + 14, 32:32 + bw][m_] = ink
            micro(img, "BIENTÔT", W - 14 - micro_w("BIENTÔT"), y + 4, spot)
        rect(img, 14, y + 19, W - 28, 1, ramp[3])
    if st >= 3 * BEAT:
        mm = tmask("la suite dans la partie 2.", FONT_ITAL, 22)
        put(img, mm, 14, 250, ink, prog(t, 3 * BEAT, 0.45))
    # contact sheet of the three heroes
    for k, b in enumerate(BRANDS):
        tk = 3.5 * BEAT + k * 0.5 * BEAT
        if st >= tk:
            x = 14 + k * 82
            name, c0, _ = b["hero"]
            rect(img, x + 2, 286 + 2, 74, 84, ink)
            PH[name].draw(img, x, 286, 74, 84, RAMPS[b["ramp"]], (c0[0], c0[1] - 0.05, 1.5),
                          dev=prog(t, tk, 0.35), t=t, grain=0.02)
            micro(img, b["num"], x + 3, 286 + 75, RAMPS[b["ramp"]][4])
    if st >= 5 * BEAT:
        m = tmask("ABONNE-TOI", FONT_DISP, 30, -1)
        put(img, m, 14, 382, ink, prog(t, 5 * BEAT, 0.3), "up")
        if st >= 5.5 * BEAT:
            rect(img, 14, 382 + m.shape[0] + 4, int(m.shape[1] * prog(t, 5.5 * BEAT, 0.3)), 3, spot)
            micro(img, "@", 14 + m.shape[1] + 8, 382 + 6, spot, sc=2)
    if st >= 6 * BEAT:
        micro(img, "TA PRÉFÉRÉE ? DIS-LE EN COMMENTAIRE.", 14, 424, ink, n=(st - 6 * BEAT) / 0.025)


def page(t, idx):
    img = np.zeros((H, W, 3), np.uint8)
    lt = t - STARTS[idx]
    if idx == 0:
        scene_cover(img, max(0.0, lt))
    elif idx <= 3:
        scene_brand(img, max(0.0, lt), BRANDS[idx - 1])
    else:
        scene_outro(img, max(0.0, lt))
    return img


def frame(t):
    idx = max(i for i, s in enumerate(STARTS) if t >= s - SLIDE) if t >= 0 else 0
    if idx > 0 and t < STARTS[idx]:                              # page turn in progress
        old = page(t, idx - 1)
        new = page(t, idx)
        p = ease((stepped(t - (STARTS[idx] - SLIDE)) + 1 / STEP) / SLIDE)
        x = int(W * (1 - p))
        img = old
        ink = np.array(RAMPS["rose"][0], np.uint8)
        if x > 0:
            m = thresh(0, 0, min(10, x), H) < 0.5
            img[:, max(0, x - 10):x][m[:, :min(10, x)]] = ink
        img[:, x:] = new[:, :W - x]
    else:
        img = page(t, idx)
    big = np.repeat(np.repeat(img, S, 0), S, 1)
    return big


# ── audio: lo-fi beat + 8-bit lead + SFX ─────────────────────────────────────
SR = 44100


def env(n, a=0.002, d=0.1):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / d)


def add(buf, sig, t, g=1.0):
    i = int(round(t * SR))
    if i >= len(buf) or i < 0:
        return
    sig = sig[:len(buf) - i]
    buf[i:i + len(sig)] += sig * g


def lowpass(x, a):
    a = np.broadcast_to(np.asarray(a, np.float64), x.shape)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def note(m):
    return 440 * 2 ** ((m - 69) / 12)


def rhodes(f, dur, vel=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    wob = 1 + 0.0025 * np.sin(2 * np.pi * 0.55 * t)                  # tape wow
    ph = 2 * np.pi * f * np.cumsum(wob) / SR
    idx = 0.4 + 2.2 * np.exp(-t * 6)
    s = np.sin(ph + idx * np.sin(ph))
    s *= (1 + 0.12 * np.sin(2 * np.pi * 4.2 * t))
    return s * env(n, 0.004, 1.1) * vel


def reverb(x, secs=1.6, mix=0.22, seed=3):
    r = np.random.default_rng(seed)
    n = int(secs * SR)
    ir = r.normal(0, 1, n) * np.exp(-np.arange(n) / SR * 3.2)
    ir = lowpass(ir, 0.25)
    ir /= np.sqrt((ir ** 2).sum())
    L = 1 << int(np.ceil(np.log2(len(x) + n)))
    y = np.fft.irfft(np.fft.rfft(x, L) * np.fft.rfft(ir, L), L)[:len(x)]
    return x + y * mix


def synth_audio(path):
    n = int(DUR * SR) + SR
    r = np.random.default_rng(9)
    drums, keys, bass, lead, sfx = (np.zeros(n) for _ in range(5))
    sc = np.ones(n)                                                 # sidechain gain
    st16 = BEAT / 4
    kn = int(0.32 * SR)
    kt = np.arange(kn) / SR
    kick = np.sin(2 * np.pi * np.cumsum(46 + 95 * np.exp(-kt * 28)) / SR) * env(kn, 0.001, 0.16)
    kick[:120] += r.uniform(-0.6, 0.6, 120)
    sn = int(0.3 * SR)
    snare = lowpass(r.uniform(-1, 1, sn), 0.35) * env(sn, 0.001, 0.09) * 0.9
    snare += np.sin(2 * np.pi * 180 * np.arange(sn) / SR) * env(sn, 0.001, 0.05) * 0.5
    hn = int(0.06 * SR)
    hat = np.diff(r.uniform(-1, 1, hn + 1)) * env(hn, 0.0005, 0.014)
    chords = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60, 64], [48, 52, 55, 59]]
    roots = [41, 40, 38, 36]
    melody = [(0, 76), (3, 74), (6, 72), (8, 69), (10, 72), (14, 74),
              (16, 76), (19, 79), (22, 76), (24, 74), (27, 72), (30, 69)]
    for bar in range(10):
        t0 = bar * BAR
        for s in range(16):
            ts = t0 + s * st16 + (0.045 if s % 2 else 0)            # MPC-style swing
            if s in (0, 7, 10) or (bar % 2 and s == 15):
                add(drums, kick, ts, 1.0)
                i = int(ts * SR)
                sc[i:i + int(0.25 * SR)] = np.minimum(sc[i:i + int(0.25 * SR)],
                                                      1 - 0.45 * np.exp(-np.arange(min(int(0.25 * SR), n - i)) / SR * 14))
            if s in (4, 12):
                add(drums, snare, ts + 0.012, 0.75)
            if s % 2 == 0 or (s == 13 and bar % 2):
                add(drums, hat, ts, 0.16 + 0.08 * r.random())
        ch, rt = chords[bar % 4], roots[bar % 4]
        for off, vel, ln in ((0, 0.55, 2.3 * BEAT), (2.5 * BEAT, 0.38, 1.4 * BEAT)):
            for j, m in enumerate(ch):
                add(keys, rhodes(note(m), ln), t0 + off + j * 0.012, vel / len(ch) * 1.6)
        for s, ln in ((0, 5), (6, 3), (10, 4)):
            nn = int(st16 * ln * SR)
            tt = np.arange(nn) / SR
            f = note(rt)
            b_ = np.sin(2 * np.pi * f * tt) + 0.25 * np.sin(4 * np.pi * f * tt)
            add(bass, b_ * env(nn, 0.005, 0.6) * np.minimum(1, (nn - np.arange(nn)) / 400), t0 + s * st16, 0.5)
        if bar >= 2:                                                # 8-bit pulse lead from the first brand on
            for s, m in melody:
                if s // 16 == bar % 2:
                    nn = int(st16 * 2.2 * SR)
                    ph = (np.arange(nn) * note(m) / SR) % 1
                    add(lead, np.where(ph < 0.125, 1.0, -0.3) * env(nn, 0.003, 0.18), t0 + (s % 16) * st16, 0.07)
    drums = lowpass(drums, 0.55)
    keys = reverb(lowpass(keys, 0.3), mix=0.35)
    lead = reverb(lowpass(lead, 0.22), mix=0.45, seed=5)
    mus = drums * 0.9 + (keys * 0.8 + bass * 0.9) * sc + lead
    # vinyl: hiss + crackle
    mus += lowpass(r.normal(0, 1, n), 0.2) * 0.006
    for i in r.integers(0, n - 200, int(DUR * 9)):
        mus[i:i + 60] += r.uniform(-1, 1) * 0.08 * np.exp(-np.arange(60) / 8)
    # cold open: the filter opens over the first bar
    a = np.ones(n)
    k = int(BAR * SR)
    a[:k] = 0.06 + 0.94 * (np.arange(k) / k) ** 2
    mus = lowpass(mus, a)

    def shutter(t, g=0.5):
        for dt in (0.0, 0.045):
            c = r.uniform(-1, 1, 220) * np.exp(-np.arange(220) / 40)
            add(sfx, c, t + dt, g)

    def swoosh(t, g=0.35):
        ln = int(0.38 * SR)
        w = r.uniform(-1, 1, ln) * np.sin(np.linspace(0, np.pi, ln)) ** 3
        add(sfx, lowpass(w, np.linspace(0.05, 0.4, ln)), t, g)

    def tick(t, g=0.18, f=1800):
        nn = int(0.03 * SR)
        add(sfx, np.sin(2 * np.pi * f * np.arange(nn) / SR) * env(nn, 0.0005, 0.006), t, g)

    def slap(t):
        add(sfx, kick[:int(0.12 * SR)], t, 0.4)
        shutter(t, 0.35)

    for k in range(8):
        shutter(k * BEAT / 2, 0.25)
    slap(4 * BEAT)
    for s in STARTS[1:]:
        swoosh(s - SLIDE - 0.05)
    for b in BRANDS:
        t0 = b["t0"]
        shutter(t0 + 0.05, 0.3)
        swoosh(t0 + 4 * BEAT - SLIDE - 0.05, 0.22)
        for k in range(3):
            tick(t0 + (4.5 + 0.5 * k) * BEAT)
        shutter(t0 + 4.5 * BEAT, 0.45)
        for s_ in range(5):
            tick(t0 + 6.5 * BEAT + s_ * 0.08, 0.08, 2600)
    for k in range(5):
        tick(T_OUT + (0.25 + 0.5 * k) * BEAT, 0.14)
    for k in range(3):
        shutter(T_OUT + (3.5 + 0.5 * k) * BEAT, 0.3)

    out = mus + reverb(sfx, 0.8, 0.2, 7)
    out = out[:int(DUR * SR)]
    fade = int(1.2 * SR)
    out[-fade:] *= np.linspace(1, 0, fade) ** 1.5
    out = np.tanh(out * 1.1)
    out /= np.abs(out).max() + 1e-9
    pcm = (out * 0.89 * 32767).astype(np.int16)
    with wave.open(path, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(pcm.tobytes())


# ── main ─────────────────────────────────────────────────────────────────────
def main():
    args = sys.argv[1:]
    if "--preview" in args:
        i = args.index("--preview")
        ts = [float(x) for x in args[i + 1].split(",")]
        out = args[i + 2] if len(args) > i + 2 else "preview.png"
        tiles = [Image.fromarray(frame(t)).resize((540, 960), Image.NEAREST) for t in ts]
        sheet = Image.new("RGB", (len(tiles) * 550 - 10, 960), "black")
        for k, tl in enumerate(tiles):
            sheet.paste(tl, (k * 550, 0))
        sheet.save(out)
        print(out)
        return
    if "--audio" in args:
        synth_audio(args[args.index("--audio") + 1])
        return
    out = args[0] if args else os.path.join(HERE, "basics_pixel_9x16.mp4")
    wav = os.path.join(HERE, ".beat.wav")
    synth_audio(wav)
    nf = int(round(DUR * FPS))
    p = subprocess.Popen(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
                          "-s", f"{W * S}x{H * S}", "-r", str(FPS), "-i", "-", "-i", wav, "-map", "0:v", "-map", "1:a",
                          "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-pix_fmt", "yuv420p", "-tune", "animation",
                          "-c:a", "aac", "-b:a", "192k", "-t", f"{DUR:.3f}", "-movflags", "+faststart", out],
                         stdin=subprocess.PIPE)
    for f in range(nf):
        p.stdin.write(frame(f / FPS).tobytes())
    p.stdin.close()
    p.wait()
    os.remove(wav)
    print(out)


if __name__ == "__main__":
    main()

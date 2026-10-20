#!/usr/bin/env python3
"""Pixel-art 9:16 test video: « 5 marques indispensables pour tes basics » (part 1: Uniqlo, Bershka, Human With Attitude).

Everything is drawn at 270x480 in a limited palette, scaled x4 nearest-neighbour to 1080x1920.
The chiptune boom-bap beat and the SFX are synthesised here too, from the same timeline as the visuals.

usage: python3 render.py [out.mp4] [--preview t1,t2,...]
"""
import math, os, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageEnhance

HERE = os.path.dirname(os.path.abspath(__file__))
W, H, S, FPS = 270, 480, 4, 30
BPM = 100
BEAT = 60 / BPM                      # 0.6 s
DUR = 40 * BEAT                      # 24 s = 10 bars

# ── palette ──────────────────────────────────────────────────────────────────
PAL = dict(
    K=(10, 10, 18), N=(22, 18, 44), P=(52, 30, 86), M=(110, 38, 112), V=(170, 60, 150),
    PK=(255, 64, 129), O=(255, 140, 40), Y=(255, 214, 60), C=(48, 216, 240), W=(245, 244, 236),
    G1=(70, 70, 92), G2=(130, 130, 150), G3=(190, 190, 204), R=(232, 36, 44), BR=(96, 40, 40),
    BR2=(122, 54, 50), GR=(60, 200, 100),
)
P_ = {k: np.array(v, np.uint8) for k, v in PAL.items()}

# ── scenes (seconds) ─────────────────────────────────────────────────────────
T_HOOK = (0.0, 6 * BEAT)
BRANDS = [
    dict(key="u", name=["UNIQLO"], scale=4, sub="LE ROI DU BASIC", acc="R", origin="JAPON",
         stats=[("PETIT PRIX", 4), ("QUALITÉ", 4), ("STYLE", 3)],
         items=[("tee", "W", "T-SHIRT U"), ("tee", "C", "AIRISM"), ("long", "G3", "HEATTECH")],
         photo=("refs/look_tee_jean.webp", (480, 110, 1240, 1060))),
    dict(key="b", name=["BERSHKA"], scale=4, sub="LE SPOT TENDANCE", acc="C", origin="ESPAGNE",
         stats=[("PETIT PRIX", 5), ("QUALITÉ", 3), ("STYLE", 4)],
         items=[("jean", "G1", "JEAN BAGGY"), ("cargo", "G2", "CARGO"), ("hoodie", "W", "HOODIE")],
         photo=("refs/look_tee_jean.webp", (440, 900, 1240, 1900))),
    dict(key="h", name=["HUMAN WITH", "ATTITUDE"], scale=3, sub="LE STREETWEAR FR", acc="O", origin="FRANCE",
         stats=[("PETIT PRIX", 2), ("QUALITÉ", 5), ("STYLE", 5)],
         items=[("tee", "K", "TEE OVERSIZE"), ("hoodie", "G1", "HOODIE"), ("long", "W", "SWEAT")],
         photo=("refs/look_oversize.webp", (330, 790, 1210, 1890))),
]
for i, b in enumerate(BRANDS):
    b["t0"] = T_HOOK[1] + i * 9 * BEAT
    b["t1"] = b["t0"] + 9 * BEAT
T_OUT = (BRANDS[-1]["t1"], DUR)
CUTS = [b["t0"] for b in BRANDS] + [T_OUT[0]]
TR = 0.36                              # block-wipe transition length around each cut

# ── 5x7 pixel font ───────────────────────────────────────────────────────────
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
 '#': [".#.#.", "#####", ".#.#.", ".#.#.", ".#.#.", "#####", ".#.#."],
 '+': [".....", "..#..", "..#..", "#####", "..#..", "..#..", "....."],
 '>': [".....", "..#..", "...#.", "#####", "...#.", "..#..", "....."],
 '*': ["..#..", "..#..", "#####", ".###.", ".#.#.", "#...#", "....."],
 '@': [".....", ".#.#.", "#####", "#####", ".###.", "..#..", "....."],   # heart
}
ACC = {'É': ('E', ["...#.", "..#.."]), 'È': ('E', [".#...", "..#.."]), 'Ê': ('E', ["..#..", ".#.#."]),
       'À': ('A', [".#...", "..#.."])}
for g in F.values():
    assert len(g) == 7 and all(len(r) == 5 for r in g)


def tw(s, sc):
    return len(s) * 6 * sc - sc


def rect(img, x, y, w, h, col):
    x0, y0, x1, y1 = max(0, int(x)), max(0, int(y)), min(img.shape[1], int(x + w)), min(img.shape[0], int(y + h))
    if x1 > x0 and y1 > y0:
        img[y0:y1, x0:x1] = P_[col] if isinstance(col, str) else col


def glyph(img, ch, x, y, sc, col):
    rows, acc = (F[ACC[ch][0]], ACC[ch][1]) if ch in ACC else (F.get(ch, F['?']), None)
    for j, r in enumerate(rows):
        for i, c in enumerate(r):
            if c == '#':
                rect(img, x + i * sc, y + j * sc, sc, sc, col)
    if acc:
        for j, r in enumerate(acc):
            for i, c in enumerate(r):
                if c == '#':
                    rect(img, x + i * sc, y + (j - 3) * sc, sc, sc, col)


def text(img, s, x, y, sc=1, col="W", shadow=None, n=None, outline=None):
    """Draw s at (x,y); n = number of characters revealed so far. x='c' centres."""
    if x == 'c':
        x = (W - tw(s, sc)) // 2
    vis = s if n is None else s[:max(0, int(n))]
    for k, ch in enumerate(vis):
        gx = x + k * 6 * sc
        if outline:
            for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (1, 1), (-1, 1), (1, -1)):
                glyph(img, ch, gx + dx * max(1, sc // 2), y + dy * max(1, sc // 2), sc, outline)
        if shadow:
            glyph(img, ch, gx + max(1, sc // 2), y + max(1, sc // 2), sc, shadow)
        glyph(img, ch, gx, y, sc, col)
    return x


def box(img, x, y, w, h, fill, border="W", shadow="K"):
    if shadow:
        rect(img, x + 3, y + 3, w, h, shadow)
    rect(img, x, y, w, h, border)
    rect(img, x + 2, y + 2, w - 4, h - 4, fill)


# ── sprites ──────────────────────────────────────────────────────────────────
SPR = {
 'tee': ["...kkkk..kkkk...", ".kkfffkkkkfffkk.", "kffffffffffffffk", "kffffffffffffffk", "kfffkffffffkfffk",
         "kkkkkffffffkkkkk", "....kffffffk....", "....kffffffk....", "....kffffffk....", "....kffffffk....",
         "....kssffffk....", "....kkkkkkkk...."],
 'long': ["...kkkk..kkkk...", ".kkfffkkkkfffkk.", "kffffffffffffffk", "kfffkffffffkfffk", "kfffkffffffkfffk",
          "kfffkffffffkfffk", "kfffkffffffkfffk", "kfffkffffffkfffk", "kssskffffffksssk", "kkkkkffffffkkkkk",
          "....kssffffk....", "....kkkkkkkk...."],
 'hoodie': [".....kkkkkk.....", "....kffffffk....", "...kffkddkffk...", ".kkfffkddkfffkk.", "kffffffkkffffffk",
            "kffffffsfsfffffk", "kfffkffffffkfffk", "kfffkfssssfkfffk", "kfffkfsffsfkfffk", "kssskffffffksssk",
            "kkkkkssssssskkkk", "....kkkkkkkk...."],
 'jean': ["kkkkkkkkkkkkkk", "kssssssssssssk", "kffffffffffffk", "kffffffffffffk", "kfffffkkfffffk",
          "kffffk..kffffk", "kffffk..kffffk", "kffffk..kffffk", "kffffk..kffffk", "kffffk..kffffk",
          "kffffk..kffffk", "kssssk..kssssk", "kkkkkk..kkkkkk"],
 'cargo': ["kkkkkkkkkkkkkk", "kssssssssssssk", "kffffffffffffk", "kffffffffffffk", "kfffffkkfffffk",
           "kffffk..kffffk", "ksssfk..kfsssk", "ksfsfk..kfsfsk", "ksssfk..kfsssk", "kffffk..kffffk",
           "kffffk..kffffk", "kssssk..kssssk", "kkkkkk..kkkkkk"],
 'lock': ["..sssss..", ".s.....s.", ".s.....s.", "kkkkkkkkk", "kyyyyyyyk", "kyyykyyyk", "kyyykyyyk", "kyyyyyyyk",
          "kkkkkkkkk"],
}


def shade(c, f):
    return tuple(int(min(255, v * f)) for v in PAL[c])


def sprite(img, name, x, y, sc, fill):
    fc = PAL[fill]
    lum = sum(fc) / 3
    sc_col = shade(fill, 0.65) if lum > 60 else shade("G1", 1.0)
    cols = {'k': PAL['K'], 'f': fc, 's': sc_col, 'd': PAL['K'], 'y': PAL['Y']}
    if fill == "K":
        cols['k'] = PAL['G2']
        cols['d'] = PAL['G2']
    for j, r in enumerate(SPR[name]):
        for i, c in enumerate(r):
            if c in cols:
                rect(img, x + i * sc, y + j * sc, sc, sc, np.array(cols[c], np.uint8))


# ── backgrounds ──────────────────────────────────────────────────────────────
BAYER = np.array([[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]) / 16.0


def dither_grad(h, w, cols, y0=0):
    """Vertical gradient through `cols` with 4x4 ordered dithering between bands."""
    ys = (np.arange(h)[:, None] + y0) / max(1, h - 1) * (len(cols) - 1)
    band = np.floor(ys).astype(int)
    frac = ys - band
    th = np.tile(BAYER, (h // 4 + 1, w // 4 + 1))[:h, :w]
    idx = np.clip(band + (frac > th), 0, len(cols) - 1)
    lut = np.array([PAL[c] for c in cols], np.uint8)
    return lut[idx]


def rng(seed):
    return np.random.default_rng(seed)


STARS = [(int(x), int(y), int(p)) for x, y, p in zip(rng(1).integers(0, W, 60), rng(2).integers(0, 230, 60),
                                                     rng(3).integers(0, 100, 60))]
SKY = dither_grad(H, W, ["K", "N", "N", "P", "M", "V"])


def building_layer(img, t, speed, seed, base_y, hmin, hmax, body, win_on, win_rate, neon=None):
    off = t * speed
    x = -(off % 400)
    i0 = int(off // 400)
    for tile in (i0, i0 + 1, i0 + 2):
        r = rng(seed * 1000 + tile % 7)
        bx = x + (tile - i0) * 400
        while bx < x + (tile - i0 + 1) * 400:
            bw = int(r.integers(26, 52))
            bh = int(r.integers(hmin, hmax))
            top = base_y - bh
            rect(img, bx, top, bw - 2, bh, body)
            if r.random() < 0.4:                                   # rooftop details
                rect(img, bx + 6, top - 6, 8, 6, body)
                rect(img, bx + 9, top - 14, 1, 8, body)
            for wy in range(top + 6, base_y - 6, 8):
                for wx in range(int(bx) + 4, int(bx) + bw - 7, 7):
                    h_ = (wx * 73856093 ^ wy * 19349663 ^ tile * 83492791) & 0xffff
                    lit = (h_ % 100) < win_rate * 100
                    if lit and (h_ % 23 == 0) and int(t * 3 + h_) % 5 == 0:
                        lit = False                                  # flicker
                    rect(img, wx, wy, 3, 4, win_on if lit else body)
            if neon and r.random() < 0.35 and bh > 90:
                nc = neon[int(r.integers(0, len(neon)))]
                on = int(t * 4 + tile) % 7 != 0
                rect(img, bx + 4, top + 12, 3, 30, nc if on else "G1")
            bx += bw


def city(img, t, tint=None):
    img[:] = SKY
    for x, y, p in STARS:
        if (int(t * 6) + p) % 9 != 0:
            img[y, x] = P_["W"] if p % 3 else P_["G2"]
    # moon
    yy, xx = np.ogrid[:H, :W]
    m = (xx - 212) ** 2 + (yy - 70) ** 2 <= 15 ** 2
    img[m] = P_["W"]
    m2 = (xx - 218) ** 2 + (yy - 66) ** 2 <= 13 ** 2
    img[m & m2] = P_["G3"]
    building_layer(img, t, 4, 1, 330, 80, 200, "P", "M", 0.25)
    building_layer(img, t, 11, 2, 360, 60, 170, "N", "Y", 0.32, neon=["PK", "C", "O"])
    # street
    rect(img, 0, 360, W, 8, "G1")                                   # sidewalk
    rect(img, 0, 368, W, 112, "K")
    for k in range(-1, 8):                                          # lane dashes
        lx = int(k * 48 - (t * 70) % 48)
        rect(img, lx, 412, 24, 3, "Y")
    for k in range(-1, 5):                                          # street lamps
        lx = int(k * 90 - (t * 22) % 90)
        rect(img, lx, 296, 2, 64, "G2")
        rect(img, lx - 2, 294, 10, 3, "G2")
        rect(img, lx + 4, 297, 4, 2, "Y")
    # car passing every 4 s
    cp = (t % 4) / 4
    cx = int(-60 + cp * (W + 120))
    rect(img, cx, 378, 54, 12, "PK")
    rect(img, cx + 10, 370, 30, 9, "PK")
    rect(img, cx + 13, 372, 10, 6, "C")
    rect(img, cx + 26, 372, 11, 6, "C")
    rect(img, cx + 52, 381, 3, 4, "Y")
    for wx in (cx + 8, cx + 38):
        rect(img, wx, 388, 9, 7, "G1")
        rect(img, wx + 3, 391, 3, 2, "G3")


def brick_wall(img, t, acc, num, seed):
    img[:] = P_["K"]
    r = rng(seed)
    shades = r.integers(0, 3, (60, 30))
    drift = int(t * 3) % 2
    for row in range(0, 60):
        y = row * 9 - drift
        off = 0 if row % 2 == 0 else 9
        for col in range(-1, 16):
            x = col * 18 + off
            c = ["BR", "BR2", "BR"][shades[row % 60, (col + 1) % 30]]
            rect(img, x, y, 17, 8, c)
    # darken toward the top & bottom (spot light in the middle)
    yy = np.arange(H)[:, None]
    th = np.tile(BAYER, (H // 4 + 1, W // 4 + 1))[:H, :W]
    dark = (np.abs(yy - 230) / 260.0) > th + 0.18
    img[dark] = (img[dark] * 0.45).astype(np.uint8)
    # graffiti: huge outlined number + spray drips in the brand accent
    tmp = np.zeros_like(img)
    text(tmp, num, 'c', 150, 22, col=acc)
    msk = tmp.any(axis=2)
    edge = msk & ~(np.roll(msk, 2, 0) & np.roll(msk, -2, 0) & np.roll(msk, 2, 1) & np.roll(msk, -2, 1))
    fillm = msk & ~edge
    chk = (np.indices((H, W)).sum(0) % 2) == 0
    img[fillm & chk] = (img[fillm & chk] * 0.5 + P_[acc] * 0.25).astype(np.uint8)
    img[edge] = (img[edge] * 0.3 + P_[acc] * 0.6).astype(np.uint8)
    for k in range(9):                                             # drips
        dx = int(r.integers(30, 240))
        top = int(r.integers(160, 300))
        ln = int(r.integers(10, 40)) + int(min(1, t / 3) * 14)
        rect(img, dx, top, 2, ln, (img[top, dx] * 0.4 + P_[acc] * 0.5).astype(np.uint8))
    # sticker tags
    for k in range(5):
        sx, sy = int(r.integers(10, 220)), int(r.integers(20, 440))
        col = ["PK", "Y", "C", "W"][k % 4]
        rect(img, sx, sy, 20, 8, (P_[col] * 0.35).astype(np.uint8))


# ── photo cards ──────────────────────────────────────────────────────────────
PW, PH = 116, 145


def pixel_photo(path, crop, acc):
    im = Image.open(os.path.join(HERE, path)).convert("RGB").crop(crop)
    im = ImageEnhance.Contrast(im).enhance(1.1)
    a = np.asarray(im.resize((PW, PH), Image.LANCZOS)).astype(np.float32) / 255
    a = a ** 0.8                                                    # lift the blacks a touch (keep fabric folds)
    im = Image.fromarray((a * 255).astype(np.uint8))
    q = np.asarray(im.quantize(12, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).convert("RGB")).copy()
    lum = q.mean(axis=2)
    bright = lum > 175                                              # the white studio walls take the brand tint
    q[bright] = (q[bright] * 0.72 + P_[acc] * 0.28).astype(np.uint8)
    return q


def mosaic(a, b):
    if b <= 1:
        return a
    h, w = a.shape[:2]
    s = a[np.minimum(np.arange(0, h, b) + b // 2, h - 1)][:, np.minimum(np.arange(0, w, b) + b // 2, w - 1)]
    return np.repeat(np.repeat(s, b, 0), b, 1)[:h, :w]


# ── helpers ──────────────────────────────────────────────────────────────────
def ease(x):
    x = min(1, max(0, x))
    return 1 - (1 - x) ** 3


def pop(t, t0, d=0.18):
    """0→1 with a small overshoot, quantised to look like stepped sprite animation."""
    x = (t - t0) / d
    if x <= 0:
        return 0.0
    if x >= 1:
        return 1.0
    return round((1 + 0.25 * math.sin(x * math.pi)) * ease(x) * 8) / 8


def beat_bump(t):
    return 1 if (t % BEAT) < 0.08 else 0


def hud_bar(img, t):
    """Thin 'XP' progress bar at the top."""
    rect(img, 14, 30, W - 28, 5, "K")
    rect(img, 15, 31, int((W - 30) * t / DUR), 3, "Y")


# ── scenes ───────────────────────────────────────────────────────────────────
def scene_hook(img, t):
    city(img, t)
    b = beat_bump(t)
    if t > 0.1:
        text(img, "VOICI", 'c', 118, 2, "W", shadow="K", n=(t - 0.1) / 0.05)
    p = pop(t, 0.45)
    if p > 0:
        sc = max(1, int(round(4 * p)))
        text(img, "5 MARQUES", 'c', 138 - b + (4 - sc) * 3, sc, "Y", shadow="PK", outline="K")
    if t > 0.95:
        text(img, "INDISPENSABLES", 'c', 178, 3, "W", shadow="P", outline="K", n=(t - 0.95) / 0.045)
    if t > 1.75:
        o = int((1 - ease((t - 1.75) / 0.2)) * 40)
        bw = tw("POUR TES BASICS", 2) + 16
        bx = (W - bw) // 2 + o
        box(img, bx, 214, bw, 26, "PK", "W")
        text(img, "POUR TES BASICS", bx + 8, 220, 2, "W", shadow="M")
    if t > 2.35 and int(t * 4) % 2 == 0:
        text(img, "#STREETWEAR", 'c', 254, 1, "C", shadow="K")
    if t > 2.6:
        text(img, "PART 1/2", 'c', 268, 1, "G3", shadow="K")


def scene_brand(img, t, br, idx):
    acc = br["acc"]
    brick_wall(img, t, acc, "0%d" % (idx + 1), 40 + idx)
    b = beat_bump(t)
    # stage label
    if t > 0.1:
        o = int((1 - ease((t - 0.1) / 0.2)) * -120)
        lab = "STAGE 0%d/05" % (idx + 1)
        box(img, 14 + o, 44, tw(lab, 1) + 12, 15, "K", acc, shadow=None)
        text(img, lab, 20 + o, 48, 1, "W")
    # brand name, letter by letter pop
    sc = br["scale"]
    lines = br["name"]
    lh = 7 * sc + 6
    y0 = 66 + (2 * (7 * 3 + 6) - len(lines) * lh) // 2
    k = 0
    for li, ln in enumerate(lines):
        x0 = (W - tw(ln, sc)) // 2
        for ci, ch in enumerate(ln):
            p = pop(t, 0.3 + k * 0.045, 0.14)
            k += 1
            if p <= 0 or ch == ' ':
                continue
            dy = int((1 - p) * -10) - b
            glyph(img, ch, x0 + ci * 6 * sc + sc, y0 + li * lh + sc + dy, sc, "K")
            glyph(img, ch, x0 + ci * 6 * sc + 1, y0 + li * lh + 1 + dy, sc, acc)
            glyph(img, ch, x0 + ci * 6 * sc, y0 + li * lh + dy, sc, "W")
    # subtitle typed
    if t > 0.95:
        text(img, br["sub"], 'c', 124, 2, acc, shadow="K", n=(t - 0.95) / 0.035)
    # photo card with mosaic resolve
    if t > 1.2:
        x, y = 14, 146
        o = int((1 - ease((t - 1.2) / 0.25)) * 30)
        box(img, x, y + o, PW + 8, PH + 22, "W", "W")
        bl = [16, 12, 8, 6, 4, 3, 2, 1][min(7, int((t - 1.2) / 0.07))]
        img[y + o + 4:y + o + 4 + PH, x + 4:x + 4 + PW] = mosaic(br["img"], bl)
        text(img, "LOOK 0%d" % (idx + 1), x + 6, y + o + PH + 9, 1, "K")
        if int(t * 2) % 2 == 0:
            rect(img, x + PW - 6, y + o + PH + 9, 6, 7, "R")              # REC dot
    # item column
    for k, (spr, col, lab) in enumerate(br["items"]):
        tk = 1.85 + k * 0.32
        p = pop(t, tk)
        if p <= 0:
            continue
        cx, cy = 146, 150 + k * 54
        s = 2 if p >= 1 else 1
        box(img, cx, cy, 82, 48, "N", acc if p >= 1 else "W", shadow="K")
        sw = len(SPR[spr][0]) * s
        sprite(img, spr, cx + (82 - sw) // 2, cy + 6 + (1 if (int(t / BEAT) + k) % 2 else 0), s, col)
        text(img, lab, cx + (82 - tw(lab, 1)) // 2, cy + 37, 1, "W")
    # stats panel
    if t > 2.85:
        o = int((1 - ease((t - 2.85) / 0.2)) * 80)
        x, y = 14, 324 + o
        box(img, x, y, 214, 76, "K", "W")
        for k, (lab, val) in enumerate(br["stats"]):
            ry = y + 8 + k * 17
            text(img, lab, x + 8, ry + 1, 1, "G3")
            fill_t = 3.05 + k * 0.38
            nseg = int(min(val, max(0, (t - fill_t) / 0.07)))
            for s_ in range(5):
                c = acc if s_ < nseg else "G1"
                rect(img, x + 92 + s_ * 22, ry, 19, 9, c)
                if s_ < nseg:
                    rect(img, x + 92 + s_ * 22, ry, 19, 2, "W")
        if t > 4.25:
            text(img, "ORIGINE: " + br["origin"], x + 8, y + 61, 1, "Y", n=(t - 4.25) / 0.03)


def scene_outro(img, t):
    city(img, t + 30)
    rect(img, 0, 96, W, 264, "K")                                    # dim band behind the UI
    text(img, "INVENTAIRE", 'c', 104, 3, "Y", shadow="PK", n=(t - 0.05) / 0.04)
    text(img, "3/5 DEBLOQUÉS", 'c', 132, 1, "W", n=(t - 0.45) / 0.03)
    slots = [(b["items"][0][0], b["items"][0][1], b["acc"], lab) for b, lab in
             zip(BRANDS, ["UNIQLO", "BERSHKA", "HWA"])] + [None, None]
    for k, sl in enumerate(slots):
        p = pop(t, 0.5 + k * 0.16)
        if p <= 0:
            continue
        x, y = 15 + k * 49, 150
        box(img, x, y, 44, 54, "N" if sl else "K", sl[2] if sl else "G1")
        if sl:
            sprite(img, sl[0], x + (44 - len(SPR[sl[0]][0]) * 2) // 2, y + 6, 2, sl[1])
            text(img, sl[3], x + (44 - tw(sl[3], 1)) // 2, y + 42, 1, "W")
        else:
            sprite(img, "lock", x + 13, y + 10, 2, "Y")
            if int(t * 3 + k) % 2:
                text(img, "?", x + 19, y + 38, 1, "Y")
    if t > 1.45:
        text(img, "PARTIE 2", 'c', 222 - beat_bump(t), 4, "W", shadow="PK", n=(t - 1.45) / 0.05)
    if t > 1.95:
        text(img, "> 2 MARQUES EN PLUS", 'c', 260, 2, "C", n=(t - 1.95) / 0.03)
    if t > 2.5:
        bw = tw("ABONNE-TOI @", 2) + 16
        bx = (W - bw) // 2
        on = int(t * 4) % 2 == 0
        box(img, bx, 300, bw, 26, "PK" if on else "M", "W")
        text(img, "ABONNE-TOI @", bx + 8, 306, 2, "W")
    if t > 3.0:
        text(img, "TA PRÉFÉRÉE ? EN COMMENTAIRE", 'c', 340, 1, "Y", shadow="K", n=(t - 3.0) / 0.025)


# ── transitions & post ───────────────────────────────────────────────────────
def wipe(img, t):
    for c in CUTS:
        d = t - c
        if abs(d) < TR / 2:
            prog = (d + TR / 2) / TR                              # 0..1 across the cut
            cover = 1 - abs(prog * 2 - 1)                         # 0→1→0
            nb = 15
            for by in range(0, H, nb):
                for bx in range(0, W, nb):
                    order = (bx / W * 0.5 + by / H * 0.5)
                    if order < cover * 1.25 - 0.1:
                        rect(img, bx, by, nb, nb, "Y" if (bx // nb + by // nb) % 2 else "PK")
            if cover > 0.3:                                       # glitch slices
                r = rng(int(t * 100))
                for _ in range(6):
                    y = int(r.integers(0, H - 8))
                    h = int(r.integers(2, 8))
                    img[y:y + h] = np.roll(img[y:y + h], int(r.integers(-20, 20)), axis=1)


def frame(t):
    img = np.zeros((H, W, 3), np.uint8)
    if t < T_HOOK[1]:
        scene_hook(img, t - T_HOOK[0])
    elif t < T_OUT[0]:
        i = min(2, int((t - T_HOOK[1]) // (9 * BEAT)))
        scene_brand(img, t - BRANDS[i]["t0"], BRANDS[i], i)
    else:
        scene_outro(img, t - T_OUT[0])
    hud_bar(img, t)
    wipe(img, t)
    big = np.repeat(np.repeat(img, S, 0), S, 1)
    big[S - 1::S] = (big[S - 1::S] * 0.86).astype(np.uint8)       # soft CRT scanlines
    return big


# ── audio: chiptune boom-bap + SFX ──────────────────────────────────────────
SR = 44100


def env(n, a=0.002, d=0.1):
    t = np.arange(n) / SR
    return np.minimum(1, t / a) * np.exp(-t / d)


def sq(f, n, duty=0.5):
    ph = (np.arange(n) * f / SR) % 1
    return np.where(ph < duty, 1.0, -1.0)


def tri(f, n):
    ph = (np.arange(n) * f / SR) % 1
    return 4 * np.abs(ph - 0.5) - 1


def add(buf, sig, t):
    i = int(t * SR)
    if i >= len(buf):
        return
    sig = sig[:len(buf) - i]
    buf[i:i + len(sig)] += sig


def lowpass(x, a):
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a * (x[i] - acc)
        y[i] = acc
    return y


def note(m):
    return 440 * 2 ** ((m - 69) / 12)


def synth_audio(path):
    n = int(DUR * SR) + SR
    mus = np.zeros(n)
    sfx = np.zeros(n)
    st = BEAT / 4
    r = rng(7)
    # drums
    kick_n = int(0.25 * SR)
    kt = np.arange(kick_n) / SR
    kick = np.sin(2 * np.pi * np.cumsum(50 + 110 * np.exp(-kt * 30)) / SR) * env(kick_n, 0.001, 0.12)
    snare = r.uniform(-1, 1, int(0.2 * SR)) * env(int(0.2 * SR), 0.001, 0.06) * 0.7
    snare += np.sin(2 * np.pi * 190 * np.arange(len(snare)) / SR) * env(len(snare), 0.001, 0.04) * 0.4
    hat = np.diff(r.uniform(-1, 1, int(0.05 * SR) + 1)) * env(int(0.05 * SR), 0.0005, 0.012) * 0.25
    ohat = np.diff(r.uniform(-1, 1, int(0.2 * SR) + 1)) * env(int(0.2 * SR), 0.0005, 0.07) * 0.2
    chords = [(57, [69, 72, 76, 79]), (53, [69, 72, 76, 77]), (50, [65, 69, 72, 74]), (52, [68, 71, 74, 76])]
    for bar in range(10):
        t0 = bar * 4 * BEAT
        intro = bar == 0
        for s in range(16):
            ts = t0 + s * st + (0.025 if s % 2 else 0)            # swing
            if not intro and s in (0, 7, 10):
                add(mus, kick * 0.9, ts)
            if not intro and s in (4, 12):
                add(mus, snare * 0.55, ts)
            if s % 2 == 0 and s != 14:
                add(mus, hat, ts)
            if s == 14:
                add(mus, ohat, ts)
        root, ch = chords[bar % 4]
        # bass (triangle, root + octave bounce)
        for s, off in ((0, 0), (6, 0), (10, 12), (12, 0)):
            ln = int(st * (3 if s != 10 else 2) * SR)
            add(mus, tri(note(root - 12 + off), ln) * env(ln, 0.003, 0.25) * 0.45, t0 + s * st)
        # pulse arpeggio
        for s in range(16):
            m = ch[(s * 3 + bar) % 4] + (12 if s % 8 == 7 else 0)
            ln = int(st * 0.9 * SR)
            add(mus, sq(note(m), ln, 0.25) * env(ln, 0.002, 0.07) * (0.07 if intro else 0.1), t0 + s * st)
    mus = lowpass(mus, 0.35)

    def blip(t, f0=880, f1=1320, d=0.07, v=0.12):
        ln = int(d * SR)
        f = np.linspace(f0, f1, ln)
        add(sfx, np.where((np.cumsum(f) / SR) % 1 < 0.5, 1.0, -1.0) * env(ln, 0.001, d / 2) * v, t)

    def coin(t, v=0.1):
        blip(t, 988, 988, 0.05, v)
        blip(t + 0.05, 1319, 1319, 0.16, v)

    def whoosh(t, v=0.25):
        ln = int(0.4 * SR)
        w = r.uniform(-1, 1, ln) * np.sin(np.linspace(0, np.pi, ln)) ** 2
        add(sfx, lowpass(w, 0.15) * v, t - 0.2)

    def powerup(t, base=72):
        for k, m in enumerate((0, 4, 7, 12, 16)):
            blip(t + k * 0.04, note(base + m), note(base + m), 0.05, 0.08)

    # hook
    powerup(0.45, 67)
    for k in range(14):
        blip(0.95 + k * 0.045, 660, 700, 0.03, 0.05)
    coin(1.75)
    for c in CUTS:
        whoosh(c)
    for idx, br in enumerate(BRANDS):
        t0 = br["t0"]
        blip(t0 + 0.1, 440, 880, 0.08, 0.08)
        powerup(t0 + 0.3, 72 + idx * 2)
        blip(t0 + 1.2, 300, 1200, 0.25, 0.08)
        for k in range(3):
            blip(t0 + 1.85 + k * 0.32, 1046, 1568, 0.06, 0.09)
        for k, (_, val) in enumerate(br["stats"]):
            for s in range(val):
                blip(t0 + 3.05 + k * 0.38 + s * 0.07, note(76 + s * 2), note(76 + s * 2), 0.04, 0.06)
        coin(t0 + 4.25)
    to = T_OUT[0]
    for k in range(5):
        blip(to + 0.5 + k * 0.16, 700 + k * 120, 900 + k * 120, 0.05, 0.08)
    powerup(to + 1.45, 79)
    coin(to + 2.5)
    out = mus * 0.9 + sfx
    out = out[:int(DUR * SR)]
    fade = int(0.6 * SR)
    out[-fade:] *= np.linspace(1, 0, fade)
    out = np.tanh(out * 1.3)
    out /= np.abs(out).max() + 1e-9
    pcm = (out * 0.89 * 32767).astype(np.int16)
    with wave.open(path, "wb") as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(SR)
        wf.writeframes(pcm.tobytes())


# ── main ─────────────────────────────────────────────────────────────────────
def main():
    for b in BRANDS:
        b["img"] = pixel_photo(*b["photo"], b["acc"])
    args = sys.argv[1:]
    if "--preview" in args:
        ts = [float(x) for x in args[args.index("--preview") + 1].split(",")]
        out = args[args.index("--preview") + 2] if len(args) > args.index("--preview") + 2 else "preview.png"
        tiles = [Image.fromarray(frame(t)).resize((270 * 2, 480 * 2), Image.NEAREST) for t in ts]
        sheet = Image.new("RGB", (len(tiles) * 550, 960), "black")
        for i, tl in enumerate(tiles):
            sheet.paste(tl, (i * 550, 0))
        sheet.save(out)
        print(out)
        return
    out = args[0] if args else os.path.join(HERE, "basics_pixel_9x16.mp4")
    wav = os.path.join(HERE, ".beat.wav")
    synth_audio(wav)
    nf = int(round(DUR * FPS))
    p = subprocess.Popen(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
                          "-s", f"{W * S}x{H * S}", "-r", str(FPS), "-i", "-", "-i", wav, "-map", "0:v", "-map", "1:a",
                          "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-tune", "animation",
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

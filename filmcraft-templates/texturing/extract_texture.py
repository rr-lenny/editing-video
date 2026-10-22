"""Extract the paper texture of the flattened PSD render into vector-ready runs (JSON) and a
simulated preview. Usage: extract.py <L1.png> <out dir>"""
import sys, json, numpy as np
from PIL import Image
from scipy import ndimage as nd
src, out = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(src).convert('RGB')).astype(np.float32) / 255
H, W, _ = im.shape
# remove the big text: replace its band with texture from just below
y0, y1 = 770, 1090
clean = im.copy()
clean[y0:y1] = im[y1 + 10:y1 + 10 + (y1 - y0)]
# blend the seams over 12 rows
for y in (y0, y1):
    for k in range(-6, 6):
        a = (k + 6) / 12
        clean[y + k] = clean[y + k]  # rows already continuous texture; keep simple
Image.fromarray((clean * 255).astype(np.uint8)).save(out + '/clean.png')
lumw = np.array([0.2126, 0.7152, 0.0722], np.float32)
S = 2  # work at half resolution
small = clean.reshape(H // S, S, W // S, S, 3).mean((1, 3))
lum = small @ lumw
low = nd.gaussian_filter(lum, 1.5)
hp = lum - low
res = {}
def runs(mask, scale):
    rr = []
    for y in range(mask.shape[0]):
        row = mask[y]
        d = np.diff(np.concatenate([[0], row.astype(np.int8), [0]]))
        st, en = np.where(d == 1)[0], np.where(d == -1)[0]
        for a, b in zip(st, en):
            rr.append([int(a) * scale, int(y) * scale, int(b - a) * scale, scale])
    return rr
for name, q, sign in (('light', 10, 1), ('dark', 10, -1)):
    lo, hi = np.percentile(hp, [q, 100 - q])
    m = hp > hi if sign > 0 else hp < lo
    res[name] = runs(m, S)
    print(name, len(res[name]))
# low-frequency blotches on a coarse grid
G = 24
coarse = (clean @ lumw)[: H // G * G, : W // G * G].reshape(H // G, G, W // G, G).mean((1, 3))
coarse = nd.gaussian_filter(coarse, 1.0)
dev = coarse - np.median(coarse)
for name, m in (('blotch_light', dev > 0.012), ('blotch_dark', dev < -0.012)):
    res[name] = runs(m, G)
    print(name, len(res[name]))
res['base'] = [float(v) for v in np.median(clean.reshape(-1, 3), 0)]
print('base', res['base'])
json.dump(res, open(out + '/texture.json', 'w'))
# preview simulation
sim = np.ones((H, W, 3), np.float32) * np.array(res['base'], np.float32)
def paint(rr, col, a):
    for x, y, w, h in rr:
        sim[y:y + h, x:x + w] = sim[y:y + h, x:x + w] * (1 - a) + np.array(col) * a
paint(res['light'], (1, 1, 1), 0.16)
paint(res['dark'], (0, 0, 0), 0.16)
Image.fromarray((np.clip(sim, 0, 1) * 255).astype(np.uint8)).save(out + '/sim.png')

/* scenes.js — IKIGAI, 30.7 s, 9:16 (1080×1920, 24 fps), on twos. Code only: no cut-outs, no photos.
 * DA (refs/: Even/Odd catalog film + 4 stills): printed zine / product catalog — cream grid paper, editorial type (Instrument Serif italic,
 * Inter Tight heavy, JetBrains Mono captions, Reenie Beanie handwriting, VT323 pixels), cobalt marker doodles drawn stroke by stroke and
 * boiling on twos, Win98 windows, selection boxes with blue handles, a pixel cursor, one signal red, torn paper + tape, print grain.
 * Every word follows the voice-over; each clause starts on its measured onset (19 speech chunks = 19 clauses):
 *   0.79 J'ai découvert une philosophie japonaise · 2.75 qui va changer ta perception du bonheur · 4.57 si tu as la volonté de vivre de ta création
 *   6.81 Ce principe · 7.77 c'est l'IKIGAI · 9.28 Elle repose sur 4 piliers fondamentaux
 *   11.44 Ce que tu aimes faire · 12.89 Ce en quoi tu es doué · 14.36 Ce dont le monde a besoin · 15.89 Et enfin, · 16.72 ce pour quoi tu es payé
 *   18.23 Cet équilibre permet de trouver ta direction · 20.28 remettre du sens à ta vie · 21.88 et de pouvoir pleinement · 23.04 t'épanouir dans tes projets créatifs
 *   24.89 N'hésite pas à enregistrer cette vidéo · 26.53 pour ne pas l'oublier · 27.72 et je te dis à très vite · 28.91 pour de nouvelles inspirations (voice ends 30.18)
 */
(function () {
  'use strict';
  const { W, H, clamp, lerp, prog, E } = ENG;
  const K = KIT, X = CLX, U = CLX._, DEG = Math.PI / 180;

  /* ---------- palette + type ---------- */
  const P = { paper: '#ECE6D8', ink: '#161514', cream: '#F4EFE4', cobalt: '#2536D9', red: '#D93A23', sage: '#5F7553', sageL: '#8FA37F', kraft: '#B8976A', kraftD: '#8E6E43', news: '#D8D2C3', grid: 'rgba(70,95,140,0.15)' };
  const F = { serif: '"Instrument Serif"', sans: '"Inter Tight"', mono: '"JetBrains Mono"', hand: '"Reenie Beanie"', pix: '"VT323"', jp: '"Noto Serif JP"' };
  const JP = '生き甲斐';

  /* ---------- copy: every on-screen word lives here ---------- */
  const COPY = {
    found: "j'ai découvert une", philo: 'philosophie', japan: 'JAPONAISE',
    change: 'qui va changer ta', percep: 'perception', du: 'du', bonheur: 'bonheur',
    will: 'si tu as la volonté de', live: 'vivre de ta', create: 'CRÉATION',
    principle: "ce principe, c'est", title: 'Ikigai', def: "生き甲斐 — n. raison d'être",
    rests: 'elle repose sur', pillars: '4 piliers', fond: 'FONDAMENTAUX',
    cards: [['ce que tu', 'aimes faire'], ['ce en quoi', 'tu es doué'], ['ce dont le monde', 'a besoin'], ['ce pour quoi', 'tu es payé']],
    finally: 'et enfin…', labels: ['AIMER', 'DOUÉ', 'MONDE', 'PAYÉ'],
    balance: 'cet équilibre', direction: 'trouver ta direction', sense: 'du sens à ta vie',
    fully: 'pleinement', bloom: "t'épanouir", projects: 'dans tes projets créatifs',
    dont: "n'hésite pas à", save1: 'enregistrer', save2: 'cette vidéo', file: 'ikigai.mp4', btn: 'Enregistrer', cancel: 'Annuler', done: '✓ enregistré', forget: "pour ne pas l'oublier",
    seeyou: 'et je te dis', soon: 'à très vite', newIns: 'pour de nouvelles', insp: 'inspirations', fin: '(fin)',
  };
  const T = { v1: 0.79, philo: 1.55, japan: 2.05, bonheur: 2.75, creation: 4.57, principle: 6.81, ikigai: 7.77, pillars: 9.28, c: [11.44, 12.89, 14.36, 15.89], paid: 16.72,
    venn: 18.23, sense: 20.28, push: [20.95, 21.86], red: 21.88, bloom: 23.04, save: 24.89, click: 25.92, forget: 26.53, end: 27.72, ins: 28.91, dur: 30.7 };
  K.setup({ bars: [T.v1, T.bonheur, T.creation, T.principle, T.ikigai, ...T.c, T.venn, T.red, T.save, T.end] });

  /* ---------- helpers ---------- */
  const q = (t) => Math.floor(t * 12 + 1e-6) / 12;
  const drawingIdx = (t, t0) => Math.floor((t - t0) * 12 + 1e-6);
  const BUFS = new Map();
  function buf(name, w = W, h = H) {
    let c = BUFS.get(name); if (!c) { c = document.createElement('canvas'); c.width = w; c.height = h; BUFS.set(name, c); }
    const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.filter = 'none'; x.clearRect(0, 0, c.width, c.height);
    return c;
  }
  const PAD = 170;
  function padBuf(name) { const c = buf(name, W + 2 * PAD, H + 2 * PAD), x = c.getContext('2d'); x.fillStyle = P.paper; x.fillRect(0, 0, c.width, c.height); x.translate(PAD, PAD); c.pad = PAD; return c; }
  const mkc = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const paperPat = (ctx, col = P.paper, seed = 3) => ctx.createPattern(CL.paper(col, seed, { tex: 1.1 }), 'repeat');
  async function zoomAbout(ctx, z, fx, fy, fn) { ctx.save(); ctx.translate(fx, fy); ctx.scale(z, z); ctx.translate(-fx, -fy); await fn(); ctx.restore(); }
  const drawLayer = (ctx, L) => ctx.drawImage(L, -L.bleed, -L.bleed, L.width / L.res, L.height / L.res);
  const rng = (s) => { let a = s >>> 0; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const SHD = { dx: 8, dy: 14, blur: 16, alpha: 0.32 };

  /* ---------- type ---------- */
  const fontOf = (o) => `${o.italic ? 'italic ' : ''}${o.w || 400} ${o.size}px ${o.font || F.sans}, ${F.jp}`;
  const MEAS = mkc(4, 4).getContext('2d');
  function measure(s, o) { MEAS.font = fontOf(o); MEAS.letterSpacing = `${o.ls || 0}px`; return MEAS.measureText(s).width; }
  function txt(ctx, s, x, y, o) {
    ctx.save(); ctx.font = fontOf(o); ctx.letterSpacing = `${o.ls || 0}px`; ctx.fillStyle = o.color || P.ink; ctx.textAlign = o.align || 'center'; ctx.textBaseline = 'alphabetic';
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); if (o.sc && o.sc !== 1) ctx.scale(o.sc, o.sc); ctx.fillText(s, 0, 0); ctx.restore();
  }
  // words appear one per `step` on twos; the newest word is 6 % bigger for one drawing
  function words(ctx, s, x, y, tq, t0, step, o) {
    if (tq < t0) return; const ws = s.split(' '), sp = Math.max(measure(' ', o), o.size * 0.26), wd = ws.map((w) => measure(w, o)), tot = wd.reduce((a, b) => a + b, 0) + sp * (ws.length - 1);
    let xx = o.align === 'left' ? x : x - tot / 2;
    ws.forEach((w, i) => { const ti = t0 + i * step; if (tq >= ti - 1e-6) txt(ctx, w, xx + wd[i] / 2, y, Object.assign({}, o, { align: 'center', sc: drawingIdx(tq, ti) === 0 ? 1.06 : 1 })); xx += wd[i] + sp; });
  }
  // handwriting: the line is uncovered left → right over `dur` (stepped on twos)
  function hand(ctx, s, x, y, tq, t0, dur, o) {
    if (tq < t0) return; const k = clamp((tq - t0 + 1 / 12) / dur), w = measure(s, o), x0 = x - w / 2;
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.translate(-x, -y);
    ctx.beginPath(); ctx.rect(x0 - 20, y - o.size * 1.2, (w + 40) * k, o.size * 1.8); ctx.clip(); txt(ctx, s, x0, y, Object.assign({}, o, { align: 'left', rot: 0 })); ctx.restore();
  }
  // pixel typing with a block caret
  function typed(ctx, s, x, y, tq, t0, cps, o) {
    if (tq < t0) return; const n = Math.min(s.length, Math.floor((tq - t0) * cps + 1)), w = measure(s, o), x0 = x - w / 2, sub = s.slice(0, n);
    txt(ctx, sub, x0, y, Object.assign({}, o, { align: 'left' }));
    if (n < s.length || Math.floor(tq * 2) % 2 === 0) { const cx = x0 + measure(sub, o) + 4; ctx.save(); ctx.fillStyle = o.color; ctx.fillRect(cx, y - o.size * 0.62, o.size * 0.42, o.size * 0.7); ctx.restore(); }
  }
  function header(ctx, n, label, col = P.ink) {
    const o = { font: F.mono, w: 500, size: 26, color: col, ls: 2 };
    txt(ctx, `(${String(n).padStart(3, '0')})`, 70, 112, Object.assign({}, o, { align: 'left' }));
    txt(ctx, label, W - 70, 112, Object.assign({}, o, { align: 'right' }));
    ctx.save(); ctx.fillStyle = col; ctx.fillRect(70, 132, W - 140, 2); ctx.restore();
    txt(ctx, `IKIGAI — ${JP}`, 70, H - 70, Object.assign({}, o, { size: 22, align: 'left' }));
    txt(ctx, `${n} / 9`, W - 70, H - 70, Object.assign({}, o, { size: 22, align: 'right' }));
  }

  /* ---------- marker doodles: strokes drawn on, boiling on twos ---------- */
  function densify(pts, step = 7) { const o = [pts[0]]; for (let i = 1; i < pts.length; i++) { const [a, b] = [pts[i - 1], pts[i]], d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(d / step)); for (let j = 1; j <= n; j++) o.push([lerp(a[0], b[0], j / n), lerp(a[1], b[1], j / n)]); } return o; }
  const DOOD = {
    burst: (r0, r1, n, seed) => { const r = rng(seed), p = []; for (let i = 0; i <= n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2, rr = (i % 2 ? r0 : r1) * (0.85 + r() * 0.3); p.push([Math.cos(a) * rr, Math.sin(a) * rr]); } return [p]; },
    loop: (rx, ry, turns, seed) => { const r = rng(seed), p = [], n = Math.ceil(60 * turns); for (let i = 0; i <= n; i++) { const a = (i / 60) * Math.PI * 2 - 2.2, w = 1 + (r() - 0.5) * 0.02 + i / n * 0.06; p.push([Math.cos(a) * rx * w, Math.sin(a) * ry * w]); } return [p]; },
    arrow: (x0, y0, x1, y1, bend) => { const p = [], mx = (x0 + x1) / 2 - (y1 - y0) * bend, my = (y0 + y1) / 2 + (x1 - x0) * bend; for (let i = 0; i <= 30; i++) { const u = i / 30; p.push([(1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * mx + u * u * x1, (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * my + u * u * y1]); }
      const a = Math.atan2(y1 - p[27][1], x1 - p[27][0]), L = 42; return [p, [[x1 + Math.cos(a + 2.6) * L, y1 + Math.sin(a + 2.6) * L], [x1, y1], [x1 + Math.cos(a - 2.6) * L, y1 + Math.sin(a - 2.6) * L]]]; },
    under: (w, seed) => { const r = rng(seed), p = []; for (let i = 0; i <= 24; i++) p.push([-w / 2 + (i / 24) * w, Math.sin(i * 0.9) * 6 + (r() - 0.5) * 4]); const q2 = []; for (let i = 0; i <= 16; i++) q2.push([w * 0.4 - (i / 16) * w * 0.75, 18 + Math.sin(i) * 4]); return [p, q2]; },
    heart: (s) => { const p = []; for (let i = 0; i <= 60; i++) { const a = (i / 60) * Math.PI * 2; p.push([16 * Math.pow(Math.sin(a), 3) * s / 17, -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * s / 17]); } return [p]; },
    star: (s) => { const p = []; for (let i = 0; i <= 5; i++) { const a = (-90 + i * 144) * DEG; p.push([Math.cos(a) * s, Math.sin(a) * s]); } return [p]; },
    globe: (s) => { const c = (rx, ry) => { const p = []; for (let i = 0; i <= 48; i++) { const a = (i / 48) * Math.PI * 2 - Math.PI / 2; p.push([Math.cos(a) * rx, Math.sin(a) * ry]); } return p; }; return [c(s, s), c(s * 0.42, s), [[-s, 0], [s, 0]], [[-s * 0.86, -s * 0.5], [s * 0.86, -s * 0.5]]]; },
    euro: (s) => { const p = []; for (let i = 0; i <= 40; i++) { const a = (45 + (i / 40) * 270) * DEG; p.push([Math.cos(a) * s + s * 0.2, Math.sin(a) * s]); } return [p, [[-s * 1.05, -s * 0.22], [s * 0.35, -s * 0.22]], [[-s * 1.05, s * 0.22], [s * 0.25, s * 0.22]]]; },
  };
  const iconStrokes = (i, s) => (i === 0 ? DOOD.heart(s) : i === 1 ? DOOD.star(s) : i === 2 ? DOOD.globe(s) : DOOD.euro(s));
  // strokes in local coords → drawn at (x,y) ×sc; revealed by length over `dur` from t0; jittered per drawing (3-drawing boil cycle)
  function marker(ctx, strokes, x, y, tq, t0, o = {}) {
    if (tq < t0) return;
    const sc = o.sc || 1, dur = o.dur ?? 0.33, k = clamp((tq - t0 + 1 / 12) / dur), S = strokes.map((s) => densify(s, 7 / sc));
    const lens = S.map((s) => { let L = 0; for (let i = 1; i < s.length; i++) L += Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]); return L; }), tot = lens.reduce((a, b) => a + b, 0);
    let left = tot * k; const r = rng((o.seed || 1) * 97 + (Math.floor(tq * 12 + 1e-6) % 3) * 13 + 7), j = (o.jit ?? 1.6) / sc;
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.scale(sc, sc); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const paths = [];
    S.forEach((s, si) => { if (left <= 0) return; const p = new Path2D(); let acc = 0; p.moveTo(s[0][0] + (r() - 0.5) * j, s[0][1] + (r() - 0.5) * j);
      for (let i = 1; i < s.length; i++) { const d = Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]); if (acc + d > left) break; acc += d; p.lineTo(s[i][0] + (r() - 0.5) * j, s[i][1] + (r() - 0.5) * j); }
      left -= lens[si]; paths.push(p); });
    ctx.strokeStyle = o.color || P.cobalt; ctx.globalAlpha = 0.93; ctx.lineWidth = (o.w || 10) / sc; paths.forEach((p) => ctx.stroke(p));
    ctx.globalAlpha = 0.35; ctx.lineWidth = (o.w || 10) * 0.45 / sc; ctx.translate(1.5 / sc, -1.2 / sc); paths.forEach((p) => ctx.stroke(p));
    ctx.restore();
  }

  /* ---------- UI pieces: selection box · cursor · Win98 window · tape ---------- */
  function selBox(ctx, s, cx, cy, tq, t0, o = {}) {
    if (tq < t0) return null; const fo = { font: F.sans, w: 800, size: o.size || 110, color: o.color || P.red, ls: -(o.size || 110) * 0.02 }, w = measure(s, fo) + fo.size * 0.5, h = fo.size * 1.12, sc = drawingIdx(tq, t0) === 0 ? 1.07 : 1;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(o.rot ?? -0.035); ctx.scale(sc, sc);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.18)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6; ctx.fillStyle = '#FBFAF6'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
    ctx.strokeStyle = P.cobalt; ctx.lineWidth = 2.5; ctx.strokeRect(-w / 2, -h / 2, w, h);
    txt(ctx, s, 0, fo.size * 0.34, fo);
    ctx.fillStyle = P.cobalt; for (const [hx, hy] of [[-w / 2, -h / 2], [w / 2, h / 2]]) { ctx.beginPath(); ctx.arc(hx, hy, 11, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore(); return { w, h, x: cx, y: cy };
  }
  const ARW = [[0, 0], [0, 34], [8, 27], [14, 40], [19, 38], [13, 25], [24, 25]];
  function cursor(ctx, x, y, o = {}) {
    const s = (o.size || 70) / 40 * (o.click ? 0.88 : 1); ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const p = new Path2D(); ARW.forEach(([a, b], i) => (i ? p.lineTo(a, b) : p.moveTo(a, b))); p.closePath();
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 6; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 4; ctx.fillStyle = '#FFFFFF'; ctx.fill(p); ctx.restore();
    ctx.lineWidth = 2.2; ctx.lineJoin = 'miter'; ctx.strokeStyle = '#000'; ctx.stroke(p); ctx.restore();
  }
  function bevel(ctx, x, y, w, h, inset) {
    ctx.fillStyle = '#C3C3C3'; ctx.fillRect(x, y, w, h);
    const [a, b] = inset ? ['#808080', '#FFFFFF'] : ['#FFFFFF', '#808080'];
    ctx.fillStyle = a; ctx.fillRect(x, y, w, 2); ctx.fillRect(x, y, 2, h); ctx.fillStyle = b; ctx.fillRect(x, y + h - 2, w, 2); ctx.fillRect(x + w - 2, y, 2, h);
    if (!inset) { ctx.fillStyle = '#0A0A0A'; ctx.fillRect(x, y + h, w + 1, 1.5); ctx.fillRect(x + w, y, 1.5, h + 1); }
  }
  // Win98 window; returns the content rect. o: menu (true), scroll (true)
  function win(ctx, x, y, w, h, title, o = {}) {
    ctx.save(); ctx.shadowColor = 'rgba(30,25,15,0.38)'; ctx.shadowBlur = 34; ctx.shadowOffsetX = 10; ctx.shadowOffsetY = 20; ctx.fillStyle = '#C3C3C3'; ctx.fillRect(x, y, w, h); ctx.restore();
    bevel(ctx, x, y, w, h, false);
    const g = ctx.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#0A246A'); g.addColorStop(1, '#A6CAF0'); ctx.fillStyle = g; ctx.fillRect(x + 6, y + 6, w - 12, 46);
    ctx.fillStyle = '#FFF'; ctx.fillRect(x + 16, y + 15, 24, 28); ctx.fillStyle = '#0A246A'; for (let i = 0; i < 4; i++) ctx.fillRect(x + 20, y + 21 + i * 5, 16, 2);
    txt(ctx, title, x + 52, y + 39, { font: F.sans, w: 700, size: 25, color: '#FFFFFF', align: 'left' });
    ['_', '□', '×'].forEach((gl, i) => { const bx = x + w - 12 - (3 - i) * 38 + (i === 2 ? 4 : 0); bevel(ctx, bx, y + 13, 34, 30, false); txt(ctx, gl, bx + 17, y + 37, { font: F.sans, w: 800, size: 24, color: '#000' }); });
    let cy = y + 58;
    if (o.menu !== false) { ['Fichier', 'Édition', 'Recherche', 'Aide'].reduce((xx, m) => { txt(ctx, m, xx, cy + 30, { font: F.sans, w: 500, size: 24, color: '#111', align: 'left' }); return xx + measure(m, { font: F.sans, w: 500, size: 24 }) + 30; }, x + 18); cy += 44; }
    const sb = o.scroll === false ? 0 : 30, cr = [x + 10, cy, w - 20 - sb, y + h - cy - 10 - sb];
    ctx.fillStyle = '#FFF'; ctx.fillRect(cr[0] - 2, cr[1] - 2, cr[2] + 4 + sb, cr[3] + 4 + sb);
    if (sb) { bevel(ctx, cr[0] + cr[2], cr[1], sb, cr[3], false); bevel(ctx, cr[0] + cr[2] + 3, cr[1] + 34, sb - 6, 120, false); bevel(ctx, cr[0], cr[1] + cr[3], cr[2], sb, false); bevel(ctx, cr[0] + 34, cr[1] + cr[3] + 3, 160, sb - 6, false); }
    return cr;
  }
  function tape(ctx, x, y, w, h, rot) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = 'rgba(246,242,230,0.62)'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.strokeStyle = 'rgba(120,110,90,0.18)'; ctx.lineWidth = 1; ctx.strokeRect(-w / 2, -h / 2, w, h); ctx.restore(); }
  // drop in 3 drawings from above (catalog pieces landing), then still
  const dropY = (tq, t0, from = -1400) => { const i = drawingIdx(tq, t0); return i < 0 ? null : [from, from * 0.32, 18, 0][Math.min(i, 3)]; };

  /* ---------- paper layers ---------- */
  const gridLayer = () => CL.layer('grid', async (x) => {
    x.fillStyle = paperPat(x, P.paper, 21); x.fillRect(-150, -150, W + 300, H + 300);
    x.strokeStyle = P.grid; x.lineWidth = 1.5; x.beginPath();
    for (let gx = 0; gx <= W; gx += 60) { x.moveTo(gx + 0.5, -150); x.lineTo(gx + 0.5, H + 150); }
    for (let gy = 0; gy <= H; gy += 60) { x.moveTo(-150, gy + 0.5); x.lineTo(W + 150, gy + 0.5); }
    x.stroke();
  });
  const redLayer = () => CL.layer('red', async (x) => {
    x.fillStyle = paperPat(x, P.red, 5); x.fillRect(-150, -150, W + 300, H + 300);
    CL.halftone(x, [-150, -150, W + 300, H + 300], 'rgba(120,20,10,0.16)', { cell: 13, angle: 30, r: [0.05, 0.38], grad: [0, 0, 0, H] });
  });
  const blissLayer = (w, h) => CL.layer('bliss', async (x) => { // the window picture: muted watercolour sky over torn sage hills
    x.drawImage(CL.watercolor(41, { w, h, tone: 0.55, clouds: 0.5, cloudY: [0.15, 0.4], base: '#8EAFCC', light: '#D5E2EA', deep: '#6E91B5', bloom: 0.3 }), 0, 0);
    await CL.piece(x, { circle: [w * 0.45, h + 1150, 1500] }, { color: P.sageL, brush: 0.4 }, { seed: 44, amp: 12, cache: false, shadow: { dx: 0, dy: -6, blur: 14, alpha: 0.2 } });
    await CL.piece(x, { circle: [w * 1.1, h + 1250, 1300] }, { color: P.sage, brush: 0.4 }, { seed: 45, amp: 12, cache: false, shadow: { dx: 0, dy: -6, blur: 14, alpha: 0.25 } });
  }, { bleed: 0 });

  /* ---------- warm-up ---------- */
  const TEAR = { y0: Math.round(H * 0.38), y1: Math.round(H * 0.62), seed: 5, flapW: 640 };
  let WARM = null;
  const warm = () => WARM || (WARM = (async () => {
    await Promise.all(['italic 400 100px "Instrument Serif"', '400 100px "Instrument Serif"', '400 100px "Reenie Beanie"', '400 100px "VT323"', '900 100px "Inter Tight"', '800 100px "Inter Tight"', '500 100px "JetBrains Mono"'].map((f) => document.fonts.load(f)));
    await document.fonts.load('700 100px "Noto Serif JP"', JP);
    await X.warm({ tear: TEAR });
  })());

  /* ======================================================================= transitions: a cream sheet slides over */
  const SHEETS = new Map();
  const sheetPath = (edges, seed) => { const k = edges.join('') + seed; if (!SHEETS.has(k)) SHEETS.set(k, CL.torn({ rect: [-170, -170, W + 340, H + 340], edges }, seed, { amp: 18, white: [3, 17], bite: 3 })); return SHEETS.get(k); };
  function drawSheet(ctx, cv, ox, oy, edges, seed, sh = [0, 14]) {
    const S = sheetPath(edges, seed);
    ctx.save(); ctx.translate(ox, oy);
    ctx.save(); ctx.shadowColor = 'rgba(30,25,15,0.45)'; ctx.shadowBlur = 34; ctx.shadowOffsetX = sh[0]; ctx.shadowOffsetY = sh[1]; ctx.fillStyle = paperPat(ctx, '#F7F3EA'); ctx.fill(S); ctx.restore();
    ctx.save(); ctx.clip(S.inner); ctx.drawImage(cv, -(cv.pad || 0), -(cv.pad || 0)); ctx.restore();
    ctx.restore();
  }
  async function wipe(ctx, t, t0, drawA, drawB, o) {
    const ks = [0.34, 0.74, 0.95], i = drawingIdx(t, t0);
    if (i >= ks.length || i < 0) { await drawB(ctx, t); return; }
    const k = ks[i], [dx, dy] = o.from, A = padBuf('wipeA'), B = padBuf('wipeB');
    await drawA(A.getContext('2d'), t); await drawB(B.getContext('2d'), t);
    const pa = 0.2 * k, sa = 1 + 0.05 * k;
    ctx.save(); ctx.translate(W / 2 - dx * W * pa, H / 2 - dy * H * pa); ctx.rotate((o.roll || 0) * k * DEG); ctx.scale(sa, sa); ctx.drawImage(A, -W / 2 - PAD, -H / 2 - PAD); ctx.restore();
    drawSheet(ctx, B, dx * (W + 340) * (1 - k), dy * (H + 340) * (1 - k), o.edges, o.seed || 3, [-dx * 22, -dy * 22 + 10]);
  }
  const WIPES = [{ from: [1, 0], edges: [0, 0, 0, 1], seed: 4, roll: -6 }, { from: [0, 1], edges: [1, 0, 0, 0], seed: 6, roll: 4 },
    { from: [-1, 0], edges: [0, 1, 0, 0], seed: 7, roll: 6 }, { from: [0, -1], edges: [0, 0, 1, 0], seed: 9, roll: -4 }];
  const wipeN = (i) => Object.assign({}, WIPES[i % 4], { seed: WIPES[i % 4].seed + 10 * Math.floor(i / 4) });

  /* ======================================================================= 0–2.75 · une philosophie japonaise (Notepad window) */
  const WN = { x: 100, y: 330, w: 880, h: 1100 };
  async function philoScene(ctx, t) {
    const tq = q(t);
    await zoomAbout(ctx, 1 + 0.025 * tq, W / 2, 880, async () => {
      drawLayer(ctx, await gridLayer()); header(ctx, 1, 'PHILOSOPHIE');
      const dy = dropY(tq, 0.25); if (dy == null) return;
      ctx.save(); ctx.translate(0, dy);
      const [cx, cy, cw, ch] = win(ctx, WN.x, WN.y, WN.w, WN.h, 'ikigai.txt — Bloc-notes');
      ctx.save(); ctx.beginPath(); ctx.rect(cx, cy, cw, ch); ctx.clip(); ctx.drawImage(await blissLayer(cw, ch), cx, cy);
      const mx = cx + cw / 2;
      if (tq >= T.philo - 2 / 12) { const s = CL.slap(tq, T.philo - 2 / 12, { from: 1.25, rot0: 0 }); await CL.piece(ctx, { circle: [0, 0, 175] }, { color: P.red, speck: 0.3 }, { seed: 61, amp: 8, shadow: SHD, x: mx, y: cy + 520, sc: s.s, px: 0, py: 0 }); }
      typed(ctx, COPY.found, mx, cy + 170, tq, T.v1, 22, { font: F.pix, size: 82, color: '#13245C' });
      words(ctx, COPY.philo, mx, cy + 580, tq, T.philo, 0.2, { font: F.serif, italic: true, size: 168, color: P.cream });
      words(ctx, COPY.japan, mx, cy + 700, tq, T.japan, 0.2, { font: F.sans, w: 800, size: 56, color: P.cream, ls: 18 });
      ctx.restore();
      const b = CL.bob(t, 2, 4); cursor(ctx, WN.x + WN.w - 70 + b.dx, WN.y + 40 + b.dy, { size: 92 });
      ctx.restore();
      txt(ctx, 'fig. 1 — une philosophie japonaise', W / 2, WN.y + WN.h + 120, { font: F.mono, w: 500, size: 24, color: P.ink, ls: 1 });
    });
  }

  /* ======================================================================= 2.75–4.57 · ta perception du bonheur */
  async function bonheurScene(ctx, t) {
    const tq = q(t), lt = Math.max(0, tq - T.bonheur);
    await zoomAbout(ctx, 1 + 0.03 * lt, W / 2, 900, async () => {
      drawLayer(ctx, await gridLayer()); header(ctx, 2, 'PERCEPTION');
      await CL.piece(ctx, [-430, -330, 860, 660], { color: P.news }, { seed: 71, amp: 10, shadow: SHD, x: W / 2, y: 880, spin: -2, px: 0, py: 0, news: { alpha: 0.42, angle: -2, color: '#2a2a2a' } });
      tape(ctx, 170, 560, 170, 46, -0.5); tape(ctx, 920, 1200, 170, 46, -0.4);
      words(ctx, COPY.change, W / 2, 470, tq, T.bonheur + 1 / 12, 0.12, { font: F.sans, w: 800, size: 74, color: P.ink, ls: -2 });
      words(ctx, COPY.percep, W / 2, 800, tq, 3.42, 0.2, { font: F.serif, italic: true, size: 200, color: P.cobalt });
      words(ctx, COPY.du, W / 2, 960, tq, 3.67, 0.2, { font: F.serif, size: 110, color: P.ink });
      const bx = selBox(ctx, COPY.bonheur, W / 2, 1210, tq, 3.75, { size: 150 });
      marker(ctx, DOOD.burst(70, 120, 9, 3), 900, 1050, tq, 4.0, { dur: 0.33, w: 7, seed: 3 });
      if (bx && tq >= 3.83) { const k = E.out3(prog(tq, 3.83, 4.08)); cursor(ctx, lerp(W + 60, W / 2 + bx.w / 2 - 20, k), lerp(1500, 1250, k), { size: 84, click: t >= 4.08 && t < 4.17 }); }
    });
  }

  /* ======================================================================= 4.57–6.81 · vivre de ta création */
  async function creaScene(ctx, t) {
    const tq = q(t), lt = Math.max(0, tq - T.creation);
    await zoomAbout(ctx, 1 + 0.03 * lt, W / 2, 1000, async () => {
      drawLayer(ctx, await gridLayer()); header(ctx, 3, 'CRÉATION');
      await CL.piece(ctx, [-420, -520, 840, 1040], { color: P.red, speck: 0.3 }, { seed: 81, amp: 12, shadow: SHD, x: W / 2, y: 1040, spin: 2, px: 0, py: 0, halftone: { color: 'rgba(120,20,10,0.18)', cell: 12, angle: 30, r: [0.04, 0.32], grad: [0, -520, 0, 520] } });
      tape(ctx, 180, 545, 190, 50, -0.55); tape(ctx, 905, 560, 190, 50, 0.5);
      hand(ctx, COPY.will, W / 2, 330, tq, T.creation + 1 / 12, 0.7, { font: F.hand, size: 104, color: P.ink });
      marker(ctx, DOOD.arrow(760, 380, 640, 600, 0.35), 0, 0, tq, 5.0, { dur: 0.33, w: 8, seed: 5 });
      words(ctx, COPY.live, W / 2, 880, tq, 5.4, 0.15, { font: F.serif, italic: true, size: 140, color: P.cream });
      words(ctx, COPY.create, W / 2, 1070, tq, 5.85, 0.2, { font: F.sans, w: 900, size: 150, color: P.cream, ls: -4 });
      marker(ctx, DOOD.under(640, 8), W / 2, 1130, tq, 6.1, { dur: 0.25, w: 9, color: P.cream, seed: 8 });
      txt(ctx, 'fig. 3 — vivre de sa création', W / 2, 1490, { font: F.mono, w: 500, size: 24, color: P.cream, ls: 1 });
    });
  }

  /* ======================================================================= 6.81–11.44 · IKIGAI + 4 piliers */
  const CARDS4 = [[165, 1640, -4], [405, 1620, 2], [675, 1640, -2], [915, 1620, 4]];
  async function ikigaiScene(ctx, t) {
    const tq = q(t), lt = Math.max(0, tq - T.principle);
    await zoomAbout(ctx, 1 + 0.018 * lt, W / 2, 800, async () => {
      drawLayer(ctx, await gridLayer()); header(ctx, 4, 'PRINCIPE');
      hand(ctx, COPY.principle, W / 2, 440, tq, T.principle + 1 / 12, 0.6, { font: F.hand, size: 110, color: P.cobalt });
      if (tq >= T.ikigai) { const i = drawingIdx(tq, T.ikigai), sc = [1.22, 1.06, 1][Math.min(i, 2)]; txt(ctx, COPY.title, W / 2, 790, { font: F.serif, size: 330, color: P.ink, sc, ls: -6 }); }
      if (tq >= 8.17) { const s = CL.slap(tq, 8.17, { from: 1.4, rot0: 8 });
        await CL.piece(ctx, [-70, -110, 140, 220], { color: P.red, speck: 0.3 }, { seed: 91, amp: 5, shadow: SHD, x: 915, y: 650, sc: s.s, spin: 6 + s.rot, px: 0, py: 0 });
        ctx.save(); ctx.translate(915, 650); ctx.rotate((6 + s.rot) * DEG); ctx.scale(s.s, s.s); [...JP].forEach((c, k) => txt(ctx, c, 0, -56 + k * 46, { font: F.jp, w: 700, size: 40, color: P.cream })); ctx.restore(); }
      if (tq >= 8.42) txt(ctx, COPY.def, W / 2, 900, { font: F.mono, w: 500, size: 30, color: P.ink, ls: 1 });
      words(ctx, COPY.rests, W / 2, 1150, tq, T.pillars + 1 / 12, 0.12, { font: F.sans, w: 800, size: 58, color: P.ink, ls: -1 });
      words(ctx, COPY.pillars, W / 2, 1290, tq, 9.6, 0.15, { font: F.serif, italic: true, size: 140, color: P.cobalt });
      words(ctx, COPY.fond, W / 2, 1380, tq, 10.0, 0.2, { font: F.sans, w: 800, size: 38, color: P.ink, ls: 14 });
      for (let i = 0; i < 4; i++) {
        const t0 = 10.17 + i * 2 / 12, dy = dropY(tq, t0, -900); if (dy == null) continue; const [x, y, rot] = CARDS4[i];
        await CL.piece(ctx, [-105, -135, 210, 270], { color: '#F7F3EA' }, { seed: 100 + i, amp: 5, shadow: SHD, x, y: y + dy, spin: rot, px: 0, py: 0 });
        txt(ctx, `0${i + 1}`, x - 75, y + dy - 95, { font: F.mono, w: 500, size: 22, color: P.ink, align: 'left' });
        marker(ctx, iconStrokes(i, 52), x, y + dy + 10, tq, t0 + 2 / 12, { dur: 0.25, w: 7, seed: 20 + i, color: i === 0 ? P.red : P.cobalt });
      }
    });
  }

  /* ======================================================================= 11.44–18.23 · the four pillars */
  const CC = [P.red, P.cobalt, P.sage, P.kraft], CT = [P.red, P.cobalt, P.sage, P.kraftD];
  async function cardScene(ctx, t, i) {
    const t0 = T.c[i], tq = q(t), lt = Math.max(0, tq - t0);
    await zoomAbout(ctx, 1 + 0.03 * lt, W / 2, 850, async () => {
      drawLayer(ctx, await gridLayer()); header(ctx, 5, `PILIER 0${i + 1} / 04`);
      txt(ctx, `0${i + 1}`, 70, 470, { font: F.serif, size: 300, color: P.ink, align: 'left', ls: -8 });
      await CL.piece(ctx, [-300, -300, 600, 600], { color: CC[i], speck: 0.25 }, { seed: 230 + i, amp: 12, shadow: SHD, x: 600, y: 860, spin: [-3, 2, -2, 3][i], px: 0, py: 0, halftone: { color: 'rgba(0,0,0,0.1)', cell: 12, angle: 30, r: [0.04, 0.3], grad: [0, -300, 0, 300] } });
      tape(ctx, 360, 580, 170, 48, -0.6); tape(ctx, 850, 1140, 170, 48, -0.5);
      marker(ctx, iconStrokes(i, 170), 600, 870, tq, t0 + 1 / 12, { dur: 0.42, w: 15, color: P.cream, seed: 40 + i });
      if (i === 3) hand(ctx, COPY.finally, 800, 330, tq, t0 + 1 / 12, 0.4, { font: F.hand, size: 100, color: P.cobalt, rot: -0.05 });
      const [a, b] = COPY.cards[i], st = i === 3 ? T.paid : t0 + 1 / 12;
      words(ctx, a, W / 2, 1330, tq, st, 0.13, { font: F.sans, w: 800, size: 74, color: P.ink, ls: -2 });
      words(ctx, b, W / 2, 1500, tq, st + a.split(' ').length * 0.13 + 0.05, 0.15, { font: F.serif, italic: true, size: 170, color: CT[i] });
    });
  }

  /* ======================================================================= 18.23–21.88 · équilibre → push into the red centre */
  const VC = { x: W / 2, y: 1010, d: 170, r: 250 };
  const VPOS = [[0, -1], [-1, 0], [1, 0], [0, 1]], VLBL = [[540, 640], [215, 1010], [865, 1010], [540, 1390]];
  async function vennDraw(ctx, t) {
    const tq = q(t);
    drawLayer(ctx, await gridLayer()); header(ctx, 6, 'ÉQUILIBRE');
    words(ctx, COPY.balance, W / 2, 330, tq, T.venn + 1 / 12, 0.2, { font: F.serif, italic: true, size: 150, color: P.ink });
    for (let i = 0; i < 4; i++) {
      const t0 = 18.5 + i * 2 / 12; if (tq < t0) continue; const [vx, vy] = VPOS[i], x = VC.x + vx * VC.d, y = VC.y + vy * VC.d;
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.3 * clamp((tq - t0 + 1 / 12) / 0.25); ctx.fillStyle = CC[i]; ctx.beginPath(); ctx.arc(x, y, VC.r, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      marker(ctx, DOOD.loop(VC.r, VC.r, 1.08, 50 + i), x, y, tq, t0, { dur: 0.25, w: 6, seed: 50 + i, color: P.ink });
      txt(ctx, COPY.labels[i], VLBL[i][0], VLBL[i][1], { font: F.mono, w: 500, size: 28, color: P.ink, ls: 4 });
    }
    selBox(ctx, COPY.direction, W / 2, 1585, tq, 19.25, { size: 66 });
    if (tq >= T.sense) { const s = CL.slap(tq, T.sense, { from: 1.5, rot0: 0 });
      await CL.piece(ctx, { circle: [0, 0, 95] }, { color: P.red, speck: 0.3 }, { seed: 61, amp: 6, shadow: SHD, x: VC.x, y: VC.y, sc: s.s, px: 0, py: 0 });
      txt(ctx, COPY.title, VC.x, VC.y + 16, { font: F.serif, italic: true, size: 50 * s.s, color: P.cream }); }
    hand(ctx, COPY.sense, W / 2, 1760, tq, T.sense + 1 / 12, 0.55, { font: F.hand, size: 100, color: P.cobalt });
  }
  async function vennScene(ctx, t) {
    const tq = q(t), pz = prog(tq, T.push[0], T.push[1]), e = pz * pz * pz, z = (1 + 0.015 * Math.max(0, tq - T.venn)) * Math.pow(26, e);
    if (95 * z > Math.hypot(W, H) * 0.62) { drawLayer(ctx, await redLayer()); return; } // the red centre fills the frame → red page
    ctx.save(); ctx.translate(VC.x, VC.y); ctx.scale(z, z); ctx.translate(-VC.x, -VC.y); await vennDraw(ctx, t); ctx.restore();
  }

  /* ======================================================================= 21.88–24.89 · pleinement t'épanouir (red page) */
  const RAYS = (() => { const s = []; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + 0.1, r0 = 345 + (i % 2) * 25, r1 = 430 + (i % 3) * 35; s.push([[Math.cos(a) * r0, Math.sin(a) * r0], [Math.cos(a) * r1, Math.sin(a) * r1]]); } return s; })();
  async function redScene(ctx, t) {
    const tq = q(t), lt = Math.max(0, tq - T.red);
    await zoomAbout(ctx, 1 + 0.02 * lt, W / 2, 1000, async () => {
      drawLayer(ctx, await redLayer());
      const o = { font: F.mono, w: 500, size: 26, color: P.cream, ls: 2 };
      txt(ctx, '(007)', 70, 112, Object.assign({}, o, { align: 'left' })); txt(ctx, 'ÉPANOUISSEMENT', W - 70, 112, Object.assign({}, o, { align: 'right' }));
      ctx.save(); ctx.fillStyle = P.cream; ctx.fillRect(70, 132, W - 140, 2); ctx.restore();
      words(ctx, COPY.fully, W / 2, 470, tq, T.red + 1 / 12, 0.2, { font: F.serif, italic: true, size: 170, color: P.cream });
      marker(ctx, RAYS, W / 2, 1010, tq, T.bloom, { dur: 0.42, w: 10, color: P.cream, seed: 70 });
      words(ctx, COPY.bloom, W / 2, 1060, tq, T.bloom + 1 / 12, 0.2, { font: F.sans, w: 900, size: 140, color: P.cream, ls: -4 });
      words(ctx, COPY.projects, W / 2, 1520, tq, 23.75, 0.12, { font: F.mono, w: 500, size: 36, color: P.cream, ls: 3 });
    });
  }

  /* ======================================================================= 24.89–27.72 · enregistre cette vidéo (save dialog) */
  const DW = { x: 110, y: 380, w: 860, h: 820 };
  async function saveScene(ctx, t) {
    const tq = q(t), lt = Math.max(0, tq - T.save);
    await zoomAbout(ctx, 1 + 0.02 * lt, W / 2, 800, async () => {
      drawLayer(ctx, await gridLayer()); header(ctx, 8, 'ENREGISTRER');
      const dy = dropY(tq, T.save + 1 / 12, -1300) ?? -2000;
      ctx.save(); ctx.translate(0, dy);
      const [cx, cy, cw, ch] = win(ctx, DW.x, DW.y, DW.w, DW.h, 'Enregistrer sous…', { menu: false, scroll: false }), mx = cx + cw / 2;
      ctx.fillStyle = '#F7F3EA'; ctx.fillRect(cx, cy, cw, ch);
      words(ctx, COPY.dont, mx, cy + 110, tq, T.save + 2 / 12, 0.12, { font: F.mono, w: 500, size: 38, color: P.ink, ls: 2 });
      words(ctx, COPY.save1, mx, cy + 280, tq, 25.2, 0.2, { font: F.serif, italic: true, size: 150, color: P.ink });
      words(ctx, COPY.save2, mx, cy + 390, tq, 25.45, 0.12, { font: F.sans, w: 800, size: 66, color: P.ink, ls: -2 });
      bevel(ctx, cx + 40, cy + 450, cw - 80, 64, true); ctx.fillStyle = '#FFF'; ctx.fillRect(cx + 43, cy + 453, cw - 86, 58);
      txt(ctx, `nom : ${COPY.file}`, cx + 64, cy + 494, { font: F.mono, w: 500, size: 28, color: P.ink, align: 'left' });
      const pressed = t >= T.click && t < T.click + 3 / 24, bw = 260, by = cy + 560, b1 = cx + cw - 40 - bw * 2 - 24, b2 = cx + cw - 40 - bw;
      bevel(ctx, b1, by, bw, 66, pressed); txt(ctx, COPY.btn, b1 + bw / 2 + (pressed ? 2 : 0), by + 44 + (pressed ? 2 : 0), { font: F.sans, w: 700, size: 28, color: '#000' });
      ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.strokeRect(b1 + 8, by + 8, bw - 16, 50); ctx.restore();
      bevel(ctx, b2, by, bw, 66, false); txt(ctx, COPY.cancel, b2 + bw / 2, by + 44, { font: F.sans, w: 700, size: 28, color: '#000' });
      if (tq >= T.click + 1 / 12) { const k = clamp((tq - T.click) / 0.5);
        ctx.fillStyle = '#0A246A'; for (let s = 0; s < Math.floor(k * 22); s++) ctx.fillRect(cx + 44 + s * 28, cy + 690, 22, 34);
        if (k >= 1) txt(ctx, COPY.done, cx + cw - 40, cy + 760, { font: F.mono, w: 500, size: 28, color: P.ink, align: 'right' }); }
      if (tq >= 25.5 && tq < 26.5) { const a = E.out3(prog(tq, 25.5, 25.84)), o2 = prog(tq, 26.1, 26.45); cursor(ctx, lerp(W + 80, b1 + bw * 0.62, a) + o2 * 500, lerp(1500, by + 40, a) + o2 * 300, { size: 84, click: pressed }); }
      ctx.restore();
      hand(ctx, COPY.forget, W / 2 + 40, 1440, tq, T.forget + 1 / 12, 0.55, { font: F.hand, size: 104, color: P.red, rot: -0.03 });
      marker(ctx, DOOD.arrow(250, 1470, 300, 1250, -0.4), 0, 0, tq, 26.9, { dur: 0.25, w: 8, color: P.red, seed: 9 });
    });
  }

  /* ======================================================================= 27.72–30.7 · tear → « à très vite » */
  function vnoise(seed) { const r = ENG.rng(seed * 7 + 3), N = 1024, v = new Float32Array(N); for (let i = 0; i < N; i++) v[i] = r() * 2 - 1; return (x) => { x = ((x % N) + N) % N; const i = Math.floor(x), f = x - i, s = f * f * (3 - 2 * f); return v[i] + (v[(i + 1) % N] - v[i]) * s; }; }
  function fbm(seed) { const a = vnoise(seed), b = vnoise(seed + 17), c = vnoise(seed + 29); return (x) => a(x) * 0.58 + b(x * 2.17 + 5.3) * 0.29 + c(x * 4.73 + 1.1) * 0.13; }
  const TEARDONE = (() => { // the completed tear, same geometry as CLX.tear's kit
    const { y0, y1, seed } = TEAR, st = 6, n = Math.ceil((W + 80) / st) + 1, nA = fbm(seed), nB = fbm(seed + 9), nC = vnoise(seed + 3), nD = vnoise(seed + 5), r = ENG.rng(seed), xs = [], top = [], bot = [], wt = [], wb = [];
    for (let i = 0; i < n; i++) { const x = -40 + i * st; xs.push(x); top.push(y0 + nA(x / 60) * 13 + (r() - 0.5) * 3); bot.push(y1 + nB(x / 60) * 13 + (r() - 0.5) * 3); wt.push(3 + 12 * Math.pow(clamp(0.5 + 0.8 * nC(x / 70)), 1.5) + r() * 1.5); wb.push(2 + 10 * Math.pow(clamp(0.5 + 0.8 * nD(x / 70)), 1.5) + r() * 1.5); }
    const R = new Path2D(), Ts = new Path2D(), tp = new Path2D(), bp = new Path2D(), m = n - 1;
    R.moveTo(xs[0], top[0]); for (let i = 1; i <= m; i++) R.lineTo(xs[i], top[i]); for (let i = m; i >= 0; i--) R.lineTo(xs[i], bot[i]); R.closePath();
    Ts.moveTo(xs[0], top[0] - 200); for (let i = 0; i <= m; i++) Ts.lineTo(xs[i], top[i]); Ts.lineTo(xs[m], top[m] - 200); Ts.closePath();
    for (let i = 0; i <= m; i++) i ? tp.lineTo(xs[i], top[i] - wt[i]) : tp.moveTo(xs[i], top[i] - wt[i]); for (let i = m; i >= 0; i--) tp.lineTo(xs[i], top[i]); tp.closePath();
    for (let i = 0; i <= m; i++) i ? bp.lineTo(xs[i], bot[i]) : bp.moveTo(xs[i], bot[i]); for (let i = m; i >= 0; i--) bp.lineTo(xs[i], bot[i] + wb[i]); bp.closePath();
    return { R, Ts, tp, bp };
  })();
  function tearDone(ctx, A, B) {
    const S = TEARDONE; ctx.drawImage(A, 0, 0);
    ctx.save(); ctx.clip(S.R); ctx.drawImage(B, 0, 0); ctx.shadowColor = 'rgba(0,0,0,0.42)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 7; ctx.fillStyle = '#000'; ctx.fill(S.Ts); ctx.restore();
    ctx.save(); ctx.fillStyle = U.pat(ctx, X.PAL.paper); ctx.fill(S.tp); ctx.fill(S.bp); ctx.strokeStyle = 'rgba(80,60,40,0.18)'; ctx.lineWidth = 1; ctx.stroke(S.tp); ctx.stroke(S.bp); ctx.restore();
  }
  const BANDY = (TEAR.y0 + TEAR.y1) / 2;
  async function bandUnder(c) {
    drawLayer(c, await redLayer());
    txt(c, COPY.seeyou, W / 2, BANDY - 95, { font: F.mono, w: 500, size: 32, color: P.cream, ls: 6 });
    txt(c, COPY.soon, W / 2, BANDY + 75, { font: F.serif, italic: true, size: 200, color: P.cream });
  }
  async function endScene(ctx, t) {
    const tq = q(t), z = 1 + 0.015 * Math.max(0, tq - 28.2);
    await zoomAbout(ctx, z, W / 2, BANDY, async () => {
      if (tq < 28.2) await X.tear(ctx, prog(tq, T.end - 1 / 12, 28.2), async (c) => saveScene(c, t), async (c) => bandUnder(c), TEAR);
      else { const A = buf('tover'); await saveScene(A.getContext('2d'), t); const B = buf('tunder'); await bandUnder(B.getContext('2d')); tearDone(ctx, A, B); }
      const s = CL.slap(tq, T.ins, { from: 1.25, rot0: 3 });
      if (s.on) await CL.piece(ctx, [-560, -330, 1120, 660], { color: '#F7F3EA' }, { seed: 500, amp: 10, shadow: { dx: 10, dy: -12, blur: 24, alpha: 0.4 }, x: W / 2, y: 1590, sc: s.s, spin: 1 + s.rot, px: 0, py: 0 });
      words(ctx, COPY.newIns, W / 2, 1420, tq, T.ins + 1 / 12, 0.12, { font: F.sans, w: 800, size: 66, color: P.ink, ls: -2 });
      const bx = selBox(ctx, COPY.insp, W / 2, 1580, tq, 29.3, { size: 120 });
      marker(ctx, DOOD.burst(60, 105, 9, 11), 960, 1330, tq, 29.6, { dur: 0.33, w: 7, seed: 11 });
      if (bx && tq >= 29.5) { const k = E.out3(prog(tq, 29.5, 29.85)); cursor(ctx, lerp(W + 60, W / 2 + bx.w / 2 - 30, k), lerp(1860, 1625, k), { size: 84 }); }
      if (tq >= 30.0) txt(ctx, COPY.fin, W / 2, 1810, { font: F.mono, w: 500, size: 26, color: P.ink, ls: 2 });
    });
  }

  /* ======================================================================= timeline */
  const cuts = [];
  const Cut = (t0, t1, draw) => cuts.push({ t0, t1, draw: async (ctx, t) => {
    await warm();
    const z = K.punch(q(t)); ctx.fillStyle = P.paper; ctx.fillRect(0, 0, W, H);
    await zoomAbout(ctx, z, W / 2, H / 2, () => draw(ctx, t));
  } });
  const card = (i) => (c, t) => cardScene(c, t, i);
  const SEQ = [[0, philoScene], [T.bonheur, bonheurScene], [T.creation, creaScene], [T.principle, ikigaiScene], [T.c[0], card(0)], [T.c[1], card(1)], [T.c[2], card(2)], [T.c[3], card(3)], [T.venn, vennScene]];
  SEQ.forEach(([t0, fn], i) => {
    const t1 = i + 1 < SEQ.length ? SEQ[i + 1][0] : T.red;
    if (i === 0) Cut(t0, t1, fn); else Cut(t0, t1, (ctx, t) => wipe(ctx, t, t0, SEQ[i - 1][1], fn, wipeN(i - 1)));
  });
  Cut(T.red, T.save, redScene);
  Cut(T.save, T.end, (ctx, t) => wipe(ctx, t, T.save, redScene, saveScene, wipeN(1)));
  Cut(T.end, T.dur, endScene);

  window.SCENES = { duration: T.dur, cuts, overlay: async (ctx, t) => { CL.printGrain(ctx, t, 0.06); } };
  window.COPY = COPY;
})();

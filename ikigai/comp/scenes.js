/* scenes.js — IKIGAI, 30.7 s, 9:16 (1080×1920, 24 fps), torn-paper collage on twos. Code only: no cut-outs, no photos.
 * Picture is cut to the voice-over phrases (audio/voix-off.mp3, silencedetect −35 dB / 0.3 s):
 *   0.79 · 4.56 · 6.81 · 9.28 · 11.44 · 12.89 · 14.36 · 15.88 · 18.22 · 21.87 · 24.82 · 27.72 (voice ends 30.19)
 *   0–4.56 IKIGAI title drop + burst · 4.56 / 6.81 / 9.28 / 11.44 the four circles (torn sheet wipes) · 12.89 the circles assemble into the Venn
 *   14.36 PASSION / MISSION / VOCATION / PROFESSION · 15.88 IKIGAI star in the centre · 16.5 push into it → paper iris → kaleidoscope 18.22
 *   21.87 hex hole → TROUVE TON IKIGAI · 24.82 the four icons slap in · 27.72 page tear → ikigai logo band + TA RAISON D'ÊTRE
 */
(function () {
  'use strict';
  const { W, H, clamp, lerp, prog, E } = ENG;
  const K = KIT, X = CLX, U = CLX._, C = CL.C, DEG = Math.PI / 180;

  /* ---------- copy: every on-screen word lives here ---------- */
  const COPY = {
    title: ['IKIGAI'],
    meaning: "LA RAISON D'ÊTRE ✦",
    cards: [['CE QUE', 'TU AIMES'], ['CE EN QUOI', 'TU ES DOUÉ'], ['CE DONT', 'LE MONDE', 'A BESOIN'], ['CE POUR QUOI', 'TU PEUX', 'ÊTRE PAYÉ']],
    inter: ['PASSION', 'MISSION', 'VOCATION', 'PROFESSION'],
    center: 'IKIGAI',
    find: ['TROUVE', 'TON IKIGAI'],
    logo: 'ikigai',
    end: ['TA RAISON', "D'ÊTRE"],
  };
  const T = { v1: 0.79, c: [4.56, 6.81, 9.28, 11.44], venn: 12.89, inter: 14.36, ik: 15.88, push: [16.5, 18.2], kal: 18.22, find: 21.87, icons: 24.82, end: 27.72, dur: 30.7 };
  K.setup({ bars: [T.v1, ...T.c, T.venn, T.ik, T.find, T.end] });

  /* ---------- helpers (as the 16:9 template) ---------- */
  const q = (t) => Math.floor(t * 12 + 1e-6) / 12;
  const drawingIdx = (t, t0) => Math.floor((t - t0) * 12 + 1e-6);
  const BUFS = new Map();
  function buf(name, w = W, h = H) {
    let c = BUFS.get(name); if (!c) { c = document.createElement('canvas'); c.width = w; c.height = h; BUFS.set(name, c); }
    const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; x.filter = 'none'; x.clearRect(0, 0, c.width, c.height);
    return c;
  }
  const PAD = 170;
  function padBuf(name) { const c = buf(name, W + 2 * PAD, H + 2 * PAD), x = c.getContext('2d'); x.fillStyle = '#FBF8F1'; x.fillRect(0, 0, c.width, c.height); x.translate(PAD, PAD); c.pad = PAD; return c; }
  const ONCE = new Map();
  const once = (k, fn) => { if (!ONCE.has(k)) ONCE.set(k, fn()); return ONCE.get(k); };
  const mkc = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const paperPat = (ctx) => ctx.createPattern(CL.paper(C.paper, 3, { tex: 0.8 }), 'repeat');
  const pc = (x, shape, fill, o) => CL.piece(x, shape, fill, Object.assign({ cache: false }, o));
  async function zoomAbout(ctx, z, fx, fy, fn) { ctx.save(); ctx.translate(fx, fy); ctx.scale(z, z); ctx.translate(-fx, -fy); await fn(); ctx.restore(); }
  const drawLayer = (ctx, L) => ctx.drawImage(L, -L.bleed, -L.bleed, L.width / L.res, L.height / L.res);

  /* ---------- paper icons (shapes centred on 0,0; move them with x / y) ---------- */
  const heartPts = (r) => { const p = []; for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; p.push([16 * Math.pow(Math.sin(a), 3) * r / 17, -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * r / 17 - r * 0.1, 1]); } return p; };
  const glyph = (ch, col, font, k = 1.1) => async (x, b) => { const s = b[3] * 0.62 * k; x.font = `400 ${s}px ${font}`; x.fillStyle = col; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(ch, b[0] + b[2] / 2, b[1] + b[3] / 2 + s * 0.06); };
  const LAND = async (x, b) => { // globe: two torn olive continents on cyan
    const [bx, by, bw, bh] = b;
    await pc(x, { poly: [[bx + bw * 0.18, by + bh * 0.3, 1], [bx + bw * 0.5, by + bh * 0.18, 1], [bx + bw * 0.55, by + bh * 0.45, 1], [bx + bw * 0.32, by + bh * 0.62, 1], [bx + bw * 0.12, by + bh * 0.5, 1]] }, C.olive, { seed: 51, amp: 4, white: [1, 5], shadow: false });
    await pc(x, { poly: [[bx + bw * 0.6, by + bh * 0.58, 1], [bx + bw * 0.88, by + bh * 0.52, 1], [bx + bw * 0.8, by + bh * 0.85, 1], [bx + bw * 0.58, by + bh * 0.8, 1]] }, C.olive, { seed: 52, amp: 4, white: [1, 5], shadow: false });
  };
  // icon(ctx, kind, x, y, r, o): heart · star · globe · coin, drawn as cached torn paper sprites
  const SHD = { dx: 8, dy: 12, blur: 12, alpha: 0.38 };
  async function icon(ctx, kind, x, y, r, o = {}) {
    const rr = Math.round(r / 10) * 10, d = { x, y, sc: (o.sc ?? 1) * r / rr, spin: o.spin || 0, px: 0, py: 0, alpha: o.alpha };
    if (kind === 'heart') return CL.piece(ctx, { poly: heartPts(rr) }, { color: o.color || C.pink, speck: 0.2 }, Object.assign({ seed: 11, amp: 5, shadow: SHD, halftone: { color: 'rgba(229,35,30,0.45)', cell: 12, angle: 30, r: [0.05, 0.4], grad: [0, -rr, 0, rr] } }, d));
    if (kind === 'star') return CL.piece(ctx, { star: [0, 0, rr, rr * 0.45, 5, -90] }, { color: o.color || C.sun, brush: 0.5 }, Object.assign({ seed: 12, amp: 4, shadow: SHD, halftone: { color: 'rgba(240,122,46,0.7)', cell: 12, angle: 20, r: [0.4, 0.04], grad: [0, rr, 0, -rr] } }, d));
    if (kind === 'globe') return CL.piece(ctx, { circle: [0, 0, rr] }, C.sky, Object.assign({ seed: 13, amp: 6, shadow: SHD, draw: LAND, key: 'globe' + rr, halftone: { color: 'rgba(17,134,204,0.45)', cell: 12, angle: 45, r: [0.05, 0.38], grad: [-rr, -rr, rr, rr] } }, d));
    return CL.piece(ctx, { circle: [0, 0, rr] }, { color: C.sun, brush: 0.5 }, Object.assign({ seed: 14, amp: 6, shadow: SHD, draw: glyph('€', C.earth, '"Bungee"'), key: 'coin' + rr, fx: [{ type: 'rings', color: 'rgba(168,86,42,0.35)' }] }, d));
  }
  const ICONS = ['heart', 'star', 'globe', 'coin'];
  const CIRC = [C.red, C.cobalt, C.sky, C.sun];                // circle colour of each card (also its Venn circle)
  const CBG = [C.pink, C.sun, C.navy, C.cobalt];               // card paper
  const CBAND = [C.paper, C.red, C.sun, C.orange];             // card accent band
  const TAGC = ['white', 'ink', 'yellow', 'white'];

  /* ---------- warm-up ---------- */
  const TEAR = { y0: Math.round(H * 0.38), y1: Math.round(H * 0.62), seed: 5, flapW: 640 };
  const LOGO = { x: W / 2, y: Math.round((TEAR.y0 + TEAR.y1) / 2), h: 430, size: 250 };
  const TTL = { a: 0, b: 0 };
  let WARM = null;
  const warm = () => WARM || (WARM = (async () => {
    const m = mkc(8, 8).getContext('2d'); m.font = '400 100px "Ultra"';
    const sz = (lines, frac) => 100 * (W * frac) / Math.max(1, Math.max(...lines.map((s) => [...s].reduce((a, c) => a + m.measureText(c).width, 0))));
    TTL.a = sz(COPY.title, 0.84); TTL.b = sz(COPY.find, 0.86);
    await X.warm({ iris: 6, kaleido: 8, title: { lines: COPY.title, size: TTL.a }, band: { h: LOGO.h, seed: 8 }, logo: { text: COPY.logo, size: LOGO.size }, tear: TEAR });
    await X.warm({ title: { lines: COPY.find, size: TTL.b } });
  })());

  /* ======================================================================= transitions */
  const SHEETS = new Map();
  const sheetPath = (edges, seed) => { const k = edges.join('') + seed; if (!SHEETS.has(k)) SHEETS.set(k, CL.torn({ rect: [-170, -170, W + 340, H + 340], edges }, seed, { amp: 18, white: [3, 17], bite: 3 })); return SHEETS.get(k); };
  function drawSheet(ctx, cv, ox, oy, edges, seed, sh = [0, 14]) {
    const P = sheetPath(edges, seed);
    ctx.save(); ctx.translate(ox, oy);
    ctx.save(); ctx.shadowColor = 'rgba(10,16,30,0.5)'; ctx.shadowBlur = 34; ctx.shadowOffsetX = sh[0]; ctx.shadowOffsetY = sh[1]; ctx.fillStyle = paperPat(ctx); ctx.fill(P); ctx.restore();
    ctx.save(); ctx.clip(P.inner); ctx.drawImage(cv, -(cv.pad || 0), -(cv.pad || 0)); ctx.restore();
    ctx.restore();
  }
  // B arrives on a torn sheet sliding in from `from`; A is pushed away + rolled. 3 drawings.
  async function wipe(ctx, t, t0, drawA, drawB, o) {
    const ks = [0.34, 0.74, 0.95], i = drawingIdx(t, t0);
    if (i >= ks.length || i < 0) { await drawB(ctx, t); return; }
    const k = ks[i], [dx, dy] = o.from, A = padBuf('wipeA'), B = padBuf('wipeB');
    await drawA(A.getContext('2d'), t); await drawB(B.getContext('2d'), t);
    const pa = 0.24 * k, sa = 1 + 0.06 * k;
    ctx.save(); ctx.translate(W / 2 - dx * W * pa, H / 2 - dy * H * pa); ctx.rotate((o.roll || 0) * k * DEG); ctx.scale(sa, sa); ctx.drawImage(A, -W / 2 - PAD, -H / 2 - PAD); ctx.restore();
    const ox = dx * (W + 340) * (1 - k), oy = dy * (H + 340) * (1 - k);
    drawSheet(ctx, B, ox, oy, o.edges, o.seed || 3, [-dx * 22, -dy * 22 + 10]);
    await X.speed(ctx, t, { n: 9, angle: Math.atan2(-dy, -dx), speed: 3600, alpha: 0.9, seed: 41 + (o.seed || 0) });
  }
  const WIPES = [{ from: [1, 0], edges: [0, 0, 0, 1], seed: 4, roll: -8 }, { from: [0, 1], edges: [1, 0, 0, 0], seed: 6, roll: 5 },
    { from: [-1, 0], edges: [0, 1, 0, 0], seed: 7, roll: 8 }, { from: [0, -1], edges: [0, 0, 1, 0], seed: 9, roll: -5 }, { from: [1, 0], edges: [0, 0, 0, 1], seed: 10, roll: -6 }];

  /* ======================================================================= 0–4.56 · IKIGAI */
  const TITLE_Y = 800;
  const openLayer = () => CL.layer('open', async (x) => {
    const B = 150;
    x.drawImage(CL.watercolor(11, { w: W + 2 * B, h: H + 2 * B, tone: 0.9, clouds: 0.55, cloudY: [0.58, 0.8], dots: 0.5, bloom: 0.6 }), -B, -B);
    await pc(x, { band: [-170, 250, W + 170, 150, 130, 100] }, C.paper, { seed: 101, amp: 9, news: { alpha: 0.5, angle: -5 } });
    await pc(x, { band: [-170, 360, W + 170, 290, 46, 30] }, C.red, { seed: 102, amp: 6 });
    await pc(x, { circle: [W / 2, TITLE_Y - 40, 400] }, { color: C.sun, brush: 0.6 }, { seed: 103, amp: 12, halftone: { color: 'rgba(240,122,46,0.92)', cell: 17, angle: 30, r: [0.42, 0.03], grad: [W / 2, TITLE_Y + 360, W / 2, TITLE_Y - 440] } });
    await pc(x, { circle: [W / 2, TITLE_Y - 40, 300] }, C.paper, { seed: 104, amp: 10, dotgrid: { cell: 20, r: 0.09, angle: 12 } });
    await pc(x, { band: [-170, 1500, W + 170, 1380, 210, 160] }, { color: C.orange, brush: 0.6 }, { seed: 105, amp: 12 });
    await pc(x, { band: [-170, 1800, W + 170, 1650, 300, 220] }, { color: C.cobalt, speck: 0.3 }, { seed: 106, amp: 13, halftone: { color: '#0B3A92', cell: 18, angle: 20, r: [0.06, 0.42], grad: [0, 1900, 0, 1550] } });
    await pc(x, { band: [-170, 1990, W + 170, 1900, 160, 120] }, { color: C.red, speck: 0.3 }, { seed: 107, amp: 11, fx: [{ type: 'grunge', seed: 3 }] });
  });
  const OSTARS = [[150, 520, 54, 0.33, C.sun], [930, 470, 44, 0.5, C.pink], [170, 1230, 40, 0.58, C.paper], [910, 1260, 58, 0.42, C.sun]];
  async function openScene(ctx, t) {
    const tq = q(t);
    await zoomAbout(ctx, 1 + 0.025 * tq, W / 2, TITLE_Y, async () => {
      drawLayer(ctx, await openLayer());
      for (const [x, y, r, t0, col] of OSTARS) { const s = CL.slap(tq, t0, { rot0: 12 }); if (!s.on) continue; const b = CL.bob(t, x, 3);
        await CL.piece(ctx, { star: [0, 0, 60, 27, 5, -90] }, { color: col }, { seed: x, amp: 3, white: [2, 6], shadow: SHD, x: x + b.dx, y: y + b.dy, sc: s.s * r / 60, spin: s.rot + b.rot * 4, px: 0, py: 0 }); }
      await X.burst(ctx, t, T.v1, { cx: W / 2, cy: TITLE_Y, n: 26, seed: 9 });
      await X.title(ctx, COPY.title, W / 2, TITLE_Y, tq, T.v1, { size: TTL.a, zoom: 0.02 });
      if (tq >= 2.0) await X.tag(ctx, W / 2, 1120, COPY.meaning, { t: tq, t0: 2.0, color: 'cobalt', font: 'sans', size: 50, rot: -0.03, tape: 'top' });
    });
  }

  /* ======================================================================= 4.56–12.89 · the four circles */
  const CARD_C = { x: W / 2, y: 800, r: 380 };
  const cardLayer = (i) => CL.layer('card' + i, async (x) => {
    await pc(x, [-150, -150, W + 300, H + 300], { color: CBG[i], speck: 0.25 }, { seed: 200 + i, amp: 2, shadow: false });
    await pc(x, { band: [-170, 300 + i * 30, W + 170, 170 - i * 20, 120, 90] }, C.paper, { seed: 210 + i, amp: 9, news: { alpha: 0.45, angle: -4 } });
    await pc(x, { circle: [CARD_C.x + 26, CARD_C.y + 18, CARD_C.r + 46] }, CBAND[i], { seed: 220 + i, amp: 12, dotgrid: { cell: 22, r: 0.1, angle: 10 } });
    await pc(x, { circle: [CARD_C.x, CARD_C.y, CARD_C.r] }, { color: CIRC[i], brush: 0.5 }, { seed: 230 + i, amp: 12, halftone: { color: 'rgba(255,255,255,0.32)', cell: 16, angle: 25, r: [0.4, 0.04], grad: [CARD_C.x, CARD_C.y + CARD_C.r, CARD_C.x, CARD_C.y - CARD_C.r] } });
    await pc(x, { band: [-170, 1330, W + 170, 1290, 560, 600] }, C.paper, { seed: 240 + i, amp: 12, dotgrid: { cell: 24, r: 0.07, angle: 8 } });
  });
  const ICON_COL = [C.pink, C.sun, null, null];
  async function cardScene(ctx, t, i) {
    const t0 = T.c[i], tq = q(t), lt = Math.max(0, tq - t0);
    await zoomAbout(ctx, 1 + 0.03 * lt, W / 2, CARD_C.y, async () => {
      drawLayer(ctx, await cardLayer(i));
      const s = CL.slap(tq, t0 + 3 / 12, { from: 1.5, rot0: i % 2 ? 10 : -10 });
      if (s.on) { const b = CL.bob(t, 30 + i, 4); await icon(ctx, ICONS[i], CARD_C.x + b.dx, CARD_C.y + b.dy, 230, { sc: s.s, spin: s.rot + b.rot, color: ICON_COL[i] }); }
      await X.tag(ctx, 70, 120, `${i + 1} / 4`, { t: tq, t0: t0 + 1 / 12, color: TAGC[i], font: 'mono', size: 46, anchor: 'left', rot: -0.03, tape: 'top' });
      // ransom lines, one after the other; the short last card drops two letters per drawing
      const lines = COPY.cards[i], step = i === 3 ? 1 / 24 : 1 / 12;
      let st = t0 + 5 / 12;
      for (let l = 0; l < lines.length; l++) {
        const n = lines[l].replace(/ /g, '').length, size = Math.min(140, 900 / (lines[l].length * 1.15)), y = 1250 + (l - (lines.length - 1) / 2) * 175;
        await X.ransom(ctx, lines[l], W / 2, y, tq, st, { size, step, seed: 40 + i * 5 + l });
        st += n * step;
      }
    });
  }

  /* ======================================================================= 12.89–18.22 · Venn → IKIGAI → push into the centre */
  const VC = { x: W / 2, y: 1030, d: 195, r: 290 };
  const VPOS = [[0, -1], [-1, 0], [1, 0], [0, 1]];           // aimer (top) · doué (left) · monde (right) · payé (bottom)
  const vennLayer = () => CL.layer('venn', async (x) => {
    await pc(x, [-150, -150, W + 300, H + 300], { color: C.paper, speck: 0.3 }, { seed: 300, amp: 2, shadow: false, news: { alpha: 0.18, angle: 0 } });
    await pc(x, { band: [-170, 180, W + 170, 250, 260, 220] }, { color: C.navy, speck: 0.3 }, { seed: 301, amp: 12 });
    await pc(x, { band: [-170, 1700, W + 170, 1640, 160, 130] }, { color: C.orange, brush: 0.6 }, { seed: 302, amp: 11 });
    await pc(x, { band: [-170, 1880, W + 170, 1830, 160, 140] }, { color: C.cobalt }, { seed: 303, amp: 11, halftone: { color: '#0B3A92', cell: 16, angle: 20, r: [0.06, 0.4], grad: [0, 1950, 0, 1760] } });
  });
  const IPOS = [[-1, -1], [1, -1], [1, 1], [-1, 1]];           // PASSION (aimer+doué) · MISSION (aimer+monde) · VOCATION (monde+payé) · PROFESSION (doué+payé)
  async function vennDraw(ctx, t) {
    const tq = q(t);
    drawLayer(ctx, await vennLayer());
    await X.ransom(ctx, COPY.title[0], W / 2, 250, tq, T.venn, { size: 150, step: 1 / 12, seed: 61 });
    // circles fly in from their side (3 drawings each, staggered) and overlap like tissue paper
    for (let i = 0; i < 4; i++) {
      const t0 = T.venn + i * 3 / 12, f = drawingIdx(t, t0); if (f < 0) continue;
      const k = [1, 0.42, 0.1][f] ?? 0, [vx, vy] = VPOS[i], b = CL.bob(t, 50 + i, 3), x = VC.x + vx * (VC.d + k * 1100) + b.dx, y = VC.y + vy * (VC.d + k * 1100) + b.dy;
      ctx.save(); ctx.globalAlpha = 0.84; // overlapping like tissue paper
      await CL.piece(ctx, { circle: [0, 0, VC.r] }, { color: CIRC[i], brush: 0.5 }, { seed: 230 + i, amp: 10, shadow: false, x, y, spin: b.rot, px: 0, py: 0, halftone: { color: 'rgba(255,255,255,0.3)', cell: 15, angle: 25, r: [0.35, 0.04], grad: [0, VC.r, 0, -VC.r] } });
      ctx.restore();
      if (f >= 2) await icon(ctx, ICONS[i], VC.x + vx * (VC.d + 150) + b.dx, VC.y + vy * (VC.d + 150) + b.dy, 70, { spin: b.rot, color: ICON_COL[i] });
    }
    for (let i = 0; i < 4; i++) {
      const [ix, iy] = IPOS[i], t0 = T.inter + i * 4 / 12; if (tq < t0) continue;
      await X.tag(ctx, VC.x + ix * 165, VC.y + iy * 165, COPY.inter[i], { t: tq, t0, color: ['white', 'yellow', 'white', 'yellow'][i], font: 'sans', size: 36, rot: [-0.06, 0.05, -0.04, 0.06][i], tape: false });
    }
    if (tq >= T.ik) await X.star(ctx, VC.x, VC.y, 118, t, { points: 12, inner: 0.72, color: X.PAL.yellow, text: COPY.center, seed: 5, pop: clamp((drawingIdx(t, T.ik) + 1) / 3) });
  }
  async function vennScene(ctx, t) {
    const tq = q(t), pz = prog(tq, T.push[0], T.push[1] - 0.04), e = pz * pz, z = (1 + 0.02 * Math.max(0, tq - T.venn)) * Math.pow(46, e), m = E.inOut3(clamp(pz * 1.3));
    const sx = lerp(VC.x, W / 2, m), sy = lerp(VC.y, H / 2, m), rS = 104 * z;
    const covered = rS * 0.95 > Math.hypot(W / 2 + Math.abs(sx - W / 2), H / 2 + Math.abs(sy - H / 2)) + 40;
    if (!covered) { ctx.save(); ctx.translate(sx, sy); ctx.scale(z, z); ctx.translate(-VC.x, -VC.y); await vennDraw(ctx, t); ctx.restore(); }
    if (tq >= T.push[0] + 4 / 12) { // a paper iris opens inside the IKIGAI star; its centre is the kaleidoscope already zooming
      const ki = prog(tq, T.push[0] + 0.5, T.push[1] - 0.1), pop = lerp(0.55, 1, clamp(drawingIdx(t, T.push[0] + 4 / 12) / 2));
      await X.iris(ctx, sx, sy, rS * pop, ki, t, { n: 6, spin: 1.2, drawCenter: ki > 0.12 ? async (c, cx, cy, rr, tt) => {
        const kb = await kalBuf(tt), s = rr / (Math.hypot(W, H) / 2); c.drawImage(kb, cx - (KS / 2) * s, cy - (KS / 2) * s, KS * s, KS * s);
      } : null });
    }
  }

  /* ======================================================================= 18.22–21.87 · kaleidoscope */
  // source: vertical torn bands right of the centre (x 560–1080); srcScale 2.1 stretches them over the whole disc
  const KSRC = () => once('ksrc', async () => {
    const c = mkc(W, H), x = c.getContext('2d');
    x.drawImage(CL.watercolor(97, { w: W, h: H, tone: 0.95, bloom: 0.1, clouds: 0, base: '#2DB8EE', light: '#8ADAF5', deep: '#1186CC' }), 0, 0);
    const V = (cx, w, dx) => ({ band: [cx - dx / 2, -40, cx + dx / 2, H + 40, w, w * 0.92], tips: false });
    const BANDS = [[C.red, 588, 34], [C.sun, 626, 30], [C.pink, 672, 44], [C.cobalt, 724, 40], [C.olive, 772, 40], [C.paper, 812, 26], [C.red, 852, 42], [C.sun, 900, 40], [C.cobalt, 950, 46], [C.pink, 1000, 40], [C.sun, 1046, 40]];
    let i = 0;
    for (const [col, cx, w] of BANDS) {
      const seed = 960 + i++, dx = ((seed * 37) % 21) - 10;
      await CL.piece(x, V(cx, w, dx), { color: col, brush: 0.4 }, { seed, amp: 5, cache: false, shadow: { dx: 5, dy: 0, blur: 9, alpha: 0.35 }, halftone: col === C.paper ? undefined : { color: 'rgba(255,255,255,0.3)', cell: 9, angle: 30, r: [0.36, 0.04], grad: [cx - w / 2, 0, cx + w / 2, 0] } });
    }
    return c;
  });
  const HOLE = [[21 + 8 / 12, 0.34], [21.75, 0.85]];
  const holeAt = (t) => { let h = 0; for (const [t0, v] of HOLE) if (t >= t0 - 1e-6) h = v; return h; };
  const kOpts = (t) => ({ segments: 8, rot: 0, twist: 0, zoom: 1.6, ratio: 0.5, levels: 7, srcScale: 2.1, rims: ['red', 'yellow', 'cyan', 'dots', 'red', 'yellow'], hole: holeAt(t), drawNext: (c, tt) => findScene(c, tt), holeColor: '#F3A51C' });
  const kalDraw = async (ctx, t) => { const tq = q(t), src = await KSRC(); await X.kaleido(ctx, tq, async (c) => c.drawImage(src, 0, 0), kOpts(tq)); };
  const KS = Math.ceil(Math.hypot(W, H)) + 8;
  async function kalBuf(t) { const cv = buf('kal', KS, KS), x = cv.getContext('2d'); x.translate((KS - W) / 2, (KS - H) / 2); await kalDraw(x, t); return cv; }

  /* ======================================================================= 21.87–27.72 · TROUVE TON IKIGAI */
  const FIND_Y = 760;
  const findLayer = () => CL.layer('find', async (x) => {
    await pc(x, [-150, -150, W + 300, H + 300], { color: C.cobalt, speck: 0.3 }, { seed: 400, amp: 2, shadow: false, halftone: { color: '#0B3A92', cell: 20, angle: 20, r: [0.05, 0.4], grad: [0, 0, 0, H] } });
    await pc(x, { rect: [-60, FIND_Y - 360, W + 120, 700], edges: [1, 0, 1, 0] }, { color: C.sun, brush: 0.6 }, { seed: 401, amp: 14, rot: -3, halftone: { color: 'rgba(240,122,46,0.75)', cell: 16, angle: 30, r: [0.38, 0.03], grad: [0, FIND_Y + 340, 0, FIND_Y - 340] } });
    await pc(x, { band: [-170, 300, W + 170, 220, 70, 50] }, C.red, { seed: 402, amp: 7 });
    await pc(x, { band: [-170, 1290, W + 170, 1210, 60, 46] }, C.paper, { seed: 403, amp: 7, news: { alpha: 0.5 } });
    await pc(x, { band: [-170, 1990, W + 170, 1880, 200, 160] }, { color: C.pink }, { seed: 404, amp: 12, dotgrid: { cell: 22, r: 0.1 } });
  });
  const FICONS = [[250, 1460, 150, -10], [830, 1450, 150, 9], [260, 1730, 140, 7], [820, 1720, 140, -8]];
  async function findScene(ctx, t) {
    const tq = q(t), lt = Math.max(0, tq - T.find);
    await zoomAbout(ctx, 1 + 0.02 * lt, W / 2, 1100, async () => {
      drawLayer(ctx, await findLayer());
      await X.burst(ctx, t, T.find, { cx: W / 2, cy: FIND_Y, n: 26, seed: 19 });
      await X.title(ctx, COPY.find, W / 2, FIND_Y, tq, T.find, { size: TTL.b, zoom: 0.015 });
      for (let i = 0; i < 4; i++) {
        const [x, y, r, rot] = FICONS[i], s = CL.slap(tq, T.icons + i * 3 / 12, { from: 1.5, rot0: rot }); if (!s.on) continue;
        const b = CL.bob(t, 70 + i, 4); await icon(ctx, ICONS[i], x + b.dx, y + b.dy, r, { sc: s.s, spin: rot * 0.5 + s.rot + b.rot, color: ICON_COL[i] });
      }
      if (tq >= T.icons) await X.confetti(ctx, t, T.icons, { x: W / 2, y: 1580, n: 26, speed: 1300, spread: Math.PI * 1.2, gravity: 1300, dur: 0.95, seed: 28 });
    });
  }

  /* ======================================================================= 27.72–30.7 · tear → ikigai band */
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
    const P = TEARDONE; ctx.drawImage(A, 0, 0);
    ctx.save(); ctx.clip(P.R); ctx.drawImage(B, 0, 0); ctx.shadowColor = 'rgba(0,0,0,0.42)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 7; ctx.fillStyle = '#000'; ctx.fill(P.Ts); ctx.restore();
    ctx.save(); ctx.fillStyle = U.pat(ctx, X.PAL.paper); ctx.fill(P.tp); ctx.fill(P.bp); ctx.strokeStyle = 'rgba(80,60,40,0.18)'; ctx.lineWidth = 1; ctx.stroke(P.tp); ctx.stroke(P.bp); ctx.restore();
  }
  async function endScene(ctx, t) {
    const tq = q(t), z = 1 + 0.02 * Math.max(0, tq - 28.2);
    await zoomAbout(ctx, z, W / 2, LOGO.y, async () => {
      const under = async (c) => { await findScene(c, t); await X.logoBand(c, COPY.logo, t, { style: 'band', x: LOGO.x, y: LOGO.y, h: LOGO.h, size: LOGO.size, seed: 8, boil: true }); };
      if (tq < 28.2) await X.tear(ctx, prog(tq, T.end - 1 / 12, 28.2), async (c) => findScene(c, t), under, TEAR);
      else { const A = buf('tover'); await findScene(A.getContext('2d'), t); const B = buf('tunder'); await under(B.getContext('2d')); tearDone(ctx, A, B); }
      // TA RAISON D'ÊTRE on a paper sheet that slaps over the title area
      const s = CL.slap(tq, 28.25, { from: 1.3, rot0: -5 });
      if (s.on) await CL.piece(ctx, [-480, -220, 960, 440], { color: C.paper, speck: 0.2 }, { seed: 500, amp: 10, shadow: { dx: 10, dy: 16, blur: 20, alpha: 0.45 }, x: W / 2, y: 380, sc: s.s, spin: -2 + s.rot, px: 0, py: 0 });
      for (let l = 0; l < 2; l++) await X.ransom(ctx, COPY.end[l], W / 2, 310 + l * 140, tq, 28.42 + l * 9 / 12, { size: 100, step: 1 / 12, seed: 81 + l });
      if (tq >= 29.0) await X.star(ctx, 870, 1370, 90, t, { points: 12, inner: 0.7, color: X.PAL.red, seed: 6, pop: clamp((drawingIdx(t, 29.0) + 1) / 3), spin: 0.5 });
    });
  }

  /* ======================================================================= timeline */
  const cuts = [];
  const Cut = (t0, t1, draw) => cuts.push({ t0, t1, draw: async (ctx, t) => {
    await warm();
    const z = K.punch(q(t)); ctx.fillStyle = '#FBF8F1'; ctx.fillRect(0, 0, W, H);
    await zoomAbout(ctx, z, W / 2, H / 2, () => draw(ctx, t));
  } });
  const card = (i) => (c, t) => cardScene(c, t, i);
  Cut(0, T.c[0], openScene);
  Cut(T.c[0], T.c[1], (ctx, t) => wipe(ctx, t, T.c[0], openScene, card(0), WIPES[0]));
  Cut(T.c[1], T.c[2], (ctx, t) => wipe(ctx, t, T.c[1], card(0), card(1), WIPES[1]));
  Cut(T.c[2], T.c[3], (ctx, t) => wipe(ctx, t, T.c[2], card(1), card(2), WIPES[2]));
  Cut(T.c[3], T.venn, (ctx, t) => wipe(ctx, t, T.c[3], card(2), card(3), WIPES[3]));
  Cut(T.venn, T.kal, (ctx, t) => wipe(ctx, t, T.venn, card(3), vennScene, WIPES[4]));
  Cut(T.kal, T.find, kalDraw);
  Cut(T.find, T.end, findScene);
  Cut(T.end, T.dur, endScene);

  window.SCENES = { duration: T.dur, cuts, overlay: async (ctx, t) => { CL.printGrain(ctx, t, 0.05); } };
  window.COPY = COPY;
})();

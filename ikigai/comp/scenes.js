/* scenes.js — IKIGAI, 30.7 s, 9:16 (1080×1920, 24 fps), torn-paper collage on twos. Code only: no cut-outs, no photos.
 * Every on-screen word follows the voice-over script; each clause starts on its measured voice onset
 * (audio/voix-off.mp3, silencedetect −28 dB / 0.12 s — 19 speech chunks = the 19 clauses of the script):
 *   0.79 J'ai découvert une philosophie japonaise · 2.75 qui va changer ta perception du bonheur · 4.57 si tu as la volonté de vivre de ta création
 *   6.81 Ce principe · 7.77 c'est l'IKIGAI · 9.28 Elle repose sur 4 piliers fondamentaux
 *   11.44 Ce que tu aimes faire · 12.89 Ce en quoi tu es doué · 14.36 Ce dont le monde a besoin · 15.89 Et enfin, · 16.72 ce pour quoi tu es payé
 *   18.23 Cet équilibre permet de trouver ta direction · 20.28 remettre du sens à ta vie · 21.88 et de pouvoir pleinement · 23.04 t'épanouir dans tes projets créatifs
 *   24.89 N'hésite pas à enregistrer cette vidéo · 26.53 pour ne pas l'oublier · 27.72 et je te dis à très vite · 28.91 pour de nouvelles inspirations (voice ends 30.18)
 * Picture: philosophie japonaise (hinomaru) → bonheur (paper smiley) → création (paper pencil) → IKIGAI title + 4 piliers → the four circles
 *   → Venn (équilibre) + IKIGAI star → push into it → iris → kaleidoscope (t'épanouir) → hex hole → save card + cursor click → page tear → « à très vite ! » band
 */
(function () {
  'use strict';
  const { W, H, clamp, lerp, prog, E } = ENG;
  const K = KIT, X = CLX, U = CLX._, C = CL.C, DEG = Math.PI / 180;

  /* ---------- copy: every on-screen word lives here ---------- */
  const COPY = {
    found: "J'AI DÉCOUVERT UNE", philo: ['PHILOSOPHIE', 'JAPONAISE'],
    change: 'QUI VA CHANGER TA', percep: 'PERCEPTION DU', bonheur: 'BONHEUR',
    will: 'SI TU AS LA VOLONTÉ DE', create: ['VIVRE DE TA', 'CRÉATION'],
    principle: "CE PRINCIPE, C'EST", title: ['IKIGAI'], pillars: '4 PILIERS FONDAMENTAUX',
    cards: [['CE QUE TU', 'AIMES FAIRE'], ['CE EN QUOI', 'TU ES DOUÉ'], ['CE DONT', 'LE MONDE', 'A BESOIN'], ['CE POUR QUOI', 'TU ES PAYÉ']],
    finally: 'ET ENFIN…',
    balance: "L'ÉQUILIBRE", direction: 'TROUVER TA DIRECTION', sense: 'DU SENS À TA VIE', center: 'IKIGAI',
    fully: 'PLEINEMENT', bloom: "T'ÉPANOUIR", projects: 'DANS TES PROJETS CRÉATIFS',
    dont: "N'HÉSITE PAS À", save: ['ENREGISTRER', 'CETTE VIDÉO'], forget: "POUR NE PAS L'OUBLIER",
    soon: 'à très vite !', newIns: 'POUR DE NOUVELLES', insp: 'INSPIRATIONS',
  };
  const T = { v1: 0.79, philo: 1.5, bonheur: 2.75, creation: 4.57, principle: 6.81, ikigai: 7.77, pillars: 9.28, c: [11.44, 12.89, 14.36, 15.89], paid: 16.72,
    venn: 18.23, sense: 20.28, push: [20.9, 21.86], kal: 21.88, bloom: 23.04, save: 24.89, forget: 26.53, end: 27.72, ins: 28.91, dur: 30.7 };
  K.setup({ bars: [T.v1, T.bonheur, T.creation, T.principle, T.ikigai, ...T.c, T.venn, T.sense, T.save, T.end] });

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
  const popK = (t, t0) => clamp((drawingIdx(t, t0) + 1) / 3);
  // ransom line sized to fit the 9:16 width; tags pop on twos
  const rsize = (s, max = 140) => Math.min(max, 900 / (s.length * 1.15));
  const ransomLine = (ctx, s, y, tq, t0, seed, o = {}) => X.ransom(ctx, s, W / 2, y, tq, t0, Object.assign({ size: rsize(s, o.max), step: 1 / 24, seed }, o));
  const tagAt = (ctx, x, y, s, tq, t0, color, o = {}) => (tq >= t0 ? X.tag(ctx, x, y, s, Object.assign({ t: tq, t0, color, font: 'sans', size: 48, rot: -0.03, tape: 'top' }, o)) : null);

  /* ---------- paper icons (shapes centred on 0,0; move them with x / y) ---------- */
  const heartPts = (r) => { const p = []; for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; p.push([16 * Math.pow(Math.sin(a), 3) * r / 17, -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * r / 17 - r * 0.1, 1]); } return p; };
  const glyph = (ch, col, font, k = 1.1) => async (x, b) => { const s = b[3] * 0.62 * k; x.font = `400 ${s}px ${font}`; x.fillStyle = col; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(ch, b[0] + b[2] / 2, b[1] + b[3] / 2 + s * 0.06); };
  const LAND = async (x, b) => {
    const [bx, by, bw, bh] = b;
    await pc(x, { poly: [[bx + bw * 0.18, by + bh * 0.3, 1], [bx + bw * 0.5, by + bh * 0.18, 1], [bx + bw * 0.55, by + bh * 0.45, 1], [bx + bw * 0.32, by + bh * 0.62, 1], [bx + bw * 0.12, by + bh * 0.5, 1]] }, C.olive, { seed: 51, amp: 4, white: [1, 5], shadow: false });
    await pc(x, { poly: [[bx + bw * 0.6, by + bh * 0.58, 1], [bx + bw * 0.88, by + bh * 0.52, 1], [bx + bw * 0.8, by + bh * 0.85, 1], [bx + bw * 0.58, by + bh * 0.8, 1]] }, C.olive, { seed: 52, amp: 4, white: [1, 5], shadow: false });
  };
  const SHD = { dx: 8, dy: 12, blur: 12, alpha: 0.38 };
  async function icon(ctx, kind, x, y, r, o = {}) {
    const rr = Math.round(r / 10) * 10, d = { x, y, sc: (o.sc ?? 1) * r / rr, spin: o.spin || 0, px: 0, py: 0, alpha: o.alpha };
    if (kind === 'heart') return CL.piece(ctx, { poly: heartPts(rr) }, { color: o.color || C.pink, speck: 0.2 }, Object.assign({ seed: 11, amp: 5, shadow: SHD, halftone: { color: 'rgba(229,35,30,0.45)', cell: 12, angle: 30, r: [0.05, 0.4], grad: [0, -rr, 0, rr] } }, d));
    if (kind === 'star') return CL.piece(ctx, { star: [0, 0, rr, rr * 0.45, 5, -90] }, { color: o.color || C.sun, brush: 0.5 }, Object.assign({ seed: 12, amp: 4, shadow: SHD, halftone: { color: 'rgba(240,122,46,0.7)', cell: 12, angle: 20, r: [0.4, 0.04], grad: [0, rr, 0, -rr] } }, d));
    if (kind === 'globe') return CL.piece(ctx, { circle: [0, 0, rr] }, C.sky, Object.assign({ seed: 13, amp: 6, shadow: SHD, draw: LAND, key: 'globe' + rr, halftone: { color: 'rgba(17,134,204,0.45)', cell: 12, angle: 45, r: [0.05, 0.38], grad: [-rr, -rr, rr, rr] } }, d));
    return CL.piece(ctx, { circle: [0, 0, rr] }, { color: C.sun, brush: 0.5 }, Object.assign({ seed: 14, amp: 6, shadow: SHD, draw: glyph('€', C.earth, '"Bungee"'), key: 'coin' + rr, fx: [{ type: 'rings', color: 'rgba(168,86,42,0.35)' }] }, d));
  }
  const ICONS = ['heart', 'star', 'globe', 'coin'];
  const ICON_COL = [C.pink, C.sun, null, null];
  const CIRC = [C.red, C.cobalt, C.sky, C.sun];
  const CBG = [C.pink, C.sun, C.navy, C.cobalt];
  const CBAND = [C.paper, C.red, C.sun, C.orange];
  const TAGC = ['white', 'ink', 'yellow', 'white'];

  /* ---------- warm-up ---------- */
  const TEAR = { y0: Math.round(H * 0.38), y1: Math.round(H * 0.62), seed: 5, flapW: 640 };
  const LOGO = { x: W / 2, y: Math.round((TEAR.y0 + TEAR.y1) / 2), h: 430, size: 170 };
  const TTL = { a: 0, p: 0 };
  let WARM = null;
  const warm = () => WARM || (WARM = (async () => {
    const m = mkc(8, 8).getContext('2d'); m.font = '400 100px "Ultra"';
    const sz = (lines, frac) => 100 * (W * frac) / Math.max(1, Math.max(...lines.map((s) => [...s].reduce((a, c) => a + m.measureText(c).width, 0))));
    TTL.a = sz(COPY.title, 0.84); TTL.p = sz(COPY.philo, 0.9);
    await X.warm({ iris: 6, kaleido: 8, title: { lines: COPY.title, size: TTL.a }, band: { h: LOGO.h, seed: 8 }, logo: { text: COPY.soon, size: LOGO.size }, tear: TEAR });
    await X.warm({ title: { lines: COPY.philo, size: TTL.p } });
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
    { from: [-1, 0], edges: [0, 1, 0, 0], seed: 7, roll: 8 }, { from: [0, -1], edges: [0, 0, 1, 0], seed: 9, roll: -5 }];
  const wipeN = (i) => Object.assign({}, WIPES[i % 4], { seed: WIPES[i % 4].seed + 10 * Math.floor(i / 4) });

  /* ======================================================================= 0–2.75 · une philosophie japonaise */
  const SUN = { x: W / 2, y: 640, r: 360 };
  const japonLayer = () => CL.layer('japon', async (x) => {
    await pc(x, [-150, -150, W + 300, H + 300], { color: C.paper, speck: 0.3 }, { seed: 600, amp: 2, shadow: false, news: { alpha: 0.16, angle: 0 } });
    await pc(x, { band: [-170, 150, W + 170, 110, 120, 100] }, { color: C.navy, speck: 0.3 }, { seed: 601, amp: 10 });
    await pc(x, { circle: [SUN.x + 24, SUN.y + 20, SUN.r + 40] }, C.news, { seed: 602, amp: 12, news: { alpha: 0.5 } });
    await pc(x, { circle: [SUN.x, SUN.y, SUN.r] }, { color: C.red, speck: 0.3 }, { seed: 603, amp: 13, halftone: { color: 'rgba(255,230,220,0.35)', cell: 16, angle: 25, r: [0.4, 0.03], grad: [SUN.x, SUN.y + SUN.r, SUN.x, SUN.y - SUN.r] } });
    for (let i = 0; i < 5; i++) await pc(x, { band: [-170, 1600 + i * 70, W + 170, 1560 + i * 70 - (i % 2) * 40, 40, 30] }, [C.cobalt, C.paper, C.red, C.sun, C.navy][i], { seed: 604 + i, amp: 6 });
  });
  async function philoScene(ctx, t) {
    const tq = q(t);
    await zoomAbout(ctx, 1 + 0.03 * tq, W / 2, SUN.y, async () => {
      drawLayer(ctx, await japonLayer());
      await tagAt(ctx, W / 2, 1110, COPY.found, tq, T.v1, 'ink', { size: 50 });
      await X.burst(ctx, t, T.philo, { cx: W / 2, cy: 1340, n: 22, seed: 3 });
      await X.title(ctx, COPY.philo, W / 2, 1340, tq, T.philo, { size: TTL.p, zoom: 0.02 });
    });
  }

  /* ======================================================================= 2.75–4.57 · ta perception du bonheur */
  const SMILE = { x: W / 2, y: 650, r: 330 };
  const smilePts = () => { const p = [], cy = 30; for (let a = 25; a <= 155; a += 10) p.push([Math.cos(a * DEG) * 200, cy + Math.sin(a * DEG) * 200, 1]); for (let a = 155; a >= 25; a -= 10) p.push([Math.cos(a * DEG) * 150, cy + Math.sin(a * DEG) * 130, 1]); return p; };
  const bonheurLayer = () => CL.layer('bonheur', async (x) => {
    await pc(x, [-150, -150, W + 300, H + 300], { color: C.sky, speck: 0.2 }, { seed: 620, amp: 2, shadow: false, halftone: { color: 'rgba(255,255,255,0.35)', cell: 18, angle: 30, r: [0.05, 0.35], grad: [0, 0, 0, H] } });
    for (let i = 0; i < 12; i++) { const a = i * 30 * DEG; await pc(x, { band: [SMILE.x + Math.cos(a) * 380, SMILE.y + Math.sin(a) * 380, SMILE.x + Math.cos(a) * 760, SMILE.y + Math.sin(a) * 760, 70, 10] }, i % 2 ? C.sun : C.orange, { seed: 630 + i, amp: 5 }); }
    await pc(x, { band: [-170, 1300, W + 170, 1260, 520, 560] }, C.paper, { seed: 645, amp: 12, dotgrid: { cell: 24, r: 0.07, angle: 8 } });
  });
  async function bonheurScene(ctx, t) {
    const tq = q(t), lt = Math.max(0, tq - T.bonheur);
    await zoomAbout(ctx, 1 + 0.035 * lt, W / 2, SMILE.y, async () => {
      drawLayer(ctx, await bonheurLayer());
      const s = CL.slap(tq, T.bonheur + 2 / 12, { from: 1.4, rot0: -8 }), b = CL.bob(t, 3, 3);
      if (s.on) {
        const o = { x: SMILE.x + b.dx, y: SMILE.y + b.dy, sc: s.s, spin: s.rot + b.rot, px: 0, py: 0 };
        await CL.piece(ctx, { circle: [0, 0, SMILE.r] }, { color: C.sun, brush: 0.6 }, Object.assign({ seed: 650, amp: 10, shadow: SHD, halftone: { color: 'rgba(240,122,46,0.8)', cell: 15, angle: 30, r: [0.4, 0.03], grad: [0, SMILE.r, 0, -SMILE.r] } }, o));
        for (const ex of [-110, 110]) await CL.piece(ctx, { ellipse: [ex, -80, 34, 52] }, C.ink, Object.assign({ seed: 651 + (ex > 0), amp: 3, white: [2, 6], shadow: false }, o));
        await CL.piece(ctx, { poly: smilePts() }, C.red, Object.assign({ seed: 653, amp: 4, white: [2, 7], shadow: false }, o));
      }
      await tagAt(ctx, W / 2, 1140, COPY.change, tq, T.bonheur + 1 / 12, 'cobalt');
      await tagAt(ctx, W / 2, 1260, COPY.percep, tq, 3.5, 'white');
      await ransomLine(ctx, COPY.bonheur, 1430, tq, 3.75, 7, { max: 130 });
    });
  }

  /* ======================================================================= 4.57–6.81 · vivre de ta création */
  const creaLayer = () => CL.layer('crea', async (x) => {
    await pc(x, [-150, -150, W + 300, H + 300], { color: C.sun, speck: 0.25 }, { seed: 660, amp: 2, shadow: false });
    await pc(x, { rect: [120, 170, 840, 880], edges: [1, 1, 1, 1] }, C.paper, { seed: 661, amp: 10, rot: -3, fx: [{ type: 'lines', color: 'rgba(22,96,218,0.25)' }] });
    await pc(x, { band: [-170, 1330, W + 170, 1290, 520, 560] }, C.paper, { seed: 662, amp: 12, dotgrid: { cell: 24, r: 0.07, angle: 8 } });
    await pc(x, { band: [-170, 1840, W + 170, 1760, 200, 160] }, { color: C.red, speck: 0.3 }, { seed: 663, amp: 12 });
  });
  // paper pencil drawing a torn red squiggle (pieces in pencil-local coords, the whole group rotated)
  async function pencil(ctx, x, y, rot, sc) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot * DEG); ctx.scale(sc, sc);
    const sh = { dx: 10, dy: 14, blur: 14, alpha: 0.35 };
    await CL.piece(ctx, [-62, -300, 124, 470], { color: C.sun, brush: 0.5 }, { seed: 671, amp: 4, shadow: sh, fx: [{ type: 'stripes', color: 'rgba(233,162,27,0.6)' }] });
    await CL.piece(ctx, [-66, -340, 132, 56], C.news, { seed: 672, amp: 3, shadow: false });
    await CL.piece(ctx, [-62, -420, 124, 86], C.pink, { seed: 673, amp: 4, shadow: false });
    await CL.piece(ctx, { poly: [[-62, 168, 1], [62, 168, 1], [0, 330, 1]] }, '#F2D3A2', { seed: 674, amp: 3, shadow: false });
    await CL.piece(ctx, { poly: [[-20, 278, 1], [20, 278, 1], [0, 330, 1]] }, C.ink, { seed: 675, amp: 2, white: [1, 3], shadow: false });
    ctx.restore();
  }
  async function creaScene(ctx, t) {
    const tq = q(t), lt = Math.max(0, tq - T.creation);
    await zoomAbout(ctx, 1 + 0.03 * lt, W / 2, 600, async () => {
      drawLayer(ctx, await creaLayer());
      // the squiggle grows on twos behind the pencil tip
      const k = E.out3(prog(tq, T.creation + 2 / 12, T.creation + 1.4)), n = Math.max(2, Math.round(2 + k * 22)), pts = [];
      for (let i = 0; i < n; i++) { const u = i / 23; pts.push([230 + u * 600, 640 + Math.sin(u * 9) * 160 - u * 120]); }
      if (k > 0) { ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = C.red; ctx.lineWidth = 26; ctx.shadowColor = 'rgba(0,0,0,0.25)'; ctx.shadowOffsetY = 5; ctx.shadowBlur = 6; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke(); ctx.restore(); }
      const s = CL.slap(tq, T.creation + 1 / 12, { from: 1.3, rot0: 10 }), tip = pts[pts.length - 1], b = CL.bob(t, 9, 3);
      if (s.on) await pencil(ctx, tip[0] + 115 + b.dx, tip[1] - 300 + b.dy, 20 + s.rot, s.s * 0.95);
      await tagAt(ctx, W / 2, 1140, COPY.will, tq, T.creation + 1 / 12, 'ink');
      await ransomLine(ctx, COPY.create[0], 1330, tq, 5.4, 21);
      await ransomLine(ctx, COPY.create[1], 1490, tq, 5.4 + 9 / 24, 22);
    });
  }

  /* ======================================================================= 6.81–11.44 · IKIGAI + 4 piliers */
  const TITLE_Y = 780;
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
  const PIL = [[165, 1450], [405, 1430], [675, 1450], [915, 1430]];
  async function ikigaiScene(ctx, t) {
    const tq = q(t), lt = Math.max(0, tq - T.principle);
    await zoomAbout(ctx, 1 + 0.02 * lt, W / 2, TITLE_Y, async () => {
      drawLayer(ctx, await openLayer());
      await tagAt(ctx, W / 2, 470, COPY.principle, tq, T.principle + 1 / 12, 'white', { size: 50 });
      await X.burst(ctx, t, T.ikigai, { cx: W / 2, cy: TITLE_Y, n: 26, seed: 9 });
      await X.title(ctx, COPY.title, W / 2, TITLE_Y, tq, T.ikigai, { size: TTL.a, zoom: 0.02 });
      await tagAt(ctx, W / 2, 1150, COPY.pillars, tq, T.pillars + 1 / 12, 'cobalt', { size: 52 });
      for (let i = 0; i < 4; i++) {
        const s = CL.slap(tq, 9.75 + i * 2 / 12, { from: 1.6, rot0: i % 2 ? 10 : -10 }); if (!s.on) continue;
        const b = CL.bob(t, 80 + i, 3); await icon(ctx, ICONS[i], PIL[i][0] + b.dx, PIL[i][1] + b.dy, 100, { sc: s.s, spin: s.rot + b.rot, color: ICON_COL[i] });
      }
    });
  }

  /* ======================================================================= 11.44–18.23 · the four circles */
  const CARD_C = { x: W / 2, y: 800, r: 380 };
  const cardLayer = (i) => CL.layer('card' + i, async (x) => {
    await pc(x, [-150, -150, W + 300, H + 300], { color: CBG[i], speck: 0.25 }, { seed: 200 + i, amp: 2, shadow: false });
    await pc(x, { band: [-170, 300 + i * 30, W + 170, 170 - i * 20, 120, 90] }, C.paper, { seed: 210 + i, amp: 9, news: { alpha: 0.45, angle: -4 } });
    await pc(x, { circle: [CARD_C.x + 26, CARD_C.y + 18, CARD_C.r + 46] }, CBAND[i], { seed: 220 + i, amp: 12, dotgrid: { cell: 22, r: 0.1, angle: 10 } });
    await pc(x, { circle: [CARD_C.x, CARD_C.y, CARD_C.r] }, { color: CIRC[i], brush: 0.5 }, { seed: 230 + i, amp: 12, halftone: { color: 'rgba(255,255,255,0.32)', cell: 16, angle: 25, r: [0.4, 0.04], grad: [CARD_C.x, CARD_C.y + CARD_C.r, CARD_C.x, CARD_C.y - CARD_C.r] } });
    await pc(x, { band: [-170, 1330, W + 170, 1290, 560, 600] }, C.paper, { seed: 240 + i, amp: 12, dotgrid: { cell: 24, r: 0.07, angle: 8 } });
  });
  async function cardScene(ctx, t, i) {
    const t0 = T.c[i], tq = q(t), lt = Math.max(0, tq - t0);
    await zoomAbout(ctx, 1 + 0.03 * lt, W / 2, CARD_C.y, async () => {
      drawLayer(ctx, await cardLayer(i));
      const s = CL.slap(tq, t0 + 2 / 12, { from: 1.5, rot0: i % 2 ? 10 : -10 });
      if (s.on) { const b = CL.bob(t, 30 + i, 4); await icon(ctx, ICONS[i], CARD_C.x + b.dx, CARD_C.y + b.dy, 230, { sc: s.s, spin: s.rot + b.rot, color: ICON_COL[i] }); }
      await X.tag(ctx, 70, 120, `${i + 1} / 4`, { t: tq, t0: t0 + 1 / 12, color: TAGC[i], font: 'mono', size: 46, anchor: 'left', rot: -0.03, tape: 'top' });
      if (i === 3) await tagAt(ctx, W - 70, 120, COPY.finally, tq, t0 + 1 / 12, 'yellow', { anchor: 'right', rot: 0.03 });
      const lines = COPY.cards[i];
      let st = i === 3 ? T.paid : t0 + 1 / 12;
      for (let l = 0; l < lines.length; l++) {
        const y = 1250 + (l - (lines.length - 1) / 2) * 175;
        await ransomLine(ctx, lines[l], y, tq, st, 40 + i * 5 + l);
        st += lines[l].replace(/ /g, '').length / 24;
      }
    });
  }

  /* ======================================================================= 18.23–21.88 · équilibre (Venn) → push into the IKIGAI star */
  const VC = { x: W / 2, y: 1000, d: 195, r: 290 };
  const VPOS = [[0, -1], [-1, 0], [1, 0], [0, 1]];
  const vennLayer = () => CL.layer('venn', async (x) => {
    await pc(x, [-150, -150, W + 300, H + 300], { color: C.paper, speck: 0.3 }, { seed: 300, amp: 2, shadow: false, news: { alpha: 0.18, angle: 0 } });
    await pc(x, { band: [-170, 180, W + 170, 250, 260, 220] }, { color: C.navy, speck: 0.3 }, { seed: 301, amp: 12 });
    await pc(x, { band: [-170, 1720, W + 170, 1660, 160, 130] }, { color: C.orange, brush: 0.6 }, { seed: 302, amp: 11 });
    await pc(x, { band: [-170, 1890, W + 170, 1840, 160, 140] }, { color: C.cobalt }, { seed: 303, amp: 11, halftone: { color: '#0B3A92', cell: 16, angle: 20, r: [0.06, 0.4], grad: [0, 1950, 0, 1760] } });
  });
  async function vennDraw(ctx, t) {
    const tq = q(t);
    drawLayer(ctx, await vennLayer());
    await ransomLine(ctx, COPY.balance, 230, tq, T.venn + 1 / 12, 61, { max: 120 });
    for (let i = 0; i < 4; i++) { // circles fly in from their side (3 drawings each, staggered) and overlap like tissue paper
      const t0 = T.venn + 2 / 12 + i * 2 / 12, f = drawingIdx(t, t0); if (f < 0) continue;
      const k = [1, 0.42, 0.1][f] ?? 0, [vx, vy] = VPOS[i], b = CL.bob(t, 50 + i, 3), x = VC.x + vx * (VC.d + k * 1100) + b.dx, y = VC.y + vy * (VC.d + k * 1100) + b.dy;
      ctx.save(); ctx.globalAlpha = 0.84;
      await CL.piece(ctx, { circle: [0, 0, VC.r] }, { color: CIRC[i], brush: 0.5 }, { seed: 230 + i, amp: 10, shadow: false, x, y, spin: b.rot, px: 0, py: 0, halftone: { color: 'rgba(255,255,255,0.3)', cell: 15, angle: 25, r: [0.35, 0.04], grad: [0, VC.r, 0, -VC.r] } });
      ctx.restore();
      if (f >= 2) await icon(ctx, ICONS[i], VC.x + vx * (VC.d + 150) + b.dx, VC.y + vy * (VC.d + 150) + b.dy, 70, { spin: b.rot, color: ICON_COL[i] });
    }
    await tagAt(ctx, W / 2, 1590, COPY.direction, tq, 19.25, 'yellow', { size: 52 });
    await tagAt(ctx, W / 2, 1720, COPY.sense, tq, T.sense + 1 / 12, 'white', { size: 52, rot: 0.03 });
    if (tq >= T.sense) await X.star(ctx, VC.x, VC.y, 118, t, { points: 12, inner: 0.72, color: X.PAL.yellow, text: COPY.center, seed: 5, pop: popK(t, T.sense) });
  }
  async function vennScene(ctx, t) {
    const tq = q(t), pz = prog(tq, T.push[0], T.push[1] - 0.04), e = pz * pz, z = (1 + 0.02 * Math.max(0, tq - T.venn)) * Math.pow(46, e), m = E.inOut3(clamp(pz * 1.3));
    const sx = lerp(VC.x, W / 2, m), sy = lerp(VC.y, H / 2, m), rS = 104 * z;
    const covered = rS * 0.95 > Math.hypot(W / 2 + Math.abs(sx - W / 2), H / 2 + Math.abs(sy - H / 2)) + 40;
    if (!covered) { ctx.save(); ctx.translate(sx, sy); ctx.scale(z, z); ctx.translate(-VC.x, -VC.y); await vennDraw(ctx, t); ctx.restore(); }
    if (tq >= T.push[0] + 2 / 12) { // a paper iris opens inside the IKIGAI star; its centre is the kaleidoscope already zooming
      const ki = prog(tq, T.push[0] + 0.3, T.push[1] - 0.06), pop = lerp(0.55, 1, clamp(drawingIdx(t, T.push[0] + 2 / 12) / 2));
      await X.iris(ctx, sx, sy, rS * pop, ki, t, { n: 6, spin: 1.2, drawCenter: ki > 0.12 ? async (c, cx, cy, rr, tt) => {
        const kb = await kalBuf(tt), s = rr / (Math.hypot(W, H) / 2); c.drawImage(kb, cx - (KS / 2) * s, cy - (KS / 2) * s, KS * s, KS * s);
      } : null });
    }
  }

  /* ======================================================================= 21.88–24.89 · kaleidoscope (t'épanouir) */
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
  const HOLE = [[24 + 8 / 12, 0.34], [24.75, 0.85]];
  const holeAt = (t) => { let h = 0; for (const [t0, v] of HOLE) if (t >= t0 - 1e-6) h = v; return h; };
  const kOpts = (t) => ({ segments: 8, rot: 0, twist: 0, zoom: 1.6, ratio: 0.5, levels: 7, srcScale: 2.1, rims: ['red', 'yellow', 'cyan', 'dots', 'red', 'yellow'], hole: holeAt(t), drawNext: (c, tt) => saveScene(c, tt), holeColor: '#F3A51C' });
  const kalDraw = async (ctx, t) => { const tq = q(t), src = await KSRC(); await X.kaleido(ctx, tq, async (c) => c.drawImage(src, 0, 0), kOpts(tq)); };
  const KS = Math.ceil(Math.hypot(W, H)) + 8;
  async function kalBuf(t) { const cv = buf('kal', KS, KS), x = cv.getContext('2d'); x.translate((KS - W) / 2, (KS - H) / 2); await kalDraw(x, t); return cv; }
  async function kalScene(ctx, t) {
    await kalDraw(ctx, t);
    const tq = q(t); if (tq >= HOLE[0][0]) return; // the words leave with the hex hole
    await tagAt(ctx, W / 2, 560, COPY.fully, tq, T.kal + 1 / 12, 'white', { size: 64 });
    await ransomLine(ctx, COPY.bloom, 960, tq, T.bloom + 1 / 12, 91, { max: 120, step: 1 / 12 });
    await tagAt(ctx, W / 2, 1180, COPY.projects, tq, 23.75, 'yellow', { size: 50, rot: 0.03 });
  }

  /* ======================================================================= 24.89–27.72 · enregistre cette vidéo */
  const BM = { x: W / 2, y: 610 };
  const bmPts = [[-170, -260, 1], [170, -260, 1], [170, 260, 1], [0, 130, 1], [-170, 260, 1]];
  const T_CLICK = 25.92;
  const saveLayer = () => CL.layer('save', async (x) => {
    await pc(x, [-150, -150, W + 300, H + 300], { color: C.pink, speck: 0.25 }, { seed: 700, amp: 2, shadow: false, dotgrid: { cell: 26, r: 0.08, angle: 15 } });
    await pc(x, { circle: [BM.x, BM.y, 400] }, { color: C.cobalt }, { seed: 701, amp: 12, halftone: { color: '#0B3A92', cell: 16, angle: 20, r: [0.06, 0.4], grad: [BM.x, BM.y - 400, BM.x, BM.y + 400] } });
    await pc(x, { band: [-170, 1330, W + 170, 1290, 520, 560] }, C.paper, { seed: 702, amp: 12, dotgrid: { cell: 24, r: 0.07, angle: 8 } });
    await pc(x, { band: [-170, 1860, W + 170, 1790, 190, 150] }, { color: C.sun, brush: 0.6 }, { seed: 703, amp: 12 });
  });
  async function saveScene(ctx, t) {
    const tq = q(t), lt = Math.max(0, tq - T.save);
    await zoomAbout(ctx, 1 + 0.025 * lt, W / 2, BM.y, async () => {
      drawLayer(ctx, await saveLayer());
      const clicked = tq >= T_CLICK;
      if (t >= T_CLICK && t < T_CLICK + 2 / 24) await X.star(ctx, BM.x, BM.y, 380, t, { points: 14, inner: 0.62, color: X.PAL.yellow, seed: 3, pop: 1 });
      const s = CL.slap(tq, T.save + 1 / 12, { from: 1.4, rot0: -8 }), sq = clicked && tq < T_CLICK + 2 / 12 ? 0.93 : 1;
      if (s.on) { const b = CL.bob(t, 7, 3);
        await CL.piece(ctx, { poly: bmPts }, clicked ? { color: C.red, speck: 0.3 } : C.paper, { seed: clicked ? 711 : 710, amp: 6, shadow: SHD, x: BM.x + b.dx, y: BM.y + b.dy, sc: s.s * sq, spin: s.rot + b.rot, px: 0, py: 0,
          halftone: clicked ? { color: 'rgba(255,220,210,0.4)', cell: 14, angle: 25, r: [0.4, 0.04], grad: [0, -260, 0, 260] } : undefined, dotgrid: clicked ? undefined : { cell: 20, r: 0.1 } }); }
      if (clicked) await X.confetti(ctx, t, T_CLICK, { x: BM.x, y: BM.y, n: 28, speed: 1400, spread: Math.PI * 2, gravity: 1200, dur: 0.9, seed: 33 });
      await tagAt(ctx, W / 2, 1050, COPY.dont, tq, T.save + 1 / 12, 'white');
      await ransomLine(ctx, COPY.save[0], 1220, tq, 25.25, 31);
      await ransomLine(ctx, COPY.save[1], 1380, tq, 25.25 + 11 / 24, 32);
      await tagAt(ctx, W / 2, 1580, COPY.forget, tq, T.forget + 1 / 12, 'yellow', { size: 52, rot: 0.03 });
      if (tq >= 25.5 && tq < 26.5) { // cursor glides in, clicks the bookmark, slides off
        const a = E.out3(prog(tq, 25.5, 25.84)), o = prog(tq, 26.1, 26.45);
        const x = lerp(W + 100, BM.x + 60, a) + o * 600, y = lerp(900, BM.y + 40, a) + o * 200;
        await X.cursor(ctx, x, y, t, { size: 130, click: t >= T_CLICK && t < T_CLICK + 2 / 24 ? 1 : 0 });
      }
    });
  }

  /* ======================================================================= 27.72–30.7 · tear → « à très vite ! » */
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
      const under = async (c) => { await saveScene(c, t); await X.logoBand(c, COPY.soon, t, { style: 'band', x: LOGO.x, y: LOGO.y, h: LOGO.h, size: LOGO.size, seed: 8, boil: true }); };
      if (tq < 28.2) await X.tear(ctx, prog(tq, T.end - 1 / 12, 28.2), async (c) => saveScene(c, t), under, TEAR);
      else { const A = buf('tover'); await saveScene(A.getContext('2d'), t); const B = buf('tunder'); await under(B.getContext('2d')); tearDone(ctx, A, B); }
      // « pour de nouvelles inspirations » on a paper sheet that slaps over the lower half
      const s = CL.slap(tq, T.ins, { from: 1.3, rot0: 5 });
      if (s.on) await CL.piece(ctx, [-540, -300, 1080, 600], { color: C.paper, speck: 0.2 }, { seed: 500, amp: 10, shadow: { dx: 10, dy: 16, blur: 20, alpha: 0.45 }, x: W / 2, y: 1480, sc: s.s, spin: 2 + s.rot, px: 0, py: 0 });
      await tagAt(ctx, W / 2, 1420, COPY.newIns, tq, T.ins + 1 / 12, 'cobalt', { size: 50 });
      await ransomLine(ctx, COPY.insp, 1590, tq, T.ins + 3 / 12, 82);
      if (tq >= 29.75) await X.star(ctx, 900, 1330, 80, t, { points: 12, inner: 0.7, color: X.PAL.yellow, seed: 6, pop: popK(t, 29.75), spin: 0.5 });
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
  const SEQ = [[0, philoScene], [T.bonheur, bonheurScene], [T.creation, creaScene], [T.principle, ikigaiScene], [T.c[0], card(0)], [T.c[1], card(1)], [T.c[2], card(2)], [T.c[3], card(3)], [T.venn, vennScene]];
  SEQ.forEach(([t0, fn], i) => {
    const t1 = i + 1 < SEQ.length ? SEQ[i + 1][0] : T.kal;
    if (i === 0) Cut(t0, t1, fn); else Cut(t0, t1, (ctx, t) => wipe(ctx, t, t0, SEQ[i - 1][1], fn, wipeN(i - 1)));
  });
  Cut(T.kal, T.save, kalScene);
  Cut(T.save, T.end, saveScene);
  Cut(T.end, T.dur, endScene);

  window.SCENES = { duration: T.dur, cuts, overlay: async (ctx, t) => { CL.printGrain(ctx, t, 0.05); } };
  window.COPY = COPY;
})();

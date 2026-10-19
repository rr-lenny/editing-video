/**
 * config.ts — SEUL fichier à modifier pour faire une nouvelle vidéo.
 *
 * Timeline voix-off (début de chaque phrase, mesuré sur public/audio/voix-off.mp3) :
 *  0.79 J'ai découvert une philosophie japonaise · 2.75 qui va changer ta perception du bonheur
 *  4.56 si tu as la volonté de vivre de ta création · 6.81 Ce principe · 7.76 c'est l'IKIGAI
 *  9.28 Elle repose sur 4 piliers fondamentaux · 11.44 Ce que tu aimes faire · 12.89 Ce en quoi tu es doué
 * 14.36 Ce dont le monde a besoin · 15.88 Et enfin, · 16.72 ce pour quoi tu es payé
 * 18.22 Cet équilibre permet de trouver ta direction · 20.27 remettre du sens à ta vie
 * 21.87 et de pouvoir pleinement · 23.04 t'épanouir dans tes projets créatifs
 * 24.85 N'hésite pas à enregistrer cette vidéo · 26.53 pour ne pas l'oublier
 * 27.72 et je te dis à très vite · 28.90 pour de nouvelles inspirations (fin de la voix : 30.18)
 *
 * Chaque coupe tombe 2 frames avant la phrase suivante. Les champs *At sont en secondes de la voix-off,
 * donc changer une durée de scène ne désynchronise jamais le texte.
 */
import { loadFont as loadPoppins } from '@remotion/google-fonts/Poppins';
import { loadFont as loadInstrumentSerif } from '@remotion/google-fonts/InstrumentSerif';
import { loadFont as loadJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono';
import type { SceneConfig, SfxName } from './types';

/* ------------------------------------------------------------------ vidéo */
export const VIDEO = {
  id: 'Ikigai',
  width: 1080,
  height: 1920,
  fps: 30,
};

/* ------------------------------------------------------------------ couleurs */
// Accent : vermillon « torii / soleil levant » — cohérent avec une philosophie japonaise, chaleureux et inspirant.
export const THEME = {
  paperTop: '#F1F1EF',
  paperBottom: '#E9E9E6',
  ink: '#141414',
  gray: '#8C8C88',
  grayLight: '#BDBDB8',
  accent: '#E8432E',
  accentSoft: '#F5A08F',
  petal: '#F4CFC7',
  white: '#FFFFFF',
  gridOpacity: 0.06,
};

/* ------------------------------------------------------------------ polices */
// Principe « accroche fine + titre très gras » : Instrument Serif italique (fine, élégante) + Poppins 900.
const kicker = loadInstrumentSerif('italic', { weights: ['400'], subsets: ['latin', 'latin-ext'] });
const keyword = loadPoppins('normal', { weights: ['600', '900'], subsets: ['latin', 'latin-ext'] });
const mono = loadJetBrainsMono('normal', { weights: ['400', '700'], subsets: ['latin', 'latin-ext'] });

export const FONTS = {
  kicker: { family: kicker.fontFamily, weight: 400, style: 'italic' as const, size: 66, tracking: -0.01 },
  keyword: { family: keyword.fontFamily, weight: 900, tracking: -0.045, lineHeight: 0.92, widthFactor: 0.72 },
  bold: { family: keyword.fontFamily, weight: 600, size: 50, tracking: -0.02 },
  mono: { family: mono.fontFamily, weight: 400 },
  /** Sous-ensemble de Noto Serif JP limité à 生き甲斐 (2 ko), servi depuis /public. */
  kanji: { family: 'IkigaiKanji', url: 'fonts/noto-serif-jp-ikigai.woff2', weight: '700' },
};

/* ------------------------------------------------------------------ cadre */
export const SAFE = { top: 250, bottom: 400, side: 70 };

/* ------------------------------------------------------------------ animation */
export const MOTION = {
  /** Easing des entrées. */
  easeIn: [0.22, 1, 0.36, 1] as const,
  /** Easing des mouvements / sorties. */
  easeMove: [0.65, 0, 0.35, 1] as const,
  /** Durée des transitions (frames) côté entrée et côté sortie. */
  transitionIn: 10,
  transitionOut: 8,
  /** Push-in lent sur chaque scène (échelle atteinte en fin de scène). */
  pushIn: 1.06,
  /** Rotation 3D max des objets (degrés). */
  tilt: 8,
};

/* ------------------------------------------------------------------ audio */
export const AUDIO = {
  voice: 'audio/voix-off.mp3',
  voiceVolume: 1,
  /** Pas de musique fournie : mettre { src: 'audio/music.mp3', volume: 0.18 } pour en ajouter une. */
  music: null as null | { src: string; volume: number },
};

/** Bibliothèque SFX : `peak` = seconde du pic dans le fichier, `length` = durée jouée max. */
export const SFX_LIBRARY: Record<SfxName, { src: string; peak: number; length?: number; volume: number }> = {
  whoosh: { src: 'sfx/whoosh.mp3', peak: 0.2, volume: 0.35 },
  whooshShort: { src: 'sfx/whoosh-short.mp3', peak: 0.5, volume: 0.3 },
  whooshLong: { src: 'sfx/whoosh-long.mp3', peak: 0.6, volume: 0.25 },
  whooshPop: { src: 'sfx/whoosh-pop.mp3', peak: 1.35, length: 2.2, volume: 0.3 },
  riser: { src: 'sfx/riser.m4a', peak: 2.9, length: 3.1, volume: 0.3 },
  key: { src: 'sfx/key.mp3', peak: 0.05, volume: 0.35 },
  typing: { src: 'sfx/typing.mp3', peak: 1.75, length: 2.4, volume: 0.25 },
  pageFlip: { src: 'sfx/page-flip.mp3', peak: 0.4, volume: 0.35 },
  flutter: { src: 'sfx/paper-flutter.mp3', peak: 0.3, length: 3, volume: 0.22 },
  flash: { src: 'sfx/flash.mp3', peak: 0.2, length: 1.2, volume: 0.25 },
};

/** SFX joué automatiquement sur chaque type de transition (pic sur la coupe). */
export const TRANSITION_SFX: Record<string, SfxName | null> = {
  'whip-left': 'whoosh',
  'whip-up': 'whoosh',
  zoom: 'whooshLong',
  pass: 'whooshShort',
  cut: 'pageFlip',
};

/* ------------------------------------------------------------------ images */
const IMG = {
  macintosh: 'assets/macintosh.png',
  ampoule: 'assets/ampoule.png',
  billet: 'assets/billet.png',
  liasse: 'assets/liasse-billets.png',
  cerveau: 'assets/cerveau.png',
  coeur: 'assets/coeur.png',
  mains: 'assets/mains.png',
  // 'assets/ballon.png' (ballon de basket) : aucun rapport avec le thème → volontairement non utilisé.
};

/* ------------------------------------------------------------------ scènes */
export const SCENES: SceneConfig[] = [
  {
    id: '01-philosophie',
    durationInFrames: 80,
    layout: 'hero',
    transition: 'zoom',
    text: {
      kicker: "j'ai découvert une",
      keyword: 'PHILOSOPHIE\nJAPONAISE',
      kickerAt: 0.79,
      keywordAt: 1.45,
      stagger: 16,
      reveal: 'words',
      size: 128,
      anchor: 'bottom',
      caption: 'Ikigai (生き甲斐) : de iki, « vivre », et kai, « ce qui en vaut la peine ».',
    },
    hero: { vector: 'sun', x: 540, y: 800, width: 430, color: true, ring: 'ink', dots: true, enter: 'pop' },
    particles: { shape: 'petal', count: 14, seed: 1, speed: 3.2, sizeMin: 26, sizeMax: 70, color: THEME.petal, accentRatio: 0.15 },
    arcs: [
      { from: [-120, 1180], control: [520, 380], to: [1220, 700], width: 3, color: 'ink', opacity: 0.5, delay: 6, duration: 34 },
      { from: [-200, 520], control: [300, 1400], to: [1300, 1500], width: 70, color: 'gray', opacity: 0.18, blur: 18, delay: 0, duration: 40 },
    ],
    deco: { barcode: 'tl', number: true, kanji: 'right' },
  },
  {
    id: '02-bonheur',
    durationInFrames: 55,
    layout: 'hero',
    transition: 'whip-left',
    text: {
      kicker: 'qui va changer ta perception du',
      keyword: 'BONHEUR',
      kickerAt: 2.75,
      keywordAt: 3.55,
      reveal: 'scramble',
      size: 170,
      anchor: 'top',
      caption: "Un changement de regard suffit parfois à rallumer l'envie.",
    },
    hero: {
      src: IMG.ampoule,
      suggestedName: 'ampoule.png',
      x: 540,
      y: 1100,
      width: 300,
      glow: true,
      color: true,
      colorAt: 3.55,
      ring: 'accent',
      dots: true,
      enter: 'drop',
    },
    particles: { shape: 'spark', count: 10, seed: 2, speed: 2.4, sizeMin: 18, sizeMax: 40, color: THEME.ink, accentRatio: 0.4 },
    arcs: [{ from: [1180, 300], control: [200, 900], to: [900, 1700], width: 3, color: 'ink', opacity: 0.45, delay: 2, duration: 30 }],
    sfx: [
      { name: 'key', sec: 3.6 },
      { name: 'key', sec: 3.78 },
    ],
    deco: { barcode: 'br', number: true },
  },
  {
    id: '03-creation',
    durationInFrames: 67,
    layout: 'hero',
    transition: 'zoom',
    text: {
      kicker: 'si tu as la volonté de vivre de ta',
      keyword: 'CRÉATION',
      kickerAt: 4.56,
      keywordAt: 5.7,
      reveal: 'slam',
      size: 165,
      anchor: 'bottom',
      caption: 'Écrire, filmer, dessiner, coder : faire de ce que tu crées ton métier.',
    },
    hero: { src: IMG.macintosh, suggestedName: 'ordinateur.png', x: 540, y: 790, width: 620, rotate: -3, ring: 'ink', dots: true, enter: 'rise' },
    extras: [{ src: IMG.macintosh, x: 1010, y: 1480, width: 520, rotate: 18, blur: 18, opacity: 0.5, enter: 'side' }],
    particles: { shape: 'heart', count: 12, seed: 3, speed: 3.6, sizeMin: 24, sizeMax: 58, color: THEME.grayLight, accentRatio: 0.3, delay: 8 },
    arcs: [{ from: [-100, 400], control: [700, 300], to: [1200, 1300], width: 3, color: 'ink', opacity: 0.45, delay: 4, duration: 30 }],
    sfx: [{ name: 'whooshPop', sec: 5.75 }],
    deco: { barcode: 'tr', number: true, kanji: 'left' },
  },
  {
    id: '04-ikigai',
    durationInFrames: 74,
    layout: 'punch',
    transition: 'cut',
    text: {
      kicker: "ce principe, c'est l'",
      keyword: 'IKIGAI',
      kickerAt: 6.81,
      keywordAt: 7.6,
      reveal: 'gather',
      size: 250,
      anchor: 'center',
      caption: '生き甲斐 — n. ce qui donne une raison de se lever le matin.',
    },
    particles: { shape: 'petal', count: 16, seed: 4, speed: 3, sizeMin: 24, sizeMax: 64, color: THEME.white, delay: 20 },
    arcs: [
      { from: [-100, 1500], control: [540, 500], to: [1180, 1500], width: 4, color: 'white', opacity: 0.7, delay: 22, duration: 30 },
      { from: [1200, 200], control: [300, 900], to: [-200, 1900], width: 90, color: 'white', opacity: 0.12, blur: 22, delay: 0, duration: 36 },
    ],
    sfx: [
      { name: 'riser', frame: 0 },
      { name: 'flash', sec: 7.76 },
    ],
    deco: { barcode: 'bl', number: true },
  },
  {
    id: '05-piliers',
    durationInFrames: 65,
    layout: 'pillars',
    transition: 'whip-up',
    text: {
      kicker: 'elle repose sur',
      keyword: '4',
      subline: 'PILIERS FONDAMENTAUX',
      sublineStyle: 'bold',
      kickerAt: 9.28,
      keywordAt: 9.55,
      sublineAt: 9.95,
      reveal: 'counter',
      counterTo: 4,
      size: 360,
      anchor: 'top',
    },
    items: [
      { src: IMG.coeur, label: 'aimer' },
      { src: IMG.cerveau, label: 'savoir-faire' },
      { src: IMG.mains, label: 'besoin' },
      { src: IMG.billet, label: 'revenu' },
    ],
    arcs: [{ from: [-80, 1700], control: [540, 900], to: [1160, 1700], width: 3, color: 'ink', opacity: 0.4, delay: 4, duration: 36 }],
    deco: { barcode: 'tr', number: true, kanji: 'left' },
  },
  {
    id: '06-aimer',
    durationInFrames: 44,
    layout: 'hero',
    transition: 'pass',
    passObject: IMG.coeur,
    text: {
      kicker: 'ce que tu',
      keyword: 'AIMES FAIRE',
      kickerAt: 11.44,
      keywordAt: 11.7,
      stagger: 5,
      reveal: 'words',
      size: 150,
      anchor: 'top',
      caption: 'Pilier 1 — la passion : ce que tu ferais même sans être payé.',
    },
    hero: { src: IMG.coeur, suggestedName: 'coeur.png', x: 540, y: 1090, width: 400, color: true, beat: true, ring: 'accent', dots: true, enter: 'pop' },
    particles: { shape: 'heart', count: 8, seed: 6, speed: 4, sizeMin: 20, sizeMax: 44, color: THEME.grayLight, accentRatio: 0.5 },
    deco: { number: true, index: '01' },
  },
  {
    id: '07-doue',
    durationInFrames: 44,
    layout: 'hero',
    transition: 'whip-left',
    text: {
      kicker: 'ce en quoi',
      keyword: 'TU ES DOUÉ',
      kickerAt: 12.89,
      keywordAt: 13.1,
      reveal: 'scramble',
      size: 150,
      anchor: 'bottom',
      caption: 'Pilier 2 — la vocation : tes talents, ce que tu fais mieux que la moyenne.',
    },
    hero: { src: IMG.cerveau, suggestedName: 'cerveau.png', x: 540, y: 800, width: 680, ring: 'ink', dots: true, enter: 'rise' },
    particles: { shape: 'spark', count: 10, seed: 7, speed: 2.6, sizeMin: 18, sizeMax: 42, color: THEME.ink, accentRatio: 0.3 },
    sfx: [
      { name: 'key', sec: 13.15 },
      { name: 'key', sec: 13.35 },
    ],
    deco: { number: true, index: '02' },
  },
  {
    id: '08-besoin',
    durationInFrames: 45,
    layout: 'hero',
    transition: 'whip-up',
    text: {
      kicker: 'ce dont le monde',
      keyword: 'A BESOIN',
      kickerAt: 14.36,
      keywordAt: 14.95,
      reveal: 'slam',
      size: 165,
      anchor: 'top',
      caption: 'Pilier 3 — la mission : ce que tu apportes aux autres.',
    },
    hero: { src: IMG.mains, suggestedName: 'mains-ouvertes.png', x: 540, y: 1170, width: 880, dots: true, enter: 'rise' },
    extras: [{ vector: 'globe', x: 540, y: 1010, width: 230, color: true, ring: 'accent', enter: 'pop', delay: 6 }],
    particles: { shape: 'dot', count: 14, seed: 8, speed: 2, sizeMin: 8, sizeMax: 18, color: THEME.ink, accentRatio: 0.3 },
    sfx: [{ name: 'whooshPop', sec: 14.98 }],
    deco: { number: true, index: '03' },
  },
  {
    id: '09-paye',
    durationInFrames: 71,
    layout: 'hero',
    transition: 'pass',
    passObject: IMG.billet,
    text: {
      kicker: 'et enfin, ce pour quoi',
      keyword: 'TU ES PAYÉ',
      kickerAt: 15.88,
      kickerStagger: 7,
      keywordAt: 17.05,
      reveal: 'gather',
      size: 150,
      anchor: 'bottom',
      caption: "Pilier 4 — la profession : la valeur que l'on accepte de t'échanger.",
    },
    hero: { src: IMG.liasse, suggestedName: 'liasse-billets.png', x: 540, y: 780, width: 620, rotate: -6, ring: 'ink', dots: true, enter: 'drop' },
    extras: [{ src: IMG.billet, x: 980, y: 300, width: 520, rotate: 24, blur: 16, opacity: 0.8, enter: 'side' }],
    particles: { shape: 'image', src: IMG.billet, count: 9, seed: 9, speed: 7, sizeMin: 150, sizeMax: 260, delay: 4 },
    sfx: [{ name: 'flutter', frame: 6 }],
    deco: { number: true, index: '04', barcode: 'tl' },
  },
  {
    id: '10-equilibre',
    durationInFrames: 61,
    layout: 'balance',
    transition: 'zoom',
    text: {
      kicker: 'cet équilibre permet de trouver ta',
      keyword: 'DIRECTION',
      kickerAt: 18.22,
      kickerStagger: 4,
      keywordAt: 19.25,
      reveal: 'words',
      size: 150,
      anchor: 'top',
    },
    items: [
      { src: IMG.coeur, label: 'ce que tu aimes' },
      { src: IMG.cerveau, label: 'ce en quoi tu es doué' },
      { src: IMG.billet, label: 'ce pour quoi tu es payé' },
      { src: IMG.mains, label: 'ce dont le monde a besoin' },
    ],
    deco: { barcode: 'br', number: true },
  },
  {
    id: '11-sens',
    durationInFrames: 48,
    layout: 'hero',
    transition: 'whip-left',
    text: {
      kicker: 'remettre du',
      keyword: 'SENS',
      subline: 'à ta vie',
      sublineStyle: 'kicker',
      kickerAt: 20.27,
      keywordAt: 20.45,
      sublineAt: 20.95,
      reveal: 'scramble',
      size: 250,
      anchor: 'top',
    },
    hero: { src: IMG.coeur, suggestedName: 'coeur.png', x: 820, y: 1230, width: 700, rotate: 14, color: true, beat: true, ring: 'accent', enter: 'side' },
    particles: { shape: 'petal', count: 10, seed: 11, speed: 3, sizeMin: 24, sizeMax: 60, color: THEME.petal },
    arcs: [{ from: [-100, 1300], control: [300, 600], to: [1180, 760], width: 3, color: 'ink', opacity: 0.45, delay: 2, duration: 28 }],
    sfx: [{ name: 'key', sec: 20.5 }],
    deco: { kanji: 'left' },
  },
  {
    id: '12-pleinement',
    durationInFrames: 35,
    layout: 'hero',
    transition: 'zoom',
    text: {
      kicker: 'et de pouvoir',
      keyword: 'PLEINEMENT',
      kickerAt: 21.87,
      keywordAt: 22.15,
      reveal: 'slam',
      size: 150,
      anchor: 'center',
    },
    hero: { vector: 'sun', x: 540, y: 960, width: 760, opacity: 0.12, color: true, ring: 'ink', enter: 'pop' },
    particles: { shape: 'petal', count: 20, seed: 12, speed: 5, sizeMin: 24, sizeMax: 70, color: THEME.petal, accentRatio: 0.2 },
    arcs: [
      { from: [-150, 700], control: [540, 1500], to: [1230, 700], width: 3, color: 'ink', opacity: 0.5, delay: 0, duration: 22 },
      { from: [1250, 300], control: [400, 500], to: [-200, 1600], width: 110, color: 'accent', opacity: 0.18, blur: 26, delay: 0, duration: 24 },
    ],
    sfx: [{ name: 'whooshPop', sec: 22.2 }],
    deco: { number: true, barcode: 'tr' },
  },
  {
    id: '13-epanouir',
    durationInFrames: 55,
    layout: 'hero',
    transition: 'whip-up',
    text: {
      kicker: '',
      keyword: "T'ÉPANOUIR",
      subline: 'dans tes projets créatifs',
      sublineStyle: 'kicker',
      kickerAt: 23.04,
      keywordAt: 23.0,
      sublineAt: 23.7,
      stagger: 4,
      reveal: 'words',
      size: 150,
      anchor: 'top',
      caption: 'Quand ce que tu crées a du sens, le travail ressemble à un jardin.',
    },
    hero: { src: IMG.macintosh, suggestedName: 'ordinateur.png', x: 600, y: 1260, width: 980, rotate: -9, ring: 'accent', dots: true, enter: 'rise' },
    particles: { shape: 'petal', count: 18, seed: 13, speed: 3.4, sizeMin: 26, sizeMax: 72, color: THEME.petal, accentRatio: 0.35 },
    deco: { barcode: 'bl', number: true },
  },
  {
    id: '14-enregistrer',
    durationInFrames: 50,
    layout: 'hero',
    transition: 'whip-left',
    text: {
      kicker: "n'hésite pas à",
      keyword: 'ENREGISTRER',
      subline: 'cette vidéo',
      sublineStyle: 'kicker',
      kickerAt: 24.85,
      keywordAt: 25.12,
      sublineAt: 25.8,
      reveal: 'typewriter',
      size: 140,
      anchor: 'bottom',
    },
    hero: { vector: 'bookmark', x: 540, y: 780, width: 300, color: true, colorAt: 25.7, ring: 'accent', dots: true, enter: 'drop' },
    particles: { shape: 'bookmark', count: 8, seed: 14, speed: 3, sizeMin: 22, sizeMax: 44, color: THEME.grayLight, accentRatio: 0.3, delay: 10 },
    sfx: [{ name: 'typing', sec: 25.12 }],
    deco: { barcode: 'tr', number: true },
  },
  {
    id: '15-oublier',
    durationInFrames: 36,
    layout: 'hero',
    transition: 'pass',
    passObject: IMG.cerveau,
    text: {
      kicker: 'pour ne pas',
      keyword: "L'OUBLIER",
      kickerAt: 26.53,
      keywordAt: 26.72,
      stagger: 4,
      reveal: 'words',
      size: 160,
      anchor: 'top',
    },
    hero: { src: IMG.cerveau, suggestedName: 'cerveau.png', x: 560, y: 1300, width: 1080, rotate: 8, ring: 'ink', enter: 'rise' },
    extras: [{ src: IMG.cerveau, x: 120, y: 420, width: 420, rotate: -20, blur: 18, opacity: 0.5, enter: 'side' }],
    deco: { kanji: 'right' },
  },
  {
    id: '16-a-tres-vite',
    durationInFrames: 35,
    layout: 'hero',
    transition: 'whip-up',
    text: {
      kicker: 'et je te dis',
      keyword: 'À TRÈS VITE',
      kickerAt: 27.72,
      keywordAt: 27.98,
      reveal: 'slam',
      size: 140,
      anchor: 'top',
    },
    hero: { src: IMG.mains, suggestedName: 'mains.png', x: 540, y: 1220, width: 1000, rotate: -8, wave: true, enter: 'rise' },
    particles: { shape: 'petal', count: 12, seed: 16, speed: 3.4, sizeMin: 24, sizeMax: 64, color: THEME.petal, accentRatio: 0.2 },
    sfx: [{ name: 'whooshPop', sec: 28.02 }],
    deco: { number: true, barcode: 'bl' },
  },
  {
    id: '17-cta',
    durationInFrames: 56,
    layout: 'cta',
    transition: 'zoom',
    text: {
      kicker: 'pour de nouvelles',
      keyword: 'INSPIRATIONS',
      kickerAt: 28.9,
      keywordAt: 29.3,
      reveal: 'words',
      size: 128,
      anchor: 'center',
    },
    hero: { src: IMG.ampoule, suggestedName: 'ampoule.png', x: 540, y: 620, width: 190, glow: true, color: true, colorAt: 29.4, ring: 'accent', enter: 'drop' },
    ctaChip: 'enregistre · partage · reviens',
    particles: { shape: 'spark', count: 8, seed: 17, speed: 1.6, sizeMin: 16, sizeMax: 34, color: THEME.ink, accentRatio: 0.5, delay: 14 },
    arcs: [{ from: [-100, 1400], control: [540, 1750], to: [1180, 1300], width: 3, color: 'ink', opacity: 0.4, delay: 6, duration: 30 }],
  },
];

/** Durée totale (frames) = somme des scènes. */
export const TOTAL_FRAMES = SCENES.reduce((sum, s) => sum + s.durationInFrames, 0);

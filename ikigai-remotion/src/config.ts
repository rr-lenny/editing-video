/**
 * config.ts : toute la vidéo est décrite ici.
 * Changer de vidéo = modifier ce fichier (textes, rôles typo, images, timings, audio, SFX).
 *
 * Convention de temps :
 *  - les séquences sont en FRAMES (30 fps), début `from` + `duration` ;
 *  - chaque séquence déborde de `overlap` frames sur la suivante (transition) ;
 *  - les mots sont calés en SECONDES ABSOLUES de la voix off (`at`).
 */

export const VIDEO = {
  fps: 30,
  width: 1080,
  height: 1920,
  durationInFrames: 921, // 30,70 s, calé sur la voix off
} as const;

/** Safe zones TikTok / Reels : rien d'important hors de ce cadre. */
export const SAFE = {top: 250, bottom: 400, right: 150, left: 0} as const;

/** Axe typographique : colonne de 800 px centrée sur x = 510 (dans la safe zone). */
export const TYPE_COLUMN = {left: 110, width: 800} as const;

export const THEME = {
  /** Seule couleur de la vidéo : vermillon « torii ». */
  text: '#C9412D', // corps du texte, plus profond pour la lecture sur papier clair
  glow: '#E5533D', // halo lumineux
  ink: '#1F1F1F', // noir d'encre adouci (jamais de noir pur)
  inkSoft: '#3A3A3A', // micro-légendes
  /** dégradés des titres « encre » (haut → bas) */
  inkGradient: ['#1F1F1F', '#8A8A86'],
  textGradient: ['#A8301E', '#F28A6C'],
  paperCenter: '#F5F5F3',
  paperMid: '#EEEEEB',
  paperEdge: '#E4E4E1',
  gridOpacity: 0.05,
  grainOpacity: 0.035,
} as const;

/* ------------------------------------------------------------------ */
/* Images (PNG détourés, toujours affichés en N&B)                     */
/* ------------------------------------------------------------------ */

export const ASSETS = {
  ampoule: {file: 'assets/ampoule.png', w: 512, h: 512, note: 'découverte, idée, lumière'},
  coeur: {file: 'assets/coeur.png', w: 443, h: 612, note: 'ce que tu aimes'},
  cerveau: {file: 'assets/cerveau.png', w: 990, h: 622, note: 'ce en quoi tu es doué'},
  mains: {file: 'assets/deux-mains.png', w: 1200, h: 712, note: 'ce dont le monde a besoin'},
  billet: {file: 'assets/billet.png', w: 2416, h: 2062, note: 'ce pour quoi tu es payé'},
  liasse: {file: 'assets/liasse-billets.png', w: 1824, h: 1710, note: 'ce pour quoi tu es payé'},
  macintosh: {file: 'assets/macintosh.png', w: 1561, h: 1378, note: 'création'},
  ball: {file: 'assets/ball.png', w: 800, h: 801, note: 'équilibre (métaphore)'},
} as const;

export type AssetName = keyof typeof ASSETS;

/** Placement d'un PNG : centre (x, y) et largeur affichée, en px. */
export interface ImagePlacement {
  asset: AssetName;
  x: number;
  y: number;
  width: number;
  rotate?: number;
  flipX?: boolean;
}

/* ------------------------------------------------------------------ */
/* Typographie                                                         */
/* ------------------------------------------------------------------ */

/**
 * sans      = Inter SemiBold 600 (mot fort, serré)
 * sansLight = Inter Medium 500 (accroches)
 * serif     = Garamond italique (réponse, mot émotionnel)
 * link      = petit mot de liaison en serif italique (« de », « et », « une »)
 * ink       = titre « encre imprimée » : Inter ExtraBold en capitales, très serré, bords qui bavent
 */
export type Role = 'sans' | 'sansLight' | 'serif' | 'link' | 'ink';
export type Reveal = 'blur' | 'maskRight' | 'maskUp' | 'type';

export interface WordSpec {
  kind?: 'word';
  text: string;
  role: Role;
  size: number;
  /** seconde absolue (voix off) à laquelle la révélation commence */
  at: number;
  /** mot-clé : halo complet */
  key?: boolean;
  /** 'color' (défaut) ou 'ink' (gris d'encre, mentions secondaires) */
  tone?: 'color' | 'ink';
  reveal?: Reveal;
  /** durée de la révélation en frames (défaut 22) */
  dur?: number;
  dx?: number;
  dy?: number;
  z?: number;
}

export interface RuleSpec {
  kind: 'rule';
  left?: string;
  right?: string;
  width: number;
  at: number;
}

export interface CaptionSpec {
  kind: 'caption';
  text: string;
  at: number;
  size?: number;
  dx?: number;
  dy?: number;
}

export type Item = WordSpec | RuleSpec | CaptionSpec;

export interface LineSpec {
  items: Item[];
  align?: 'left' | 'center' | 'right';
  dx?: number;
  /** marge haute en px, négative = lignes qui se chevauchent */
  mt?: number;
  gap?: number;
}

export interface CompositionSpec {
  top: number;
  left?: number;
  width?: number;
  lines: LineSpec[];
}

/* ------------------------------------------------------------------ */
/* Séquences (plan validé en Phase 2)                                  */
/* ------------------------------------------------------------------ */

export interface SequenceSpec {
  id: string;
  name: string;
  from: number;
  duration: number;
  overlap: number;
  voice: string;
  /** centre de la lumière du papier (suit le sujet) */
  light: [number, number];
  type?: CompositionSpec;
  images?: Record<string, ImagePlacement>;
}

export const SEQUENCES: SequenceSpec[] = [
  {
    id: 'S01',
    name: 'Hook : philosophie japonaise',
    from: 0,
    duration: 79,
    overlap: 15,
    voice: "J'ai découvert une philosophie japonaise",
    light: [520, 1020],
    type: {
      top: 350,
      lines: [
        {align: 'left', dx: 6, items: [{kind: 'caption', text: "J'ai découvert", at: 1.0}]},
        {align: 'left', dx: 190, mt: 30, items: [{text: 'une', role: 'ink', size: 118, at: 0, tone: 'ink'}]},
        {align: 'left', dx: -30, mt: 22, items: [{text: 'philosophie', role: 'ink', size: 112, at: 0.1, tone: 'ink'}]},
        {align: 'right', dx: 0, mt: 22, items: [{text: 'japonaise', role: 'ink', size: 134, at: 0.23, key: true}]},
      ],
    },
    images: {
      ampoule: {asset: 'ampoule', x: 520, y: 1130, width: 480, rotate: -2},
    },
  },
  {id: 'S02', name: 'Perception du bonheur', from: 79, duration: 53, overlap: 15, voice: 'qui va changer ta perception du bonheur', light: [360, 1200]},
  {id: 'S03', name: 'Vivre de ta création', from: 132, duration: 65, overlap: 15, voice: 'si tu as la volonté de vivre de ta création', light: [540, 1150]},
  {id: 'S04', name: 'Révélation IKIGAI', from: 197, duration: 72, overlap: 15, voice: "Ce principe, c'est l'IKIGAI", light: [520, 820]},
  {id: 'S05', name: '4 piliers', from: 269, duration: 67, overlap: 15, voice: 'Elle repose sur 4 piliers fondamentaux', light: [520, 1100]},
  {id: 'S06', name: 'Pilier 1 : aimer', from: 336, duration: 44, overlap: 12, voice: 'Ce que tu aimes faire', light: [520, 1000]},
  {id: 'S07', name: 'Pilier 2 : doué', from: 380, duration: 43, overlap: 12, voice: 'Ce en quoi tu es doué', light: [760, 700]},
  {id: 'S08', name: 'Pilier 3 : besoin', from: 423, duration: 48, overlap: 12, voice: 'Ce dont le monde a besoin', light: [520, 1250]},
  {id: 'S09', name: 'Pilier 4 : payé', from: 471, duration: 68, overlap: 15, voice: 'Et enfin, ce pour quoi tu es payé', light: [330, 1300]},
  {id: 'S10', name: 'Équilibre / direction', from: 539, duration: 66, overlap: 15, voice: 'Cet équilibre permet de trouver ta direction', light: [520, 1050]},
  {id: 'S11', name: 'Du sens à ta vie', from: 605, duration: 46, overlap: 12, voice: 'remettre du sens à ta vie', light: [300, 500]},
  {id: 'S12', name: "T'épanouir", from: 651, duration: 89, overlap: 15, voice: "et de pouvoir pleinement t'épanouir dans tes projets créatifs", light: [760, 1300]},
  {id: 'S13', name: 'CTA : enregistre', from: 740, duration: 86, overlap: 15, voice: "N'hésite pas à enregistrer cette vidéo pour ne pas l'oublier", light: [520, 820]},
  {id: 'S14', name: 'Fin / boucle', from: 826, duration: 95, overlap: 0, voice: 'et je te dis à très vite pour de nouvelles inspirations', light: [520, 1020]},
];

export const getSequence = (id: string): SequenceSpec => {
  const s = SEQUENCES.find((q) => q.id === id);
  if (!s) throw new Error(`Séquence inconnue : ${id}`);
  return s;
};

/* ------------------------------------------------------------------ */
/* Audio                                                               */
/* ------------------------------------------------------------------ */

/** Phrases de la voix off (détection des pauses, secondes). */
export const VOICE_TIMINGS = [
  {start: 0.79, end: 2.49, text: "J'ai découvert une philosophie japonaise"},
  {start: 2.75, end: 4.21, text: 'qui va changer ta perception du bonheur'},
  {start: 4.57, end: 6.29, text: 'si tu as la volonté de vivre de ta création'},
  {start: 6.81, end: 7.51, text: "Ce principe, c'est"},
  {start: 7.76, end: 8.67, text: "l'IKIGAI"},
  {start: 9.28, end: 10.96, text: 'Elle repose sur 4 piliers fondamentaux'},
  {start: 11.44, end: 12.46, text: 'Ce que tu aimes faire'},
  {start: 12.89, end: 13.86, text: 'Ce en quoi tu es doué'},
  {start: 14.36, end: 15.54, text: 'Ce dont le monde a besoin'},
  {start: 15.88, end: 16.4, text: 'Et enfin,'},
  {start: 16.72, end: 17.74, text: 'ce pour quoi tu es payé'},
  {start: 18.22, end: 20.07, text: 'Cet équilibre permet de trouver ta direction'},
  {start: 20.27, end: 21.53, text: 'remettre du sens à ta vie'},
  {start: 21.87, end: 22.78, text: 'et de pouvoir pleinement'},
  {start: 23.04, end: 24.49, text: "t'épanouir dans tes projets créatifs"},
  {start: 24.83, end: 26.35, text: "N'hésite pas à enregistrer cette vidéo"},
  {start: 26.53, end: 27.37, text: "pour ne pas l'oublier"},
  {start: 27.72, end: 28.79, text: 'et je te dis à très vite'},
  {start: 28.91, end: 30.18, text: 'pour de nouvelles inspirations'},
] as const;

export const AUDIO = {
  voiceover: {file: 'audio/voiceover.mp3', volume: 1},
  /** Pas de musique pour cette vidéo. Renseigner {file, volume, bpm} pour en ajouter une. */
  music: null as null | {file: string; volume: number; bpm?: number},
} as const;

export interface SfxSpec {
  file: string;
  /** seconde absolue où le son démarre */
  at: number;
  /** début du segment dans le fichier source (s) */
  trimBefore: number;
  /** durée jouée (s) */
  duration: number;
  volume: number;
  role: string;
}

/** 7 SFX, tous placés dans des respirations de la voix. */
export const SFX: SfxSpec[] = [
  {file: 'sfx/paper-flutter.mp3', at: 0.05, trimBefore: 0, duration: 0.6, volume: 0.35, role: 'Hook'},
  {file: 'sfx/soft-tick.mp3', at: 4.4, trimBefore: 0, duration: 0.35, volume: 0.25, role: 'Changement de séquence (création)'},
  {file: 'sfx/soft-whoosh.mp3', at: 7.55, trimBefore: 0.25, duration: 0.85, volume: 0.3, role: 'Révélation IKIGAI'},
  {file: 'sfx/page-flip.mp3', at: 11.05, trimBefore: 0.2, duration: 0.6, volume: 0.4, role: 'Ouverture des 4 piliers'},
  {file: 'sfx/wind-swoosh.mp3', at: 17.82, trimBefore: 1.4, duration: 1.6, volume: 0.25, role: "Changement d'acte"},
  {file: 'sfx/soft-riser.mp3', at: 23.55, trimBefore: 5.6, duration: 1.3, volume: 0.25, role: 'Montée avant le CTA'},
  {file: 'sfx/paper-flutter.mp3', at: 27.45, trimBefore: 7.4, duration: 0.6, volume: 0.3, role: 'Retour / boucle'},
];

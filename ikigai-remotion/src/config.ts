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
  /** Seule couleur de la vidéo : violet lumineux. */
  text: '#6236CF', // corps du texte, plus profond pour la lecture sur papier clair
  glow: '#8C6CF2', // halo lumineux
  ink: '#1F1F1F', // noir d'encre adouci (jamais de noir pur)
  inkSoft: '#3A3A3A', // micro-légendes
  /** dégradés des titres « encre » (haut → bas) */
  inkGradient: ['#1F1F1F', '#8A8A86'],
  textGradient: ['#4A22B0', '#A88CF8'],
  paperCenter: '#F5F5F3',
  paperMid: '#EEEEEB',
  paperEdge: '#E4E4E1',
  paperDeep: '#D2D2CC', // ombres du dégradé de fond
  gridOpacity: 0.065,
  grainOpacity: 0.045,
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
  /** typographie fantôme : grand mot contouré qui glisse derrière la scène */
  ghost?: {text: string; y: number};
  type?: CompositionSpec;
  images?: Record<string, ImagePlacement>;
}

export const SEQUENCES: SequenceSpec[] = [
  {
    id: 'S01',
    name: 'Hook : philosophie japonaise',
    ghost: {text: 'Découverte', y: 1520},
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
  {
    id: 'S02',
    name: 'Perception du bonheur',
    ghost: {text: 'Bonheur', y: 1180},
    from: 79,
    duration: 53,
    overlap: 15,
    voice: 'qui va changer ta perception du bonheur',
    light: [360, 1200],
    type: {
      top: 320,
      lines: [
        {align: 'left', dx: 0, items: [{text: 'qui va changer ta', role: 'ink', size: 54, at: 2.7, tone: 'ink'}]},
        {align: 'right', dx: 0, mt: 26, items: [{text: 'perception', role: 'ink', size: 116, at: 2.82, tone: 'ink'}]},
        {
          align: 'left',
          dx: 10,
          mt: 26,
          items: [
            {text: 'du', role: 'link', size: 72, at: 2.92, tone: 'ink'},
            {text: 'bonheur', role: 'ink', size: 150, at: 3.0, key: true},
          ],
        },
      ],
    },
    images: {coeur: {asset: 'coeur', x: 190, y: 1390, width: 620, rotate: -8}},
  },
  {
    id: 'S03',
    name: 'Vivre de ta création',
    ghost: {text: 'Création', y: 1560},
    from: 132,
    duration: 65,
    overlap: 15,
    voice: 'si tu as la volonté de vivre de ta création',
    light: [540, 1150],
    type: {
      top: 300,
      lines: [
        {align: 'left', items: [{text: 'si tu as la volonté', role: 'ink', size: 52, at: 4.5, tone: 'ink'}]},
        {align: 'left', mt: 24, items: [{text: 'de vivre de ta', role: 'ink', size: 86, at: 4.68, tone: 'ink'}]},
        {align: 'right', mt: 24, items: [{text: 'création', role: 'ink', size: 160, at: 5.15, key: true}]},
        {align: 'right', mt: 34, items: [{kind: 'rule', left: 'vivre', right: 'créer', width: 200, at: 5.4}]},
      ],
    },
    images: {macintosh: {asset: 'macintosh', x: 520, y: 1215, width: 600, rotate: 1}},
  },
  {
    id: 'S04',
    name: 'Révélation IKIGAI',
    ghost: {text: 'Ikigai', y: 1440},
    from: 197,
    duration: 72,
    overlap: 15,
    voice: "Ce principe, c'est l'IKIGAI",
    light: [520, 900],
    type: {
      top: 640,
      lines: [
        {align: 'left', dx: 20, items: [{text: 'ce principe,', role: 'ink', size: 66, at: 6.81, tone: 'ink'}]},
        {align: 'left', dx: 60, mt: 18, items: [{text: "c'est l'", role: 'link', size: 72, at: 7.2, tone: 'ink'}]},
        {align: 'center', mt: 14, items: [{text: 'ikigai', role: 'ink', size: 214, at: 7.76, key: true, dur: 22}]},
        {align: 'center', mt: 40, items: [{kind: 'rule', left: 'n.', right: "raison d'être", width: 220, at: 8.1}]},
        {align: 'center', mt: 34, items: [{kind: 'caption', text: 'Philosophie japonaise ®', at: 8.3}]},
      ],
    },
  },
  {
    id: 'S05',
    name: '4 piliers',
    ghost: {text: 'Piliers', y: 1660},
    from: 269,
    duration: 67,
    overlap: 15,
    voice: 'Elle repose sur 4 piliers fondamentaux',
    light: [520, 1100],
    type: {
      top: 300,
      lines: [
        {align: 'left', items: [{text: 'elle repose sur', role: 'ink', size: 58, at: 9.2, tone: 'ink'}]},
        {
          align: 'left',
          dx: 30,
          mt: 26,
          gap: 26,
          items: [
            {text: '4', role: 'ink', size: 210, at: 9.55, key: true},
            {text: 'piliers', role: 'ink', size: 124, at: 9.7, tone: 'ink'},
          ],
        },
        {align: 'right', mt: 26, items: [{text: 'fondamentaux', role: 'ink', size: 82, at: 10.15, tone: 'ink'}]},
      ],
    },
    images: {
      coeur: {asset: 'coeur', x: 340, y: 1095, width: 170, rotate: -3},
      cerveau: {asset: 'cerveau', x: 700, y: 1095, width: 250, rotate: 2},
      mains: {asset: 'mains', x: 340, y: 1365, width: 260, rotate: 2},
      billet: {asset: 'billet', x: 700, y: 1365, width: 240, rotate: -3},
    },
  },
  {
    id: 'S06',
    name: 'Pilier 1 : aimer',
    ghost: {text: 'Passion', y: 1560},
    from: 336,
    duration: 44,
    overlap: 12,
    voice: 'Ce que tu aimes faire',
    light: [520, 1050],
    type: {
      top: 290,
      lines: [
        {align: 'left', items: [{kind: 'caption', text: '01 — Passion', at: 11.5}]},
        {align: 'left', mt: 24, items: [{text: 'ce que tu', role: 'ink', size: 72, at: 11.3, tone: 'ink'}]},
        {align: 'center', mt: 22, items: [{text: 'aimes', role: 'ink', size: 190, at: 11.42, key: true}]},
        {align: 'right', mt: 22, items: [{text: 'faire', role: 'ink', size: 110, at: 11.6, tone: 'ink'}]},
      ],
    },
    images: {coeur: {asset: 'coeur', x: 520, y: 1190, width: 400, rotate: 2}},
  },
  {
    id: 'S07',
    name: 'Pilier 2 : doué',
    ghost: {text: 'Talent', y: 1640},
    from: 380,
    duration: 43,
    overlap: 12,
    voice: 'Ce en quoi tu es doué',
    light: [760, 1150],
    type: {
      top: 320,
      lines: [
        {align: 'left', items: [{kind: 'caption', text: '02 — Talent', at: 13.0}]},
        {align: 'left', mt: 24, items: [{text: 'ce en quoi', role: 'ink', size: 74, at: 12.72, tone: 'ink'}]},
        {align: 'left', mt: 22, items: [{text: 'tu es', role: 'ink', size: 96, at: 12.84, tone: 'ink'}]},
        {align: 'left', mt: 22, items: [{text: 'doué', role: 'ink', size: 214, at: 12.98, key: true}]},
      ],
    },
    images: {cerveau: {asset: 'cerveau', x: 800, y: 1230, width: 880, rotate: -6}},
  },
  {
    id: 'S08',
    name: 'Pilier 3 : besoin',
    ghost: {text: 'Mission', y: 880},
    from: 423,
    duration: 48,
    overlap: 12,
    voice: 'Ce dont le monde a besoin',
    light: [520, 1250],
    type: {
      top: 300,
      lines: [
        {align: 'center', items: [{kind: 'caption', text: '03 — Mission', at: 14.45}]},
        {align: 'center', mt: 24, items: [{text: 'ce dont', role: 'ink', size: 74, at: 14.18, tone: 'ink'}]},
        {align: 'center', mt: 22, items: [{text: 'le monde a', role: 'ink', size: 100, at: 14.3, tone: 'ink'}]},
        {align: 'center', mt: 22, items: [{text: 'besoin', role: 'ink', size: 190, at: 14.45, key: true}]},
      ],
    },
    images: {mains: {asset: 'mains', x: 520, y: 1250, width: 920}},
  },
  {
    id: 'S09',
    name: 'Pilier 4 : payé',
    ghost: {text: 'Profession', y: 820},
    from: 471,
    duration: 68,
    overlap: 15,
    voice: 'Et enfin, ce pour quoi tu es payé',
    light: [330, 1300],
    type: {
      top: 300,
      lines: [
        {align: 'left', items: [{kind: 'caption', text: '04 — Profession', at: 16.75}]},
        {align: 'left', mt: 24, items: [{text: 'et enfin,', role: 'link', size: 72, at: 15.85, tone: 'ink'}]},
        {align: 'left', mt: 22, items: [{text: 'ce pour quoi', role: 'ink', size: 84, at: 16.62, tone: 'ink'}]},
        {
          align: 'right',
          mt: 22,
          gap: 22,
          items: [
            {text: 'tu es', role: 'ink', size: 90, at: 16.75, tone: 'ink'},
            {text: 'payé', role: 'ink', size: 196, at: 16.88, key: true},
          ],
        },
      ],
    },
    images: {
      liasse: {asset: 'liasse', x: 250, y: 1400, width: 760, rotate: -6},
      billet: {asset: 'billet', x: 850, y: 1040, width: 380, rotate: 10},
    },
  },
  {
    id: 'S10',
    name: 'Équilibre / direction',
    ghost: {text: 'Équilibre', y: 1600},
    from: 539,
    duration: 66,
    overlap: 15,
    voice: 'Cet équilibre permet de trouver ta direction',
    light: [520, 1180],
    type: {
      top: 290,
      lines: [
        {
          align: 'left',
          gap: 20,
          items: [
            {text: 'cet', role: 'link', size: 76, at: 18.2, tone: 'ink'},
            {text: 'équilibre', role: 'ink', size: 118, at: 18.3, tone: 'ink'},
          ],
        },
        {align: 'right', mt: 24, items: [{text: 'permet de trouver ta', role: 'ink', size: 54, at: 18.75, tone: 'ink'}]},
        {align: 'center', mt: 24, items: [{text: 'direction', role: 'ink', size: 142, at: 19.15, key: true}]},
      ],
    },
    images: {ball: {asset: 'ball', x: 520, y: 1200, width: 400}},
  },
  {
    id: 'S11',
    name: 'Du sens à ta vie',
    ghost: {text: 'Sens', y: 1380},
    from: 605,
    duration: 46,
    overlap: 12,
    voice: 'remettre du sens à ta vie',
    light: [330, 700],
    type: {
      top: 720,
      lines: [
        {align: 'left', dx: 20, items: [{text: 'remettre du', role: 'ink', size: 82, at: 20.15, tone: 'ink'}]},
        {align: 'center', mt: 22, items: [{text: 'sens', role: 'ink', size: 236, at: 20.3, key: true}]},
        {align: 'right', mt: 22, items: [{text: 'à ta vie', role: 'ink', size: 104, at: 20.5, tone: 'ink'}]},
      ],
    },
    images: {ampoule: {asset: 'ampoule', x: 150, y: 330, width: 430, rotate: 172}},
  },
  {
    id: 'S12',
    name: "T'épanouir",
    ghost: {text: 'Épanouir', y: 880},
    from: 651,
    duration: 89,
    overlap: 15,
    voice: "et de pouvoir pleinement t'épanouir dans tes projets créatifs",
    light: [700, 1300],
    type: {
      top: 290,
      lines: [
        {align: 'left', items: [{text: 'et de pouvoir', role: 'ink', size: 66, at: 21.85, tone: 'ink'}]},
        {align: 'left', mt: 24, items: [{text: 'pleinement', role: 'ink', size: 120, at: 22.1, tone: 'ink'}]},
        {align: 'right', mt: 24, items: [{text: "t'épanouir", role: 'ink', size: 136, at: 23.0, key: true, dur: 24}]},
        {align: 'right', mt: 36, items: [{kind: 'rule', left: 'dans tes', right: 'projets créatifs', width: 150, at: 23.3}]},
      ],
    },
    images: {macintosh: {asset: 'macintosh', x: 760, y: 1360, width: 900, rotate: -4}},
  },
  {
    id: 'S13',
    name: 'CTA : enregistre',
    ghost: {text: 'Enregistre', y: 1420},
    from: 740,
    duration: 86,
    overlap: 15,
    voice: "N'hésite pas à enregistrer cette vidéo pour ne pas l'oublier",
    light: [520, 900],
    type: {
      top: 650,
      lines: [
        {align: 'left', items: [{text: "n'hésite pas à", role: 'ink', size: 70, at: 24.8, tone: 'ink'}]},
        {align: 'center', mt: 24, items: [{text: 'enregistre', role: 'ink', size: 134, at: 25.35, key: true, dur: 24}]},
        {align: 'right', mt: 24, items: [{text: 'cette vidéo', role: 'ink', size: 96, at: 25.7, tone: 'ink'}]},
        {align: 'center', mt: 44, items: [{kind: 'rule', left: 'pour ne pas', right: "l'oublier →", width: 130, at: 26.1}]},
      ],
    },
  },
  {
    id: 'S14',
    name: 'Fin / boucle',
    ghost: {text: 'Inspiration', y: 1520},
    from: 826,
    duration: 95,
    overlap: 0,
    voice: 'et je te dis à très vite pour de nouvelles inspirations',
    light: [520, 1020],
    type: {
      top: 320,
      lines: [
        {align: 'left', items: [{text: 'et je te dis', role: 'link', size: 64, at: 27.68, tone: 'ink'}]},
        {align: 'left', mt: 22, items: [{text: 'à très vite', role: 'ink', size: 118, at: 27.85, tone: 'ink'}]},
        {align: 'right', mt: 26, items: [{text: 'pour de nouvelles', role: 'ink', size: 58, at: 28.55, tone: 'ink'}]},
        {align: 'center', mt: 24, items: [{text: 'inspirations', role: 'ink', size: 110, at: 28.7, key: true}]},
      ],
    },
    images: {ampoule: {asset: 'ampoule', x: 520, y: 1130, width: 480, rotate: -2}},
  },
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

/**
 * SFX : aucun pour cette vidéo (voix off seule).
 * Pour en remettre, ajouter des entrées, ex. :
 * {file: 'sfx/soft-whoosh.mp3', at: 7.55, trimBefore: 0.25, duration: 0.85, volume: 0.3, role: 'Révélation IKIGAI'}
 */
export const SFX: SfxSpec[] = [];

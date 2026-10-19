// Types partagés. Les VALEURS vivent dans config.ts.

/** Technique de révélation du mot-clé. */
export type Reveal = 'words' | 'scramble' | 'typewriter' | 'gather' | 'slam' | 'counter';

/** Manière dont une scène ENTRE (la scène précédente sort avec le même mouvement). */
export type TransitionKind = 'cut' | 'whip-left' | 'whip-up' | 'zoom' | 'pass';

/** Gabarit de mise en page de la scène. */
export type Layout = 'hero' | 'punch' | 'pillars' | 'balance' | 'cta';

/** Objets 100 % code, utilisés quand aucune image ne convient. */
export type VectorKind = 'sun' | 'bookmark' | 'globe';

export type Anchor = 'top' | 'bottom' | 'center';

export interface ObjectConfig {
  /** Chemin dans /public (ex. 'assets/coeur.png'). null = image manquante → placeholder. */
  src?: string | null;
  /** Objet vectoriel à la place d'une image. */
  vector?: VectorKind;
  /** Nom suggéré affiché sur le placeholder si l'image manque. */
  suggestedName?: string;
  /** Centre de l'objet dans le cadre 1080×1920. */
  x: number;
  y: number;
  /** Largeur affichée en px. */
  width: number;
  /** Rotation de base en degrés. */
  rotate?: number;
  /** true = l'objet garde/obtient la couleur d'accent (sinon noir & blanc). */
  color?: boolean;
  /** Halo coloré derrière l'objet (ex. ampoule allumée). */
  glow?: boolean;
  /** Seconde (timeline voix-off) à laquelle la couleur / le halo s'allume. */
  colorAt?: number;
  /** Cercle en pointillés autour de l'objet. */
  ring?: 'ink' | 'accent' | false;
  /** Grille locale de points derrière l'objet. */
  dots?: boolean;
  /** Animation d'entrée. */
  enter?: 'pop' | 'rise' | 'drop' | 'side';
  /** Décalage d'entrée en frames depuis le début de la scène. */
  delay?: number;
  /** Battement (cœur). */
  beat?: boolean;
  /** Oscillation type « coucou » (mains). */
  wave?: boolean;
  /** Flou de premier plan (px). */
  blur?: number;
  opacity?: number;
}

export type ParticleShape = 'image' | 'heart' | 'spark' | 'petal' | 'confetti' | 'bookmark' | 'dot';

export interface ParticleConfig {
  shape: ParticleShape;
  /** Pour shape 'image'. */
  src?: string;
  count: number;
  seed: number;
  /** Vitesse moyenne de chute en px/frame. */
  speed: number;
  sizeMin: number;
  sizeMax: number;
  /** Couleur des formes vectorielles. */
  color?: string;
  /** Proportion de particules à la couleur d'accent (0..1). */
  accentRatio?: number;
  /** Frame locale de départ. */
  delay?: number;
}

export interface ArcConfig {
  /** Points de départ / contrôle / arrivée de la courbe (quadratique). */
  from: [number, number];
  control: [number, number];
  to: [number, number];
  width: number;
  color?: 'ink' | 'accent' | 'white' | 'gray';
  opacity?: number;
  /** Flou px — un arc épais flouté = premier plan. */
  blur?: number;
  /** Frame locale de départ du tracé. */
  delay?: number;
  /** Durée du tracé en frames. */
  duration?: number;
}

export interface TextConfig {
  /** Accroche fine (gris). Peut être vide. */
  kicker: string;
  /** Mot-clé énorme. '\n' = retour à la ligne. */
  keyword: string;
  /** Ligne secondaire sous le mot-clé. */
  subline?: string;
  sublineStyle?: 'kicker' | 'bold';
  /** Secondes dans la timeline de la voix-off. */
  kickerAt: number;
  keywordAt: number;
  sublineAt?: number;
  reveal: Reveal;
  /** Écart en frames entre deux mots du mot-clé (reveal 'words'). */
  stagger?: number;
  /** Écart en frames entre deux mots de l'accroche. */
  kickerStagger?: number;
  /** Taille max du mot-clé en px (réduite automatiquement si le mot est trop long). */
  size: number;
  anchor: Anchor;
  /** Mot-clé en couleur d'accent. */
  accent?: boolean;
  /** Pour reveal 'counter'. */
  counterTo?: number;
  /** Petit paragraphe « magazine » sous le titre (phrase réelle du thème). */
  caption?: string;
}

export interface SfxCue {
  name: SfxName;
  /** Le PIC du son tombe sur cette frame locale de la scène… */
  frame?: number;
  /** …ou sur cette seconde de la timeline voix-off. */
  sec?: number;
  volume?: number;
}

export type SfxName = 'whoosh' | 'whooshShort' | 'whooshLong' | 'whooshPop' | 'riser' | 'key' | 'typing' | 'pageFlip' | 'flutter' | 'flash';

export interface DecoConfig {
  barcode?: 'tl' | 'tr' | 'bl' | 'br' | false;
  /** Numéro de scène style magazine (ex. « N°06 »). */
  number?: boolean;
  /** Label vertical 生き甲斐 sur le côté. */
  kanji?: 'left' | 'right' | false;
  /** Grand chiffre de pilier (« 01 »…). */
  index?: string;
}

export interface SceneConfig {
  id: string;
  /** Durée de la scène en frames (30 fps). */
  durationInFrames: number;
  layout: Layout;
  text: TextConfig;
  hero?: ObjectConfig;
  /** Objets secondaires (premier plan flou, doublons recadrés…). */
  extras?: ObjectConfig[];
  /** Objets d'un gabarit 'pillars' / 'balance'. */
  items?: { src: string; label: string; suggestedName?: string }[];
  particles?: ParticleConfig;
  arcs?: ArcConfig[];
  /** Comment la scène entre. */
  transition: TransitionKind;
  /** Objet qui traverse l'écran pour la transition 'pass'. */
  passObject?: string;
  sfx?: SfxCue[];
  deco?: DecoConfig;
  /** Pour le gabarit 'cta' : petit bouton sous le titre. */
  ctaChip?: string;
}

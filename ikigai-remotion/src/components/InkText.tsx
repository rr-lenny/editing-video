import React, {useId} from 'react';
import {useCurrentFrame} from 'remotion';
import {THEME, VIDEO} from '../config';
import {EASE_DYN, EASE_SOFT, mix, ramp, svgId} from '../lib/anim';
import {FONTS} from '../lib/fonts';
import {useLight} from '../lib/light';

interface Props {
  text: string;
  size: number;
  /** frame locale de début */
  start: number;
  dur?: number;
  exitAt?: number;
  exitDur?: number;
  color?: string;
  /** dégradé vertical dans les lettres (haut → bas) ; remplace `color` */
  gradient?: readonly [string, string];
  /** décalage horizontal de départ (px) : le mot glisse en place avec un flou de mouvement */
  fromX?: number;
  /** frame locale où un reflet de lumière traverse le mot (mots-clés) */
  sheenAt?: number;
  /** graine du grain d'usure (varie d'un mot à l'autre) */
  seed?: number;
  style?: React.CSSProperties;
}

/**
 * Titre « encre imprimée » (ink bleed) : Inter ExtraBold en capitales, très serré.
 * Filtre SVG : flou de mouvement à l'entrée, bords rugueux (displacement), encre qui
 * s'étale dans le papier (halo), usures d'impression et densité irrégulière.
 * Ombre portée douce, orientée à l'opposé de la lumière : les lettres sont posées sur la feuille.
 * Mot-clé : un reflet de lumière le traverse une fois, juste après son apparition.
 */
export const InkText: React.FC<Props> = ({
  text,
  size,
  start,
  dur = 20,
  exitAt = Infinity,
  exitDur = 14,
  color = THEME.ink,
  gradient,
  fromX = 0,
  sheenAt,
  seed = 3,
  style,
}) => {
  const frame = useCurrentFrame();
  const light = useLight();
  const id = svgId(`ink-${useId()}`);
  const p = ramp(frame, start, dur, EASE_DYN);
  const soak = ramp(frame, start + 4, 30, EASE_SOFT);
  const e = ramp(frame, exitAt, exitDur, EASE_SOFT);

  const rough = mix(9, 3.2, p) + e * 6; // rugosité des bords (px)
  const spread = mix(0.4, 4, soak); // étalement de l'encre (px)
  const halo = 0.4 * soak * (1 - e); // halo d'encre absorbé par le papier
  const motion = Math.abs(fromX) * Math.pow(1 - p, 2) * 0.3; // flou de mouvement horizontal

  // ombre portée : à l'opposé de la lumière
  const shX = ((VIDEO.width / 2 - light[0]) / VIDEO.width) * 14;
  const shY = 7 + ((VIDEO.height / 2 - light[1]) / VIDEO.height) * 10;
  const shadowA = 0.2 * p * (1 - e);

  const sheen = sheenAt === undefined ? 0 : ramp(frame, sheenAt, 28, EASE_SOFT);
  const sheenOn = sheen > 0 && sheen < 1;

  return (
    <span
      style={{
        display: 'inline-block',
        position: 'relative',
        fontFamily: FONTS.sans,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 0.84,
        // très serré en grande taille, plus ouvert en petite taille pour que les mots respirent
        letterSpacing: size >= 140 ? '-0.045em' : size >= 90 ? '-0.035em' : size >= 70 ? '-0.022em' : '-0.01em',
        wordSpacing: size < 90 ? '0.1em' : '0.04em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        color: gradient ? 'transparent' : color,
        ...(gradient
          ? {
              // le dégradé couvre la hauteur des capitales (padding compris)
              backgroundImage: `linear-gradient(175deg, ${gradient[0]} 28%, ${gradient[1]} 78%)`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
            }
          : {}),
        padding: '0.2em 0.25em',
        margin: '-0.2em -0.25em',
        opacity: p * (1 - e),
        filter: [
          `url(#${id})`,
          `blur(${(1 - p) * 8 + e * 10}px)`,
          `drop-shadow(${shX}px ${shY}px ${10 + size * 0.04}px rgba(31,31,31,${shadowA}))`,
        ].join(' '),
        transform: `translateX(${(1 - p) * fromX - e * fromX * 0.4}px) scale(${mix(1.05, 1, p)}) translateY(${(1 - p) * 12 - e * 8}px)`,
        transformOrigin: 'left center',
        ...style,
      }}
    >
      <svg width={0} height={0} style={{position: 'absolute'}} aria-hidden>
        <filter id={id} x="-15%" y="-25%" width="130%" height="150%" colorInterpolationFilters="sRGB">
          {/* flou de mouvement pendant l'entrée */}
          <feGaussianBlur in="SourceGraphic" stdDeviation={`${motion} 0`} result="moved" />
          {/* bords rugueux */}
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={2} seed={seed} result="warp" />
          <feDisplacementMap in="moved" in2="warp" scale={rough} xChannelSelector="R" yChannelSelector="G" result="rough" />
          {/* l'encre bave : flou puis seuil doux sur l'alpha */}
          <feGaussianBlur in="rough" stdDeviation={spread * 0.45} result="soft" />
          <feComponentTransfer in="soft" result="bleed">
            <feFuncA type="linear" slope={1.8} intercept={-0.2} />
          </feComponentTransfer>
          {/* usure d'impression : quelques micro-manques dans l'encre */}
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves={2} seed={seed + 11} result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -9 0 0 0 7.1" result="wear" />
          <feComposite in="bleed" in2="wear" operator="in" result="worn" />
          {/* densité d'encre irrégulière (encrage à la main) */}
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={seed + 23} result="mottle" />
          <feColorMatrix in="mottle" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.9 0 0 0 0.5" result="density" />
          <feComposite in="worn" in2="density" operator="in" result="inked" />
          {/* halo d'encre absorbé par le papier */}
          <feGaussianBlur in="rough" stdDeviation={spread * 2.2} result="haloBlur" />
          <feComponentTransfer in="haloBlur" result="halo">
            <feFuncA type="linear" slope={halo} />
          </feComponentTransfer>
          <feMerge>
            <feMergeNode in="halo" />
            <feMergeNode in="inked" />
          </feMerge>
        </filter>
      </svg>
      {text}
      {sheenOn ? (
        // reflet : bande de lumière qui traverse les lettres de gauche à droite
        <span
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            padding: 'inherit',
            color: 'transparent',
            backgroundImage: 'linear-gradient(100deg, rgba(255,255,255,0) 38%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0) 62%)',
            backgroundSize: '260% 100%',
            backgroundPosition: `${mix(115, -15, sheen)}% 0`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            opacity: Math.sin(sheen * Math.PI) * (1 - e),
          }}
        >
          {text}
        </span>
      ) : null}
    </span>
  );
};

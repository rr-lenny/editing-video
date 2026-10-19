import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { THEME } from '../config';
import { Layer } from './Camera';

/**
 * Fond signature : papier blanc cassé + grille millimétrée (~6 %), vignettage doux, dégradé gris en bas.
 * Variante 'accent' pour la scène punch (couleur pleine + grille blanche).
 * La couche déborde du cadre (bleed) pour encaisser la parallaxe des transitions.
 */
export const GridBackground: React.FC<{ variant?: 'paper' | 'accent'; depth?: number }> = ({ variant = 'paper', depth = 0.3 }) => {
  const frame = useCurrentFrame();
  const drift = frame * 0.35; // dérive lente
  const accent = variant === 'accent';
  const line = accent ? 'rgba(255,255,255,0.13)' : `rgba(0,0,0,${THEME.gridOpacity})`;
  const minor = accent ? 'rgba(255,255,255,0.06)' : `rgba(0,0,0,${THEME.gridOpacity * 0.45})`;
  const bleed = 420;

  return (
    <>
      <Layer depth={depth}>
        <div
          style={{
            position: 'absolute',
            inset: -bleed,
            background: accent
              ? `linear-gradient(180deg, ${THEME.accent} 0%, #D7392A 100%)`
              : `linear-gradient(180deg, ${THEME.paperTop} 0%, ${THEME.paperBottom} 100%)`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: -bleed,
            backgroundImage: [
              `linear-gradient(${line} 2px, transparent 2px)`,
              `linear-gradient(90deg, ${line} 2px, transparent 2px)`,
              `linear-gradient(${minor} 1px, transparent 1px)`,
              `linear-gradient(90deg, ${minor} 1px, transparent 1px)`,
            ].join(','),
            backgroundSize: '135px 135px, 135px 135px, 27px 27px, 27px 27px',
            backgroundPosition: `${drift * 0.4}px ${drift}px`,
          }}
        />
      </Layer>
      {/* vignettage (fixe, comme un effet d'objectif : ne bouge pas avec la caméra) */}
      <AbsoluteFill
        style={{
          background: accent
            ? 'radial-gradient(ellipse 75% 60% at 50% 45%, rgba(0,0,0,0) 55%, rgba(80,0,0,0.35) 100%)'
            : 'radial-gradient(ellipse 80% 62% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.16) 100%)',
        }}
      />
      {/* dégradé gris en bas du cadre */}
      {!accent && <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 72%, rgba(120,120,116,0.22) 100%)' }} />}
    </>
  );
};

/** Grille locale de points derrière l'objet héros (plus dense, fondue sur les bords). */
export const DotGrid: React.FC<{ x: number; y: number; size: number; color?: string }> = ({ x, y, size, color = 'rgba(0,0,0,0.22)' }) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        backgroundImage: `radial-gradient(${color} 2.2px, transparent 2.6px), linear-gradient(rgba(0,0,0,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.07) 1px, transparent 1px)`,
        backgroundSize: '30px 30px, 60px 60px, 60px 60px',
        backgroundPosition: `${-frame * 0.2}px 0px, 15px 15px, 15px 15px`,
        WebkitMaskImage: 'radial-gradient(circle at 50% 50%, #000 30%, transparent 68%)',
        maskImage: 'radial-gradient(circle at 50% 50%, #000 30%, transparent 68%)',
      }}
    />
  );
};

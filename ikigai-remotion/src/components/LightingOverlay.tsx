import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {SEQUENCES, THEME, VIDEO} from '../config';
import {EASE_SOFT, mix, ramp, rgba} from '../lib/anim';
import {useLight} from '../lib/light';

/** Le faisceau démarre un peu avant chaque changement de scène et traverse l'écran. */
const SWEEP_LEAD = 10;
const SWEEP_DUR = 42;

/**
 * Éclairage cinématographique, posé sur toute l'image :
 * - vignette qui suit le sujet (profondeur, contraste) ;
 * - flaque de lumière qui « respire » lentement sur le sujet ;
 * - faisceau de lumière doux qui balaie l'écran à chaque changement de scène.
 * Tout est en lumière blanche / ombre d'encre : aucune couleur ajoutée.
 */
export const LightingOverlay: React.FC<{sweeps?: boolean}> = ({sweeps = true}) => {
  const frame = useCurrentFrame();
  const [lx, ly] = useLight();
  const breathe = 0.5 + 0.5 * Math.sin((frame / 96) * Math.PI * 2);

  // scène dont le faisceau est en cours
  let i = 0;
  while (i + 1 < SEQUENCES.length && SEQUENCES[i + 1].from - SWEEP_LEAD <= frame) i++;
  const t = ramp(frame, Math.max(0, SEQUENCES[i].from - SWEEP_LEAD), SWEEP_DUR, EASE_SOFT);
  const dir = i % 2 === 0 ? 1 : -1;
  const angle = i % 2 === 0 ? 18 : -14;
  const beamX = dir > 0 ? mix(-700, VIDEO.width + 300, t) : mix(VIDEO.width + 300, -700, t);
  const beamA = sweeps ? Math.sin(t * Math.PI) : 0;

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* flaque de lumière sur le sujet */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle 620px at ${lx}px ${ly}px, rgba(255,255,255,0.75), rgba(255,255,255,0) 72%)`,
          mixBlendMode: 'soft-light',
          opacity: 0.55 + 0.3 * breathe,
        }}
      />
      {/* faisceau qui balaie l'écran */}
      {beamA > 0.01 ? (
        <div
          style={{
            position: 'absolute',
            top: -600,
            left: beamX,
            width: 420,
            height: VIDEO.height + 1200,
            transform: `rotate(${angle}deg)`,
            background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.85) 45%, rgba(255,255,255,0.85) 55%, rgba(255,255,255,0))',
            filter: 'blur(36px)',
            mixBlendMode: 'soft-light',
            opacity: beamA * 0.9,
          }}
        />
      ) : null}
      {/* vignette d'encre qui suit la lumière */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 80% 62% at ${lx}px ${ly}px, ${rgba(THEME.ink, 0)} 42%, ${rgba(THEME.ink, 0.08)} 78%, ${rgba(THEME.ink, 0.2)} 100%)`,
          mixBlendMode: 'multiply',
        }}
      />
    </AbsoluteFill>
  );
};

interface SpotProps {
  x: number;
  y: number;
  r: number;
  start: number;
  dur?: number;
  strength?: number;
  exitAt?: number;
  exitDur?: number;
}

/** Projecteur : l'ombre se resserre autour d'un moment clé, comme une lumière qui s'allume. */
export const Spotlight: React.FC<SpotProps> = ({x, y, r, start, dur = 26, strength = 0.16, exitAt = Infinity, exitDur = 15}) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, start, dur, EASE_SOFT);
  const e = ramp(frame, exitAt, exitDur, EASE_SOFT);
  const rr = r * mix(1.5, 1, p);
  return (
    <AbsoluteFill
      style={{
        pointerEvents: 'none',
        background: `radial-gradient(circle ${rr}px at ${x}px ${y}px, ${rgba(THEME.ink, 0)} 35%, ${rgba(THEME.ink, strength)} 100%)`,
        mixBlendMode: 'multiply',
        opacity: p * (1 - e),
      }}
    />
  );
};

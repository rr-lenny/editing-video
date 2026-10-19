import React, { useId } from 'react';
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from '../config';
import { cssId, easeIn, ramp } from '../lib/motion';
import type { ParticleConfig, ParticleShape } from '../types';
import { DirectionalBlur } from './Camera';
import { SafeImg } from './SafeImg';

/** Formes vectorielles génériques (viewBox 0 0 100 100). */
export const SHAPES: Record<Exclude<ParticleShape, 'image'>, string> = {
  heart: 'M50 88 C20 66 4 48 4 30 C4 16 15 6 28 6 C38 6 46 12 50 20 C54 12 62 6 72 6 C85 6 96 16 96 30 C96 48 80 66 50 88 Z',
  spark: 'M50 0 C54 36 64 46 100 50 C64 54 54 64 50 100 C46 64 36 54 0 50 C36 46 46 36 50 0 Z',
  petal: 'M50 20 L41 4 C22 18 12 44 17 68 C21 90 37 98 50 96 C63 98 79 90 83 68 C88 44 78 18 59 4 Z',
  confetti: 'M20 35 H80 V65 H20 Z',
  bookmark: 'M22 6 H78 V94 L50 72 L22 94 Z',
  dot: 'M50 15 A35 35 0 1 1 49.9 15 Z',
};

/**
 * Éléments secondaires qui tombent (billets, pétales, cœurs, étincelles…) avec motion blur vertical.
 * Trois profondeurs : loin (petit, net), milieu, près (gros, flou, rapide, souvent hors champ).
 */
export const ParticleRain: React.FC<ParticleConfig & { layer?: 'all' | 'back' | 'front' }> = ({
  shape,
  src,
  count,
  seed,
  speed,
  sizeMin,
  sizeMax,
  color = THEME.ink,
  accentRatio = 0,
  delay = 0,
  layer = 'all',
}) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const base = cssId(useId());
  const t = frame - delay;
  const fade = ramp(frame, delay, 8, easeIn);
  if (fade <= 0) return null;

  const span = H + 600;
  const items = Array.from({ length: count }, (_, i) => {
    const r = (k: string) => random(`${seed}-${i}-${k}`);
    const z = r('z'); // 0 = loin, 1 = près
    const near = z > 0.78;
    const size = (sizeMin + (sizeMax - sizeMin) * r('s')) * (near ? 1.7 : 0.75 + z * 0.4);
    const v = speed * (0.6 + z * 0.9);
    const y0 = r('y') * span;
    const y = ((((y0 + v * t) % span) + span) % span) - 300;
    // Les particules proches restent sur les bords (partiellement hors champ) pour ne jamais masquer le texte.
    const x0 = near ? (r('x') < 0.5 ? -60 + r('e') * 200 : W - 140 + r('e') * 200) : r('x') * (W + 200) - 100;
    const x = x0 + Math.sin(t / (16 + r('w') * 14) + r('p') * 6.28) * (30 + 50 * r('a'));
    const rot = r('r') * 360 + t * (r('rs') - 0.5) * 6;
    const flip = Math.cos(t / (10 + r('f') * 10) + r('p') * 6.28); // flottement 3D
    const isAccent = r('c') < accentRatio;
    return { i, z, near, size, v, x, y, rot, flip, isAccent };
  });

  const farBlur = speed * 0.35;
  const nearBlur = speed * 1.6;

  return (
    <AbsoluteFill style={{ opacity: fade, pointerEvents: 'none' }}>
      <DirectionalBlur id={`${base}-far`} x={0} y={farBlur} />
      <DirectionalBlur id={`${base}-near`} x={1} y={nearBlur} />
      {items
        .filter((p) => layer === 'all' || (layer === 'front') === p.near)
        .sort((a, b) => a.z - b.z)
        .map((p) => (
          <div
            key={p.i}
            style={{
              position: 'absolute',
              left: p.x - p.size / 2,
              top: p.y - p.size / 2,
              width: p.size,
              transform: `rotate(${p.rot}deg) scaleY(${0.35 + 0.65 * Math.abs(p.flip)})`,
              filter: `url(#${base}-${p.near ? 'near' : 'far'})${p.near ? ' blur(4px)' : ''}`,
              opacity: p.near ? 0.85 : 0.6 + p.z * 0.4,
            }}
          >
            {shape === 'image' ? (
              <SafeImg src={src} width={p.size} hideOnError style={{ filter: 'grayscale(1) drop-shadow(0 18px 14px rgba(0,0,0,0.25))' }} />
            ) : (
              <svg viewBox="0 0 100 100" width={p.size} height={p.size} style={{ display: 'block', overflow: 'visible' }}>
                <path d={SHAPES[shape]} fill={p.isAccent ? THEME.accent : color} />
              </svg>
            )}
          </div>
        ))}
    </AbsoluteFill>
  );
};

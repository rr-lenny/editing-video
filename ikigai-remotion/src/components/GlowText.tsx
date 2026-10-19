import React from 'react';
import {THEME} from '../config';
import {rgba} from '../lib/anim';

/** Halo lumineux (« blur glow ») : plusieurs text-shadow de la même couleur + léger bloom. */
export const glowShadow = (intensity: number, color: string = THEME.glow): string => {
  if (intensity <= 0.001) return 'none';
  const i = Math.min(1.4, intensity);
  return [
    `0 0 6px ${rgba(color, 0.6 * i)}`,
    `0 0 18px ${rgba(color, 0.35 * i)}`,
    `0 0 40px ${rgba(color, 0.15 * i)}`,
    `0 0 80px ${rgba(color, 0.07 * i)}`,
  ].join(', ');
};

interface Props {
  intensity?: number;
  color?: string;
  glow?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export const GlowText: React.FC<Props> = ({intensity = 1, color = THEME.text, glow = THEME.glow, style, children}) => (
  <span style={{color, textShadow: glowShadow(intensity, glow), ...style}}>{children}</span>
);

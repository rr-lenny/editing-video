import {Easing, interpolate} from 'remotion';
import {VIDEO} from '../config';

/** Easings doux uniquement, sans rebond ni overshoot. */
export const EASE = Easing.bezier(0.33, 0, 0.2, 1);
export const EASE_SOFT = Easing.bezier(0.25, 0.1, 0.25, 1);
/** Entrée dynamique : départ vif, très longue arrivée en douceur (aucun dépassement). */
export const EASE_DYN = Easing.bezier(0.16, 1, 0.3, 1);

/** Progression 0 → 1 entre `start` et `start + dur` (frames), bornée. */
export const ramp = (frame: number, start: number, dur: number, easing = EASE): number => {
  // start = Infinity : « jamais » (ex. pas de sortie)
  if (!Number.isFinite(start)) return start > 0 ? 0 : 1;
  return interpolate(frame, [start, start + Math.max(1, dur)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
};

export const mix = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Secondes → frames. */
export const sec = (s: number): number => Math.round(s * VIDEO.fps);

/** Flottement continu et lent (sinusoïde). */
export const drift = (frame: number, amp: number, period = 120, phase = 0): number =>
  Math.sin((frame / period) * Math.PI * 2 + phase) * amp;

export const rgba = (hex: string, alpha: number): string => {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.replace(/(.)/g, '$1$1') : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${Math.max(0, Math.min(1, alpha))})`;
};

/** Ids SVG stables et valides dans url(#…). */
export const svgId = (raw: string): string => raw.replace(/[^a-zA-Z0-9_-]/g, '');

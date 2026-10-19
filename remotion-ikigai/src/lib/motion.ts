import { Easing, interpolate } from 'remotion';
import { MOTION } from '../config';

export const easeIn = Easing.bezier(...MOTION.easeIn);
export const easeMove = Easing.bezier(...MOTION.easeMove);

/** 0→1 (ou from→to) entre `start` et `start + duration`, borné, avec easing. */
export const ramp = (frame: number, start: number, duration: number, easing: (t: number) => number = easeIn, from = 0, to = 1): number =>
  interpolate(frame, [start, start + Math.max(1, duration)], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });

/** Identifiant utilisable dans url(#…) à partir de useId(). */
export const cssId = (raw: string): string => `i${raw.replace(/[^a-zA-Z0-9_-]/g, '')}`;

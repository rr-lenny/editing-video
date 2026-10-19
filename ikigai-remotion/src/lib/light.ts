import {createContext, useContext} from 'react';
import {SEQUENCES, VIDEO} from '../config';
import {mix, ramp} from './anim';

/** Centre de la lumière du papier : glisse doucement d'un sujet à l'autre. */
export const lightAt = (frame: number): [number, number] => {
  let i = 0;
  while (i + 1 < SEQUENCES.length && SEQUENCES[i + 1].from <= frame) i++;
  const cur = SEQUENCES[i];
  const prev = SEQUENCES[Math.max(0, i - 1)];
  const t = i === 0 ? 1 : ramp(frame, cur.from - 6, 36);
  return [mix(prev.light[0], cur.light[0], t), mix(prev.light[1], cur.light[1], t)];
};

/** Position courante de la lumière, partagée par les ombres (PNG, titres). */
export const LightContext = createContext<[number, number]>([VIDEO.width / 2, VIDEO.height / 2]);
export const useLight = (): [number, number] => useContext(LightContext);

/** Direction de l'ombre (opposée à la lumière) depuis un point, longueur 0–1. */
export const shadowDir = (light: [number, number], x: number, y: number): [number, number] => {
  const dx = x - light[0];
  const dy = y - light[1];
  const len = Math.hypot(dx, dy) || 1;
  const k = Math.min(1, len / 700);
  return [(dx / len) * k, (dy / len) * k];
};

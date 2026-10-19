import {SEQUENCES} from '../config';
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

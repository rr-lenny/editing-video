import { SCENES, VIDEO } from '../config';

/** Frame globale de début de chaque scène. */
export const SCENE_STARTS: number[] = SCENES.reduce<number[]>((acc, s, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].durationInFrames);
  return acc;
}, []);

/** Seconde de la voix-off → frame locale d'une scène. */
export const localFrame = (sec: number, sceneStart: number): number => Math.round(sec * VIDEO.fps) - sceneStart;

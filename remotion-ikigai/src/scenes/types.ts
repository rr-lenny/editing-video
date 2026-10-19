import type { SceneConfig } from '../types';

export interface SceneProps {
  scene: SceneConfig;
  /** Index de la scène (0-based). */
  index: number;
  total: number;
  /** Frame globale de début de la scène (sert à convertir les secondes de la voix-off). */
  sceneStart: number;
}

import React from 'react';
import type { Layout } from '../types';
import { BalanceScene } from './BalanceScene';
import { CtaScene } from './CtaScene';
import { HeroScene } from './HeroScene';
import { PillarsScene } from './PillarsScene';
import { PunchScene } from './PunchScene';
import type { SceneProps } from './types';

const LAYOUTS: Record<Layout, React.FC<SceneProps>> = {
  hero: HeroScene,
  punch: PunchScene,
  pillars: PillarsScene,
  balance: BalanceScene,
  cta: CtaScene,
};

/** Choisit le gabarit de la scène d'après config.ts. */
export const Scene: React.FC<SceneProps> = (props) => {
  const Component = LAYOUTS[props.scene.layout];
  return <Component {...props} />;
};

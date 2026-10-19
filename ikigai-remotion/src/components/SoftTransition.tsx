import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {VIDEO} from '../config';
import {EASE, EASE_SOFT, mix, ramp} from '../lib/anim';

export type TransitionKind =
  | 'none'
  | 'fade'
  | 'maskUp' // dégradé qui monte (fondu enchaîné en dégradé)
  | 'maskDown'
  | 'slideLeft' // glissement latéral lent + léger flou
  | 'slideRight'
  | 'zoom' // zoom lent à travers le sujet
  | 'recede'; // recule et s'efface

interface Props {
  enter?: TransitionKind;
  enterAt?: number;
  enterDur?: number;
  exit?: TransitionKind;
  exitAt?: number;
  exitDur?: number;
  /** origine du zoom (px) */
  origin?: [number, number];
  style?: React.CSSProperties;
  children: React.ReactNode;
}

interface Look {
  opacity: number;
  x: number;
  scale: number;
  blur: number;
  mask?: string;
}

/** t = 0 : invisible, t = 1 : en place. */
const look = (kind: TransitionKind, t: number, entering: boolean): Look => {
  const hidden = 1 - t;
  switch (kind) {
    case 'none':
      return {opacity: 1, x: 0, scale: 1, blur: 0};
    case 'fade':
      return {opacity: t, x: 0, scale: 1, blur: hidden * 6};
    case 'maskUp':
    case 'maskDown': {
      // le bord du dégradé balaie l'écran : de bas en haut (maskUp) ou de haut en bas
      const a = t * 140 - 40;
      const dir = kind === 'maskUp' ? 'to top' : 'to bottom';
      return {opacity: 1, x: 0, scale: 1, blur: hidden * 4, mask: `linear-gradient(${dir}, #000 ${a}%, transparent ${a + 40}%)`};
    }
    case 'slideLeft':
    case 'slideRight': {
      const s = kind === 'slideLeft' ? -1 : 1;
      // en entrée, on arrive depuis le côté opposé
      const x = (entering ? -s : s) * hidden * 140;
      return {opacity: t, x, scale: 1, blur: hidden * 10};
    }
    case 'zoom':
      return {opacity: t, x: 0, scale: entering ? mix(0.92, 1, t) : mix(1.35, 1, t), blur: hidden * 10};
    case 'recede':
      return {opacity: t, x: 0, scale: mix(0.9, 1, t), blur: hidden * 8};
  }
};

/** Enveloppe d'entrée / sortie douce (masques en dégradé plutôt que coupes nettes). */
export const SoftTransition: React.FC<Props> = ({
  enter = 'none',
  enterAt = 0,
  enterDur = 18,
  exit = 'none',
  exitAt = Infinity,
  exitDur = 15,
  origin = [VIDEO.width / 2, VIDEO.height / 2],
  style,
  children,
}) => {
  const frame = useCurrentFrame();
  const a = look(enter, ramp(frame, enterAt, enterDur, EASE), true);
  const b = look(exit, 1 - ramp(frame, exitAt, exitDur, EASE_SOFT), false);
  const masks = [a.mask, b.mask].filter(Boolean) as string[];
  const mask = masks.length ? masks.join(', ') : undefined;
  const blur = a.blur + b.blur;

  return (
    <AbsoluteFill
      style={{
        opacity: a.opacity * b.opacity,
        transform: `translateX(${a.x + b.x}px) scale(${a.scale * b.scale})`,
        transformOrigin: `${origin[0]}px ${origin[1]}px`,
        filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
        WebkitMaskImage: mask,
        maskImage: mask,
        WebkitMaskComposite: masks.length > 1 ? 'source-in' : undefined,
        maskComposite: masks.length > 1 ? 'intersect' : undefined,
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** Push-in continu de la scène (1 → 1.04), sur toute la durée de la séquence. */
export const PushIn: React.FC<{dur: number; to?: number; origin?: [number, number]; children: React.ReactNode}> = ({
  dur,
  to = 1.04,
  origin = [VIDEO.width / 2, VIDEO.height / 2],
  children,
}) => {
  const frame = useCurrentFrame();
  const s = mix(1, to, ramp(frame, 0, dur, EASE_SOFT));
  return <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: `${origin[0]}px ${origin[1]}px`}}>{children}</AbsoluteFill>;
};

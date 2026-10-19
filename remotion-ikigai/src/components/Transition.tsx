import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { MOTION } from '../config';
import { easeIn, easeMove, ramp } from '../lib/motion';
import type { TransitionKind } from '../types';
import { CameraProvider, CameraState, useBlurFilter } from './Camera';
import { SafeImg } from './SafeImg';

interface Props {
  /** Comment cette scène entre. */
  enter: TransitionKind;
  /** Comment cette scène sort (= entrée de la scène suivante, pour que les deux mouvements se raccordent). */
  exit: TransitionKind | null;
  durationInFrames: number;
  children: React.ReactNode;
}

/**
 * Enveloppe de scène : calcule la caméra (entrée + sortie + push-in lent) et la passe aux <Layer>.
 * Les deux moitiés d'une transition (sortie de A, entrée de B) partagent la même direction et le même
 * motion blur, donc la coupe sèche au milieu est invisible.
 */
export const Transition: React.FC<Props> = ({ enter, exit, durationInFrames, children }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const nIn = MOTION.transitionIn;
  const nOut = MOTION.transitionOut;

  const cam: CameraState = { x: 0, y: 0, scale: 1, rotate: 0, blurX: 0, blurY: 0, blur: 0 };

  // Push-in lent (dérive linéaire autorisée).
  cam.scale *= interpolate(frame, [0, durationInFrames], [1, MOTION.pushIn], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  /* ---------------- entrée ---------------- */
  const pi = ramp(frame, 0, nIn, easeIn);
  const ri = 1 - pi;
  switch (enter) {
    case 'whip-left':
      cam.x += ri * width * 0.62;
      cam.blurX += ri * 60;
      break;
    case 'whip-up':
      cam.y += ri * height * 0.42;
      cam.blurY += ri * 60;
      break;
    case 'zoom':
      cam.scale *= 1 - ri * 0.38;
      cam.blur += ri * 16;
      break;
    case 'pass':
      cam.x += ri * 160;
      cam.blurX += ri * 36;
      break;
    case 'cut':
      cam.scale *= 1 + (1 - ramp(frame, 0, 8, easeIn)) * 0.07;
      break;
  }

  /* ---------------- sortie ---------------- */
  if (exit) {
    const po = ramp(frame, durationInFrames - nOut, nOut, easeMove);
    switch (exit) {
      case 'whip-left':
        cam.x -= po * width * 0.62;
        cam.blurX += po * 60;
        break;
      case 'whip-up':
        cam.y -= po * height * 0.42;
        cam.blurY += po * 60;
        break;
      case 'zoom':
        // Zoom à travers l'objet : on fonce dans le centre du cadre.
        cam.scale *= 1 + po * po * 2.2;
        cam.blur += po * 16;
        break;
      case 'pass':
        cam.x -= po * 160;
        cam.blurX += po * 36;
        break;
      case 'cut':
        cam.scale *= 1 + po * 0.03;
        break;
    }
  }

  return (
    <CameraProvider value={cam}>
      <AbsoluteFill style={{ overflow: 'hidden' }}>{children}</AbsoluteFill>
    </CameraProvider>
  );
};

/**
 * Transition 'pass' : un objet géant traverse l'écran (droite → gauche, motion blur) et masque la coupe.
 * À placer dans une <Sequence> centrée sur la coupe.
 */
export const PassWiper: React.FC<{ src: string; durationInFrames: number }> = ({ src, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const p = ramp(frame, 0, durationInFrames, easeMove);
  const x = interpolate(p, [0, 1], [width * 1.25, -width * 1.25]);
  const speed = Math.sin(p * Math.PI); // vitesse max au milieu = flou max
  const { filter, defs } = useBlurFilter(10 + speed * 70, 0, 0);
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {defs}
      <div
        style={{
          position: 'absolute',
          left: width / 2 - 800 + x,
          top: height / 2 - 700,
          width: 1600,
          transform: `rotate(${-14 + p * 22}deg)`,
          filter: [filter, 'drop-shadow(0 60px 50px rgba(0,0,0,0.3))'].filter(Boolean).join(' '),
        }}
      >
        <SafeImg src={src} width={1600} hideOnError imgStyle={{ filter: 'grayscale(1) contrast(1.05)' }} />
      </div>
    </AbsoluteFill>
  );
};

import React, { createContext, useContext, useId } from 'react';
import { AbsoluteFill } from 'remotion';
import { cssId } from '../lib/motion';

/** État de « caméra » d'une scène, fourni par <Transition>. Chaque <Layer> l'applique selon sa profondeur. */
export interface CameraState {
  x: number;
  y: number;
  scale: number;
  rotate: number;
  /** Flou directionnel (motion blur) en px. */
  blurX: number;
  blurY: number;
  /** Flou uniforme en px. */
  blur: number;
}

export const NEUTRAL_CAMERA: CameraState = { x: 0, y: 0, scale: 1, rotate: 0, blurX: 0, blurY: 0, blur: 0 };

const CameraContext = createContext<CameraState>(NEUTRAL_CAMERA);
export const CameraProvider = CameraContext.Provider;
export const useCamera = (): CameraState => useContext(CameraContext);

/** Filtre SVG de flou directionnel (feGaussianBlur anisotrope) = motion blur bon marché. */
export const DirectionalBlur: React.FC<{ id: string; x: number; y: number }> = ({ id, x, y }) => (
  <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden>
    <defs>
      <filter id={id} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
        <feGaussianBlur stdDeviation={`${Math.max(0, x)} ${Math.max(0, y)}`} />
      </filter>
    </defs>
  </svg>
);

/** Construit la propriété CSS `filter` (motion blur directionnel + flou uniforme). */
export const useBlurFilter = (bx: number, by: number, blur: number): { filter: string | undefined; defs: React.ReactNode } => {
  const id = cssId(useId());
  const parts: string[] = [];
  let defs: React.ReactNode = null;
  if (bx > 0.4 || by > 0.4) {
    defs = <DirectionalBlur id={id} x={bx} y={by} />;
    parts.push(`url(#${id})`);
  }
  if (blur > 0.3) parts.push(`blur(${blur.toFixed(2)}px)`);
  return { filter: parts.length ? parts.join(' ') : undefined, defs };
};

/**
 * Couche de parallaxe : depth 0.3 = fond lent, 1 = objet, 1.6+ = premier plan rapide.
 * Le déplacement, le zoom et le motion blur de la caméra sont multipliés par la profondeur.
 */
export const Layer: React.FC<{ depth: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ depth, children, style }) => {
  const cam = useCamera();
  const scale = 1 + (cam.scale - 1) * depth;
  const { filter, defs } = useBlurFilter(cam.blurX * depth, cam.blurY * depth, cam.blur * Math.min(depth, 1.4));
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${(cam.x * depth).toFixed(2)}px, ${(cam.y * depth).toFixed(2)}px) scale(${scale.toFixed(4)}) rotate(${(cam.rotate * depth).toFixed(3)}deg)`,
        transformOrigin: '50% 50%',
        filter,
        ...style,
      }}
    >
      {defs}
      {children}
    </AbsoluteFill>
  );
};

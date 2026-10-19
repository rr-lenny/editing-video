import React, {useState} from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {ASSETS, ImagePlacement} from '../config';
import {drift, EASE, EASE_SOFT, mix, ramp} from '../lib/anim';

export interface Motion {
  dx?: number;
  dy?: number;
  scale?: number;
  rotate?: number;
  blur?: number;
  opacity?: number;
}

interface Props extends ImagePlacement {
  /** frame locale de début d'entrée */
  enterAt?: number;
  enterDur?: number;
  /** état de départ (relatif au placement final) */
  enterFrom?: Motion;
  exitAt?: number;
  exitDur?: number;
  /** état d'arrivée de la sortie */
  exitTo?: Motion;
  /** flottement vertical (px) et rotation lente (°) */
  float?: number;
  sway?: number;
  phase?: number;
  /** force de l'ombre portée (0–1.5) */
  shadow?: number;
  zIndex?: number;
}

const DEFAULT_FROM: Required<Motion> = {dx: 0, dy: 50, scale: 0.94, rotate: 0, blur: 8, opacity: 0};
const DEFAULT_TO: Required<Motion> = {dx: 0, dy: -30, scale: 0.97, rotate: 0, blur: 8, opacity: 0};

/**
 * PNG détouré, toujours en noir et blanc, ombre douce et diffuse.
 * Une image absente ou illisible est simplement masquée : le rendu ne plante jamais.
 */
export const BWImage: React.FC<Props> = ({
  asset,
  x,
  y,
  width,
  rotate = 0,
  flipX = false,
  enterAt = 0,
  enterDur = 24,
  enterFrom,
  exitAt = Infinity,
  exitDur = 15,
  exitTo,
  float = 6,
  sway = 1.5,
  phase = 0,
  shadow = 1,
  zIndex = 1,
}) => {
  const frame = useCurrentFrame();
  const [failed, setFailed] = useState(false);
  const meta = ASSETS[asset];
  if (!meta || failed) return null;

  const from = {...DEFAULT_FROM, ...enterFrom};
  const to = {...DEFAULT_TO, ...exitTo};
  const p = ramp(frame, enterAt, enterDur, EASE);
  const e = ramp(frame, exitAt, exitDur, EASE_SOFT);

  const dx = mix(from.dx, 0, p) + mix(0, to.dx, e);
  const dy = mix(from.dy, 0, p) + mix(0, to.dy, e) + drift(frame, float, 130, phase);
  const scale = mix(from.scale, 1, p) * mix(1, to.scale, e);
  const rot = rotate + mix(from.rotate, 0, p) + mix(0, to.rotate, e) + drift(frame, sway, 210, phase + 1);
  const blur = mix(from.blur, 0, p) + mix(0, to.blur, e);
  const opacity = mix(from.opacity, 1, p) * mix(1, to.opacity, e);
  const height = (width * meta.h) / meta.w;

  return (
    <div
      style={{
        position: 'absolute',
        left: x - width / 2,
        top: y - height / 2,
        width,
        height,
        zIndex,
        opacity,
        transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(${scale})`,
        filter: [
          'grayscale(1) contrast(1.05)',
          blur > 0.05 ? `blur(${blur}px)` : '',
          `drop-shadow(0 ${26 * shadow}px ${34 * shadow}px rgba(31,31,31,${0.2 * shadow}))`,
          `drop-shadow(0 ${5 * shadow}px ${8 * shadow}px rgba(31,31,31,${0.12 * shadow}))`,
        ].join(' '),
      }}
    >
      <Img
        src={staticFile(meta.file)}
        maxRetries={0}
        onError={() => setFailed(true)}
        style={{width: '100%', height: '100%', objectFit: 'contain', transform: flipX ? 'scaleX(-1)' : undefined}}
      />
    </div>
  );
};

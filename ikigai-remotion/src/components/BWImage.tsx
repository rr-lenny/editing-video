import React, {useId, useState} from 'react';
import {Img, staticFile, useCurrentFrame} from 'remotion';
import {ASSETS, ImagePlacement} from '../config';
import {drift, EASE_DYN, EASE_SOFT, mix, ramp, svgId} from '../lib/anim';
import {shadowDir, useLight} from '../lib/light';

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
  /** ombre de contact sur le papier, sous l'objet */
  contact?: boolean;
  zIndex?: number;
}

const DEFAULT_FROM: Required<Motion> = {dx: 0, dy: 50, scale: 0.94, rotate: 0, blur: 8, opacity: 0};
const DEFAULT_TO: Required<Motion> = {dx: 0, dy: -30, scale: 0.97, rotate: 0, blur: 8, opacity: 0};

/**
 * PNG détouré, toujours en noir et blanc.
 * - ombre portée orientée à l'opposé de la lumière, qui s'allonge quand l'objet flotte plus haut ;
 * - ombre de contact douce sur le papier ;
 * - flou de mouvement directionnel calculé sur la vitesse réelle de l'objet.
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
  contact = true,
  zIndex = 1,
}) => {
  const frame = useCurrentFrame();
  const light = useLight();
  const mbId = svgId(`mb-${useId()}`);
  const [failed, setFailed] = useState(false);
  const meta = ASSETS[asset];
  if (!meta || failed) return null;

  const from = {...DEFAULT_FROM, ...enterFrom};
  const to = {...DEFAULT_TO, ...exitTo};

  const state = (f: number) => {
    const p = ramp(f, enterAt, enterDur, EASE_DYN);
    const e = ramp(f, exitAt, exitDur, EASE_SOFT);
    const lift = drift(f, float, 130, phase);
    return {
      lift,
      dx: mix(from.dx, 0, p) + mix(0, to.dx, e),
      dy: mix(from.dy, 0, p) + mix(0, to.dy, e) + lift,
      scale: mix(from.scale, 1, p) * mix(1, to.scale, e),
      rot: rotate + mix(from.rotate, 0, p) + mix(0, to.rotate, e) + drift(f, sway, 210, phase + 1),
      blur: mix(from.blur, 0, p) + mix(0, to.blur, e),
      opacity: mix(from.opacity, 1, p) * mix(1, to.opacity, e),
    };
  };

  const s = state(frame);
  const prev = state(frame - 1);
  // flou de mouvement : proportionnel à la vitesse (px / frame), dans l'axe du déplacement
  const mbX = Math.min(22, Math.abs(s.dx - prev.dx) * 0.55);
  const mbY = Math.min(22, Math.abs(s.dy - prev.dy) * 0.55);
  const moving = mbX > 0.25 || mbY > 0.25;

  const height = (width * meta.h) / meta.w;
  const [sx, sy] = shadowDir(light, x + s.dx, y + s.dy);
  const up = -s.lift; // > 0 quand l'objet monte
  const offX = sx * 26 * shadow;
  const offY = (16 + sy * 18 + up * 0.9) * shadow;
  const soft = (30 + up * 1.2) * shadow;

  return (
    <>
      {contact ? (
        <div
          style={{
            position: 'absolute',
            left: x - width * 0.36 + s.dx + offX * 0.4,
            top: y + height * 0.42 + (s.dy - s.lift) + 6,
            width: width * 0.72,
            height: Math.max(24, height * 0.08),
            zIndex,
            borderRadius: '50%',
            background: 'radial-gradient(closest-side, rgba(31,31,31,0.30), rgba(31,31,31,0))',
            filter: `blur(${10 + up * 0.6}px)`,
            opacity: s.opacity * Math.max(0.35, 1 - up * 0.05) * shadow,
            transform: `scale(${s.scale * (1 - up * 0.01)})`,
          }}
        />
      ) : null}
      <div
        style={{
          position: 'absolute',
          left: x - width / 2,
          top: y - height / 2,
          width,
          height,
          zIndex,
          opacity: s.opacity,
          transform: `translate(${s.dx}px, ${s.dy}px) rotate(${s.rot}deg) scale(${s.scale})`,
          filter: [
            moving ? `url(#${mbId})` : '',
            'grayscale(1) contrast(1.06)',
            s.blur > 0.05 ? `blur(${s.blur}px)` : '',
            `drop-shadow(${offX}px ${offY}px ${soft}px rgba(31,31,31,${0.24 * shadow}))`,
            `drop-shadow(${offX * 0.2}px ${5 * shadow}px ${8 * shadow}px rgba(31,31,31,${0.14 * shadow}))`,
          ].join(' '),
        }}
      >
        {moving ? (
          <svg width={0} height={0} style={{position: 'absolute'}} aria-hidden>
            <filter id={mbId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation={`${mbX} ${mbY}`} />
            </filter>
          </svg>
        ) : null}
        <Img
          src={staticFile(meta.file)}
          maxRetries={0}
          onError={() => setFailed(true)}
          style={{width: '100%', height: '100%', objectFit: 'contain', transform: flipX ? 'scaleX(-1)' : undefined}}
        />
      </div>
    </>
  );
};

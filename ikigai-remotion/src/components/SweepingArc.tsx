import React from 'react';
import {useCurrentFrame} from 'remotion';
import {THEME, VIDEO} from '../config';
import {EASE_SOFT, ramp, rgba} from '../lib/anim';

interface Props {
  cx: number;
  cy: number;
  r: number;
  /** angles en degrés (0 = droite, sens horaire) */
  from: number;
  to: number;
  start?: number;
  drawDur?: number;
  width?: number;
  opacity?: number;
  /** flou (px) : arc épais très flouté au premier plan */
  blur?: number;
  /** rotation lente continue (°/frame) */
  spin?: number;
  exitAt?: number;
  exitDur?: number;
}

const point = (cx: number, cy: number, r: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as const;
};

/** Arc fin (1–2 px, gris ~30 %) qui se dessine lentement, ou arc épais flouté. */
export const SweepingArc: React.FC<Props> = ({
  cx,
  cy,
  r,
  from,
  to,
  start = 0,
  drawDur = 60,
  width = 1.5,
  opacity = 0.3,
  blur = 0,
  spin = 0,
  exitAt = Infinity,
  exitDur = 15,
}) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, start, drawDur, EASE_SOFT);
  const e = ramp(frame, exitAt, exitDur, EASE_SOFT);
  const [x0, y0] = point(cx, cy, r, from);
  const [x1, y1] = point(cx, cy, r, to);
  const large = Math.abs(to - from) > 180 ? 1 : 0;
  const sweep = to > from ? 1 : 0;
  const d = `M ${x0} ${y0} A ${r} ${r} 0 ${large} ${sweep} ${x1} ${y1}`;

  return (
    <svg
      width={VIDEO.width}
      height={VIDEO.height}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'visible',
        opacity: 1 - e,
        filter: blur ? `blur(${blur}px)` : undefined,
        pointerEvents: 'none',
      }}
    >
      <path
        d={d}
        fill="none"
        stroke={rgba(THEME.ink, opacity)}
        strokeWidth={width}
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray="1 1"
        strokeDashoffset={1 - p}
        transform={spin ? `rotate(${(frame - start) * spin} ${cx} ${cy})` : undefined}
      />
    </svg>
  );
};

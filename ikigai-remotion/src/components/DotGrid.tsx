import React, {useId} from 'react';
import {useCurrentFrame} from 'remotion';
import {THEME, VIDEO} from '../config';
import {EASE_SOFT, ramp, svgId} from '../lib/anim';

interface Props {
  cx: number;
  cy: number;
  radius: number;
  spacing?: number;
  start?: number;
  dur?: number;
  opacity?: number;
  exitAt?: number;
  exitDur?: number;
}

/** Grille locale de points derrière le PNG principal : apparaît en fondu, bords en dégradé. */
export const DotGrid: React.FC<Props> = ({cx, cy, radius, spacing = 30, start = 0, dur = 24, opacity = 0.22, exitAt = Infinity, exitDur = 15}) => {
  const frame = useCurrentFrame();
  const uid = svgId(useId());
  const p = ramp(frame, start, dur, EASE_SOFT);
  const e = ramp(frame, exitAt, exitDur, EASE_SOFT);
  const r = radius * (0.9 + 0.1 * p);

  return (
    <svg width={VIDEO.width} height={VIDEO.height} style={{position: 'absolute', inset: 0, opacity: opacity * p * (1 - e), pointerEvents: 'none'}}>
      <defs>
        <pattern id={`dots${uid}`} width={spacing} height={spacing} patternUnits="userSpaceOnUse" x={cx % spacing} y={cy % spacing}>
          <circle cx={spacing / 2} cy={spacing / 2} r={1.7} fill={THEME.ink} />
        </pattern>
        <radialGradient id={`fade${uid}`} cx={cx} cy={cy} r={r} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fff" stopOpacity={1} />
          <stop offset="60%" stopColor="#fff" stopOpacity={0.75} />
          <stop offset="100%" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        <mask id={`mask${uid}`} maskUnits="userSpaceOnUse">
          <rect width="100%" height="100%" fill={`url(#fade${uid})`} />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill={`url(#dots${uid})`} mask={`url(#mask${uid})`} />
    </svg>
  );
};

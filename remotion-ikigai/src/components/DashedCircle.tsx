import React, { useId } from 'react';
import { useCurrentFrame } from 'remotion';
import { cssId, easeIn, ramp } from '../lib/motion';

interface Props {
  cx: number;
  cy: number;
  r: number;
  color: string;
  strokeWidth?: number;
  dash?: number;
  gap?: number;
  /** Frame locale où le tracé commence. */
  delay?: number;
  /** Durée du tracé (frames). */
  drawDuration?: number;
  /** Degrés par frame une fois dessiné. */
  spin?: number;
  opacity?: number;
}

/** Cercle en pointillés qui se dessine (masque stroke-dashoffset) puis tourne lentement. */
export const DashedCircle: React.FC<Props> = ({
  cx,
  cy,
  r,
  color,
  strokeWidth = 5,
  dash = 26,
  gap = 18,
  delay = 0,
  drawDuration = 22,
  spin = 0.6,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const maskId = cssId(useId());
  const p = ramp(frame, delay, drawDuration, easeIn);
  const size = r * 2 + strokeWidth * 4;
  const c = size / 2;
  const rotation = -90 + (frame - delay) * spin;
  if (p <= 0) return null;

  return (
    <svg width={size} height={size} style={{ position: 'absolute', left: cx - c, top: cy - c, overflow: 'visible', opacity }} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <mask id={maskId}>
          <circle cx={c} cy={c} r={r} fill="none" stroke="#fff" strokeWidth={strokeWidth * 3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - p} />
        </mask>
      </defs>
      <g transform={`rotate(${rotation} ${c} ${c})`}>
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${gap}`}
          mask={`url(#${maskId})`}
        />
      </g>
    </svg>
  );
};

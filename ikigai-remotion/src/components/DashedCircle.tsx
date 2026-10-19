import React, {useId} from 'react';
import {useCurrentFrame} from 'remotion';
import {THEME, VIDEO} from '../config';
import {EASE_SOFT, ramp, rgba, svgId} from '../lib/anim';

interface Props {
  cx: number;
  cy: number;
  r: number;
  /** frame locale de début du tracé */
  start?: number;
  drawDur?: number;
  /** rotation continue en degrés par frame */
  spin?: number;
  opacity?: number;
  dash?: string;
  strokeWidth?: number;
  exitAt?: number;
  exitDur?: number;
}

/** Cercle en pointillés gris : se dessine lentement, puis tourne très doucement. */
export const DashedCircle: React.FC<Props> = ({
  cx,
  cy,
  r,
  start = 0,
  drawDur = 45,
  spin = 0.08,
  opacity = 0.42,
  dash = '2 9',
  strokeWidth = 1.6,
  exitAt = Infinity,
  exitDur = 15,
}) => {
  const frame = useCurrentFrame();
  const id = svgId(`dc-${useId()}`);
  const p = ramp(frame, start, drawDur, EASE_SOFT);
  const e = ramp(frame, exitAt, exitDur, EASE_SOFT);
  const angle = -90 + (frame - start) * spin;

  return (
    <svg
      width={VIDEO.width}
      height={VIDEO.height}
      style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: 1 - e, pointerEvents: 'none'}}
    >
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse">
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#fff"
            strokeWidth={strokeWidth + 8}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={1 - p}
            transform={`rotate(${angle} ${cx} ${cy})`}
          />
        </mask>
      </defs>
      <circle
        cx={cx}
        cy={cy}
        r={r * (1 + e * 0.04)}
        fill="none"
        stroke={rgba(THEME.ink, opacity)}
        strokeWidth={strokeWidth}
        strokeDasharray={dash}
        strokeLinecap="round"
        mask={`url(#${id})`}
        transform={`rotate(${angle} ${cx} ${cy})`}
      />
    </svg>
  );
};

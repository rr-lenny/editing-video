import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from '../config';
import { easeMove, ramp } from '../lib/motion';
import type { ArcConfig } from '../types';

const COLORS = { ink: THEME.ink, accent: THEME.accent, white: THEME.white, gray: '#7A7A76' };

/** Arc fin (ou épais et flouté au premier plan) qui balaie le cadre en se dessinant (stroke-dashoffset). */
export const SweepingArc: React.FC<ArcConfig> = ({ from, control, to, width, color = 'ink', opacity = 0.5, blur = 0, delay = 0, duration = 30 }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const p = ramp(frame, delay, duration, easeMove);
  if (p <= 0) return null;
  // Après le tracé, l'arc continue de respirer légèrement pour ne jamais être figé.
  const breathe = Math.sin((frame - delay) / 18) * 14;
  const d = `M ${from[0]} ${from[1]} Q ${control[0] + breathe} ${control[1] - breathe} ${to[0]} ${to[1]}`;
  return (
    <AbsoluteFill style={{ filter: blur ? `blur(${blur}px)` : undefined, pointerEvents: 'none' }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        <path
          d={d}
          fill="none"
          stroke={COLORS[color]}
          strokeOpacity={opacity}
          strokeWidth={width}
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1 1"
          strokeDashoffset={1 - p}
        />
      </svg>
    </AbsoluteFill>
  );
};

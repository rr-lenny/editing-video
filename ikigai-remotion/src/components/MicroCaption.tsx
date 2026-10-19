import React from 'react';
import {useCurrentFrame} from 'remotion';
import {THEME} from '../config';
import {EASE_SOFT, ramp} from '../lib/anim';
import {FONTS} from '../lib/fonts';

interface Props {
  text: string;
  /** frame locale de début */
  start: number;
  size?: number;
  exitAt?: number;
  exitDur?: number;
  style?: React.CSSProperties;
}

/** Petites capitales Inter Medium, tracking +0.12em, en gris d'encre. Apparaissent en dernier. */
export const MicroCaption: React.FC<Props> = ({text, start, size = 24, exitAt = Infinity, exitDur = 14, style}) => {
  const frame = useCurrentFrame();
  const p = ramp(frame, start, 18);
  const e = ramp(frame, exitAt, exitDur, EASE_SOFT);
  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: FONTS.sans,
        fontWeight: 500,
        fontSize: size,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        lineHeight: 1,
        color: THEME.inkSoft,
        whiteSpace: 'nowrap',
        opacity: p * (1 - e),
        filter: `blur(${(1 - p) * 6 + e * 8}px)`,
        transform: `translateY(${(1 - p) * 10 - e * 6}px)`,
        ...style,
      }}
    >
      {text}
    </span>
  );
};

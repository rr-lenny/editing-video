import React from 'react';
import {useCurrentFrame} from 'remotion';
import {THEME} from '../config';
import {EASE_SOFT, ramp, rgba} from '../lib/anim';
import {FONTS} from '../lib/fonts';
import {glowShadow} from './GlowText';

interface Props {
  left?: string;
  right?: string;
  width: number;
  start: number;
  size?: number;
  exitAt?: number;
  exitDur?: number;
}

/** « une série de ——— épisode un » : le filet se dessine de gauche à droite entre deux petits mots. */
export const EditorialRule: React.FC<Props> = ({left, right, width, start, size = 36, exitAt = Infinity, exitDur = 14}) => {
  const frame = useCurrentFrame();
  const pl = ramp(frame, start, 16);
  const line = ramp(frame, start + 6, 26);
  const pr = ramp(frame, start + 22, 16);
  const e = ramp(frame, exitAt, exitDur, EASE_SOFT);

  const word = (p: number): React.CSSProperties => ({
    fontFamily: FONTS.serif,
    fontStyle: 'italic',
    fontWeight: 400,
    fontSize: size,
    lineHeight: 1,
    color: THEME.text,
    whiteSpace: 'nowrap',
    textShadow: glowShadow(0.35 * p * (1 - e)),
    opacity: p * (1 - e),
    filter: `blur(${(1 - p) * 8 + e * 8}px)`,
  });

  return (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 16}}>
      {left ? <span style={word(pl)}>{left}</span> : null}
      <span
        style={{
          display: 'inline-block',
          width,
          height: 1.5,
          background: rgba(THEME.text, 0.75),
          boxShadow: `0 0 8px ${rgba(THEME.glow, 0.35 * (1 - e))}`,
          transform: `scaleX(${line})`,
          transformOrigin: 'left center',
          opacity: 1 - e,
        }}
      />
      {right ? <span style={word(pr)}>{right}</span> : null}
    </span>
  );
};

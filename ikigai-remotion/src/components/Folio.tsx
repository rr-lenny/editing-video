import React from 'react';
import {useCurrentFrame} from 'remotion';
import {SEQUENCES, THEME, TYPE_COLUMN, VIDEO} from '../config';
import {EASE_SOFT, ramp, rgba} from '../lib/anim';
import {FONTS} from '../lib/fonts';

const style: React.CSSProperties = {
  fontFamily: FONTS.sans,
  fontWeight: 500,
  fontSize: 20,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: rgba(THEME.ink, 0.55),
  whiteSpace: 'nowrap',
};

/**
 * En-tête éditorial discret, façon magazine : titre, filet et numéro de page de la scène.
 * Purement décoratif (rien d'important) ; le numéro change en fondu à chaque scène.
 */
export const Folio: React.FC = () => {
  const frame = useCurrentFrame();
  let i = 0;
  while (i + 1 < SEQUENCES.length && SEQUENCES[i + 1].from <= frame) i++;
  const local = frame - SEQUENCES[i].from;
  const change = ramp(local, 0, 10, EASE_SOFT);
  const intro = ramp(frame, 4, 20, EASE_SOFT);
  const outro = 1 - ramp(frame, VIDEO.durationInFrames - 16, 14, EASE_SOFT);
  const left = TYPE_COLUMN.left;
  const right = left + TYPE_COLUMN.width;
  const n = String(i + 1).padStart(2, '0');

  return (
    <div
      style={{
        position: 'absolute',
        top: 196,
        left,
        width: right - left,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        opacity: intro * outro,
      }}
    >
      <span style={style}>Ikigai</span>
      <span style={{...style, fontFamily: FONTS.serif, fontStyle: 'italic', fontWeight: 400, letterSpacing: 0, textTransform: 'none', fontSize: 24}}>
        raison d'être
      </span>
      <span style={{flex: 1, height: 1, background: rgba(THEME.ink, 0.28), transform: `scaleX(${intro})`, transformOrigin: 'left'}} />
      <span style={{...style, opacity: change, filter: `blur(${(1 - change) * 4}px)`}}>
        N° {n} / {String(SEQUENCES.length).padStart(2, '0')}
      </span>
    </div>
  );
};

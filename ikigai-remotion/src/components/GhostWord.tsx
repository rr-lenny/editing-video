import React from 'react';
import {useCurrentFrame} from 'remotion';
import {THEME} from '../config';
import {EASE_SOFT, mix, ramp, rgba} from '../lib/anim';
import {FONTS} from '../lib/fonts';

interface Props {
  text: string;
  /** centre vertical (px) */
  y: number;
  duration: number;
  overlap: number;
  /** sens de glissement alterné d'une scène à l'autre */
  index: number;
  size?: number;
}

/**
 * Typographie fantôme : le mot de la scène en très grand, contouré à l'encre très légère,
 * qui glisse lentement derrière le sujet. Il donne de la profondeur et du mouvement au papier.
 */
export const GhostWord: React.FC<Props> = ({text, y, duration, overlap, index, size = 400}) => {
  const frame = useCurrentFrame();
  const total = duration + overlap;
  const p = ramp(frame, 0, 26, EASE_SOFT);
  // sans chevauchement (dernière scène), le mot s'efface avant la fin pour la boucle
  const e = overlap > 0 ? ramp(frame, duration, overlap, EASE_SOFT) : ramp(frame, duration - 16, 14, EASE_SOFT);
  const dir = index % 2 === 0 ? 1 : -1;
  const x = mix(dir * 110, -dir * 110, frame / Math.max(1, total));

  return (
    <div
      style={{
        position: 'absolute',
        left: '50%',
        top: y,
        transform: `translate(-50%, -50%) translateX(${x}px)`,
        fontFamily: FONTS.sans,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: '-0.05em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        color: rgba(THEME.ink, 0.035),
        WebkitTextStroke: `2px ${rgba(THEME.ink, 0.1)}`,
        opacity: p * (1 - e),
        filter: `blur(${(1 - p) * 12 + e * 10}px)`,
        pointerEvents: 'none',
      }}
    >
      {text}
    </div>
  );
};

import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {THEME, VIDEO} from '../config';
import {rgba, svgId} from '../lib/anim';

interface Props {
  /** centre de la lumière (px) */
  light?: [number, number];
  /** pas de la grille millimétrée (px) */
  grid?: number;
}

/**
 * Papier blanc cassé : dégradé radial doux + grille millimétrée + grain journal.
 * Le grain change de graine toutes les 3 frames : la page « vit » sans scintiller.
 */
export const PaperBackground: React.FC<Props> = ({light = [540, 960], grid = 60}) => {
  const frame = useCurrentFrame();
  const [lx, ly] = light;
  const seed = Math.floor(frame / 3) % 24;
  const grainId = svgId(`paper-grain-${seed}`);
  const line = rgba(THEME.ink, THEME.gridOpacity);
  const major = rgba(THEME.ink, THEME.gridOpacity * 1.5);

  return (
    <AbsoluteFill style={{backgroundColor: THEME.paperEdge, overflow: 'hidden'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 95% 70% at ${lx}px ${ly}px, ${THEME.paperCenter} 0%, ${THEME.paperMid} 45%, ${THEME.paperEdge} 100%)`,
        }}
      />
      {/* grille fine + repères tous les 4 carreaux */}
      <AbsoluteFill
        style={{
          backgroundImage: [
            `linear-gradient(to right, ${major} 1px, transparent 1px)`,
            `linear-gradient(to bottom, ${major} 1px, transparent 1px)`,
            `linear-gradient(to right, ${line} 1px, transparent 1px)`,
            `linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
          ].join(', '),
          backgroundSize: `${grid * 4}px ${grid * 4}px, ${grid * 4}px ${grid * 4}px, ${grid}px ${grid}px, ${grid}px ${grid}px`,
          backgroundPosition: '0 0',
        }}
      />
      {/* dégradé gris doux en bas, comme une page qui s'enroule */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(to top, ${rgba(THEME.ink, 0.07)} 0%, ${rgba(THEME.ink, 0)} 22%)`,
        }}
      />
      {/* grain papier */}
      <svg
        width={VIDEO.width}
        height={VIDEO.height}
        style={{position: 'absolute', inset: 0, opacity: THEME.grainOpacity, mixBlendMode: 'multiply'}}
      >
        <filter id={grainId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${grainId})`} />
      </svg>
    </AbsoluteFill>
  );
};

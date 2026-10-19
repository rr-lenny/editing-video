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

const W = VIDEO.width;
const H = VIDEO.height;

/**
 * Papier vivant, en noir et blanc uniquement :
 * - dégradé de fond en gris chauds, profond (blanc cassé → gris) ;
 * - « mesh gradient » : grandes zones de lumière et d'ombre qui dérivent lentement,
 *   la zone la plus claire suit le sujet ;
 * - ombres de lumière en bandes (comme une fenêtre) qui glissent doucement ;
 * - grille millimétrée qui s'éclaire sous la lumière, fibres du papier, grain journal.
 */
export const PaperBackground: React.FC<Props> = ({light = [540, 960], grid = 60}) => {
  const frame = useCurrentFrame();
  const [lx, ly] = light;
  const seed = Math.floor(frame / 3) % 24;
  const grainId = svgId(`paper-grain-${seed}`);
  const fiberId = svgId('paper-fibers');
  const line = rgba(THEME.ink, THEME.gridOpacity);
  const major = rgba(THEME.ink, THEME.gridOpacity * 1.6);

  // zones du mesh gradient : trajectoires lentes, périodiques sur la durée de la vidéo
  // (elles reviennent exactement à leur point de départ : la boucle reste parfaite)
  const u = (frame / VIDEO.durationInFrames) * Math.PI * 2;
  const hx = lx + Math.sin(u * 2) * 140;
  const hy = ly + Math.cos(u * 2) * 180 - 180;
  const s1x = W * 0.92 + Math.sin(u + 1) * 160;
  const s1y = H * 0.12 + Math.cos(u * 2) * 160;
  const s2x = W * 0.06 + Math.cos(u * 2 + 0.4) * 150;
  const s2y = H * 0.9 + Math.sin(u + 2) * 170;
  const h2x = W * 0.85 + Math.cos(u + 0.5) * 120;
  const h2y = H * 0.68 + Math.sin(u * 3) * 200;

  const mesh = [
    `radial-gradient(circle 760px at ${hx}px ${hy}px, rgba(255,255,255,0.92), rgba(255,255,255,0) 72%)`,
    `radial-gradient(circle 520px at ${h2x}px ${h2y}px, rgba(255,255,255,0.45), rgba(255,255,255,0) 70%)`,
    `radial-gradient(circle 820px at ${s1x}px ${s1y}px, ${rgba(THEME.ink, 0.06)}, ${rgba(THEME.ink, 0)} 70%)`,
    `radial-gradient(circle 900px at ${s2x}px ${s2y}px, ${rgba(THEME.ink, 0.08)}, ${rgba(THEME.ink, 0)} 70%)`,
    `linear-gradient(168deg, ${THEME.paperCenter} 0%, ${THEME.paperEdge} 48%, ${THEME.paperDeep} 100%)`,
  ].join(', ');

  // bandes d'ombre : glissent lentement en diagonale, d'exactement une période sur la vidéo
  const bandShift = (frame / VIDEO.durationInFrames) * 560;

  return (
    <AbsoluteFill style={{backgroundColor: THEME.paperEdge, overflow: 'hidden'}}>
      <AbsoluteFill style={{background: mesh}} />

      {/* ombres de lumière en bandes (fenêtre) */}
      <div
        style={{
          position: 'absolute',
          left: -900,
          top: -700,
          width: W + 1800,
          height: H + 1400,
          transform: `rotate(-24deg) translateX(${bandShift}px)`,
          backgroundImage: `repeating-linear-gradient(90deg, ${rgba(THEME.ink, 0)} 0px, ${rgba(THEME.ink, 0.04)} 150px, ${rgba(THEME.ink, 0.04)} 210px, ${rgba(THEME.ink, 0)} 360px, ${rgba(THEME.ink, 0)} 560px)`,
          filter: 'blur(38px)',
          mixBlendMode: 'multiply',
          opacity: 0.85,
        }}
      />

      {/* fibres du papier */}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: 0.07, mixBlendMode: 'multiply'}}>
        <filter id={fiberId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.0035 0.07" numOctaves={3} seed={7} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${fiberId})`} />
      </svg>

      {/* grille fine + repères tous les 4 carreaux, plus présente sous la lumière */}
      <AbsoluteFill
        style={{
          backgroundImage: [
            `linear-gradient(to right, ${major} 1px, transparent 1px)`,
            `linear-gradient(to bottom, ${major} 1px, transparent 1px)`,
            `linear-gradient(to right, ${line} 1px, transparent 1px)`,
            `linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
          ].join(', '),
          backgroundSize: `${grid * 4}px ${grid * 4}px, ${grid * 4}px ${grid * 4}px, ${grid}px ${grid}px, ${grid}px ${grid}px`,
          WebkitMaskImage: `radial-gradient(ellipse 90% 70% at ${lx}px ${ly}px, #000 25%, rgba(0,0,0,0.45) 100%)`,
          maskImage: `radial-gradient(ellipse 90% 70% at ${lx}px ${ly}px, #000 25%, rgba(0,0,0,0.45) 100%)`,
        }}
      />

      {/* dégradé gris doux en bas, comme une page qui s'enroule */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(to top, ${rgba(THEME.ink, 0.05)} 0%, ${rgba(THEME.ink, 0)} 24%)`,
        }}
      />

      {/* grain papier */}
      <svg width={W} height={H} style={{position: 'absolute', inset: 0, opacity: THEME.grainOpacity, mixBlendMode: 'multiply'}}>
        <filter id={grainId}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#${grainId})`} />
      </svg>
    </AbsoluteFill>
  );
};

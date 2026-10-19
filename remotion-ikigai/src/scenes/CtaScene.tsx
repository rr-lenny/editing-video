import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Layer } from '../components/Camera';
import { FloatingObject } from '../components/FloatingObject';
import { GridBackground } from '../components/GridBackground';
import { ParticleRain, SHAPES } from '../components/ParticleRain';
import { SweepingArc } from '../components/SweepingArc';
import { TextBlock } from '../components/TextBlock';
import { FONTS, THEME } from '../config';
import { localFrame } from '../lib/timing';
import type { SceneProps } from './types';

/** CTA final centré sur fond grille : accroche fine + mot très gras, puis un petit bouton. */
export const CtaScene: React.FC<SceneProps> = ({ scene, index, sceneStart }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const kw = localFrame(scene.text.keywordAt, sceneStart);
  const chipP = spring({ frame: frame - kw - 12, fps, config: { damping: 12, stiffness: 140 } });

  return (
    <>
      <GridBackground />
      <Layer depth={0.55}>
        {(scene.arcs ?? []).map((a, i) => (
          <SweepingArc key={i} {...a} />
        ))}
      </Layer>
      <Layer depth={1}>{scene.hero && <FloatingObject cfg={scene.hero} sceneStart={sceneStart} seed={index + 1} />}</Layer>
      {scene.particles && (
        <Layer depth={1.3}>
          <ParticleRain {...scene.particles} layer="back" />
        </Layer>
      )}
      <Layer depth={1.08}>
        <TextBlock text={scene.text} sceneStart={sceneStart} seed={index * 31} />
        {scene.ctaChip && (
          <div
            style={{
              position: 'absolute',
              left: width / 2,
              top: height / 2 + 190,
              transform: `translate(-50%, 0) scale(${chipP})`,
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '18px 34px',
              borderRadius: 999,
              border: `3px solid ${THEME.ink}`,
              background: THEME.white,
              boxShadow: '0 18px 30px rgba(0,0,0,0.12)',
              fontFamily: FONTS.mono.family,
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: '0.04em',
              color: THEME.ink,
              whiteSpace: 'nowrap',
            }}
          >
            <svg viewBox="0 0 100 100" width={30} height={30}>
              <path d={SHAPES.bookmark} fill={THEME.accent} />
            </svg>
            {scene.ctaChip}
          </div>
        )}
      </Layer>
      {scene.particles && (
        <Layer depth={1.6}>
          <ParticleRain {...scene.particles} layer="front" />
        </Layer>
      )}
    </>
  );
};

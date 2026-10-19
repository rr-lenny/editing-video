import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Layer } from '../components/Camera';
import { GridBackground } from '../components/GridBackground';
import { MagazineDeco } from '../components/MagazineDeco';
import { SafeImg } from '../components/SafeImg';
import { SweepingArc } from '../components/SweepingArc';
import { TextBlock } from '../components/TextBlock';
import { FONTS, SAFE, THEME } from '../config';
import { easeIn, ramp } from '../lib/motion';
import { localFrame } from '../lib/timing';
import type { SceneProps } from './types';

const HEIGHTS = [330, 430, 380, 470];

/** « N piliers » : un compteur + N colonnes qui montent, chacune coiffée de l'objet de son pilier. */
export const PillarsScene: React.FC<SceneProps> = ({ scene, index, total, sceneStart }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const items = scene.items ?? [];
  const n = Math.max(1, items.length);
  const kw = localFrame(scene.text.keywordAt, sceneStart);
  const baseY = height - SAFE.bottom - 40;
  const colW = 150;
  const gap = (width - SAFE.side * 2 - colW * n) / Math.max(1, n - 1);

  return (
    <>
      <GridBackground />
      <Layer depth={0.55}>
        {(scene.arcs ?? []).map((a, i) => (
          <SweepingArc key={i} {...a} />
        ))}
      </Layer>
      <Layer depth={0.8}>
        <MagazineDeco deco={scene.deco ?? {}} index={index} total={total} textAnchor={scene.text.anchor} />
      </Layer>
      <Layer depth={1}>
        {items.map((it, i) => {
          // Chaque colonne apparaît quand le compteur passe sur son numéro.
          const st = kw + 2 + i * 4;
          const grow = spring({ frame: frame - st, fps, config: { damping: 14, stiffness: 120 } });
          const imgP = spring({ frame: frame - st - 6, fps, config: { damping: 11, stiffness: 140 } });
          const h = (HEIGHTS[i % HEIGHTS.length] + Math.sin(frame / 14 + i) * 8) * grow;
          const x = SAFE.side + i * (colW + gap);
          const labelP = ramp(frame, st + 8, 10, easeIn);
          const float = Math.sin(frame / 18 + i * 1.7) * 10;
          return (
            <React.Fragment key={i}>
              <div
                style={{
                  position: 'absolute',
                  left: x,
                  top: baseY - h,
                  width: colW,
                  height: h,
                  borderRadius: '18px 18px 4px 4px',
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #DCDCD8 100%)',
                  border: `3px solid ${THEME.ink}`,
                  boxShadow: '0 30px 40px rgba(0,0,0,0.18)',
                  boxSizing: 'border-box',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: x + colW / 2,
                  top: baseY - h - 20 + float,
                  transform: `translate(-50%, -100%) scale(${imgP}) rotate(${Math.sin(frame / 20 + i) * 6}deg)`,
                  filter: 'drop-shadow(0 18px 16px rgba(0,0,0,0.28))',
                }}
              >
                <SafeImg src={it.src} width={170} suggestedName={it.suggestedName ?? it.label} imgStyle={{ filter: 'grayscale(1) contrast(1.06)' }} />
              </div>
              <div
                style={{
                  position: 'absolute',
                  left: x - 20,
                  width: colW + 40,
                  top: baseY + 14,
                  textAlign: 'center',
                  fontFamily: FONTS.mono.family,
                  fontSize: 19,
                  letterSpacing: '0.08em',
                  color: THEME.gray,
                  opacity: labelP,
                }}
              >
                {`0${i + 1} · ${it.label}`}
              </div>
            </React.Fragment>
          );
        })}
        <div
          style={{
            position: 'absolute',
            left: SAFE.side - 30,
            right: SAFE.side - 30,
            top: baseY,
            height: 4,
            background: THEME.ink,
            transform: `scaleX(${ramp(frame, kw - 4, 14, easeIn)})`,
          }}
        />
      </Layer>
      <Layer depth={1.08}>
        <TextBlock text={scene.text} sceneStart={sceneStart} seed={index * 31} />
      </Layer>
    </>
  );
};

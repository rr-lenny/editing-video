import React from 'react';
import { spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { Layer } from '../components/Camera';
import { DashedCircle } from '../components/DashedCircle';
import { GridBackground } from '../components/GridBackground';
import { MagazineDeco } from '../components/MagazineDeco';
import { SafeImg } from '../components/SafeImg';
import { TextBlock } from '../components/TextBlock';
import { FONTS, THEME } from '../config';
import { easeIn, easeMove, ramp } from '../lib/motion';
import type { SceneProps } from './types';

// haut, droite, bas, gauche
const DIRS: [number, number][] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

/** « Équilibre » : les cercles des piliers convergent et se chevauchent ; au centre, le point d'équilibre + une aiguille qui trouve sa direction. */
export const BalanceScene: React.FC<SceneProps> = ({ scene, index, total, sceneStart }) => {
  const frame = useCurrentFrame();
  const { width, fps } = useVideoConfig();
  const items = scene.items ?? [];
  const cx = width / 2;
  const cy = 1150;
  const r = 175;
  const conv = ramp(frame, 2, 30, easeMove);
  const d = 330 - conv * 200;
  const centerP = spring({ frame: frame - 28, fps, config: { damping: 10, stiffness: 150 } });
  const needle = spring({ frame: frame - 34, fps, config: { damping: 8, stiffness: 60 } });
  const needleAngle = -150 + needle * 150 + Math.sin(frame / 9) * 3;
  const spin = frame * 0.25;

  return (
    <>
      <GridBackground />
      <Layer depth={0.8}>
        <MagazineDeco deco={scene.deco ?? {}} index={index} total={total} textAnchor={scene.text.anchor} />
      </Layer>
      <Layer depth={1}>
        <div style={{ position: 'absolute', inset: 0, transform: `rotate(${spin}deg)`, transformOrigin: `${cx}px ${cy}px` }}>
          {items.map((_, i) => {
            const [dx, dy] = DIRS[i % 4];
            const x = cx + dx * d;
            const y = cy + dy * d;
            const p = ramp(frame, i * 3, 12, easeIn);
            return (
              <React.Fragment key={i}>
                <div
                  style={{
                    position: 'absolute',
                    left: x - r,
                    top: y - r,
                    width: r * 2,
                    height: r * 2,
                    borderRadius: '50%',
                    background: i === 0 ? 'rgba(232,67,46,0.10)' : 'rgba(0,0,0,0.045)',
                    opacity: p,
                  }}
                />
                <DashedCircle cx={x} cy={y} r={r} color={THEME.ink} strokeWidth={4} delay={i * 3} drawDuration={18} spin={0.9} />
              </React.Fragment>
            );
          })}
        </div>
        {items.map((it, i) => {
          const [dx, dy] = DIRS[i % 4];
          const a = (spin * Math.PI) / 180;
          const ox = dx * (d + 85);
          const oy = dy * (d + 85);
          const x = cx + ox * Math.cos(a) - oy * Math.sin(a);
          const y = cy + ox * Math.sin(a) + oy * Math.cos(a);
          const p = spring({ frame: frame - i * 3 - 4, fps, config: { damping: 12, stiffness: 130 } });
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x,
                top: y + Math.sin(frame / 16 + i) * 8,
                transform: `translate(-50%, -50%) scale(${p}) rotate(${Math.sin(frame / 22 + i) * 7}deg)`,
                filter: 'drop-shadow(0 16px 14px rgba(0,0,0,0.28))',
              }}
            >
              <SafeImg src={it.src} width={150} suggestedName={it.suggestedName ?? it.label} imgStyle={{ filter: 'grayscale(1) contrast(1.06)' }} />
            </div>
          );
        })}
        {/* point d'équilibre + aiguille */}
        <div
          style={{
            position: 'absolute',
            left: cx,
            top: cy,
            width: 0,
            height: 0,
            transform: `scale(${centerP})`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: -4,
              top: -150,
              width: 8,
              height: 150,
              borderRadius: 4,
              background: THEME.ink,
              transformOrigin: '50% 100%',
              transform: `rotate(${needleAngle}deg)`,
            }}
          >
            <div
              style={{
                position: 'absolute',
                left: -14,
                top: -18,
                width: 0,
                height: 0,
                borderLeft: '18px solid transparent',
                borderRight: '18px solid transparent',
                borderBottom: `30px solid ${THEME.ink}`,
              }}
            />
          </div>
          <div
            style={{
              position: 'absolute',
              left: -30,
              top: -30,
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: THEME.accent,
              boxShadow: `0 0 0 ${10 + Math.sin(frame / 5) * 6}px rgba(232,67,46,0.22)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: -100,
              width: 200,
              top: 46,
              textAlign: 'center',
              fontFamily: FONTS.mono.family,
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: '0.3em',
              color: THEME.ink,
            }}
          >
            IKIGAI
          </div>
        </div>
      </Layer>
      <Layer depth={1.08}>
        <TextBlock text={scene.text} sceneStart={sceneStart} seed={index * 31} />
      </Layer>
    </>
  );
};

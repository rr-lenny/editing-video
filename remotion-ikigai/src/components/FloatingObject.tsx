import React, { useId } from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { MOTION, THEME } from '../config';
import { cssId, easeIn, ramp } from '../lib/motion';
import { localFrame } from '../lib/timing';
import type { ObjectConfig, VectorKind } from '../types';
import { useBlurFilter } from './Camera';
import { DashedCircle } from './DashedCircle';
import { DotGrid } from './GridBackground';
import { SafeImg } from './SafeImg';

/** Objets 100 % code (quand aucune image ne convient). `p` = progression de la couleur 0..1. */
const VectorObject: React.FC<{ kind: VectorKind; width: number; p: number; colored: boolean; frame: number }> = ({ kind, width, p, colored, frame }) => {
  const uid = cssId(useId());
  const fill = colored ? THEME.accent : '#9A9A96';
  if (kind === 'sun') {
    // Soleil levant : disque plein + fines bandes horizontales qui défilent.
    return (
      <svg viewBox="0 0 200 200" width={width} height={width} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <radialGradient id={`sunGrad-${uid}`} cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#FF6A4F" stopOpacity={colored ? 1 : 0} />
            <stop offset="100%" stopColor={fill} />
          </radialGradient>
          <clipPath id={`sunClip-${uid}`}>
            <circle cx="100" cy="100" r="96" />
          </clipPath>
        </defs>
        <circle cx="100" cy="100" r="96" fill={`url(#sunGrad-${uid})`} />
        <g clipPath={`url(#sunClip-${uid})`}>
          {Array.from({ length: 6 }, (_, i) => {
            const y = 120 + i * 14 + ((frame * 0.5) % 14);
            return <rect key={i} x="0" y={y} width="200" height={1.5 + i * 0.9} fill={THEME.paperTop} opacity={0.9} />;
          })}
        </g>
      </svg>
    );
  }
  if (kind === 'bookmark') {
    // Icône « enregistrer » : contour noir, se remplit de la couleur d'accent de bas en haut.
    const h = 240;
    const fillY = 20 + (1 - p) * 200;
    return (
      <svg viewBox="0 0 200 240" width={width} height={(width * h) / 200} style={{ display: 'block', overflow: 'visible' }}>
        <defs>
          <clipPath id={`bmClip-${uid}`}>
            <path d="M30 20 H170 V225 L100 170 L30 225 Z" />
          </clipPath>
        </defs>
        <path d="M30 20 H170 V225 L100 170 L30 225 Z" fill={THEME.white} />
        <g clipPath={`url(#bmClip-${uid})`}>
          <rect x="0" y={fillY} width="200" height="240" fill={THEME.accent} />
        </g>
        <path d="M30 20 H170 V225 L100 170 L30 225 Z" fill="none" stroke={THEME.ink} strokeWidth="12" strokeLinejoin="round" />
      </svg>
    );
  }
  // globe : méridiens et parallèles qui tournent.
  const spin = (frame * 1.6) % 360;
  return (
    <svg viewBox="0 0 200 200" width={width} height={width} style={{ display: 'block', overflow: 'visible' }}>
      <circle cx="100" cy="100" r="92" fill={colored ? THEME.accent : '#B5B5B0'} />
      <g fill="none" stroke={THEME.paperTop} strokeWidth="3" opacity="0.9">
        {[0, 1, 2, 3].map((i) => {
          const a = ((spin + i * 45) % 180) / 180; // 0..1
          const rx = Math.abs(Math.cos(a * Math.PI)) * 92;
          return <ellipse key={i} cx="100" cy="100" rx={Math.max(1, rx)} ry="92" />;
        })}
        {[-55, -25, 0, 25, 55].map((dy) => (
          <line key={dy} x1={100 - Math.sqrt(92 * 92 - dy * dy)} x2={100 + Math.sqrt(92 * 92 - dy * dy)} y1={100 + dy} y2={100 + dy} />
        ))}
      </g>
    </svg>
  );
};

/**
 * Objet « héros » : entrée animée, flottement, rotation 3D (±8°), ombre portée douce, désaturé
 * par défaut (couleur d'accent si `color`), grille de points et cercle en pointillés optionnels.
 */
export const FloatingObject: React.FC<{ cfg: ObjectConfig; sceneStart: number; seed?: number }> = ({ cfg, sceneStart, seed = 1 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const delay = cfg.delay ?? 1;
  const t = frame - delay;
  const tilt = MOTION.tilt;

  /* entrée */
  const sp = spring({ frame: t, fps, config: { damping: 13, stiffness: 110, mass: 0.9 } });
  const ein = ramp(frame, delay, 14, easeIn);
  let tx = 0;
  let ty = 0;
  let sc = 1;
  switch (cfg.enter ?? 'pop') {
    case 'pop':
      sc = 0.35 + 0.65 * sp;
      break;
    case 'rise':
      ty = (1 - ein) * 320;
      sc = 0.9 + 0.1 * ein;
      break;
    case 'drop':
      ty = -(1 - sp) * 760;
      break;
    case 'side':
      tx = (1 - ein) * (cfg.x >= 540 ? 520 : -520);
      break;
  }
  const opacity = (cfg.opacity ?? 1) * Math.min(1, ein * 1.6);

  /* vie permanente */
  const floatY = Math.sin(frame / 21 + seed) * 16;
  const rotX = Math.sin(frame / 33 + seed * 2) * tilt * 0.7;
  const rotY = Math.cos(frame / 27 + seed) * tilt;
  let rotZ = (cfg.rotate ?? 0) + Math.sin(frame / 40 + seed) * 2;
  if (cfg.wave) rotZ += Math.sin(frame / 4.5) * 7 * ein;
  if (cfg.beat) {
    const ph = frame % 22;
    const pulse = ph < 3 ? ph / 3 : Math.exp(-(ph - 3) / 3.5);
    sc *= 1 + 0.06 * pulse;
  }

  /* couleur / halo */
  const colorStart = cfg.colorAt !== undefined ? localFrame(cfg.colorAt, sceneStart) : null;
  const colorP = cfg.color ? (colorStart === null ? 1 : ramp(frame, colorStart, 10, easeIn)) : 0;
  const glowP = cfg.glow ? (colorStart === null ? 1 : ramp(frame, colorStart, 12, easeIn)) : 0;

  const { filter: blurFilter, defs } = useBlurFilter(0, 0, cfg.blur ?? 0);
  const w = cfg.width;
  const ringR = Math.min(Math.max(w * 0.62, 150), 520);

  return (
    <AbsoluteFill style={{ opacity }}>
      {defs}
      {cfg.dots && <DotGrid x={cfg.x + tx * 0.5} y={cfg.y + ty * 0.5} size={w * 2.1} />}
      {glowP > 0 && (
        <div
          style={{
            position: 'absolute',
            left: cfg.x - w * 1.3,
            top: cfg.y - w * 1.5,
            width: w * 2.6,
            height: w * 2.6,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${THEME.accentSoft} 0%, rgba(245,160,143,0.35) 35%, rgba(245,160,143,0) 70%)`,
            opacity: glowP * (0.85 + Math.sin(frame / 5) * 0.1),
            transform: `translate(${tx}px, ${ty + floatY}px) scale(${0.8 + glowP * 0.25})`,
          }}
        />
      )}
      {cfg.ring && (
        <DashedCircle
          cx={cfg.x + tx}
          cy={cfg.y + ty + floatY * 0.4}
          r={ringR}
          color={cfg.ring === 'accent' ? THEME.accent : THEME.ink}
          strokeWidth={cfg.ring === 'accent' ? 6 : 4}
          delay={delay + 4}
        />
      )}
      <div
        style={{
          position: 'absolute',
          left: cfg.x,
          top: cfg.y,
          transform: `translate(-50%, -50%) translate(${tx}px, ${ty + floatY}px)`,
          perspective: 1400,
        }}
      >
        <div
          style={{
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${sc})`,
            filter: [`drop-shadow(0 ${w * 0.05}px ${w * 0.05}px rgba(0,0,0,0.30))`, blurFilter].filter(Boolean).join(' '),
          }}
        >
          {cfg.vector ? (
            <VectorObject kind={cfg.vector} width={w} p={colorP} colored={!!cfg.color} frame={frame} />
          ) : (
            <SafeImg
              src={cfg.src}
              width={w}
              suggestedName={cfg.suggestedName}
              imgStyle={{ filter: `grayscale(${1 - colorP * 0.4}) contrast(1.06) brightness(${1 + glowP * 0.08})` }}
              overlay={(url) =>
                colorP > 0 ? (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: THEME.accent,
                      mixBlendMode: 'color',
                      opacity: colorP * 0.9,
                      WebkitMaskImage: `url("${url}")`,
                      maskImage: `url("${url}")`,
                      WebkitMaskSize: '100% 100%',
                      maskSize: '100% 100%',
                    }}
                  />
                ) : null
              }
            />
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

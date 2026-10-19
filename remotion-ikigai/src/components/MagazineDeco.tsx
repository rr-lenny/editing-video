import React from 'react';
import { random, useCurrentFrame, useVideoConfig } from 'remotion';
import { FONTS, SAFE, THEME } from '../config';
import { easeIn, ramp } from '../lib/motion';
import type { DecoConfig } from '../types';

/** Code-barres généré (déterministe) avec un petit numéro dessous. */
const Barcode: React.FC<{ seed: number; color: string; p: number }> = ({ seed, color, p }) => {
  let x = 0;
  const bars: { x: number; w: number }[] = [];
  for (let i = 0; i < 34; i++) {
    const w = 2 + Math.floor(random(`bc${seed}-${i}`) * 4);
    if (i % 2 === 0) bars.push({ x, w });
    x += w + 1;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)` }}>
      <svg width={x} height={46}>
        {bars.map((b, i) => (
          <rect key={i} x={b.x} y={0} width={b.w} height={46} fill={color} />
        ))}
      </svg>
      <div style={{ fontFamily: FONTS.mono.family, fontSize: 13, color, letterSpacing: '0.18em' }}>
        {`4 ${String(Math.floor(random(`bn${seed}`) * 1e6)).padStart(6, '0')} 1KG41`}
      </div>
    </div>
  );
};

/** Détails « magazine » : code-barres, numéro de scène, label vertical 生き甲斐, gros index de pilier. */
export const MagazineDeco: React.FC<{ deco: DecoConfig; index: number; total: number; light?: boolean; textAnchor?: 'top' | 'bottom' | 'center' }> = ({
  deco,
  index,
  total,
  light,
  textAnchor = 'top',
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const color = light ? 'rgba(255,255,255,0.75)' : 'rgba(20,20,20,0.55)';
  const p = ramp(frame, 3, 14, easeIn);
  const drift = Math.sin(frame / 30) * 6;

  const corner = (c: 'tl' | 'tr' | 'bl' | 'br'): React.CSSProperties => ({
    position: 'absolute',
    ...(c[0] === 't' ? { top: SAFE.top - 30 } : { bottom: SAFE.bottom - 120 }),
    ...(c[1] === 'l' ? { left: SAFE.side } : { right: SAFE.side }),
    transform: `translateY(${drift}px)`,
  });

  return (
    <>
      {deco.barcode && (
        <div style={corner(deco.barcode)}>
          <Barcode seed={index} color={color} p={p} />
        </div>
      )}
      {deco.number && (
        <div
          style={{
            position: 'absolute',
            top: SAFE.top - 24,
            ...(deco.barcode === 'tl' ? { right: SAFE.side } : { left: SAFE.side }),
            fontFamily: FONTS.mono.family,
            fontSize: 18,
            letterSpacing: '0.2em',
            color,
            opacity: p,
          }}
        >
          {`N°${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')} — IKIGAI`}
        </div>
      )}
      {deco.kanji && (
        <div
          style={{
            position: 'absolute',
            top: height * 0.32,
            ...(deco.kanji === 'left' ? { left: 26 } : { right: 26 }),
            writingMode: 'vertical-rl',
            fontFamily: `${FONTS.kanji.family}, serif`,
            fontWeight: 700,
            fontSize: 54,
            letterSpacing: '0.35em',
            color: light ? 'rgba(255,255,255,0.35)' : 'rgba(20,20,20,0.16)',
            transform: `translateY(${-frame * 0.6}px)`,
            opacity: p,
          }}
        >
          生き甲斐
        </div>
      )}
      {deco.index && (
        <div
          style={{
            position: 'absolute',
            right: SAFE.side - 10,
            ...(textAnchor === 'bottom' ? { top: SAFE.top + 20 } : { bottom: SAFE.bottom + 10 }),
            fontFamily: FONTS.keyword.family,
            fontWeight: 900,
            fontSize: 210,
            letterSpacing: '-0.06em',
            color: 'transparent',
            WebkitTextStroke: `3px ${THEME.grayLight}`,
            transform: `translateY(${(1 - p) * 80 + drift}px)`,
            opacity: p,
            lineHeight: 1,
          }}
        >
          {deco.index}
        </div>
      )}
      {/* repère de coupe discret en bas */}
      <div
        style={{
          position: 'absolute',
          left: width / 2 - 40,
          bottom: SAFE.bottom - 60,
          width: 80,
          height: 2,
          background: color,
          opacity: 0.4 * p,
        }}
      />
    </>
  );
};

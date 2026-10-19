import React from 'react';
import { interpolate, random, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { THEME } from '../config';
import { easeIn, easeMove, ramp } from '../lib/motion';
import type { Reveal } from '../types';

export interface FontSpec {
  family: string;
  weight: number;
  style?: 'normal' | 'italic';
  tracking: number;
  lineHeight?: number;
}

interface Props {
  text: string;
  reveal: Reveal;
  /** Frame locale de départ. */
  start: number;
  fontSize: number;
  color: string;
  font: FontSpec;
  /** Écart entre deux mots (reveal 'words'). */
  stagger?: number;
  counterTo?: number;
  seed?: number;
  /** Version douce (accroches) : déplacement et flou réduits. */
  soft?: boolean;
}

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&@$*+?!';

/**
 * Typographie cinétique. Techniques :
 *  words (blur → net + glissement), scramble (décodage), typewriter (lettres + curseur),
 *  gather (lettres éparpillées qui se rassemblent), slam (arrive trop grand + overshoot + flou), counter.
 */
export const KineticText: React.FC<Props> = ({ text, reveal, start, fontSize, color, font, stagger, counterTo = 0, seed = 1, soft = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame - start;
  const lines = text.split('\n');

  const base: React.CSSProperties = {
    fontFamily: font.family,
    fontWeight: font.weight,
    fontStyle: font.style ?? 'normal',
    fontSize,
    letterSpacing: `${font.tracking}em`,
    lineHeight: font.lineHeight ?? 1.05,
    color,
    whiteSpace: 'pre',
  };

  /* ---------------- compteur ---------------- */
  if (reveal === 'counter') {
    const dur = 16;
    const valueAt = (f: number) =>
      Math.round(interpolate(f, [start, start + dur], [0, counterTo], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeMove }));
    const value = valueAt(frame);
    let since = frame;
    while (since > start && valueAt(since - 1) === value) since--;
    const bump = 1 + 0.14 * Math.exp(-(frame - since) / 3);
    const appear = ramp(frame, start, 5, easeIn);
    return (
      <div style={{ ...base, fontVariantNumeric: 'tabular-nums', opacity: appear, transform: `scale(${bump})`, display: 'inline-block' }}>{String(value)}</div>
    );
  }

  /* ---------------- slam (bloc entier) ---------------- */
  if (reveal === 'slam') {
    const sp = spring({ frame: t, fps, config: { damping: 9, stiffness: 170, mass: 0.75 } });
    const scale = 2.7 - 1.7 * sp;
    const opacity = ramp(frame, start, 3, easeIn);
    const blur = Math.max(0, 1 - sp) * 22;
    const shakeK = t > 2 ? Math.exp(-(t - 2) / 4) : 0;
    const sx = (random(`sx${seed}${frame}`) - 0.5) * 16 * shakeK;
    const sy = (random(`sy${seed}${frame}`) - 0.5) * 16 * shakeK;
    return (
      <div
        style={{
          ...base,
          opacity: t < 0 ? 0 : opacity,
          transform: `translate(${sx}px, ${sy}px) scale(${scale})`,
          filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
          textAlign: 'center',
        }}
      >
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
    );
  }

  /* ---------------- par mot / par lettre ---------------- */
  let wordIndex = 0;
  let letterIndex = 0;
  const totalLetters = text.replace(/\s/g, '').length;
  const typeStep = 1.6;
  const typedCount = Math.floor(Math.max(0, t) / typeStep) + (t >= 0 ? 1 : 0);
  const lastTyped = Math.min(totalLetters, typedCount) - 1;
  const caretOn = t >= 0 && t < totalLetters * typeStep + 14 && Math.floor(frame / 6) % 2 === 0;

  return (
    <div style={{ ...base, textAlign: 'center' }}>
      {lines.map((line, li) => (
        <div key={li}>
          {line.split(' ').map((word, wi, arr) => {
            const k = wordIndex++;
            const space = wi < arr.length - 1 ? ' ' : '';

            if (reveal === 'words') {
              const ws = start + k * (stagger ?? 4);
              const p = ramp(frame, ws, soft ? 10 : 13, easeIn);
              return (
                <span
                  key={wi}
                  style={{
                    display: 'inline-block',
                    opacity: p,
                    transform: `translateY(${(1 - p) * (soft ? 0.35 : 0.55)}em)`,
                    filter: p < 0.99 ? `blur(${(1 - p) * (soft ? 8 : 16)}px)` : undefined,
                  }}
                >
                  {word + space}
                </span>
              );
            }

            return (
              <span key={wi} style={{ display: 'inline-block' }}>
                {[...word].map((ch, ci) => {
                  const j = letterIndex++;
                  const r = (s: string) => random(`${seed}-${j}-${s}`);

                  if (reveal === 'scramble') {
                    const appear = start + j * 1.2;
                    const resolve = start + 7 + j * 2.2;
                    if (frame < appear)
                      return (
                        <span key={ci} style={{ opacity: 0 }}>
                          {ch}
                        </span>
                      );
                    const resolved = frame >= resolve;
                    const g = GLYPHS[Math.floor(random(`${seed}-${j}-${Math.floor(frame / 2)}`) * GLYPHS.length)];
                    const pop = resolved ? 1 + 0.18 * Math.exp(-(frame - resolve) / 2.5) : 1;
                    return (
                      <span key={ci} style={{ position: 'relative', display: 'inline-block', transform: `scale(${pop})` }}>
                        <span style={{ visibility: resolved ? 'visible' : 'hidden' }}>{ch}</span>
                        {!resolved && (
                          <span style={{ position: 'absolute', left: 0, right: 0, textAlign: 'center', color: THEME.gray, opacity: 0.85 }}>{g}</span>
                        )}
                      </span>
                    );
                  }

                  if (reveal === 'typewriter') {
                    const visible = j <= lastTyped;
                    return (
                      <span key={ci} style={{ position: 'relative', display: 'inline-block', opacity: visible ? 1 : 0 }}>
                        {ch}
                        {j === lastTyped && caretOn && (
                          <span
                            style={{
                              position: 'absolute',
                              right: '-0.12em',
                              top: '0.08em',
                              width: '0.09em',
                              height: '0.8em',
                              background: THEME.accent,
                              opacity: 1,
                            }}
                          />
                        )}
                      </span>
                    );
                  }

                  // gather
                  const sp = spring({ frame: t - r('d') * 5, fps, config: { damping: 17, stiffness: 190, mass: 0.7 } });
                  const dx = (r('x') - 0.5) * 1500;
                  const dy = (r('y') - 0.5) * 1100;
                  const rot = (r('r') - 0.5) * 240;
                  const sc = 0.3 + r('s') * 1.8;
                  return (
                    <span
                      key={ci}
                      style={{
                        display: 'inline-block',
                        opacity: t < 0 ? 0 : Math.min(1, sp * 2),
                        transform: `translate(${(1 - sp) * dx}px, ${(1 - sp) * dy}px) rotate(${(1 - sp) * rot}deg) scale(${1 + (1 - sp) * (sc - 1)})`,
                        filter: sp < 0.98 ? `blur(${Math.max(0, 1 - sp) * 12}px)` : undefined,
                      }}
                    >
                      {ch}
                    </span>
                  );
                })}
                {space && <span>{space}</span>}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

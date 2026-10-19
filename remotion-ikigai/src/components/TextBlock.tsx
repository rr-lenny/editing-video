import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { FONTS, SAFE, THEME } from '../config';
import { easeIn, ramp } from '../lib/motion';
import { localFrame } from '../lib/timing';
import type { TextConfig } from '../types';
import { KineticText } from './KineticText';

/** Taille du mot-clé : celle de la config, réduite si la plus longue ligne dépasse la zone utile. */
export const fitKeywordSize = (keyword: string, size: number, maxWidth: number): number => {
  const longest = Math.max(...keyword.split('\n').map((l) => l.length));
  return Math.min(size, maxWidth / (longest * FONTS.keyword.widthFactor));
};

interface Props {
  text: TextConfig;
  sceneStart: number;
  /** Couleurs (la scène punch passe tout en blanc). */
  kickerColor?: string;
  keywordColor?: string;
  captionColor?: string;
  seed?: number;
}

/**
 * Bloc typographique à deux niveaux : petite accroche fine (gris) au-dessus d'un mot-clé énorme
 * (quasi-noir, interlettrage serré), ligne secondaire et petit paragraphe « magazine ».
 * Positionné dans les safe zones Reels (rien dans les 250 px du haut ni les 400 px du bas).
 */
export const TextBlock: React.FC<Props> = ({ text, sceneStart, kickerColor = THEME.gray, keywordColor = THEME.ink, captionColor = '#7C7C78', seed = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const maxWidth = width - SAFE.side * 2;
  const size = fitKeywordSize(text.keyword, text.size, maxWidth);
  const kStart = localFrame(text.kickerAt, sceneStart);
  const wStart = localFrame(text.keywordAt, sceneStart);
  const sStart = text.sublineAt !== undefined ? localFrame(text.sublineAt, sceneStart) : wStart + 10;
  const captionStart = Math.max(wStart, sStart) + 8;
  const captionP = ramp(frame, captionStart, 16, easeIn);

  const position: React.CSSProperties =
    text.anchor === 'top'
      ? { top: SAFE.top + 50 }
      : text.anchor === 'bottom'
        ? { bottom: SAFE.bottom + 40 }
        : { top: height / 2, transform: 'translateY(-50%)' };

  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.side,
        right: SAFE.side,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        ...position,
      }}
    >
      {text.kicker && (
        <KineticText
          text={text.kicker}
          reveal="words"
          soft
          start={kStart}
          stagger={text.kickerStagger ?? 3}
          fontSize={FONTS.kicker.size}
          color={kickerColor}
          font={{ family: FONTS.kicker.family, weight: FONTS.kicker.weight, style: FONTS.kicker.style, tracking: FONTS.kicker.tracking, lineHeight: 1.1 }}
          seed={seed}
        />
      )}
      <div style={{ color: text.accent ? THEME.accent : keywordColor }}>
        <KineticText
          text={text.keyword}
          reveal={text.reveal}
          start={wStart}
          stagger={text.stagger}
          counterTo={text.counterTo}
          fontSize={size}
          color={text.accent ? THEME.accent : keywordColor}
          font={{ family: FONTS.keyword.family, weight: FONTS.keyword.weight, tracking: FONTS.keyword.tracking, lineHeight: FONTS.keyword.lineHeight }}
          seed={seed + 7}
        />
      </div>
      {text.subline && (
        <KineticText
          text={text.subline}
          reveal="words"
          soft
          start={sStart}
          stagger={3}
          fontSize={text.sublineStyle === 'bold' ? FONTS.bold.size : FONTS.kicker.size}
          color={text.sublineStyle === 'bold' ? keywordColor : kickerColor}
          font={
            text.sublineStyle === 'bold'
              ? { family: FONTS.bold.family, weight: FONTS.bold.weight, tracking: FONTS.bold.tracking }
              : { family: FONTS.kicker.family, weight: FONTS.kicker.weight, style: FONTS.kicker.style, tracking: FONTS.kicker.tracking }
          }
          seed={seed + 13}
        />
      )}
      {text.caption && (
        <div
          style={{
            marginTop: 14,
            maxWidth: 600,
            fontFamily: FONTS.mono.family,
            fontSize: 21,
            lineHeight: 1.45,
            color: captionColor,
            textAlign: 'center',
            clipPath: `inset(0 ${(1 - captionP) * 100}% 0 0)`,
            opacity: captionP,
          }}
        >
          {text.caption}
        </div>
      )}
    </div>
  );
};

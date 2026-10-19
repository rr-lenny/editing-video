import React from 'react';
import {useCurrentFrame} from 'remotion';
import {CompositionSpec, Item, LineSpec, THEME, TYPE_COLUMN, WordSpec} from '../config';
import {drift, EASE_SOFT, ramp, sec} from '../lib/anim';
import {FONTS} from '../lib/fonts';
import {EditorialRule} from './EditorialRule';
import {glowShadow} from './GlowText';
import {InkText} from './InkText';
import {MicroCaption} from './MicroCaption';

/* Interlettrage : serré en grande taille, normal en petite taille. */
const tracking = (w: WordSpec): string => {
  if (w.role === 'serif' || w.role === 'link') return w.size >= 100 ? '-0.02em' : '0em';
  if (w.size >= 140) return '-0.045em';
  if (w.size >= 90) return '-0.035em';
  if (w.size >= 60) return '-0.03em';
  return '-0.005em';
};

const fontFor = (w: WordSpec): React.CSSProperties => {
  switch (w.role) {
    case 'sans':
      return {fontFamily: FONTS.sans, fontWeight: 600, fontStyle: 'normal'};
    case 'sansLight':
      return {fontFamily: FONTS.sans, fontWeight: 500, fontStyle: 'normal'};
    case 'serif':
      return {fontFamily: FONTS.serif, fontWeight: 500, fontStyle: 'italic'};
    case 'link':
      return {fontFamily: FONTS.serif, fontWeight: 400, fontStyle: 'italic'};
    case 'ink':
      return {fontFamily: FONTS.sans, fontWeight: 800, fontStyle: 'normal'};
  }
};

/* Marge de « respiration » : le halo et le flou ne sont jamais coupés par les masques. */
const PAD = '0.22em 0.28em';
const NEG = '-0.22em -0.28em';

interface WordProps {
  w: WordSpec;
  start: number;
  exitAt: number;
  exitDur: number;
  /** décalage horizontal d'entrée (selon l'alignement de la ligne) */
  fromX?: number;
}

const Word: React.FC<WordProps> = ({w, start, exitAt, exitDur, fromX = 0}) => {
  const frame = useCurrentFrame();
  if (w.role === 'ink') {
    return (
      <InkText
        text={w.text}
        size={w.size}
        start={start}
        dur={w.dur}
        exitAt={exitAt}
        exitDur={exitDur}
        color={w.tone === 'ink' ? THEME.ink : THEME.text}
        gradient={w.tone === 'ink' ? THEME.inkGradient : THEME.textGradient}
        seed={w.text.length * 7 + Math.round(w.size)}
        fromX={fromX}
        sheenAt={w.key ? start + (w.dur ?? 15) + 2 : undefined}
        style={{zIndex: w.z ?? 1, translate: `${w.dx ?? 0}px ${w.dy ?? 0}px`}}
      />
    );
  }
  const reveal = w.reveal ?? 'blur';
  const dur = w.dur ?? 22;
  const p = ramp(frame, start, dur);
  const e = ramp(frame, exitAt, exitDur, EASE_SOFT);
  const glowMax = w.key ? 1 : 0.5;
  const color = w.tone === 'ink' ? THEME.inkSoft : THEME.text;
  const glow = w.tone === 'ink' ? 0 : glowMax * p * (1 - e);

  const base: React.CSSProperties = {
    ...fontFor(w),
    display: 'inline-block',
    position: 'relative',
    zIndex: w.z ?? 1,
    fontSize: w.size,
    lineHeight: 0.9,
    letterSpacing: tracking(w),
    whiteSpace: 'nowrap',
    color,
    padding: PAD,
    margin: NEG,
    textShadow: glowShadow(glow),
  };

  const outBlur = e * 12;
  const outY = -e * 10;
  const offset = `translate(${w.dx ?? 0}px, ${w.dy ?? 0}px)`;

  if (reveal === 'type') {
    // machine à écrire douce : chaque lettre arrive en flou, l'une après l'autre
    const letters = Array.from(w.text);
    const step = Math.max(1.5, (dur - 8) / Math.max(1, letters.length - 1));
    return (
      <span style={{...base, textShadow: 'none', opacity: 1 - e, filter: `blur(${outBlur}px)`, transform: `${offset} translateY(${outY}px)`}}>
        {letters.map((ch, i) => {
          const q = ramp(frame, start + i * step, 9);
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                whiteSpace: 'pre',
                opacity: q,
                filter: `blur(${(1 - q) * 8}px)`,
                transform: `translateY(${(1 - q) * 8}px)`,
                textShadow: glowShadow(glowMax * q * (1 - e)),
              }}
            >
              {ch}
            </span>
          );
        })}
      </span>
    );
  }

  if (reveal === 'maskRight' || reveal === 'maskUp') {
    const dir = reveal === 'maskRight' ? '90deg' : '0deg';
    const a = p * 140 - 40;
    const mask = `linear-gradient(${dir}, #000 ${a}%, transparent ${a + 40}%)`;
    return (
      <span
        style={{
          ...base,
          WebkitMaskImage: mask,
          maskImage: mask,
          opacity: 1 - e,
          filter: `blur(${(1 - p) * 5 + outBlur}px)`,
          transform: `${offset} translateY(${(1 - p) * (reveal === 'maskUp' ? 14 : 0) + outY}px)`,
        }}
      >
        {w.text}
      </span>
    );
  }

  // révélation signature : flou 16px → 0, fondu, léger glissement
  return (
    <span
      style={{
        ...base,
        opacity: p * (1 - e),
        filter: `blur(${(1 - p) * 16 + outBlur}px)`,
        transform: `${offset} translateY(${(1 - p) * 18 + outY}px)`,
      }}
    >
      {w.text}
    </span>
  );
};

interface Props {
  spec: CompositionSpec;
  /** frame globale de début de la séquence (pour convertir les secondes de la voix off) */
  seqFrom: number;
  /** frame locale où commence la sortie */
  exitAt: number;
  exitDur: number;
  /** amplitude du flottement vertical continu (px) */
  float?: number;
}

/** Bloc typographique éditorial (sans / serif), décrit dans config.ts. */
export const TypeComposition: React.FC<Props> = ({spec, seqFrom, exitAt, exitDur, float = 3}) => {
  const frame = useCurrentFrame();
  const left = spec.left ?? TYPE_COLUMN.left;
  const width = spec.width ?? TYPE_COLUMN.width;
  const local = (s: number) => sec(s) - seqFrom;

  const renderItem = (item: Item, li: number, ii: number, fromX: number) => {
    // les lignes sortent avec un très léger décalage, de haut en bas
    const xa = exitAt + li;
    const key = `${li}-${ii}`;
    if (item.kind === 'rule') {
      return <EditorialRule key={key} left={item.left} right={item.right} width={item.width} start={local(item.at)} exitAt={xa} exitDur={exitDur} />;
    }
    if (item.kind === 'caption') {
      return (
        <MicroCaption
          key={key}
          text={item.text}
          start={local(item.at)}
          size={item.size}
          exitAt={xa}
          exitDur={exitDur}
          style={{transform: `translate(${item.dx ?? 0}px, ${item.dy ?? 0}px)`}}
        />
      );
    }
    return <Word key={key} w={item} start={local(item.at)} exitAt={xa} exitDur={exitDur} fromX={fromX} />;
  };

  const justify = (l: LineSpec) => (l.align === 'left' ? 'flex-start' : l.align === 'right' ? 'flex-end' : 'center');

  return (
    <div
      style={{
        position: 'absolute',
        top: spec.top,
        left,
        width,
        display: 'flex',
        flexDirection: 'column',
        transform: `translateY(${drift(frame, float, 140)}px)`,
      }}
    >
      {spec.lines.map((l, li) => (
        <div
          key={li}
          style={{
            display: 'flex',
            justifyContent: justify(l),
            alignItems: 'baseline',
            gap: l.gap ?? 18,
            marginTop: l.mt ?? 0,
            transform: `translateX(${l.dx ?? 0}px)`,
          }}
        >
          {l.items.map((it, ii) => renderItem(it, li, ii, l.align === 'left' ? -90 : l.align === 'right' ? 90 : 0))}
        </div>
      ))}
    </div>
  );
};

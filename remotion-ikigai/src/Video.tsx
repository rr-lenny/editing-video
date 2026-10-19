import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { PassWiper, Transition } from './components/Transition';
import { AUDIO, SCENES, SFX_LIBRARY, THEME, TRANSITION_SFX } from './config';
import './lib/fonts';
import { SCENE_STARTS } from './lib/timing';
import { Scene } from './scenes';
import type { SfxName } from './types';

const PASS_FRAMES = 16;

interface PlacedSfx {
  key: string;
  name: SfxName;
  /** Frame globale du pic. */
  peak: number;
  volume: number;
}

/** Tous les SFX : celui de chaque transition (pic sur la coupe) + les repères propres aux scènes. */
const placeSfx = (fps: number): PlacedSfx[] => {
  const out: PlacedSfx[] = [];
  SCENES.forEach((s, i) => {
    const start = SCENE_STARTS[i];
    const tName = i > 0 ? TRANSITION_SFX[s.transition] : null;
    if (tName) out.push({ key: `${s.id}-t`, name: tName, peak: start, volume: SFX_LIBRARY[tName].volume });
    (s.sfx ?? []).forEach((c, j) => {
      const peak = c.sec !== undefined ? Math.round(c.sec * fps) : start + (c.frame ?? 0);
      out.push({ key: `${s.id}-${j}`, name: c.name, peak, volume: c.volume ?? SFX_LIBRARY[c.name].volume });
    });
  });
  return out;
};

export const Video: React.FC = () => {
  const { fps } = useVideoConfig();
  const sfx = placeSfx(fps);

  return (
    <AbsoluteFill style={{ backgroundColor: THEME.paperBottom }}>
      {SCENES.map((s, i) => (
        <Sequence key={s.id} name={s.id} from={SCENE_STARTS[i]} durationInFrames={s.durationInFrames}>
          <Transition enter={s.transition} exit={SCENES[i + 1]?.transition ?? null} durationInFrames={s.durationInFrames}>
            <Scene scene={s} index={i} total={SCENES.length} sceneStart={SCENE_STARTS[i]} />
          </Transition>
        </Sequence>
      ))}

      {/* Objets qui traversent l'écran pour les transitions 'pass' */}
      {SCENES.map((s, i) => {
        const src = s.passObject ?? s.hero?.src;
        if (i === 0 || s.transition !== 'pass' || !src) return null;
        return (
          <Sequence key={`${s.id}-pass`} name={`${s.id} pass`} from={SCENE_STARTS[i] - PASS_FRAMES / 2} durationInFrames={PASS_FRAMES}>
            <PassWiper src={src} durationInFrames={PASS_FRAMES} />
          </Sequence>
        );
      })}

      <Audio src={staticFile(AUDIO.voice)} volume={AUDIO.voiceVolume} />
      {AUDIO.music && <Audio src={staticFile(AUDIO.music.src)} volume={AUDIO.music.volume} />}
      {sfx.map((c) => {
        const lib = SFX_LIBRARY[c.name];
        const from = c.peak - Math.round(lib.peak * fps);
        const trim = Math.max(0, -from);
        const length = lib.length !== undefined ? Math.round(lib.length * fps) - trim : undefined;
        if (length !== undefined && length <= 0) return null;
        return (
          <Sequence key={c.key} name={`sfx ${c.name}`} from={Math.max(0, from)} durationInFrames={length}>
            <Audio src={staticFile(lib.src)} volume={c.volume} trimBefore={trim > 0 ? trim : undefined} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

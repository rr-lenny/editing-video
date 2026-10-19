import React from 'react';
import {Html5Audio, interpolate, Sequence, staticFile} from 'remotion';
import {AUDIO, SFX, VIDEO, VOICE_TIMINGS} from '../config';
import {sec} from '../lib/anim';

const FADE = 4; // frames de fondu sur chaque SFX

/** Volume de la musique : fade-in, ducking pendant la voix, fade-out sur la dernière seconde. */
const musicVolume = (frame: number, base: number): number => {
  const t = frame / VIDEO.fps + AUDIO.voiceover.trimBefore;
  const speaking = VOICE_TIMINGS.some((v) => t >= v.start - 0.15 && t <= v.end + 0.15);
  const duck = speaking ? 0.45 : 1;
  const fadeIn = interpolate(frame, [0, VIDEO.fps], [0, 1], {extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [VIDEO.durationInFrames - VIDEO.fps, VIDEO.durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return base * duck * fadeIn * fadeOut;
};

/** Voix off (volume 1), SFX avec parcimonie, musique optionnelle. */
export const AudioLayer: React.FC = () => (
  <>
    <Html5Audio
      src={staticFile(AUDIO.voiceover.file)}
      trimBefore={sec(AUDIO.voiceover.trimBefore)}
      volume={AUDIO.voiceover.volume}
    />

    {AUDIO.music ? (
      <Html5Audio src={staticFile(AUDIO.music.file)} volume={(f) => musicVolume(f, AUDIO.music!.volume)} loop />
    ) : null}

    {SFX.map((s, i) => {
      const dur = Math.max(FADE * 2 + 1, sec(s.duration));
      return (
        <Sequence key={i} name={`SFX · ${s.role}`} from={sec(s.at)} durationInFrames={dur} layout="none">
          <Html5Audio
            src={staticFile(s.file)}
            trimBefore={sec(s.trimBefore)}
            volume={(f) =>
              s.volume *
              interpolate(f, [0, FADE, dur - FADE, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
            }
          />
        </Sequence>
      );
    })}
  </>
);

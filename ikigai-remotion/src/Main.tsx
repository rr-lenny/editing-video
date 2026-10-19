import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {SEQUENCES} from './config';
import {AudioLayer} from './components/AudioLayer';
import {PaperBackground} from './components/PaperBackground';
import {lightAt} from './lib/light';
import {SEQUENCE_COMPONENTS} from './sequences';

/** Composition principale : fond papier commun, séquences qui se chevauchent pour les transitions, audio. */
export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <PaperBackground light={lightAt(frame)} />
      {SEQUENCES.map((s) => {
        const Component = SEQUENCE_COMPONENTS[s.id];
        if (!Component) return null;
        return (
          <Sequence key={s.id} name={`${s.id} · ${s.name}`} from={s.from} durationInFrames={s.duration + s.overlap} premountFor={30}>
            <Component />
          </Sequence>
        );
      })}
      <AudioLayer />
    </AbsoluteFill>
  );
};

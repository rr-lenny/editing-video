import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {SEQUENCES} from './config';
import {AudioLayer} from './components/AudioLayer';
import {LightingOverlay} from './components/LightingOverlay';
import {PaperBackground} from './components/PaperBackground';
import {LightContext, lightAt} from './lib/light';
import {SEQUENCE_COMPONENTS} from './sequences';

/** Composition principale : fond papier, séquences qui se chevauchent, éclairage global, audio. */
export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  const light = lightAt(frame);
  return (
    <LightContext.Provider value={light}>
      <AbsoluteFill>
        <PaperBackground light={light} />
        {SEQUENCES.map((s) => {
          const Component = SEQUENCE_COMPONENTS[s.id];
          if (!Component) return null;
          return (
            <Sequence key={s.id} name={`${s.id} · ${s.name}`} from={s.from} durationInFrames={s.duration + s.overlap} premountFor={30}>
              <Component />
            </Sequence>
          );
        })}
        <LightingOverlay />
        <AudioLayer />
      </AbsoluteFill>
    </LightContext.Provider>
  );
};

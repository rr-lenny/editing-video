import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {BACKGROUND, SEQUENCES} from './config';
import {AudioLayer} from './components/AudioLayer';
import {Folio} from './components/Folio';
import {GhostWord} from './components/GhostWord';
import {LightingOverlay} from './components/LightingOverlay';
import {NewspaperLayer} from './components/NewspaperLayer';
import {PaperBackground} from './components/PaperBackground';
import {LightContext, lightAt} from './lib/light';
import {SEQUENCE_COMPONENTS} from './sequences';

/** Composition principale : fond papier + journal animé (+ typographie fantôme en option), séquences qui se chevauchent, folio, éclairage global, audio. */
export const Main: React.FC = () => {
  const frame = useCurrentFrame();
  const light = lightAt(frame);
  return (
    <LightContext.Provider value={light}>
      <AbsoluteFill>
        <PaperBackground light={light} />
        {BACKGROUND.newspaper ? <NewspaperLayer opacity={BACKGROUND.newspaperOpacity} /> : null}
        {SEQUENCES.map((s, i) =>
          BACKGROUND.ghostWords && s.ghost ? (
            <Sequence key={`ghost-${s.id}`} name={`Fantôme · ${s.ghost.text}`} from={s.from} durationInFrames={s.duration + s.overlap} layout="none">
              <GhostWord text={s.ghost.text} y={s.ghost.y} duration={s.duration} overlap={s.overlap} index={i} />
            </Sequence>
          ) : null,
        )}
        {SEQUENCES.map((s) => {
          const Component = SEQUENCE_COMPONENTS[s.id];
          if (!Component) return null;
          return (
            <Sequence key={s.id} name={`${s.id} · ${s.name}`} from={s.from} durationInFrames={s.duration + s.overlap} premountFor={30}>
              <Component />
            </Sequence>
          );
        })}
        <Folio />
        <LightingOverlay />
        <AudioLayer />
      </AbsoluteFill>
    </LightContext.Provider>
  );
};

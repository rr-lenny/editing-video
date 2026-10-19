import React from 'react';
import {AbsoluteFill, Html5Audio, staticFile} from 'remotion';
import {AUDIO, getSequence} from './config';
import {LightingOverlay} from './components/LightingOverlay';
import {PaperBackground} from './components/PaperBackground';
import {LightContext} from './lib/light';
import {SEQUENCE_COMPONENTS} from './sequences';

/** Prévisualisation isolée d'une séquence, avec le passage correspondant de la voix off. */
export const SequencePreview: React.FC<{id: string}> = ({id}) => {
  const seq = getSequence(id);
  const Component = SEQUENCE_COMPONENTS[id];
  return (
    <LightContext.Provider value={seq.light}>
      <AbsoluteFill>
        <PaperBackground light={seq.light} />
        {Component ? <Component /> : null}
        <LightingOverlay sweeps={false} />
        <Html5Audio src={staticFile(AUDIO.voiceover.file)} trimBefore={seq.from} volume={AUDIO.voiceover.volume} />
      </AbsoluteFill>
    </LightContext.Provider>
  );
};

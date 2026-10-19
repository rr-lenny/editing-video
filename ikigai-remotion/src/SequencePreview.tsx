import React from 'react';
import {AbsoluteFill, Html5Audio, staticFile} from 'remotion';
import {AUDIO, getSequence, SEQUENCES} from './config';
import {GhostWord} from './components/GhostWord';
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
        {seq.ghost ? (
          <GhostWord text={seq.ghost.text} y={seq.ghost.y} duration={seq.duration} overlap={seq.overlap} index={SEQUENCES.indexOf(seq)} />
        ) : null}
        {Component ? <Component /> : null}
        <LightingOverlay sweeps={false} />
        <Html5Audio src={staticFile(AUDIO.voiceover.file)} trimBefore={seq.from} volume={AUDIO.voiceover.volume} />
      </AbsoluteFill>
    </LightContext.Provider>
  );
};

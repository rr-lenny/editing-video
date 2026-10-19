import React from 'react';
import {Composition, Folder} from 'remotion';
import {SEQUENCES, VIDEO} from './config';
import {Main} from './Main';
import {SequencePreview} from './SequencePreview';
import {SEQUENCE_COMPONENTS} from './sequences';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Main"
      component={Main}
      durationInFrames={VIDEO.durationInFrames}
      fps={VIDEO.fps}
      width={VIDEO.width}
      height={VIDEO.height}
    />
    <Folder name="Sequences">
      {SEQUENCES.filter((s) => SEQUENCE_COMPONENTS[s.id]).map((s) => (
        <Composition
          key={s.id}
          id={`Seq${s.id.slice(1)}`}
          component={SequencePreview}
          defaultProps={{id: s.id}}
          durationInFrames={s.duration + s.overlap}
          fps={VIDEO.fps}
          width={VIDEO.width}
          height={VIDEO.height}
        />
      ))}
    </Folder>
  </>
);

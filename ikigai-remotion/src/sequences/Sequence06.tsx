import React from 'react';
import {getSequence} from '../config';
import {BWImage} from '../components/BWImage';
import {DashedCircle} from '../components/DashedCircle';
import {DotGrid} from '../components/DotGrid';
import {Spotlight} from '../components/LightingOverlay';
import {SceneShell} from '../components/SceneShell';

const SEQ = getSequence('S06');

/** S06 : pilier 1 « Ce que tu aimes faire » · cœur entier au centre (suite du zoom de S05). */
export const Sequence06: React.FC = () => {
  const img = SEQ.images!.coeur;
  return (
    <SceneShell
      seq={SEQ}
      lighting={<Spotlight x={img.x} y={img.y} r={520} start={4} exitAt={SEQ.duration} exitDur={SEQ.overlap} />}
      pushOrigin={[img.x, img.y]}
      decor={
        <>
          <DotGrid cx={img.x} cy={img.y} radius={380} start={0} />
          <DashedCircle cx={img.x} cy={img.y} r={340} start={0} drawDur={40} spin={0.09} />
        </>
      }
    >
      <BWImage
        {...img}
        enterDur={18}
        enterFrom={{scale: 0.82, blur: 6, opacity: 0, dy: 0}}
        exitAt={SEQ.duration}
        exitDur={SEQ.overlap}
        exitTo={{dx: -420, rotate: -6, blur: 10, opacity: 0, scale: 0.96}}
      />
    </SceneShell>
  );
};

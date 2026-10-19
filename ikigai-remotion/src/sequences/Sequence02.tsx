import React from 'react';
import {getSequence} from '../config';
import {BWImage} from '../components/BWImage';
import {DashedCircle} from '../components/DashedCircle';
import {SceneShell} from '../components/SceneShell';
import {SweepingArc} from '../components/SweepingArc';

const SEQ = getSequence('S02');

/** S02 : « qui va changer ta perception du bonheur » · cœur en gros plan, coupé en bas à gauche. */
export const Sequence02: React.FC = () => {
  const img = SEQ.images!.coeur;
  return (
    <SceneShell
      seq={SEQ}
      pushOrigin={[img.x, img.y]}
      decorExit="maskUp"
      decor={
        <>
          <DashedCircle cx={img.x + 20} cy={img.y - 40} r={420} start={6} drawDur={46} spin={-0.06} opacity={0.36} />
          <SweepingArc cx={1180} cy={560} r={640} from={110} to={190} start={4} drawDur={50} opacity={0.24} />
        </>
      }
    >
      <BWImage
        {...img}
        enterDur={28}
        enterFrom={{dx: -140, dy: 60, rotate: -4, scale: 0.94, blur: 8, opacity: 0}}
        exitAt={SEQ.duration}
        exitDur={SEQ.overlap}
        exitTo={{dx: -60, dy: 30, scale: 0.96, blur: 8, opacity: 0}}
      />
    </SceneShell>
  );
};

import React from 'react';
import {getSequence} from '../config';
import {BWImage} from '../components/BWImage';
import {DashedCircle} from '../components/DashedCircle';
import {SceneShell} from '../components/SceneShell';
import {SweepingArc} from '../components/SweepingArc';

const SEQ = getSequence('S08');

/** S08 : pilier 3 « Ce dont le monde a besoin » · les mains montent et portent la scène. */
export const Sequence08: React.FC = () => {
  const img = SEQ.images!.mains;
  return (
    <SceneShell
      seq={SEQ}
      pushOrigin={[img.x, img.y]}
      decor={
        <>
          <DashedCircle cx={img.x} cy={img.y - 20} r={250} start={6} drawDur={36} spin={0.08} opacity={0.38} />
          <SweepingArc cx={img.x} cy={img.y + 400} r={760} from={200} to={340} start={0} drawDur={50} opacity={0.22} />
        </>
      }
    >
      <BWImage
        {...img}
        enterDur={22}
        enterFrom={{dy: 140, scale: 0.95, blur: 8, opacity: 0}}
        exitAt={SEQ.duration}
        exitDur={SEQ.overlap}
        exitTo={{dy: 60, blur: 8, opacity: 0}}
        float={5}
      />
    </SceneShell>
  );
};

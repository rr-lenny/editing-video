import React from 'react';
import {getSequence} from '../config';
import {BWImage} from '../components/BWImage';
import {DashedCircle} from '../components/DashedCircle';
import {DotGrid} from '../components/DotGrid';
import {SceneShell} from '../components/SceneShell';
import {SweepingArc} from '../components/SweepingArc';

const SEQ = getSequence('S12');

/** S12 : « et de pouvoir pleinement t'épanouir dans tes projets créatifs » · Macintosh en gros plan coupé en bas à droite, parallaxe. */
export const Sequence12: React.FC = () => {
  const img = SEQ.images!.macintosh;
  return (
    <SceneShell
      seq={SEQ}
      push={1.045}
      pushOrigin={[img.x, img.y]}
      decor={
        <>
          <DotGrid cx={img.x - 60} cy={img.y - 80} radius={520} start={10} />
          <DashedCircle cx={img.x - 40} cy={img.y - 120} r={500} start={14} drawDur={60} spin={-0.05} opacity={0.32} />
          <SweepingArc cx={-200} cy={600} r={700} from={-40} to={40} start={0} drawDur={60} opacity={0.22} />
        </>
      }
    >
      <BWImage
        {...img}
        enterDur={32}
        enterFrom={{dx: 120, dy: 180, rotate: 3, scale: 0.95, blur: 8, opacity: 0}}
        exitAt={SEQ.duration}
        exitDur={SEQ.overlap}
        exitTo={{dy: 220, blur: 8, opacity: 0}}
        float={7}
      />
    </SceneShell>
  );
};

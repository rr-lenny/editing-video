import React from 'react';
import {getSequence} from '../config';
import {BWImage} from '../components/BWImage';
import {DotGrid} from '../components/DotGrid';
import {SceneShell} from '../components/SceneShell';
import {SweepingArc} from '../components/SweepingArc';

const SEQ = getSequence('S07');

/** S07 : pilier 2 « Ce en quoi tu es doué » · cerveau en gros plan, glisse depuis la droite. */
export const Sequence07: React.FC = () => {
  const img = SEQ.images!.cerveau;
  return (
    <SceneShell
      seq={SEQ}
      pushOrigin={[img.x, img.y]}
      decorExit="maskUp"
      decor={
        <>
          <DotGrid cx={img.x - 80} cy={img.y} radius={460} start={2} />
          <SweepingArc cx={img.x} cy={img.y} r={560} from={150} to={260} start={0} drawDur={44} opacity={0.26} />
        </>
      }
    >
      <BWImage
        {...img}
        enterDur={22}
        enterFrom={{dx: 260, rotate: 4, scale: 0.96, blur: 8, opacity: 0}}
        exitAt={SEQ.duration}
        exitDur={SEQ.overlap}
        exitTo={{dy: -50, blur: 8, opacity: 0, scale: 0.97}}
        sway={2}
      />
    </SceneShell>
  );
};

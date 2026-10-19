import React from 'react';
import {getSequence} from '../config';
import {BWImage} from '../components/BWImage';
import {DotGrid} from '../components/DotGrid';
import {SceneShell} from '../components/SceneShell';
import {SweepingArc} from '../components/SweepingArc';

const SEQ = getSequence('S09');

/** S09 : pilier 4 « Et enfin, ce pour quoi tu es payé » · cadrage en double : liasse en gros plan + billet seul en contrepoint. */
export const Sequence09: React.FC = () => {
  const {liasse, billet} = SEQ.images!;
  const exitAt = SEQ.duration;
  const exitDur = SEQ.overlap;
  return (
    <SceneShell
      seq={SEQ}
      pushOrigin={[520, 1200]}
      decor={
        <>
          <DotGrid cx={liasse.x + 80} cy={liasse.y - 60} radius={460} start={6} />
          <SweepingArc cx={billet.x} cy={billet.y} r={330} from={120} to={260} start={14} drawDur={50} opacity={0.24} />
        </>
      }
    >
      <BWImage
        {...liasse}
        enterAt={4}
        enterDur={30}
        enterFrom={{dx: -180, dy: 90, rotate: -4, scale: 0.95, blur: 8, opacity: 0}}
        exitAt={exitAt}
        exitDur={exitDur}
        exitTo={{dx: -160, dy: 80, blur: 8, opacity: 0}}
        phase={0.5}
      />
      <BWImage
        {...billet}
        enterAt={10}
        enterDur={30}
        enterFrom={{dx: 160, dy: -50, rotate: 6, scale: 0.94, blur: 8, opacity: 0}}
        exitAt={exitAt}
        exitDur={exitDur}
        exitTo={{dx: 160, dy: -60, blur: 8, opacity: 0}}
        phase={2.1}
        shadow={0.9}
      />
    </SceneShell>
  );
};

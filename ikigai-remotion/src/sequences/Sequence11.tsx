import React from 'react';
import {getSequence} from '../config';
import {BWImage} from '../components/BWImage';
import {DotGrid} from '../components/DotGrid';
import {SceneShell} from '../components/SceneShell';
import {SweepingArc} from '../components/SweepingArc';

const SEQ = getSequence('S11');

/** S11 : « remettre du sens à ta vie » · ampoule suspendue en haut à gauche, arc épais flouté au premier plan. */
export const Sequence11: React.FC = () => {
  const img = SEQ.images!.ampoule;
  return (
    <SceneShell
      seq={SEQ}
      pushOrigin={[510, 900]}
      exit="slideLeft"
      decor={
        <>
          <DotGrid cx={510} cy={960} radius={520} start={4} opacity={0.18} />
          <SweepingArc cx={510} cy={960} r={470} from={-20} to={110} start={4} drawDur={44} opacity={0.26} />
          <SweepingArc cx={1240} cy={1560} r={640} from={180} to={250} start={0} drawDur={40} width={70} opacity={0.06} blur={22} />
        </>
      }
    >
      <BWImage
        {...img}
        enterDur={22}
        enterFrom={{dy: -60, blur: 8, opacity: 0, scale: 0.95}}
        float={5}
        sway={2.5}
      />
    </SceneShell>
  );
};

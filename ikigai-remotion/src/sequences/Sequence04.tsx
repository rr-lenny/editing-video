import React from 'react';
import {getSequence} from '../config';
import {DashedCircle} from '../components/DashedCircle';
import {Spotlight} from '../components/LightingOverlay';
import {SceneShell} from '../components/SceneShell';
import {SweepingArc} from '../components/SweepingArc';

const SEQ = getSequence('S04');

/** S04 : « Ce principe, c'est l'IKIGAI » · scène purement typographique, cercle qui annonce le diagramme. */
export const Sequence04: React.FC = () => (
  <SceneShell
    seq={SEQ}
    lighting={<Spotlight x={510} y={930} r={560} start={34} exitAt={SEQ.duration} exitDur={SEQ.overlap} strength={0.2} />}
    push={1.04}
    pushOrigin={[510, 900]}
    exit="slideLeft"
    decor={
      <>
        <DashedCircle cx={510} cy={930} r={430} start={20} drawDur={60} spin={0.06} opacity={0.4} />
        <SweepingArc cx={510} cy={930} r={520} from={-160} to={-30} start={30} drawDur={60} opacity={0.24} />
        <SweepingArc cx={510} cy={930} r={520} from={20} to={150} start={36} drawDur={60} opacity={0.2} />
        <SweepingArc cx={1180} cy={1700} r={700} from={190} to={260} start={0} drawDur={50} width={60} opacity={0.06} blur={20} />
      </>
    }
  />
);

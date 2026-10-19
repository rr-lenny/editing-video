import React from 'react';
import {getSequence} from '../config';
import {DashedCircle} from '../components/DashedCircle';
import {SceneShell} from '../components/SceneShell';
import {SweepingArc} from '../components/SweepingArc';

const SEQ = getSequence('S13');

/** S13 : CTA « N'hésite pas à enregistrer cette vidéo pour ne pas l'oublier » · composition typographique sur le papier. */
export const Sequence13: React.FC = () => (
  <SceneShell
    seq={SEQ}
    push={1.03}
    pushOrigin={[510, 900]}
    exit="fade"
    decor={
      <>
        <DashedCircle cx={510} cy={890} r={440} start={14} drawDur={60} spin={0.05} opacity={0.36} />
        <SweepingArc cx={510} cy={890} r={530} from={150} to={260} start={24} drawDur={60} opacity={0.22} />
        <SweepingArc cx={-160} cy={260} r={640} from={10} to={80} start={0} drawDur={50} width={60} opacity={0.06} blur={20} />
      </>
    }
  />
);

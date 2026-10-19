import React from 'react';
import {AbsoluteFill} from 'remotion';
import {getSequence} from '../config';
import {BWImage} from '../components/BWImage';
import {DashedCircle} from '../components/DashedCircle';
import {DotGrid} from '../components/DotGrid';
import {PushIn, SoftTransition} from '../components/SoftTransition';
import {SweepingArc} from '../components/SweepingArc';
import {TypeComposition} from '../components/TypeComposition';

const SEQ = getSequence('S01');

/**
 * S01 · HOOK : « J'ai découvert une philosophie japonaise »
 * Le titre et l'ampoule sont à l'écran avant 0,8 s. L'ampoule démarre déjà
 * à demi visible : c'est l'état exact sur lequel S14 se termine (boucle).
 */
export const Sequence01: React.FC = () => {
  const img = SEQ.images!.ampoule;
  const exitAt = SEQ.duration;
  const exitDur = SEQ.overlap;

  return (
    <AbsoluteFill>
      <PushIn dur={SEQ.duration + SEQ.overlap} to={1.035} origin={[img.x, img.y - 200]}>
        {/* décor : grille de points, cercle en pointillés, arcs fins */}
        <SoftTransition exit="fade" exitAt={exitAt} exitDur={exitDur}>
          <DotGrid cx={img.x} cy={img.y} radius={390} start={4} dur={26} />
          <DashedCircle cx={img.x} cy={img.y} r={300} start={2} drawDur={52} spin={0.07} />
          <SweepingArc cx={img.x} cy={img.y} r={560} from={198} to={312} start={8} drawDur={70} opacity={0.26} />
          <SweepingArc cx={1320} cy={1500} r={760} from={150} to={232} start={18} drawDur={64} width={1.2} opacity={0.22} />
          {/* arc épais très flouté au premier plan */}
          <SweepingArc cx={-140} cy={2020} r={720} from={268} to={352} start={0} drawDur={56} width={64} opacity={0.06} blur={20} />
        </SoftTransition>

        <BWImage
          {...img}
          enterAt={0}
          enterDur={12}
          enterFrom={{opacity: 0.5, blur: 4, scale: 0.97, dy: 24}}
          exitAt={exitAt}
          exitDur={exitDur}
          exitTo={{dx: -90, dy: 10, scale: 0.88, rotate: -6, blur: 8, opacity: 0}}
          float={6}
          sway={1.6}
        />

        <TypeComposition spec={SEQ.type!} seqFrom={SEQ.from} exitAt={exitAt - 7} exitDur={8} />
      </PushIn>
    </AbsoluteFill>
  );
};

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {getSequence} from '../config';
import {BWImage} from '../components/BWImage';
import {DashedCircle} from '../components/DashedCircle';
import {DotGrid} from '../components/DotGrid';
import {SoftTransition} from '../components/SoftTransition';
import {SweepingArc} from '../components/SweepingArc';
import {TypeComposition} from '../components/TypeComposition';

const SEQ = getSequence('S14');

/**
 * S14 : fin et boucle. « et je te dis à très vite pour de nouvelles inspirations »
 * L'ampoule revient exactement à la place de S01. Sur la dernière demi-seconde, le texte
 * et le décor s'effacent et l'ampoule rejoint l'état de la frame 0 de S01 :
 * la vidéo repart en boucle sans coupure.
 */
const LOOP_FRAMES = 14;
const FLOAT_PERIOD = 130;

export const Sequence14: React.FC = () => {
  const img = SEQ.images!.ampoule;
  const end = SEQ.duration;
  const outAt = end - LOOP_FRAMES;
  // phase choisie pour que le flottement vaille 0 à la dernière frame, comme à la frame 0 de S01
  const phase = (-end / FLOAT_PERIOD) * Math.PI * 2;

  return (
    <AbsoluteFill>
      <SoftTransition exit="fade" exitAt={outAt} exitDur={LOOP_FRAMES}>
        <DotGrid cx={img.x} cy={img.y} radius={390} start={8} />
        <DashedCircle cx={img.x} cy={img.y} r={300} start={10} drawDur={50} spin={0.07} />
        <SweepingArc cx={img.x} cy={img.y} r={560} from={198} to={312} start={16} drawDur={60} opacity={0.24} />
      </SoftTransition>
      <BWImage
        {...img}
        enterDur={24}
        enterFrom={{dy: 60, scale: 0.94, blur: 8, opacity: 0}}
        exitAt={outAt}
        exitDur={LOOP_FRAMES}
        exitTo={{dy: 24, scale: 0.97, blur: 4, opacity: 0.5}}
        float={6}
        phase={phase}
        sway={1.6}
      />
      <TypeComposition spec={SEQ.type!} seqFrom={SEQ.from} exitAt={end - 16} exitDur={9} />
    </AbsoluteFill>
  );
};

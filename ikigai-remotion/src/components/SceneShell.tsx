import React from 'react';
import {AbsoluteFill} from 'remotion';
import {SequenceSpec} from '../config';
import {PushIn, SoftTransition, TransitionKind} from './SoftTransition';
import {TypeComposition} from './TypeComposition';

interface Props {
  seq: SequenceSpec;
  /** push-in de la scène (1 → push) */
  push?: number;
  pushOrigin?: [number, number];
  /** décor (grille de points, cercles, arcs) : sort avec `decorExit` */
  decor?: React.ReactNode;
  decorExit?: TransitionKind;
  /** PNG et éléments propres à la scène */
  children?: React.ReactNode;
  /** enveloppe de sortie de toute la scène (en plus des sorties propres à chaque élément) */
  exit?: TransitionKind;
  exitOrigin?: [number, number];
}

/** Cadre commun d'une séquence : push-in, décor, PNG, composition typographique, sorties. */
export const SceneShell: React.FC<Props> = ({seq, push = 1.035, pushOrigin, decor, decorExit = 'fade', children, exit = 'none', exitOrigin}) => {
  const exitAt = seq.duration;
  const exitDur = Math.max(12, seq.overlap);
  const body = (
    <>
      {decor ? (
        <SoftTransition exit={decorExit} exitAt={exitAt} exitDur={exitDur}>
          {decor}
        </SoftTransition>
      ) : null}
      {children}
      {seq.type ? <TypeComposition spec={seq.type} seqFrom={seq.from} exitAt={exitAt} exitDur={exitDur} /> : null}
    </>
  );

  return (
    <AbsoluteFill>
      <SoftTransition exit={exit} exitAt={exitAt} exitDur={exitDur} origin={exitOrigin}>
        {push > 1 ? (
          <PushIn dur={seq.duration + seq.overlap} to={push} origin={pushOrigin}>
            {body}
          </PushIn>
        ) : (
          body
        )}
      </SoftTransition>
    </AbsoluteFill>
  );
};

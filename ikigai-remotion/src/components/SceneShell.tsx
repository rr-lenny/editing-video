import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {SequenceSpec} from '../config';
import {drift, EASE_DYN, mix, ramp} from '../lib/anim';
import {PushIn, SoftTransition, TransitionKind} from './SoftTransition';
import {TypeComposition} from './TypeComposition';

interface Props {
  seq: SequenceSpec;
  /** push-in de la scène (1 → push) */
  push?: number;
  pushOrigin?: [number, number];
  /** amplitude de la caméra (dérive en px, rotation en °) ; 0 = caméra fixe */
  camera?: number;
  /** décor (grille de points, cercles, arcs) : sort avec `decorExit` */
  decor?: React.ReactNode;
  decorExit?: TransitionKind;
  /** éclairage propre à la scène (projecteur…), posé au-dessus des PNG, sous le texte */
  lighting?: React.ReactNode;
  /** PNG et éléments propres à la scène */
  children?: React.ReactNode;
  /** enveloppe de sortie de toute la scène (en plus des sorties propres à chaque élément) */
  exit?: TransitionKind;
  exitOrigin?: [number, number];
}

/**
 * Cadre commun d'une séquence.
 * Caméra vivante : push-in, dérive lente et légère rotation, avec un petit « élan »
 * à l'entrée de scène. Parallaxe sur 3 plans : décor (lent), PNG, texte (plus rapide).
 */
export const SceneShell: React.FC<Props> = ({
  seq,
  push = 1.05,
  pushOrigin,
  camera = 1,
  decor,
  decorExit = 'fade',
  lighting,
  children,
  exit = 'none',
  exitOrigin,
}) => {
  const frame = useCurrentFrame();
  const exitAt = seq.duration;
  const exitDur = Math.max(12, seq.overlap);
  // le texte sort un peu plus tôt et plus vite que l'image : il ne croise jamais celui de la scène suivante
  const textExitAt = exitAt - 7;
  const textExitDur = 8;

  // dérive de caméra, différente à chaque scène (phase tirée de la position dans la vidéo)
  const ph = seq.from * 0.37;
  const settle = 1 - ramp(frame, 0, 26, EASE_DYN); // élan d'entrée qui se pose
  const sideSign = Math.round(seq.from / 7) % 2 === 0 ? 1 : -1;
  const camX = camera * (drift(frame, 10, 240, ph) + settle * 36 * sideSign);
  const camY = camera * (drift(frame, 7, 300, ph + 1.7) + settle * 18);
  const camR = camera * (drift(frame, 0.45, 360, ph + 0.6) + settle * 0.8 * sideSign);

  const layer = (depth: number, node: React.ReactNode) => (
    <AbsoluteFill style={{transform: `translate(${camX * depth}px, ${camY * depth}px) rotate(${camR * mix(0.6, 1, depth / 1.3)}deg)`}}>
      {node}
    </AbsoluteFill>
  );

  const body = (
    <>
      {decor ? layer(0.5, <SoftTransition exit={decorExit} exitAt={exitAt} exitDur={exitDur}>{decor}</SoftTransition>) : null}
      {children ? layer(1, children) : null}
      {lighting}
      {seq.type ? layer(1.3, <TypeComposition spec={seq.type} seqFrom={seq.from} exitAt={textExitAt} exitDur={textExitDur} />) : null}
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

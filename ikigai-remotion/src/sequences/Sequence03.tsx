import React from 'react';
import {getSequence} from '../config';
import {BWImage} from '../components/BWImage';
import {DotGrid} from '../components/DotGrid';
import {SceneShell} from '../components/SceneShell';
import {SweepingArc} from '../components/SweepingArc';

const SEQ = getSequence('S03');

/** S03 : « si tu as la volonté de vivre de ta création » · Macintosh entier, monte depuis le bas. */
export const Sequence03: React.FC = () => {
  const img = SEQ.images!.macintosh;
  return (
    <SceneShell
      seq={SEQ}
      push={1.03}
      pushOrigin={[img.x, img.y - 120]}
      decor={
        <>
          <DotGrid cx={img.x} cy={img.y} radius={420} start={6} />
          <SweepingArc cx={img.x} cy={img.y} r={470} from={200} to={330} start={10} drawDur={56} opacity={0.26} />
        </>
      }
    >
      {/* sortie : zoom lent à travers l'écran du Mac */}
      <BWImage
        {...img}
        enterDur={26}
        enterFrom={{dy: 90, scale: 0.94, blur: 8, opacity: 0}}
        exitAt={SEQ.duration}
        exitDur={SEQ.overlap}
        exitTo={{dy: -60, scale: 1.35, blur: 10, opacity: 0}}
      />
    </SceneShell>
  );
};

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {getSequence} from '../config';
import {BWImage} from '../components/BWImage';
import {DotGrid} from '../components/DotGrid';
import {MicroCaption} from '../components/MicroCaption';
import {SceneShell} from '../components/SceneShell';

const SEQ = getSequence('S05');
const ORDER = ['coeur', 'cerveau', 'mains', 'billet'] as const;

/** S05 : « Elle repose sur 4 piliers fondamentaux » · grille 2×2 qui annonce les 4 piliers, sortie par zoom dans le cœur. */
export const Sequence05: React.FC = () => {
  const imgs = SEQ.images!;
  const exitAt = SEQ.duration;
  const exitDur = SEQ.overlap;
  const heart = imgs.coeur;
  return (
    <SceneShell seq={SEQ} push={1.025} pushOrigin={[520, 1230]} decor={<DotGrid cx={520} cy={1230} radius={480} start={8} spacing={30} />}>
      {ORDER.map((k, i) => {
        const img = imgs[k];
        const isHeart = k === 'coeur';
        return (
          <BWImage
            key={k}
            {...img}
            enterAt={10 + i * 6}
            enterDur={22}
            enterFrom={{dy: 40, scale: 0.94, blur: 8, opacity: 0}}
            exitAt={exitAt}
            exitDur={exitDur}
            exitTo={isHeart ? {dx: 520 - heart.x, dy: 1190 - heart.y, scale: 2.3, blur: 4, opacity: 0} : {scale: 0.92, blur: 8, opacity: 0, dy: 20}}
            float={4}
            phase={i * 1.3}
            shadow={0.8}
            zIndex={isHeart ? 2 : 1}
          />
        );
      })}
      <AbsoluteFill>
        {ORDER.map((k, i) => (
          <div key={k} style={{position: 'absolute', left: imgs[k].x - 140, top: imgs[k].y - 120}}>
            <MicroCaption text={`0${i + 1}`} start={22 + i * 6} size={22} exitAt={exitAt} exitDur={12} />
          </div>
        ))}
      </AbsoluteFill>
    </SceneShell>
  );
};

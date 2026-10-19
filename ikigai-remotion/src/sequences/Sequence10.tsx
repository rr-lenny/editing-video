import React from 'react';
import {getSequence} from '../config';
import {BWImage} from '../components/BWImage';
import {DashedCircle} from '../components/DashedCircle';
import {Spotlight} from '../components/LightingOverlay';
import {SceneShell} from '../components/SceneShell';
import {SweepingArc} from '../components/SweepingArc';

const SEQ = getSequence('S10');

/** S10 : « Cet équilibre permet de trouver ta direction » · ballon au centre, 4 cercles fins qui se croisent (diagramme de l'Ikigai). */
export const Sequence10: React.FC = () => {
  const img = SEQ.images!.ball;
  const d = 120;
  const centers: [number, number][] = [
    [img.x - d, img.y - d],
    [img.x + d, img.y - d],
    [img.x + d, img.y + d],
    [img.x - d, img.y + d],
  ];
  return (
    <SceneShell
      seq={SEQ}
      lighting={<Spotlight x={img.x} y={img.y - 120} r={620} start={30} exitAt={SEQ.duration} exitDur={SEQ.overlap} />}
      push={1.04}
      pushOrigin={[img.x, img.y]}
      decor={
        <>
          {centers.map(([cx, cy], i) => (
            <SweepingArc key={i} cx={cx} cy={cy} r={230} from={-90 + i * 90} to={269 + i * 90} start={6 + i * 6} drawDur={48} opacity={0.26} spin={0.04} />
          ))}
          <DashedCircle cx={img.x} cy={img.y} r={420} start={18} drawDur={50} spin={0.06} opacity={0.34} />
        </>
      }
    >
      {/* sortie : zoom lent à travers le ballon */}
      <BWImage
        {...img}
        enterDur={24}
        enterFrom={{dy: 50, scale: 0.92, blur: 8, opacity: 0, rotate: -6}}
        exitAt={SEQ.duration}
        exitDur={SEQ.overlap}
        exitTo={{scale: 1.4, blur: 12, opacity: 0}}
        sway={3}
      />
    </SceneShell>
  );
};

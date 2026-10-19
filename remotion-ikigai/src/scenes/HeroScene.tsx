import React from 'react';
import { FloatingObject } from '../components/FloatingObject';
import { Layer } from '../components/Camera';
import { GridBackground } from '../components/GridBackground';
import { MagazineDeco } from '../components/MagazineDeco';
import { ParticleRain } from '../components/ParticleRain';
import { SweepingArc } from '../components/SweepingArc';
import { TextBlock } from '../components/TextBlock';
import type { SceneProps } from './types';

/**
 * Gabarit principal : fond grille (couche lente) → arcs → objet héros (couche moyenne) → texte
 * → particules et éléments flous de premier plan (couche rapide, partiellement hors champ).
 */
export const HeroScene: React.FC<SceneProps> = ({ scene, index, total, sceneStart }) => {
  const sharpExtras = (scene.extras ?? []).filter((e) => !e.blur);
  const blurredExtras = (scene.extras ?? []).filter((e) => e.blur);
  const thinArcs = (scene.arcs ?? []).filter((a) => !a.blur);
  const thickArcs = (scene.arcs ?? []).filter((a) => a.blur);

  return (
    <>
      <GridBackground />
      <Layer depth={0.55}>
        {thinArcs.map((a, i) => (
          <SweepingArc key={i} {...a} />
        ))}
      </Layer>
      <Layer depth={0.8}>
        <MagazineDeco deco={scene.deco ?? {}} index={index} total={total} textAnchor={scene.text.anchor} />
      </Layer>
      <Layer depth={1}>
        {scene.hero && <FloatingObject cfg={scene.hero} sceneStart={sceneStart} seed={index + 1} />}
        {sharpExtras.map((e, i) => (
          <FloatingObject key={i} cfg={e} sceneStart={sceneStart} seed={index + 10 + i} />
        ))}
      </Layer>
      {scene.particles && (
        <Layer depth={1.3}>
          <ParticleRain {...scene.particles} layer="back" />
        </Layer>
      )}
      <Layer depth={1.08}>
        <TextBlock text={scene.text} sceneStart={sceneStart} seed={index * 31} />
      </Layer>
      {scene.particles && (
        <Layer depth={1.6}>
          <ParticleRain {...scene.particles} layer="front" />
        </Layer>
      )}
      <Layer depth={1.9}>
        {blurredExtras.map((e, i) => (
          <FloatingObject key={i} cfg={e} sceneStart={sceneStart} seed={index + 20 + i} />
        ))}
        {thickArcs.map((a, i) => (
          <SweepingArc key={i} {...a} />
        ))}
      </Layer>
    </>
  );
};

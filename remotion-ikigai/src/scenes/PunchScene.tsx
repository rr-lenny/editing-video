import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Layer } from '../components/Camera';
import { DashedCircle } from '../components/DashedCircle';
import { GridBackground } from '../components/GridBackground';
import { MagazineDeco } from '../components/MagazineDeco';
import { ParticleRain } from '../components/ParticleRain';
import { SweepingArc } from '../components/SweepingArc';
import { TextBlock } from '../components/TextBlock';
import { FONTS, THEME } from '../config';
import { easeIn, ramp } from '../lib/motion';
import { localFrame } from '../lib/timing';
import type { SceneProps } from './types';

/** Scène « punch » sur couleur pleine : le moment de bascule du script (révélation du mot-clé). */
export const PunchScene: React.FC<SceneProps> = ({ scene, index, total, sceneStart }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const kw = localFrame(scene.text.keywordAt, sceneStart);
  const kanjiP = ramp(frame, kw - 4, 20, easeIn);
  const thinArcs = (scene.arcs ?? []).filter((a) => !a.blur);
  const thickArcs = (scene.arcs ?? []).filter((a) => a.blur);

  return (
    <>
      <GridBackground variant="accent" />
      {/* Kanji géant en filigrane qui glisse lentement */}
      <Layer depth={0.45}>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: (height - 1520) / 2 + (1 - kanjiP) * 160 - frame * 1.2,
            transform: 'translateX(-50%)',
            writingMode: 'vertical-rl',
            fontFamily: `${FONTS.kanji.family}, serif`,
            fontWeight: 700,
            fontSize: 380,
            lineHeight: 1,
            color: 'rgba(255,255,255,0.13)',
            opacity: kanjiP,
          }}
        >
          生き甲斐
        </div>
      </Layer>
      <Layer depth={0.6}>
        {thinArcs.map((a, i) => (
          <SweepingArc key={i} {...a} />
        ))}
        <DashedCircle cx={width / 2} cy={height / 2 + 40} r={430} color={THEME.white} strokeWidth={5} delay={kw + 6} drawDuration={24} opacity={0.8} />
      </Layer>
      <Layer depth={0.8}>
        <MagazineDeco deco={scene.deco ?? {}} index={index} total={total} light textAnchor={scene.text.anchor} />
      </Layer>
      {scene.particles && (
        <Layer depth={1.3}>
          <ParticleRain {...scene.particles} layer="back" />
        </Layer>
      )}
      <Layer depth={1.1}>
        <TextBlock
          text={scene.text}
          sceneStart={sceneStart}
          kickerColor="rgba(255,255,255,0.78)"
          keywordColor={THEME.white}
          captionColor="rgba(255,255,255,0.8)"
          seed={index * 31}
        />
      </Layer>
      {scene.particles && (
        <Layer depth={1.6}>
          <ParticleRain {...scene.particles} layer="front" />
        </Layer>
      )}
      <Layer depth={1.9}>
        {thickArcs.map((a, i) => (
          <SweepingArc key={i} {...a} />
        ))}
      </Layer>
    </>
  );
};

import React from 'react';
import { Composition } from 'remotion';
import { TOTAL_FRAMES, VIDEO } from './config';
import { Video } from './Video';

export const RemotionRoot: React.FC = () => (
  <Composition id={VIDEO.id} component={Video} durationInFrames={TOTAL_FRAMES} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
);

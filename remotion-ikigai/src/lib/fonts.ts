import { loadFont } from '@remotion/fonts';
import { staticFile } from 'remotion';
import { FONTS } from '../config';

// Les polices Google sont chargées dans config.ts (@remotion/google-fonts).
// Seul le sous-ensemble kanji (生き甲斐) est servi localement.
loadFont({ family: FONTS.kanji.family, url: staticFile(FONTS.kanji.url), weight: FONTS.kanji.weight }).catch(() => {
  // Police absente : le navigateur retombe sur une police serif système, le rendu continue.
});

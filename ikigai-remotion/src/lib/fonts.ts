import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

/**
 * Deux familles uniquement : Inter (500–600, 800 pour les titres « encre ») et EB Garamond italique (400–500).
 * Fichiers Google Fonts (licence OFL) embarqués dans /public/fonts : le rendu
 * ne dépend pas du réseau et donne le même résultat sur toutes les machines.
 */
const SANS = 'Inter Ikigai';
const SERIF = 'EB Garamond Ikigai';

loadFont({family: SANS, url: staticFile('fonts/Inter-Variable.ttf'), weight: '500 900', style: 'normal'});
loadFont({family: SERIF, url: staticFile('fonts/EBGaramond-Italic-Variable.ttf'), weight: '400 500', style: 'italic'});

export const FONTS = {
  sans: `"${SANS}", sans-serif`,
  serif: `"${SERIF}", serif`,
} as const;

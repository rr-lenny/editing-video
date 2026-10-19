import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {THEME, VIDEO} from '../config';
import {rgba} from '../lib/anim';
import {FONTS} from '../lib/fonts';
import {useLight} from '../lib/light';

const W = VIDEO.width;
const H = VIDEO.height;
const MARGIN = 44;
const GUTTER = 34;
const COL_W = (W - 2 * MARGIN - 2 * GUTTER) / 3;
/** hauteur d'un bloc d'article, répété en boucle dans chaque colonne */
const BLOCK = 520;
const TOP = 230; // sous l'en-tête

interface Article {
  kicker: string;
  head: string;
  body: string;
  halftone?: boolean;
}

/** Contenu des colonnes : texte de mise en page, lié au thème de la vidéo. */
const COLUMNS: Article[] = [
  {
    kicker: 'Philosophie',
    head: "La raison d'être",
    body:
      "À Okinawa, on appelle ikigai ce qui fait se lever le matin. Ni simple passion, ni simple métier : un point d'équilibre entre ce que l'on aime, ce que l'on sait faire, ce dont le monde a besoin et ce pour quoi l'on est payé. Les créateurs qui le trouvent parlent d'un travail qui ressemble enfin à leur vie. Chaque projet devient une façon de dire qui l'on est, et chaque jour une occasion d'avancer dans la bonne direction, sans se presser.",
  },
  {
    kicker: 'Création',
    head: 'Créer avec sens',
    halftone: true,
    body:
      "Vivre de sa création ne commence pas par un plan, mais par une question simple : qu'est-ce que je ferais même sans être regardé ? La réponse dessine la passion. Le talent se mesure ensuite, dans la répétition, la patience et le geste qui s'affine.",
  },
  {
    kicker: 'Équilibre',
    head: 'Quatre cercles',
    body:
      "Aimer. Exceller. Servir. Gagner sa vie. Pris séparément, chacun de ces cercles laisse un manque : la passion sans revenu s'épuise, le métier sans amour se vide. C'est à leur intersection que naît l'ikigai, cette sensation rare d'être exactement à sa place. Une philosophie japonaise, mais une boussole universelle pour tous ceux qui créent, chaque jour, avec patience.",
  },
];

/** Trame de points façon photo de presse ; la taille des points « respire » (période = durée de la vidéo). */
const Halftone: React.FC<{height: number; u: number}> = ({height, u}) => {
  const dot = 2.4 + Math.sin(u * 2) * 0.6;
  return (
    <div
      style={{
        height,
        margin: '10px 0 12px',
        backgroundImage: `radial-gradient(circle, ${rgba(THEME.ink, 0.9)} ${dot}px, transparent ${dot + 0.6}px)`,
        backgroundSize: '9px 9px',
        WebkitMaskImage: `linear-gradient(${135 + Math.sin(u) * 25}deg, #000 0%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0.5) 100%)`,
        maskImage: `linear-gradient(${135 + Math.sin(u) * 25}deg, #000 0%, rgba(0,0,0,0.15) 70%, rgba(0,0,0,0.5) 100%)`,
        borderTop: `1px solid ${rgba(THEME.ink, 0.6)}`,
        borderBottom: `1px solid ${rgba(THEME.ink, 0.6)}`,
      }}
    />
  );
};

const ArticleBlock: React.FC<{a: Article; u: number}> = ({a, u}) => (
  <div style={{height: BLOCK, overflow: 'hidden', paddingTop: 18, boxSizing: 'border-box'}}>
    <div
      style={{
        fontFamily: FONTS.sans,
        fontWeight: 500,
        fontSize: 11,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: THEME.ink,
        marginBottom: 6,
      }}
    >
      {a.kicker}
    </div>
    <div
      style={{
        fontFamily: FONTS.sans,
        fontWeight: 800,
        fontSize: 25,
        lineHeight: 1,
        letterSpacing: '-0.02em',
        textTransform: 'uppercase',
        color: THEME.ink,
        paddingBottom: 8,
        borderBottom: `1px solid ${rgba(THEME.ink, 0.7)}`,
        marginBottom: 10,
      }}
    >
      {a.head}
    </div>
    {a.halftone ? <Halftone height={130} u={u} /> : null}
    <p
      lang="fr"
      style={{
        margin: 0,
        fontFamily: FONTS.sans,
        fontWeight: 500,
        fontSize: 13.5,
        lineHeight: 1.4,
        textAlign: 'justify',
        hyphens: 'auto',
        color: THEME.ink,
      }}
    >
      <span style={{fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 44, lineHeight: 0.8, float: 'left', marginRight: 6, marginTop: 4}}>
        {a.body[0]}
      </span>
      {a.body.slice(1)}
    </p>
  </div>
);

/**
 * Fond « journal » léger et animé (noir et blanc uniquement) :
 * en-tête de quotidien, 3 colonnes d'articles séparées par des filets,
 * trames de points façon photo de presse. Les colonnes défilent très lentement
 * en sens alternés, d'exactement un bloc sur la durée de la vidéo (boucle parfaite).
 * Le journal s'efface autour du sujet pour laisser la composition principale lisible.
 */
export const NewspaperLayer: React.FC<{opacity?: number}> = ({opacity = 0.2}) => {
  const frame = useCurrentFrame();
  const [lx, ly] = useLight();
  const k = frame / VIDEO.durationInFrames;
  const u = k * Math.PI * 2;
  const copies = Math.ceil((H - TOP) / BLOCK) + 2;
  const mask = `radial-gradient(ellipse 62% 42% at ${lx}px ${ly}px, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.45) 55%, #000 100%)`;

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* en-tête du quotidien */}
      <div style={{position: 'absolute', top: 52, left: MARGIN, right: MARGIN, textAlign: 'center', opacity: 0.42}}>
        <div style={{fontFamily: FONTS.serif, fontStyle: 'italic', fontWeight: 500, fontSize: 74, lineHeight: 1, color: THEME.ink, letterSpacing: '-0.01em'}}>
          Le Journal de l'Ikigai
        </div>
        <div style={{marginTop: 14, borderTop: `2px solid ${rgba(THEME.ink, 0.8)}`, borderBottom: `1px solid ${rgba(THEME.ink, 0.8)}`, height: 4}} />
      </div>

      {/* colonnes d'articles */}
      <AbsoluteFill
        style={{
          opacity,
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      >
        {COLUMNS.map((a, i) => {
          const dir = i % 2 === 0 ? -1 : 1; // colonnes 1 et 3 montent, colonne 2 descend
          const shift = dir < 0 ? -k * BLOCK : -BLOCK + k * BLOCK;
          const left = MARGIN + i * (COL_W + GUTTER);
          return (
            <div key={i} style={{position: 'absolute', top: TOP, left, width: COL_W, bottom: 0, overflow: 'hidden'}}>
              <div style={{transform: `translateY(${shift}px)`}}>
                {Array.from({length: copies}).map((_, c) => (
                  <ArticleBlock key={c} a={a} u={u} />
                ))}
              </div>
            </div>
          );
        })}
        {/* filets de colonnes */}
        {[1, 2].map((g) => (
          <div
            key={g}
            style={{
              position: 'absolute',
              top: TOP,
              bottom: 0,
              left: MARGIN + g * COL_W + (g - 0.5) * GUTTER,
              width: 1,
              background: rgba(THEME.ink, 0.6),
            }}
          />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

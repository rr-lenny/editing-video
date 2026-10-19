# IKIGAI — vidéo verticale faceless (Remotion)

1080×1920 · 30 fps · 921 frames (30,7 s) · voix-off `public/audio/voix-off.mp3` + SFX · rendu : `out/ikigai.mp4`

Paramètres retenus (le brief laissait les champs vides) :

| Paramètre | Choix |
|---|---|
| Thème | philosophie de vie / créateurs (Ikigai) |
| Ton | inspirant, premium, calme |
| Durée | 30,7 s (calée sur la voix-off) |
| Langue | français (fautes du script corrigées à l'écran : *fondamentaux*, *cet équilibre*, *créatifs*, *l'oublier*, *je te dis*) |
| Accent | vermillon `#E8432E` (soleil levant / torii) |
| CTA | « pour de nouvelles **INSPIRATIONS** » + pastille « enregistre · partage · reviens » |
| Musique | aucune (voix-off + SFX) — à ajouter dans `AUDIO.music` |
| Polices | Instrument Serif italique (accroche fine) + Poppins 900 (mot-clé) + JetBrains Mono (déco) |

## Changer de vidéo

Tout est dans **`src/config.ts`** : couleurs, polices, safe zones, easings, audio, bibliothèque SFX et le
tableau `SCENES` (texte, technique de révélation, image, particules, arcs, durée, transition, SFX).
Les instants `kickerAt` / `keywordAt` / `sublineAt` / `sfx.sec` sont en secondes de la voix-off :
modifier une durée de scène ne désynchronise pas le texte.

## Découpage & storyboard

Coupe = 2 frames avant la phrase suivante.

| # | Frames | Voix-off | Accroche → mot-clé | Révélation | Objet & animation | Entrée |
|---|---|---|---|---|---|---|
| 1 | 0–79 | J'ai découvert une philosophie japonaise | j'ai découvert une → PHILOSOPHIE JAPONAISE | mot par mot | soleil levant vectoriel (accent) pop + cercle pointillé, pétales | zoom |
| 2 | 80–134 | qui va changer ta perception du bonheur | qui va changer ta perception du → BONHEUR | scramble | ampoule qui tombe puis s'allume (halo accent) | whip ← |
| 3 | 135–201 | si tu as la volonté de vivre de ta création | si tu as la volonté de vivre de ta → CRÉATION | slam | Macintosh « hello » qui monte, cœurs/likes qui tombent | zoom |
| 4 | 202–275 | Ce principe, c'est l'IKIGAI | ce principe, c'est l' → IKIGAI | lettres qui se rassemblent | **scène punch** fond vermillon, kanji 生き甲斐 géant, riser + flash | cut |
| 5 | 276–340 | Elle repose sur 4 piliers fondamentaux | elle repose sur → 4 + PILIERS FONDAMENTAUX | compteur | 4 colonnes qui montent, coiffées cœur / cerveau / mains / billet | whip ↑ |
| 6 | 341–384 | Ce que tu aimes faire | ce que tu → AIMES FAIRE | mot par mot | cœur en couleur qui bat, index « 01 » | passage (cœur) |
| 7 | 385–428 | Ce en quoi tu es doué | ce en quoi → TU ES DOUÉ | scramble | cerveau N&B, étincelles, « 02 » | whip ← |
| 8 | 429–473 | Ce dont le monde a besoin | ce dont le monde → A BESOIN | slam | mains ouvertes autour d'un globe vectoriel accent, « 03 » | whip ↑ |
| 9 | 474–544 | Et enfin, ce pour quoi tu es payé | et enfin, ce pour quoi → TU ES PAYÉ | lettres qui se rassemblent | liasse qui tombe, pluie de billets, billet flou au 1er plan, « 04 » | passage (billet) |
| 10 | 545–605 | Cet équilibre permet de trouver ta direction | cet équilibre permet de trouver ta → DIRECTION | mot par mot | 4 cercles qui convergent (diagramme Ikigai) + aiguille qui trouve le nord | zoom |
| 11 | 606–653 | remettre du sens à ta vie | remettre du → SENS → à ta vie | scramble | cœur accent en gros plan hors champ | whip ← |
| 12 | 654–688 | et de pouvoir pleinement | et de pouvoir → PLEINEMENT | slam | typo seule + soleil en filigrane, arc épais flouté, pétales | zoom |
| 13 | 689–743 | t'épanouir dans tes projets créatifs | T'ÉPANOUIR → dans tes projets créatifs | mot par mot | Macintosh en gros plan incliné, pétales accent | whip ↑ |
| 14 | 744–793 | N'hésite pas à enregistrer cette vidéo | n'hésite pas à → ENREGISTRER → cette vidéo | machine à écrire | icône « enregistrer » qui se remplit d'accent | whip ← |
| 15 | 794–829 | pour ne pas l'oublier | pour ne pas → L'OUBLIER | mot par mot | cerveau en très gros plan + doublon flou | passage (cerveau) |
| 16 | 830–864 | et je te dis à très vite | et je te dis → À TRÈS VITE | slam | mains qui font coucou | whip ↑ |
| 17 | 865–920 | pour de nouvelles inspirations | pour de nouvelles → INSPIRATIONS | mot par mot | **CTA** centré, ampoule allumée, pastille | zoom |

## Images

| Scène | Image | Pourquoi |
|---|---|---|
| 2, 17 | `ampoule.png` | une lumière qui s'allume = changer de regard ; puis l'inspiration |
| 3, 13 | `macintosh.png` | l'outil du créateur (« hello ») ; en gros plan pour l'épanouissement créatif |
| 5, 6, 10, 11 | `coeur.png` | ce que tu aimes ; en gros plan accent pour « le sens à ta vie » |
| 5, 7, 10, 15 | `cerveau.png` | le talent ; en très gros plan pour la mémoire (« ne pas l'oublier ») |
| 5, 8, 10, 16 | `mains.png` | donner / ce dont le monde a besoin ; puis un « au revoir » |
| 9 | `liasse-billets.png` | ce pour quoi tu es payé |
| 5, 9, 10 | `billet.png` | pluie de billets, objet qui traverse, icône du 4ᵉ pilier |
| — | `ballon.png` | **non utilisé** : un ballon de basket n'a aucun rapport avec l'Ikigai |
| 1, 4, 12 | — (code) | soleil levant vectoriel, kanji 生き甲斐, typo seule |
| 8, 14 | — (code) | globe vectoriel, icône « enregistrer » |

Images à ajouter pour aller plus loin (PNG détourés) : un **torii** ou un **bonsaï** (scène 1), une
**boussole** (scènes 10–11), un **globe terrestre** réaliste (scène 8), un **carnet / crayon** ou un
**appareil photo** (scènes 3 et 13), une **fleur de cerisier** (pétales plus réalistes), un **marque-page**
(scène 14).

Une image manquante ou un chemin faux n'interrompt jamais le rendu : `SafeImg` affiche une carte grise
avec le nom suggéré (et les particules manquantes sont simplement masquées).

## Arborescence

```
remotion-ikigai/
├── package.json · tsconfig.json · remotion.config.ts
├── public/
│   ├── assets/   (PNG détourés)
│   ├── audio/voix-off.mp3
│   ├── sfx/      (whoosh, riser, clavier, flash, papier…)
│   └── fonts/noto-serif-jp-ikigai.woff2   (sous-ensemble 生き甲斐, 2 ko)
└── src/
    ├── index.ts · Root.tsx · Video.tsx
    ├── config.ts   ← le seul fichier à modifier
    ├── types.ts
    ├── lib/        motion.ts (easings), timing.ts, fonts.ts
    ├── components/ Camera (parallaxe + motion blur), Transition (+ PassWiper), GridBackground (+ DotGrid),
    │               KineticText, TextBlock, DashedCircle, FloatingObject, SweepingArc, ParticleRain,
    │               MagazineDeco, SafeImg
    └── scenes/     HeroScene, PunchScene, PillarsScene, BalanceScene, CtaScene, index.tsx
```

## Commandes

```bash
npm i
npx remotion studio                                  # prévisualiser
npx remotion render Ikigai out/ikigai.mp4            # rendre le MP4
```

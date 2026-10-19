# IKIGAI : vidéo verticale éditoriale (Remotion)

1080×1920 · 30 fps · 30,7 s, calée sur la voix off.

## Commandes
```bash
npm install
npm run studio                                   # prévisualisation (Main + Sequences/SeqXX)
npx remotion still src/index.ts Seq01 out/s01.jpg --frame=40
npx remotion render src/index.ts Seq01 out/seq01.mp4
npm run render                                   # vidéo finale → out/video.mp4
```

Dans un conteneur sans Chrome Remotion, pointer vers un Chromium existant :
`REMOTION_BROWSER_EXECUTABLE=/chemin/vers/headless_shell npx remotion …`

## Structure
- `src/config.ts` : **toutes** les données (textes, rôles typo, images, timings, audio, SFX).
- `src/components/` : PaperBackground, TypeComposition, GlowText, EditorialRule, MicroCaption,
  BWImage, DashedCircle, SweepingArc, DotGrid, SoftTransition (+ PushIn).
- `src/sequences/SequenceXX.tsx` : une séquence par fichier.
- `public/` : `assets/` (PNG), `audio/`, `sfx/`, `fonts/` (Inter + EB Garamond, OFL).

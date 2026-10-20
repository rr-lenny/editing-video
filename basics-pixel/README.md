# BASICS Nº01: pixel-art video (9:16)

« 5 marques indispensables pour acheter tes basics », partie 1 : Uniqlo, Bershka, Human With Attitude.

`python3 render.py` → `basics_pixel_9x16.mp4` (1080x1920, 24 fps, 26.7 s, with sound).
`python3 render.py --preview 4.0,12.5 out.png` renders still frames.

## Direction artistique

**Concept : un magazine de mode urbaine imprimé sur une machine 8 bits.** La vidéo se lit comme
un numéro qu'on feuillette : couverture, une double page par marque, puis le sommaire.

- **Image** : chaque photo est tramée (Bayer 8x8 ordonné) dans une rampe de 5 tons prise dans
  la photo elle-même : rose poudré (couverture), olive (Uniqlo), denim/taupe (Bershka), ardoise/chocolat (HWA).
  Chaque chapitre ajoute une seule couleur d'accent, comme une encre de risographie : rouge, cobalt, rouille.
  La photo se « développe » depuis le papier, et le grain argentique fait bouger la trame.
- **Typo** : Inter Display Black pour les titres, Caladea Italic pour la voix éditoriale,
  et une police bitmap 5x7 dessinée à la main pour les légendes, folios et numéros. Rien n'est
  anti-aliasé : tout reste en vrais pixels, rendu en 270x480 puis agrandi x4.
- **Mise en page** : folios, filets, traits de coupe, code-barres, sticker « HELLO my name is »
  (clin d'œil au bonnet du shooting), liste « À SHOPPER », sommaire avec les lignes 04/05 caviardées.
- **Mouvement** : animé à 12 images/s comme du pixel art à la main. Montage cut à la demi-temps
  sur la couverture, puis des tournes de page qui tombent sur le temps fort.
- **Son** : beat lo-fi à 90 BPM avec Rhodes FM, batterie poussiéreuse swinguée, sub bass,
  lead 8 bits en onde pulse 12,5 % (le lien avec le pixel art) et craquements de vinyle. Le filtre s'ouvre
  sur la première mesure. Bruitages : déclencheur photo, tournes de page, ticks d'écriture.
  Tout est synthétisé dans le script.

## Photos (`refs/`)

| Fichier | Utilisation |
| --- | --- |
| look_bonnet | couverture, encart Bershka |
| look_debardeur | Uniqlo (hero) |
| look_tee_jean | encart Uniqlo |
| look_denim | Bershka (hero) |
| look_hoodie_short | HWA (hero) |
| look_oversize | encart HWA |

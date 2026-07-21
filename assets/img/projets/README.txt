GALERIES PROJET — PHOTOS FIXES ET BOUCLES ANIMÉES
==================================================

Un dossier par projet, nommé comme le `slug` dans js/projects.js.
Les fichiers sont numérotés 01, 02, 03… et `galleryCount` dit combien il y en a.

PHOTO FIXE (cas par défaut)
---------------------------
Un seul fichier : 0N.jpg
Pipeline habituel : Pillow, redimension max-width 1400, JPEG progressif.


BOUCLE ANIMÉE
-------------
Trois fichiers pour un même numéro : 0N.mp4 + 0N.webm + 0N.jpg (l'affiche).
Puis on déclare le numéro dans `galleryMotion` du projet (js/projects.js).

⚠️ NE JAMAIS DÉPOSER DE .GIF DANS UN DOSSIER SERVI.
Le GIF est un format de 1989 : 256 couleurs, aucune compression inter-frame.
Mesuré sur le projet `solerys` (2026-07-21) : 5 GIF 1080p = 13,4 Mo, contre
1,9 Mo en MP4 (1,4 Mo en WebM) — facteur 7 — et une MEILLEURE qualité, sans
dithering ni banding sur les aplats de motion design. Sur mobile, le décodage
GIF est en plus nettement plus coûteux en CPU.
Les GIF masters restent en local mais sont exclus du déploiement (.vercelignore).


CONVERSION (ffmpeg)
-------------------
ffmpeg est installé via `winget install Gyan.FFmpeg`. S'il n'est pas dans le PATH :
  C:\Users\<profil>\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_*\ffmpeg-*-full_build\bin\ffmpeg.exe

Pour chaque GIF (remplacer 01) :

  # MP4 / H.264 — le repli universel (Safari, vieux Android)
  ffmpeg -y -i 01.gif -vf "scale='min(1280,iw)':-2:flags=lanczos" \
    -c:v libx264 -profile:v high -crf 26 -preset slow -pix_fmt yuv420p \
    -an -movflags +faststart 01.mp4

  # WebM / VP9 — ~28 % plus léger, servi en premier aux navigateurs qui le prennent
  ffmpeg -y -i 01.gif -vf "scale='min(1280,iw)':-2:flags=lanczos" \
    -c:v libvpx-vp9 -crf 36 -b:v 0 -row-mt 1 -pix_fmt yuv420p -an 01.webm

  # Affiche = 1re image (montrée avant lecture, et seule chose chargée sous
  # prefers-reduced-motion)
  ffmpeg -y -i 01.gif -vf "scale='min(1280,iw)':-2:flags=lanczos" -frames:v 1 -q:v 4 01.jpg

Pourquoi ces réglages :
  scale min(1280,iw)  la grille masonry affiche ~400-600px de large : 1280 couvre le
                      retina sans payer du 1080p. `min()` n'agrandit jamais une source
                      déjà plus petite ; `-2` garde le ratio en dimension paire (exigée
                      par yuv420p).
  crf 26 / 36         qualité visuellement transparente sur ce type de contenu.
                      Descendre le CRF si un dégradé montre du banding.
  pix_fmt yuv420p     sans lui, certains GIF sortent en yuv444p, illisible sur Safari.
  -an                 les boucles sont muettes (attribut `muted`) : embarquer une piste
                      audio, c'est du poids jamais entendu.
  -movflags +faststart place l'index MP4 en tête → la lecture démarre sans attendre le
                      téléchargement complet.

Le site ne charge la vidéo qu'à l'approche de l'écran (preload="none" +
IntersectionObserver) et met en pause dès qu'elle en sort — voir initGalleryMotion()
dans js/project-page.js.

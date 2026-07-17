VIDÉOS DU SITE
==============

ffmpeg est requis pour tout ce qui suit (Windows : `winget install Gyan.FFmpeg`).


1. VIDÉOS DES PROJETS
---------------------

Dépose ici les vidéos web des projets vidéo, nommées d'après le slug du projet :

  assets/video/techteam.mp4

⚠️ Compresse-les d'abord pour le web (les rushes originaux font 150–300 Mo, c'est
trop lourd). Cible recommandée : 1080p ou 720p, H.264, ~5–10 Mo, son inclus.
Exemple ffmpeg :

  ffmpeg -i source.mp4 -vf scale=-2:720 -c:v libx264 -crf 28 -preset slow \
         -c:a aac -b:a 128k -movflags +faststart assets/video/techteam.mp4

Tant que le fichier n'est pas là, la page projet affiche l'affiche (poster) et,
au clic, un message « Vidéo bientôt disponible ». Rien d'autre à configurer :
le lecteur est déjà branché (js/project-page.js).

Ces vidéos ne sont chargées QU'AU CLIC (rien ne part au chargement de la page) —
leur poids n'impacte donc pas la performance perçue du site.


2. SLIDESHOW DU HERO (accueil) — 4 fichiers, ne pas en oublier
---------------------------------------------------------------

Le hero d'accueil sert QUATRE fichiers, choisis à l'exécution par le script
inline d'index.html (résolution selon le viewport, codec selon le navigateur) :

  hero_slideshow.av1.mp4       1080p AV1    ~9 Mo    desktop, navigateurs modernes
  hero_slideshow.mp4           1080p H.264  ~14 Mo   desktop, repli (Safari sans AV1)
  hero_slideshow-720.av1.mp4    720p AV1    ~4,6 Mo  mobile, navigateurs modernes
  hero_slideshow-720.mp4        720p H.264  ~6 Mo    mobile, repli

Si tu remplaces le slideshow, régénère LES QUATRE depuis la nouvelle source :

  S=source.mp4
  ffmpeg -y -i $S -c:v libsvtav1 -crf 38 -preset 5 -g 125 -pix_fmt yuv420p -an \
         -movflags +faststart assets/video/hero_slideshow.av1.mp4
  ffmpeg -y -i $S -vf scale=-2:720 -c:v libsvtav1 -crf 40 -preset 5 -g 125 \
         -pix_fmt yuv420p -an -movflags +faststart assets/video/hero_slideshow-720.av1.mp4
  ffmpeg -y -i $S -c:v libx264 -crf 28 -preset slow -profile:v high -pix_fmt yuv420p \
         -an -movflags +faststart assets/video/hero_slideshow.mp4
  ffmpeg -y -i $S -vf scale=-2:720 -c:v libx264 -crf 29 -preset slow -profile:v high \
         -pix_fmt yuv420p -an -movflags +faststart assets/video/hero_slideshow-720.mp4

Pourquoi ces réglages :

  -an              La vidéo est lue en `muted` : la piste audio ne sera JAMAIS
                   entendue. L'ancienne source embarquait 320 kb/s d'AAC, soit
                   1,8 Mo de pur gaspillage.
  -movflags        Place l'index en tête de fichier : la lecture démarre sans
    +faststart     attendre le téléchargement complet.
  libsvtav1        AV1 ≈ 35 % plus léger que H.264 à qualité égale. Mesuré sur
                   la source d'origine : 9,0 Mo à VMAF 94,9, là où H.264 demande
                   17,4 Mo pour la même note.
  -g 125           Un mot-clé toutes les 5 s (25 fps) : la boucle redémarre net.
  CRF 38 / 40      Calibrés au VMAF sur CETTE source. Une autre source (moins
                   grainée) accepterait des CRF plus hauts — revérifie plutôt que
                   de recopier à l'aveugle :
                     ffmpeg -i encode.mp4 -i source.mp4 -lavfi \
                       "[0:v]setpts=PTS-STARTPTS[d];[1:v]setpts=PTS-STARTPTS[r];[d][r]libvmaf" -f null -
                   Viser VMAF ≥ 94. ⚠️ Un chemin Windows (`C:/…`) casse le parseur
                   de filtres : lance la commande depuis le dossier des fichiers.

⚠️ Si tu changes le niveau AV1 (résolution différente), mets à jour la chaîne
`codecs="av01.0.XXM.08"` du script inline d'index.html — c'est elle qui permet à
un Safari sans décodeur AV1 de sauter directement au repli H.264 au lieu de
télécharger l'AV1 pour rien. Le niveau se lit avec :

  ffprobe -v error -show_entries stream=level -of default=noprint_wrappers=1 fichier.mp4


3. LA SOURCE D'ORIGINE
----------------------

L'export original du slideshow (54,3 Mo, 1080p à 9,96 Mb/s + AAC 320 kb/s) n'est
plus dans le dossier, mais il reste dans l'historique git — il n'est pas perdu :

  git show dabd306:assets/video/hero_slideshow.mp4 > hero_original.mp4

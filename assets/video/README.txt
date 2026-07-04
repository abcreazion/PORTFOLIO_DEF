VIDÉOS DES PROJETS
==================

Dépose ici les vidéos web des projets vidéo, nommées d'après le slug du projet :

  assets/video/techteam.mp4
  assets/video/wsc-spot.mp4

⚠️ Compresse-les d'abord pour le web (les rushes originaux font 150–300 Mo, c'est
trop lourd). Cible recommandée : 1080p ou 720p, H.264, ~5–10 Mo, son inclus.
Exemple ffmpeg :

  ffmpeg -i source.mp4 -vf scale=-2:720 -c:v libx264 -crf 28 -preset slow \
         -c:a aac -b:a 128k -movflags +faststart assets/video/wsc-spot.mp4

Tant que le fichier n'est pas là, la page projet affiche l'affiche (poster) et,
au clic, un message « Vidéo bientôt disponible ». Rien d'autre à configurer :
le lecteur est déjà branché (js/project-page.js).

# Voix canoniques UNDERTALE / DELTARUNE

Ces WAV sont les ressources originales extraites des installations locales avec UndertaleModTool CLI.
Le nom de chaque fichier est volontairement identique au nom de la ressource GameMaker.

- `undertale/` provient de `Undertale/data.win`.
- `deltarune/` provient de `DELTARUNE - Patch FR/chapter5_windows/data.win` ; ce chapitre contient aussi les voix communes des chapitres précédents.
- `public/voice-map.js` associe les identifiants du catalogue Demirramon aux ressources.
- Mettaton, Temmie, Gaster et Tenna choisissent aléatoirement parmi leurs séries, comme dans les jeux.
- Queen utilise `snd_txtq_2` à une hauteur de 0,90 à 1,05 ; Spamton utilise `snd_txtspam2` de 0,80 à 1,20 ; Tenna utilise ses neuf clips de 0,86 à 1,21 et à 70 % du volume.
- Frisk, Kris, Chara et Grillby restent silencieux : ils n'ont pas de voix de dialogue canonique imprimée dans leurs jeux.

Le script `tools/ExtractSelectedSounds.csx` permet de refaire une extraction ciblée sans modifier les fichiers des jeux.
Ces ressources restent la propriété de leurs auteurs respectifs.

# Undertale OBS Dialog

Un panneau de contrôle local pour afficher dans OBS des dialogues animés avec le catalogue du [Text Box Generator de Demirramon](https://www.demirramon.com/generators/undertale_text_box_generator).

## Fonctionnalités

- catalogue dynamique complet : catégories, univers, personnages et expressions publiques ;
- police, casse, astérisque et sprite propres à chaque personnage ;
- animation lettre par lettre, son de voix et pauses sur la ponctuation ;
- file d’attente, pause, reprise, suppression et passage manuel au dialogue suivant ;
- rendu local calibré sur la sortie native `578 × 152` ;
- remplacement automatique de la dernière frame par la PNG officielle du moteur de Demirramon, sans recompression ;
- repli automatique sur le rendu local si le moteur distant est temporairement indisponible.

## Installation

```bash
npm install
npm start
```

Le panneau de contrôle s’ouvre sur <http://127.0.0.1:3000/control.html>.

## Démarrage rapide sous Windows

Double-clique sur `start-web.bat` pour lancer le panneau sans taper de commande.
Le navigateur s’ouvre automatiquement et la fenêtre ouverte garde le serveur actif.

Si tu veux lancer le serveur sans fenêtre visible, double-clique sur `start-web-silent.vbs`.

## Configuration OBS

Ajoute une source **Navigateur** avec :

- URL : `http://127.0.0.1:3000/display.html`
- largeur : `640`
- hauteur : `200`
- arrière-plan transparent activé.

La textbox conserve ses pixels natifs et se place à 20 px du bord gauche et du bas. La touche `&` depuis l’affichage passe au dialogue suivant.

## Connexion au moteur officiel

Le catalogue, les aperçus de sprites et la frame finale sont chargés depuis Demirramon. Une connexion Internet est donc nécessaire pour parcourir tous les personnages et obtenir la frame officielle exacte. Les dialogues déjà envoyés continuent à disposer du rendu animé local en cas de panne ponctuelle.

Les sprites Undertale/Deltarune restent la propriété de leurs auteurs respectifs. Les polices pixel incluses proviennent des ressources référencées par le Text Box Generator.

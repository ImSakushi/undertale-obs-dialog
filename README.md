# Undertale Dialogue Generator (pour OBS)

Ce projet permet d’afficher des dialogues à la *Undertale* dans OBS via la **source Navigateur Web**, avec un **panel de contrôle** pour gérer les émotions et la file d'attente des répliques.

![image](https://github.com/user-attachments/assets/35f21bd5-8d6f-4f81-b3e7-143e0784a809)

---

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/ImSakushi/undertale-obs-dialog.git
cd utdialogtest
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Lancer le serveur

```bash
npm start
```

Cela démarre le serveur local sur `http://localhost:3000`.

---

## 🎥 Intégration dans OBS

1. **Ajouter une source "Navigateur" dans OBS**
2. Donner un nom à la source (ex: `UndertaleDialogue`)
3. Dans l'URL, entrez :

```
http://localhost:3000/display.html
```

4. Définir la **largeur à 640** et la **hauteur à 200** (ou plus selon vos besoins)
5. Cochez "Arrière-plan transparent" si vous le souhaitez

> 💡 Vous pouvez ajuster l’emplacement de la boîte de dialogue comme vous le voulez dans OBS.

---

## 🕹️ Utiliser le panneau de contrôle

Ouvrez dans votre navigateur cette adresse :

```
http://localhost:3000/control.html
```

Depuis cette interface, vous pouvez :

* Choisir une **émotion** (image de Sans)
* Écrire un **texte de dialogue**
* L’**ajouter à la file**
* Passer au dialogue suivant (`Suivant`)
* Mettre en **pause** / **reprendre**
* **Vider** toute la file
* Supprimer individuellement des répliques

---

## 🧠 Raccourcis clavier

* Sur OBS (ou `display.html`) :

  * Appuyez sur la touche `&` (touche 1 en AZERTY) pour passer au dialogue suivant.

---

## 📁 Structure du projet

```text
utdialogtest/
├── public/
│   ├── control.html     # Panneau de contrôle pour gérer les dialogues
│   ├── display.html     # Affichage OBS
│   ├── *.png            # Images des émotions de Sans
│   ├── voice_sans.mp3   # Effet sonore à chaque lettre
│   └── sans.woff2       # Police pixel style Undertale
├── server.js            # Serveur Node.js (Express + Socket.io)
└── package.json         # Configuration du projet
```

## 🛠️ Dépendances

* [express](https://www.npmjs.com/package/express)
* [socket.io](https://www.npmjs.com/package/socket.io)

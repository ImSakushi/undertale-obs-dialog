// server.js
const express  = require('express');
const http     = require('http');
const socketIo = require('socket.io');
const path     = require('path');

const app    = express();
const server = http.createServer(app);
const io     = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

// États serveur
let queue       = [];
let isDisplayed = false;
let paused      = false;

// Fonction d’envoi du prochain dialogue
function sendNext() {
  if (paused) return;                // on ne fait rien si on est en pause
  if (queue.length === 0) {
    // plus de dialogues → on cache
    io.emit('dialogue-hide');
    isDisplayed = false;
    io.emit('queueUpdated', queue);
    console.log('📭 File vide, rien à afficher.');
  } else {
    const { expr, text } = queue.shift();
    isDisplayed = true;
    console.log(`➡️  Affichage : [${expr}] ${text}`);
    io.emit('dialogue', { expr, text: '* ' + text });
    io.emit('queueUpdated', queue);
  }
}

// Quand un client se connecte (UI ou OBS)
io.on('connection', socket => {
  console.log('🔌 Client connecté');
  // on envoie l’état initial
  socket.emit('queueUpdated', queue);
  socket.emit('paused', paused);

  // ajout à la file
  socket.on('enqueue', ({ expr, text }) => {
    queue.push({ expr, text });
    io.emit('queueUpdated', queue);
    console.log(`🗒  Mis en file : [${expr}] ${text}`);
    if (!isDisplayed && !paused) sendNext();
  });

  // suppression d’un élément à l’index donné
  socket.on('remove', idx => {
    queue.splice(idx, 1);
    io.emit('queueUpdated', queue);
    console.log(`❌ Élement ${idx} supprimé de la file.`);
  });

  // passer au suivant
  socket.on('next', () => sendNext());

  // pause / reprise
  socket.on('pause', () => {
    paused = true;
    io.emit('paused', paused);
    console.log('⏸️  Mise en pause');
  });
  socket.on('resume', () => {
    paused = false;
    io.emit('paused', paused);
    console.log('▶️  Reprise');
    if (!isDisplayed) sendNext();
  });

  // vider la file
  socket.on('clearQueue', () => {
    queue = [];
    io.emit('queueUpdated', queue);
    console.log('🗑️  File vidée');
    if (isDisplayed) {
      io.emit('dialogue-hide');
      isDisplayed = false;
    }
  });
});

// Lancement du serveur
const PORT = 3000;
server.listen(PORT, async () => {
  const url = `http://localhost:${PORT}/control.html`;
  console.log(`🚀 Serveur lancé sur ${url}`);

  try {
    // import dynamique de la version ESM de 'open'
    const open = (await import('open')).default;
    open(url);
  } catch (err) {
    console.warn('⚠️ Impossible d’ouvrir automatiquement le navigateur :', err);
  }
});

// server.js
const express  = require('express');
const http     = require('http');
const socketIo = require('socket.io');
const readline = require('readline');
const path     = require('path');

const app    = express();
const server = http.createServer(app);
const io     = socketIo(server);

app.use(express.static(path.join(__dirname, 'public')));

let queue = [];
let isDisplayed = false;

// Envoi du prochain dialogue (ou cache si plus rien)
function sendNext() {
  if (queue.length === 0) {
    // plus de dialogues -> on cache
    io.emit('dialogue-hide');
    isDisplayed = false;
    console.log('📭 File vide, rien à afficher.');
  } else {
    const { expr, text } = queue.shift();
    isDisplayed = true;
    console.log(`➡️  Affichage : [${expr}] ${text}`);
    io.emit('dialogue', { expr, text: '* ' + text });
  }
}

// Quand un client OBS se connecte
io.on('connection', socket => {
  console.log('🔌 Client OBS connecté');
  // s’il envoie une requête “next” (touche &), on passe au suivant
  socket.on('next', () => sendNext());
});

const rl = readline.createInterface({
  input:  process.stdin,
  output: process.stdout,
  prompt: 'dialog> '
});

rl.prompt();
rl.on('line', line => {
  const raw = line.trim();
  if (!raw) { rl.prompt(); return; }

  // Si on tape "&" dans le terminal, ça force le suivant
  if (raw === '&') {
    sendNext();
    rl.prompt();
    return;
  }

  // Sinon on parse "expression:texte"
  let expr = 'sans';
  let text = raw;
  if (raw.includes(':')) {
    const [pref, ...rest] = raw.split(':');
    expr = pref.trim().toLowerCase() || 'sans';
    text = rest.join(':').trim();
  }
  // On empile
  queue.push({ expr, text });
  console.log(`🗒  Mis en file : [${expr}] ${text}`);

  // si un dialogue était déjà affiché, on déclenche tout de suite le suivant
  if (isDisplayed) sendNext();

  rl.prompt();
});

// Lancement du serveur
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});

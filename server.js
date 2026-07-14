const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const DEMIRRAMON_ORIGIN = 'https://www.demirramon.com';
const DEMIRRAMON_ENDPOINT = 'https://www.demirramon.com/ajax/undertale/textbox/generate';
const RENDER_TIMEOUT_MS = 10_000;
const MAX_RENDER_CACHE_ENTRIES = 50;
const CONTENT_ENDPOINTS = new Set(['boxes', 'fonts', 'universe_groups', 'universes', 'characters']);

const expressionAliases = {
  normal: 'default',
  look: 'looking-left'
};

const renderCache = new Map();
let queue = [];
let isDisplayed = false;
let paused = false;
let dialogueSequence = 0;

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on('data', chunk => chunks.push(chunk));
    request.on('end', () => resolve(Buffer.concat(chunks)));
    request.on('error', reject);
  });
}

async function proxyOfficial(request, response, target) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RENDER_TIMEOUT_MS);

  try {
    const body = request.method === 'GET' || request.method === 'HEAD'
      ? undefined
      : await readRequestBody(request);
    const headers = {
      'user-agent': 'Undertale OBS Dialog',
      'x-requested-with': 'XMLHttpRequest',
      'x-post-encoded-as': 'JSON'
    };
    if (request.headers['content-type']) headers['content-type'] = request.headers['content-type'];

    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
      redirect: 'follow',
      signal: controller.signal
    });
    const data = Buffer.from(await upstream.arrayBuffer());
    response.status(upstream.status);
    response.set('content-type', upstream.headers.get('content-type') || 'application/octet-stream');
    response.set('cache-control', target.includes('/gen/') ? 'public, max-age=3600' : 'no-store');
    response.send(data);
  } catch (error) {
    const reason = error && error.name === 'AbortError' ? 'délai dépassé' : error.message;
    response.status(502).json({ msg: `Le moteur officiel est indisponible : ${reason}`, data: null });
  } finally {
    clearTimeout(timeout);
  }
}

app.post('/api/content/:endpoint', (request, response) => {
  const { endpoint } = request.params;
  if (!CONTENT_ENDPOINTS.has(endpoint)) return response.status(404).json({ data: null });
  return proxyOfficial(request, response, `${DEMIRRAMON_ORIGIN}/ajax/undertale/content/${endpoint}`);
});

app.get('/api/sprite-preview.png', (request, response) => {
  const query = new URLSearchParams();
  for (const key of ['char', 'exp', 'color', 'v']) {
    if (request.query[key] != null) query.set(key, String(request.query[key]));
  }
  return proxyOfficial(request, response, `${DEMIRRAMON_ORIGIN}/gen/textbox_sprite_preview.png?${query}`);
});

app.use(express.static(path.join(__dirname, 'public')));

function describeExpression(expr) {
  const filename = path.basename(String(expr || ''), path.extname(String(expr || '')));
  const isPapyrus = filename.startsWith('papyrus-');
  const prefix = isPapyrus ? 'papyrus-' : 'sans-';
  const rawExpression = filename.startsWith(prefix) ? filename.slice(prefix.length) : 'default';

  return {
    character: isPapyrus ? 'undertale-papyrus' : 'undertale-sans',
    sprite: expressionAliases[rawExpression] || rawExpression || 'default'
  };
}

function transformDialogueText(text, transform) {
  const value = String(text || '');
  if (transform === 'uppercase') return value.toLocaleUpperCase('fr');
  if (transform === 'lowercase') return value.toLocaleLowerCase('fr');
  if (transform === 'title') {
    return value.replace(/(^|\s)(\p{L})/gu, (_, prefix, letter) => prefix + letter.toLocaleUpperCase('fr'));
  }
  return value;
}

function buildOfficialParams(dialogue) {
  const legacy = describeExpression(dialogue.expr);
  const character = dialogue.character || legacy.character;
  const sprite = dialogue.sprite || legacy.sprite;

  return {
    style: 'regular',
    box: 'undertale',
    universe_group: dialogue.universeGroup || 'undertale',
    universe: dialogue.universe || 'undertale',
    character,
    sprite,
    asterisk: typeof dialogue.asterisk === 'boolean' ? dialogue.asterisk : null,
    font: dialogue.font || 'auto',
    text_transform: dialogue.textTransform || 'auto',
    format: 'png',
    margin: false,
    size: 2,
    color: {
      sprite: 'colored',
      box: 'ffffff',
      asterisk: ['ffffff', 'ffffff', 'ffffff'],
      text: 'ffffff'
    },
    text: transformDialogueText(dialogue.text, dialogue.textTransform)
  };
}

function rememberRender(key, value) {
  if (renderCache.size >= MAX_RENDER_CACHE_ENTRIES) {
    renderCache.delete(renderCache.keys().next().value);
  }
  renderCache.set(key, value);
}

async function renderWithDemirramon(dialogue) {
  if (typeof fetch !== 'function' || typeof FormData !== 'function') return null;

  const params = buildOfficialParams(dialogue);
  const cacheKey = JSON.stringify(params);
  if (renderCache.has(cacheKey)) return renderCache.get(cacheKey);

  const form = new FormData();
  for (const [key, value] of Object.entries(params)) {
    form.append(key, JSON.stringify(value));
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), RENDER_TIMEOUT_MS);

  try {
    const response = await fetch(DEMIRRAMON_ENDPOINT, {
      method: 'POST',
      headers: {
        'user-agent': 'Undertale OBS Dialog',
        'x-requested-with': 'XMLHttpRequest',
        'x-post-encoded-as': 'JSON'
      },
      body: form,
      signal: controller.signal
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    const result = payload && payload.data;
    if (!result || !result.image || !result.format) throw new Error('réponse incomplète');

    const rendered = {
      image: `data:image/${result.format};base64,${result.image}`,
      width: 578,
      height: 152
    };
    rememberRender(cacheKey, rendered);
    return rendered;
  } catch (error) {
    const reason = error && error.name === 'AbortError' ? 'délai dépassé' : error.message;
    console.warn(`Moteur Demirramon indisponible (${reason}) : rendu local conservé.`);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function sendNext() {
  if (paused) return;

  if (queue.length === 0) {
    io.emit('dialogue-hide');
    isDisplayed = false;
    io.emit('queueUpdated', queue);
    console.log('File vide, rien à afficher.');
    return;
  }

  const dialogue = queue.shift();
  const id = ++dialogueSequence;
  isDisplayed = true;
  io.emit('queueUpdated', queue);

  // Le rendu officiel est obtenu AVANT l'affichage : le client anime directement
  // cette image, il n'y a donc jamais de bascule de mise en page à la fin.
  const rendered = await renderWithDemirramon(dialogue);
  if (id !== dialogueSequence) return;

  console.log(`Affichage : [${dialogue.characterName || dialogue.expr || dialogue.character}] ${dialogue.text}${rendered ? '' : ' (rendu local de secours)'}`);
  io.emit('dialogue', { id, ...dialogue, official: rendered ? rendered.image : null });
}

io.on('connection', socket => {
  console.log('Client connecté');
  socket.emit('queueUpdated', queue);
  socket.emit('paused', paused);

  socket.on('enqueue', dialogue => {
    if (!dialogue || typeof dialogue.text !== 'string' || !dialogue.text.trim()) return;
    queue.push(dialogue);
    io.emit('queueUpdated', queue);
    console.log(`Mis en file : [${dialogue.characterName || dialogue.expr || dialogue.character}] ${dialogue.text}`);
    if (!isDisplayed && !paused) sendNext();
  });

  socket.on('remove', idx => {
    if (Number.isInteger(idx) && idx >= 0 && idx < queue.length) queue.splice(idx, 1);
    io.emit('queueUpdated', queue);
  });

  socket.on('next', () => sendNext());

  socket.on('pause', () => {
    paused = true;
    io.emit('paused', paused);
  });

  socket.on('resume', () => {
    paused = false;
    io.emit('paused', paused);
    if (!isDisplayed) sendNext();
  });

  socket.on('clearQueue', () => {
    queue = [];
    io.emit('queueUpdated', queue);
    if (isDisplayed) {
      io.emit('dialogue-hide');
      isDisplayed = false;
    }
  });
});

const DEFAULT_PORT = Number.parseInt(process.env.PORT || '3000', 10);
const BIND_HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_HOST = process.env.PUBLIC_HOST || (BIND_HOST === '0.0.0.0' ? '127.0.0.1' : BIND_HOST);
const MAX_START_ATTEMPTS = 15;
let attempts = 0;
let currentPort = DEFAULT_PORT;

function startServer(port) {
  attempts += 1;
  currentPort = port;

  if (attempts > MAX_START_ATTEMPTS) {
    console.error('Impossible de démarrer le serveur après plusieurs tentatives.');
    process.exit(1);
  }

  server.listen(port, BIND_HOST);
}

server.on('listening', async () => {
  const address = server.address();
  const runningPort = typeof address === 'object' && address ? address.port : currentPort;
  const url = `http://${PUBLIC_HOST}:${runningPort}/control.html`;
  console.log(`Serveur lancé sur ${url} (bind ${BIND_HOST})`);

  if (process.env.NO_OPEN === '1') return;

  try {
    const open = (await import('open')).default;
    open(url);
  } catch (error) {
    console.warn(`Impossible d’ouvrir automatiquement le navigateur : ${error.message}`);
  }
});

server.on('error', error => {
  if (error.code === 'EADDRINUSE' || error.code === 'EPERM') {
    const blockedPort = Number(error.port) || currentPort;
    const nextPort = blockedPort + 1;
    console.warn(`Port ${blockedPort} indisponible, tentative sur ${nextPort}...`);
    startServer(nextPort);
    return;
  }

  console.error(`Erreur serveur : ${error.message}`);
  process.exit(1);
});

startServer(DEFAULT_PORT);

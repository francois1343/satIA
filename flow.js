// ══════════════════════════════════════════════════════
//  CONFIG — couleurs et métadonnées par mode
// ══════════════════════════════════════════════════════
const MODES = {
  sand:   { title:"Sand",   bg:"#13100a", color:"#d4a96a", accent:"#e8c080", icon:"⋯", hint:"pour grains",        border:"rgba(212,169,106,0.22)" },
  glow:   { title:"Neon",   bg:"#060b14", color:"#00fff7", accent:"#ff00cc", icon:"⚡", hint:"draw neon trails",   border:"rgba(0,255,247,0.18)"   },
  magnet: { title:"Magnet", bg:"#0b0914", color:"#a78bfa", accent:"#60a5fa", icon:"◎", hint:"attract particles",  border:"rgba(167,139,250,0.2)"  },
  slice:  { title:"Slice",  bg:"#090909", color:"#f0f0f0", accent:"#ff4060", icon:"⟋", hint:"slash to cut",       border:"rgba(248,248,248,0.15)" },
  clean:  { title:"Clean",  bg:"#060e0c", color:"#50efb0", accent:"#00d4ff", icon:"◌", hint:"wipe to reveal",     border:"rgba(80,239,176,0.18)"  },
  frost:  { title:"Frost",  bg:"#070a12", color:"#8fd6ff", accent:"#c7f2ff", icon:"❄", hint:"grow crystalline branches", border:"rgba(143,214,255,0.2)" },
  garden: { title:"Jardin", bg:"#08110b", color:"#7ee787", accent:"#c8ffd8", icon:"♣", hint:"faire pousser des plantes", border:"rgba(126,231,135,0.22)" },
  ink:    { title:"Ink",    bg:"#0d0a14", color:"#c084fc", accent:"#e879f9", icon:"✦", hint:"bleed ink on canvas",border:"rgba(192,132,252,0.2)"  },
  galaxy: { title:"Galaxy", bg:"#020306", color:"#7dd3ff", accent:"#ff00ff", icon:"✦", hint:"drift in cosmic gravity", border:"rgba(125,211,255,0.25)" },
};

// ══════════════════════════════════════════════════════
//  RÉFÉRENCES DOM
// ══════════════════════════════════════════════════════
const app          = document.getElementById('app');
const canvas       = document.getElementById('c');
const ctx          = canvas.getContext('2d');
const wrap         = document.getElementById('canvas-wrap');
const touchHint    = document.getElementById('touch-hint');
const activeHint   = document.getElementById('active-hint');
const modeTitle    = document.getElementById('mode-title');
const appLabel     = document.getElementById('app-label');
const modeFlash    = document.getElementById('mode-flash');
const hintIcon     = document.getElementById('hint-icon');
const btns         = document.querySelectorAll('.mode-btn');
const ctrlToggle   = document.getElementById('ctrl-toggle');
const ctrlPanel    = document.getElementById('ctrl-panel');
const ctrlForce    = document.getElementById('ctrl-force');
const ctrlForceVal = document.getElementById('ctrl-force-val');
const ctrlDensity  = document.getElementById('ctrl-density');
const ctrlDensityVal = document.getElementById('ctrl-density-val');
const ctrlGravity  = document.getElementById('ctrl-gravity');
const ctrlGravityVal = document.getElementById('ctrl-gravity-val');
const ctrlWind     = document.getElementById('ctrl-wind');
const ctrlWindVal  = document.getElementById('ctrl-wind-val');
const ctrlRepulseRow = document.getElementById('ctrl-repulse-row');
const repulseBtns  = document.querySelectorAll('.repulse-btn');
const sandTypeBtns = document.querySelectorAll('#ctrl-sand-types .sub-toggle');
const sliceMatBtns = document.querySelectorAll('#ctrl-slice-materials .sub-toggle');
const inkOptionBtns = document.querySelectorAll('#ctrl-ink-options .sub-toggle');

// ══════════════════════════════════════════════════════
//  PANNEAU DE CONTRÔLE
// ══════════════════════════════════════════════════════
let ctrlOpen = false;

ctrlToggle.addEventListener('click', () => {
  ctrlOpen = !ctrlOpen;
  ctrlPanel.classList.toggle('open', ctrlOpen);
  ctrlToggle.classList.toggle('open', ctrlOpen);
});

ctrlForce.addEventListener('input', () => {
  ctrlForceVal.textContent = ctrlForce.value;
});

ctrlDensity.addEventListener('input', () => {
  ctrlDensityVal.textContent = ctrlDensity.value;
});

repulseBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    repulseBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    magnetRepulse = btn.dataset.val === 'repulse';
  });
});

ctrlGravity.addEventListener('input', () => {
  ctrlGravityVal.textContent = ctrlGravity.value;
  gravityValue = parseInt(ctrlGravity.value, 10);
});

ctrlWind.addEventListener('input', () => {
  ctrlWindVal.textContent = ctrlWind.value;
  windValue = parseInt(ctrlWind.value, 10);
});

sandTypeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    sandTypeBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    sandType = btn.dataset.val;
  });
});

sliceMatBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    sliceMatBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    sliceMaterial = btn.dataset.val;
  });
});

inkOptionBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    inkOptionBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    inkStyle = btn.dataset.val;
  });
});

function updateCtrlPanel() {
  // Force slider : pertinent pour magnet, glow, ink, clean, slice, galaxy
  const hasForce = ['magnet', 'glow', 'ink', 'clean', 'slice', 'galaxy'].includes(mode);
  document.getElementById('ctrl-force-row').style.display = hasForce ? '' : 'none';

  // Density : modes qui utilisent du grain / végétation / croissance / galaxie
  const hasDensity = ['sand', 'ink', 'clean', 'slice', 'frost', 'garden', 'galaxy'].includes(mode);
  document.getElementById('ctrl-density-row').style.display = hasDensity ? '' : 'none';

  // Gravité : sand, slice, ink, frost, garden, galaxy
  const hasGravity = ['sand', 'slice', 'ink', 'frost', 'garden', 'galaxy'].includes(mode);
  document.getElementById('ctrl-gravity-row').style.display = hasGravity ? '' : 'none';

  // Vent : seulement sand
  document.getElementById('ctrl-wind-row').style.display = mode === 'sand' ? '' : 'none';

  // Sable type
  document.getElementById('ctrl-sand-type-row').style.display = mode === 'sand' ? '' : 'none';

  // Tranche matière
  document.getElementById('ctrl-slice-mat-row').style.display = mode === 'slice' ? '' : 'none';

  // Ink style
  document.getElementById('ctrl-ink-row').style.display = mode === 'ink' ? '' : 'none';

  // Repulse : magnet seulement
  ctrlRepulseRow.style.display = mode === 'magnet' ? '' : 'none';

  // Couleur du slider thumb selon le mode courant
  app.style.setProperty('--current-color', MODES[mode].color);
}

// ══════════════════════════════════════════════════════
//  MOTEUR AUDIO (Web Audio API)
// ══════════════════════════════════════════════════════
let audioCtx = null;

function getAudio() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playTone(freq, type = 'sine', dur = 0.15, vol = 0.07) {
  try {
    const c = getAudio();
    const o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0, c.currentTime);
    g.gain.linearRampToValueAtTime(vol, c.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.start(); o.stop(c.currentTime + dur + 0.05);
  } catch (_) {}
}

function playNoise(dur = 0.06, freq = 800, vol = 0.035) {
  try {
    const c = getAudio();
    const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(), g = c.createGain();
    const f = c.createBiquadFilter();
    f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 0.7;
    src.buffer = buf; src.connect(f); f.connect(g); g.connect(c.destination);
    g.gain.setValueAtTime(vol, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    src.start(); src.stop(c.currentTime + dur + 0.05);
  } catch (_) {}
}

// ══════════════════════════════════════════════════════
//  ÉTAT GLOBAL.
// ══════════════════════════════════════════════════════
const SAND_TYPES = {
  desert: { hue: 35,  sat: 62, light: 45 },
  volcano:{ hue: 12,  sat: 78, light: 51 },
  sea:    { hue: 194, sat: 65, light: 58 },
  ice:    { hue: 205, sat: 48, light: 72 },
};

const SLICE_MATERIALS = {
  glass: { hue: 200, fast: 1.3, friction: 0.95, glow: 0.9, alpha: 0.9 },
  ice:   { hue: 185, fast: 0.9, friction: 0.92, glow: 0.7, alpha: 0.75 },
  slick: { hue: 280, fast: 1.5, friction: 0.985, glow: 0.5, alpha: 0.8 },
  slow:  { hue: 20,  fast: 0.55, friction: 0.87, glow: 0.4, alpha: 0.65 },
};

const INK_STYLES = ['kaleido', 'soft'];

let mode     = 'sand';
let touching = false;
let lastX = 0, lastY = 0;
let frame = 0;
let sandType = 'desert';
let sliceMaterial = 'glass';
let inkStyle = 'kaleido';
let gravityValue = 5;
let windValue = 5;

// Mode Sand
let sandGrid = null, sandCols = 0, sandRows = 0;

// Mode Glow
let glowTrails = [];   // { x1, y1, x2, y2, life, hue }

// Mode Magnet
let magnets = [];      // { x, y, vx, vy, r, hue }
let magnetRepulse = false;

// Mode Slice
let sliceShards = [];  // { x, y, vx, vy, life, r, rot, rv, hue }
let sliceTrails = [];  // { x1, y1, x2, y2, life }

// Mode Clean
let cleanCtx    = null;
let cleanCanvas = null;
let cleanDirty  = false;
let sparkles    = [];  // { x, y, vx, vy, life, r }

// Mode Ink
let inkCanvas = null;
let inkCtx    = null;
let inkDrops  = [];   // { x, y, vx, vy, life, r, hue, alpha }
let inkBlobs  = [];   // { cx, cy, r, hue, alpha } — taches permanentes sur inkCanvas
let inkSwirls = [];   // { x, y, vx, vy, life, r, hue, alpha }

// Mode Frost
let frostGrid = null;
let frostCols = 0, frostRows = 0;
let frostWalkers = [];

// Mode Garden
let gardenPlants = [];

// Mode Galaxy
let galaxyStars = [];    // { x, y, vx, vy, r, hue, bright }
let galaxyDust = [];     // { x, y, vx, vy, life, r, hue }
let galaxyTrails = [];   // { x, y, r, hue, life }
let audioAnalyser = null;
let audioDataArray = null;
let audioEnabled = false;
let micStream = null;

// ══════════════════════════════════════════════════════
//  REDIMENSIONNEMENT
// ══════════════════════════════════════════════════════
function resize() {
  canvas.width  = wrap.clientWidth;
  canvas.height = wrap.clientHeight;
  initMode();
}
window.addEventListener('resize', resize);
setTimeout(resize, 0);

// ══════════════════════════════════════════════════════
//  INITIALISATION DU MODE
// ══════════════════════════════════════════════════════
function initMode() {
  glowTrails  = []; magnets    = [];
  sliceShards = []; sliceTrails = [];
  sparkles    = []; inkDrops   = []; inkBlobs = [];
  inkSwirls   = []; gardenPlants = []; galaxyStars = []; galaxyDust = []; galaxyTrails = [];
  sandGrid    = null; magnetRepulse = false;

  if (mode === 'sand') {
    sandCols = Math.ceil(canvas.width / 4);
    sandRows = Math.ceil(canvas.height / 4);
    sandGrid = new Uint16Array(sandCols * sandRows);
    gravityValue = parseInt(ctrlGravity.value, 10);
    windValue = parseInt(ctrlWind.value, 10);
  }

  if (mode === 'magnet') {
    const count = 50 + Math.round(parseInt(ctrlDensity.value) * 8); // 58–130
    for (let i = 0; i < count; i++) {
      magnets.push({
        x:   Math.random() * canvas.width,
        y:   Math.random() * canvas.height,
        vx:  (Math.random() - .5) * .6,
        vy:  (Math.random() - .5) * .6,
        r:   2 + Math.random() * 3.5,
        hue: Math.random() > 0.5 ? 270 : 220,
      });
    }
    // reset repulse UI
    repulseBtns.forEach(b => b.classList.toggle('active', b.dataset.val === 'attract'));
    magnetRepulse = false;
  }

  if (mode === 'clean') {
    cleanDirty  = false;
    cleanCanvas = document.createElement('canvas');
    cleanCanvas.width  = canvas.width;
    cleanCanvas.height = canvas.height;
    cleanCtx = cleanCanvas.getContext('2d');
    buildDirty();
  }

  if (mode === 'ink') {
    inkCanvas = document.createElement('canvas');
    inkCanvas.width  = canvas.width;
    inkCanvas.height = canvas.height;
    inkCtx = inkCanvas.getContext('2d');
    // fond neutre légèrement texturé
    inkCtx.fillStyle = '#f5f0ea';
    inkCtx.fillRect(0, 0, canvas.width, canvas.height);
    addPaperTexture();
    inkSwirls = [];
    gravityValue = parseInt(ctrlGravity.value, 10);
  }

  if (mode === 'frost') {
    frostCols = Math.ceil(canvas.width / 3);
    frostRows = Math.ceil(canvas.height / 3);
    frostGrid = new Uint8Array(frostCols * frostRows);
    frostWalkers = [];
    const center = Math.floor(frostRows / 2) * frostCols + Math.floor(frostCols / 2);
    frostGrid[center] = 1;
    for (let i = 0; i < 160; i++) {
      frostWalkers.push({ x: Math.floor(Math.random() * frostCols), y: Math.floor(Math.random() * frostRows) });
    }
  }

  if (mode === 'garden') {
    gardenPlants = [];
    gravityValue = parseInt(ctrlGravity.value, 10);
  }

  if (mode === 'galaxy') {
    galaxyStars = [];
    galaxyDust = [];
    galaxyTrails = [];
    const count = 120 + Math.round(parseInt(ctrlDensity.value) * 15);
    for (let i = 0; i < count; i++) {
      galaxyStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        r: 0.5 + Math.random() * 1.8,
        hue: Math.random() * 360,
        bright: 0.4 + Math.random() * 0.6,
      });
    }
  }

  updateCtrlPanel();
}

function buildDirty() {
  const w = canvas.width, h = canvas.height;
  cleanCtx.clearRect(0, 0, w, h);
  const count = 1000 + parseInt(ctrlDensity.value) * 200;
  for (let i = 0; i < count; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = 2 + Math.random() * 28;
    const l = 10 + Math.random() * 30;
    cleanCtx.beginPath();
    cleanCtx.arc(x, y, r, 0, Math.PI * 2);
    cleanCtx.fillStyle = `rgba(${l},${l + 5},${l},${0.3 + Math.random() * 0.5})`;
    cleanCtx.fill();
  }
  cleanDirty = true;
}

function addPaperTexture() {
  // Grain de papier
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const a = Math.random() * 0.06;
    inkCtx.fillStyle = `rgba(180,160,120,${a})`;
    inkCtx.fillRect(x, y, 1, 1);
  }
}

// ══════════════════════════════════════════════════════
//  SPAWN — crée des effets à la position du doigt/curseur
// ══════════════════════════════════════════════════════
function spawn(x, y) {
  const cfg     = MODES[mode];
  const force   = parseInt(ctrlForce.value);    // 1–10
  const density = parseInt(ctrlDensity.value);  // 1–10

  if (mode === 'sand') {
    const col = Math.floor(x / 4), row = Math.floor(y / 4);
    const R = 2 + Math.round(density / 2.5); // rayon 2–6
    const typeIndex = Object.keys(SAND_TYPES).indexOf(sandType);
    for (let dy = -R; dy <= R; dy++) {
      for (let dx = -R; dx <= R; dx++) {
        if (dx * dx + dy * dy > R * R * 1.2) continue;
        const c = col + dx, r = row + dy;
        if (c >= 0 && c < sandCols && r >= 0 && r < sandRows) {
          const idx = r * sandCols + c;
          if (!sandGrid[idx]) {
            sandGrid[idx] = (typeIndex << 8) | (90 + Math.floor(Math.random() * 145));
          }
        }
      }
    }
    if (Math.random() < 0.3) playNoise(0.05, 380 + Math.random() * 320, 0.028);
  }

  if (mode === 'glow') {
    if (lastX || lastY) {
      glowTrails.push({ x1: lastX, y1: lastY, x2: x, y2: y, life: 1, hue: (frame * 1.8) % 360 });
      if (glowTrails.length > 300) glowTrails.shift();
      if (Math.random() < 0.2) playTone(200 + Math.random() * 700, 'sine', 0.1, 0.04);
    }
  }

  if (mode === 'magnet') {
    if (Math.random() < 0.05) playTone(250 + Math.random() * 300, 'triangle', 0.07, 0.035);
  }

  if (mode === 'slice') {
    if (lastX || lastY) {
      sliceTrails.push({ x1: lastX, y1: lastY, x2: x, y2: y, life: 1 });
      const props = SLICE_MATERIALS[sliceMaterial];
      const count = 5 + Math.round(density * props.fast);
      for (let i = 0; i < count; i++) {
        const a = Math.random() * Math.PI * 2;
        const spd = (1.2 + Math.random() * 3.8) * props.fast;
        sliceShards.push({
          x, y,
          vx:   Math.cos(a) * spd,
          vy:   Math.sin(a) * spd - 1.2 * props.fast,
          life: 0.65 + Math.random() * 0.35,
          r:    2 + Math.random() * 10,
          rot:  Math.random() * Math.PI * 2,
          rv:   (Math.random() - .5) * 0.2,
          hue:  props.hue,
          friction: props.friction,
          glow: props.glow,
          alpha: props.alpha,
          material: sliceMaterial,
        });
      }
      if (Math.random() < 0.5) playTone(580 + Math.random() * 620, 'sawtooth', 0.05, 0.055);
    }
  }

  if (mode === 'clean') {
    if (cleanCtx && cleanDirty) {
      const radius = 30 + force * 3;
      cleanCtx.save();
      cleanCtx.globalCompositeOperation = 'destination-out';
      const g = cleanCtx.createRadialGradient(x, y, 0, x, y, radius);
      g.addColorStop(0,   'rgba(0,0,0,1)');
      g.addColorStop(0.6, 'rgba(0,0,0,0.75)');
      g.addColorStop(1,   'rgba(0,0,0,0)');
      cleanCtx.fillStyle = g;
      cleanCtx.beginPath(); cleanCtx.arc(x, y, radius, 0, Math.PI * 2); cleanCtx.fill();
      cleanCtx.restore();
    }
    const sparkCount = 3 + Math.round(density * 0.5);
    for (let i = 0; i < sparkCount; i++) {
      sparkles.push({
        x:    x + (Math.random() - .5) * 35,
        y:    y + (Math.random() - .5) * 35,
        vx:   (Math.random() - .5) * 1.2,
        vy:  -0.8 - Math.random() * 2,
        life: 0.5 + Math.random() * 0.5,
        r:    0.8 + Math.random() * 2,
      });
    }
    if (Math.random() < 0.18) playTone(700 + Math.random() * 300, 'sine', 0.07, 0.03);
  }

  if (mode === 'ink') {
    spawnInk(x, y, force, density);
  }

  if (mode === 'frost') {
    const cx = Math.floor(x / 3); const cy = Math.floor(y / 3);
    if (cx >= 0 && cx < frostCols && cy >= 0 && cy < frostRows) {
      frostGrid[cy * frostCols + cx] = 1;
      for (let i = 0; i < 8; i++) {
        frostWalkers.push({ x: Math.min(frostCols - 1, Math.max(0, cx + Math.floor(Math.random() * 7) - 3)), y: Math.min(frostRows - 1, Math.max(0, cy + Math.floor(Math.random() * 7) - 3)) });
      }
    }
    if (Math.random() < 0.25) playNoise(0.04, 520 + Math.random() * 180, 0.03);
  }

  if (mode === 'garden') {
    gardenPlants.push({
      x, y,
      age: 0,
      tips: [{ x, y, angle: -Math.PI / 2, depth: 0 }],
      stems: [],
    });
    if (Math.random() < 0.4) playTone(280 + Math.random() * 240, 'triangle', 0.08, 0.03);
  }

  if (mode === 'galaxy') {
    for (let i = 0; i < 5; i++) {
      galaxyTrails.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        r: 2 + Math.random() * 4,
        hue: (frame * 2 + Math.random() * 60) % 360,
        life: 1,
      });
    }
    if (Math.random() < 0.3) playTone(200 + Math.random() * 400, 'sine', 0.12, 0.03);
  }

  spawnRipple(x, y, cfg.color);
}

// ── Ink spawn ─────────────────────────────────────────
function spawnInk(x, y, force, density) {
  const hue = (frame * 0.8 + 260) % 360; // violet → magenta cycle lent
  const dropCount = 6 + Math.round(density * 1.5);

  // Tache principale persistante sur inkCanvas
  if (inkCtx) {
    const r = 8 + force * 2.5;
    // Splat principal
    inkCtx.save();
    inkCtx.globalAlpha = 0.45 + Math.random() * 0.3;
    inkCtx.fillStyle = `hsl(${hue},70%,28%)`;
    inkCtx.beginPath();
    inkCtx.arc(x, y, r, 0, Math.PI * 2);
    inkCtx.fill();

    // Petites éclaboussures autour
    for (let i = 0; i < 5 + density; i++) {
      const a  = Math.random() * Math.PI * 2;
      const d  = r * (0.5 + Math.random() * 1.5);
      const sr = 1.5 + Math.random() * (force * 0.8);
      inkCtx.globalAlpha = 0.25 + Math.random() * 0.35;
      inkCtx.beginPath();
      inkCtx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, sr, 0, Math.PI * 2);
      inkCtx.fill();
    }
    inkCtx.restore();

    // Filament depuis le dernier point
    if (lastX || lastY) {
      inkCtx.save();
      inkCtx.globalAlpha = 0.28 + Math.random() * 0.25;
      inkCtx.strokeStyle = `hsl(${hue},75%,22%)`;
      inkCtx.lineWidth = 0.8 + force * 0.5;
      inkCtx.lineCap = 'round';
      inkCtx.beginPath();
      inkCtx.moveTo(lastX, lastY);
      // Courbe de Bezier légèrement aléatoire
      const mx = (lastX + x) / 2 + (Math.random() - .5) * 12;
      const my = (lastY + y) / 2 + (Math.random() - .5) * 12;
      inkCtx.quadraticCurveTo(mx, my, x, y);
      inkCtx.stroke();
      inkCtx.restore();
    }
  }

  // Gouttelettes volantes (animation)
  for (let i = 0; i < dropCount; i++) {
    const a   = Math.random() * Math.PI * 2;
    const spd = 0.5 + Math.random() * (force * 0.6);
    inkDrops.push({
      x, y,
      vx:   Math.cos(a) * spd,
      vy:   Math.sin(a) * spd - 1 - Math.random() * force * 0.2,
      life: 0.5 + Math.random() * 0.5,
      r:    1 + Math.random() * (2 + force * 0.3),
      hue,
      alpha: 0.6 + Math.random() * 0.4,
    });
  }

  if (inkStyle === 'kaleido') {
    for (let i = 0; i < 4; i++) {
      const a  = Math.random() * Math.PI * 2;
      const sp = 1 + Math.random() * 1.5;
      inkSwirls.push({
        x: x + Math.cos(a) * 8,
        y: y + Math.sin(a) * 8,
        vx: Math.cos(a) * sp * 0.3,
        vy: Math.sin(a) * sp * 0.3,
        life: 0.4 + Math.random() * 0.4,
        r: 1 + Math.random() * 3,
        hue,
        alpha: 0.25 + Math.random() * 0.25,
      });
    }
  }

  if (Math.random() < 0.25)
    playTone(180 + Math.random() * 200, 'sine', 0.12, 0.035);
}

function spawnRipple(x, y, color) {
  const el = document.createElement('div');
  el.className = 'ripple';
  el.style.left       = x + 'px';
  el.style.top        = y + 'px';
  el.style.background = color;
  el.style.boxShadow  = `0 0 14px ${color}`;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

// ══════════════════════════════════════════════════════
//  BOUCLE DE RENDU
// ══════════════════════════════════════════════════════
function render() {
  requestAnimationFrame(render);
  frame++;
  const W = canvas.width, H = canvas.height;
  const cfg = MODES[mode];

  if      (mode === 'sand')   renderSand(W, H, cfg);
  else if (mode === 'glow')   renderGlow(W, H, cfg);
  else if (mode === 'magnet') renderMagnet(W, H, cfg);
  else if (mode === 'slice')  renderSlice(W, H, cfg);
  else if (mode === 'clean')  renderClean(W, H, cfg);
  else if (mode === 'frost')  renderFrost(W, H, cfg);
  else if (mode === 'garden') renderGarden(W, H, cfg);
  else if (mode === 'ink')    renderInk(W, H, cfg);
  else if (mode === 'galaxy') renderGalaxy(W, H, cfg);
  const wind = (parseInt(ctrlWind.value, 10) - 5) * 0.16 + Math.sin(frame * 0.024) * 0.35;
  const weight = gravity / 10;

  for (let r = sandRows - 2; r >= 0; r--) {
    for (let c = 0; c < sandCols; c++) {
      const i     = r * sandCols + c;
      if (!sandGrid[i]) continue;
      const below = (r + 1) * sandCols + c;
      const bl    = (r + 1) * sandCols + (c - 1);
      const br    = (r + 1) * sandCols + (c + 1);
      const left  = r * sandCols + (c - 1);
      const right = r * sandCols + (c + 1);
      const windBias = wind > 0 ? 0.3 + wind * 0.2 : 0.2;
      const spin = Math.random();

      if (r + 1 < sandRows && !sandGrid[below] && Math.random() < 0.4 + weight * 0.45) {
        sandGrid[below] = sandGrid[i]; sandGrid[i] = 0;
      } else if (c > 0 && r + 1 < sandRows && !sandGrid[bl] && Math.random() < 0.26 + weight * 0.35) {
        sandGrid[bl] = sandGrid[i]; sandGrid[i] = 0;
      } else if (c < sandCols - 1 && r + 1 < sandRows && !sandGrid[br] && Math.random() < 0.26 + weight * 0.35) {
        sandGrid[br] = sandGrid[i]; sandGrid[i] = 0;
      } else if (wind > 0.2 && c < sandCols - 1 && !sandGrid[right] && spin < windBias) {
        sandGrid[right] = sandGrid[i]; sandGrid[i] = 0;
      } else if (wind < -0.2 && c > 0 && !sandGrid[left] && spin < windBias) {
        sandGrid[left] = sandGrid[i]; sandGrid[i] = 0;
      }
    }
  }

  const keys = Object.keys(SAND_TYPES);
  for (let r = 0; r < sandRows; r++) {
    for (let c = 0; c < sandCols; c++) {
      const v = sandGrid[r * sandCols + c];
      if (!v) continue;
      const typeIndex = v >> 8;
      const brightness = v & 255;
      const type = SAND_TYPES[keys[typeIndex] || sandType];
      const t = brightness / 255;
      const hue = type.hue + (typeIndex === 1 ? Math.sin(frame * 0.01) * 4 : 0);
      const sat = type.sat + t * 12;
      const light = type.light + t * 18;
      ctx.fillStyle = `hsl(${hue},${sat}%,${light}%)`;
      ctx.fillRect(c * 4, r * 4, 3.5, 3.5);
    }
  }
}

// ── Rendu Glow ────────────────────────────────────────
function renderGlow(W, H, cfg) {
  ctx.fillStyle = 'rgba(6,11,20,0.14)';
  ctx.fillRect(0, 0, W, H);

  const lineW = 1 + parseInt(ctrlForce.value) * 0.35;

  for (let i = glowTrails.length - 1; i >= 0; i--) {
    const t = glowTrails[i];
    t.life -= 0.010;
    if (t.life <= 0) { glowTrails.splice(i, 1); continue; }
    ctx.save();
    ctx.globalAlpha  = t.life * 0.95;
    ctx.shadowBlur   = 20 * t.life;
    ctx.shadowColor  = `hsl(${t.hue},100%,65%)`;
    ctx.strokeStyle  = `hsl(${t.hue},100%,65%)`;
    ctx.lineWidth    = lineW * t.life;
    ctx.lineCap      = 'round';
    ctx.beginPath(); ctx.moveTo(t.x1, t.y1); ctx.lineTo(t.x2, t.y2); ctx.stroke();
    ctx.restore();
  }
}

// ── Rendu Magnet ──────────────────────────────────────
function renderMagnet(W, H, cfg) {
  ctx.fillStyle = 'rgba(11,9,20,0.2)';
  ctx.fillRect(0, 0, W, H);

  const forceScale = parseInt(ctrlForce.value) * 0.6; // 0.6–6

  magnets.forEach(p => {
    if (touching) {
      const dx = lastX - p.x, dy = lastY - p.y;
      const d  = Math.sqrt(dx * dx + dy * dy) || 1;
      // Force proportionnelle au slider, diminue avec la distance
      const force = Math.min(8, (280 * forceScale) / (d * d * 0.18 + 1));
      const sign  = magnetRepulse ? -1 : 1;
      p.vx += sign * dx / d * force * 0.04;
      p.vy += sign * dy / d * force * 0.04;
    }
    p.vx += (Math.random() - .5) * 0.04;
    p.vy += (Math.random() - .5) * 0.04;
    p.vx *= 0.93; p.vy *= 0.93;
    p.x  += p.vx; p.y  += p.vy;
    if (p.x < 0)  { p.x = 0;  p.vx *= -.6; }
    if (p.x > W)  { p.x = W;  p.vx *= -.6; }
    if (p.y < 0)  { p.y = 0;  p.vy *= -.6; }
    if (p.y > H)  { p.y = H;  p.vy *= -.6; }
  });

  ctx.save();
  for (let i = 0; i < magnets.length; i++) {
    for (let j = i + 1; j < magnets.length; j++) {
      const a = magnets[i], b = magnets[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 75) {
        ctx.globalAlpha = (1 - d / 75) * 0.35;
        ctx.strokeStyle = d < 40 ? cfg.accent : cfg.color;
        ctx.lineWidth   = 0.8;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
  }
  ctx.restore();

  magnets.forEach(p => {
    ctx.save();
    ctx.shadowBlur  = 14;
    ctx.shadowColor = `hsl(${p.hue},80%,70%)`;
    ctx.fillStyle   = `hsl(${p.hue},75%,65%)`;
    ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  });
}

// ── Rendu Slice ───────────────────────────────────────
function renderSlice(W, H, cfg) {
  const mat = SLICE_MATERIALS[sliceMaterial] || SLICE_MATERIALS.glass;
  ctx.fillStyle = `rgba(8,8,8,${0.18 + (mat.alpha * 0.08)})`;
  ctx.fillRect(0, 0, W, H);

  for (let i = sliceTrails.length - 1; i >= 0; i--) {
    const t = sliceTrails[i];
    t.life -= 0.028 + (mat.fast * 0.002);
    if (t.life <= 0) { sliceTrails.splice(i, 1); continue; }
    ctx.save();
    ctx.globalAlpha = t.life * 0.8;
    ctx.strokeStyle = `hsla(${mat.hue},100%,70%,${0.6 + t.life * 0.3})`;
    ctx.lineWidth   = 1.5 * t.life + (sliceMaterial === 'slow' ? 1.2 : 0);
    ctx.shadowBlur  = 10 * mat.glow; ctx.shadowColor = `hsla(${mat.hue},100%,80%,0.45)`;
    ctx.lineCap     = 'round';
    ctx.beginPath(); ctx.moveTo(t.x1, t.y1); ctx.lineTo(t.x2, t.y2); ctx.stroke();
    ctx.restore();
  }

  for (let i = sliceShards.length - 1; i >= 0; i--) {
    const s = sliceShards[i];
    s.vy += 0.08 + (sliceMaterial === 'slow' ? 0.05 : 0.12);
    s.vx *= s.friction;
    s.vy *= s.friction;
    s.x  += s.vx;
    s.y  += s.vy;
    s.life -= 0.015;
    s.rot += s.rv;
    if (s.life <= 0 || s.y > H + 60) { sliceShards.splice(i, 1); continue; }

    ctx.save();
    ctx.globalAlpha = s.life * s.alpha;
    ctx.translate(s.x, s.y);
    ctx.rotate(s.rot);
    ctx.shadowBlur  = 8 * s.glow;
    ctx.shadowColor = `hsla(${s.hue},100%,85%,${0.35 * s.glow})`;
    ctx.fillStyle   = `hsla(${s.hue},95%,${sliceMaterial === 'ice' ? 82 : 62}%,${0.85 * s.alpha})`;
    ctx.fillRect(-s.r, -s.r * 0.35, s.r * 2, s.r * 0.7);
    if (sliceMaterial === 'glass') {
      ctx.strokeStyle = `rgba(255,255,255,${0.25 * s.life})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(-s.r, -s.r * 0.35, s.r * 2, s.r * 0.7);
    }
    ctx.restore();
  }
}

// ── Rendu Clean ───────────────────────────────────────
function renderClean(W, H, cfg) {
  ctx.clearRect(0, 0, W, H);

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, 'hsl(165,60%,8%)');
  bg.addColorStop(1, 'hsl(190,50%,6%)');
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 8; i++) {
    const y = H * .15 + i * (H * .7 / 7);
    ctx.save();
    ctx.globalAlpha = 0.04 + i * 0.004;
    ctx.strokeStyle = cfg.color; ctx.lineWidth = .5;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    ctx.restore();
  }

  if (cleanCanvas && cleanDirty) ctx.drawImage(cleanCanvas, 0, 0);

  if (touching) {
    const r = 30 + parseInt(ctrlForce.value) * 3;
    const g = ctx.createRadialGradient(lastX, lastY, 0, lastX, lastY, r);
    g.addColorStop(0, 'rgba(80,239,176,0.12)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(lastX, lastY, r, 0, Math.PI * 2); ctx.fill();
  }

  for (let i = sparkles.length - 1; i >= 0; i--) {
    const s = sparkles[i];
    s.vy -= 0.04; s.vx *= 0.97; s.vy *= 0.97;
    s.x  += s.vx; s.y  += s.vy;
    s.life -= 0.022;
    if (s.life <= 0) { sparkles.splice(i, 1); continue; }
    ctx.save();
    ctx.globalAlpha = s.life * 0.85;
    ctx.fillStyle   = cfg.color;
    ctx.shadowBlur  = 10; ctx.shadowColor = cfg.color;
    ctx.beginPath(); ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

// ── Rendu Ink ─────────────────────────────────────────
function renderInk(W, H, cfg) {
  ctx.clearRect(0, 0, W, H);

  if (inkCanvas) ctx.drawImage(inkCanvas, 0, 0);

  const breath = Math.sin(frame * 0.018) * 0.06;
  ctx.save();
  ctx.fillStyle = `rgba(10, 4, 18, ${0.06 + breath})`;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  for (let i = inkDrops.length - 1; i >= 0; i--) {
    const d = inkDrops[i];
    d.vx += (Math.random() - .5) * 0.06;
    d.vy += 0.04 + breath * 0.15;
    d.vx *= 0.986;
    d.vy *= 0.986;
    d.x  += d.vx;
    d.y  += d.vy;
    d.life -= 0.022;

    if (d.life <= 0) {
      if (inkCtx && d.x > 0 && d.x < W && d.y > 0 && d.y < H) {
        inkCtx.save();
        inkCtx.globalAlpha = d.alpha * 0.55;
        inkCtx.fillStyle   = `hsla(${d.hue},65%,22%,${0.9 * d.alpha})`;
        inkCtx.beginPath();
        inkCtx.arc(d.x, d.y, d.r * 1.4, 0, Math.PI * 2);
        inkCtx.fill();
        inkCtx.restore();
      }
      inkDrops.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = d.life * d.alpha;
    ctx.fillStyle   = `hsla(${d.hue},72%,28%,${0.9 * d.alpha})`;
    ctx.shadowBlur  = 5;
    ctx.shadowColor = `hsla(${d.hue},64%,38%,${0.24 * d.alpha})`;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r * d.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  inkSwirls = inkSwirls.filter(s => s.life > 0);
  for (let i = 0; i < inkSwirls.length; i++) {
    const s = inkSwirls[i];
    s.vx += Math.cos(s.y * 0.03) * 0.03;
    s.vy += Math.sin(s.x * 0.02) * 0.03;
    s.vx *= 0.98;
    s.vy *= 0.98;
    s.x += s.vx;
    s.y += s.vy;
    s.life -= 0.012;
    if (s.life <= 0) continue;
    ctx.save();
    ctx.globalAlpha = s.life * 0.35;
    ctx.fillStyle   = `hsla(${s.hue},85%,48%,${0.7 * s.life})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  if (inkStyle === 'kaleido' && inkCanvas) {
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.translate(W / 2, H / 2);
    ctx.scale(-1, 1);
    ctx.drawImage(inkCanvas, -W / 2, -H / 2, W, H);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.translate(W / 2, H / 2);
    ctx.scale(1, -1);
    ctx.drawImage(inkCanvas, -W / 2, -H / 2, W, H);
    ctx.restore();
    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.translate(W / 2, H / 2);
    ctx.rotate(Math.PI / 4);
    ctx.drawImage(inkCanvas, -W / 2, -H / 2, W, H);
    ctx.restore();
  }

  if (touching) {
    const r = 6 + parseInt(ctrlForce.value, 10) * 2;
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle   = cfg.color;
    ctx.beginPath(); ctx.arc(lastX, lastY, r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
}

function renderFrost(W, H, cfg) {
  ctx.fillStyle = '#05070e';
  ctx.fillRect(0, 0, W, H);
  if (!frostGrid) return;

  const neighbors = [
    {dx:-1,dy:0},{dx:1,dy:0},{dx:0,dy:-1},{dx:0,dy:1},
    {dx:-1,dy:-1},{dx:1,dy:-1},{dx:-1,dy:1},{dx:1,dy:1},
  ];

  for (let i = frostWalkers.length - 1; i >= 0; i--) {
    const w = frostWalkers[i];
    const idx = w.y * frostCols + w.x;
    let stuck = false;
    for (const n of neighbors) {
      const nx = w.x + n.dx, ny = w.y + n.dy;
      if (nx >= 0 && nx < frostCols && ny >= 0 && ny < frostRows) {
        if (frostGrid[ny * frostCols + nx]) { stuck = true; break; }
      }
    }
    if (stuck) {
      frostGrid[idx] = 1;
      frostWalkers.splice(i, 1);
      if (Math.random() < 0.28) {
        frostWalkers.push({ x: Math.min(frostCols - 1, Math.max(0, w.x + Math.floor(Math.random() * 7) - 3)), y: Math.min(frostRows - 1, Math.max(0, w.y + Math.floor(Math.random() * 7) - 3)) });
      }
      continue;
    }
    const move = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}][Math.floor(Math.random() * 4)];
    w.x = Math.min(frostCols - 1, Math.max(0, w.x + move.dx));
    w.y = Math.min(frostRows - 1, Math.max(0, w.y + move.dy));
  }

  // Respawn automatique si trop peu de walkers
  if (frostWalkers.length < 20) {
    for (let i = 0; i < 5; i++) {
      frostWalkers.push({ x: Math.floor(Math.random() * frostCols), y: Math.floor(Math.random() * frostRows) });
    }
  }

  for (let y = 0; y < frostRows; y++) {
    for (let x = 0; x < frostCols; x++) {
      if (!frostGrid[y * frostCols + x]) continue;
      const px = x * 3, py = y * 3;
      ctx.fillStyle = `rgba(164,232,255,${0.18 + Math.random() * 0.18})`;
      ctx.fillRect(px, py, 3, 3);
      ctx.strokeStyle = `rgba(210,245,255,0.14)`;
      ctx.lineWidth = 0.7;
      ctx.strokeRect(px, py, 3, 3);
    }
  }

  ctx.save();
  ctx.strokeStyle = 'rgba(180,230,255,0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(frame * 0.02 + i) * 16, y + Math.sin(frame * 0.03 + i) * 16);
    ctx.stroke();
  }
  ctx.restore();
}

function renderGalaxy(W, H, cfg) {
  ctx.fillStyle = '#020306';
  ctx.fillRect(0, 0, W, H);
  
  // Analyser l'audio pour les vibrations
  let audioIntensity = 0.5;
  if (audioAnalyser && audioDataArray) {
    audioAnalyser.getByteFrequencyData(audioDataArray);
    let sum = 0;
    for (let i = 0; i < 32; i++) sum += audioDataArray[i];
    audioIntensity = sum / 32 / 255;
  }
  
  // Gravité orbitale au centre
  const centerX = W / 2, centerY = H / 2;
  const force = parseInt(ctrlForce.value) * 0.5;
  const gravityMod = (parseInt(ctrlGravity.value) || 5) / 5; // 0.2 à 2
  
  galaxyStars.forEach(star => {
    const dx = centerX - star.x, dy = centerY - star.y;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    const gravityForce = (force * 0.08 / (d * d * 0.001)) * gravityMod;
    
    star.vx += dx / d * gravityForce * 0.03;
    star.vy += dy / d * gravityForce * 0.03;
    star.vx += (Math.random() - 0.5) * 0.05;
    star.vy += (Math.random() - 0.5) * 0.05;
    star.vx *= 0.98;
    star.vy *= 0.98;
    star.x += star.vx;
    star.y += star.vy;
    
    // Vibration audio
    star.r *= (0.98 + audioIntensity * 0.04);
    star.bright = Math.min(1, star.bright + audioIntensity * 0.1);
    
    if (star.x < 0) { star.x = 0; star.vx *= -0.5; }
    if (star.x > W) { star.x = W; star.vx *= -0.5; }
    if (star.y < 0) { star.y = 0; star.vy *= -0.5; }
    if (star.y > H) { star.y = H; star.vy *= -0.5; }
    
    ctx.save();
    ctx.globalAlpha = star.bright;
    ctx.fillStyle = `hsl(${star.hue},100%,${60 + star.bright * 30}%)`;
    ctx.shadowBlur = 8 * star.bright;
    ctx.shadowColor = `hsl(${star.hue},100%,70%)`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
  
  // Poussière cosmique
  if (touching) {
    const dustCount = 3 + Math.round(parseInt(ctrlDensity.value) * 0.5);
    for (let i = 0; i < dustCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 0.4 + Math.random() * 1.2;
      galaxyDust.push({
        x: lastX,
        y: lastY,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life: 1.5 + Math.random() * 1.5,
        r: 0.5 + Math.random() * 1.5,
        hue: (frame * 1.5 + Math.random() * 60) % 360,
      });
    }
  }
  
  for (let i = galaxyDust.length - 1; i >= 0; i--) {
    const dust = galaxyDust[i];
    dust.vy += 0.02;
    dust.vx *= 0.97;
    dust.vy *= 0.97;
    dust.x += dust.vx;
    dust.y += dust.vy;
    dust.life -= 0.015;
    
    if (dust.life <= 0) { galaxyDust.splice(i, 1); continue; }
    
    ctx.save();
    ctx.globalAlpha = dust.life * 0.6;
    ctx.fillStyle = `hsla(${dust.hue},100%,60%,0.7)`;
    ctx.shadowBlur = 4;
    ctx.shadowColor = `hsl(${dust.hue},100%,70%)`;
    ctx.beginPath();
    ctx.arc(dust.x, dust.y, dust.r * dust.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  
  // Traînées lumineuses
  for (let i = galaxyTrails.length - 1; i >= 0; i--) {
    const trail = galaxyTrails[i];
    trail.life -= 0.02;
    if (trail.life <= 0) { galaxyTrails.splice(i, 1); continue; }
    
    ctx.save();
    ctx.globalAlpha = trail.life * 0.4;
    ctx.fillStyle = `hsl(${trail.hue},100%,50%)`;
    ctx.beginPath();
    ctx.arc(trail.x, trail.y, trail.r * trail.life, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function renderGarden(W, H, cfg) {
  ctx.fillStyle = '#05110a';
  ctx.fillRect(0, 0, W, H);
  if (!gardenPlants.length) return;

  gardenPlants.forEach(plant => {
    plant.age += 1;
    const growth = Math.max(1, Math.round(parseInt(ctrlDensity.value, 10) * 0.18));
    for (let step = 0; step < growth; step++) {
      const nextTips = [];
      plant.tips.forEach(tip => {
        if (tip.depth > 8 || Math.random() < 0.06) return;
        const bend = (Math.random() - .5) * 0.4 * (11 - tip.depth) * 0.05;
        const angle = tip.angle + bend + (gravityValue - 5) * 0.02;
        const len = 8 + Math.random() * 6;
        const nx = tip.x + Math.cos(angle) * len;
        const ny = tip.y + Math.sin(angle) * len;
        plant.stems.push({ x1: tip.x, y1: tip.y, x2: nx, y2: ny, depth: tip.depth });
        if (Math.random() < 0.35 && tip.depth < 6) {
          nextTips.push({ x: nx, y: ny, angle: angle - 0.6 + Math.random() * 0.4, depth: tip.depth + 1 });
          nextTips.push({ x: nx, y: ny, angle: angle + 0.6 - Math.random() * 0.4, depth: tip.depth + 1 });
        } else {
          nextTips.push({ x: nx, y: ny, angle, depth: tip.depth + 1 });
        }
      });
      plant.tips = nextTips.slice(0, 12);
    }

    plant.stems.slice(-220).forEach(stem => {
      const hue = 125 + stem.depth * 5;
      ctx.strokeStyle = `hsla(${hue},80%,${34 - stem.depth * 2}%,0.95)`;
      ctx.lineWidth = 1.4 - stem.depth * 0.12;
      ctx.beginPath();
      ctx.moveTo(stem.x1, stem.y1);
      ctx.lineTo(stem.x2, stem.y2);
      ctx.stroke();
    });

    plant.tips.forEach(tip => {
      ctx.save();
      ctx.translate(tip.x, tip.y);
      ctx.rotate(tip.angle);
      ctx.fillStyle = `hsla(150,80%,${58 - tip.depth * 4}%,0.9)`;
      ctx.beginPath();
      ctx.ellipse(0, 0, 3.5 - tip.depth * 0.3, 1.8 - tip.depth * 0.15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  });
}

// ══════════════════════════════════════════════════════
//  GESTION DES ENTRÉES
// ══════════════════════════════════════════════════════
function getPos(e) {
  const r   = canvas.getBoundingClientRect();
  const src = e.touches ? e.touches[0] : e;
  return { x: src.clientX - r.left, y: src.clientY - r.top };
}

wrap.addEventListener('mousedown', e => {
  touching = true;
  const { x, y } = getPos(e); lastX = x; lastY = y;
  spawn(x, y);
  touchHint.style.opacity  = '0';
  activeHint.style.opacity = '1';
});
wrap.addEventListener('mousemove', e => {
  if (!touching) return;
  const { x, y } = getPos(e);
  spawn(x, y);
  lastX = x; lastY = y;
});
wrap.addEventListener('mouseup',    () => { touching = false; activeHint.style.opacity = '0'; });
wrap.addEventListener('mouseleave', () => { touching = false; activeHint.style.opacity = '0'; });

wrap.addEventListener('touchstart', e => {
  e.preventDefault(); touching = true;
  const { x, y } = getPos(e); lastX = x; lastY = y;
  spawn(x, y);
  touchHint.style.opacity  = '0';
  activeHint.style.opacity = '1';
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
}, { passive: false });
wrap.addEventListener('touchmove', e => {
  e.preventDefault();
  const { x, y } = getPos(e);
  spawn(x, y);
  lastX = x; lastY = y;
}, { passive: false });
wrap.addEventListener('touchend', () => {
  touching = false; lastX = 0; lastY = 0;
  activeHint.style.opacity = '0';
});

// ══════════════════════════════════════════════════════
//  EXPORT IMAGE & AUDIO
// ══════════════════════════════════════════════════════
const captureBtn = document.getElementById('capture-btn');
const audioToggle = document.getElementById('audio-toggle');

captureBtn.addEventListener('click', async () => {
  // Générer PNG HD
  const dataUrl = canvas.toDataURL('image/png');
  
  // Créer lien de téléchargement
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `FLOW-${mode}-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Feedback sonore
  playTone(800, 'sine', 0.1, 0.06);
  
  // Flash visuel
  captureBtn.style.transform = 'scale(0.85)';
  setTimeout(() => { captureBtn.style.transform = 'scale(1)'; }, 100);
});

// ── Réaction Audio ────────────────────────────────────
async function initAudio() {
  try {
    if (audioEnabled) {
      // Arrêter le stream audio
      if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
        micStream = null;
      }
      audioEnabled = false;
      audioToggle.style.opacity = '0.5';
      return;
    }
    
    // Demander accès au microphone
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioContext = getAudio();
    const source = audioContext.createMediaStreamSource(micStream);
    audioAnalyser = audioContext.createAnalyser();
    audioAnalyser.fftSize = 256;
    audioDataArray = new Uint8Array(audioAnalyser.frequencyBinCount);
    source.connect(audioAnalyser);
    audioEnabled = true;
    audioToggle.style.opacity = '1';
    playTone(400, 'sine', 0.1, 0.04);
  } catch (err) {
    console.log('Microphone non disponible:', err);
    audioToggle.style.opacity = '0.3';
  }
}

audioToggle.addEventListener('click', initAudio);

// ══════════════════════════════════════════════════════
//  CHANGEMENT DE MODE
// ══════════════════════════════════════════════════════
btns.forEach(btn => {
  btn.addEventListener('click', () => {
    const m = btn.dataset.mode;
    if (m === mode) return;
    const cfg = MODES[m];

    modeFlash.style.background = cfg.color;
    modeFlash.style.opacity    = '0.07';
    setTimeout(() => modeFlash.style.opacity = '0', 200);

    btns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    modeTitle.textContent    = cfg.title;
    appLabel.style.color     = cfg.color;
    modeTitle.style.color    = '#fff';
    wrap.style.borderColor   = cfg.border;
    wrap.style.boxShadow     = `0 0 55px ${cfg.color}15, inset 0 0 30px rgba(0,0,0,0.35)`;
    hintIcon.textContent     = cfg.icon;
    touchHint.style.color    = cfg.color;
    activeHint.textContent   = cfg.hint;
    app.style.background     = cfg.bg;
    app.style.setProperty('--current-color', cfg.color);

    mode     = m;
    touching = false; lastX = 0; lastY = 0;
    touchHint.style.opacity  = '1';
    activeHint.style.opacity = '0';
    
    // Afficher le bouton audio uniquement pour Galaxy
    audioToggle.style.display = m === 'galaxy' ? '' : 'none';
    if (m !== 'galaxy' && audioEnabled) {
      initAudio(); // Arrêter l'audio si on quitte Galaxy
    }
    
    initMode();

    const notes = {
      sand: 220,
      glow: 277,
      magnet: 330,
      slice: 392,
      clean: 440,
      frost: 345,
      garden: 280,
      ink: 523,
      galaxy: 264,
    };
    const freq = notes[m] || 320;
    playTone(freq * 2, 'sine', 0.18, 0.05);
  });
});

// ══════════════════════════════════════════════════════
//  PWA — INSTALL BANNER
// ══════════════════════════════════════════════════════
const INSTALL_KEY     = 'flow_pwa_dismissed';
const INSTALLED_KEY   = 'flow_pwa_installed';

let deferredPrompt = null;
const banner       = document.getElementById('install-banner');
const installBtn   = document.getElementById('install-btn');
const installClose = document.getElementById('install-close');

function hideBanner(permanent) {
  banner.classList.add('hiding');
  setTimeout(() => { banner.style.display = 'none'; }, 380);
  if (permanent) localStorage.setItem(INSTALL_KEY, '1');
}

// Écoute l'événement natif "beforeinstallprompt" (Chrome/Edge Android + desktop)
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;

  // Ne pas afficher si l'utilisateur a déjà fermé ou si déjà installée
  if (localStorage.getItem(INSTALL_KEY) || localStorage.getItem(INSTALLED_KEY)) return;

  // Afficher après un court délai
  setTimeout(() => { banner.style.display = ''; }, 2200);
});

// L'app vient d'être installée
window.addEventListener('appinstalled', () => {
  localStorage.setItem(INSTALLED_KEY, '1');
  hideBanner(false);
  deferredPrompt = null;
});

// Bouton "Installer"
installBtn.addEventListener('click', async () => {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (outcome === 'accepted') {
      localStorage.setItem(INSTALLED_KEY, '1');
      hideBanner(false);
    }
  } else {
    // iOS : pas de prompt natif — instruction manuelle
    installBtn.textContent = 'Partager → Écran d\'accueil';
    installBtn.style.fontSize = '8px';
    setTimeout(() => hideBanner(true), 4000);
  }
});

// Bouton fermer
installClose.addEventListener('click', () => hideBanner(true));

// Détecter si déjà lancée en mode standalone (PWA installée)
if (window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true) {
  localStorage.setItem(INSTALLED_KEY, '1');
}

// ══════════════════════════════════════════════════════
//  INITIALISATION
// ══════════════════════════════════════════════════════
const initCfg = MODES.sand;
wrap.style.borderColor  = initCfg.border;
wrap.style.boxShadow    = `0 0 55px ${initCfg.color}15, inset 0 0 30px rgba(0,0,0,0.35)`;
appLabel.style.color    = initCfg.color;
touchHint.style.color   = initCfg.color;
activeHint.textContent  = initCfg.hint;
app.style.background    = initCfg.bg;
app.style.setProperty('--current-color', initCfg.color);
updateCtrlPanel();

// Theme Switcher
// ══════════════════════════════════════════════════════
const themeToggle = document.getElementById('theme-toggle');
let currentTheme = localStorage.getItem('flow-theme') || 'dark';

function setTheme(theme) {
  app.setAttribute('data-theme', theme);
  currentTheme = theme;
  localStorage.setItem('flow-theme', theme);
  themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
}

themeToggle.addEventListener('click', () => {
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  setTheme(newTheme);
});

// Initialize theme
setTheme(currentTheme);

render();


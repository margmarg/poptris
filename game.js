(() => {
  "use strict";

  const COLS = 10;
  const ROWS = 20;
  const CELL = 32;

  const COLORS = {
    I: "#00d4ff",
    O: "#ffe600",
    T: "#9d4edd",
    S: "#b8ff00",
    Z: "#ff6b35",
    J: "#3b82f6",
    L: "#ff2d95",
  };

  /** 4 rotation states each; 1 = block */
  const SHAPES = {
    I: [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
      ],
      [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
      ],
    ],
    O: [
      [
        [1, 1],
        [1, 1],
      ],
    ],
    T: [
      [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 1, 0],
        [1, 1, 0],
        [0, 1, 0],
      ],
    ],
    S: [
      [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 0, 1],
      ],
      [
        [0, 0, 0],
        [0, 1, 1],
        [1, 1, 0],
      ],
      [
        [1, 0, 0],
        [1, 1, 0],
        [0, 1, 0],
      ],
    ],
    Z: [
      [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 0, 1],
        [0, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 0, 0],
        [1, 1, 0],
        [0, 1, 1],
      ],
      [
        [0, 1, 0],
        [1, 1, 0],
        [1, 0, 0],
      ],
    ],
    J: [
      [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 1],
        [0, 1, 0],
        [0, 1, 0],
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 1],
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0],
      ],
    ],
    L: [
      [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1],
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [1, 0, 0],
      ],
      [
        [1, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
      ],
    ],
  };

  const KEYS = ["I", "O", "T", "S", "Z", "J", "L"];

  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const nextCanvas = document.getElementById("next");
  const nextCtx = nextCanvas.getContext("2d");

  const elScore = document.getElementById("score");
  const elLevel = document.getElementById("level");
  const elLines = document.getElementById("lines");
  const overlay = document.getElementById("overlay");
  const overlayTitle = document.getElementById("overlay-title");
  const overlayMsg = document.getElementById("overlay-msg");
  const btnStart = document.getElementById("btn-start");

  const INK = "#0d0d12";
  const GRID_BG = "#1a1a24";

  let board = [];
  let piece = null;
  let nextKey = "T";
  let nextRot = 0;
  let score = 0;
  let lines = 0;
  let level = 1;
  let dropAcc = 0;
  let lastTs = 0;
  let paused = false;
  let gameOver = false;
  let running = false;
  let rafId = 0;
  let audioCtx = null;
  let masterGain = null;
  let musicGain = null;
  let sfxGain = null;
  let masterCompressor = null;
  let musicTimer = 0;
  let musicStep = 0;
  let audioEnabled = true;
  const AUDIO_MASTER_ON = 0.72;

  const MUSIC_BPM = 144;
  const MUSIC_BEAT_MS = 60000 / MUSIC_BPM;
  const TETRIS_THEME = [
    ["E5", 1], ["B4", 0.5], ["C5", 0.5], ["D5", 1], ["C5", 0.5], ["B4", 0.5], ["A4", 1],
    ["A4", 0.5], ["C5", 0.5], ["E5", 1], ["D5", 0.5], ["C5", 0.5], ["B4", 1],
    ["C5", 0.5], ["D5", 1], ["E5", 1], ["C5", 1], ["A4", 1], ["A4", 1.5],
    ["D5", 1], ["F5", 0.5], ["A5", 1], ["G5", 0.5], ["F5", 0.5], ["E5", 1],
    ["C5", 0.5], ["E5", 1], ["D5", 0.5], ["C5", 0.5], ["B4", 1],
    ["B4", 0.5], ["C5", 0.5], ["D5", 1], ["E5", 1], ["C5", 1], ["A4", 1], ["A4", 1.5],
  ];
  const NOTE_OFFSETS = {
    C: -9, "C#": -8, Db: -8,
    D: -7, "D#": -6, Eb: -6,
    E: -5,
    F: -4, "F#": -3, Gb: -3,
    G: -2, "G#": -1, Ab: -1,
    A: 0, "A#": 1, Bb: 1,
    B: 2,
  };

  function emptyBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  }

  function ensureAudio() {
    if (audioCtx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    audioCtx = new AudioCtx();
    masterGain = audioCtx.createGain();
    musicGain = audioCtx.createGain();
    sfxGain = audioCtx.createGain();
    masterCompressor = audioCtx.createDynamicsCompressor();
    masterCompressor.threshold.value = -16;
    masterCompressor.knee.value = 18;
    masterCompressor.ratio.value = 3;
    masterCompressor.attack.value = 0.004;
    masterCompressor.release.value = 0.18;
    masterGain.gain.value = AUDIO_MASTER_ON;
    musicGain.gain.value = 0.34;
    sfxGain.gain.value = 0.52;
    musicGain.connect(masterGain);
    sfxGain.connect(masterGain);
    masterGain.connect(masterCompressor);
    masterCompressor.connect(audioCtx.destination);
  }

  function noteToFreq(note) {
    const m = /^([A-G])([b#]?)(\d)$/.exec(note);
    if (!m) return 440;
    const key = m[1] + m[2];
    const octave = Number(m[3]);
    const semitones = NOTE_OFFSETS[key] + (octave - 4) * 12;
    return 440 * Math.pow(2, semitones / 12);
  }

  function playTone(targetGain, freq, durationSec, wave = "square", when = 0, gain = 0.12) {
    if (!audioEnabled || !audioCtx || !targetGain) return;
    const now = audioCtx.currentTime + when;
    const osc = audioCtx.createOscillator();
    const env = audioCtx.createGain();
    osc.type = wave;
    osc.frequency.setValueAtTime(freq, now);
    env.gain.setValueAtTime(0.0001, now);
    env.gain.exponentialRampToValueAtTime(gain, now + 0.01);
    env.gain.exponentialRampToValueAtTime(0.0001, now + durationSec);
    osc.connect(env);
    env.connect(targetGain);
    osc.start(now);
    osc.stop(now + durationSec + 0.02);
  }

  function startMusic() {
    ensureAudio();
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") audioCtx.resume();
    if (musicTimer) return;
    scheduleMusicStep();
  }

  function stopMusic() {
    if (musicTimer) {
      clearTimeout(musicTimer);
      musicTimer = 0;
    }
  }

  function scheduleMusicStep() {
    if (!running || paused || gameOver || !audioEnabled || !audioCtx) {
      musicTimer = 0;
      return;
    }
    const [note, beats] = TETRIS_THEME[musicStep];
    musicStep = (musicStep + 1) % TETRIS_THEME.length;
    const durationMs = beats * MUSIC_BEAT_MS;
    const durationSec = Math.max(0.05, (durationMs - 20) / 1000);
    playTone(musicGain, noteToFreq(note), durationSec, "triangle", 0, 0.09);
    musicTimer = window.setTimeout(scheduleMusicStep, durationMs);
  }

  function playMoveSfx() {
    ensureAudio();
    playTone(sfxGain, 540, 0.04, "square", 0, 0.05);
  }

  function playRotateSfx() {
    ensureAudio();
    playTone(sfxGain, 680, 0.05, "triangle", 0, 0.06);
  }

  function playDropSfx() {
    ensureAudio();
    playTone(sfxGain, 220, 0.09, "sawtooth", 0, 0.09);
  }

  function playLockSfx() {
    ensureAudio();
    playTone(sfxGain, 170, 0.06, "square", 0, 0.08);
  }

  function playLineClearSfx(count) {
    ensureAudio();
    const notes = count >= 4 ? [740, 880, 988, 1174] : [659, 784, 988];
    for (let i = 0; i < notes.length; i++) {
      playTone(sfxGain, notes[i], 0.08, "triangle", i * 0.05, 0.07);
    }
  }

  function playGameOverSfx() {
    ensureAudio();
    stopMusic();
    const notes = [392, 330, 262, 196];
    for (let i = 0; i < notes.length; i++) {
      playTone(sfxGain, notes[i], 0.14, "sawtooth", i * 0.11, 0.09);
    }
  }

  function setAudioEnabled(enabled) {
    audioEnabled = enabled;
    if (masterGain) {
      masterGain.gain.setValueAtTime(enabled ? AUDIO_MASTER_ON : 0.0001, audioCtx.currentTime);
    }
    if (!enabled) {
      stopMusic();
      return;
    }
    if (running && !paused && !gameOver) startMusic();
  }

  function getShape(key, rot) {
    const arr = SHAPES[key];
    const r = key === "O" ? 0 : rot % 4;
    return arr[r];
  }

  function pieceWidth(shape) {
    return shape[0].length;
  }

  function pieceHeight(shape) {
    return shape.length;
  }

  function collide(b, key, rot, px, py) {
    const shape = getShape(key, rot);
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (!shape[y][x]) continue;
        const bx = px + x;
        const by = py + y;
        if (bx < 0 || bx >= COLS || by >= ROWS) return true;
        if (by >= 0 && b[by][bx]) return true;
      }
    }
    return false;
  }

  function merge(b, key, rot, px, py) {
    const shape = getShape(key, rot);
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (!shape[y][x]) continue;
        const bx = px + x;
        const by = py + y;
        if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
          b[by][bx] = key;
        }
      }
    }
  }

  function clearLines(b) {
    let cleared = 0;
    for (let y = ROWS - 1; y >= 0; ) {
      if (b[y].every((c) => c !== 0)) {
        b.splice(y, 1);
        b.unshift(Array(COLS).fill(0));
        cleared++;
      } else {
        y--;
      }
    }
    return cleared;
  }

  function scoreForLines(n, lvl) {
    const table = { 1: 100, 2: 300, 3: 500, 4: 800 };
    return (table[n] || 0) * lvl;
  }

  function randomKey() {
    return KEYS[(Math.random() * KEYS.length) | 0];
  }

  function spawnPiece() {
    const key = nextKey;
    const rot = nextRot;
    nextKey = randomKey();
    nextRot = 0;
    const shape = getShape(key, rot);
    const w = pieceWidth(shape);
    const px = ((COLS - w) / 2) | 0;
    const py = -pieceHeight(shape);
    piece = { key, rot, x: px, y: py };
    if (collide(board, piece.key, piece.rot, piece.x, piece.y)) {
      gameOver = true;
      running = false;
      piece = null;
      playGameOverSfx();
      drawBoard();
      drawNext();
      showOverlay("Game over", "Press Start to play again");
    }
  }

  function tryRotate() {
    if (!piece || gameOver) return;
    const nextR = (piece.rot + 1) % 4;
    const kicks = [0, -1, 1, -2, 2];
    for (const k of kicks) {
      if (!collide(board, piece.key, nextR, piece.x + k, piece.y)) {
        piece.rot = nextR;
        piece.x += k;
        playRotateSfx();
        return true;
      }
    }
    return false;
  }

  function dropInterval() {
    return Math.max(80, 800 - (level - 1) * 60);
  }

  function isToppedOut(activePiece) {
    const shape = getShape(activePiece.key, activePiece.rot);
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (!shape[y][x]) continue;
        if (activePiece.y + y < 0) return true;
      }
    }
    return false;
  }

  function lockPiece() {
    const toppedOut = isToppedOut(piece);
    merge(board, piece.key, piece.rot, piece.x, piece.y);
    if (toppedOut) {
      gameOver = true;
      running = false;
      piece = null;
      playGameOverSfx();
      drawBoard();
      drawNext();
      showOverlay("Game over", "Press Start to play again");
      return;
    }
    const n = clearLines(board);
    if (n > 0) {
      lines += n;
      score += scoreForLines(n, level);
      const newLevel = (lines / 10 | 0) + 1;
      if (newLevel > level) level = newLevel;
      playLineClearSfx(n);
    } else {
      playLockSfx();
    }
    spawnPiece();
    elScore.textContent = String(score);
    elLines.textContent = String(lines);
    elLevel.textContent = String(level);
  }

  function hardDrop() {
    if (!piece || gameOver) return;
    let dy = 0;
    while (!collide(board, piece.key, piece.rot, piece.x, piece.y + dy + 1)) dy++;
    piece.y += dy;
    score += dy * 2;
    elScore.textContent = String(score);
    playDropSfx();
    lockPiece();
  }

  function drawCell(x, y, color, opts = {}) {
    const { ghost = false } = opts;
    const pad = 2;
    const x0 = x * CELL + pad;
    const y0 = y * CELL + pad;
    const s = CELL - pad * 2;
    ctx.save();
    if (ghost) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(x0 + 1, y0 + 1, s - 2, s - 2);
      ctx.restore();
      return;
    }
    ctx.fillStyle = color;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.fillRect(x0, y0, s, s);
    ctx.strokeRect(x0, y0, s, s);
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillRect(x0 + 4, y0 + 4, s * 0.35, s * 0.2);
    ctx.restore();
  }

  function ghostY() {
    if (!piece) return 0;
    let dy = 0;
    while (!collide(board, piece.key, piece.rot, piece.x, piece.y + dy + 1)) dy++;
    return piece.y + dy;
  }

  function drawBoard() {
    ctx.fillStyle = GRID_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        const c = board[y][x];
        if (c) drawCell(x, y, COLORS[c] || "#888");
      }
    }

    if (piece && !gameOver) {
      const gy = ghostY();
      const shape = getShape(piece.key, piece.rot);
      const ghostColor = COLORS[piece.key];
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (!shape[y][x]) continue;
          const bx = piece.x + x;
          const by = gy + y;
          if (by >= 0 && by < ROWS) drawCell(bx, by, ghostColor, { ghost: true });
        }
      }
      for (let y = 0; y < shape.length; y++) {
        for (let x = 0; x < shape[y].length; x++) {
          if (!shape[y][x]) continue;
          const bx = piece.x + x;
          const by = piece.y + y;
          if (by >= 0) drawCell(bx, by, COLORS[piece.key]);
        }
      }
    }
  }

  function drawNext() {
    const w = nextCanvas.width;
    const h = nextCanvas.height;
    nextCtx.fillStyle = "#fff8f0";
    nextCtx.fillRect(0, 0, w, h);
    const shape = getShape(nextKey, nextRot);
    const pw = pieceWidth(shape);
    const ph = pieceHeight(shape);
    const cs = 22;
    const ox = (w - pw * cs) / 2;
    const oy = (h - ph * cs) / 2;
    const col = COLORS[nextKey];
    for (let y = 0; y < ph; y++) {
      for (let x = 0; x < pw; x++) {
        if (!shape[y][x]) continue;
        const x0 = ox + x * cs;
        const y0 = oy + y * cs;
        nextCtx.fillStyle = col;
        nextCtx.strokeStyle = INK;
        nextCtx.lineWidth = 2;
        nextCtx.fillRect(x0, y0, cs - 2, cs - 2);
        nextCtx.strokeRect(x0, y0, cs - 2, cs - 2);
      }
    }
  }

  function showOverlay(title, msg) {
    overlay.classList.remove("hidden");
    overlayTitle.textContent = title;
    overlayMsg.textContent = msg;
    btnStart.textContent = gameOver || !running ? "Start" : "Resume";
  }

  function hideOverlay() {
    overlay.classList.add("hidden");
  }

  function tick(ts) {
    if (!running) return;
    rafId = requestAnimationFrame(tick);
    const dt = Math.min(100, ts - lastTs);
    lastTs = ts;
    if (!paused && !gameOver && piece) {
      dropAcc += dt;
      const interval = dropInterval();
      if (dropAcc >= interval) {
        dropAcc = 0;
        if (!collide(board, piece.key, piece.rot, piece.x, piece.y + 1)) {
          piece.y++;
        } else {
          lockPiece();
        }
      }
    }
    drawBoard();
    drawNext();
  }

  function startGame() {
    board = emptyBoard();
    score = 0;
    lines = 0;
    level = 1;
    dropAcc = 0;
    gameOver = false;
    paused = false;
    nextKey = randomKey();
    nextRot = 0;
    spawnPiece();
    elScore.textContent = "0";
    elLines.textContent = "0";
    elLevel.textContent = "1";
    running = true;
    lastTs = performance.now();
    hideOverlay();
    startMusic();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);
  }

  document.addEventListener("keydown", (e) => {
    if (e.code === "KeyM") {
      setAudioEnabled(!audioEnabled);
      e.preventDefault();
      return;
    }
    if (e.code === "KeyP") {
      if (!running || gameOver) return;
      paused = !paused;
      if (paused) {
        stopMusic();
        showOverlay("Paused", "Press P to resume");
        overlayMsg.textContent = "Press P to resume";
      } else {
        hideOverlay();
        startMusic();
        lastTs = performance.now();
      }
      e.preventDefault();
      return;
    }

    if (!running || gameOver || paused) return;

    if (!piece) return;

    if (e.code === "ArrowLeft") {
      if (!collide(board, piece.key, piece.rot, piece.x - 1, piece.y)) {
        piece.x--;
        playMoveSfx();
      }
      e.preventDefault();
    } else if (e.code === "ArrowRight") {
      if (!collide(board, piece.key, piece.rot, piece.x + 1, piece.y)) {
        piece.x++;
        playMoveSfx();
      }
      e.preventDefault();
    } else if (e.code === "ArrowDown") {
      if (!collide(board, piece.key, piece.rot, piece.x, piece.y + 1)) {
        piece.y++;
        score += 1;
        elScore.textContent = String(score);
        playMoveSfx();
      }
      e.preventDefault();
    } else if (e.code === "ArrowUp") {
      tryRotate();
      e.preventDefault();
    } else if (e.code === "Space") {
      hardDrop();
      e.preventDefault();
    }
  });

  btnStart.addEventListener("click", () => {
    ensureAudio();
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
    if (gameOver || !running) {
      startGame();
    } else if (paused) {
      paused = false;
      hideOverlay();
      startMusic();
      lastTs = performance.now();
    }
  });

  board = emptyBoard();
  drawBoard();
  drawNext();
  showOverlay("Pop Tetris", "Stack blocks, clear lines. Press Start!");
})();

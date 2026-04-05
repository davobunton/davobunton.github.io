const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

// ── Level config ───────────────────────────────────────────
const LEVELS = [
  {
    minScore: 0,
    colors: 4,
    shotsPerRow: 8,
    bombs: false,
    rainbows: false,
    name: "LEVEL 1",
    desc: "LET'S GOOO!",
  },
  {
    minScore: 500,
    colors: 5,
    shotsPerRow: 8,
    bombs: false,
    rainbows: false,
    name: "LEVEL 2",
    desc: "OOOOH 5TH COLOUR!",
  },
  {
    minScore: 1000,
    colors: 5,
    shotsPerRow: 7,
    bombs: true,
    rainbows: false,
    name: "LEVEL 3",
    desc: "BOMBS INCOMING!",
  },
  {
    minScore: 1500,
    colors: 6,
    shotsPerRow: 7,
    bombs: true,
    rainbows: false,
    name: "LEVEL 4",
    desc: "6 COLOURS — SPICY!",
  },
  {
    minScore: 2500,
    colors: 6,
    shotsPerRow: 6,
    bombs: true,
    rainbows: true,
    name: "LEVEL 5",
    desc: "WILDCARDS, MATE!",
  },
  {
    minScore: 3500,
    colors: 6,
    shotsPerRow: 6,
    bombs: true,
    rainbows: true,
    name: "LEVEL 6",
    desc: "YOU'RE ON FIRE! 🔥",
  },
  {
    minScore: 5000,
    colors: 6,
    shotsPerRow: 5,
    bombs: true,
    rainbows: true,
    name: "LEVEL 7",
    desc: "BUBBLE BOSS MODE!",
  },
  {
    minScore: 7000,
    colors: 6,
    shotsPerRow: 5,
    bombs: true,
    rainbows: true,
    name: "LEVEL 8",
    desc: "ABSOLUTELY ELITE!",
  },
  {
    minScore: 9500,
    colors: 6,
    shotsPerRow: 5,
    bombs: true,
    rainbows: true,
    name: "LEVEL 9",
    desc: "ARE YOU EVEN HUMAN?!",
  },
  {
    minScore: 12500,
    colors: 6,
    shotsPerRow: 4,
    bombs: true,
    rainbows: true,
    name: "LEVEL 10",
    desc: "BUBBLE BLITZ LEGEND!",
  },
];

// ── Constants ──────────────────────────────────────────────
const LW = 400;
const R = 20;
const CE = 10,
  CO = 9;
const ROW_H = R * Math.sqrt(3);
const SHOT_SPEED = 13;
const START_TIME = 60;
const TIME_PER_BUBBLE = 1.5;
const BOMB_FUSE = 25; // seconds
const COLORS = [
  "#e74c3c",
  "#3498db",
  "#2ecc71",
  "#f1c40f",
  "#9b59b6",
  "#e67e22",
];

// ── Layout ─────────────────────────────────────────────────
let LH, SX, SY, GRID_TOP, DANGER_Y;
const SWP_X = 58,
  SWP_R = 28;

function resize() {
  const wrap = document.getElementById("canvas-wrap");
  const scale = Math.min(
    wrap.clientWidth / LW,
    wrap.clientHeight / (LW * 1.75),
  );
  canvas.style.width = Math.round(LW * scale) + "px";
  canvas.style.height = Math.round(LW * 1.75 * scale) + "px";
  LH = Math.round(LW * 1.75);
  const dpr = window.devicePixelRatio || 1;
  canvas.width = LW * dpr;
  canvas.height = LH * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  GRID_TOP = 50;
  SX = LW / 2;
  SY = LH - 68;
  DANGER_Y = SY - R * 4.5;
  clearBubbleCache();
}

function toLogical(touch) {
  const rect = canvas.getBoundingClientRect(),
    sf = LW / rect.width;
  return {
    x: (touch.clientX - rect.left) * sf,
    y: (touch.clientY - rect.top) * sf,
  };
}

// ── Bubble cache ───────────────────────────────────────────
let bubbleCache = {};
function clearBubbleCache() {
  bubbleCache = {};
}

function getCachedBubble(color, r, t) {
  const key = `${color}|${r}|${t}`;
  if (bubbleCache[key]) return bubbleCache[key];
  const pad = t === "chaotic" ? 18 : t === "retro" ? 10 : 2;
  const sz = Math.ceil(r * 2 + pad * 2);
  const oc = document.createElement("canvas");
  oc.width = oc.height = sz;
  const cx = oc.getContext("2d");
  const cx_ = r + pad,
    cy_ = r + pad;
  if (t === "chaotic") {
    const g = cx.createRadialGradient(
      cx_ - r * 0.3,
      cy_ - r * 0.35,
      0,
      cx_,
      cy_,
      r,
    );
    g.addColorStop(0, lighten(color, 0.45));
    g.addColorStop(1, color);
    cx.fillStyle = g;
    cx.shadowColor = color;
    cx.shadowBlur = 14;
  } else if (t === "retro") {
    cx.fillStyle = color;
    cx.shadowColor = color;
    cx.shadowBlur = 8;
  } else {
    cx.fillStyle = color;
  }
  cx.beginPath();
  if (t === "retro")
    cx.rect(Math.round(cx_ - r), Math.round(cy_ - r), r * 2, r * 2);
  else cx.arc(cx_, cy_, r, 0, Math.PI * 2);
  cx.fill();
  cx.shadowBlur = 0;
  if (t !== "retro" && r > 7) {
    cx.globalAlpha = 0.28;
    cx.fillStyle = "white";
    cx.beginPath();
    cx.arc(cx_ - r * 0.28, cy_ - r * 0.3, r * 0.3, 0, Math.PI * 2);
    cx.fill();
  }
  bubbleCache[key] = { img: oc, pad };
  return bubbleCache[key];
}

function drawBubble(x, y, color, r = R, alpha = 1) {
  if (alpha <= 0 || color === "bomb" || color === "rainbow") return;
  const { img, pad } = getCachedBubble(color, r, th());
  ctx.globalAlpha = alpha;
  ctx.drawImage(img, x - r - pad, y - r - pad);
  ctx.globalAlpha = 1;
}

function drawBombBubble(x, y, fuse) {
  const critical = fuse < 6;
  const pulse = critical && Math.sin(Date.now() / 100) > 0;
  ctx.fillStyle = pulse ? "#3a0000" : "#1a1a1a";
  ctx.shadowColor = "#cc0000";
  ctx.shadowBlur = pulse ? 18 : 8;
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = critical ? "#ff2222" : "#882222";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(x, y, R, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.fillStyle = critical ? "#ff4444" : "#ffaaaa";
  ctx.font = `bold ${Math.round(R * 0.75)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(Math.ceil(fuse), x, y);
  ctx.textBaseline = "alphabetic";
  // Fuse line at top
  ctx.strokeStyle = "#ff8800";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + R * 0.2, y - R * 0.8);
  ctx.lineTo(x + R * 0.5, y - R * 1.3);
  ctx.stroke();
  ctx.lineWidth = 1;
}

function drawRainbowBubble(x, y, r = R, alpha = 1) {
  if (alpha <= 0) return;
  const hue = (Date.now() / 12) % 360;
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, 0, x, y, r);
  g.addColorStop(0, `hsl(${hue},100%,85%)`);
  g.addColorStop(0.5, `hsl(${(hue + 120) % 360},100%,65%)`);
  g.addColorStop(1, `hsl(${(hue + 240) % 360},100%,55%)`);
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  const t = th();
  if (t !== "minimal") {
    ctx.shadowColor = `hsl(${hue},100%,70%)`;
    ctx.shadowBlur = 12;
  }
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = alpha * 0.3;
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x - r * 0.28, y - r * 0.3, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

// ── State ──────────────────────────────────────────────────
let grid, rowOffset, shot, nextQ, fallers, particles, popups, timePops;
let score, bestScore, shotsSinceRow, comboCount, running;
let mx = 200,
  my = 300;
let animRow, rowShiftY, incomingRow;
let timeLeft,
  lastTs,
  lastTickSec,
  lastBombTickSec = -1;
let currentLevelIdx, levelUpAnim;
let bombFuses; // Map: r*200+c → seconds remaining

const th = () => document.body.className || "minimal";
const lv = () => LEVELS[currentLevelIdx];

// ── Geometry ───────────────────────────────────────────────
const isEven = (r) => (((r + rowOffset) % 2) + 2) % 2 === 0;
const numCols = (r) => (isEven(r) ? CE : CO);
const bx = (r, c) => (isEven(r) ? R + c * 2 * R : 2 * R + c * 2 * R);
const by = (r) => GRID_TOP + r * ROW_H + (animRow ? rowShiftY : 0);
const bkey = (r, c) => r * 200 + c;

function shootAngle() {
  let a = Math.atan2(my - SY, mx - SX);
  if (a >= 0 || a <= -Math.PI) a = mx < SX ? -Math.PI + 0.12 : -0.12;
  return Math.max(-Math.PI + 0.12, Math.min(-0.12, a));
}

// ── Grid helpers ───────────────────────────────────────────
function neighbors(r, c) {
  const even = isEven(r);
  return [
    [r, c - 1],
    [r, c + 1],
    [r - 1, even ? c - 1 : c],
    [r - 1, even ? c : c + 1],
    [r + 1, even ? c - 1 : c],
    [r + 1, even ? c : c + 1],
  ].filter(
    ([nr, nc]) =>
      nr >= 0 &&
      nr < grid.length &&
      nc >= 0 &&
      nc < numCols(nr) &&
      grid[nr]?.[nc],
  );
}

function bfsColor(r, c) {
  const color = grid[r][c];
  if (color === "bomb" || color === "rainbow") return [];
  const seen = new Set([bkey(r, c)]),
    q = [[r, c]],
    res = [[r, c]];
  while (q.length) {
    const [cr, cc] = q.shift();
    for (const [nr, nc] of neighbors(cr, cc)) {
      const k = bkey(nr, nc),
        nc_ = grid[nr][nc];
      if (!seen.has(k) && (nc_ === color || nc_ === "rainbow")) {
        seen.add(k);
        q.push([nr, nc]);
        res.push([nr, nc]);
      }
    }
  }
  return res;
}

function findFloating() {
  const seen = new Set(),
    q = [];
  for (let c = 0; c < numCols(0); c++)
    if (grid[0]?.[c]) {
      seen.add(bkey(0, c));
      q.push([0, c]);
    }
  while (q.length) {
    const [r, c] = q.shift();
    for (const [nr, nc] of neighbors(r, c)) {
      const k = bkey(nr, nc);
      if (!seen.has(k)) {
        seen.add(k);
        q.push([nr, nc]);
      }
    }
  }
  const res = [];
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < numCols(r); c++)
      if (grid[r]?.[c] && !seen.has(bkey(r, c))) res.push([r, c]);
  return res;
}

function snapCell(px, py) {
  let best = Infinity,
    br = 0,
    bc = 0;
  const rEst = Math.round((py - GRID_TOP) / ROW_H);
  for (let r = Math.max(0, rEst - 2); r <= rEst + 3; r++) {
    for (let c = 0; c < numCols(r); c++) {
      if (r < grid.length && grid[r]?.[c]) continue;
      const d = Math.hypot(px - bx(r, c), py - by(r));
      if (d < best) {
        best = d;
        br = r;
        bc = c;
      }
    }
  }
  return { r: br, c: bc };
}

// ── Init ───────────────────────────────────────────────────
function randColor() {
  return COLORS[Math.floor(Math.random() * lv().colors)];
}

function initGame() {
  currentLevelIdx = 0;
  levelUpAnim = null;
  rowOffset = 0;
  animRow = false;
  rowShiftY = 0;
  incomingRow = null;
  bombFuses = new Map();
  grid = [];
  for (let r = 0; r < 8; r++)
    grid.push(Array.from({ length: numCols(r) }, () => randColor()));
  shot = null;
  nextQ = [randColor(), randColor(), randColor()];
  fallers = [];
  particles = [];
  popups = [];
  timePops = [];
  score = 0;
  shotsSinceRow = 0;
  comboCount = 0;
  timeLeft = START_TIME;
  lastTs = null;
  lastTickSec = -1;
  lastBombTickSec = -1;
  bestScore = parseInt(localStorage.getItem("bs_bub5") || "0");
  document.getElementById("o-hs").textContent = `Best: ${bestScore}`;
}

// ── Level up ───────────────────────────────────────────────
function gaEvent(name, params) {
  if (typeof gtag === "function") gtag("event", name, params || {});
}

function checkLevelUp() {
  let newIdx = 0;
  for (let i = 0; i < LEVELS.length; i++)
    if (score >= LEVELS[i].minScore) newIdx = i;
  if (newIdx > currentLevelIdx) {
    currentLevelIdx = newIdx;
    levelUpAnim = { life: 1.0, label: lv().name, desc: lv().desc };
    lastTs = null; // pause timer during anim
    sfxLevelUp();
    gaEvent("level_up", {
      level: newIdx + 1,
      level_name: lv().name,
      score,
    });
  }
}

// ── Fire & swap ────────────────────────────────────────────
function fire() {
  if (shot || animRow || levelUpAnim) return;
  const a = shootAngle();
  shot = {
    x: SX,
    y: SY,
    vx: Math.cos(a) * SHOT_SPEED,
    vy: Math.sin(a) * SHOT_SPEED,
    color: nextQ.shift(),
  };
  nextQ.push(randColor());
  sfxShoot();
}
function swap() {
  if (shot || levelUpAnim) return;
  [nextQ[0], nextQ[1]] = [nextQ[1], nextQ[0]];
}

// ── Place & match ──────────────────────────────────────────
function place(px, py, color) {
  const { r, c } = snapCell(px, py);
  while (grid.length <= r)
    grid.push(new Array(numCols(grid.length)).fill(null));
  grid[r][c] = color;

  // Defuse any adjacent bombs — landing next to a bomb disarms it
  const even = isEven(r);
  const adjCells = [
    [r, c - 1],
    [r, c + 1],
    [r - 1, even ? c - 1 : c],
    [r - 1, even ? c : c + 1],
    [r + 1, even ? c - 1 : c],
    [r + 1, even ? c : c + 1],
  ];
  adjCells.forEach(([br, bc]) => {
    if (br < 0 || br >= grid.length || bc < 0 || bc >= numCols(br)) return;
    if (grid[br]?.[bc] !== "bomb") return;
    const k = bkey(br, bc);
    bombFuses.delete(k);
    grid[br][bc] = null;
    score += 300;
    timeLeft = Math.min(timeLeft + 10, START_TIME * 1.5);
    burst(bx(br, bc), by(br), "#ff8800", 18);
    timePops.push({
      x: bx(br, bc),
      y: by(br),
      text: "+10s DEFUSED!",
      life: 1.6,
      vy: -1.8,
    });
    sfxDefuse();
  });

  const group = bfsColor(r, c);
  if (group.length >= 3) {
    comboCount++;
    const pts = group.length * 10 * comboCount;
    score += pts;
    checkLevelUp();
    const tb = parseFloat(
      (
        group.length *
        TIME_PER_BUBBLE *
        (comboCount > 1 ? comboCount * 0.5 + 1 : 1)
      ).toFixed(1),
    );
    timeLeft = Math.min(timeLeft + tb, START_TIME * 1.5);
    timePops.push({
      x: bx(r, c),
      y: by(r) - R,
      text: `+${tb}s`,
      life: 1.2,
      vy: -1.4,
    });
    // Popping bubbles also extends active bomb fuses
    const fuseBonus = group.length * 0.8;
    bombFuses.forEach((fuse, k) =>
      bombFuses.set(k, Math.min(fuse + fuseBonus, BOMB_FUSE)),
    );
    popups.push({
      x: bx(r, c),
      y: by(r) + R,
      text: `+${pts}`,
      sub: comboCount > 1 ? `COMBO x${comboCount}` : "",
      life: 1,
      vy: -1.5,
    });
    group.forEach(([gr, gc]) => {
      bombFuses.delete(bkey(gr, gc));
      burst(
        bx(gr, gc),
        by(gr),
        grid[gr][gc] === "rainbow"
          ? `hsl(${Math.random() * 360},100%,65%)`
          : grid[gr][gc],
        10,
      );
      grid[gr][gc] = null;
    });
    // Defuse any bomb adjacent to ANY cell in the popped group
    const defusedBombs = new Set();
    group.forEach(([gr, gc]) => {
      const ev2 = isEven(gr);
      [
        [gr, gc - 1],
        [gr, gc + 1],
        [gr - 1, ev2 ? gc - 1 : gc],
        [gr - 1, ev2 ? gc : gc + 1],
        [gr + 1, ev2 ? gc - 1 : gc],
        [gr + 1, ev2 ? gc : gc + 1],
      ].forEach(([br, bc]) => {
        if (br < 0 || br >= grid.length || bc < 0 || bc >= numCols(br)) return;
        if (grid[br]?.[bc] !== "bomb") return;
        const k = bkey(br, bc);
        if (!bombFuses.has(k) || defusedBombs.has(k)) return;
        defusedBombs.add(k);
        bombFuses.delete(k);
        grid[br][bc] = null;
        score += 300;
        timeLeft = Math.min(timeLeft + 10, START_TIME * 1.5);
        burst(bx(br, bc), by(br), "#ff8800", 18);
        timePops.push({
          x: bx(br, bc),
          y: by(br),
          text: "+10s DEFUSED!",
          life: 1.6,
          vy: -1.8,
        });
        sfxDefuse();
      });
    });
    findFloating().forEach(([fr, fc]) => {
      const col = grid[fr][fc];
      if (col === "bomb") {
        bombFuses.delete(bkey(fr, fc));
        score += 300;
        timeLeft = Math.min(timeLeft + 10, START_TIME * 1.5);
        timePops.push({
          x: bx(fr, fc),
          y: by(fr),
          text: "+10s DEFUSED!",
          life: 1.6,
          vy: -1.8,
        });
        fallers.push({
          x: bx(fr, fc),
          y: by(fr),
          vy: -2,
          color: "#444",
          r: R,
        });
        sfxDefuse();
      } else {
        burst(
          bx(fr, fc),
          by(fr),
          col === "rainbow" ? `hsl(${Math.random() * 360},100%,65%)` : col,
          5,
        );
        fallers.push({
          x: bx(fr, fc),
          y: by(fr),
          vy: -1,
          color: col,
          r: R,
        });
        score += 8 * comboCount;
      }
      grid[fr][fc] = null;
      bombFuses.delete(bkey(fr, fc));
    });
    sfxPop(comboCount);
  } else {
    comboCount = 0;
  }

  while (grid.length && grid[grid.length - 1].every((v) => !v)) grid.pop();
  for (let rr = 0; rr < grid.length; rr++)
    if (grid[rr].some((v) => v) && by(rr) + R > DANGER_Y) {
      endGame("bubbles");
      return;
    }

  if (++shotsSinceRow >= lv().shotsPerRow) {
    shotsSinceRow = 0;
    addRow();
  }
}

function addRow() {
  if (animRow) return;
  const newP = (((1 - rowOffset) % 2) + 2) % 2;
  const cols = newP === 0 ? CE : CO;
  const lvl = lv();
  let bombsInRow = 0;
  incomingRow = Array.from({ length: cols }, () => {
    const rand = Math.random();
    if (lvl.bombs && bombsInRow < 2 && rand < 0.1) {
      bombsInRow++;
      return "bomb";
    }
    if (lvl.rainbows && rand < 0.22) return "rainbow";
    return randColor();
  });

  // Fair bomb guarantee: ensure every bomb has a matchable color nearby AND in the queue
  incomingRow.forEach((cell, bc) => {
    if (cell !== "bomb") return;
    // Collect adjacent colors: same row neighbors + grid row 0 neighbors (hex-aware)
    const adj = [];
    const push = (c) => {
      const v = incomingRow[c];
      if (v && v !== "bomb" && v !== "rainbow") adj.push(v);
    };
    if (bc > 0) push(bc - 1);
    if (bc < cols - 1) push(bc + 1);
    if (grid[0]) {
      const n1 = newP === 0 ? bc - 1 : bc,
        n2 = newP === 0 ? bc : bc + 1;
      [n1, n2].forEach((nc) => {
        const v = grid[0]?.[nc];
        if (v && v !== "bomb" && v !== "rainbow") adj.push(v);
      });
    }
    // Count frequencies — find any color appearing 2+ times (one shot away from a match)
    const freq = {};
    adj.forEach((c) => (freq[c] = (freq[c] || 0) + 1));
    let target = Object.entries(freq).find(([, n]) => n >= 2)?.[0];
    if (!target) {
      // No natural pair — force one: duplicate a neighbor's color in the row
      const pick = adj[0] || randColor();
      if (
        bc > 0 &&
        incomingRow[bc - 1] !== "bomb" &&
        incomingRow[bc - 1] !== "rainbow"
      )
        incomingRow[bc - 1] = pick;
      else if (
        bc < cols - 1 &&
        incomingRow[bc + 1] !== "bomb" &&
        incomingRow[bc + 1] !== "rainbow"
      )
        incomingRow[bc + 1] = pick;
      target = pick;
    }
    // Ensure that color is available in the upcoming queue
    if (!nextQ.includes(target)) nextQ[nextQ.length - 1] = target;
  });

  animRow = true;
  rowShiftY = 0;
}

// ── Aim path ───────────────────────────────────────────────
function aimPath() {
  const a = shootAngle();
  let x = SX,
    y = SY,
    vx = Math.cos(a),
    vy = Math.sin(a);
  const pts = [{ x, y }];
  for (let i = 0; i < 1500; i++) {
    x += vx * 5;
    y += vy * 5;
    if (x < R) {
      x = R;
      vx = Math.abs(vx);
      pts.push({ x, y });
    }
    if (x > LW - R) {
      x = LW - R;
      vx = -Math.abs(vx);
      pts.push({ x, y });
    }
    if (y <= GRID_TOP + R) {
      pts.push({ x, y: GRID_TOP + R });
      break;
    }
    const rr = Math.round((y - GRID_TOP) / ROW_H);
    let hit = false;
    for (
      let r = Math.max(0, rr - 1);
      r <= Math.min(grid.length - 1, rr + 1);
      r++
    ) {
      for (let c = 0; c < numCols(r); c++) {
        if (grid[r]?.[c] && Math.hypot(x - bx(r, c), y - by(r)) < 2 * R + 1) {
          pts.push({ x, y });
          hit = true;
          break;
        }
      }
      if (hit) break;
    }
    if (hit) break;
  }
  return pts;
}

// ── Particles ──────────────────────────────────────────────
function burst(x, y, color, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2,
      s = Math.random() * 6 + 2;
    particles.push({
      x,
      y,
      color,
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      r: Math.random() * 3 + 1,
      life: 1,
      decay: Math.random() * 0.04 + 0.02,
    });
  }
}

// ── Audio ──────────────────────────────────────────────────
let ac;
const audio = () =>
  ac || (ac = new (window.AudioContext || window.webkitAudioContext)());
function sfxShoot() {
  try {
    const a = audio(),
      o = a.createOscillator(),
      g = a.createGain();
    o.connect(g);
    g.connect(a.destination);
    o.type = "sine";
    o.frequency.setValueAtTime(700, a.currentTime);
    o.frequency.exponentialRampToValueAtTime(280, a.currentTime + 0.08);
    g.gain.setValueAtTime(0.1, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.09);
    o.start();
    o.stop(a.currentTime + 0.09);
  } catch (e) {}
}
function sfxPop(combo) {
  try {
    const a = audio(),
      freqs = [440, 550, 660, 880, 1100];
    freqs.slice(0, Math.min(combo + 1, 5)).forEach((f, i) => {
      const o = a.createOscillator(),
        g = a.createGain();
      o.connect(g);
      g.connect(a.destination);
      o.type = "triangle";
      o.frequency.value = f;
      const t = a.currentTime + i * 0.07;
      g.gain.setValueAtTime(0.15, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      o.start(t);
      o.stop(t + 0.18);
    });
  } catch (e) {}
}
function sfxTick() {
  try {
    const a = audio(),
      o = a.createOscillator(),
      g = a.createGain();
    o.connect(g);
    g.connect(a.destination);
    o.type = "square";
    o.frequency.value = 110;
    g.gain.setValueAtTime(0.06, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.08);
    o.start();
    o.stop(a.currentTime + 0.08);
  } catch (e) {}
}
function sfxLevelUp() {
  try {
    const a = audio(),
      [C, E, G, Hi] = [523, 659, 784, 1047];
    [C, E, G, Hi].forEach((f, i) => {
      const o = a.createOscillator(),
        g = a.createGain();
      o.connect(g);
      g.connect(a.destination);
      o.type = "sine";
      o.frequency.value = f;
      const t = a.currentTime + i * 0.11;
      g.gain.setValueAtTime(0.22, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.start(t);
      o.stop(t + 0.35);
    });
  } catch (e) {}
}
function sfxDefuse() {
  try {
    const a = audio(),
      o = a.createOscillator(),
      g = a.createGain();
    o.connect(g);
    g.connect(a.destination);
    o.type = "sawtooth";
    o.frequency.setValueAtTime(200, a.currentTime);
    o.frequency.exponentialRampToValueAtTime(900, a.currentTime + 0.22);
    g.gain.setValueAtTime(0.14, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.25);
    o.start();
    o.stop(a.currentTime + 0.25);
  } catch (e) {}
}
function sfxBoom() {
  try {
    const a = audio();
    // Deep explosive thud — layered low sine + noise burst
    [55, 80, 40].forEach((freq, i) => {
      const o = a.createOscillator(),
        g = a.createGain();
      o.connect(g);
      g.connect(a.destination);
      o.type = "sine";
      o.frequency.setValueAtTime(freq, a.currentTime + i * 0.01);
      o.frequency.exponentialRampToValueAtTime(20, a.currentTime + 0.8);
      g.gain.setValueAtTime(i === 0 ? 0.9 : 0.5, a.currentTime + i * 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.9);
      o.start(a.currentTime + i * 0.01);
      o.stop(a.currentTime + 0.9);
    });
    // High crack on top
    const o2 = a.createOscillator(),
      g2 = a.createGain();
    o2.connect(g2);
    g2.connect(a.destination);
    o2.type = "sawtooth";
    o2.frequency.setValueAtTime(300, a.currentTime);
    o2.frequency.exponentialRampToValueAtTime(30, a.currentTime + 0.15);
    g2.gain.setValueAtTime(0.6, a.currentTime);
    g2.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.18);
    o2.start();
    o2.stop(a.currentTime + 0.18);
  } catch (e) {}
}

function sfxWahWah() {
  try {
    const a = audio();
    // Classic descending trombone fail: wah wah wah waaah
    const notes = [
      { f: 466, t: 0 }, // Bb4
      { f: 415, t: 0.22 }, // Ab4
      { f: 370, t: 0.44 }, // F#4
      { f: 311, t: 0.66 }, // Eb4 — held, slides down
    ];
    notes.forEach(({ f, t }) => {
      const o = a.createOscillator(),
        g = a.createGain();
      // Mute effect: tremolo via gain oscillation
      const lfo = a.createOscillator(),
        lfoG = a.createGain();
      lfo.frequency.value = 8;
      lfo.type = "sine";
      lfoG.gain.value = 0.08;
      lfo.connect(lfoG);
      lfoG.connect(g.gain);
      o.connect(g);
      g.connect(a.destination);
      o.type = "sawtooth";
      o.frequency.setValueAtTime(f, a.currentTime + t);
      // Last note slides down
      if (t === 0.66)
        o.frequency.linearRampToValueAtTime(f * 0.7, a.currentTime + t + 0.5);
      const isLast = t === 0.66;
      g.gain.setValueAtTime(0, a.currentTime + t);
      g.gain.linearRampToValueAtTime(0.3, a.currentTime + t + 0.04);
      g.gain.setValueAtTime(0.3, a.currentTime + t + (isLast ? 0.45 : 0.14));
      g.gain.linearRampToValueAtTime(
        0,
        a.currentTime + t + (isLast ? 0.7 : 0.2),
      );
      lfo.start(a.currentTime + t);
      lfo.stop(a.currentTime + t + (isLast ? 0.7 : 0.22));
      o.start(a.currentTime + t);
      o.stop(a.currentTime + t + (isLast ? 0.7 : 0.22));
    });
  } catch (e) {}
}

function sfxBombTick(urgency) {
  try {
    // urgency 0-1 (1 = almost detonated): pitch and volume rise
    const a = audio();
    const freq = 900 + urgency * 600;
    const vol = 0.09 + urgency * 0.13;
    const dur = 0.025;
    const o = a.createOscillator(),
      g = a.createGain();
    o.connect(g);
    g.connect(a.destination);
    o.type = "square";
    o.frequency.setValueAtTime(freq, a.currentTime);
    o.frequency.exponentialRampToValueAtTime(freq * 0.6, a.currentTime + dur);
    g.gain.setValueAtTime(vol, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + dur);
    o.start();
    o.stop(a.currentTime + dur);
  } catch (e) {}
}

// ── Helpers ────────────────────────────────────────────────
function lighten(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${Math.min(255, ((n >> 16) & 255) + Math.round(amt * 255))},${Math.min(255, ((n >> 8) & 255) + Math.round(amt * 255))},${Math.min(255, (n & 255) + Math.round(amt * 255))})`;
}

// ── Draw shooter + controls ────────────────────────────────
function drawShooter(color) {
  const t = th(),
    a = shootAngle(),
    base = t === "retro" ? "#00ff41" : t === "chaotic" ? "#fff" : "#555";
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.arc(SX, SY, R + 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = base;
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(SX, SY);
  ctx.lineTo(SX + Math.cos(a) * (R + 22), SY + Math.sin(a) * (R + 22));
  ctx.stroke();
  ctx.lineWidth = 1;
  if (color === "rainbow") drawRainbowBubble(SX, SY, R - 2);
  else drawBubble(SX, SY, color, R - 2);
}
function drawSwapBtn() {
  const t = th(),
    color = nextQ[1],
    SWP_Y = SY,
    base = t === "retro" ? "#00ff41" : t === "chaotic" ? "#ff00ff" : "#888";
  ctx.globalAlpha = 0.18;
  ctx.fillStyle = base;
  ctx.beginPath();
  ctx.arc(SWP_X, SWP_Y, SWP_R + 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = base;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(SWP_X, SWP_Y, SWP_R + 6, 0, Math.PI * 2);
  ctx.stroke();
  if (color === "rainbow") drawRainbowBubble(SWP_X, SWP_Y, SWP_R * 0.72);
  else drawBubble(SWP_X, SWP_Y, color, SWP_R * 0.72);
  ctx.fillStyle = base;
  ctx.globalAlpha = 0.7;
  ctx.font = "bold 9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SWAP", SWP_X, SWP_Y + SWP_R + 18);
  ctx.globalAlpha = 1;
}

// ── Timer + HUD ────────────────────────────────────────────
function drawHUD(t) {
  const frac = Math.max(0, timeLeft / START_TIME);
  const secs = Math.ceil(timeLeft);
  const urgent = timeLeft < 10,
    warning = timeLeft < 20;
  const pulse = urgent && Math.sin(Date.now() / 120) > 0;
  const barColor = urgent
    ? "#e74c3c"
    : warning
      ? "#f39c12"
      : t === "retro"
        ? "#00ff41"
        : t === "chaotic"
          ? "#b44fff"
          : "#3498db";

  // Ceiling bg
  ctx.fillStyle =
    t === "minimal" ? "#ddd" : t === "retro" ? "#001800" : "#160016";
  ctx.fillRect(0, 0, LW, GRID_TOP - 2);
  if (urgent && pulse) {
    ctx.fillStyle = "rgba(220,0,0,0.14)";
    ctx.fillRect(0, 0, LW, GRID_TOP - 2);
  }

  // Timer bar
  const barY = GRID_TOP - 10,
    barH = 7,
    pad = 10;
  ctx.fillStyle = "rgba(0,0,0,.2)";
  ctx.beginPath();
  ctx.roundRect(pad, barY, LW - pad * 2, barH, 3);
  ctx.fill();
  ctx.fillStyle = barColor;
  ctx.beginPath();
  ctx.roundRect(pad, barY, Math.max(0, (LW - pad * 2) * frac), barH, 3);
  ctx.fill();

  // Score
  const sc = t === "minimal" ? "#555" : t === "retro" ? "#00ff41" : "#fff";
  ctx.fillStyle = sc;
  ctx.font = `bold 13px ${t === "retro" ? "Courier New" : "sans-serif"}`;
  ctx.textAlign = "left";
  ctx.fillText(`${score}`, 10, 26);

  // Timer number
  ctx.fillStyle = urgent && pulse ? "#ff4444" : barColor;
  ctx.font = `bold ${urgent ? 21 : 18}px ${t === "retro" ? "Courier New" : "sans-serif"}`;
  ctx.textAlign = "center";
  ctx.fillText(`${secs}s`, LW / 2, 27);

  // Level indicator
  const lvName = lv().name.replace("LEVEL ", "LV");
  ctx.fillStyle = sc;
  ctx.globalAlpha = 0.55;
  ctx.font = `bold 11px sans-serif`;
  ctx.textAlign = "right";
  ctx.fillText(lvName, LW - 10, 18);
  ctx.fillStyle = sc;
  ctx.globalAlpha = 0.35;
  ctx.font = `10px sans-serif`;
  ctx.fillText(`BEST ${bestScore}`, LW - 10, 30);
  ctx.globalAlpha = 1;

  if (urgent && secs !== lastTickSec && secs > 0) {
    lastTickSec = secs;
    sfxTick();
  }

  // Bomb tick — fire once per second when any visible bomb has ≤15s left
  if (bombFuses.size > 0) {
    let minFuse = Infinity;
    bombFuses.forEach((fuse, k) => {
      const br = Math.floor(k / 200);
      if (by(br) > GRID_TOP) minFuse = Math.min(minFuse, fuse); // only visible bombs
    });
    if (minFuse <= 15 && minFuse !== Infinity) {
      const bombSec = Math.ceil(minFuse);
      if (bombSec !== lastBombTickSec && bombSec > 0) {
        lastBombTickSec = bombSec;
        sfxBombTick(1 - minFuse / 15); // urgency rises as fuse nears 0
        if (navigator.vibrate) navigator.vibrate(60);
      }
    } else {
      lastBombTickSec = -1;
    }
  }
}

// ── Level-up overlay ───────────────────────────────────────
function drawLevelUpOverlay() {
  const { life, label, desc } = levelUpAnim;
  // Ease: fade in fast, hold, fade out
  const alpha = life > 0.75 ? (1 - life) / 0.25 : life < 0.2 ? life / 0.2 : 1;
  const t = th();
  ctx.globalAlpha = alpha * 0.65;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, LW, LH);
  const accent =
    t === "retro" ? "#00ff41" : t === "chaotic" ? "#ff00ff" : "#fff";
  ctx.globalAlpha = alpha;
  if (t === "chaotic") {
    ctx.shadowColor = accent;
    ctx.shadowBlur = 30;
  }
  ctx.fillStyle = accent;
  ctx.font = `bold 54px ${t === "retro" ? "Courier New" : "sans-serif"}`;
  ctx.textAlign = "center";
  ctx.fillText(label, LW / 2, LH / 2 - 18);
  ctx.shadowBlur = 0;
  ctx.fillStyle = accent;
  ctx.globalAlpha = alpha * 0.75;
  ctx.font = `bold 20px ${t === "retro" ? "Courier New" : "sans-serif"}`;
  ctx.fillText(desc, LW / 2, LH / 2 + 22);
  ctx.globalAlpha = 1;
  levelUpAnim.life -= 0.0045; // ~3.6s at 60fps
  if (levelUpAnim.life <= 0) levelUpAnim = null;
}

// ── Main loop ──────────────────────────────────────────────
function loop() {
  if (!running) return;
  requestAnimationFrame(loop);
  const t = th();
  const now = performance.now();

  // Timer (paused during level-up anim)
  if (!levelUpAnim) {
    if (lastTs !== null) {
      timeLeft -= (now - lastTs) / 1000;
      // Decrement bomb fuses — only once bomb is below the top fold
      bombFuses.forEach((fuse, k) => {
        const br = Math.floor(k / 200);
        if (by(br) <= GRID_TOP) return; // still at top edge, not fully visible yet
        const nf = fuse - (now - lastTs) / 1000;
        if (nf <= 0) {
          endGame("bomb");
          return;
        }
        bombFuses.set(k, nf);
      });
      if (timeLeft <= 0) {
        timeLeft = 0;
        endGame("time");
        return;
      }
    }
    lastTs = now;
  }

  // BG
  ctx.fillStyle =
    t === "minimal" ? "#fff" : t === "retro" ? "#030308" : "#06000e";
  ctx.fillRect(0, 0, LW, LH);
  if (t === "minimal") {
    ctx.strokeStyle = "#f0f0f0";
    ctx.lineWidth = 0.5;
    for (let x = 0; x < LW; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, LH);
      ctx.stroke();
    }
    for (let y = 0; y < LH; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(LW, y);
      ctx.stroke();
    }
  }
  if (t === "retro") {
    ctx.fillStyle = "rgba(0,0,0,.18)";
    for (let y = 0; y < LH; y += 4) ctx.fillRect(0, y, LW, 2);
  }

  // Incoming row
  if (animRow) {
    rowShiftY = Math.min(rowShiftY + 1.4, ROW_H);
    if (incomingRow) {
      const newP = (((1 - rowOffset) % 2) + 2) % 2;
      incomingRow.forEach((color, c) => {
        if (!color) return;
        const rx = newP === 0 ? R + c * 2 * R : 2 * R + c * 2 * R,
          ry = GRID_TOP - ROW_H + rowShiftY;
        if (ry + R <= 0) return;
        if (color === "bomb") drawBombBubble(rx, ry, BOMB_FUSE);
        else if (color === "rainbow") drawRainbowBubble(rx, ry);
        else drawBubble(rx, ry, color);
      });
    }
    if (rowShiftY >= ROW_H) {
      rowOffset = (rowOffset + 1) % 2;
      if (incomingRow) {
        // Shift existing bomb keys down by 1 row
        const newFuses = new Map();
        bombFuses.forEach((fuse, k) => {
          const r = Math.floor(k / 200),
            c = k % 200;
          newFuses.set((r + 1) * 200 + c, fuse);
        });
        // Add new bombs in row 0
        incomingRow.forEach((color, c) => {
          if (color === "bomb") newFuses.set(0 * 200 + c, BOMB_FUSE);
        });
        bombFuses = newFuses;
        grid.unshift(incomingRow);
      }
      incomingRow = null;
      animRow = false;
      rowShiftY = 0;
    }
  }

  // Grid
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < numCols(r); c++) {
      const color = grid[r]?.[c];
      if (!color) continue;
      const x = bx(r, c),
        y = by(r);
      if (y > LH + R) continue;
      if (color === "bomb")
        drawBombBubble(x, y, bombFuses.get(bkey(r, c)) || 0);
      else if (color === "rainbow") drawRainbowBubble(x, y);
      else drawBubble(x, y, color);
    }
  }

  // Aim
  if (!shot && !levelUpAnim) {
    const path = aimPath();
    const aimC =
      t === "retro"
        ? "rgba(0,255,65,.55)"
        : t === "chaotic"
          ? "rgba(255,255,255,.45)"
          : "rgba(0,0,0,.22)";
    for (let i = 0; i < path.length - 1; i++) {
      const p1 = path[i],
        p2 = path[i + 1],
        len = Math.hypot(p2.x - p1.x, p2.y - p1.y),
        steps = Math.floor(len / 16);
      for (let s = 0; s < steps; s++) {
        const f = s / steps;
        ctx.fillStyle = aimC;
        ctx.beginPath();
        ctx.arc(
          p1.x + (p2.x - p1.x) * f,
          p1.y + (p2.y - p1.y) * f,
          2.5,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }
    const last = path[path.length - 1];
    const nc0 = nextQ[0];
    if (nc0 === "rainbow") {
      ctx.globalAlpha = 0.22;
      drawRainbowBubble(last.x, last.y);
    } else {
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = nc0;
      ctx.beginPath();
      ctx.arc(last.x, last.y, R, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Shot
  if (shot) {
    shot.x += shot.vx;
    shot.y += shot.vy;
    if (shot.x < R) {
      shot.x = R;
      shot.vx = Math.abs(shot.vx);
    }
    if (shot.x > LW - R) {
      shot.x = LW - R;
      shot.vx = -Math.abs(shot.vx);
    }
    let landed = shot.y <= GRID_TOP + R;
    if (!landed) {
      const rr = Math.round((shot.y - GRID_TOP) / ROW_H);
      outer: for (
        let r = Math.max(0, rr - 2);
        r <= Math.min(grid.length - 1, rr + 2);
        r++
      ) {
        for (let c = 0; c < numCols(r); c++) {
          if (
            grid[r]?.[c] &&
            Math.hypot(shot.x - bx(r, c), shot.y - by(r)) < 2 * R - 2
          ) {
            landed = true;
            break outer;
          }
        }
      }
    }
    if (landed) {
      place(shot.x, shot.y, shot.color);
      shot = null;
    } else {
      if (shot.color === "rainbow") drawRainbowBubble(shot.x, shot.y);
      else drawBubble(shot.x, shot.y, shot.color);
    }
  }

  // Controls
  drawShooter(nextQ[0]);
  drawSwapBtn();
  const pc =
    t === "minimal"
      ? "#aaa"
      : t === "retro"
        ? "rgba(0,255,65,.5)"
        : "rgba(255,255,255,.45)";
  ctx.fillStyle = pc;
  ctx.globalAlpha = 0.7;
  ctx.font = "bold 9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("NEXT", LW - 52, SY - R - 6);
  ctx.globalAlpha = 1;
  if (nextQ[2] === "rainbow") drawRainbowBubble(LW - 52, SY, R * 0.65);
  else drawBubble(LW - 52, SY, nextQ[2], R * 0.65);

  // Danger line
  ctx.strokeStyle =
    t === "minimal"
      ? "rgba(220,50,50,.2)"
      : t === "retro"
        ? "rgba(255,0,0,.35)"
        : "rgba(255,60,60,.25)";
  ctx.setLineDash([5, 5]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, DANGER_Y);
  ctx.lineTo(LW, DANGER_Y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Fallers
  for (let i = fallers.length - 1; i >= 0; i--) {
    const f = fallers[i];
    f.y += f.vy;
    f.vy += 0.35;
    if (f.color === "rainbow") drawRainbowBubble(f.x, f.y, R * 0.8, 0.7);
    else drawBubble(f.x, f.y, f.color, f.r || R * 0.8, 0.7);
    if (f.y > LH + R * 2) fallers.splice(i, 1);
  }

  // Particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.91;
    p.vy *= 0.91;
    p.vy += 0.06;
    p.life -= p.decay;
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
    if (p.life <= 0) particles.splice(i, 1);
  }

  // Score popups
  for (let i = popups.length - 1; i >= 0; i--) {
    const p = popups[i];
    p.y += p.vy;
    p.life -= 0.022;
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle =
      t === "retro" ? "#00ff41" : t === "chaotic" ? "#ffff00" : "#111";
    ctx.font = "bold 17px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(p.text, p.x, p.y);
    if (p.sub) {
      ctx.font = "bold 12px sans-serif";
      ctx.fillText(p.sub, p.x, p.y + 18);
    }
    ctx.globalAlpha = 1;
    if (p.life <= 0) popups.splice(i, 1);
  }

  // Time popups
  for (let i = timePops.length - 1; i >= 0; i--) {
    const p = timePops[i];
    p.y += p.vy;
    p.life -= 0.016;
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = t === "retro" ? "#00ff41" : "#2ecc71";
    ctx.font = "bold 15px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(p.text, p.x, p.y);
    ctx.globalAlpha = 1;
    if (p.life <= 0) timePops.splice(i, 1);
  }

  // HUD (on top)
  drawHUD(t);

  // Level-up overlay (topmost)
  if (levelUpAnim) drawLevelUpOverlay();
}

// ── End & start ────────────────────────────────────────────
let heartbeatInterval = null;

function endGame(reason) {
  running = false;
  clearInterval(heartbeatInterval);
  if (reason === "bomb") sfxBoom();
  else sfxWahWah();
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem("bs_bub5", bestScore);
  }
  gaEvent("game_over", { reason, score, level: currentLevelIdx + 1 });
  document.getElementById("o-title").textContent =
    reason === "time"
      ? "Time's Up!"
      : reason === "bomb"
        ? "BOOM! Detonated!"
        : "Game Over";
  document.getElementById("o-sub").textContent = `Score: ${score}`;
  document.getElementById("o-hs").textContent = `Best: ${bestScore}`;
  document.getElementById("startBtn").textContent = "Play Again";
  document.getElementById("overlay").classList.remove("hidden");
}

function startGame() {
  document.getElementById("overlay").classList.add("hidden");
  resize();
  initGame();
  running = true;
  loop();
  gaEvent("game_start");
  clearInterval(heartbeatInterval);
  heartbeatInterval = setInterval(() => {
    if (running) gaEvent("heartbeat", { score, level: currentLevelIdx + 1 });
  }, 60000);
}

// ── Input ──────────────────────────────────────────────────
const isSwap = (x, y) => Math.hypot(x - SWP_X, y - SY) < SWP_R + 14;
canvas.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    const { x, y } = toLogical(e.changedTouches[0]);
    mx = x;
    my = y;
    if (running && isSwap(x, y)) swap();
  },
  { passive: false },
);
canvas.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
    const { x, y } = toLogical(e.changedTouches[0]);
    mx = x;
    my = y;
  },
  { passive: false },
);
canvas.addEventListener(
  "touchend",
  (e) => {
    e.preventDefault();
    const { x, y } = toLogical(e.changedTouches[0]);
    if (running && !isSwap(x, y)) fire();
  },
  { passive: false },
);
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect(),
    sf = LW / rect.width;
  mx = (e.clientX - rect.left) * sf;
  my = (e.clientY - rect.top) * sf;
});
canvas.addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect(),
    sf = LW / rect.width;
  const x = (e.clientX - rect.left) * sf,
    y = (e.clientY - rect.top) * sf;
  if (running) {
    if (isSwap(x, y)) swap();
    else fire();
  }
});
window.addEventListener("keydown", (e) => {
  if (!running) return;
  if (e.code === "Space") {
    e.preventDefault();
    swap();
  }
});

document.querySelectorAll(".theme-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.body.className = btn.dataset.theme;
    document
      .querySelectorAll(".theme-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    clearBubbleCache();
  });
});

document.getElementById("startBtn").addEventListener("click", startGame);
document.getElementById("o-hs").textContent =
  `Best: ${localStorage.getItem("bs_bub5") || 0}`;
window.addEventListener("resize", () => {
  if (running) resize();
});
resize();

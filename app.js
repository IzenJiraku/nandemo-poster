// なんでもポスター：写真の色調加工＋日本語組版をブラウザ内だけで行う。
const W = 1200, H = 1800;
const canvas = document.getElementById("poster");
const ctx = canvas.getContext("2d");
canvas.width = W; canvas.height = H;

const state = { img: null, genre: "seishun", focusX: 50, focusY: 50, content: randomContent("seishun") };
const HAS_FILTER = typeof ctx.filter === "string";

// ---------- 画像処理 ----------
function drawPhoto() {
  if (!state.img) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#6b7c8f"); g.addColorStop(0.6, "#a89a86"); g.addColorStop(1, "#3a332c");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    return;
  }
  const img = state.img;
  const s = Math.max(W / img.width, H / img.height);
  const dw = img.width * s, dh = img.height * s;
  const dx = (W - dw) * (state.focusX / 100), dy = (H - dh) * (state.focusY / 100);
  ctx.drawImage(img, dx, dy, dw, dh);
}

function grade(p) {
  const id = ctx.getImageData(0, 0, W, H), a = id.data;
  const { sat = 1, contrast = 1, bright = 1, mul = [1, 1, 1], add = [0, 0, 0], sepia = 0, split = null } = p;
  for (let i = 0; i < a.length; i += 4) {
    let r = a[i] / 255 * bright, g = a[i + 1] / 255 * bright, b = a[i + 2] / 255 * bright;
    r = (r - 0.5) * contrast + 0.5; g = (g - 0.5) * contrast + 0.5; b = (b - 0.5) * contrast + 0.5;
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    r = l + (r - l) * sat; g = l + (g - l) * sat; b = l + (b - l) * sat;
    if (sepia) {
      const sr = l * 1.07 + 0.05, sg = l * 0.95 + 0.02, sb = l * 0.78;
      r += (sr - r) * sepia; g += (sg - g) * sepia; b += (sb - b) * sepia;
    }
    if (split) {
      const t = Math.min(1, Math.max(0, l));
      r += split.shadow[0] * (1 - t) + split.high[0] * t;
      g += split.shadow[1] * (1 - t) + split.high[1] * t;
      b += split.shadow[2] * (1 - t) + split.high[2] * t;
    }
    a[i] = (r * mul[0] + add[0]) * 255;
    a[i + 1] = (g * mul[1] + add[1]) * 255;
    a[i + 2] = (b * mul[2] + add[2]) * 255;
  }
  ctx.putImageData(id, 0, 0);
}

function bloom(amount) {
  if (!HAS_FILTER || !amount) return;
  const tmp = document.createElement("canvas"); tmp.width = W / 4; tmp.height = H / 4;
  const t = tmp.getContext("2d");
  t.filter = "blur(8px)"; t.drawImage(canvas, 0, 0, tmp.width, tmp.height);
  ctx.save(); ctx.globalAlpha = amount; ctx.globalCompositeOperation = "screen";
  ctx.drawImage(tmp, 0, 0, W, H); ctx.restore();
}

function vignette(strength, color = "0,0,0") {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75);
  g.addColorStop(0, `rgba(${color},0)`); g.addColorStop(1, `rgba(${color},${strength})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

// from: 0..1 の位置から下（または上）に向けて color を濃くする
function fadeBottom(from, color, alpha = 0.92) {
  const g = ctx.createLinearGradient(0, H * from, 0, H);
  g.addColorStop(0, `rgba(${color},0)`); g.addColorStop(1, `rgba(${color},${alpha})`);
  ctx.fillStyle = g; ctx.fillRect(0, H * from, W, H * (1 - from));
}
function fadeTop(to, color, alpha = 0.85) {
  const g = ctx.createLinearGradient(0, 0, 0, H * to);
  g.addColorStop(0, `rgba(${color},${alpha})`); g.addColorStop(1, `rgba(${color},0)`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H * to);
}

let noiseCanvas = null;
function grain(amount) {
  if (!amount) return;
  if (!noiseCanvas) {
    noiseCanvas = document.createElement("canvas"); noiseCanvas.width = noiseCanvas.height = 256;
    const n = noiseCanvas.getContext("2d"), id = n.createImageData(256, 256);
    for (let i = 0; i < id.data.length; i += 4) {
      const v = 128 + (Math.random() - 0.5) * 255;
      id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255;
    }
    n.putImageData(id, 0, 0);
  }
  ctx.save(); ctx.globalAlpha = amount; ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = ctx.createPattern(noiseCanvas, "repeat"); ctx.fillRect(0, 0, W, H); ctx.restore();
}

// ---------- 文字組み ----------
function setFont(weight, size, family) { ctx.font = `${weight} ${size}px ${family}`; }

function spacedWidth(text, spacing) {
  let w = 0; for (const c of text) w += ctx.measureText(c).width;
  return w + spacing * Math.max(0, [...text].length - 1);
}

// 横幅 maxW に収まるまで文字サイズを下げる
function fit(text, weight, size, family, maxW, spacingRatio = 0) {
  let s = size;
  for (; s > 12; s -= 2) {
    setFont(weight, s, family);
    if (spacedWidth(text, s * spacingRatio) <= maxW) break;
  }
  return s;
}

function textC(text, y, { weight = 400, size = 40, family = "'Noto Sans JP'", color = "#fff", spacing = 0, maxW = W * 0.88,
  stroke = 0, strokeColor = "#000", shadow = null, x = W / 2, align = "center" } = {}) {
  if (!text) return 0;
  const s = fit(text, weight, size, family, maxW, spacing);
  const sp = s * spacing;
  const tw = spacedWidth(text, sp);
  let cx = align === "center" ? x - tw / 2 : align === "right" ? x - tw : x;
  ctx.save();
  ctx.textBaseline = "alphabetic";
  if (shadow) { ctx.shadowColor = shadow.color; ctx.shadowBlur = shadow.blur; ctx.shadowOffsetX = shadow.x || 0; ctx.shadowOffsetY = shadow.y || 0; }
  for (const c of text) {
    if (stroke) { ctx.lineWidth = stroke; ctx.strokeStyle = strokeColor; ctx.lineJoin = "round"; ctx.strokeText(c, cx, y); }
    ctx.fillStyle = color; ctx.fillText(c, cx, y);
    cx += ctx.measureText(c).width + sp;
  }
  ctx.restore();
  return s;
}

// 縦書き。長音や括弧は回転、句読点は右上に寄せる。
const ROTATE = "ー―─〜～…‥-—「」『』（）()【】〈〉《》";
const SMALL_PUNCT = "、。，．";
function vertical(text, x, y, { weight = 500, size = 44, family = "'Noto Serif JP'", color = "#fff", lineGap = 1.15, shadow = null, maxH = H } = {}) {
  let s = size;
  while (s > 14 && [...text].length * s * lineGap > maxH) s -= 2;
  setFont(weight, s, family);
  ctx.save();
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = color;
  if (shadow) { ctx.shadowColor = shadow.color; ctx.shadowBlur = shadow.blur; }
  let cy = y + s / 2;
  for (const c of text) {
    if (ROTATE.includes(c)) {
      ctx.save(); ctx.translate(x, cy); ctx.rotate(Math.PI / 2); ctx.fillText(c, 0, 0); ctx.restore();
    } else if (SMALL_PUNCT.includes(c)) {
      ctx.fillText(c, x + s * 0.6, cy - s * 0.55);
    } else if (c === " " || c === "　") {
      // 空白は詰める
    } else {
      ctx.fillText(c, x, cy);
    }
    cy += (c === " " || c === "　") ? s * 0.5 : s * lineGap;
  }
  ctx.restore();
  return s;
}

// 長いコピーを句読点で列に分ける（縦書き用）
function splitColumns(text, maxChars) {
  const parts = text.split(/(?<=[、。！？!?])/).map((t) => t.trim()).filter(Boolean);
  const cols = [];
  for (const p of parts) {
    if (cols.length && (cols[cols.length - 1] + p).length <= maxChars) cols[cols.length - 1] += p;
    else cols.push(p);
  }
  return cols;
}

// 月桂樹マーク（映画祭の受賞・招待表記）
function laurel(cx, cy, lines, color) {
  ctx.save(); ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 2.5;
  const R = 110;
  for (const side of [-1, 1]) {
    // 茎
    ctx.beginPath();
    for (let k = 0; k <= 20; k++) {
      const th = Math.PI * (0.62 + 0.62 * (k / 20));
      const px = cx + side * Math.cos(th) * R, py = cy + Math.sin(th) * R * 0.8;
      k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
    // 葉（茎の外側に、上向きに生やす）
    for (let i = 0; i < 8; i++) {
      const th = Math.PI * (0.66 + 0.56 * (i / 7));
      const px = cx + side * Math.cos(th) * R, py = cy + Math.sin(th) * R * 0.8;
      const nx = side * Math.cos(th), ny = Math.sin(th) * 0.8;
      ctx.save(); ctx.translate(px + nx * 12, py + ny * 12);
      ctx.rotate(Math.atan2(ny, nx) + Math.PI / 2 + side * 0.9);
      ctx.beginPath(); ctx.ellipse(0, 0, 5, 14, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
  }
  ctx.restore();
  lines.forEach((l, i) => textC(l, cy - 4 + i * 38, { weight: i ? 700 : 500, size: i ? 30 : 18, family: "'Noto Serif JP'", color, maxW: 180 }));
}

// 指定範囲の背景が明るいか（文字色の自動切り替え用）
function isBright(x, y, w, h) {
  const d = ctx.getImageData(x, y, w, h).data;
  let s = 0, n = 0;
  for (let i = 0; i < d.length; i += 40) { s += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]; n++; }
  return s / n > 165;
}

function castLine(c) { return c.cast.split(/[、,，\/／]+/).map((s) => s.trim()).filter(Boolean).join("　　"); }

// ---------- ジャンル別レイアウト ----------
const LAYOUTS = {
  seishun(c) {
    grade({ sat: 1.15, bright: 1.05, mul: [1.08, 1.0, 0.86], add: [0.04, 0.02, 0] });
    bloom(0.35); fadeBottom(0.6, "30,22,12"); grain(0.08);
    { const g = ctx.createRadialGradient(W, 0, 0, W, 0, W * 0.75); g.addColorStop(0, "rgba(40,28,15,.5)"); g.addColorStop(1, "rgba(40,28,15,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    const cols = splitColumns(c.tagline, 14);
    cols.forEach((col, i) => vertical(col, W - 70 - i * 64, 80, { size: 46, color: "#fffaf0", family: "'Zen Maru Gothic'", weight: 700, shadow: { color: "rgba(40,30,20,.7)", blur: 8 }, maxH: H * 0.5 }));
    textC(c.title, H * 0.75, { weight: 700, size: 110, family: "'Zen Maru Gothic'", color: "#fff8e8", shadow: { color: "rgba(0,0,0,.45)", blur: 18 } });
    textC(c.en, H * 0.75 + 62, { weight: 600, size: 34, family: "'Cormorant Garamond'", color: "#f0d7a0", spacing: 0.2 });
    textC(castLine(c), H * 0.83, { weight: 500, size: 38, color: "#fffaf0", spacing: 0.05 });
    textC(`監督・脚本　${c.director}`, H * 0.87, { size: 24, color: "#dccdb4" });
    textC("製作　なんでもポスター製作委員会", H * 0.87 + 34, { size: 22, color: "#dccdb4" });
    textC(c.date, H * 0.95, { weight: 900, size: 52, color: "#ffdc8c" });
  },
  korean(c) {
    // くすんだ淡色、持ち上げた黒、余白、細い明朝、上部に短評と月桂樹
    grade({ sat: 0.68, contrast: 0.82, bright: 1.04, mul: [0.95, 1.0, 1.0], add: [0.06, 0.07, 0.07] });
    fadeTop(0.3, "250,250,248", 0.35); fadeBottom(0.72, "20,24,26", 0.55); grain(0.1);
    const sh = { color: "rgba(0,0,0,.35)", blur: 10 };
    const bright = isBright(0, 40, W, 360);
    const topCol = bright ? "#2b2b2b" : "#ffffff", topSh = bright ? null : sh;
    const rv = c.reviews || [];
    rv.forEach(([q, src], i) => {
      const x = W * (i === 0 ? 0.27 : 0.73);
      textC(`“${q}”`, 90, { weight: 500, size: 24, family: "'Noto Serif JP'", color: topCol, x, maxW: W * 0.4, shadow: topSh });
      textC(`― ${src}`, 126, { size: 18, color: topCol, x, shadow: topSh });
    });
    laurel(W / 2, 250, ["第12回 なんでも国際映画祭", "公式招待作品"], topCol);
    textC(c.tagline, H * 0.70, { weight: 500, size: 30, family: "'Noto Serif JP'", color: "#ffffff", spacing: 0.08, shadow: sh });
    textC(c.title, H * 0.76, { weight: 500, size: 92, family: "'Noto Serif JP'", color: "#ffffff", spacing: 0.22, maxW: W * 0.8, shadow: sh });
    textC(c.en, H * 0.76 + 60, { weight: 400, size: 30, family: "'Gowun Batang'", color: "rgba(255,255,255,.9)", spacing: 0.3, shadow: sh });
    textC(castLine(c), H * 0.86, { weight: 500, size: 30, color: "#ffffff", spacing: 0.12, shadow: sh });
    textC(`監督・脚本　${c.director}　　撮影　S　　製作　なんでもポスター製作委員会`, H * 0.895, { size: 17, color: "rgba(255,255,255,.75)", spacing: 0.05 });
    textC(c.date, H * 0.945, { weight: 500, size: 34, family: "'Noto Serif JP'", color: "#ffffff", spacing: 0.2, shadow: sh });
  },
  knoir(c) {
    // 冷たいモノクロ寄り、強いコントラスト、筆文字タイトル、赤のアクセント
    grade({ sat: 0.18, contrast: 1.55, bright: 0.78, mul: [0.92, 0.98, 1.04] });
    vignette(0.95); fadeTop(0.22, "0,0,0", 0.9); fadeBottom(0.55, "0,0,0", 0.97); grain(0.16);
    textC(castLine(c), 110, { weight: 700, size: 46, color: "#ffffff", spacing: 0.18 });
    textC(c.tagline, 175, { weight: 500, size: 32, family: "'Noto Serif JP'", color: "#d0d0d0", spacing: 0.06 });
    const y = H * 0.77;
    textC(c.title, y, { weight: 400, size: 210, family: "'Yuji Boku'", color: "#ffffff", maxW: W * 0.9, shadow: { color: "rgba(0,0,0,.9)", blur: 24 } });
    ctx.save(); ctx.translate(W / 2, y + 30); ctx.rotate(-0.06);
    ctx.fillStyle = "#c8101c"; ctx.fillRect(-W * 0.33, -4, W * 0.66, 8); ctx.restore();
    textC(c.en, y + 95, { weight: 700, size: 40, family: "'Noto Sans KR'", color: "#d81c26", spacing: 0.3 });
    textC(`監督　${c.director}　　製作　なんでもポスター製作委員会`, H * 0.89, { size: 20, color: "#8d8d8d", spacing: 0.05 });
    textC(`${c.date}  대개봉`, H * 0.94, { weight: 900, size: 58, family: "'Noto Sans KR'", color: "#ffffff", spacing: 0.08 });
  },
  horror(c) {
    grade({ sat: 0.3, contrast: 1.35, bright: 0.72, mul: [0.8, 0.92, 0.95] });
    vignette(0.9); fadeTop(0.16, "4,6,8"); fadeBottom(0.6, "4,6,8", 0.95); grain(0.2);
    textC(c.tagline, 100, { weight: 500, size: 42, family: "'Noto Serif JP'", color: "#e1e1dc" });
    const y = H * 0.76;
    // ぶれた残像
    textC(c.title, y + 6, { weight: 900, size: 190, family: "'Noto Serif JP'", color: "rgba(120,0,0,.55)", spacing: 0.12, x: W / 2 + 8 });
    textC(c.title, y, { weight: 900, size: 190, family: "'Noto Serif JP'", color: "#c40c0c", spacing: 0.12, shadow: { color: "rgba(255,0,0,.35)", blur: 30 } });
    textC(c.en, y + 80, { weight: 700, size: 40, family: "'Cormorant Garamond'", color: "#c8c8c3", spacing: 0.35 });
    textC(`出演　${castLine(c)}`, H * 0.86, { size: 26, color: "#aaaaa5" });
    textC(`監督　${c.director}　製作　なんでもポスター製作委員会`, H * 0.86 + 38, { size: 24, color: "#aaaaa5" });
    textC(c.date, H * 0.94, { weight: 700, size: 72, family: "'Cormorant Garamond'", color: "#dcdcd7", spacing: 0.06 });
    textC(c.rating || "R15+", H * 0.975, { size: 26, color: "#c40c0c" });
  },
  suspense(c) {
    grade({ sat: 0.45, contrast: 1.45, bright: 0.85, mul: [0.9, 0.97, 1.06] });
    vignette(0.6); fadeTop(0.14, "0,0,0", 0.8); fadeBottom(0.55, "0,0,0", 0.95); grain(0.12);
    textC(c.en, 90, { weight: 700, size: 30, color: "#d8d8d8", spacing: 0.4 });
    textC(c.tagline, H * 0.68, { weight: 700, size: 46, color: "#ffffff" });
    ctx.fillStyle = "#d4111e"; ctx.fillRect(W * 0.2, H * 0.71, W * 0.6, 6);
    textC(c.title, H * 0.79, { weight: 900, size: 150, color: "#ffffff", spacing: 0.06, shadow: { color: "rgba(0,0,0,.8)", blur: 20 } });
    textC(castLine(c), H * 0.85, { weight: 700, size: 38, color: "#e6e6e6", spacing: 0.04 });
    textC(`監督　${c.director}`, H * 0.885, { size: 24, color: "#9a9a9a" });
    textC(c.date, H * 0.95, { weight: 900, size: 54, color: "#d4111e", spacing: 0.05 });
  },
  romance(c) {
    grade({ sat: 0.9, contrast: 0.9, bright: 1.12, mul: [1.05, 0.96, 1.0], add: [0.06, 0.03, 0.06] });
    bloom(0.5); fadeTop(0.18, "70,35,55", 0.55); fadeBottom(0.58, "70,35,55", 0.85); grain(0.05);
    textC(c.tagline, 110, { weight: 600, size: 44, family: "'Shippori Mincho B1'", color: "#ffffff", shadow: { color: "rgba(90,40,60,.6)", blur: 14 } });
    textC(c.title, H * 0.77, { weight: 800, size: 120, family: "'Shippori Mincho B1'", color: "#ffffff", shadow: { color: "rgba(90,30,60,.6)", blur: 22 } });
    textC(c.en, H * 0.77 + 66, { weight: 500, size: 40, family: "'Cormorant Garamond'", color: "#ffd6e4", spacing: 0.12 });
    textC(castLine(c), H * 0.86, { weight: 600, size: 38, family: "'Shippori Mincho B1'", color: "#fff4f8", spacing: 0.05 });
    textC(`監督　${c.director}`, H * 0.895, { size: 24, color: "#f0d0dc" });
    textC(c.date, H * 0.95, { weight: 800, size: 48, family: "'Shippori Mincho B1'", color: "#ffc6d9" });
  },
  sf(c) {
    grade({ sat: 1.1, contrast: 1.25, bright: 0.9, split: { shadow: [-0.05, 0.06, 0.12], high: [0.12, 0.04, -0.06] } });
    vignette(0.7, "0,8,20"); fadeTop(0.15, "2,8,18", 0.85); fadeBottom(0.58, "2,8,18", 0.95); grain(0.1);
    ctx.fillStyle = "rgba(0,0,0,.12)"; for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
    textC(c.tagline, 100, { weight: 500, size: 40, color: "#bfefff", shadow: { color: "rgba(0,200,255,.6)", blur: 12 } });
    textC(c.title, H * 0.77, { weight: 900, size: 130, color: "#e8fbff", spacing: 0.15, shadow: { color: "rgba(0,210,255,.9)", blur: 30 } });
    textC(c.en, H * 0.77 + 70, { weight: 700, size: 38, family: "'Orbitron'", color: "#5fe1ff", spacing: 0.25 });
    textC(castLine(c), H * 0.86, { weight: 500, size: 36, color: "#d6f4ff", spacing: 0.05 });
    textC(`監督　${c.director}`, H * 0.895, { size: 24, color: "#7fa9b8" });
    textC(c.date, H * 0.95, { weight: 700, size: 64, family: "'Orbitron'", color: "#ffb35c", spacing: 0.12, shadow: { color: "rgba(255,140,0,.6)", blur: 18 } });
  },
  comedy(c) {
    grade({ sat: 1.45, contrast: 1.1, bright: 1.08 });
    fadeBottom(0.7, "0,0,0", 0.55);
    // 吹き出し
    ctx.save(); ctx.translate(70, 90); ctx.rotate(-0.04);
    setFont(700, 40, "'Noto Sans JP'");
    const bw = Math.min(W - 160, ctx.measureText(c.tagline).width + 70);
    ctx.fillStyle = "#fff"; ctx.strokeStyle = "#111"; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.roundRect(0, 0, bw, 90, 45); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(80, 86); ctx.lineTo(60, 140); ctx.lineTo(130, 86); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillRect(70, 80, 70, 10);
    textC(c.tagline, 60, { weight: 700, size: 40, color: "#111", x: 35, align: "left", maxW: bw - 70 });
    ctx.restore();
    ctx.save(); ctx.translate(W / 2, H * 0.76); ctx.rotate(-0.05); ctx.translate(-W / 2, -H * 0.76);
    textC(c.title, H * 0.76, { weight: 400, size: 130, family: "'Dela Gothic One'", color: "#ffe14d", stroke: 22, strokeColor: "#111" });
    ctx.restore();
    textC(c.en, H * 0.80, { weight: 900, size: 30, color: "#ffffff", stroke: 8, strokeColor: "#111", spacing: 0.1 });
    textC(castLine(c), H * 0.86, { weight: 900, size: 40, color: "#ffffff", stroke: 10, strokeColor: "#111" });
    textC(`監督　${c.director}`, H * 0.895, { weight: 700, size: 26, color: "#ffffff", stroke: 6, strokeColor: "#111" });
    ctx.fillStyle = "#e8202a"; ctx.fillRect(0, H * 0.925, W, 110);
    textC(c.date, H * 0.925 + 76, { weight: 400, size: 56, family: "'Dela Gothic One'", color: "#fff" });
  },
  showa(c) {
    grade({ sat: 0.7, contrast: 0.95, sepia: 0.55, add: [0.06, 0.05, 0.03] });
    vignette(0.55, "40,25,10"); fadeBottom(0.7, "30,18,8", 0.9); grain(0.22);
    // 紙の額縁
    const m = 36;
    ctx.fillStyle = "#efe6d2";
    ctx.fillRect(0, 0, W, m); ctx.fillRect(0, H - m, W, m); ctx.fillRect(0, 0, m, H); ctx.fillRect(W - m, 0, m, H);
    ctx.strokeStyle = "#8a2a1a"; ctx.lineWidth = 4; ctx.strokeRect(m + 14, m + 14, W - 2 * m - 28, H - 2 * m - 28);
    const ts = vertical(c.title, W - 150, 110, { weight: 400, size: 150, family: "'Yuji Syuku'", color: "#fbf3e2", lineGap: 1.05, shadow: { color: "rgba(30,10,0,.85)", blur: 14 }, maxH: H * 0.7 });
    const tx = W - 150 - ts * 0.6 - 60;
    splitColumns(c.tagline, 16).forEach((col, i) => vertical(col, tx - i * 56, 130, { weight: 700, size: 42, family: "'Shippori Mincho B1'", color: "#f6e7c8", shadow: { color: "rgba(0,0,0,.8)", blur: 8 }, maxH: H * 0.55 }));
    textC(c.en, H * 0.84, { weight: 600, size: 28, family: "'Cormorant Garamond'", color: "#e8d3a8", spacing: 0.25 });
    textC(castLine(c), H * 0.88, { weight: 800, size: 40, family: "'Shippori Mincho B1'", color: "#fbf3e2", spacing: 0.06 });
    textC(`監督　${c.director}`, H * 0.905 + 6, { weight: 600, size: 24, family: "'Shippori Mincho B1'", color: "#e8d3a8" });
    textC(c.date, H * 0.95, { weight: 800, size: 46, family: "'Shippori Mincho B1'", color: "#ffd27a", spacing: 0.08 });
  },
};

// ---------- フォント読み込み ----------
const FONT_SPECS = [
  "400 40px 'Noto Sans JP'", "500 40px 'Noto Sans JP'", "700 40px 'Noto Sans JP'", "900 40px 'Noto Sans JP'",
  "500 40px 'Noto Serif JP'", "900 40px 'Noto Serif JP'",
  "700 40px 'Zen Maru Gothic'", "600 40px 'Shippori Mincho B1'", "800 40px 'Shippori Mincho B1'",
  "400 40px 'Dela Gothic One'", "400 40px 'Yuji Syuku'",
  "500 40px 'Cormorant Garamond'", "600 40px 'Cormorant Garamond'", "700 40px 'Cormorant Garamond'",
  "700 40px 'Orbitron'", "400 40px 'Gowun Batang'", "700 40px 'Noto Sans KR'", "900 40px 'Noto Sans KR'", "400 40px 'Yuji Boku'",
];
async function loadFonts(text) {
  if (!document.fonts) return;
  try {
    await Promise.race([
      Promise.all(FONT_SPECS.map((f) => document.fonts.load(f, text))),
      new Promise((r) => setTimeout(r, 6000)),
    ]);
  } catch (e) { /* 読めなくても既定フォントで描く */ }
}

// ---------- 描画とUI ----------
let renderId = 0;
async function render() {
  const id = ++renderId;
  const c = state.content;
  const text = Object.values(c).flat(2).join("") + "대개봉第12回なんでも国際映画祭公式招待作品撮影" + "監督脚本製作なんでもポスター委員会出演";
  await loadFonts(text);
  if (id !== renderId) return;
  ctx.save(); ctx.clearRect(0, 0, W, H);
  drawPhoto();
  LAYOUTS[state.genre]({ ...c, rating: GENRES[state.genre].rating?.() });
  ctx.restore();
}

const $ = (s) => document.querySelector(s);
const FIELDS = ["title", "en", "tagline", "cast", "director", "date"];

function syncFields() { for (const f of FIELDS) $(`#f-${f}`).value = state.content[f]; }

function buildGenreChips() {
  const box = $("#genres");
  const keys = [...Object.keys(GENRES), "random"];
  for (const k of keys) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.dataset.genre = k;
    b.textContent = k === "random" ? "おまかせ" : GENRES[k].label;
    b.addEventListener("click", () => {
      const g = k === "random" ? pickGenre() : k;
      setGenre(g, true);
    });
    box.appendChild(b);
  }
}
function pickGenre() {
  const ks = Object.keys(GENRES).filter((k) => k !== state.genre);
  return ks[Math.floor(Math.random() * ks.length)];
}
function setGenre(g, refreshText) {
  state.genre = g;
  document.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", b.dataset.genre === g));
  if (refreshText) { state.content = randomContent(g); syncFields(); }
  render();
}

let t;
function onInput() {
  for (const f of FIELDS) state.content[f] = $(`#f-${f}`).value;
  clearTimeout(t); t = setTimeout(render, 200);
}

function rollField(f) {
  const r = randomContent(state.genre);
  if (f === "title" || f === "en") { state.content.title = r.title; state.content.en = r.en; }
  else state.content[f] = r[f];
  syncFields(); render();
}

$("#photo").addEventListener("change", (e) => {
  const file = e.target.files[0]; if (!file) return;
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => { state.img = img; $("#drop-hint").hidden = true; render(); };
  img.src = url;
});
for (const f of FIELDS) $(`#f-${f}`).addEventListener("input", onInput);
document.querySelectorAll("[data-roll]").forEach((b) => b.addEventListener("click", () => rollField(b.dataset.roll)));
$("#all-random").addEventListener("click", () => setGenre(pickGenre(), true));
$("#text-random").addEventListener("click", () => { state.content = randomContent(state.genre); syncFields(); render(); });
for (const axis of ["X", "Y"]) {
  $(`#focus${axis}`).addEventListener("input", (e) => { state[`focus${axis}`] = +e.target.value; clearTimeout(t); t = setTimeout(render, 60); });
}
$("#save").addEventListener("click", () => {
  canvas.toBlob((blob) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${state.content.title || "poster"}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, "image/png");
});

buildGenreChips();
syncFields();
setGenre(state.genre, false);

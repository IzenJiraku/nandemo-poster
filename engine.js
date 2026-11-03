// なんでもポスター：写真の色調加工＋日本語組版をブラウザ内だけで行う。
// 「ジャンル（色・書体・装飾）」と「構図（文字の置き方）」を分けて、自由に組み合わせる。
const W = 1200, H = 1800;
const canvas = document.getElementById("poster");
const ctx = canvas.getContext("2d");
canvas.width = W; canvas.height = H;

const HAS_FILTER = typeof ctx.filter === "string";

// =====================================================================
// 画像処理
// =====================================================================
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
  ctx.drawImage(img, (W - dw) * (state.focusX / 100), (H - dh) * (state.focusY / 100), dw, dh);
}

function grade(p) {
  const id = ctx.getImageData(0, 0, W, H), a = id.data;
  const { sat = 1, contrast = 1, bright = 1, mul = [1, 1, 1], add = [0, 0, 0], sepia = 0, split = null, duo = null } = p;
  for (let i = 0; i < a.length; i += 4) {
    let r = a[i] / 255 * bright, g = a[i + 1] / 255 * bright, b = a[i + 2] / 255 * bright;
    r = (r - 0.5) * contrast + 0.5; g = (g - 0.5) * contrast + 0.5; b = (b - 0.5) * contrast + 0.5;
    const l = 0.299 * r + 0.587 * g + 0.114 * b;
    r = l + (r - l) * sat; g = l + (g - l) * sat; b = l + (b - l) * sat;
    if (sepia) {
      const sr = l * 1.07 + 0.05, sg = l * 0.95 + 0.02, sb = l * 0.78;
      r += (sr - r) * sepia; g += (sg - g) * sepia; b += (sb - b) * sepia;
    }
    if (duo) {
      const t = Math.min(1, Math.max(0, l));
      r = duo[0][0] + (duo[1][0] - duo[0][0]) * t; g = duo[0][1] + (duo[1][1] - duo[0][1]) * t; b = duo[0][2] + (duo[1][2] - duo[0][2]) * t;
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

// ---- 文字を読みやすくするための影（スクリム） ----
let S = null; // 描画中のジャンルスタイル
function scrimBottom(from, alpha = 0.92) {
  const a = alpha * (S.scrimAlpha ?? 1);
  const g = ctx.createLinearGradient(0, H * from, 0, H);
  g.addColorStop(0, `rgba(${S.scrim},0)`); g.addColorStop(1, `rgba(${S.scrim},${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, H * from, W, H * (1 - from));
}
function scrimTop(to, alpha = 0.85) {
  const a = alpha * (S.scrimAlpha ?? 1);
  const g = ctx.createLinearGradient(0, 0, 0, H * to);
  g.addColorStop(0, `rgba(${S.scrim},${a})`); g.addColorStop(1, `rgba(${S.scrim},0)`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H * to);
}
function scrimRadial(x, y, r, alpha = 0.6) {
  const a = alpha * (S.scrimAlpha ?? 1);
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${S.scrim},${a})`); g.addColorStop(1, `rgba(${S.scrim},0)`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function scrimBand(cy, half, alpha = 0.55) {
  const a = alpha * (S.scrimAlpha ?? 1);
  const g = ctx.createLinearGradient(0, cy - half, 0, cy + half);
  g.addColorStop(0, `rgba(${S.scrim},0)`); g.addColorStop(0.5, `rgba(${S.scrim},${a})`); g.addColorStop(1, `rgba(${S.scrim},0)`);
  ctx.fillStyle = g; ctx.fillRect(0, cy - half, W, half * 2);
}

// 今のキャンバスを写し取る（額縁・窓・帯などの構図で使う）
function snapshot() {
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  c.getContext("2d").drawImage(canvas, 0, 0); return c;
}
// 写真を矩形 (x,y,w,h) に cover で収める
function drawSnapInto(snap, x, y, w, h) {
  const s = Math.max(w / W, h / H);
  const sw = w / s, sh = h / s;
  ctx.drawImage(snap, (W - sw) / 2, (H - sh) * (state.focusY / 100), sw, sh, x, y, w, h);
}

// 文字色の自動切り替え用。スクリムを重ねる前の写真の明るさで判定する。
let BASE = null;
function isBright(x, y, w, h) {
  if (!BASE) return false;
  const x1 = Math.min(W, x + w), y1 = Math.min(H, y + h);
  let s = 0, n = 0;
  for (let yy = Math.max(0, y); yy < y1; yy += 6) for (let xx = Math.max(0, x); xx < x1; xx += 6) {
    const i = (yy * W + xx) * 4; s += 0.299 * BASE[i] + 0.587 * BASE[i + 1] + 0.114 * BASE[i + 2]; n++;
  }
  return n > 0 && s / n > (S && S.autoInkThreshold || 165);
}

// =====================================================================
// 文字組みの部品
// =====================================================================
function setFont(weight, size, family) { ctx.font = `${weight} ${size}px ${family}`; }
function spacedWidth(text, spacing) {
  let w = 0; for (const c of text) w += ctx.measureText(c).width;
  return w + spacing * Math.max(0, [...text].length - 1);
}
function fit(text, weight, size, family, maxW, spacingRatio = 0) {
  let s = size;
  for (; s > 12; s -= 2) {
    setFont(weight, s, family);
    if (spacedWidth(text, s * spacingRatio) <= maxW) break;
  }
  return s;
}

// 横組み。align は center / left / right。{size, width} を返す。
function text(str, x, y, { weight = 400, size = 40, family = "'Noto Sans JP'", color = "#fff", spacing = 0, maxW = W * 0.88,
  stroke = 0, strokeColor = "#000", shadow = null, align = "center" } = {}) {
  if (!str) return { size: 0, width: 0 };
  const s = fit(str, weight, size, family, maxW, spacing);
  const sp = s * spacing, tw = spacedWidth(str, sp);
  let cx = align === "center" ? x - tw / 2 : align === "right" ? x - tw : x;
  ctx.save();
  if (shadow) { ctx.shadowColor = shadow.color; ctx.shadowBlur = shadow.blur; ctx.shadowOffsetX = shadow.x || 0; ctx.shadowOffsetY = shadow.y || 0; }
  for (const c of str) {
    if (stroke) { ctx.lineWidth = stroke; ctx.strokeStyle = strokeColor; ctx.lineJoin = "round"; ctx.strokeText(c, cx, y); }
    ctx.fillStyle = color; ctx.fillText(c, cx, y);
    cx += ctx.measureText(c).width + sp;
  }
  ctx.restore();
  return { size: s, width: tw };
}

// 縦組み。長音や括弧は回転、句読点は右上に寄せる。使った文字サイズを返す。
const ROTATE = "ー―─〜～…‥-—「」『』（）()【】〈〉《》";
const SMALL_PUNCT = "、。，．";
function vtext(str, x, y, { weight = 500, size = 44, family = "'Noto Serif JP'", color = "#fff", lineGap = 1.15, shadow = null, maxH = H, stroke = 0, strokeColor = "#000" } = {}) {
  let s = size;
  const n = [...str].filter((c) => c !== " " && c !== "　").length;
  while (s > 14 && n * s * lineGap > maxH) s -= 2;
  setFont(weight, s, family);
  ctx.save();
  ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = color;
  if (shadow) { ctx.shadowColor = shadow.color; ctx.shadowBlur = shadow.blur; }
  let cy = y + s / 2;
  const put = (c, px, py) => {
    if (stroke) { ctx.lineWidth = stroke; ctx.strokeStyle = strokeColor; ctx.lineJoin = "round"; ctx.strokeText(c, px, py); }
    ctx.fillText(c, px, py);
  };
  for (const c of str) {
    if (c === " " || c === "　") { cy += s * 0.4; continue; }
    if (ROTATE.includes(c)) { ctx.save(); ctx.translate(x, cy); ctx.rotate(Math.PI / 2); put(c, 0, 0); ctx.restore(); }
    else if (SMALL_PUNCT.includes(c)) put(c, x + s * 0.6, cy - s * 0.55);
    else put(c, x, cy);
    cy += s * lineGap;
  }
  ctx.restore();
  return s;
}

// 長い文を句読点で区切って列（行）に分ける
function splitPhrases(str, maxChars) {
  const parts = str.split(/(?<=[、。！？!?])/).map((t) => t.trim()).filter(Boolean);
  const out = [];
  for (const p of parts) {
    if (out.length && (out[out.length - 1] + p).length <= maxChars) out[out.length - 1] += p;
    else out.push(p);
  }
  return out;
}
// タイトルを2〜3行に割る（巨大タイポ用）
function splitTitle(str) {
  const byPunct = str.split(/(?<=[、・,，！!？?])|\s+/).map((t) => t.trim()).filter(Boolean);
  if (byPunct.length >= 2 && byPunct.length <= 3) return byPunct.map((t) => t.replace(/[・]$/, ""));
  const chars = [...str.replace(/\s/g, "")];
  if (chars.length <= 3) return [chars.join("")];
  // ひらがな→漢字・カタカナの切れ目や「の」の後ろなど、自然な区切りのうち真ん中に近い所で割る
  const isHira = (c) => /[\u3041-\u309f]/.test(c);
  const cuts = [];
  for (let i = 1; i < chars.length; i++) {
    if ((isHira(chars[i - 1]) && !isHira(chars[i])) || chars[i - 1] === "の") cuts.push(i);
  }
  const lines = chars.length >= 11 ? 3 : 2;
  const out = []; let start = 0;
  for (let k = 1; k < lines; k++) {
    const target = Math.round((chars.length * k) / lines);
    const cand = cuts.filter((i) => i > start + 1 && i < chars.length);
    const best = cand.length ? cand.reduce((a, b) => (Math.abs(b - target) < Math.abs(a - target) ? b : a)) : target;
    const cut = Math.abs(best - target) <= 2 ? best : target;
    out.push(chars.slice(start, cut).join("")); start = cut;
  }
  out.push(chars.slice(start).join(""));
  return out.filter(Boolean);
}
function castList(c) { return c.cast.split(/[、,，\/／]+/).map((s) => s.trim()).filter(Boolean); }
function castLine(c) { return castList(c).join("　　"); }

// ---- ジャンルのスタイルを使って各要素を描く ----
// onPaper: 無地の背景（額縁・帯など）に置くときは ink 色を使う
let AUTO_DARK = false;
function autoInk(y0, y1, x0 = W * 0.15, x1 = W * 0.85) { AUTO_DARK = !!S.autoInk && isBright(x0, Math.max(0, y0), x1 - x0, Math.max(10, y1 - y0)); }
function colorOf(base, onPaper) { return onPaper ? S.ink : AUTO_DARK ? "#24272a" : base; }
function shadowOf(sh, onPaper) { return onPaper || AUTO_DARK ? null : sh; }

function titleFill(t, x, y, sz, col) {
  if (t.fill === "chrome") {
    const g = ctx.createLinearGradient(0, y - sz * 0.9, 0, y + sz * 0.1);
    g.addColorStop(0, "#ffffff"); g.addColorStop(0.45, "#b8c6d6"); g.addColorStop(0.5, "#3b4a5c"); g.addColorStop(0.62, "#e9eef5"); g.addColorStop(1, "#8696a8");
    return g;
  }
  if (t.fill === "gold") {
    const g = ctx.createLinearGradient(0, y - sz * 0.9, 0, y + sz * 0.1);
    g.addColorStop(0, "#fff6d5"); g.addColorStop(0.45, "#e6c46a"); g.addColorStop(0.55, "#a8782a"); g.addColorStop(1, "#f3dc94");
    return g;
  }
  if (t.fill === "fire") {
    const g = ctx.createLinearGradient(0, y - sz * 0.9, 0, y + sz * 0.1);
    g.addColorStop(0, "#fff3a0"); g.addColorStop(0.5, "#ff9a1f"); g.addColorStop(1, "#d2201a");
    return g;
  }
  return col;
}
function drawTitle(c, x, y, { size = 120, align = "center", maxW = W * 0.88, onPaper = false } = {}) {
  const t = S.title;
  const col = onPaper ? (t.paperColor || S.ink) : colorOf(t.color, false);
  const sz = size * (t.scale || 1);
  const opts = { weight: t.weight, size: sz, family: t.family, spacing: t.spacing || 0, maxW, align,
    stroke: onPaper ? t.paperStroke || 0 : t.stroke || 0, strokeColor: t.strokeColor, shadow: shadowOf(t.shadow, onPaper) };
  ctx.save();
  if (t.rotate) { ctx.translate(x, y); ctx.rotate(t.rotate); ctx.translate(-x, -y); }
  if (t.deco === "ghost") text(c.title, x + sz * 0.05, y + sz * 0.04, { ...opts, color: "rgba(120,0,0,.55)", shadow: null });
  if (t.deco === "neon" && !onPaper) {
    text(c.title, x, y, { ...opts, color: t.glow || "#ff2bd6", shadow: { color: t.glow || "#ff2bd6", blur: 40 } });
  }
  if (t.deco === "outline" && !onPaper) {
    ctx.save(); ctx.globalAlpha = 0.9;
    text(c.title, x, y, { ...opts, color: "rgba(0,0,0,0)", stroke: 3, strokeColor: col, shadow: null });
    ctx.restore(); ctx.restore();
    const fs = fit(c.title, t.weight, sz, t.family, maxW, t.spacing || 0);
    return { size: fs, width: spacedWidth(c.title, fs * (t.spacing || 0)) };
  }
  const fill = onPaper ? col : titleFill(t, x, y, fit(c.title, t.weight, sz, t.family, maxW, t.spacing || 0), col);
  const r = text(c.title, x, y, { ...opts, color: fill });
  ctx.restore();
  const left = align === "center" ? x - r.width / 2 : align === "right" ? x - r.width : x;
  if (t.deco === "slash") {
    ctx.save(); ctx.translate(left + r.width / 2, y + r.size * 0.18); ctx.rotate(-0.06);
    ctx.fillStyle = S.accent; ctx.fillRect(-r.width * 0.42, -4, r.width * 0.84, 8); ctx.restore();
  }
  if (t.deco === "redline") { ctx.fillStyle = S.accent; ctx.fillRect(left + r.width * 0.15, y - r.size * 1.05, r.width * 0.7, 6); }
  if (t.deco === "box") {
    ctx.save(); ctx.strokeStyle = onPaper ? col : S.accent; ctx.lineWidth = 3;
    const pad = r.size * 0.35;
    ctx.strokeRect(left - pad, y - r.size * 0.98 - pad * 0.4, r.width + pad * 2, r.size * 1.2 + pad * 0.8); ctx.restore();
  }
  if (t.deco === "seal") seal([...c.title][0], left + r.width + r.size * 0.25, y - r.size * 0.95, r.size * 0.55);
  if (t.deco === "underline") { ctx.fillStyle = onPaper ? col : S.accent; ctx.fillRect(left, y + r.size * 0.22, r.width, Math.max(3, r.size * 0.04)); }
  return r;
}
// 朱色の落款（はんこ）
function seal(ch, x, y, s) {
  ctx.save();
  ctx.fillStyle = "#b8231c"; ctx.fillRect(x, y, s, s);
  ctx.strokeStyle = "rgba(255,240,230,.85)"; ctx.lineWidth = s * 0.05; ctx.strokeRect(x + s * 0.08, y + s * 0.08, s * 0.84, s * 0.84);
  setFont(400, s * 0.62, "'Yuji Boku'"); ctx.fillStyle = "#fff4ea"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(ch, x + s / 2, y + s / 2 + s * 0.03);
  ctx.restore();
}
function drawVTitle(c, x, y, { size = 140, maxH = H * 0.66, onPaper = false } = {}) {
  const t = S.title;
  if (t.deco === "seal") {
    const n = [...c.title].length; let s = size * (t.scale || 1);
    while (s > 14 && n * s * 1.05 > maxH) s -= 2;
    seal([...c.title][0], x - s * 0.3, y + n * s * 1.05 + s * 0.2, s * 0.6);
  }
  return vtext(c.title, x, y, { weight: t.weight, size: size * (t.scale || 1), family: t.family,
    color: onPaper ? (t.paperColor || S.ink) : colorOf(t.color), lineGap: 1.05, maxH,
    stroke: onPaper ? t.paperStroke || 0 : t.stroke || 0, strokeColor: t.strokeColor, shadow: shadowOf(t.shadow, onPaper) });
}
function drawSub(c, x, y, { size = 34, align = "center", maxW = W * 0.8, onPaper = false } = {}) {
  const s = S.sub;
  return text(c.en, x, y, { weight: s.weight, size, family: s.family, spacing: s.spacing || 0, align, maxW,
    color: colorOf(s.color, onPaper), stroke: onPaper ? 0 : s.stroke || 0, strokeColor: s.strokeColor, shadow: shadowOf(s.shadow, onPaper) });
}
function drawTagline(c, x, y, { size = 40, align = "center", maxW = W * 0.86, onPaper = false } = {}) {
  const s = S.tagline;
  if (s.bubble && !onPaper) return bubble(c.tagline, x, y, size, align, maxW);
  return text(c.tagline, x, y, { weight: s.weight, size, family: s.family, spacing: s.spacing || 0, align, maxW,
    color: colorOf(s.color, onPaper), stroke: onPaper ? 0 : s.stroke || 0, strokeColor: s.strokeColor, shadow: shadowOf(s.shadow, onPaper) });
}
function drawVTagline(c, x, y, { size = 42, maxH = H * 0.5, maxChars = 14, dir = -1, onPaper = false } = {}) {
  const s = S.tagline;
  const col = s.bubble ? "#ffffff" : colorOf(s.color, onPaper);
  splitPhrases(c.tagline, maxChars).forEach((line, i) =>
    vtext(line, x + dir * i * size * 1.35, y, { weight: s.weight, size, family: s.family, color: col,
      stroke: s.bubble ? 8 : 0, strokeColor: "#111",
      shadow: shadowOf(s.shadow || { color: "rgba(0,0,0,.6)", blur: 8 }, onPaper), maxH }));
}
function drawCast(c, x, y, { size = 36, align = "center", maxW = W * 0.88, onPaper = false } = {}) {
  const s = S.body;
  return text(castLine(c), x, y, { weight: s.castWeight || 500, size, family: s.family, spacing: s.castSpacing ?? 0.05, align, maxW,
    color: colorOf(s.color, onPaper), stroke: onPaper ? 0 : s.stroke || 0, strokeColor: s.strokeColor, shadow: shadowOf(s.shadow, onPaper) });
}
function creditsText(c) {
  const s = c.staff || {};
  return [`監督・脚本　${c.director}`, s.photo && `撮影　${s.photo}`, s.music && `音楽　${s.music}`, s.edit && `編集　${s.edit}`, "製作　なんでもポスター製作委員会"]
    .filter(Boolean).join("　　");
}
function drawCredits(c, x, y, { size = 22, align = "center", maxW = W * 0.86, onPaper = false } = {}) {
  const s = S.body;
  const col = onPaper ? S.ink : AUTO_DARK ? "#3a3d40" : s.dim || s.color;
  text(creditsText(c), x, y,
    { size, align, maxW, color: col, family: "'Noto Sans JP'", spacing: 0.02, stroke: onPaper ? 0 : s.stroke ? 5 : 0, strokeColor: s.strokeColor });
}
// 洋画のポスター下部によくある、縦長に詰めたクレジットの塊（ビリングブロック）
function billingBlock(c, x, y, w, { color = "#fff", align = "center", lines = 3, size = 26 } = {}) {
  const s = c.staff || {};
  const parts = [`なんでもポスター製作委員会 提供`, `${castList(c).join("　")}`, `監督・脚本 ${c.director}`,
    s.photo && `撮影 ${s.photo}`, s.music && `音楽 ${s.music}`, s.edit && `編集 ${s.edit}`, s.art && `美術 ${s.art}`,
    `製作 なんでもポスター製作委員会`, `配給 銀杏ピクチャーズ`];
  const all = parts.filter(Boolean).join("　");
  // 横 0.62 倍に縮めて「長体」をかけ、指定の行数に収める
  const sx = 0.62;
  ctx.save(); ctx.fillStyle = color;
  setFont(500, size, "'Noto Sans JP'");
  const chars = [...all];
  let line = "", out = [];
  for (const ch of chars) {
    if (ctx.measureText(line + ch).width * sx > w && line) { out.push(line); line = ""; if (out.length >= lines) break; }
    line += ch;
  }
  if (out.length < lines && line) out.push(line);
  out.forEach((l, i) => {
    const lw = ctx.measureText(l).width * sx;
    const lx = align === "center" ? x - lw / 2 : align === "right" ? x - lw : x;
    ctx.save(); ctx.translate(lx, y + i * size * 1.05); ctx.scale(sx, 1); ctx.fillText(l, 0, 0); ctx.restore();
  });
  ctx.restore();
  return out.length * size * 1.05;
}
function drawDate(c, x, y, { size = 50, align = "center", onPaper = false } = {}) {
  const d = S.date;
  const str = c.date + (S.dateSuffix || "");
  const r = text(str, x, y, { weight: d.weight, size, family: d.family, spacing: d.spacing || 0, align, maxW: W * 0.86,
    color: onPaper ? (d.paperColor || S.accent) : colorOf(d.color), stroke: onPaper ? 0 : d.stroke || 0, strokeColor: d.strokeColor, shadow: shadowOf(d.shadow, onPaper) });
  if (c.note) text(c.note, x, y + size * 0.62, { size: size * 0.45, align, color: S.accent });
  return r;
}
function bubble(str, x, y, size, align, maxW) {
  ctx.save();
  const s = fit(str, 700, size, "'Noto Sans JP'", maxW - 70);
  const bw = ctx.measureText(str).width + 70, bh = s * 2.2;
  const bx = align === "center" ? x - bw / 2 : align === "right" ? x - bw : x;
  const by = y - s * 1.45;
  ctx.translate(bx + bw / 2, by + bh / 2); ctx.rotate(-0.035); ctx.translate(-(bx + bw / 2), -(by + bh / 2));
  ctx.fillStyle = "#fff"; ctx.strokeStyle = "#111"; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, bh / 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(bx + 80, by + bh - 4); ctx.lineTo(bx + 60, by + bh + 50); ctx.lineTo(bx + 130, by + bh - 4); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillRect(bx + 70, by + bh - 12, 70, 12);
  text(str, bx + 35, by + bh / 2 + s * 0.36, { weight: 700, size: s, color: "#111", align: "left", maxW: bw - 70 });
  ctx.restore();
  return { size: s, width: bw };
}

// 月桂樹マーク
function laurel(cx, cy, lines, color) {
  ctx.save(); ctx.fillStyle = color; ctx.strokeStyle = color; ctx.lineWidth = 2.5;
  const R = 110;
  for (const side of [-1, 1]) {
    ctx.beginPath();
    for (let k = 0; k <= 20; k++) {
      const th = Math.PI * (0.62 + 0.62 * (k / 20));
      const px = cx + side * Math.cos(th) * R, py = cy + Math.sin(th) * R * 0.8;
      k ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.stroke();
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
  lines.forEach((l, i) => text(l, cx, cy - 4 + i * 38, { weight: i ? 700 : 500, size: i ? 30 : 18, family: "'Noto Serif JP'", color, maxW: i ? 170 : 190 }));
}

// 映画祭マーク（月桂樹）を横に並べる
function festivalLaurels(c, x, y, color, max = 3, scale = 1) {
  const fs = (c.festivals || []).slice(0, max);
  const gap = 300 * scale;
  fs.forEach(([fest, award], i) => {
    const lx = x + (i - (fs.length - 1) / 2) * gap;
    ctx.save(); ctx.translate(lx, y); ctx.scale(scale, scale); ctx.translate(-lx, -y);
    laurel(lx, y, [fest, award], color);
    ctx.restore();
  });
}

// 構図が空けておいた場所に、ジャンル固有の飾り（短評・映画祭マーク）を置く
function extras(c, x, y, w, onPaper = false) {
  if (!S.extras) return;
  autoInk(y - 180, y + 120);
  S.extras(c, x, y, w, onPaper ? S.ink : AUTO_DARK ? "#26292b" : "#ffffff");
  AUTO_DARK = false;
}

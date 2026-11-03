// なんでもポスター：写真の色調加工＋日本語組版をブラウザ内だけで行う。
// 「ジャンル（色・書体・装飾）」と「構図（文字の置き方）」を分けて、自由に組み合わせる。
const W = 1200, H = 1800;
const canvas = document.getElementById("poster");
const ctx = canvas.getContext("2d");
canvas.width = W; canvas.height = H;

const state = { img: null, genre: "seishun", layout: "auto", usedLayout: null, focusX: 50, focusY: 50, content: randomContent("seishun") };
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

function drawTitle(c, x, y, { size = 120, align = "center", maxW = W * 0.88, onPaper = false } = {}) {
  const t = S.title;
  const col = onPaper ? (t.paperColor || S.ink) : colorOf(t.color, false);
  const sz = size * (t.scale || 1);
  const opts = { weight: t.weight, size: sz, family: t.family, spacing: t.spacing || 0, maxW, align,
    stroke: onPaper ? t.paperStroke || 0 : t.stroke || 0, strokeColor: t.strokeColor, shadow: shadowOf(t.shadow, onPaper) };
  ctx.save();
  if (t.rotate) { ctx.translate(x, y); ctx.rotate(t.rotate); ctx.translate(-x, -y); }
  if (t.deco === "ghost") text(c.title, x + sz * 0.05, y + sz * 0.04, { ...opts, color: "rgba(120,0,0,.55)", shadow: null });
  const r = text(c.title, x, y, { ...opts, color: col });
  ctx.restore();
  const left = align === "center" ? x - r.width / 2 : align === "right" ? x - r.width : x;
  if (t.deco === "slash") {
    ctx.save(); ctx.translate(left + r.width / 2, y + r.size * 0.18); ctx.rotate(-0.06);
    ctx.fillStyle = S.accent; ctx.fillRect(-r.width * 0.42, -4, r.width * 0.84, 8); ctx.restore();
  }
  if (t.deco === "redline") { ctx.fillStyle = S.accent; ctx.fillRect(left + r.width * 0.15, y - r.size * 1.05, r.width * 0.7, 6); }
  return r;
}
function drawVTitle(c, x, y, { size = 140, maxH = H * 0.66, onPaper = false } = {}) {
  const t = S.title;
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
function drawCredits(c, x, y, { size = 22, align = "center", maxW = W * 0.86, onPaper = false } = {}) {
  const s = S.body;
  const col = onPaper ? S.ink : AUTO_DARK ? "#3a3d40" : s.dim || s.color;
  text(`監督・脚本　${c.director}　　撮影　S　　製作　なんでもポスター製作委員会`, x, y,
    { size, align, maxW, color: col, family: "'Noto Sans JP'", spacing: 0.04, stroke: onPaper ? 0 : s.stroke ? 5 : 0, strokeColor: s.strokeColor });
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
  lines.forEach((l, i) => text(l, cx, cy - 4 + i * 38, { weight: i ? 700 : 500, size: i ? 30 : 18, family: "'Noto Serif JP'", color, maxW: 180 }));
}

// 構図が空けておいた場所に、ジャンル固有の飾り（短評・映画祭マーク）を置く
function extras(c, x, y, w, onPaper = false) {
  if (!S.extras) return;
  autoInk(y - 180, y + 120);
  S.extras(c, x, y, w, onPaper ? S.ink : AUTO_DARK ? "#26292b" : "#ffffff");
  AUTO_DARK = false;
}

// =====================================================================
// 構図（レイアウト）
//   実際の映画ポスターでよく使われる文字の置き方を型にしたもの
// =====================================================================
const M = 70; // 余白
const LAYOUTS = {
  bottom: {
    label: "王道（下にタイトル）",
    draw(c) {
      scrimTop(0.16, 0.6); scrimBottom(0.56);
      autoInk(60, 160); drawTagline(c, W / 2, 115, { size: 40 }); AUTO_DARK = false;
      extras(c, W / 2, 400, W * 0.8);
      drawTitle(c, W / 2, H * 0.765, { size: 124 });
      drawSub(c, W / 2, H * 0.765 + 66, { size: 34 });
      drawCast(c, W / 2, H * 0.845);
      drawCredits(c, W / 2, H * 0.88);
      drawDate(c, W / 2, H * 0.94);
    },
  },
  top: {
    label: "上にタイトル",
    draw(c) {
      scrimTop(0.36, 0.85); scrimBottom(0.72, 0.85);
      autoInk(40, 420);
      drawCast(c, W / 2, 80, { size: 26 });
      drawTitle(c, W / 2, 245, { size: 130 });
      drawSub(c, W / 2, 310, { size: 32 });
      drawTagline(c, W / 2, 385, { size: 32 });
      AUTO_DARK = false;
      extras(c, W / 2, H * 0.8, W * 0.8);
      drawCredits(c, W / 2, H * 0.905, { size: 20 });
      drawDate(c, W / 2, H * 0.955, { size: 44 });
    },
  },
  center: {
    label: "中央にドン",
    draw(c) {
      scrimTop(0.16, 0.7); scrimBand(H * 0.5, H * 0.16, 0.5); scrimBottom(0.74);
      autoInk(60, 160); drawTagline(c, W / 2, 110, { size: 38 }); AUTO_DARK = false;
      extras(c, W / 2, 400, W * 0.8);
      drawTitle(c, W / 2, H * 0.52, { size: 180, maxW: W * 0.92 });
      drawSub(c, W / 2, H * 0.52 + 84, { size: 36 });
      drawCast(c, W / 2, H * 0.875, { size: 34 });
      drawCredits(c, W / 2, H * 0.905, { size: 20 });
      drawDate(c, W / 2, H * 0.955, { size: 46 });
    },
  },
  vright: {
    label: "縦書き（右）",
    draw(c) {
      scrimRadial(W, 0, W * 0.9, 0.55); scrimBottom(0.76);
      autoInk(90, H * 0.6, W - 230, W - 30);
      const ts = drawVTitle(c, W - 130, 90, { size: 140, maxH: H * 0.66 });
      drawVTagline(c, W - 130 - ts * 0.75 - 40, 110, { size: 40, maxH: H * 0.5, dir: -1 }); AUTO_DARK = false;
      extras(c, W * 0.3, 360, W * 0.5);
      drawSub(c, W / 2, H * 0.855, { size: 30 });
      drawCast(c, W / 2, H * 0.895, { size: 34 });
      drawCredits(c, W / 2, H * 0.925, { size: 19 });
      drawDate(c, W / 2, H * 0.965, { size: 42 });
    },
  },
  vleft: {
    label: "縦書き（左）",
    draw(c) {
      scrimRadial(0, 0, W * 0.9, 0.55); scrimBottom(0.76);
      autoInk(90, H * 0.6, 30, 230);
      const ts = drawVTitle(c, 130, 90, { size: 140, maxH: H * 0.66 });
      drawVTagline(c, 130 + ts * 0.75 + 40, 110, { size: 40, maxH: H * 0.5, dir: 1 }); AUTO_DARK = false;
      extras(c, W * 0.7, 360, W * 0.5);
      drawSub(c, W / 2, H * 0.855, { size: 30 });
      drawCast(c, W / 2, H * 0.895, { size: 34 });
      drawCredits(c, W / 2, H * 0.925, { size: 19 });
      drawDate(c, W / 2, H * 0.965, { size: 42 });
    },
  },
  corner: {
    label: "左下に小さく（ミニマル）",
    draw(c) {
      scrimRadial(0, H, W * 1.1, 0.75); scrimTop(0.12, 0.45);
      autoInk(60, 150); drawTagline(c, M, 110, { size: 30, align: "left", maxW: W * 0.6 }); AUTO_DARK = false;
      extras(c, W * 0.74, 360, W * 0.4);
      drawTitle(c, M, H * 0.80, { size: 100, align: "left", maxW: W * 0.78 });
      drawSub(c, M, H * 0.80 + 54, { size: 28, align: "left" });
      drawCast(c, M, H * 0.87, { size: 28, align: "left", maxW: W * 0.8 });
      drawCredits(c, M, H * 0.9, { size: 17, align: "left", maxW: W * 0.8 });
      drawDate(c, W - M, H * 0.955, { size: 36, align: "right" });
    },
  },
  frame: {
    label: "白枠（写真を額に）",
    draw(c) {
      const snap = snapshot();
      ctx.fillStyle = S.paper; ctx.fillRect(0, 0, W, H);
      const top = 150, side = 60, ph = H * 0.62;
      drawSnapInto(snap, side, top, W - side * 2, ph);
      drawTagline(c, W / 2, 95, { size: 30, onPaper: true });
      extras(c, W / 2, top + 320, W * 0.8);
      const by = top + ph;
      drawTitle(c, W / 2, by + 140, { size: 104, onPaper: true });
      drawSub(c, W / 2, by + 200, { size: 30, onPaper: true });
      drawCast(c, W / 2, by + 268, { size: 30, onPaper: true });
      drawCredits(c, W / 2, by + 305, { size: 18, onPaper: true });
      drawDate(c, W / 2, H - 70, { size: 38, onPaper: true });
    },
  },
  split: {
    label: "上下分割",
    draw(c) {
      const y0 = H * 0.64;
      ctx.fillStyle = S.paper; ctx.fillRect(0, y0, W, H - y0);
      ctx.fillStyle = S.accent; ctx.fillRect(0, y0, W, 10);
      scrimTop(0.14, 0.55);
      autoInk(60, 150); drawTagline(c, M, 110, { size: 34, align: "left", maxW: W * 0.8 }); AUTO_DARK = false;
      extras(c, W * 0.74, 400, W * 0.4);
      drawTitle(c, M, y0 + 160, { size: 124, align: "left", maxW: W - M * 2, onPaper: true });
      drawSub(c, M, y0 + 222, { size: 30, align: "left", onPaper: true });
      drawCast(c, M, y0 + 330, { size: 32, align: "left", onPaper: true });
      drawCredits(c, M, y0 + 370, { size: 18, align: "left", onPaper: true });
      drawDate(c, W - M, H - 70, { size: 40, align: "right", onPaper: true });
    },
  },
  stack: {
    label: "巨大タイポ",
    draw(c) {
      scrimTop(0.62, 0.8); scrimBottom(0.72);
      const lines = splitTitle(c.title);
      const t = S.title;
      let y = 70;
      for (const line of lines) {
        const s = fit(line, t.weight, 300, t.family, W - M * 2, t.spacing || 0);
        y += s * 0.95;
        drawTitle({ ...c, title: line }, M, y, { size: s / (t.scale || 1), align: "left", maxW: W - M * 2 });
        y += s * 0.15;
      }
      drawSub(c, M, y + 75, { size: 32, align: "left" });
      extras(c, W * 0.74, y + 300, W * 0.4);
      drawTagline(c, W / 2, H * 0.8, { size: 38 });
      drawCast(c, W / 2, H * 0.87, { size: 34 });
      drawCredits(c, W / 2, H * 0.9, { size: 19 });
      drawDate(c, W / 2, H * 0.955, { size: 44 });
    },
  },
  arch: {
    label: "窓（アーチで切り抜き）",
    draw(c) {
      const snap = snapshot();
      ctx.fillStyle = S.paper; ctx.fillRect(0, 0, W, H);
      const x0 = W * 0.12, x1 = W * 0.88, y0 = 170, y1 = H * 0.64, r = (x1 - x0) / 2;
      ctx.save(); ctx.beginPath();
      ctx.moveTo(x0, y1); ctx.lineTo(x0, y0 + r); ctx.arc(W / 2, y0 + r, r, Math.PI, 0); ctx.lineTo(x1, y1); ctx.closePath(); ctx.clip();
      drawSnapInto(snap, x0, y0, x1 - x0, y1 - y0);
      ctx.restore();
      drawTagline(c, W / 2, 110, { size: 30, onPaper: true });
      drawTitle(c, W / 2, H * 0.735, { size: 112, onPaper: true });
      drawSub(c, W / 2, H * 0.735 + 60, { size: 30, onPaper: true });
      drawCast(c, W / 2, H * 0.85, { size: 30, onPaper: true });
      drawCredits(c, W / 2, H * 0.88, { size: 18, onPaper: true });
      drawDate(c, W / 2, H * 0.95, { size: 40, onPaper: true });
    },
  },
  diagonal: {
    label: "斜めの帯",
    draw(c) {
      scrimTop(0.15, 0.6); scrimBottom(0.7);
      autoInk(60, 160); drawTagline(c, W / 2, 115, { size: 38 }); AUTO_DARK = false;
      extras(c, W / 2, 400, W * 0.8);
      const cy = H * 0.64;
      ctx.save(); ctx.translate(W / 2, cy); ctx.rotate(-0.12);
      ctx.fillStyle = S.accent; ctx.fillRect(-W, -115, W * 2, 230);
      ctx.translate(-W / 2, -cy);
      const saved = S;
      S = { ...S, autoInk: false, title: { ...saved.title, color: S.bandInk || "#fff", rotate: 0, shadow: null, deco: null } };
      drawTitle(c, W / 2, cy + 45, { size: 130, maxW: W * 0.8 });
      S = saved;
      ctx.restore();
      drawSub(c, W / 2, H * 0.80, { size: 32 });
      drawCast(c, W / 2, H * 0.865, { size: 34 });
      drawCredits(c, W / 2, H * 0.9, { size: 19 });
      drawDate(c, W / 2, H * 0.955, { size: 46 });
    },
  },
  casttop: {
    label: "キャスト名が上",
    draw(c) {
      scrimTop(0.24, 0.9); scrimBottom(0.56);
      autoInk(50, 200);
      const names = castList(c);
      const colW = (W - M * 2) / Math.max(1, names.length);
      names.forEach((n, i) => text(n, M + colW * (i + 0.5), 110, { weight: 700, size: 40, color: colorOf(S.body.color), spacing: 0.1, maxW: colW - 16, family: S.body.family,
        stroke: S.body.stroke || 0, strokeColor: S.body.strokeColor, shadow: shadowOf(S.body.shadow) }));
      drawTagline(c, W / 2, S.tagline.bubble ? 250 : 190, { size: 32 });
      AUTO_DARK = false;
      extras(c, W / 2, 450, W * 0.8);
      drawTitle(c, W / 2, H * 0.78, { size: 170 });
      drawSub(c, W / 2, H * 0.78 + 90, { size: 36 });
      drawCredits(c, W / 2, H * 0.895, { size: 20 });
      drawDate(c, W / 2, H * 0.95, { size: 54 });
    },
  },
  letterbox: {
    label: "シネスコ（黒帯）",
    draw(c) {
      const top = H * 0.2, bot = H * 0.7;
      ctx.fillStyle = "#070707"; ctx.fillRect(0, 0, W, top); ctx.fillRect(0, bot, W, H - bot);
      const saved = S; S = { ...S, autoInk: false, tagline: { ...S.tagline, bubble: false, color: S.tagline.bubble ? "#ffffff" : S.tagline.color } };
      drawTagline(c, W / 2, top * 0.48, { size: 36 });
      drawCast(c, W / 2, top * 0.8, { size: 26 });
      drawTitle(c, W / 2, bot + 160, { size: 120 });
      drawSub(c, W / 2, bot + 222, { size: 30 });
      drawCredits(c, W / 2, H * 0.9, { size: 19 });
      drawDate(c, W / 2, H * 0.955, { size: 44 });
      S = saved;
    },
  },
  band: {
    label: "帯にタイトル（邦画風）",
    draw(c) {
      scrimTop(0.15, 0.6); scrimBottom(0.8, 0.9);
      autoInk(60, 160); drawTagline(c, W / 2, 115, { size: 40 }); AUTO_DARK = false;
      extras(c, W / 2, 400, W * 0.8);
      const y0 = H * 0.66, bh = H * 0.15;
      ctx.fillStyle = S.paper; ctx.fillRect(0, y0, W, bh);
      ctx.fillStyle = S.accent; ctx.fillRect(0, y0, W, 8); ctx.fillRect(0, y0 + bh - 8, W, 8);
      drawTitle(c, W / 2, y0 + bh * 0.58, { size: 120, onPaper: true, maxW: W * 0.86 });
      drawSub(c, W / 2, y0 + bh * 0.86, { size: 26, onPaper: true });
      drawCast(c, W / 2, H * 0.865, { size: 34 });
      drawCredits(c, W / 2, H * 0.9, { size: 19 });
      drawDate(c, W / 2, H * 0.955, { size: 46 });
    },
  },
};

// =====================================================================
// ジャンル（色・書体・装飾）と、そのジャンルに似合う構図
// =====================================================================
const SH = (a = 0.5, b = 14) => ({ color: `rgba(0,0,0,${a})`, blur: b });
const STYLES = {
  seishun: {
    layouts: ["bottom", "vright", "corner", "frame", "split", "top", "arch"],
    photo() { grade({ sat: 1.15, bright: 1.05, mul: [1.08, 1.0, 0.86], add: [0.04, 0.02, 0] }); bloom(0.35); grain(0.08); },
    scrim: "40,28,15", paper: "#f4ecdc", ink: "#3b2a18", accent: "#e39b34",
    title: { family: "'Zen Maru Gothic'", weight: 700, color: "#fff8e8", shadow: SH(0.45, 18) },
    sub: { family: "'Cormorant Garamond'", weight: 600, color: "#f0d7a0", spacing: 0.2 },
    tagline: { family: "'Zen Maru Gothic'", weight: 700, color: "#fffaf0", shadow: SH(0.5, 10) },
    body: { family: "'Noto Sans JP'", color: "#fffaf0", dim: "#e3d4bc" },
    date: { family: "'Noto Sans JP'", weight: 900, color: "#ffdc8c", paperColor: "#c9761c" },
  },
  korean: {
    layouts: ["top", "corner", "frame", "center", "vleft", "letterbox", "bottom", "arch"],
    photo() { grade({ sat: 0.68, contrast: 0.82, bright: 1.04, mul: [0.95, 1.0, 1.0], add: [0.06, 0.07, 0.07] }); grain(0.1); },
    scrim: "20,24,26", scrimAlpha: 0.4, autoInk: true, autoInkThreshold: 150, paper: "#efefeb", ink: "#2a2d2e", accent: "#8a9a95",
    title: { family: "'Noto Serif JP'", weight: 500, color: "#ffffff", spacing: 0.22, scale: 0.8, shadow: SH(0.3, 10) },
    sub: { family: "'Gowun Batang'", weight: 400, color: "rgba(255,255,255,.92)", spacing: 0.3, shadow: SH(0.3, 8) },
    tagline: { family: "'Noto Serif JP'", weight: 500, color: "#ffffff", spacing: 0.08, shadow: SH(0.3, 8) },
    body: { family: "'Noto Sans JP'", color: "#ffffff", castSpacing: 0.12, dim: "rgba(255,255,255,.8)", shadow: SH(0.3, 8) },
    date: { family: "'Noto Serif JP'", weight: 500, color: "#ffffff", spacing: 0.2, paperColor: "#2a2d2e" },
    extras(c, x, y, w, color) {
      const rv = c.reviews || [];
      if (w >= W * 0.7) {
        rv.forEach(([q, src], i) => {
          const rx = x + (i === 0 ? -w * 0.3 : w * 0.3);
          text(`“${q}”`, rx, y - 150, { weight: 500, size: 24, family: "'Noto Serif JP'", color, maxW: w * 0.42 });
          text(`― ${src}`, rx, y - 114, { size: 18, color, maxW: w * 0.42 });
        });
      }
      laurel(x, y, ["第12回 なんでも国際映画祭", "公式招待作品"], color);
    },
  },
  knoir: {
    layouts: ["casttop", "center", "stack", "letterbox", "vright", "split", "diagonal"],
    photo() { grade({ sat: 0.18, contrast: 1.55, bright: 0.78, mul: [0.92, 0.98, 1.04] }); vignette(0.95); grain(0.16); },
    scrim: "0,0,0", paper: "#0c0c0d", ink: "#f0f0f0", accent: "#c8101c", bandInk: "#ffffff",
    dateSuffix: "  대개봉",
    title: { family: "'Yuji Boku'", weight: 400, color: "#ffffff", scale: 1.2, shadow: SH(0.9, 24), deco: "slash", paperColor: "#ffffff" },
    sub: { family: "'Noto Sans KR'", weight: 700, color: "#e0222c", spacing: 0.3 },
    tagline: { family: "'Noto Serif JP'", weight: 500, color: "#d6d6d6", spacing: 0.06 },
    body: { family: "'Noto Sans JP'", color: "#ffffff", castWeight: 700, castSpacing: 0.15, dim: "#8d8d8d" },
    date: { family: "'Noto Sans KR'", weight: 900, color: "#ffffff", spacing: 0.08, paperColor: "#ffffff" },
  },
  horror: {
    layouts: ["bottom", "center", "top", "vright", "letterbox", "arch", "stack"],
    photo() { grade({ sat: 0.3, contrast: 1.35, bright: 0.72, mul: [0.8, 0.92, 0.95] }); vignette(0.9); grain(0.2); },
    scrim: "4,6,8", paper: "#08090a", ink: "#d8d8d4", accent: "#c40c0c",
    title: { family: "'Noto Serif JP'", weight: 900, color: "#c40c0c", spacing: 0.12, scale: 1.15, shadow: { color: "rgba(255,0,0,.35)", blur: 30 }, deco: "ghost", paperColor: "#c40c0c" },
    sub: { family: "'Cormorant Garamond'", weight: 700, color: "#c8c8c3", spacing: 0.35 },
    tagline: { family: "'Noto Serif JP'", weight: 500, color: "#e1e1dc" },
    body: { family: "'Noto Sans JP'", color: "#bdbdb8", dim: "#8f8f8a" },
    date: { family: "'Cormorant Garamond'", weight: 700, color: "#dcdcd7", spacing: 0.06, paperColor: "#dcdcd7" },
  },
  suspense: {
    layouts: ["bottom", "center", "split", "stack", "corner", "letterbox", "diagonal", "casttop"],
    photo() { grade({ sat: 0.45, contrast: 1.45, bright: 0.85, mul: [0.9, 0.97, 1.06] }); vignette(0.6); grain(0.12); },
    scrim: "0,0,0", paper: "#111315", ink: "#f2f2f2", accent: "#d4111e", bandInk: "#ffffff",
    title: { family: "'Noto Sans JP'", weight: 900, color: "#ffffff", spacing: 0.06, shadow: SH(0.8, 20), deco: "redline", paperColor: "#ffffff" },
    sub: { family: "'Noto Sans JP'", weight: 700, color: "#d8d8d8", spacing: 0.4 },
    tagline: { family: "'Noto Sans JP'", weight: 700, color: "#ffffff" },
    body: { family: "'Noto Sans JP'", color: "#e6e6e6", castWeight: 700, dim: "#9a9a9a" },
    date: { family: "'Noto Sans JP'", weight: 900, color: "#e3202c", spacing: 0.05 },
  },
  romance: {
    layouts: ["bottom", "top", "frame", "arch", "vright", "corner"],
    photo() { grade({ sat: 0.9, contrast: 0.9, bright: 1.12, mul: [1.05, 0.96, 1.0], add: [0.06, 0.03, 0.06] }); bloom(0.5); grain(0.05); },
    scrim: "70,35,55", paper: "#f7eaef", ink: "#5a2c40", accent: "#d97a9b",
    title: { family: "'Shippori Mincho B1'", weight: 800, color: "#ffffff", shadow: { color: "rgba(90,30,60,.6)", blur: 22 } },
    sub: { family: "'Cormorant Garamond'", weight: 500, color: "#ffd6e4", spacing: 0.12 },
    tagline: { family: "'Shippori Mincho B1'", weight: 600, color: "#ffffff", shadow: { color: "rgba(90,40,60,.6)", blur: 14 } },
    body: { family: "'Shippori Mincho B1'", color: "#fff4f8", castWeight: 600, dim: "#f0d0dc" },
    date: { family: "'Shippori Mincho B1'", weight: 800, color: "#ffc6d9", paperColor: "#b04a70" },
  },
  sf: {
    layouts: ["center", "top", "letterbox", "arch", "bottom", "stack"],
    photo() {
      grade({ sat: 1.1, contrast: 1.25, bright: 0.9, split: { shadow: [-0.05, 0.06, 0.12], high: [0.12, 0.04, -0.06] } });
      vignette(0.7, "0,8,20"); grain(0.1);
      ctx.fillStyle = "rgba(0,0,0,.12)"; for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
    },
    scrim: "2,8,18", paper: "#06101c", ink: "#d6f4ff", accent: "#ffb35c",
    title: { family: "'Noto Sans JP'", weight: 900, color: "#e8fbff", spacing: 0.15, shadow: { color: "rgba(0,210,255,.9)", blur: 30 }, paperColor: "#e8fbff" },
    sub: { family: "'Orbitron'", weight: 700, color: "#5fe1ff", spacing: 0.25 },
    tagline: { family: "'Noto Sans JP'", weight: 500, color: "#bfefff", shadow: { color: "rgba(0,200,255,.6)", blur: 12 } },
    body: { family: "'Noto Sans JP'", color: "#d6f4ff", dim: "#7fa9b8" },
    date: { family: "'Orbitron'", weight: 700, color: "#ffb35c", spacing: 0.12, shadow: { color: "rgba(255,140,0,.6)", blur: 18 } },
  },
  comedy: {
    layouts: ["diagonal", "bottom", "split", "top", "stack", "casttop"],
    photo() { grade({ sat: 1.45, contrast: 1.1, bright: 1.08 }); },
    scrim: "0,0,0", scrimAlpha: 0.55, paper: "#ffe14d", ink: "#111111", accent: "#e8202a", bandInk: "#ffe14d",
    title: { family: "'Dela Gothic One'", weight: 400, color: "#ffe14d", stroke: 22, strokeColor: "#111", rotate: -0.05, paperColor: "#e8202a", paperStroke: 0 },
    sub: { family: "'Noto Sans JP'", weight: 900, color: "#ffffff", stroke: 8, strokeColor: "#111", spacing: 0.1 },
    tagline: { family: "'Noto Sans JP'", weight: 700, color: "#111", bubble: true },
    body: { family: "'Noto Sans JP'", color: "#ffffff", castWeight: 900, stroke: 10, strokeColor: "#111" },
    date: { family: "'Dela Gothic One'", weight: 400, color: "#ffffff", stroke: 12, strokeColor: "#e8202a", paperColor: "#e8202a" },
  },
  showa: {
    layouts: ["vright", "vleft", "band", "bottom", "frame", "split"],
    photo() { grade({ sat: 0.7, contrast: 0.95, sepia: 0.55, add: [0.06, 0.05, 0.03] }); vignette(0.55, "40,25,10"); grain(0.22); },
    scrim: "30,18,8", paper: "#efe6d2", ink: "#3a2414", accent: "#8a2a1a",
    title: { family: "'Yuji Syuku'", weight: 400, color: "#fbf3e2", shadow: { color: "rgba(30,10,0,.85)", blur: 14 }, paperColor: "#8a2a1a" },
    sub: { family: "'Cormorant Garamond'", weight: 600, color: "#e8d3a8", spacing: 0.25 },
    tagline: { family: "'Shippori Mincho B1'", weight: 800, color: "#f6e7c8", shadow: SH(0.8, 8) },
    body: { family: "'Shippori Mincho B1'", color: "#fbf3e2", castWeight: 800, dim: "#e8d3a8" },
    date: { family: "'Shippori Mincho B1'", weight: 800, color: "#ffd27a", spacing: 0.08, paperColor: "#8a2a1a" },
    after() {
      const m = 36;
      ctx.fillStyle = "#efe6d2";
      ctx.fillRect(0, 0, W, m); ctx.fillRect(0, H - m, W, m); ctx.fillRect(0, 0, m, H); ctx.fillRect(W - m, 0, m, H);
      ctx.strokeStyle = "#8a2a1a"; ctx.lineWidth = 4; ctx.strokeRect(m + 14, m + 14, W - 2 * m - 28, H - 2 * m - 28);
    },
  },
};

// =====================================================================
// フォント読み込み
// =====================================================================
const FONT_SPECS = [
  "400 40px 'Noto Sans JP'", "500 40px 'Noto Sans JP'", "700 40px 'Noto Sans JP'", "900 40px 'Noto Sans JP'",
  "500 40px 'Noto Serif JP'", "900 40px 'Noto Serif JP'",
  "700 40px 'Zen Maru Gothic'", "600 40px 'Shippori Mincho B1'", "800 40px 'Shippori Mincho B1'",
  "400 40px 'Dela Gothic One'", "400 40px 'Yuji Syuku'", "400 40px 'Yuji Boku'",
  "500 40px 'Cormorant Garamond'", "600 40px 'Cormorant Garamond'", "700 40px 'Cormorant Garamond'",
  "700 40px 'Orbitron'", "400 40px 'Gowun Batang'", "700 40px 'Noto Sans KR'", "900 40px 'Noto Sans KR'",
];
async function loadFonts(str) {
  if (!document.fonts) return;
  try {
    await Promise.race([
      Promise.all(FONT_SPECS.map((f) => document.fonts.load(f, str))),
      new Promise((r) => setTimeout(r, 6000)),
    ]);
  } catch (e) { /* 読めなくても既定フォントで描く */ }
}

// =====================================================================
// 描画とUI
// =====================================================================
function chooseLayout() {
  const allowed = STYLES[state.genre].layouts;
  if (state.layout !== "auto") return state.layout;
  if (state.usedLayout && allowed.includes(state.usedLayout)) return state.usedLayout;
  return allowed[Math.floor(Math.random() * allowed.length)];
}

let renderId = 0;
async function render() {
  const id = ++renderId;
  const c = state.content;
  const extra = "監督脚本撮影製作なんでもポスター委員会出演第12回国際映画祭公式招待作品대개봉“”―";
  const str = [c.title, c.en, c.tagline, c.cast, c.director, c.date, c.note || "", JSON.stringify(c.reviews || "")].join("") + extra;
  await loadFonts(str);
  if (id !== renderId) return;
  S = STYLES[state.genre];
  const layout = chooseLayout();
  state.usedLayout = layout;
  AUTO_DARK = false;
  ctx.save(); ctx.clearRect(0, 0, W, H);
  drawPhoto();
  S.photo();
  BASE = S.autoInk ? ctx.getImageData(0, 0, W, H).data : null;
  LAYOUTS[layout].draw({ ...c, note: GENRES[state.genre].rating ? c.note : null });
  if (S.after) S.after();
  ctx.restore();
  syncLayoutSelect();
}

const $ = (s) => document.querySelector(s);
const FIELDS = ["title", "en", "tagline", "cast", "director", "date"];
function syncFields() { for (const f of FIELDS) $(`#f-${f}`).value = state.content[f]; }

function freshContent(g) {
  const c = randomContent(g);
  if (GENRES[g].rating) c.note = GENRES[g].rating();
  return c;
}

function buildGenreChips() {
  const box = $("#genres");
  for (const k of Object.keys(GENRES)) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.dataset.genre = k;
    b.textContent = GENRES[k].label;
    b.addEventListener("click", () => setGenre(k, true));
    box.appendChild(b);
  }
}
function buildLayoutSelect() {
  const sel = $("#layout");
  const auto = document.createElement("option"); auto.value = "auto"; auto.textContent = "ジャンルに合わせる（自動）"; sel.appendChild(auto);
  for (const [k, l] of Object.entries(LAYOUTS)) {
    const o = document.createElement("option"); o.value = k; o.textContent = l.label; sel.appendChild(o);
  }
  sel.addEventListener("change", () => { state.layout = sel.value; state.usedLayout = null; render(); });
}
function syncLayoutSelect() {
  $("#layout").value = state.layout;
  $("#layout-now").textContent = LAYOUTS[state.usedLayout].label;
}
function pickGenre() {
  const ks = Object.keys(GENRES).filter((k) => k !== state.genre);
  return ks[Math.floor(Math.random() * ks.length)];
}
function setGenre(g, refreshText) {
  state.genre = g; state.usedLayout = null;
  document.querySelectorAll(".chip").forEach((b) => {
    const on = b.dataset.genre === g;
    b.setAttribute("aria-pressed", on);
    if (on) { const box = b.parentElement; box.scrollTo({ left: b.offsetLeft - box.clientWidth / 2 + b.clientWidth / 2, behavior: "smooth" }); }
  });
  if (refreshText) { state.content = freshContent(g); syncFields(); }
  render();
}
function shuffleLayout() {
  const allowed = state.layout === "auto" ? STYLES[state.genre].layouts : Object.keys(LAYOUTS);
  const options = allowed.filter((k) => k !== state.usedLayout);
  const next = options[Math.floor(Math.random() * options.length)];
  if (state.layout === "auto") state.usedLayout = next; else state.layout = next;
  render();
}

let t;
function onInput() {
  for (const f of FIELDS) state.content[f] = $(`#f-${f}`).value;
  clearTimeout(t); t = setTimeout(render, 200);
}
function rollField(f) {
  const r = freshContent(state.genre);
  if (f === "title" || f === "en") { state.content.title = r.title; state.content.en = r.en; }
  else state.content[f] = r[f];
  syncFields(); render();
}

function loadFile(file) {
  if (!file || !file.type.startsWith("image/")) return;
  const img = new Image();
  img.onload = () => {
    state.img = img;
    document.body.dataset.mode = "studio";
    window.scrollTo(0, 0);
    if (!state.started) { state.started = true; state.layout = "auto"; setGenre(pickGenre(), true); }
    else render();
  };
  img.src = URL.createObjectURL(file);
}
document.querySelectorAll("input[type=file]").forEach((inp) => inp.addEventListener("change", (e) => { loadFile(e.target.files[0]); e.target.value = ""; }));
window.addEventListener("dragover", (e) => { e.preventDefault(); document.body.classList.add("dragging"); });
window.addEventListener("dragleave", (e) => { if (!e.relatedTarget) document.body.classList.remove("dragging"); });
window.addEventListener("drop", (e) => { e.preventDefault(); document.body.classList.remove("dragging"); loadFile(e.dataTransfer.files[0]); });

for (const f of FIELDS) $(`#f-${f}`).addEventListener("input", onInput);
document.querySelectorAll("[data-roll]").forEach((b) => b.addEventListener("click", () => rollField(b.dataset.roll)));
$("#shuffle").addEventListener("click", () => { state.layout = "auto"; setGenre(pickGenre(), true); });
$("#text-random").addEventListener("click", () => { state.content = freshContent(state.genre); syncFields(); render(); });
$("#layout-roll").addEventListener("click", shuffleLayout);
for (const axis of ["X", "Y"]) {
  $(`#focus${axis}`).addEventListener("input", (e) => { state[`focus${axis}`] = +e.target.value; clearTimeout(t); t = setTimeout(render, 60); });
}
const sheet = $("#sheet");
$("#open-edit").addEventListener("click", () => sheet.showModal());
$("#close-edit").addEventListener("click", () => sheet.close());
sheet.addEventListener("click", (e) => { if (e.target === sheet) sheet.close(); });

$("#save").addEventListener("click", () => {
  canvas.toBlob(async (blob) => {
    const name = `${state.content.title || "poster"}.png`;
    const file = new File([blob], name, { type: "image/png" });
    // スマホは共有シートから「画像を保存」できるようにする
    if (matchMedia("(pointer: coarse)").matches && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file] }); return; } catch (e) { if (e.name === "AbortError") return; }
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  }, "image/png");
});

// 確認用：コンソールから構図やジャンルを切り替えられる
window.nandemo = { state, render, LAYOUTS, STYLES, setGenre, loadFile };

buildGenreChips();
buildLayoutSelect();
state.content = freshContent(state.genre);
syncFields();
setGenre(state.genre, false);

// なんでもポスター：画面の操作（engine.js / layouts.js / styles.js / data.js を使う）

const state = {
  img: null, started: false,
  genre: "seishun", layout: "auto", usedLayout: null,
  titleFont: "auto", gradeKey: "auto",
  focusX: 50, focusY: 50, zoom: 1,
  content: null,
  hidden: new Set(),  // 消している項目
  offsets: {},        // 動かした項目 {role: [dx, dy]}（構図が変わったら戻す）
  offLayout: null,
  guide: false,       // しくみ（ガイド）表示中
  boxes: [],          // 最後に描いた文字の位置
  edited: new Set(), // 自分で入力した項目（ジャンルを変えても残す）
};
const $ = (s) => document.querySelector(s);
const FIELDS = ["title", "en", "tagline", "cast", "director", "date"];

// =====================================================================
// 描画
// =====================================================================
function effectiveStyle() {
  let st = STYLES[state.genre];
  const tf = TITLE_FONTS[state.titleFont];
  if (tf && tf.family) st = { ...st, title: { ...st.title, family: tf.family, weight: tf.weight } };
  const gr = GRADES[state.gradeKey];
  if (gr && gr.photo) st = { ...st, photo: gr.photo };
  return st;
}
function chooseLayout() {
  const allowed = STYLES[state.genre].layouts;
  if (state.layout !== "auto") return state.layout;
  if (state.usedLayout && allowed.includes(state.usedLayout)) return state.usedLayout;
  return allowed[Math.floor(Math.random() * allowed.length)];
}

let renderId = 0;
async function render() {
  const id = ++renderId;
  const busyTimer = setTimeout(() => $(".stage").classList.add("busy"), 180);
  const st = effectiveStyle();
  const c = state.content;
  const str = [c.title, c.en, c.tagline, c.cast, c.director, c.date, c.note || "", JSON.stringify(c.reviews || ""), JSON.stringify(c.festivals || ""), JSON.stringify(c.staff || "")].join("")
    + "監督脚本撮影音楽編集美術製作提供配給なんでもポスター委員会銀杏ピクチャーズ出演대개봉“”―ADMITONESEATNo.0123456789";
  await loadFonts(fontSpecsFor(st), str);
  clearTimeout(busyTimer);
  if (id !== renderId) return;
  draw(st);
  $(".stage").classList.remove("busy");
  if (state.img && !render.hinted) { render.hinted = true; setTimeout(() => toast("ポスターの文字を押すと、書き換えられます", 3200), 900); }
  syncControls();
}
function draw(st) {
  S = st;
  const layout = chooseLayout();
  state.usedLayout = layout;
  if (state.offLayout !== layout) { state.offsets = {}; state.offLayout = layout; }
  AUTO_DARK = false;
  ctx.save(); ctx.clearRect(0, 0, W, H);
  drawPhoto();
  S.photo();
  BASE = S.autoInk ? ctx.getImageData(0, 0, W, H).data : null;
  // 消している項目は空にして渡す（構図側で直接使っている所もあるため）
  const c = { ...state.content, note: GENRES[state.genre].rating ? state.content.note : null };
  const hd = state.hidden;
  for (const f of ["title", "en", "tagline", "cast", "date"]) if (hd.has(f)) c[f] = "";
  if (hd.has("date")) c.note = null;
  if (hd.has("extras")) { c.reviews = []; c.festivals = []; }
  HIDE = hd; OFFS = state.offsets; GUIDE = [];
  LAYOUTS[layout].draw(c);
  state.boxes = GUIDE; GUIDE = null;
  if (S.after) S.after();
  ctx.restore();
  $("#keep").classList.remove("on");
  if (state.guide) drawGuide();
}
// ドラッグ中など、フォントが揃っている前提で軽く描き直す
let rafId = 0;
function quickRender() {
  if (rafId) return;
  rafId = requestAnimationFrame(() => { rafId = 0; draw(effectiveStyle()); });
}

// =====================================================================
// 戻る（履歴）
// =====================================================================
const past = [];
function takeState() {
  return { genre: state.genre, layout: state.layout, usedLayout: state.usedLayout, titleFont: state.titleFont, gradeKey: state.gradeKey,
    focusX: state.focusX, focusY: state.focusY, zoom: state.zoom, content: structuredClone(state.content), edited: [...state.edited], hidden: [...state.hidden], offsets: structuredClone(state.offsets), offLayout: state.offLayout };
}
function commit() {
  past.push(takeState());
  if (past.length > 60) past.shift();
  $("#undo").disabled = false;
}
function undo() {
  const s = past.pop();
  if (!s) return;
  Object.assign(state, s, { edited: new Set(s.edited), hidden: new Set(s.hidden) });
  syncFields(); syncChips(); syncHidden();
  render();
  $("#undo").disabled = past.length === 0;
}

// =====================================================================
// 文字
// =====================================================================
function freshContent(g) {
  const c = randomContent(g);
  if (GENRES[g].rating) c.note = GENRES[g].rating();
  // 自分で入力した文字は残す
  if (state.content) {
    for (const f of state.edited) c[f] = state.content[f];
    if (state.edited.has("title") && !state.edited.has("en")) c.en = state.content.en;
  }
  return c;
}
function syncFields() { for (const f of FIELDS) $(`#f-${f}`).value = state.content[f]; markEdited(); }
function markEdited() {
  for (const f of FIELDS) $(`#f-${f}`).closest(".field").classList.toggle("mine", state.edited.has(f));
  $("#mine-note").hidden = state.edited.size === 0;
}

// =====================================================================
// 操作
// =====================================================================
function pickGenre() {
  const ks = Object.keys(GENRES).filter((k) => k !== state.genre);
  return ks[Math.floor(Math.random() * ks.length)];
}
function setGenre(g) {
  commit();
  state.genre = g; state.usedLayout = null;
  state.content = freshContent(g);
  syncFields(); syncChips();
  render();
}
function shuffleAll() {
  commit();
  state.layout = "auto"; state.titleFont = "auto"; state.gradeKey = "auto";
  state.genre = pickGenre(); state.usedLayout = null;
  state.content = freshContent(state.genre);
  syncFields(); syncChips();
  render();
}
// 構図を順番に切り替える（ジャンルに似合う構図の中で。構図を固定しているときは全部の中で）
function stepLayout(dir) {
  commit();
  const list = state.layout === "auto" ? STYLES[state.genre].layouts : Object.keys(LAYOUTS);
  const i = list.indexOf(state.usedLayout);
  const next = list[(i + dir + list.length) % list.length];
  if (state.layout === "auto") state.usedLayout = next; else state.layout = next;
  render();
}
function shuffleLayout() {
  commit();
  const allowed = state.layout === "auto" ? STYLES[state.genre].layouts : Object.keys(LAYOUTS);
  const options = allowed.filter((k) => k !== state.usedLayout);
  const next = options[Math.floor(Math.random() * options.length)];
  if (state.layout === "auto") state.usedLayout = next; else state.layout = next;
  render();
}
function rollField(f) {
  commit();
  const r = randomContent(state.genre, futureDate());
  if (f === "title" || f === "en") { state.content.title = r.title; state.content.en = r.en; state.edited.delete("title"); state.edited.delete("en"); }
  else { state.content[f] = r[f]; state.edited.delete(f); }
  syncFields(); render();
}
function rollAllText() {
  commit();
  state.edited.clear();
  state.content = freshContent(state.genre);
  syncFields(); render();
}

let typingTimer = null, typingCommitted = false;
function onInput(e) {
  if (!typingCommitted) { commit(); typingCommitted = true; }
  const f = e.target.id.slice(2);
  state.content[f] = e.target.value;
  state.edited.add(f);
  markEdited();
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => { typingCommitted = false; render(); }, 220);
}

function buildChips() {
  const box = $("#genres");
  for (const k of Object.keys(GENRES)) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "chip"; b.dataset.genre = k;
    b.textContent = GENRES[k].label;
    b.addEventListener("click", () => { if (k !== state.genre) setGenre(k); });
    box.appendChild(b);
  }
}
function syncChips() {
  document.querySelectorAll(".chip").forEach((b) => {
    const on = b.dataset.genre === state.genre;
    b.setAttribute("aria-pressed", on);
    if (on) { const box = b.parentElement; box.scrollTo({ left: b.offsetLeft - box.clientWidth / 2 + b.clientWidth / 2, behavior: "smooth" }); }
  });
}
function buildSelect(sel, entries, onChange) {
  for (const [k, v] of entries) { const o = document.createElement("option"); o.value = k; o.textContent = v; sel.appendChild(o); }
  sel.addEventListener("change", () => { commit(); onChange(sel.value); render(); });
}
function syncControls() {
  $("#layout").value = state.layout;
  $("#title-font").value = state.titleFont;
  $("#grade").value = state.gradeKey;
  $("#layout-now").textContent = LAYOUTS[state.usedLayout].label;
  syncLesson();
}

// =====================================================================
// 写真
// =====================================================================
function loadFile(file) {
  if (!file || !file.type.startsWith("image/")) return;
  const img = new Image();
  img.onload = () => {
    if (state.started) commit();
    state.img = img; state.focusX = 50; state.focusY = 50; state.zoom = 1;
    document.body.dataset.mode = "studio";
    window.scrollTo(0, 0);
    if (!state.started) {
      state.started = true;
      state.genre = pickGenre(); state.content = freshContent(state.genre);
      syncFields(); syncChips();
    }
    render();
  };
  img.src = URL.createObjectURL(file);
}

// ポスターを直接さわって写真を動かす：ドラッグで移動、ピンチ／ホイールで拡大、ダブルタップで戻す。
// 「しくみ」表示中は、文字を押すとその項目を消せる。
function photoRoom() {
  const img = state.img, s = Math.max(W / img.width, H / img.height) * state.zoom;
  return [img.width * s - W, img.height * s - H];
}
function movePhoto(dx, dy) {
  const [rx, ry] = photoRoom();
  if (rx > 1) state.focusX = Math.min(100, Math.max(0, state.focusX - (dx * 100) / rx));
  if (ry > 1) state.focusY = Math.min(100, Math.max(0, state.focusY - (dy * 100) / ry));
}
function setZoom(z) { state.zoom = Math.min(3, Math.max(1, z)); }
function toCanvas(e) {
  const r = canvas.getBoundingClientRect();
  return [((e.clientX - r.left) * W) / r.width, ((e.clientY - r.top) * H) / r.height];
}
function setupDrag() {
  const pts = new Map();
  let moved = false, committed = false, pinch0 = null, lastTap = 0, dragRole = null;
  const once = () => { if (!committed) { commit(); committed = true; } };
  canvas.addEventListener("pointerdown", (e) => {
    if (!state.img) return;
    canvas.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) { moved = false; committed = false; dragRole = state.guide ? hitRole(...toCanvas(e)) : null; }
    if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = { d: Math.hypot(a.x - b.x, a.y - b.y), z: state.zoom }; }
    canvas.classList.add("dragging");
  });
  canvas.addEventListener("pointermove", (e) => {
    const p = pts.get(e.pointerId);
    if (!p) return;
    const k = W / canvas.clientWidth;
    const dx = (e.clientX - p.x) * k, dy = (e.clientY - p.y) * k;
    if (!moved && pts.size === 1 && Math.hypot(e.clientX - p.x, e.clientY - p.y) < 6) return;
    moved = true; once();
    p.x = e.clientX; p.y = e.clientY;
    if (pts.size === 2 && pinch0) {
      const [a, b] = [...pts.values()];
      setZoom(pinch0.z * Math.hypot(a.x - b.x, a.y - b.y) / pinch0.d);
    } else if (dragRole) {
      const o = state.offsets[dragRole] || (state.offsets[dragRole] = [0, 0]);
      o[0] += dx; o[1] += dy;
    } else movePhoto(dx, dy);
    quickRender();
  });
  const end = (e) => {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch0 = null;
    if (pts.size) return;
    canvas.classList.remove("dragging");
    if (moved && dragRole) syncLesson();
    if (!moved && e.type === "pointerup") {
      const now = Date.now();
      if (now - lastTap < 320) { resetPhoto(); lastTap = 0; return; }
      lastTap = now;
      const role = hitRole(...toCanvas(e));
      if (state.guide) { if (role) toggleHidden(role); }
      else if (role) openSheet(FIELD_OF[role] || null);
    }
  };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
  canvas.addEventListener("wheel", (e) => {
    if (!state.img) return;
    e.preventDefault();
    if (!wheelTimer) commit();
    clearTimeout(wheelTimer); wheelTimer = setTimeout(() => { wheelTimer = null; }, 400);
    setZoom(state.zoom * Math.exp(-e.deltaY * 0.0015));
    quickRender();
  }, { passive: false });
}
let wheelTimer = null;
function resetPhoto() {
  if (state.zoom === 1 && state.focusX === 50 && state.focusY === 50) return;
  commit(); state.zoom = 1; state.focusX = 50; state.focusY = 50; quickRender();
}

// =====================================================================
// しくみ（ガイド）：余白・三分割・文字の位置と大きさを重ねて見せる
// =====================================================================
const ROLE_INFO = {
  title: ["タイトル", "#ff6b6b"], en: ["サブ", "#ffa94d"], tagline: ["コピー", "#4dc3ff"], cast: ["キャスト", "#8ce99a"],
  credits: ["クレジット", "#c4a7ff"], date: ["公開日", "#ffe066"], extras: ["映画祭・評", "#ff8ad8"],
};
const HIDEABLE = Object.keys(ROLE_INFO);
const FIELD_OF = { title: "title", en: "en", tagline: "tagline", cast: "cast", credits: "director", date: "date" };
function groupBoxes() {
  const g = {};
  for (const b of state.boxes) {
    const u = g[b.role] || (g[b.role] = { role: b.role, x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity, size: 0, min: Infinity, parts: [] });
    u.x0 = Math.min(u.x0, b.x0); u.y0 = Math.min(u.y0, b.y0); u.x1 = Math.max(u.x1, b.x1); u.y1 = Math.max(u.y1, b.y1);
    u.size = Math.max(u.size, b.size); if (b.size) u.min = Math.min(u.min, b.size); u.parts.push(b);
  }
  return g;
}
const gcv = $("#guide"); gcv.width = W; gcv.height = H;
const gx = gcv.getContext("2d");
function drawGuide() {
  gx.clearRect(0, 0, W, H);
  if (!state.guide) return;
  gx.fillStyle = "rgba(0,0,0,.42)"; gx.fillRect(0, 0, W, H);
  // 三分割
  gx.strokeStyle = "rgba(255,255,255,.28)"; gx.lineWidth = 2; gx.setLineDash([]);
  gx.beginPath();
  for (const t of [1 / 3, 2 / 3]) { gx.moveTo(W * t, 0); gx.lineTo(W * t, H); gx.moveTo(0, H * t); gx.lineTo(W, H * t); }
  gx.stroke();
  // 余白（マージン）
  gx.strokeStyle = "rgba(255,255,255,.7)"; gx.setLineDash([14, 10]);
  gx.strokeRect(M, M, W - M * 2, H - M * 2);
  gx.setLineDash([]);
  gx.font = "500 32px 'Noto Sans JP'"; gx.fillStyle = "rgba(255,255,255,.85)";
  gx.fillText("余白", M + 12, M + 40);
  const g = groupBoxes();
  // 写真の範囲（全面でないとき）
  const ph = g.photo;
  if (ph && (ph.x1 - ph.x0 < W - 4 || ph.y1 - ph.y0 < H - 4)) {
    gx.strokeStyle = "#ffffff"; gx.lineWidth = 3; gx.setLineDash([4, 8]);
    for (const b of ph.parts) gx.strokeRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0);
    gx.setLineDash([]);
  }
  for (const role of HIDEABLE) {
    const u = g[role]; if (!u) continue;
    const [name, col] = ROLE_INFO[role];
    gx.fillStyle = col + "2e"; gx.strokeStyle = col; gx.lineWidth = 3;
    for (const b of u.parts) { gx.fillRect(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); }
    gx.strokeRect(u.x0 - 6, u.y0 - 6, u.x1 - u.x0 + 12, u.y1 - u.y0 + 12);
    const label = `${name}  ${Math.round(u.size)}`;
    gx.font = "700 34px 'Noto Sans JP'";
    const lw = gx.measureText(label).width + 24;
    let lx = Math.min(Math.max(u.x0 - 6, 6), W - lw - 6), ly = u.y0 - 56;
    if (ly < 6) ly = u.y1 + 10;
    gx.fillStyle = col; gx.fillRect(lx, ly, lw, 46);
    gx.fillStyle = "#111"; gx.fillText(label, lx + 12, ly + 35);
  }
}
function lessonMetrics() {
  // 文字が占める面積（粗いマス目で数える）と、大小の差（ジャンプ率）
  const N = 60, Mh = 90, grid = new Uint8Array(N * Mh);
  let maxS = 0, minS = Infinity;
  for (const b of state.boxes) {
    if (!HIDEABLE.includes(b.role)) continue;
    if (b.size) { maxS = Math.max(maxS, b.size); minS = Math.min(minS, b.size); }
    for (let j = Math.max(0, Math.floor(b.y0 / H * Mh)); j < Math.min(Mh, Math.ceil(b.y1 / H * Mh)); j++)
      for (let i = Math.max(0, Math.floor(b.x0 / W * N)); i < Math.min(N, Math.ceil(b.x1 / W * N)); i++) grid[j * N + i] = 1;
  }
  const area = Math.round((grid.reduce((a, v) => a + v, 0) / grid.length) * 100);
  const jump = minS < Infinity && minS > 0 ? (maxS / minS).toFixed(1) : "–";
  return { area, jump };
}
function syncLesson() {
  const box = $("#lesson");
  box.hidden = !state.guide;
  document.body.classList.toggle("guiding", state.guide);
  $("#guide-toggle").setAttribute("aria-pressed", state.guide);
  if (!state.guide) { gx.clearRect(0, 0, W, H); return; }
  const [name, body] = LESSONS[state.usedLayout] || ["", ""];
  $("#l-name").textContent = name;
  $("#l-body").textContent = body;
  const m = lessonMetrics();
  $("#l-metrics").textContent = `文字の面積 ${m.area}%　大小の差 ${m.jump}倍`;
  $("#l-metrics").title = "大小の差（ジャンプ率）＝いちばん大きい文字 ÷ いちばん小さい文字";
  $("#l-reset").hidden = !Object.values(state.offsets).some((o) => o[0] || o[1]);
  const hid = $("#l-hidden"); hid.innerHTML = "";
  if (!state.hidden.size) hid.textContent = "なし";
  for (const r of state.hidden) {
    const b = document.createElement("button");
    b.type = "button"; b.className = "restore"; b.textContent = `＋ ${ROLE_INFO[r][0]}`;
    b.addEventListener("click", () => toggleHidden(r));
    hid.appendChild(b);
  }
}
function tapToHide(x, y) { const r = hitRole(x, y); if (r) toggleHidden(r); }
function hitRole(x, y) {
  let best = null, area = Infinity;
  for (const b of state.boxes) {
    if (!HIDEABLE.includes(b.role)) continue;
    const pad = 18;
    if (x >= b.x0 - pad && x <= b.x1 + pad && y >= b.y0 - pad && y <= b.y1 + pad) {
      const a = (b.x1 - b.x0) * (b.y1 - b.y0);
      if (a < area) { area = a; best = b.role; }
    }
  }
  return best;
}
function toggleHidden(role) {
  commit();
  state.hidden.has(role) ? state.hidden.delete(role) : state.hidden.add(role);
  syncHidden();
  render();
}
function syncHidden() {
  document.querySelectorAll("[data-hide]").forEach((b) => {
    const off = state.hidden.has(b.dataset.hide);
    b.setAttribute("aria-pressed", !off);
    b.closest(".field").classList.toggle("off", off);
  });
}

// =====================================================================
// 保存
// =====================================================================
async function saveBlob(blob, name) {
  const file = new File([blob], name, { type: blob.type });
  if (matchMedia("(pointer: coarse)").matches && navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file] }); return; } catch (e) { if (e.name === "AbortError") return; }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}
function toast(msg, ms = 1800) {
  const t = $("#toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), ms);
}

// =====================================================================
// お気に入り（気になるポスターを端末に保存しておく）
// =====================================================================
const Basket = {
  db: null, mem: [],
  async open() {
    try {
      this.db = await new Promise((res, rej) => {
        const r = indexedDB.open("nandemo-poster", 1);
        r.onupgradeneeded = () => r.result.createObjectStore("basket", { keyPath: "id", autoIncrement: true });
        r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
      });
    } catch (e) { this.db = null; }
  },
  tx(mode) { return this.db.transaction("basket", mode).objectStore("basket"); },
  async all() {
    if (!this.db) return [...this.mem];
    return new Promise((res) => { const r = this.tx("readonly").getAll(); r.onsuccess = () => res(r.result); r.onerror = () => res([]); });
  },
  async add(item) {
    if (!this.db) { item.id = Date.now(); this.mem.push(item); return; }
    return new Promise((res) => { const r = this.tx("readwrite").add(item); r.onsuccess = () => res(); r.onerror = () => res(); });
  },
  async remove(id) {
    if (!this.db) { this.mem = this.mem.filter((i) => i.id !== id); return; }
    return new Promise((res) => { const r = this.tx("readwrite").delete(id); r.onsuccess = () => res(); r.onerror = () => res(); });
  },
};
async function addToBasket() {
  const blob = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.92));
  const design = { genre: state.genre, layout: state.usedLayout, titleFont: state.titleFont, gradeKey: state.gradeKey,
    hidden: [...state.hidden], offsets: structuredClone(state.offsets) };
  await Basket.add({ blob, design, title: state.content.title, genre: GENRES[state.genre].label, layout: LAYOUTS[state.usedLayout].label, created: Date.now() });
  const btn = $("#keep");
  btn.classList.remove("pop"); void btn.offsetWidth; btn.classList.add("pop", "on");
  toast("お気に入りに入れました");
  updateBasketCount();
}
async function updateBasketCount() {
  const n = (await Basket.all()).length;
  $("#basket-count").textContent = n;
  $("#open-basket").classList.toggle("has", n > 0);
}
// お気に入りの「構成」（ジャンル・構図・書体・色調・消した項目・動かした位置）を今の写真に当てはめる
function applyDesign(d) {
  commit();
  const changeGenre = d.genre !== state.genre;
  Object.assign(state, { genre: d.genre, layout: d.layout, usedLayout: d.layout, titleFont: d.titleFont, gradeKey: d.gradeKey,
    hidden: new Set(d.hidden || []), offsets: structuredClone(d.offsets || {}), offLayout: d.layout });
  if (changeGenre) state.content = freshContent(state.genre);
  syncFields(); syncChips(); syncHidden();
  render();
}
let basketUrls = [];
async function renderBasket() {
  basketUrls.forEach((u) => URL.revokeObjectURL(u)); basketUrls = [];
  const items = (await Basket.all()).sort((a, b) => b.created - a.created);
  const grid = $("#basket-grid");
  grid.innerHTML = "";
  $("#basket-empty").hidden = items.length > 0;
  for (const it of items) {
    const url = URL.createObjectURL(it.blob); basketUrls.push(url);
    const card = document.createElement("figure");
    card.className = "kept";
    card.innerHTML = `<img alt=""><figcaption><span class="t"></span><span class="m"></span></figcaption>
      <div class="kept-actions"><button type="button" class="use">この構成を使う</button><button type="button" class="save">保存</button><button type="button" class="del">削除</button></div>`;
    card.querySelector("img").src = url;
    card.querySelector("img").alt = it.title;
    card.querySelector(".t").textContent = it.title;
    card.querySelector(".m").textContent = `${it.genre} ／ ${it.layout}`;
    const use = card.querySelector(".use");
    if (!it.design || !state.img) use.remove();
    else use.addEventListener("click", () => { applyDesign(it.design); basket.close(); toast("構成を呼び出しました"); });
    card.querySelector(".save").addEventListener("click", () => saveBlob(it.blob, `${it.title}.jpg`));
    card.querySelector(".del").addEventListener("click", async () => { await Basket.remove(it.id); renderBasket(); updateBasketCount(); });
    grid.appendChild(card);
  }
}

// =====================================================================
// つなぎこみ
// =====================================================================
document.querySelectorAll("input[type=file]").forEach((inp) => inp.addEventListener("change", (e) => { loadFile(e.target.files[0]); e.target.value = ""; }));
window.addEventListener("dragover", (e) => { e.preventDefault(); document.body.classList.add("dropping"); });
window.addEventListener("dragleave", (e) => { if (!e.relatedTarget) document.body.classList.remove("dropping"); });
window.addEventListener("drop", (e) => { e.preventDefault(); document.body.classList.remove("dropping"); loadFile(e.dataTransfer.files[0]); });

for (const f of FIELDS) $(`#f-${f}`).addEventListener("input", onInput);
document.querySelectorAll("[data-roll]").forEach((b) => b.addEventListener("click", () => rollField(b.dataset.roll)));
$("#shuffle").addEventListener("click", shuffleAll);
$("#undo").addEventListener("click", undo);
$("#text-random").addEventListener("click", rollAllText);
$("#lay-prev").addEventListener("click", () => stepLayout(-1));
$("#lay-next").addEventListener("click", () => stepLayout(1));
$("#keep").addEventListener("click", () => { if (!$("#keep").classList.contains("on")) addToBasket(); });
$("#l-reset").addEventListener("click", () => { commit(); state.offsets = {}; render(); });
$("#guide-toggle").addEventListener("click", () => { state.guide = !state.guide; syncLesson(); drawGuide(); });
document.querySelectorAll("[data-hide]").forEach((b) => b.addEventListener("click", () => toggleHidden(b.dataset.hide)));
$("#save").addEventListener("click", () => canvas.toBlob((b) => saveBlob(b, `${state.content.title || "poster"}.png`), "image/png"));

// 文字のシート：開いていてもポスターが見えるように、モーダルにしない
const sheet = $("#sheet");
function openSheet(field) {
  if (!sheet.open) { sheet.show(); document.body.classList.add("editing"); }
  if (field) { const el = $(`#f-${field}`); if (el) { el.focus({ preventScroll: true }); el.closest(".field").scrollIntoView({ block: "center", behavior: "smooth" }); el.select(); } }
}
$("#close-edit").addEventListener("click", () => sheet.close());
sheet.addEventListener("close", () => document.body.classList.remove("editing"));

const basket = $("#basket");
$("#open-basket").addEventListener("click", async () => { await renderBasket(); basket.showModal(); });
$("#close-basket").addEventListener("click", () => basket.close());
basket.addEventListener("click", (e) => { if (e.target === basket) basket.close(); });

document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.target.matches("input")) { e.preventDefault(); undo(); }
});

buildChips();
buildSelect($("#layout"), [["auto", "ジャンルに合わせる（自動）"], ...Object.entries(LAYOUTS).map(([k, l]) => [k, l.label])], (v) => { state.layout = v; state.usedLayout = null; });
buildSelect($("#title-font"), Object.entries(TITLE_FONTS).map(([k, v]) => [k, v.label]), (v) => { state.titleFont = v; });
buildSelect($("#grade"), Object.entries(GRADES).map(([k, v]) => [k, v.label]), (v) => { state.gradeKey = v; });
setupDrag();
Basket.open().then(updateBasketCount);

state.content = freshContent(state.genre);
syncFields(); syncChips();
render();

// 確認用
window.nandemo = { state, render, LAYOUTS, STYLES, GENRES, setGenre, loadFile, undo };

// なんでもポスター：画面の操作（engine.js / layouts.js / styles.js / data.js を使う）

const state = {
  img: null, started: false,
  genre: "seishun", layout: "auto", usedLayout: null,
  titleFont: "auto", gradeKey: "auto",
  focusX: 50, focusY: 50,
  content: null,
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
  syncControls();
}
function draw(st) {
  S = st;
  const layout = chooseLayout();
  state.usedLayout = layout;
  AUTO_DARK = false;
  ctx.save(); ctx.clearRect(0, 0, W, H);
  drawPhoto();
  S.photo();
  BASE = S.autoInk ? ctx.getImageData(0, 0, W, H).data : null;
  LAYOUTS[layout].draw({ ...state.content, note: GENRES[state.genre].rating ? state.content.note : null });
  if (S.after) S.after();
  ctx.restore();
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
    focusX: state.focusX, focusY: state.focusY, content: structuredClone(state.content), edited: [...state.edited] };
}
function commit() {
  past.push(takeState());
  if (past.length > 60) past.shift();
  $("#undo").disabled = false;
}
function undo() {
  const s = past.pop();
  if (!s) return;
  Object.assign(state, s, { edited: new Set(s.edited) });
  syncFields(); syncChips();
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
  const r = randomContent(state.genre);
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
  $("#focusX").value = state.focusX; $("#focusY").value = state.focusY;
  $("#layout-now").textContent = `${GENRES[state.genre].label}　／　${LAYOUTS[state.usedLayout].label}`;
}

// =====================================================================
// 写真
// =====================================================================
function loadFile(file) {
  if (!file || !file.type.startsWith("image/")) return;
  const img = new Image();
  img.onload = () => {
    if (state.started) commit();
    state.img = img; state.focusX = 50; state.focusY = 50;
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

// ポスターを直接ドラッグして写真の位置を動かす
function setupDrag() {
  let drag = null;
  canvas.addEventListener("pointerdown", (e) => {
    if (!state.img) return;
    commit();
    drag = { x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add("dragging");
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const k = W / canvas.clientWidth;
    const dx = (e.clientX - drag.x) * k, dy = (e.clientY - drag.y) * k;
    drag = { x: e.clientX, y: e.clientY };
    const img = state.img, s = Math.max(W / img.width, H / img.height);
    const rx = img.width * s - W, ry = img.height * s - H;
    if (rx > 1) state.focusX = Math.min(100, Math.max(0, state.focusX - (dx * 100) / rx));
    if (ry > 1) state.focusY = Math.min(100, Math.max(0, state.focusY - (dy * 100) / ry));
    quickRender();
  });
  const end = () => { if (!drag) return; drag = null; canvas.classList.remove("dragging"); syncControls(); };
  canvas.addEventListener("pointerup", end);
  canvas.addEventListener("pointercancel", end);
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
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg; t.classList.add("show");
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove("show"), 1800);
}

// =====================================================================
// カゴ（気になるポスターを端末に保存しておく）
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
  await Basket.add({ blob, title: state.content.title, genre: GENRES[state.genre].label, layout: LAYOUTS[state.usedLayout].label, created: Date.now() });
  const btn = $("#keep");
  btn.classList.remove("pop"); void btn.offsetWidth; btn.classList.add("pop");
  toast("カゴに入れました");
  updateBasketCount();
}
async function updateBasketCount() {
  const n = (await Basket.all()).length;
  $("#basket-count").textContent = n;
  $("#open-basket").classList.toggle("has", n > 0);
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
      <div class="kept-actions"><button type="button" class="save">保存</button><button type="button" class="del">削除</button></div>`;
    card.querySelector("img").src = url;
    card.querySelector("img").alt = it.title;
    card.querySelector(".t").textContent = it.title;
    card.querySelector(".m").textContent = `${it.genre} ／ ${it.layout}`;
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
$("#layout-roll").addEventListener("click", shuffleLayout);
$("#keep").addEventListener("click", addToBasket);
$("#save").addEventListener("click", () => canvas.toBlob((b) => saveBlob(b, `${state.content.title || "poster"}.png`), "image/png"));
for (const axis of ["X", "Y"]) {
  const el = $(`#focus${axis}`);
  el.addEventListener("pointerdown", commit);
  el.addEventListener("input", (e) => { state[`focus${axis}`] = +e.target.value; quickRender(); });
}

// 文字のシート：開いていてもポスターが見えるように、モーダルにしない
const sheet = $("#sheet");
$("#open-edit").addEventListener("click", () => { sheet.show(); document.body.classList.add("editing"); });
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

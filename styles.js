// =====================================================================
// ジャンル（色・書体・装飾）と、そのジャンルに似合う構図
// =====================================================================
const SH = (a = 0.5, b = 14) => ({ color: `rgba(0,0,0,${a})`, blur: b });
const STYLES = {
  seishun: {
    layouts: ["bottom", "vright", "corner", "frame", "split", "top", "arch", "polaroid", "triptych", "circle", "outline", "vcenter"],
    photo() { grade({ sat: 1.15, bright: 1.05, mul: [1.08, 1.0, 0.86], add: [0.04, 0.02, 0] }); bloom(0.35); grain(0.08); },
    scrim: "40,28,15", paper: "#f4ecdc", ink: "#3b2a18", accent: "#e39b34",
    title: { family: "'Zen Maru Gothic'", weight: 700, color: "#fff8e8", shadow: SH(0.45, 18) },
    sub: { family: "'Cormorant Garamond'", weight: 600, color: "#f0d7a0", spacing: 0.2 },
    tagline: { family: "'Zen Maru Gothic'", weight: 700, color: "#fffaf0", shadow: SH(0.5, 10) },
    body: { family: "'Noto Sans JP'", color: "#fffaf0", dim: "#e3d4bc" },
    date: { family: "'Noto Sans JP'", weight: 900, color: "#ffdc8c", paperColor: "#c9761c" },
  },
  korean: {
    layouts: ["top", "corner", "frame", "center", "vleft", "letterbox", "bottom", "arch", "billing", "quote", "polaroid", "triptych", "swiss", "vcenter"],
    photo() { grade({ sat: 0.68, contrast: 0.82, bright: 1.04, mul: [0.95, 1.0, 1.0], add: [0.06, 0.07, 0.07] }); grain(0.1); },
    scrim: "20,24,26", scrimAlpha: 0.4, autoInk: true, autoInkThreshold: 135, paper: "#efefeb", ink: "#2a2d2e", accent: "#8a9a95",
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
      const [f, a] = (c.festivals || [["第12回 なんでも国際映画祭", "公式招待作品"]])[0];
      laurel(x, y, [f, a], color);
    },
  },
  knoir: {
    layouts: ["casttop", "center", "stack", "letterbox", "vright", "split", "diagonal", "outline", "sideband", "filmstrip", "billing"],
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
    layouts: ["bottom", "center", "top", "vright", "letterbox", "arch", "stack", "outline", "filmstrip", "circle", "vcenter", "quote"],
    photo() { grade({ sat: 0.3, contrast: 1.35, bright: 0.72, mul: [0.8, 0.92, 0.95] }); vignette(0.9); grain(0.2); },
    scrim: "4,6,8", paper: "#08090a", ink: "#d8d8d4", accent: "#c40c0c",
    title: { family: "'Noto Serif JP'", weight: 900, color: "#c40c0c", spacing: 0.12, scale: 1.15, shadow: { color: "rgba(255,0,0,.35)", blur: 30 }, deco: "ghost", paperColor: "#c40c0c" },
    sub: { family: "'Cormorant Garamond'", weight: 700, color: "#c8c8c3", spacing: 0.35 },
    tagline: { family: "'Noto Serif JP'", weight: 500, color: "#e1e1dc" },
    body: { family: "'Noto Sans JP'", color: "#bdbdb8", dim: "#8f8f8a" },
    date: { family: "'Cormorant Garamond'", weight: 700, color: "#dcdcd7", spacing: 0.06, paperColor: "#dcdcd7" },
  },
  suspense: {
    layouts: ["bottom", "center", "split", "stack", "corner", "letterbox", "diagonal", "casttop", "outline", "filmstrip", "swiss", "quote", "billing"],
    photo() { grade({ sat: 0.45, contrast: 1.45, bright: 0.85, mul: [0.9, 0.97, 1.06] }); vignette(0.6); grain(0.12); },
    scrim: "0,0,0", paper: "#111315", ink: "#f2f2f2", accent: "#d4111e", bandInk: "#ffffff",
    title: { family: "'Noto Sans JP'", weight: 900, color: "#ffffff", spacing: 0.06, shadow: SH(0.8, 20), deco: "redline", paperColor: "#ffffff" },
    sub: { family: "'Noto Sans JP'", weight: 700, color: "#d8d8d8", spacing: 0.4 },
    tagline: { family: "'Noto Sans JP'", weight: 700, color: "#ffffff" },
    body: { family: "'Noto Sans JP'", color: "#e6e6e6", castWeight: 700, dim: "#9a9a9a" },
    date: { family: "'Noto Sans JP'", weight: 900, color: "#e3202c", spacing: 0.05 },
  },
  romance: {
    layouts: ["bottom", "top", "frame", "arch", "vright", "corner", "polaroid", "circle", "triptych", "vcenter"],
    photo() { grade({ sat: 0.9, contrast: 0.9, bright: 1.12, mul: [1.05, 0.96, 1.0], add: [0.06, 0.03, 0.06] }); bloom(0.5); grain(0.05); },
    scrim: "70,35,55", paper: "#f7eaef", ink: "#5a2c40", accent: "#d97a9b",
    title: { family: "'Shippori Mincho B1'", weight: 800, color: "#ffffff", shadow: { color: "rgba(90,30,60,.6)", blur: 22 } },
    sub: { family: "'Cormorant Garamond'", weight: 500, color: "#ffd6e4", spacing: 0.12 },
    tagline: { family: "'Shippori Mincho B1'", weight: 600, color: "#ffffff", shadow: { color: "rgba(90,40,60,.6)", blur: 14 } },
    body: { family: "'Shippori Mincho B1'", color: "#fff4f8", castWeight: 600, dim: "#f0d0dc" },
    date: { family: "'Shippori Mincho B1'", weight: 800, color: "#ffc6d9", paperColor: "#b04a70" },
  },
  sf: {
    layouts: ["center", "top", "letterbox", "arch", "bottom", "stack", "outline", "filmstrip", "circle", "swiss"],
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
    layouts: ["diagonal", "bottom", "split", "top", "stack", "casttop", "ticket", "polaroid", "outline"],
    photo() { grade({ sat: 1.45, contrast: 1.1, bright: 1.08 }); },
    scrim: "0,0,0", scrimAlpha: 0.55, paper: "#ffe14d", ink: "#111111", accent: "#e8202a", bandInk: "#ffe14d",
    title: { family: "'Dela Gothic One'", weight: 400, color: "#ffe14d", stroke: 22, strokeColor: "#111", rotate: -0.05, paperColor: "#e8202a", paperStroke: 0 },
    sub: { family: "'Noto Sans JP'", weight: 900, color: "#ffffff", stroke: 8, strokeColor: "#111", spacing: 0.1 },
    tagline: { family: "'Noto Sans JP'", weight: 700, color: "#111", bubble: true },
    body: { family: "'Noto Sans JP'", color: "#ffffff", castWeight: 900, stroke: 10, strokeColor: "#111" },
    date: { family: "'Dela Gothic One'", weight: 400, color: "#ffffff", stroke: 12, strokeColor: "#e8202a", paperColor: "#e8202a" },
  },
  showa: {
    layouts: ["vright", "vleft", "band", "bottom", "frame", "split", "sideband", "ticket", "vcenter"],
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
  taiwan: {
    layouts: ["top", "polaroid", "corner", "frame", "bottom", "vright", "triptych", "circle"],
    photo() { grade({ sat: 0.95, contrast: 0.88, bright: 1.12, mul: [0.97, 1.03, 1.0], add: [0.05, 0.07, 0.06] }); bloom(0.4); grain(0.07); },
    scrim: "20,40,40", scrimAlpha: 0.45, autoInk: true, autoInkThreshold: 140, paper: "#f2f5ef", ink: "#24433f", accent: "#2f8f83",
    title: { family: "'Klee One'", weight: 600, color: "#ffffff", spacing: 0.06, shadow: SH(0.35, 12) },
    sub: { family: "'Noto Serif TC'", weight: 600, color: "#ffffff", spacing: 0.25, shadow: SH(0.3, 8) },
    tagline: { family: "'Klee One'", weight: 600, color: "#ffffff", shadow: SH(0.35, 8) },
    body: { family: "'Noto Sans JP'", color: "#ffffff", castSpacing: 0.1, dim: "rgba(255,255,255,.85)", shadow: SH(0.3, 6) },
    date: { family: "'Klee One'", weight: 600, color: "#ffffff", paperColor: "#2f8f83" },
  },
  minitheater: {
    layouts: ["corner", "billing", "frame", "swiss", "top", "quote", "triptych", "letterbox", "polaroid"],
    photo() { grade({ sat: 0.75, contrast: 0.92, bright: 0.98, mul: [1.0, 0.99, 0.95], add: [0.03, 0.03, 0.02] }); grain(0.14); },
    scrim: "18,16,14", scrimAlpha: 0.7, autoInk: true, autoInkThreshold: 150, paper: "#ecebe6", ink: "#1d1c1a", accent: "#1d1c1a",
    title: { family: "'Zen Old Mincho'", weight: 700, color: "#ffffff", spacing: 0.08, scale: 0.85, shadow: SH(0.3, 10) },
    sub: { family: "'Cormorant Garamond'", weight: 500, color: "rgba(255,255,255,.9)", spacing: 0.15 },
    tagline: { family: "'Zen Old Mincho'", weight: 700, color: "#ffffff", shadow: SH(0.3, 8) },
    body: { family: "'Noto Sans JP'", color: "#ffffff", dim: "rgba(255,255,255,.75)" },
    date: { family: "'Cormorant Garamond'", weight: 600, color: "#ffffff", spacing: 0.2, paperColor: "#1d1c1a" },
    extras(c, x, y, w, color) { festivalLaurels(c, x, y, color, w > W * 0.6 ? 3 : 1, 0.85); },
  },
  nouvelle: {
    layouts: ["frame", "split", "swiss", "corner", "top", "polaroid", "circle", "band"],
    photo() { grade({ sat: 0.85, contrast: 1.08, bright: 1.0, mul: [1.04, 0.99, 0.94], add: [0.03, 0.02, 0.0] }); grain(0.12); },
    scrim: "25,20,30", paper: "#f3efe6", ink: "#1b2a5c", accent: "#d32f2f",
    title: { family: "'Zen Old Mincho'", weight: 900, color: "#ffffff", shadow: SH(0.4, 12), paperColor: "#d32f2f" },
    sub: { family: "'Bodoni Moda'", weight: 500, color: "#ffffff", spacing: 0.08 },
    tagline: { family: "'Zen Old Mincho'", weight: 700, color: "#ffffff", shadow: SH(0.4, 8) },
    body: { family: "'Noto Sans JP'", color: "#ffffff", dim: "rgba(255,255,255,.8)" },
    date: { family: "'Bodoni Moda'", weight: 700, color: "#ffffff", spacing: 0.1, paperColor: "#1b2a5c" },
  },
  hk: {
    layouts: ["center", "vright", "vcenter", "letterbox", "stack", "casttop", "outline", "filmstrip"],
    photo() {
      grade({ sat: 1.3, contrast: 1.3, bright: 0.8, split: { shadow: [0.0, 0.08, 0.14], high: [0.16, -0.04, 0.1] } });
      vignette(0.8, "10,0,20"); grain(0.14);
    },
    scrim: "8,2,16", paper: "#0e0612", ink: "#ffd9f5", accent: "#ff2bd6",
    title: { family: "'Shippori Mincho B1'", weight: 800, color: "#fff0fb", deco: "neon", glow: "#ff2bd6", shadow: { color: "#ff2bd6", blur: 24 }, paperColor: "#ff6be3" },
    sub: { family: "'Noto Serif TC'", weight: 600, color: "#4ff5ff", spacing: 0.4, shadow: { color: "rgba(0,240,255,.7)", blur: 14 } },
    tagline: { family: "'Shippori Mincho B1'", weight: 600, color: "#ffe3f8", shadow: SH(0.6, 10) },
    body: { family: "'Noto Sans JP'", color: "#ffe3f8", castWeight: 700, dim: "#b28ca9" },
    date: { family: "'Noto Serif TC'", weight: 600, color: "#4ff5ff", spacing: 0.1, shadow: { color: "rgba(0,240,255,.7)", blur: 14 } },
  },
  jidai: {
    layouts: ["vright", "vcenter", "sideband", "vleft", "band", "center", "outline"],
    photo() { grade({ sat: 0.35, contrast: 1.35, bright: 0.82, sepia: 0.35, mul: [1.0, 0.96, 0.9] }); vignette(0.85, "15,8,0"); grain(0.2); },
    scrim: "10,6,2", paper: "#e9dfc8", ink: "#1a120b", accent: "#b8231c",
    title: { family: "'Yuji Boku'", weight: 400, color: "#f7efe0", scale: 1.15, shadow: SH(0.9, 20), deco: "seal", paperColor: "#1a120b" },
    sub: { family: "'Cormorant Garamond'", weight: 700, color: "#d9c9a6", spacing: 0.35 },
    tagline: { family: "'Shippori Mincho B1'", weight: 800, color: "#f0e4cc", shadow: SH(0.8, 8) },
    body: { family: "'Shippori Mincho B1'", color: "#f0e4cc", castWeight: 800, dim: "#b9a988" },
    date: { family: "'Shippori Mincho B1'", weight: 800, color: "#e6c46a", spacing: 0.1, paperColor: "#b8231c" },
  },
  action: {
    layouts: ["center", "diagonal", "casttop", "stack", "outline", "bottom", "split"],
    photo() {
      grade({ sat: 1.35, contrast: 1.35, bright: 0.92, split: { shadow: [-0.06, 0.04, 0.14], high: [0.16, 0.06, -0.08] } });
      vignette(0.7); grain(0.08);
    },
    scrim: "5,8,18", paper: "#101420", ink: "#f4f4f4", accent: "#ff4a1c", bandInk: "#ffffff",
    title: { family: "'Dela Gothic One'", weight: 400, color: "#ffffff", fill: "chrome", stroke: 6, strokeColor: "#0b1020", spacing: 0.02, shadow: { color: "rgba(255,90,20,.7)", blur: 30 }, rotate: -0.03, paperColor: "#ff4a1c" },
    sub: { family: "'Anton'", weight: 400, color: "#ffb02e", spacing: 0.2 },
    tagline: { family: "'Noto Sans JP'", weight: 900, color: "#ffffff", shadow: SH(0.8, 10) },
    body: { family: "'Noto Sans JP'", color: "#ffffff", castWeight: 900, castSpacing: 0.1, dim: "#9aa3b5" },
    date: { family: "'Anton'", weight: 400, color: "#ffb02e", spacing: 0.06, paperColor: "#ff4a1c" },
  },
  mystery: {
    layouts: ["frame", "center", "bottom", "letterbox", "circle", "swiss", "ticket", "quote"],
    photo() { grade({ sat: 0.55, contrast: 1.15, bright: 0.86, mul: [0.9, 0.98, 1.02], add: [0.0, 0.02, 0.03] }); vignette(0.7, "5,15,20"); grain(0.15); },
    scrim: "6,16,22", paper: "#ece4d2", ink: "#16303a", accent: "#c9a14a",
    title: { family: "'Zen Old Mincho'", weight: 900, color: "#f4ead3", spacing: 0.06, shadow: SH(0.7, 16), deco: "box", paperColor: "#16303a" },
    sub: { family: "'Cormorant Garamond'", weight: 600, color: "#c9a14a", spacing: 0.3 },
    tagline: { family: "'Zen Old Mincho'", weight: 700, color: "#f4ead3", shadow: SH(0.6, 8) },
    body: { family: "'Noto Sans JP'", color: "#e9dfc7", dim: "#a49a85" },
    date: { family: "'Zen Old Mincho'", weight: 700, color: "#c9a14a", paperColor: "#16303a" },
  },
  doc: {
    layouts: ["corner", "split", "swiss", "quote", "triptych", "frame", "billing"],
    photo() { grade({ sat: 0.82, contrast: 1.02, bright: 1.0 }); grain(0.06); },
    scrim: "0,0,0", scrimAlpha: 0.75, paper: "#f5f5f2", ink: "#111111", accent: "#e8442d",
    title: { family: "'Noto Sans JP'", weight: 900, color: "#ffffff", spacing: 0.02, shadow: SH(0.4, 10), paperColor: "#111111" },
    sub: { family: "'Noto Sans JP'", weight: 700, color: "#ffffff", spacing: 0.25 },
    tagline: { family: "'Noto Sans JP'", weight: 700, color: "#ffffff", shadow: SH(0.4, 8) },
    body: { family: "'Noto Sans JP'", color: "#ffffff", dim: "rgba(255,255,255,.75)" },
    date: { family: "'Noto Sans JP'", weight: 700, color: "#ffffff", paperColor: "#e8442d" },
    extras(c, x, y, w, color) { festivalLaurels(c, x, y, color, w > W * 0.6 ? 2 : 1, 0.85); },
  },
  fantasy: {
    layouts: ["center", "arch", "circle", "top", "bottom", "vcenter", "outline"],
    photo() { grade({ sat: 1.05, contrast: 1.05, bright: 1.0, split: { shadow: [0.06, 0.0, 0.14], high: [0.1, 0.07, -0.02] } }); bloom(0.55); vignette(0.55, "20,0,40"); grain(0.06); },
    scrim: "18,8,40", paper: "#1b1230", ink: "#f4e6c4", accent: "#e6c46a",
    title: { family: "'Kaisei Decol'", weight: 700, color: "#fff4d0", fill: "gold", shadow: { color: "rgba(255,210,120,.7)", blur: 30 }, spacing: 0.04, paperColor: "#e6c46a" },
    sub: { family: "'Cormorant Garamond'", weight: 700, color: "#f1dd9d", spacing: 0.3 },
    tagline: { family: "'Kaisei Decol'", weight: 700, color: "#fff4d0", shadow: SH(0.6, 10) },
    body: { family: "'Noto Serif JP'", color: "#f4e6c4", castWeight: 500, dim: "#b9a6d6" },
    date: { family: "'Kaisei Decol'", weight: 700, color: "#e6c46a", paperColor: "#e6c46a" },
  },
};

// =====================================================================
// フォント読み込み
// =====================================================================
// 描画に使う書体だけを読み込む（全部を読むと重いので）
function fontSpecsFor(st) {
  const set = new Set(["400 40px 'Noto Sans JP'", "500 40px 'Noto Sans JP'", "700 40px 'Noto Sans JP'", "500 40px 'Noto Serif JP'", "700 40px 'Noto Serif JP'"]);
  for (const k of ["title", "sub", "tagline", "body", "date"]) {
    const f = st[k]; if (!f) continue;
    set.add(`${f.weight || 400} 40px ${f.family}`);
    if (k === "body") { set.add(`${f.castWeight || 500} 40px ${f.family}`); }
  }
  set.add("600 40px 'Klee One'"); set.add("400 40px 'Yuji Boku'");
  return [...set];
}
async function loadFonts(specs, str) {
  if (!document.fonts) return;
  try {
    await Promise.race([
      Promise.all(specs.map((f) => document.fonts.load(f, str))),
      new Promise((r) => setTimeout(r, 6000)),
    ]);
  } catch (e) { /* 読めなくても既定フォントで描く */ }
}

// ---------------------------------------------------------------------
// デザイン好き向けの上書き：タイトル書体と色調
// ---------------------------------------------------------------------
const TITLE_FONTS = {
  auto: { label: "ジャンルに合わせる" },
  mincho_b: { label: "明朝・極太", family: "'Noto Serif JP'", weight: 900 },
  mincho_l: { label: "明朝・細", family: "'Noto Serif JP'", weight: 300 },
  shippori: { label: "しっぽり明朝", family: "'Shippori Mincho B1'", weight: 800 },
  oldmincho: { label: "オールド明朝", family: "'Zen Old Mincho'", weight: 900 },
  hina: { label: "ひな明朝", family: "'Hina Mincho'", weight: 400 },
  decol: { label: "装飾明朝", family: "'Kaisei Decol'", weight: 700 },
  gothic_b: { label: "ゴシック・極太", family: "'Noto Sans JP'", weight: 900 },
  gothic_l: { label: "ゴシック・細", family: "'Noto Sans JP'", weight: 300 },
  maru: { label: "丸ゴシック", family: "'Zen Maru Gothic'", weight: 700 },
  klee: { label: "手書き", family: "'Klee One'", weight: 600 },
  brush: { label: "筆文字", family: "'Yuji Boku'", weight: 400 },
  syuku: { label: "筆文字・端正", family: "'Yuji Syuku'", weight: 400 },
  dela: { label: "極太ディスプレイ", family: "'Dela Gothic One'", weight: 400 },
  pop: { label: "ポップ", family: "'Mochiy Pop One'", weight: 400 },
  rock: { label: "ロック", family: "'RocknRoll One'", weight: 400 },
  dot: { label: "ドット", family: "'DotGothic16'", weight: 400 },
};
const GRADES = {
  auto: { label: "ジャンルに合わせる" },
  natural: { label: "そのまま", photo() { grain(0.04); } },
  mono: { label: "モノクロ", photo() { grade({ sat: 0, contrast: 1.15 }); grain(0.12); } },
  mono_hard: { label: "モノクロ・硬調", photo() { grade({ sat: 0, contrast: 1.7, bright: 0.85 }); vignette(0.6); grain(0.18); } },
  sepia: { label: "セピア", photo() { grade({ sat: 0.6, sepia: 0.8, contrast: 1.05 }); vignette(0.4, "40,25,10"); grain(0.15); } },
  teal: { label: "ティール＆オレンジ", photo() { grade({ sat: 1.2, contrast: 1.2, split: { shadow: [-0.06, 0.05, 0.12], high: [0.12, 0.04, -0.08] } }); grain(0.06); } },
  pastel: { label: "パステル", photo() { grade({ sat: 0.75, contrast: 0.78, bright: 1.12, add: [0.07, 0.06, 0.08] }); bloom(0.3); } },
  faded: { label: "褪色フィルム", photo() { grade({ sat: 0.7, contrast: 0.8, mul: [1.0, 0.97, 0.9], add: [0.07, 0.06, 0.05] }); grain(0.16); } },
  cross: { label: "クロスプロセス", photo() { grade({ sat: 1.3, contrast: 1.25, mul: [1.0, 1.06, 0.82], add: [0.0, 0.02, 0.06] }); grain(0.1); } },
  neon: { label: "シアン×マゼンタ", photo() { grade({ sat: 1.3, contrast: 1.3, bright: 0.85, split: { shadow: [0.0, 0.1, 0.16], high: [0.16, -0.05, 0.12] } }); } },
  duo_blue: { label: "デュオトーン・青×橙", photo() { grade({ duo: [[0.05, 0.1, 0.32], [1.0, 0.72, 0.42]], contrast: 1.15 }); grain(0.08); } },
  duo_red: { label: "デュオトーン・赤×黒", photo() { grade({ duo: [[0.06, 0.03, 0.04], [0.92, 0.18, 0.16]], contrast: 1.2 }); grain(0.1); } },
  duo_green: { label: "デュオトーン・深緑×生成り", photo() { grade({ duo: [[0.05, 0.16, 0.14], [0.95, 0.92, 0.82]], contrast: 1.1 }); grain(0.1); } },
  night: { label: "夜にする", photo() { grade({ sat: 0.7, contrast: 1.2, bright: 0.55, mul: [0.75, 0.88, 1.15] }); vignette(0.8, "0,5,20"); grain(0.12); } },
};

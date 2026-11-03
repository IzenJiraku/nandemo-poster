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
      as("cast", () => names.forEach((n, i) => text(n, M + colW * (i + 0.5), 110, { weight: 700, size: 40, color: colorOf(S.body.color), spacing: 0.1, maxW: colW - 16, family: S.body.family,
        stroke: S.body.stroke || 0, strokeColor: S.body.strokeColor, shadow: shadowOf(S.body.shadow) })));
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

  polaroid: {
    label: "ポラロイド",
    draw(c) {
      const snap = snapshot();
      ctx.fillStyle = S.paper; ctx.fillRect(0, 0, W, H);
      const cw = 900, ch = 1040, cx = W / 2, cy = 700;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.035);
      ctx.shadowColor = "rgba(0,0,0,.28)"; ctx.shadowBlur = 40; ctx.shadowOffsetY = 18;
      ctx.fillStyle = "#fbfaf6"; ctx.fillRect(-cw / 2, -ch / 2, cw, ch);
      ctx.shadowColor = "transparent";
      drawSnapInto(snap, -cw / 2 + 40, -ch / 2 + 40, cw - 80, cw - 80);
      as("tagline", () => text(c.tagline, -cw / 2 + 60, ch / 2 - 55, { weight: 600, size: 38, family: "'Klee One'", color: "#2c2a27", align: "left", maxW: cw - 120 }));
      ctx.restore();
      drawTitle(c, W / 2, 1400, { size: 110, onPaper: true });
      drawSub(c, W / 2, 1460, { size: 28, onPaper: true });
      drawCast(c, W / 2, 1560, { size: 30, onPaper: true });
      drawCredits(c, W / 2, 1600, { size: 17, onPaper: true });
      drawDate(c, W / 2, 1715, { size: 40, onPaper: true });
    },
  },
  triptych: {
    label: "三枚つづき",
    draw(c) {
      const snap = snapshot();
      ctx.fillStyle = S.paper; ctx.fillRect(0, 0, W, H);
      const y0 = 200, y1 = 1230, x0 = 60, x1 = W - 60, gap = 18, pw = (x1 - x0 - gap * 2) / 3;
      for (let i = 0; i < 3; i++) {
        const px = x0 + i * (pw + gap);
        ctx.save(); ctx.beginPath(); ctx.rect(px, y0, pw, y1 - y0); ctx.clip();
        drawSnapInto(snap, x0, y0, x1 - x0, y1 - y0);
        ctx.restore();
      }
      drawTagline(c, W / 2, 125, { size: 32, onPaper: true });
      drawTitle(c, W / 2, 1400, { size: 120, onPaper: true });
      drawSub(c, W / 2, 1462, { size: 30, onPaper: true });
      drawCast(c, W / 2, 1565, { size: 30, onPaper: true });
      drawCredits(c, W / 2, 1605, { size: 17, onPaper: true });
      drawDate(c, W / 2, 1715, { size: 40, onPaper: true });
    },
  },
  circle: {
    label: "丸窓",
    draw(c) {
      const snap = snapshot();
      ctx.fillStyle = S.paper; ctx.fillRect(0, 0, W, H);
      const cx = W / 2, cy = 720, r = 450;
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();
      drawSnapInto(snap, cx - r, cy - r, r * 2, r * 2); ctx.restore();
      ctx.strokeStyle = S.accent; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx, cy, r + 22, 0, Math.PI * 2); ctx.stroke();
      drawTagline(c, W / 2, 140, { size: 32, onPaper: true });
      drawTitle(c, W / 2, 1360, { size: 116, onPaper: true });
      drawSub(c, W / 2, 1422, { size: 30, onPaper: true });
      drawCast(c, W / 2, 1540, { size: 30, onPaper: true });
      drawCredits(c, W / 2, 1580, { size: 17, onPaper: true });
      drawDate(c, W / 2, 1700, { size: 40, onPaper: true });
    },
  },
  outline: {
    label: "白抜きの巨大文字",
    draw(c) {
      scrimTop(0.2, 0.5); scrimBottom(0.62);
      const lines = splitTitle(c.title);
      const t = S.title;
      const saved = S;
      S = { ...S, title: { ...t, deco: "outline", scale: 1, rotate: 0, color: t.color === "#111" ? "#fff" : t.color } };
      let y = 120;
      for (const line of lines) {
        const s = fit(line, t.weight, 380, t.family, W - 60, 0);
        y += s * 0.92;
        drawTitle({ ...c, title: line }, W / 2, y, { size: s, maxW: W - 60 });
      }
      S = saved;
      autoInk(H * 0.7, H * 0.8); drawTagline(c, W / 2, H * 0.74, { size: 34 }); AUTO_DARK = false;
      drawTitle(c, W / 2, H * 0.82, { size: 84 });
      drawSub(c, W / 2, H * 0.82 + 50, { size: 26 });
      drawCast(c, W / 2, H * 0.89, { size: 30 });
      drawCredits(c, W / 2, H * 0.92, { size: 17 });
      drawDate(c, W / 2, H * 0.965, { size: 38 });
    },
  },
  sideband: {
    label: "左の帯に縦書き",
    draw(c) {
      const bw = 250;
      ctx.fillStyle = S.paper; ctx.fillRect(0, 0, bw, H);
      ctx.fillStyle = S.accent; ctx.fillRect(bw, 0, 8, H);
      scrimBottom(0.74, 0.85);
      drawVTitle(c, bw / 2, 90, { size: 150, maxH: H * 0.72, onPaper: true });
      const s = S.sub;
      ctx.save(); ctx.translate(bw - 34, H - 60); ctx.rotate(-Math.PI / 2);
      as("en", () => text(c.en, 0, 0, { weight: s.weight, size: 22, family: s.family, spacing: 0.2, align: "left", maxW: H * 0.5, color: S.ink }));
      ctx.restore();
      const cx = bw + (W - bw) / 2, mw = W - bw - 80;
      autoInk(60, 170, bw, W); drawTagline(c, cx, 120, { size: 34, maxW: mw }); AUTO_DARK = false;
      drawCast(c, cx, H * 0.88, { size: 30, maxW: mw });
      drawCredits(c, cx, H * 0.915, { size: 16, maxW: mw });
      drawDate(c, cx, H * 0.96, { size: 40 });
    },
  },
  ticket: {
    label: "チケット",
    draw(c) {
      const y0 = H * 0.66;
      scrimTop(0.14, 0.55);
      autoInk(60, 160); drawTagline(c, W / 2, 110, { size: 34 }); AUTO_DARK = false;
      extras(c, W / 2, 400, W * 0.8);
      // 半券
      const tx = 50, tw = W - 100, ty = y0 - 30, th = H - ty - 50;
      const stub = tx + tw * 0.72;
      ctx.save();
      // 切り込み（半円）の部分だけ塗らないようにクリップする
      ctx.beginPath(); ctx.rect(0, 0, W, H);
      for (const yy of [ty, ty + th]) { ctx.moveTo(stub + 26, yy); ctx.arc(stub, yy, 26, 0, Math.PI * 2); }
      ctx.clip("evenodd");
      ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
      ctx.fillStyle = S.paper;
      ctx.beginPath(); ctx.roundRect(tx, ty, tw, th, 18); ctx.fill();
      ctx.restore();
      // 切り取り線
      ctx.save(); ctx.strokeStyle = S.ink; ctx.globalAlpha = 0.5; ctx.setLineDash([10, 10]); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(stub, ty + 40); ctx.lineTo(stub, ty + th - 40); ctx.stroke(); ctx.restore();
      const lx = tx + 50, lw = stub - tx - 90;
      text("ADMIT ONE", lx, ty + 70, { weight: 700, size: 22, color: S.ink, align: "left", spacing: 0.4, maxW: lw });
      drawTitle(c, lx, ty + 200, { size: 100, align: "left", maxW: lw, onPaper: true });
      drawSub(c, lx, ty + 250, { size: 24, align: "left", onPaper: true, maxW: lw });
      drawCast(c, lx, ty + 330, { size: 26, align: "left", onPaper: true, maxW: lw });
      drawCredits(c, lx, ty + 365, { size: 14, align: "left", onPaper: true, maxW: lw });
      drawDate(c, lx, ty + th - 50, { size: 32, align: "left", onPaper: true });
      const sx = stub + (tx + tw - stub) / 2;
      text("SEAT", sx, ty + 110, { weight: 700, size: 20, color: S.ink, spacing: 0.4 });
      text(`${"ABCDEFGHJK"[(c.title.length * 7) % 10]}-${(c.title.length * 13) % 30 + 1}`, sx, ty + 190, { weight: 900, size: 64, color: S.ink, family: "'Noto Sans JP'" });
      text(`No. ${String((c.title.length * 977) % 10000).padStart(4, "0")}`, sx, ty + th - 60, { weight: 500, size: 22, color: S.ink, spacing: 0.1 });
    },
  },
  filmstrip: {
    label: "フィルム",
    draw(c) {
      const snap = snapshot();
      ctx.fillStyle = "#0b0a09"; ctx.fillRect(0, 0, W, H);
      const fx = 150, fw = W - 300, fy = 150, fh = H * 0.62;
      drawSnapInto(snap, fx, fy, fw, fh);
      ctx.fillStyle = "#f1ede6";
      for (const sx of [55, W - 95]) for (let y = 40; y < H - 40; y += 70) { ctx.beginPath(); ctx.roundRect(sx, y, 40, 44, 6); ctx.fill(); }
      ctx.save(); ctx.fillStyle = "#e88a2a"; setFont(700, 20, "'Noto Sans JP'");
      ctx.translate(132, H * 0.5); ctx.rotate(-Math.PI / 2); ctx.fillText("NANDEMO 400  ▸ 12A", 0, 0); ctx.restore();
      ctx.save(); ctx.fillStyle = "#e88a2a"; setFont(700, 20, "'Noto Sans JP'");
      ctx.translate(W - 120, H * 0.3); ctx.rotate(Math.PI / 2); ctx.fillText("▸ 13  NANDEMO SAFETY FILM", 0, 0); ctx.restore();
      const saved = S; S = { ...S, autoInk: false };
      drawTagline(c, W / 2, 105, { size: 30, maxW: fw });
      drawTitle(c, W / 2, fy + fh + 150, { size: 110, maxW: fw });
      drawSub(c, W / 2, fy + fh + 210, { size: 28, maxW: fw });
      drawCast(c, W / 2, fy + fh + 300, { size: 30, maxW: fw });
      drawCredits(c, W / 2, fy + fh + 340, { size: 16, maxW: fw });
      drawDate(c, W / 2, H - 70, { size: 40 });
      S = saved;
    },
  },
  swiss: {
    label: "スイス・グリッド",
    draw(c) {
      const snap = snapshot();
      const top = H * 0.42;
      ctx.fillStyle = S.paper; ctx.fillRect(0, 0, W, top);
      drawSnapInto(snap, 0, top, W, H - top);
      ctx.fillStyle = S.ink;
      [130, top - 150].forEach((y) => ctx.fillRect(M, y, W - M * 2, 2));
      ctx.fillRect(W / 2, top - 150, 2, 150);
      as("date", () => text(c.date, M, 100, { weight: 700, size: 24, align: "left", color: S.ink, maxW: W * 0.5 }));
      as("en", () => text(c.en, W - M, 100, { weight: 500, size: 20, align: "right", color: S.ink, spacing: 0.15, maxW: W * 0.4 }));
      drawTitle(c, M, 300, { size: 150, align: "left", maxW: W - M * 2, onPaper: true });
      drawTagline(c, M, 380, { size: 30, align: "left", maxW: W - M * 2, onPaper: true });
      if (c.cast) as("cast", () => {
        text("CAST", M, top - 105, { weight: 700, size: 16, align: "left", color: S.ink, spacing: 0.3 });
        castList(c).slice(0, 4).forEach((n, i) => text(n, M + (i % 2) * 260, top - 62 + Math.floor(i / 2) * 36, { weight: 500, size: 24, align: "left", color: S.ink, maxW: 250 }));
      });
      as("credits", () => {
        text("DIRECTED BY", W / 2 + 30, top - 105, { weight: 700, size: 16, align: "left", color: S.ink, spacing: 0.3 });
        text(c.director, W / 2 + 30, top - 62, { weight: 500, size: 24, align: "left", color: S.ink });
        text("なんでもポスター製作委員会", W / 2 + 30, top - 26, { weight: 400, size: 16, align: "left", color: S.ink });
      });
    },
  },
  billing: {
    label: "映画祭マーク＋クレジット",
    draw(c) {
      scrimTop(0.26, 0.75); scrimBottom(0.55, 0.95);
      autoInk(120, 330);
      const col = AUTO_DARK ? "#24272a" : "#ffffff";
      festivalLaurels(c, W / 2, 210, col, 3, 0.9);
      AUTO_DARK = false;
      drawTagline(c, W / 2, H * 0.66, { size: 34 });
      drawTitle(c, W / 2, H * 0.745, { size: 130 });
      drawSub(c, W / 2, H * 0.745 + 62, { size: 30 });
      billingBlock(c, W / 2, H * 0.855, W * 0.8, { color: S.body.dim || "#ddd", lines: 3, size: 26 });
      drawDate(c, W / 2, H * 0.96, { size: 40 });
    },
  },
  quote: {
    label: "絶賛の声が主役",
    draw(c) {
      scrimTop(0.42, 0.85); scrimBottom(0.7, 0.9);
      const rv = (c.reviews || [])[0];
      if (rv) as("extras", () => {
        const [q, src] = rv;
        autoInk(60, 520);
        const lines = splitPhrases(q, 9);
        const fam = "'Noto Serif JP'";
        let y = 120;
        text("“", M - 6, y + 70, { weight: 900, size: 160, family: fam, color: colorOf(S.title.color), align: "left" });
        lines.forEach((l) => { y += 118; text(l, M, y, { weight: 900, size: 104, family: fam, color: colorOf("#ffffff"), align: "left", maxW: W - M * 2, shadow: shadowOf(SH(0.4, 14)) }); });
        text(`― ${src}`, M, y + 70, { weight: 500, size: 28, color: colorOf("#ffffff"), align: "left", shadow: shadowOf(SH(0.4, 10)) });
        AUTO_DARK = false;
      });
      drawTitle(c, M, H * 0.86, { size: 90, align: "left", maxW: W * 0.62 });
      drawSub(c, M, H * 0.86 + 50, { size: 24, align: "left", maxW: W * 0.6 });
      drawCredits(c, M, H * 0.955, { size: 15, align: "left", maxW: W * 0.58 });
      drawDate(c, W - M, H * 0.955, { size: 34, align: "right" });
    },
  },
  vcenter: {
    label: "中央に縦書き",
    draw(c) {
      scrimBand(H * 0.4, H * 0.42, 0.45); scrimBottom(0.78);
      autoInk(100, H * 0.75, W * 0.4, W * 0.6);
      const n = [...c.title].length;
      ctx.fillStyle = colorOf(S.title.color); ctx.globalAlpha = n ? 0.8 : 0;
      ctx.fillRect(W / 2 - 50, 90, 100, 2);
      ctx.globalAlpha = 1;
      const s = drawVTitle(c, W / 2, 120, { size: 170, maxH: H * 0.64 });
      ctx.fillStyle = colorOf(S.title.color); ctx.globalAlpha = n ? 0.8 : 0;
      ctx.fillRect(W / 2 - 50, 120 + n * s * 1.05 + 20, 100, 2); ctx.globalAlpha = 1;
      AUTO_DARK = false;
      drawSub(c, W / 2, H * 0.835, { size: 28 });
      drawCast(c, W / 2, H * 0.885, { size: 32 });
      drawCredits(c, W / 2, H * 0.915, { size: 17 });
      drawDate(c, W / 2, H * 0.962, { size: 40 });
    },
  },
};

// =====================================================================
// 構図ごとの「なぜこの配置か」。ガイド表示で見せる短い解説
//   [考え方の名前, 説明]
// =====================================================================
const LESSONS = {
  bottom: ["視線は上から下へ", "まず写真で目を止め、下の文字で着地させる王道の流れ。上半分を空けるほど、写真が主役になります。"],
  top: ["名前を先に読ませる", "タイトルが先に来ると、写真はその「答え」として後から効いてきます。下の余白は、写真が呼吸する場所。"],
  center: ["中央はいちばん強い", "真ん中に置いた文字は迷わず目に入ります。そのぶん周りを空けないと、窮屈で安っぽく見えます。"],
  vright: ["縦組みは右から始まる", "日本語の縦書きは右上が読み始め。右に文字、左に余白を残すと、視線が自然に左へ流れていきます。"],
  vleft: ["流れに逆らう緊張", "縦書きを左に置くと、読み始めの位置からずれて小さな違和感が生まれます。それが緊張感になります。"],
  corner: ["小さく置くほど、大きく見える", "文字を隅に小さく寄せると、空いた面そのものが主役になります。余白は「何もない」ではなく「見せる場所」。"],
  frame: ["額縁の余白", "写真のまわりに紙の余白をつくると、写真が「作品」として切り取られます。余白は、見る人との距離です。"],
  split: ["面で分ける", "写真と色の面をはっきり分けると、情報の置き場所が一目でわかります。境目の細い線が全体を引き締めます。"],
  stack: ["文字を絵として使う", "タイトルを幅いっぱいに組むと、読む前に「形」として目に入ります。写真は文字の背景に退きます。"],
  arch: ["形で切り取る", "アーチや窓の形は、それだけで物語の気配をつくります。四角より柔らかく、視線を内側へ導きます。"],
  diagonal: ["斜めは動き", "水平と垂直でできた画面に斜めが一本入るだけで、勢いとにぎやかさが生まれます。"],
  casttop: ["順番は、売りたいものの順番", "名前が一番上にあるのは、出演者が看板だから。情報の並び順は、何をいちばん伝えたいかの表明です。"],
  letterbox: ["黒い帯で映画になる", "上下を黒で切ると、横長のスクリーンに見えます。写真の面積を減らして、かえって映画らしさが増えます。"],
  band: ["帯は看板", "色の帯にタイトルを載せると、どんな写真の上でも負けない強い看板になります。昭和の邦画の定番。"],
  polaroid: ["写真を「物」にする", "白いフチと影をつけるだけで、画面の中に手に取れる物が生まれます。少し傾けるのが親しみの鍵。"],
  triptych: ["くり返しとリズム", "一枚を三つに割ると、時間の流れや視点の切り替えを感じさせます。すき間の幅がリズムを決めます。"],
  circle: ["円は視線を集める", "丸い窓は中心に目を吸い寄せます。まわりの余白が広いほど、静かで上品な印象になります。"],
  outline: ["図と地をゆらす", "巨大な白抜き文字は、写真にも文字にも見えます。存在感は大きいのに、画面は重くなりません。"],
  sideband: ["一本の軸", "左の帯に縦書きをまとめると、画面に背骨ができます。残りの写真は、そのぶん大胆に広く使えます。"],
  ticket: ["形の意味を借りる", "チケットの形を借りると、ポスターそのものが「観に行く体験」を語り始めます。"],
  filmstrip: ["フレームの中のフレーム", "フィルムの穴と小さな文字が、写真に「映画の一コマ」という文脈を足します。"],
  swiss: ["見えない格子", "目に見えないグリッドに沿って文字をそろえると、情報が多くても整って見えます。罫線は整理の道具。"],
  billing: ["評価のサイン", "月桂樹のマークは「認められた作品」という合図。下の細長いクレジットは、あえて読ませない質感です。"],
  quote: ["他人の声で語る", "誰かの絶賛を大きく置くと、タイトルより先に「期待」が届きます。"],
  vcenter: ["静けさの軸", "中央の縦書きは左右対称を保ちつつ、横書きより静かで凛とした印象をつくります。"],
};

/* 《太陽船之書》卡牌繪圖核心
 * 產生每張卡的 SVG（外框＋插圖，不含文字；文字由 HTML 疊在上面，才能用網頁字型）。
 * 卡片座標：500 × 700。
 * 兩種畫風：
 *   papyrus：紙草壁畫風（土黃底、黑色描線、平塗礦物色）——一般卡
 *   gold   ：黑底燙金線稿（金線、松石綠與玫瑰銅點綴）——神話卡、三神、卡背
 */
(function () {
  'use strict';
  const GL = window.GLYPHS;
  let UID = 0;

  // ───────── 色票 ─────────
  const C = {
    ink: '#15100d', ink2: '#1e1612', ink3: '#2a201a',
    gold: '#d9b467', goldHi: '#f6e3a6', goldLo: '#8f6a2e',
    turq: '#5fbcaa', turqLo: '#2e7c70', lapis: '#2b4f93', carn: '#c4673f', rose: '#c98a6a',
    pap: '#e8d3a0', pap2: '#dcc28a', papDk: '#b89458',
    line: '#2a1a10',
  };
  const MODE = {
    papyrus: {
      line: C.line, sw: 1.7,
      skin: '#b3552f', skinF: '#dfa25c', skinDk: '#8d3f20',
      wig: '#1d1b28', wigLine: '#4a5d8c',
      linen: '#f4ecd4', linenLine: '#b9a67c',
      gold: '#e2b54c', goldLine: '#8a5a1c',
      blue: '#2c5d9c', green: '#3b7d58', red: '#b6402a', turq: '#4aa597', white: '#f7f0dc',
      black: '#1b1714', jackal: '#1a1716', ibis: '#253239', staff: '#5e3f22', sun: '#c8432a',
      dress: '#b6402a',
    },
    gold: {
      line: 'url(#G)', sw: 1.45,
      skin: '#1a120e', skinF: '#1a120e', skinDk: '#1a120e',
      wig: '#120d0a', wigLine: C.turq,
      linen: '#1a120e', linenLine: C.goldLo,
      gold: '#1a120e', goldLine: C.gold,
      blue: '#173f45', green: '#173f45', red: '#5a2a1c', turq: C.turq, white: '#1a120e',
      black: '#0f0b09', jackal: '#100c0a', ibis: '#100c0a', staff: '#1a120e', sun: C.rose,
      dress: '#1a120e',
    },
  };

  // ───────── 小工具 ─────────
  const f = (n) => (Math.round(n * 100) / 100);
  function rng(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const attr = (o) => Object.entries(o).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => `${k}="${v}"`).join(' ');

  // 象形文字：x,y 為字框左上角，size 為字框大小（1 em）
  const GSW = 22; // 象形文字加粗（字型單位）
  const gf = (fill) => fill === 'url(#G)' ? 'url(#GF)' : fill;
  const gst = (fill, k) => `fill="${gf(fill)}" stroke="${gf(fill)}" stroke-width="${f(GSW * (k || 1))}" stroke-linejoin="round"`;
  function glyph(code, x, y, size, fill, extra) {
    const g = GL.g[code]; if (!g) return '';
    const s = size / GL.upm;
    // 字型 y 軸朝上，基線在 0；字框高 1em，下緣約在 -120
    return `<path d="${g.d}" transform="translate(${f(x)},${f(y + size * 0.88)}) scale(${f(s * 1000) / 1000},${-f(s * 1000) / 1000})" ${gst(fill)} ${extra || ''}/>`;
  }
  function glyphH(code) { const g = GL.g[code]; return g ? (g.b[3] - g.b[1]) / GL.upm : 1; }
  function glyphW(code) { const g = GL.g[code]; return g ? (g.b[2] - g.b[0]) / GL.upm : 1; }
  // 直行：每個字依實際高度往下排，扁的字（水、麵包）會自然變矮
  function glyphColumn(codes, cx, top, size, fill, gap) {
    let y = top, out = '';
    gap = gap == null ? size * 0.12 : gap;
    for (const c of codes) {
      const g = GL.g[c]; if (!g) continue;
      const s = size / GL.upm;
      const w = (g.b[2] - g.b[0]) * s, h = (g.b[3] - g.b[1]) * s;
      const x = cx - w / 2 - g.b[0] * s;
      out += `<path d="${g.d}" transform="translate(${f(x)},${f(y + g.b[3] * s)}) scale(${f(s * 1000) / 1000},${-f(s * 1000) / 1000})" ${gst(fill)}/>`;
      y += h + gap;
    }
    return { svg: out, bottom: y };
  }
  function glyphRow(codes, left, baseline, size, fill, gap) {
    let x = left, out = '';
    gap = gap == null ? size * 0.1 : gap;
    for (const c of codes) {
      const g = GL.g[c]; if (!g) continue;
      const s = size / GL.upm;
      const w = (g.b[2] - g.b[0]) * s;
      out += `<path d="${g.d}" transform="translate(${f(x - g.b[0] * s)},${f(baseline + g.b[1] * s)}) scale(${f(s * 1000) / 1000},${-f(s * 1000) / 1000})" ${gst(fill)}/>`;
      x += w + gap;
    }
    return { svg: out, right: x };
  }
  function rowWidth(codes, size, gap) {
    gap = gap == null ? size * 0.1 : gap;
    return codes.reduce((a, c) => a + glyphW(c) * size + gap, -gap);
  }

  // ───────── 共用 defs ─────────
  function defs(id, mode) {
    return `<defs>
      <linearGradient id="G" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="500" y2="700">
        <stop offset="0" stop-color="#9a7434"/><stop offset=".18" stop-color="#e9cc85"/>
        <stop offset=".3" stop-color="#fff0c2"/><stop offset=".42" stop-color="#d2a95a"/>
        <stop offset=".62" stop-color="#a47c3a"/><stop offset=".78" stop-color="#ecd28f"/>
        <stop offset="1" stop-color="#9c7637"/></linearGradient>
      <linearGradient id="GF" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f6e2a2"/><stop offset=".5" stop-color="#cfa456"/><stop offset="1" stop-color="#8d672b"/></linearGradient>
      <radialGradient id="INK" cx=".5" cy=".42" r=".75">
        <stop offset="0" stop-color="#261c17"/><stop offset=".65" stop-color="#17110e"/><stop offset="1" stop-color="#0d0907"/></radialGradient>
      <radialGradient id="VIG" cx=".5" cy=".48" r=".72">
        <stop offset=".55" stop-color="#7a4a1c" stop-opacity="0"/><stop offset="1" stop-color="#5a3010" stop-opacity=".42"/></radialGradient>
      <radialGradient id="SUN" cx=".38" cy=".35" r=".7">
        <stop offset="0" stop-color="#ef7a52"/><stop offset=".7" stop-color="#c8432a"/><stop offset="1" stop-color="#9c2f1c"/></radialGradient>
      <radialGradient id="FAI" cx=".38" cy=".32" r=".75">
        <stop offset="0" stop-color="#a6e4d6"/><stop offset=".45" stop-color="#4fb3a2"/><stop offset="1" stop-color="#1f6b62"/></radialGradient>
      <filter id="GRAIN" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="${id % 97}" result="n"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 .35  0 0 0 0 .22  0 0 0 0 .08  0 0 0 .55 -.18"/>
        <feComposite operator="in" in2="SourceGraphic"/></filter>
      <filter id="INKGRAIN" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="7" result="n"/>
        <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 .9  0 0 0 0 .7  0 0 0 .07 0"/>
        <feComposite operator="in" in2="SourceGraphic"/></filter>
      <filter id="GLOW" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
    </defs>`;
  }

  // ───────── 裝飾零件 ─────────
  function sparkle(x, y, r, fill) {
    const a = r * 0.18;
    return `<path d="M${f(x)},${f(y - r)} L${f(x + a)},${f(y - a)} L${f(x + r)},${f(y)} L${f(x + a)},${f(y + a)} L${f(x)},${f(y + r)} L${f(x - a)},${f(y + a)} L${f(x - r)},${f(y)} L${f(x - a)},${f(y - a)} Z" fill="${fill}"/>`;
  }
  function crescent(x, y, r, fill) {
    return `<path d="M${f(x - r)},${f(y)} A${r},${r} 0 1 0 ${f(x + r)},${f(y)} A${f(r * 1.05)},${f(r * 0.72)} 0 1 1 ${f(x - r)},${f(y)} Z" fill="${fill}" transform="rotate(-30 ${x} ${y})"/>`;
  }
  function diamond(x, y, w, h, fill, stroke, sw) {
    return `<path d="M${x},${y - h} L${x + w},${y} L${x},${y + h} L${x - w},${y} Z" fill="${fill}" stroke="${stroke || 'url(#G)'}" stroke-width="${sw || 1.4}"/>`;
  }
  // 角落的扇形日芒（明信片角落的裝飾）
  function cornerFan(x, y, r, rot, stroke) {
    let s = `<g transform="translate(${x},${y}) rotate(${rot})" fill="none" stroke="${stroke}" stroke-width="1.1">`;
    s += `<path d="M0,${-r} A${r},${r} 0 0 1 ${r},0"/><path d="M0,${-r * 0.78} A${r * 0.78},${r * 0.78} 0 0 1 ${r * 0.78},0"/>`;
    for (let i = 1; i < 9; i++) {
      const a = (i / 9) * Math.PI / 2;
      s += `<path d="M${f(Math.sin(a) * r * 0.2)},${f(-Math.cos(a) * r * 0.2)} L${f(Math.sin(a) * r * 0.74)},${f(-Math.cos(a) * r * 0.74)}"/>`;
    }
    s += `<path d="M0,${-r * 0.2} A${r * 0.2},${r * 0.2} 0 0 1 ${r * 0.2},0"/></g>`;
    return s;
  }
  // 紙莎草柱（柱身＋傘形柱頭），金線
  function papyrusColumn(x, top, bottom, w, stroke, fillAccent) {
    const cx = x, cap = w * 2.6;
    let s = `<g fill="none" stroke="${stroke}" stroke-width="1.2" stroke-linejoin="round">`;
    // 柱頭（倒鐘形）
    const ct = top, cb = top + cap;
    s += `<path d="M${cx - w * 0.55},${cb} Q${cx - w * 1.5},${ct + cap * 0.35} ${cx - w * 1.35},${ct} L${cx + w * 1.35},${ct} Q${cx + w * 1.5},${ct + cap * 0.35} ${cx + w * 0.55},${cb} Z" fill="#15100d"/>`;
    for (let i = -3; i <= 3; i++) {
      s += `<path d="M${f(cx + i * w * 0.12)},${cb} Q${f(cx + i * w * 0.32)},${f(ct + cap * 0.45)} ${f(cx + i * w * 0.4)},${ct + 1}"/>`;
    }
    // 柱頭頂端的花序
    for (let i = -6; i <= 6; i++) {
      const px = cx + i * w * 0.21;
      s += `<path d="M${f(px)},${ct} L${f(px + i * 0.5)},${f(ct - w * 0.42 - (6 - Math.abs(i)) * w * 0.03)}"/>`;
      s += `<circle cx="${f(px + i * 0.5)}" cy="${f(ct - w * 0.47 - (6 - Math.abs(i)) * w * 0.03)}" r="${f(w * 0.07)}" fill="${stroke}" stroke="none"/>`;
    }
    // 綁帶
    for (let k = 0; k < 4; k++) s += `<path d="M${cx - w * 0.6},${f(cb + 3 + k * 4)} L${cx + w * 0.6},${f(cb + 3 + k * 4)}"/>`;
    if (fillAccent) s += `<rect x="${cx - w * 0.6}" y="${cb + 5}" width="${w * 1.2}" height="3" fill="${fillAccent}" stroke="none"/>`;
    // 柱身
    s += `<path d="M${cx - w * 0.5},${cb + 15} L${cx - w * 0.5},${bottom} M${cx + w * 0.5},${cb + 15} L${cx + w * 0.5},${bottom}"/>`;
    s += `<path d="M${cx - w * 0.17},${cb + 15} L${cx - w * 0.17},${bottom} M${cx + w * 0.17},${cb + 15} L${cx + w * 0.17},${bottom}" stroke-width=".7"/>`;
    s += `<path d="M${cx - w * 0.7},${bottom} L${cx + w * 0.7},${bottom}"/>`;
    s += `</g>`;
    return s;
  }
  // 色塊飾帶（墓室壁畫上緣的彩色長條）
  function blockBand(x, y, w, h, colors) {
    let s = '', n = Math.round(w / (h * 1.6)), bw = w / n;
    for (let i = 0; i < n; i++) {
      s += `<rect x="${f(x + i * bw)}" y="${y}" width="${f(bw)}" height="${h}" fill="${colors[i % colors.length]}"/>`;
      s += `<path d="M${f(x + i * bw)},${y} V${y + h}" stroke="#1b1410" stroke-width="1.2"/>`;
    }
    s += `<path d="M${x},${y} H${x + w} M${x},${y + h} H${x + w}" stroke="#1b1410" stroke-width="1.4"/>`;
    return s;
  }
  // 蓮花垂飾帶
  function lotusFrieze(x, y, w, h) {
    let s = '', n = Math.round(w / (h * 1.15)), bw = w / n;
    for (let i = 0; i < n; i++) {
      const cx = x + bw * (i + 0.5);
      const col = i % 2 ? '#3b7d58' : '#2c5d9c';
      s += `<path d="M${f(cx - bw * 0.42)},${y} Q${f(cx - bw * 0.45)},${f(y + h * 0.75)} ${f(cx)},${f(y + h)} Q${f(cx + bw * 0.45)},${f(y + h * 0.75)} ${f(cx + bw * 0.42)},${y} Z" fill="${col}" stroke="#1b1410" stroke-width="1"/>`;
      s += `<path d="M${f(cx - bw * 0.22)},${y} Q${f(cx - bw * 0.2)},${f(y + h * 0.5)} ${f(cx)},${f(y + h * 0.7)} Q${f(cx + bw * 0.2)},${f(y + h * 0.5)} ${f(cx + bw * 0.22)},${y} Z" fill="#c44b2e" stroke="#1b1410" stroke-width=".8"/>`;
    }
    return s;
  }
  // 紙草底（底色＋纖維＋顆粒＋邊緣焦色）
  function papyrusGround(x, y, w, h, seed) {
    const r = rng(seed);
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.pap}"/>`;
    // 橫向寬纖維條（紙莎草是由橫豎兩層壓成）
    for (let i = 0; i < 9; i++) {
      const yy = y + r() * h, hh = 6 + r() * 16;
      s += `<rect x="${x}" y="${f(yy)}" width="${w}" height="${f(hh)}" fill="${r() > 0.5 ? '#d9bf86' : '#efdcaf'}" opacity="${f(0.25 + r() * 0.3)}"/>`;
    }
    for (let i = 0; i < 70; i++) {
      const yy = y + r() * h;
      s += `<path d="M${x},${f(yy)} H${x + w}" stroke="${r() > 0.5 ? '#b99556' : '#f4e6c2'}" stroke-width="${f(0.4 + r() * 0.7)}" opacity="${f(0.18 + r() * 0.3)}"/>`;
    }
    for (let i = 0; i < 46; i++) {
      const xx = x + r() * w;
      s += `<path d="M${f(xx)},${y} V${y + h}" stroke="#a9874c" stroke-width="${f(0.3 + r() * 0.5)}" opacity="${f(0.08 + r() * 0.14)}"/>`;
    }
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" filter="url(#GRAIN)"/>`;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#VIG)"/>`;
    return s;
  }
  // 黑底燙金場景底（星空、新月、拱門）
  function goldGround(x, y, w, h, seed) {
    const r = rng(seed);
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#INK)"/>`;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" filter="url(#INKGRAIN)"/>`;
    for (let i = 0; i < 26; i++) {
      const sx = x + 18 + r() * (w - 36), sy = y + 14 + r() * h * 0.55;
      if (r() > 0.55) s += sparkle(sx, sy, 3 + r() * 6, 'url(#G)');
      else s += `<circle cx="${f(sx)}" cy="${f(sy)}" r="${f(0.7 + r() * 1.1)}" fill="${C.gold}" opacity=".8"/>`;
    }
    return s;
  }

  // ───────── 人物零件（單位：方格 g；面向右；腳底 y=0，往上為負） ─────────
  // 古埃及人像用 18 格比例：腳底到髮際 18 格、膝 6 格、肩 16 格。
  const PART = {
    torso: 'M-0.6,-16.2 Q-2.05,-16.3 -2.95,-15.85 Q-3.25,-15.2 -2.3,-14.1 Q-1.75,-12.6 -1.72,-11.0 L1.5,-11.0 Q1.62,-12.25 2.42,-13.3 Q2.55,-13.85 2.22,-14.2 Q3.25,-15.2 2.95,-15.85 Q2.05,-16.3 0.6,-16.2 Z',
    chestLine: 'M2.05,-13.55 Q2.25,-13.35 2.38,-13.42',
    backArm: 'M-2.95,-15.9 Q-3.48,-15.35 -3.38,-14.0 L-3.22,-12.3 Q-3.08,-10.8 -2.98,-9.75 L-2.18,-9.75 Q-2.3,-10.8 -2.45,-12.2 Q-2.44,-13.4 -2.3,-14.1 Z',
    backLeg: 'M-2.55,-7.7 L-1.05,-7.7 Q-1.1,-6.6 -1.2,-6.0 Q-1.32,-3.2 -1.45,-0.95 Q-0.35,-0.6 0.55,-0.22 Q0.72,-0.02 0.45,0 L-2.72,0 Q-2.92,-0.42 -2.32,-0.95 Q-2.72,-3.1 -2.66,-4.4 Q-2.62,-5.7 -2.5,-6.4 Z',
    frontLeg: 'M-0.55,-7.7 L1.05,-7.7 Q1.38,-6.7 1.52,-6.0 Q2.25,-3.2 3.08,-0.95 Q4.22,-0.58 5.15,-0.22 Q5.36,-0.02 5.08,0 L2.0,0 Q1.72,-0.46 2.18,-0.98 Q1.72,-2.5 1.12,-4.3 Q0.62,-5.25 0.12,-6.25 Z',
    kneeB: 'M-1.95,-6.15 Q-1.7,-5.9 -1.45,-6.1',
    kneeF: 'M0.75,-5.9 Q1.05,-5.7 1.3,-5.95',
    kilt: 'M-1.85,-10.75 L1.58,-10.75 Q2.05,-9.15 3.0,-7.62 L-2.8,-7.48 Q-2.25,-9.2 -1.85,-10.75 Z',
    kiltApron: 'M1.15,-10.4 Q1.6,-9.0 3.0,-7.62 L1.7,-7.58 Q1.15,-8.9 0.95,-10.35 Z',
    belt: 'M-1.88,-11.15 L1.6,-11.15 L1.62,-10.62 L-1.9,-10.62 Z',
    frontArmFwd: 'M2.9,-15.95 Q3.52,-15.6 3.62,-14.55 Q3.86,-13.4 4.02,-12.78 Q4.72,-12.5 5.55,-12.4 L5.55,-11.55 Q4.42,-11.58 3.52,-11.84 Q3.08,-12.1 2.95,-12.9 Q2.62,-13.6 2.25,-14.2 Z',
    frontArmUp: 'M2.9,-15.95 Q3.55,-15.55 3.7,-14.4 Q3.86,-13.55 3.95,-13.15 Q4.35,-13.75 4.62,-15.25 L5.25,-15.15 Q5.0,-13.4 4.35,-12.25 Q3.8,-11.9 3.25,-12.55 Q2.85,-13.4 2.25,-14.2 Z',
    neck: 'M-0.55,-17.0 L0.68,-17.0 L0.72,-15.95 L-0.6,-15.95 Z',
  };
  // 人臉（側面，面向右）
  const FACE = {
    head: 'M0.66,-15.95 L0.74,-16.3 Q1.04,-16.2 1.28,-16.36 Q1.36,-16.5 1.29,-16.6 Q1.48,-16.7 1.42,-16.86 Q1.36,-16.95 1.38,-17.02 Q1.8,-17.12 1.72,-17.27 Q1.56,-17.56 1.33,-17.86 Q1.3,-18.22 1.1,-18.5 Q0.42,-19.3 -0.5,-19.15 Q-1.5,-18.9 -1.6,-17.8 Q-1.6,-16.9 -0.55,-16.6 L-0.6,-15.95 Z',
    eye: 'M0.48,-17.56 Q0.82,-17.78 1.12,-17.6 Q0.82,-17.44 0.48,-17.56 Z',
    kohl: 'M0.5,-17.57 L0.1,-17.62 L0.08,-17.55 L0.48,-17.5 Z',
    brow: 'M0.38,-17.86 Q0.8,-18.02 1.18,-17.86',
    lip: 'M1.3,-16.62 L1.12,-16.62',
    ear: 'M-0.45,-17.75 Q-0.15,-17.85 -0.1,-17.4 Q-0.12,-17.0 -0.45,-17.0',
  };
  // 三段式假髮（神祇的長假髮：一段垂在背後、一段垂在胸前）
  const WIG = {
    trip: 'M1.08,-18.15 Q1.05,-19.05 0.0,-19.48 Q-1.42,-19.62 -1.92,-18.5 Q-2.12,-17.0 -1.98,-15.55 L-0.82,-15.5 Q-0.74,-16.6 -0.2,-17.02 L0.16,-17.16 Q0.06,-16.2 0.26,-14.88 L0.98,-14.82 Q0.76,-16.3 0.62,-17.25 Q0.38,-17.8 0.56,-17.96 Q0.92,-18.02 1.08,-18.15 Z',
  };
  const JACKAL = {
    head: 'M0.6,-15.95 Q0.32,-16.45 0.62,-16.78 Q1.42,-16.86 2.12,-17.0 Q2.55,-17.02 2.48,-17.32 Q2.42,-17.48 2.2,-17.52 Q1.25,-17.95 0.55,-18.52 Q0.18,-18.78 -0.32,-18.72 Q-1.12,-18.52 -1.22,-17.6 Q-1.16,-16.6 -0.55,-16.42 L-0.6,-15.95 Z',
    earF: 'M-0.42,-18.6 L-0.05,-20.85 Q0.32,-19.7 0.42,-18.62 Z',
    earB: 'M-0.98,-18.45 L-0.78,-20.6 Q-0.42,-19.55 -0.3,-18.62 Z',
    earIn: 'M-0.22,-18.7 L-0.05,-20.2 Q0.15,-19.4 0.2,-18.72 Z',
    eye: 'M0.5,-18.05 Q0.82,-18.22 1.08,-18.02 Q0.8,-17.9 0.5,-18.05 Z',
    mouth: 'M2.32,-17.16 Q1.6,-17.12 1.05,-17.08',
    nose: 'M2.48,-17.32 L2.3,-17.3',
  };
  const FALCON = {
    head: 'M0.6,-15.95 Q0.35,-16.5 0.6,-17.0 Q1.0,-17.4 0.98,-18.1 Q0.9,-18.9 0.1,-19.0 Q-0.8,-18.95 -0.95,-18.1 Q-1.0,-17.2 -0.5,-16.6 L-0.6,-15.95 Z',
    beak: 'M0.88,-18.45 Q1.95,-18.5 2.1,-17.35 Q1.95,-17.42 1.82,-17.68 Q1.4,-17.88 0.9,-17.62 Z',
    eye: 'M0.42,-18.2 m-0.17,0 a0.17,0.17 0 1,0 0.34,0 a0.17,0.17 0 1,0 -0.34,0',
    mark1: 'M0.4,-18.0 Q0.36,-17.5 0.05,-17.05',
    mark2: 'M0.55,-18.1 Q1.2,-17.9 1.5,-17.4',
    mantle: 'M-0.95,-18.1 Q-1.9,-17.6 -2.0,-16.2 Q-1.9,-15.4 -1.4,-15.1 L-0.7,-15.3 Q-0.4,-16.0 -0.5,-16.6 Q-1.0,-17.2 -0.95,-18.1 Z',
  };
  const IBIS = {
    head: 'M0.45,-16.6 Q0.98,-17.4 0.95,-18.05 Q0.88,-18.85 0.1,-18.9 Q-0.75,-18.85 -0.85,-18.0 Q-0.85,-17.2 -0.3,-16.75 Z',
    beak: 'M0.82,-18.42 Q2.95,-18.15 3.9,-14.75 Q3.86,-14.55 3.7,-14.62 Q2.65,-17.25 0.86,-17.62 Z',
    eye: 'M0.32,-18.2 m-0.17,0 a0.17,0.17 0 1,0 0.34,0 a0.17,0.17 0 1,0 -0.34,0',
  };

  // 把方格座標轉成卡片座標的群組
  const gT = (x, y, s) => `transform="translate(${f(x)},${f(y)}) scale(${s})"`;

  function wigStrands(P, s, top, bot) {
    // 假髮的直條紋
    let o = `<g stroke="${P.wigLine}" stroke-width="${f(0.9 / s)}" fill="none" opacity=".9">`;
    for (let x = -1.75; x <= 0.85; x += 0.22) o += `<path d="M${f(x)},${top} L${f(x + 0.03)},${bot}"/>`;
    o += `</g>`;
    return o;
  }

  function collar(P, s, y0, rx) {
    // 寬領圈（wesekh）：數圈彩色珠串
    y0 = y0 || -16.12; rx = rx || 2.55;
    const bands = [[P.blue, 1], [P.red, 0.84], [P.green, 0.68], [P.gold, 0.52]];
    let o = '';
    const sw = f(P.sw / s);
    bands.forEach(([col, k], i) => {
      const r1 = rx * k, ry1 = 1.62 * k, r2 = rx * (k - 0.16), ry2 = 1.62 * (k - 0.16);
      o += `<path d="M${f(-r1)},${y0} A${f(r1)},${f(ry1)} 0 0 0 ${f(r1)},${y0} L${f(r2)},${y0} A${f(r2)},${f(ry2)} 0 0 1 ${f(-r2)},${y0} Z" fill="${col}" stroke="${P.line}" stroke-width="${sw}"/>`;
    });
    // 最外圈垂珠
    for (let i = 0; i <= 12; i++) {
      const a = Math.PI * (i / 12);
      const x = -Math.cos(a) * rx * 1.04, y = y0 + Math.sin(a) * 1.62 * 1.04;
      o += `<path d="M${f(x - 0.09)},${f(y - 0.05)} L${f(x)},${f(y + 0.24)} L${f(x + 0.09)},${f(y - 0.05)} Z" fill="${P.turq}" stroke="${P.line}" stroke-width="${f(sw * 0.6)}"/>`;
    }
    return o;
  }

  function ankh(cx, top, h, fill, line, sw) {
    // 安卡（生命之符）
    const w = h * 0.62, lr = h * 0.2;
    return `<path d="M${f(cx)},${f(top)} C${f(cx - lr * 1.45)},${f(top)} ${f(cx - lr * 1.2)},${f(top + h * 0.42)} ${f(cx - h * 0.06)},${f(top + h * 0.43)}
      L${f(cx - w / 2)},${f(top + h * 0.43)} L${f(cx - w / 2)},${f(top + h * 0.55)} L${f(cx - h * 0.07)},${f(top + h * 0.55)} L${f(cx - h * 0.1)},${f(top + h)} L${f(cx + h * 0.1)},${f(top + h)} L${f(cx + h * 0.07)},${f(top + h * 0.55)}
      L${f(cx + w / 2)},${f(top + h * 0.55)} L${f(cx + w / 2)},${f(top + h * 0.43)} L${f(cx + h * 0.06)},${f(top + h * 0.43)} C${f(cx + lr * 1.2)},${f(top + h * 0.42)} ${f(cx + lr * 1.45)},${f(top)} ${f(cx)},${f(top)} Z
      M${f(cx)},${f(top + h * 0.08)} C${f(cx - lr * 0.75)},${f(top + h * 0.08)} ${f(cx - lr * 0.55)},${f(top + h * 0.36)} ${f(cx)},${f(top + h * 0.37)} C${f(cx + lr * 0.55)},${f(top + h * 0.36)} ${f(cx + lr * 0.75)},${f(top + h * 0.08)} ${f(cx)},${f(top + h * 0.08)} Z"
      fill="${fill}" fill-rule="evenodd" stroke="${line}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  }

  // 站立邁步的神祇（男性，面向右）
  function strider(P, cx, ground, s, o) {
    const sw = f(P.sw / s), L = P.line;
    const st = `stroke="${L}" stroke-width="${sw}" stroke-linejoin="round"`;
    const skin = o.skin || P.skin;
    let g = `<g ${gT(cx, ground, s)}>`;
    // 雙腿
    g += `<path d="${PART.backLeg}" fill="${skin}" ${st}/><path d="${PART.kneeB}" fill="none" ${st}/>`;
    g += `<path d="${PART.frontLeg}" fill="${skin}" ${st}/><path d="${PART.kneeF}" fill="none" ${st}/>`;
    // 腳環
    g += `<path d="M-2.36,-1.25 L-1.44,-1.25 L-1.44,-0.98 L-2.34,-0.98 Z" fill="${P.gold}" ${st}/>`;
    g += `<path d="M2.06,-1.3 L3.0,-1.3 L3.08,-1.0 L2.16,-1.0 Z" fill="${P.gold}" ${st}/>`;
    // 身體
    g += `<path d="${PART.torso}" fill="${skin}" ${st}/>`;
    g += `<path d="${PART.chestLine}" fill="none" ${st}/>`;
    // 短裙
    g += `<path d="${PART.kilt}" fill="${P.linen}" ${st}/>`;
    g += `<g stroke="${P.linenLine}" stroke-width="${f(sw * 0.55)}" fill="none">`;
    for (let i = 0; i < 7; i++) g += `<path d="M${f(-1.5 + i * 0.42)},-10.5 L${f(-2.45 + i * 0.68)},-7.65"/>`;
    g += `</g>`;
    g += `<path d="${PART.kiltApron}" fill="${o.apron || P.gold}" ${st}/>`;
    g += `<path d="${PART.belt}" fill="${P.gold}" ${st}/>`;
    g += `<path d="M-1.2,-11.15 V-10.62 M-0.4,-11.15 V-10.62 M0.4,-11.15 V-10.62 M1.2,-11.15 V-10.62" ${st} fill="none"/>`;
    // 後手（垂下，握安卡）
    g += `<g transform="translate(-0.35,0)"><path d="${PART.backArm}" fill="${skin}" ${st}/>`;
    g += `<path d="M-3.32,-10.95 L-2.32,-10.95 L-2.3,-10.55 L-3.27,-10.55 Z" fill="${P.gold}" ${st}/>`; // 手環
    if (o.backHold === 'ankh') g += ankh(-2.58, -9.15, 2.45, o.ankhFill || P.blue, L, sw);
    g += `<ellipse cx="-2.58" cy="-9.35" rx=".46" ry=".56" fill="${skin}" ${st}/></g>`;
    // 牛尾（神祇與國王的腰飾）
    g += `<path d="M-1.85,-10.9 Q-2.7,-9.2 -2.9,-7.9 L-2.62,-7.86 Q-2.4,-9.1 -1.75,-10.6 Z" fill="${P.gold}" ${st}/>`;
    // 前手與持物
    if (o.frontHold === 'was') {
      g += `<path d="M5.98,-18.3 L5.98,-0.55" stroke="${L}" stroke-width="${f(0.34)}" />`;
      g += `<path d="M5.98,-18.3 L5.98,-0.55" stroke="${o.staff || P.staff}" stroke-width="${f(0.34 - sw * 2)}" />`;
      g += `<path d="M5.82,-18.15 L5.86,-18.9 L6.95,-18.78 L7.08,-18.48 L6.2,-18.36 Z" fill="${o.staff || P.staff}" ${st}/>`; // 權杖頭
      g += `<path d="M6.02,-18.86 L6.12,-19.25 L6.28,-18.86" fill="none" ${st}/>`;
      g += `<path d="M5.98,-0.6 L5.66,0 M5.98,-0.6 L6.3,0" fill="none" stroke="${L}" stroke-width="${f(0.22)}"/>`;
      g += `<path d="${PART.frontArmFwd}" fill="${skin}" ${st}/>`;
      g += `<path d="M3.55,-12.88 L3.98,-12.78 L4.0,-12.0 L3.52,-11.9 Z" fill="${P.gold}" ${st}/>`;
      g += `<ellipse cx="5.86" cy="-11.98" rx=".52" ry=".48" fill="${skin}" ${st}/>`;
    } else if (o.frontHold === 'ankhFwd') {
      g += ankh(5.95, -12.35, 3.0, o.ankhFill || P.blue, L, sw);
      g += `<path d="${PART.frontArmFwd}" fill="${skin}" ${st}/>`;
      g += `<path d="M3.55,-12.88 L3.98,-12.78 L4.0,-12.0 L3.52,-11.9 Z" fill="${P.gold}" ${st}/>`;
      g += `<ellipse cx="5.86" cy="-11.98" rx=".52" ry=".48" fill="${skin}" ${st}/>`;
    } else if (o.frontHold === 'adze') {
      // 祭司的手斧（開口儀式用）：長柄，前端是彎起的金屬刃
      const t = o.adzeTip || [9.5, -15.1];
      g += `<path d="M5.7,-11.7 L${t[0] - 0.4},${t[1] + 0.55}" stroke="${L}" stroke-width=".42" stroke-linecap="round"/>`;
      g += `<path d="M5.7,-11.7 L${t[0] - 0.4},${t[1] + 0.55}" stroke="#8a5a30" stroke-width="${f(0.42 - sw * 2)}" stroke-linecap="round"/>`;
      g += `<path d="M${t[0] - 0.6},${t[1] + 0.25} Q${t[0] - 0.1},${t[1] - 0.35} ${t[0] + 0.15},${t[1] - 0.05} L${t[0] + 0.05},${t[1] + 0.35} Q${t[0] - 0.2},${t[1] + 0.25} ${t[0] - 0.4},${t[1] + 0.75} Z" fill="#a9b4b2" ${st}/>`;
      g += `<path d="${PART.frontArmFwd}" fill="${skin}" ${st}/>`;
      g += `<ellipse cx="5.86" cy="-11.98" rx=".52" ry=".48" fill="${skin}" ${st}/>`;
    } else if (o.frontHold === 'palette') {
      // 書記調色盤與蘆葦筆
      g += `<g transform="rotate(14 4.9 -15.6)"><rect x="4.62" y="-18.7" width=".6" height="4.5" rx=".08" fill="${o.palette || P.linen}" ${st}/>
        <circle cx="4.92" cy="-18.3" r=".14" fill="${P.red}" ${st}/><circle cx="4.92" cy="-17.85" r=".14" fill="${P.black}" ${st}/>
        <rect x="4.84" y="-17.4" width=".16" height="2.6" fill="none" ${st}/></g>`;
      g += `<path d="${PART.frontArmUp}" fill="${skin}" ${st}/>`;
      g += `<path d="M3.62,-13.2 L4.02,-13.05 L3.95,-12.5 L3.52,-12.62 Z" fill="${P.gold}" ${st}/>`;
      g += `<ellipse cx="4.95" cy="-15.3" rx=".5" ry=".46" fill="${skin}" ${st}/>`;
      g += `<path d="M5.0,-15.5 L6.45,-18.6" stroke="${L}" stroke-width="${f(0.16)}"/>`;
    }
    // 豹皮披肩（祭司的服裝）
    if (o.robe === 'leopard') {
      const d = 'M-2.75,-15.75 L2.2,-15.5 Q2.55,-13.2 1.7,-10.9 Q0.2,-10.1 -1.95,-10.15 Q-2.75,-12.6 -2.75,-15.75 Z';
      g += `<path d="${d}" fill="#dcae4f" ${st}/>`;
      g += `<clipPath id="lp${++UID}"><path d="${d}"/></clipPath><g clip-path="url(#lp${UID})" fill="#3a2414">`;
      const r = rng(5);
      for (let i = 0; i < 26; i++) g += `<circle cx="${f(-2.6 + r() * 4.8)}" cy="${f(-15.5 + r() * 5.4)}" r="${f(0.1 + r() * 0.1)}"/>`;
      g += `</g><path d="M0.9,-11.2 Q1.5,-10.6 1.6,-9.6 Q1.2,-9.1 0.7,-9.5 Q0.4,-10.3 0.9,-11.2 Z" fill="#dcae4f" ${st}/>`;
    }
    // 頸、領圈
    g += `<path d="${PART.neck}" fill="${skin}" ${st}/>`;
    if (!o.noCollar) g += collar(P, s);
    // 頭
    g += head(P, s, o, 0, skin);
    g += `</g>`;
    return g;
  }

  function head(P, s, o, dy, skin) {
    const sw = f(P.sw / s), L = P.line;
    const st = `stroke="${L}" stroke-width="${sw}" stroke-linejoin="round"`;
    let g = `<g transform="translate(0,${dy || 0})">`;
    if (o.head === 'jackal') {
      g += wigBlock(P, s);
      g += `<path d="${JACKAL.earB}" fill="${P.jackal}" ${st}/>`;
      g += `<path d="${JACKAL.head}" fill="${P.jackal}" ${st}/>`;
      g += `<path d="${JACKAL.earF}" fill="${P.jackal}" ${st}/>`;
      g += `<path d="${JACKAL.earIn}" fill="${o.earIn || P.gold}" opacity=".85"/>`;
      g += `<path d="${JACKAL.eye}" fill="${o.eyeFill || P.white}" stroke="${o.eyeLine || P.gold}" stroke-width="${f(sw * 0.7)}"/>`;
      g += `<path d="${JACKAL.mouth}" fill="none" stroke="${o.eyeLine || P.gold}" stroke-width="${f(sw * 0.6)}"/>`;
    } else if (o.head === 'falcon') {
      g += `<path d="${FALCON.mantle}" fill="${P.wig}" ${st}/>`;
      g += `<path d="${FALCON.head}" fill="${P.ibis}" ${st}/>`;
      g += `<path d="${FALCON.beak}" fill="${o.beak || P.gold}" ${st}/>`;
      g += `<path d="${FALCON.mark1}" fill="none" stroke="${o.eyeLine || P.turq}" stroke-width="${f(sw * 1.5)}" stroke-linecap="round"/>`;
      g += `<path d="${FALCON.mark2}" fill="none" stroke="${o.eyeLine || P.turq}" stroke-width="${f(sw * 1.1)}" stroke-linecap="round"/>`;
      g += `<path d="${FALCON.eye}" fill="${o.eyeFill || P.white}" stroke="${o.eyeLine || P.line}" stroke-width="${f(sw * 0.6)}"/>`;
    } else if (o.head === 'set') {
      // 賽特獸：長而下彎的鼻、方形高耳
      const fill = o.headFill || P.jackal;
      g += wigBlock(P, s);
      g += `<path d="M-1.15,-18.4 L-1.32,-20.95 L-0.5,-20.95 L-0.4,-18.5 Z" fill="${fill}" ${st}/>`;
      g += `<path d="M0.6,-15.95 Q0.32,-16.45 0.62,-16.78 Q1.4,-16.9 2.3,-17.15 Q2.95,-17.4 2.9,-18.05 Q2.55,-17.95 2.3,-17.78 Q1.3,-18.0 0.55,-18.52 Q0.18,-18.78 -0.32,-18.72 Q-1.12,-18.52 -1.22,-17.6 Q-1.16,-16.6 -0.55,-16.42 L-0.6,-15.95 Z" fill="${fill}" ${st}/>`;
      g += `<path d="M-0.55,-18.6 L-0.72,-21.05 L0.18,-21.05 L0.2,-18.55 Z" fill="${fill}" ${st}/>`;
      g += `<path d="M-0.64,-20.2 L0.08,-20.2" stroke="${o.earIn || P.gold}" stroke-width="${f(sw * 0.8)}"/>`;
      g += `<path d="${JACKAL.eye}" fill="${o.eyeFill || P.white}" stroke="${o.eyeLine || P.gold}" stroke-width="${f(sw * 0.7)}"/>`;
      g += `<path d="M2.2,-17.2 Q1.5,-17.12 1.05,-17.08" fill="none" stroke="${o.eyeLine || P.gold}" stroke-width="${f(sw * 0.6)}"/>`;
    } else if (o.head === 'lion') {
      // 獅頭：短鼻、圓耳，長假髮當鬃毛
      const fill = o.headFill || P.gold;
      g += wigBlock(P, s);
      g += `<path d="M-0.25,-18.65 Q-0.15,-19.5 0.45,-19.3 Q0.6,-18.8 0.35,-18.5 Z" fill="${fill}" ${st}/>`;
      g += `<path d="M0.6,-15.95 Q0.3,-16.5 0.7,-16.9 Q1.5,-17.0 1.9,-17.22 Q2.1,-17.5 1.85,-17.72 Q1.3,-17.85 0.7,-18.3 Q0.3,-18.9 -0.4,-18.8 Q-1.2,-18.6 -1.25,-17.7 Q-1.2,-16.6 -0.55,-16.4 L-0.6,-15.95 Z" fill="${fill}" ${st}/>`;
      g += `<path d="M0.52,-18.05 Q0.82,-18.2 1.08,-18.0 Q0.8,-17.88 0.52,-18.05 Z" fill="${P.white}" stroke="${o.eyeLine || P.line}" stroke-width="${f(sw * 0.6)}"/>`;
      g += `<path d="M2.05,-17.3 L2.15,-17.45" stroke="${P.line}" stroke-width="${f(sw * 1.4)}" stroke-linecap="round"/><path d="M1.85,-17.0 Q1.4,-16.95 1.0,-17.05" fill="none" stroke="${P.line}" stroke-width="${f(sw * 0.7)}"/>`;
    } else if (o.head === 'ibis') {
      g += wigBlock(P, s);
      g += `<path d="${IBIS.head}" fill="${P.ibis}" ${st}/>`;
      g += `<path d="${IBIS.beak}" fill="${o.beak || P.black}" ${st}/>`;
      g += `<path d="${IBIS.eye}" fill="${o.eyeFill || P.white}" stroke="${o.eyeLine || P.line}" stroke-width="${f(sw * 0.5)}"/>`;
    } else if (o.head === 'bald') {
      g += `<path d="${FACE.head}" fill="${skin}" ${st}/>`;
      g += `<path d="${FACE.eye}" fill="${P.white}" ${st}/><circle cx="0.84" cy="-17.6" r=".1" fill="${P.black}"/>`;
      g += `<path d="${FACE.kohl}" fill="${P.black}"/>`;
      g += `<path d="${FACE.brow}" fill="none" stroke="${P.black}" stroke-width="${f(sw * 1.1)}" stroke-linecap="round"/>`;
      g += `<path d="${FACE.lip}" fill="none" ${st}/><path d="${FACE.ear}" fill="${skin}" ${st}/>`;
    } else {
      g += wigBlock(P, s, o.wigLong, true);
      g += `<path d="${FACE.head}" fill="${skin}" ${st}/>`;
      g += `<path d="${FACE.eye}" fill="${P.white}" ${st}/><circle cx="0.84" cy="-17.6" r=".1" fill="${P.black}"/>`;
      g += `<path d="${FACE.kohl}" fill="${P.black}"/>`;
      g += `<path d="${FACE.brow}" fill="none" stroke="${P.black}" stroke-width="${f(sw * 1.1)}" stroke-linecap="round"/>`;
      g += `<path d="${FACE.lip}" fill="none" ${st}/>`;
      g += wigCap(P, s);
      if (o.beard) g += `<path d="M0.55,-16.45 Q0.95,-16.05 0.98,-14.8 L1.5,-14.35 Q1.42,-15.9 1.1,-16.55 Z" fill="${o.beardFill || P.gold}" ${st}/>`;
      if (o.band) g += `<path d="M1.02,-18.25 Q-0.4,-18.55 -1.98,-18.2 L-1.98,-17.92 Q-0.4,-18.25 1.0,-17.98 Z" fill="${o.band}" ${st}/>`;
    }
    // 頭飾
    if (o.crown === 'lunar') g += lunarCrown(P, s, o);
    if (o.crown === 'sun') g += sunCrown(P, s, o);
    if (o.crown === 'plumes') g += plumeCrown(P, s, o);
    if (o.crown === 'modius') g += modiusCrown(P, s, o);
    if (o.crown === 'feather') g += maatFeather(P, s);
    if (o.crown === 'throne') g += `<path d="M-0.95,-19.3 L-0.95,-22.3 L0.35,-22.3 L0.35,-20.45 L1.55,-20.45 L1.55,-19.3 Z" fill="${P.gold}" stroke="${P.line}" stroke-width="${sw}" stroke-linejoin="round"/><path d="M-0.5,-21.7 H0 M-0.1,-19.9 H1.1" stroke="${P.line}" stroke-width="${f(sw * 0.6)}"/>`;
    if (o.crown === 'papyrus') {
      for (const [x, h] of [[-0.55, 2.6], [0.05, 3.3], [0.65, 2.7]]) {
        g += `<path d="M${x},-19.3 V${-19.3 - h}" stroke="${P.line}" stroke-width="${f(sw * 2.4)}"/><path d="M${x},-19.3 V${-19.3 - h}" stroke="${P.green}" stroke-width="${f(sw * 1.3)}"/>`;
        for (let k = -3; k <= 3; k++) g += `<path d="M${x},${-19.3 - h} L${f(x + k * 0.2)},${f(-19.3 - h - 0.75 + Math.abs(k) * 0.12)}" stroke="${P.line}" stroke-width="${f(sw * 1.1)}" stroke-linecap="round"/>`;
      }
    }
    if (o.crown === 'atef') {
      g += `<path d="M-0.95,-19.3 Q-1.15,-22.2 -0.4,-24.6 Q0.1,-25.4 0.6,-24.6 Q1.2,-22.2 1.0,-19.3 Z" fill="${o.atef || P.white}" stroke="${P.line}" stroke-width="${sw}" stroke-linejoin="round"/><circle cx="0.1" cy="-25.2" r=".42" fill="${P.red}" stroke="${P.line}" stroke-width="${sw}"/>`;
      for (const d of [-1, 1]) g += `<path d="M${d * 1.0},-20.2 Q${d * 2.5},-21.8 ${d * 1.8},-24.4 Q${d * 1.0},-23.0 ${d * 0.95},-20.4 Z" fill="${P.gold}" stroke="${P.line}" stroke-width="${sw}"/><path d="M${d * 1.2},-21 Q${d * 1.9},-22.4 ${d * 1.7},-23.7" fill="none" stroke="${P.line}" stroke-width="${f(sw * 0.6)}"/>`;
    }
    if (o.sidelock) g += `<path d="M-0.15,-18.3 Q0.9,-17.4 0.75,-15.4" fill="none" stroke="${P.line}" stroke-width="${f(sw * 3.2)}" stroke-linecap="round"/><path d="M-0.15,-18.3 Q0.9,-17.4 0.75,-15.4" fill="none" stroke="${P.wig}" stroke-width="${f(sw * 1.8)}" stroke-linecap="round"/><circle cx="0.75" cy="-15.3" r=".3" fill="${P.gold}" stroke="${P.line}" stroke-width="${f(sw * 0.7)}"/>`;
    g += `</g>`;
    return g;
  }

  function wigBlock(P, s, long) {
    const sw = f(P.sw / s), L = P.line;
    let d = WIG.trip;
    if (long) d = d.replace('-15.55', '-14.6').replace('-15.5', '-14.55').replace('-14.88', '-13.9').replace('-14.82', '-13.84');
    let g = `<path d="${d}" fill="${P.wig}" stroke="${L}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    g += `<clipPath id="wc${++UID}"><path d="${d}"/></clipPath><g clip-path="url(#wc${UID})">${wigStrands(P, s, -19.6, -13.5)}</g>`;
    // 前垂髮的束帶
    g += `<path d="M0.2,${long ? -14.3 : -15.15} L0.98,${long ? -14.24 : -15.1}" stroke="${P.gold === '#1a120e' ? C.gold : P.gold}" stroke-width="${f(0.16)}"/>`;
    return g;
  }

  // 人臉用：蓋在頭頂的那一塊假髮（髮際線以上、耳後）
  function wigCap(P, s) {
    const sw = f(P.sw / s), L = P.line;
    const d = 'M1.08,-18.15 Q1.05,-19.05 0.0,-19.48 Q-1.42,-19.62 -1.92,-18.5 Q-2.02,-17.5 -1.9,-16.75 L-0.62,-16.95 Q-0.32,-17.0 -0.1,-17.12 Q0.2,-17.3 0.3,-17.6 Q0.38,-17.85 0.56,-17.96 Q0.92,-18.02 1.08,-18.15 Z';
    let g = `<path d="${d}" fill="${P.wig}" stroke="${L}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    g += `<clipPath id="wk${++UID}"><path d="${d}"/></clipPath><g clip-path="url(#wk${UID})">${wigStrands(P, s, -19.6, -16.5)}</g>`;
    return g;
  }

  function sunCrown(P, s, o) {
    const sw = f(P.sw / s);
    return `<path d="M-1.0,-19.15 Q-0.05,-18.9 1.0,-19.15 L0.85,-19.6 Q-0.05,-19.4 -0.85,-19.6 Z" fill="${P.gold}" stroke="${P.line}" stroke-width="${sw}"/>
      <circle cx="-0.05" cy="-20.7" r="1.2" fill="${o.disk || P.sun}" stroke="${P.line}" stroke-width="${sw}"/>
      <path d="M0.55,-19.2 Q1.65,-19.5 1.45,-20.75 Q1.35,-21.25 1.0,-21.0 Q1.1,-20.6 0.85,-20.15 Q0.75,-19.75 0.4,-19.5 Z" fill="${o.uraeus || P.red}" stroke="${P.line}" stroke-width="${sw}"/>`;
  }
  function plumeCrown(P, s, o) {
    const sw = f(P.sw / s);
    let g = `<path d="M-1.6,-19.35 L1.35,-19.35 L1.2,-20.1 L-1.45,-20.1 Z" fill="${o.cap || P.gold}" stroke="${P.line}" stroke-width="${sw}"/>`;
    const plume = (x, fill, band) => {
      let o2 = `<g transform="translate(${x},0)"><path d="M0,-20.05 Q-0.9,-22 -0.75,-25 Q-0.6,-27.6 0,-28.8 Q0.6,-27.6 0.75,-25 Q0.9,-22 0,-20.05 Z" fill="${fill}" stroke="${P.line}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      for (let y = -21.2; y > -28; y -= 1.1) o2 += `<path d="M-0.62,${f(y)} Q0,${f(y - 0.35)} 0.62,${f(y)}" fill="none" stroke="${band}" stroke-width="${f(sw * 0.9)}"/>`;
      return o2 + `<path d="M0,-20.2 V-28.4" stroke="${band}" stroke-width="${f(sw * 0.7)}"/></g>`;
    };
    g += plume(-0.4, o.plumeA || '#14316a', o.plumeBand || '#e6c677') + plume(0.62, o.plumeB || '#5a2a1c', o.plumeBand || '#e6c677');
    if (o.disk) {
      // 兩根羽毛之間的日輪與聖蛇（阿蒙－拉）
      g += `<circle cx="0.12" cy="-20.2" r="1.0" fill="${o.disk}" stroke="${P.line}" stroke-width="${sw}"/><circle cx="0.12" cy="-20.2" r=".62" fill="none" stroke="${o.diskRing || P.gold}" stroke-width="${f(sw * 0.7)}"/>`;
      g += `<path d="M0.95,-19.7 Q1.95,-19.9 1.8,-20.9 Q1.72,-21.3 1.42,-21.1 Q1.5,-20.75 1.3,-20.4 Q1.2,-20.05 0.9,-19.95 Z" fill="${o.uraeus || P.red}" stroke="${P.line}" stroke-width="${sw}"/>`;
    }
    return g;
  }
  // 塞拉皮斯的頭飾：裝穀物的量器（modius），頂上插著麥穗
  function modiusCrown(P, s, o) {
    const sw = f(P.sw / s), fill = o.modius || P.gold;
    let g = `<path d="M-1.3,-19.3 L-1.12,-21.75 L1.22,-21.75 L1.4,-19.3 Z" fill="${fill}" stroke="${P.line}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    g += `<path d="M-0.55,-19.4 V-21.7 M0.1,-19.4 V-21.7 M0.75,-19.4 V-21.7" stroke="${P.line}" stroke-width="${f(sw * 0.6)}" opacity=".8"/>`;
    for (const [x, a] of [[-0.8, -18], [-0.2, -6], [0.45, 6], [1.0, 18]]) {
      g += `<g transform="translate(${x},-21.75) rotate(${a})"><path d="M0,0 V-1.9" stroke="${P.line}" stroke-width="${f(sw * 0.8)}"/>` +
        [0.5, 0.95, 1.4, 1.85].map((y) => `<path d="M0,${-y} q-.28,-.1 -.34,-.42 q.3,0 .34,.42 q.04,-.42 .34,-.42 q-.06,.32 -.34,.42 Z" fill="${P.gold}" stroke="${P.line}" stroke-width="${f(sw * 0.5)}"/>`).join('') + `</g>`;
    }
    return g;
  }

  function lunarCrown(P, s, o) {
    const sw = f(P.sw / s);
    const fillM = o.moon || P.gold;
    return `<path d="M-1.2,-20.05 Q0,-19.0 1.2,-20.05 Q0,-19.5 -1.2,-20.05 Z" fill="${fillM}" stroke="${P.line}" stroke-width="${sw}"/>
      <path d="M-0.95,-19.85 Q-0.95,-18.95 0,-18.95 Q0.95,-18.95 0.95,-19.85" fill="${fillM}" stroke="${P.line}" stroke-width="${sw}"/>
      <circle cx="0" cy="-20.75" r=".88" fill="${o.moonDisk || fillM}" stroke="${P.line}" stroke-width="${sw}"/>
      <path d="M-0.3,-19.0 L-0.25,-18.7 M0.3,-19.0 L0.25,-18.7" stroke="${P.line}" stroke-width="${sw}"/>`;
  }
  function maatFeather(P, s) {
    const sw = f(P.sw / s);
    // 瑪特的鴕鳥羽毛：插在頭帶上，羽尖向後捲
    return `<g><path d="M-0.15,-18.9 Q-0.55,-20.6 -0.35,-22.4 Q-0.2,-23.5 -0.9,-23.65 Q-1.4,-23.5 -1.05,-23.0 Q-0.8,-22.6 -0.95,-21.9 Q-1.25,-20.4 -0.75,-18.85 Z" fill="${P.white}" stroke="${P.line}" stroke-width="${sw}"/>
      <path d="M-0.42,-19.0 Q-0.85,-20.8 -0.68,-22.6" fill="none" stroke="${P.line}" stroke-width="${f(sw * 0.6)}"/>
      <path d="M-0.55,-19.6 L-0.2,-19.9 M-0.6,-20.3 L-0.28,-20.62 M-0.68,-21.0 L-0.34,-21.35 M-0.72,-21.7 L-0.42,-22.05" stroke="${P.line}" stroke-width="${f(sw * 0.45)}"/></g>`;
  }

  // 羽毛（翅膀用）：從 (x,y) 往 angle 方向長 len
  function feather(x, y, ang, len, w, fill, line, sw, rib) {
    const r = w / 2;
    return `<g transform="translate(${f(x)},${f(y)}) rotate(${f(ang)})"><path d="M0,${-r} L${f(len - r)},${-r} A${r},${r} 0 0 1 ${f(len - r)},${r} L0,${r} Z" fill="${fill}" stroke="${line}" stroke-width="${sw}" stroke-linejoin="round"/>${rib ? `<path d="M${f(len * 0.1)},0 L${f(len - r * 1.2)},0" stroke="${rib}" stroke-width="${f(sw * 0.8)}"/>` : ''}</g>`;
  }

  // ───────── 六張卡的插圖 ─────────
  const W = { x: 32, y: 100, w: 436, h: 320 };   // 插圖窗
  const GROUND = 392;

  const SCENES = {};

  // 阿努比斯：紙草壁畫風
  SCENES.anubis = (card) => {
    const P = MODE.papyrus;
    let s = papyrusGround(W.x, W.y, W.w, W.h, 41);
    s += blockBand(W.x, W.y, W.w, 9, ['#2c5d9c', '#b6402a', '#3b7d58', '#e2b54c', '#b6402a']);
    s += lotusFrieze(W.x, W.y + 9, W.w, 15);
    // 地面
    s += `<rect x="${W.x}" y="${GROUND}" width="${W.w}" height="${W.y + W.h - GROUND}" fill="#b6402a"/>`;
    s += `<path d="M${W.x},${GROUND} H${W.x + W.w}" stroke="#1b1410" stroke-width="2"/><rect x="${W.x}" y="${GROUND + 9}" width="${W.w}" height="5" fill="#1b1410"/>`;
    s += `<rect x="${W.x}" y="${GROUND + 14}" width="${W.w}" height="${W.y + W.h - GROUND - 14}" fill="#e2b54c" opacity=".9"/>`;
    // 左側：趴在神龕上的豺狼（阿努比斯的動物形象）
    s += jackalShrine(46, 150, 1.0);
    // 直行文字：「阿努比斯說：聖地之主」
    const cols = [['I010', 'D046', 'S043', 'M017', 'N035'], ['M017', 'N035', 'Q003', 'G043', 'E015'], ['V030', 'N016', 'D045']];
    let cx = 362;
    s += `<g stroke="#1b1410" stroke-width="1.2">`;
    for (let i = 0; i <= cols.length; i++) s += `<path d="M${cx - 17 + i * 34},136 V${GROUND - 6}"/>`;
    s += `</g>`;
    cols.forEach((c, i) => { s += glyphColumn(c, cx + i * 34, 144, 28, '#1b1714', 5).svg; });
    // 人物
    s += strider(P, 205, GROUND, 13, { head: 'jackal', backHold: 'ankh', frontHold: 'was', ankhFill: '#2c5d9c' });
    return s;
  };

  function jackalShrine(x, y, k) {
    const L = '#1b1410';
    return `<g transform="translate(${x},${y}) scale(${k})" stroke="${L}" stroke-width="1.5" stroke-linejoin="round">
      <rect x="6" y="56" width="92" height="40" fill="#e2b54c"/>
      <path d="M2,48 H102 L98,56 H6 Z" fill="#2c5d9c"/>
      <path d="M4,96 H100 V102 H4 Z" fill="#b6402a"/>
      <rect x="40" y="64" width="24" height="32" fill="#1b1410"/>
      <path d="M10,62 V90 M94,62 V90" stroke-width="1"/>
      ${Array.from({ length: 12 }, (_, i) => `<path d="M${8 + i * 8},48 v8" stroke-width="1"/>`).join('')}
      <path d="M22,47 Q12,52 10,66 Q9,76 14,80 Q16,72 18,64 Q20,56 28,50 Z" fill="#1a1716"/>
      <path d="M18,47 Q16,36 30,34 L62,34 Q70,33 72,27 Q73,21 74,17 L76,6 L80,15 L82,4 L86,16 Q92,17 99,21 Q100,23 98,24 L88,24 Q84,26 82,32 Q82,40 86,43 L98,44 Q101,46 98,47.5 Z" fill="#1a1716"/>
      <path d="M77,9 L79,15 M83,7 L84.5,15" stroke="#e2b54c" stroke-width="1.2"/>
      <path d="M84,19 Q86,18 88,19.5 Q86,20.5 84,19 Z" fill="#f7f0dc" stroke="#e2b54c" stroke-width=".8"/>
      <path d="M70,31 Q76,35 82,32" fill="none" stroke="#b6402a" stroke-width="3"/>
      <path d="M72,33 Q70,40 66,44" fill="none" stroke="#b6402a" stroke-width="2.2"/>
    </g>`;
  }

  // 瑪特：展翅跪姿（取自墓室壁畫的構圖）
  SCENES.maat = (card) => {
    const P = MODE.papyrus;
    let s = papyrusGround(W.x, W.y, W.w, W.h, 27);
    s += blockBand(W.x, W.y, W.w, 9, ['#3b7d58', '#b6402a', '#2c5d9c', '#e2b54c']);
    s += lotusFrieze(W.x, W.y + 9, W.w, 15);
    const cx = 248, gy = 398, sc = 14.2;
    // 上方橫行文字：「瑪特，拉的女兒」
    const t1 = ['Aa011', 'D036', 'X001', 'H006'], t2 = ['G039', 'X001', 'D021', 'D036', 'N005'];
    s += glyphRow(t1, W.x + 22, 172, 30, '#1b1714', 5).svg;
    s += glyphRow(t2, W.x + W.w - 22 - rowWidth(t2, 30, 5), 172, 30, '#1b1714', 5).svg;
    // 地面
    s += `<path d="M${W.x},${gy} H${W.x + W.w}" stroke="#1b1410" stroke-width="2"/>`;
    s += `<rect x="${W.x}" y="${gy + 1}" width="${W.w}" height="${W.y + W.h - gy - 1}" fill="#3b7d58" opacity=".9"/>`;
    s += `<rect x="${W.x}" y="${gy + 8}" width="${W.w}" height="4" fill="#1b1410"/>`;
    s += kneelingWinged(P, cx, gy, sc);
    return s;
  };

  function kneelingWinged(P, cx, gy, s, ho) {
    const sw = f(P.sw / s), L = P.line, st = `stroke="${L}" stroke-width="${sw}" stroke-linejoin="round"`;
    const skin = P.skinF, sy = -9.85; // 肩線
    let g = `<g ${gT(cx, gy, s)}>`;
    // 翅膀（左右對稱）
    const wing = (dir) => {
      let w = '';
      const ax0 = 2.2, ax1 = 10.6, ay = sy + 0.25;
      // 長飛羽：靠身體的朝下，越往外越往外斜，翅尖較短
      const N = 19;
      for (let i = N - 1; i >= 0; i--) {
        const t = i / (N - 1);
        const x = ax0 + (ax1 - ax0) * t, ang = 94 - Math.pow(t, 1.4) * 58, len = 6.4 - Math.pow(t, 3) * 1.9;
        w += feather(x, ay + 0.3, dir > 0 ? ang : 180 - ang, len, 0.86, i % 2 ? '#3b7d58' : '#2f6a4a', L, sw, '#16120f');
      }
      // 中層覆羽（藍）
      for (let i = 15; i >= 0; i--) {
        const t = i / 15, x = ax0 + (ax1 - 0.4 - ax0) * t, ang = 92 - Math.pow(t, 1.4) * 54;
        w += feather(x, ay + 0.05, dir > 0 ? ang : 180 - ang, 3.0 - t * 0.6, 0.82, '#2c5d9c', L, sw, '#89aee0');
      }
      // 上層小覆羽（紅、白、綠交錯的貝殼形）
      for (let i = 0; i < 17; i++) {
        const t = i / 16, x = ax0 + 0.15 + (ax1 - 1.0 - ax0) * t;
        const col = ['#b6402a', '#f2e6c4', '#3b7d58'][i % 3];
        w += `<path d="M${f(x - 0.28)},${f(ay - 0.25)} L${f(x - 0.28)},${f(ay + 0.62)} A0.28,0.28 0 0 0 ${f(x + 0.28)},${f(ay + 0.62)} L${f(x + 0.28)},${f(ay - 0.25)} Z" fill="${col}" ${st}/>`;
      }
      return dir > 0 ? w : `<g transform="scale(-1,1)">${w}</g>`;
    };
    g += wing(-1);
    g += wing(1);
    // 手臂（水平張開）
    const arm = (dir) => {
      const a = `<path d="M2.4,${sy - 0.32} L10.0,${sy - 0.22} Q10.6,${sy - 0.25} 10.75,${sy + 0.05} Q10.6,${sy + 0.35} 10.0,${sy + 0.32} L2.4,${sy + 0.42} Z" fill="${skin}" ${st}/>
        <path d="M3.6,${sy - 0.36} L4.0,${sy - 0.36} L4.0,${sy + 0.42} L3.6,${sy + 0.42} Z M8.9,${sy - 0.26} L9.25,${sy - 0.26} L9.25,${sy + 0.36} L8.9,${sy + 0.36} Z" fill="${P.gold}" ${st}/>`;
      return dir > 0 ? a : `<g transform="scale(-1,1)">${a}</g>`;
    };
    g += arm(-1) + arm(1);
    // 跪姿身體（紅色緊身長裙）
    g += `<path d="M-3.6,-0.32 Q-3.1,-0.55 -2.7,-0.3 L-2.7,0 L-3.7,0 Z" fill="${skin}" ${st}/>`; // 腳趾
    g += `<path d="M-1.62,${sy + 1.15} Q-1.82,-6.4 -1.8,-4.8 Q-2.66,-3.75 -2.78,-2.1 Q-2.95,-0.85 -3.0,-0.05 L3.22,0 Q3.82,-0.55 3.45,-1.48 Q2.65,-2.2 1.42,-2.78 Q1.08,-3.4 1.18,-4.7 Q1.32,-6.85 1.98,-8.1 Q2.18,-8.62 1.8,-8.95 Z" fill="${P.dress}" ${st}/>`;
    g += `<path d="M-1.5,-2.75 Q0.8,-3.05 3.2,-1.2" fill="none" stroke="${L}" stroke-width="${f(sw * 0.6)}"/>`;
    g += `<path d="M-1.58,-8.9 L1.85,-8.95 L1.9,-8.55 L-1.6,-8.5 Z" fill="${P.gold}" ${st}/>`;
    // 上身
    g += `<path d="M-0.6,${sy - 0.35} Q-1.9,${sy - 0.42} -2.6,${sy - 0.05} Q-2.4,${sy + 0.6} -1.62,${sy + 1.0} L1.85,-8.92 Q2.25,-9.05 2.25,-9.45 Q2.15,${sy + 0.2} 2.6,${sy - 0.05} Q1.9,${sy - 0.42} 0.6,${sy - 0.35} Z" fill="${skin}" ${st}/>`;
    g += `<path d="M-0.9,-8.95 L-0.4,${sy - 0.2} M1.2,-8.95 L0.7,${sy - 0.2}" stroke="${P.dress}" stroke-width="${f(0.22)}"/>`;
    g += `<g transform="translate(0,${sy + 16})">`;
    g += `<path d="${PART.neck}" fill="${skin}" ${st}/>` + collar(P, s, -16.12, 2.2);
    g += head(P, s, Object.assign({ head: 'human', crown: 'feather', wigLong: true, band: P.red }, ho || {}), 0, skin);
    g += `</g></g>`;
    return g;
  }

  // 托特：神話稀有度，黑底燙金線稿
  SCENES.thoth = (card) => {
    const P = MODE.gold;
    let s = goldGround(W.x, W.y, W.w, W.h, 12);
    // 拱門與兩根紙莎草柱
    s += `<g fill="none" stroke="url(#G)" stroke-width="1.3">
      <path d="M92,${GROUND} V196 A158,96 0 0 1 408,196 V${GROUND}"/>
      <path d="M102,${GROUND} V198 A148,88 0 0 1 398,198 V${GROUND}" stroke-dasharray="1.5 4"/>
      <path d="M112,${GROUND} V200 A138,80 0 0 1 388,200 V${GROUND}"/></g>`;
    s += papyrusColumn(60, 168, GROUND, 15, 'url(#G)', C.turq) + papyrusColumn(440, 168, GROUND, 15, 'url(#G)', C.turq);
    s += crescent(76, 128, 9, 'url(#G)') + crescent(424, 128, 9, 'url(#G)');
    // 拱頂的新月
    s += `<g transform="translate(250,118)"><path d="M-14,-4 A14,14 0 0 0 14,-4 A16,11 0 0 1 -14,-4 Z" fill="url(#G)"/><circle cx="0" cy="-10" r="6" fill="${C.rose}"/></g>`;
    // 台座
    s += `<g fill="#15100d" stroke="url(#G)" stroke-width="1.3"><path d="M120,${GROUND} H380 V${GROUND + 10} H120 Z"/><path d="M104,${GROUND + 10} H396 V${GROUND + 22} H104 Z"/></g>`;
    for (let i = 0; i < 14; i++) s += diamond(128 + i * 19, GROUND + 5, 3, 3, i % 2 ? C.turq : C.rose, 'none', 0);
    // 直行文字：「托特說：神聖話語（象形文字）之主」
    const col1 = ['I010', 'D046', 'S043', 'M017', 'N035', 'G026'], col2 = ['V030', 'S043', 'R008'];
    s += `<g stroke="url(#G)" stroke-width="1"><path d="M323,206 V380 M351,206 V380 M379,206 V380"/></g>`;
    s += glyphColumn(col1, 337, 212, 22, 'url(#G)', 4).svg;
    s += glyphColumn(col2, 365, 212, 22, 'url(#G)', 6).svg;
    // 人物（線稿）
    s += strider(P, 214, GROUND, 12.4, { head: 'ibis', crown: 'lunar', backHold: 'ankh', frontHold: 'palette', ankhFill: C.turq, moon: '#15100d', moonDisk: C.rose, eyeFill: C.turq, beak: C.gold, earIn: C.turq });
    return s;
  };

  // 荷魯斯之眼：速攻魔法（護身符）
  SCENES.eye = (card) => {
    let s = papyrusGround(W.x, W.y, W.w, W.h, 318);
    s += blockBand(W.x, W.y, W.w, 9, ['#2c5d9c', '#e2b54c', '#3b7d58', '#b6402a']);
    s += lotusFrieze(W.x, W.y + 9, W.w, 15);
    const cx = 250, cy = 248;
    // 光芒
    s += `<g stroke="#c8902e" stroke-width="2" opacity=".55">`;
    for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2; s += `<path d="M${f(cx + Math.cos(a) * 112)},${f(cy + Math.sin(a) * 112)} L${f(cx + Math.cos(a) * (i % 2 ? 150 : 136))},${f(cy + Math.sin(a) * (i % 2 ? 150 : 136))}"/>`; }
    s += `</g>`;
    // 釉陶護身符圓牌
    s += `<circle cx="${cx}" cy="${cy}" r="104" fill="#1b1410"/><circle cx="${cx}" cy="${cy}" r="100" fill="#e2b54c"/>
      <circle cx="${cx}" cy="${cy}" r="92" fill="url(#FAI)" stroke="#1b1410" stroke-width="2"/>`;
    // 金色珠圈
    for (let i = 0; i < 40; i++) { const a = i / 40 * Math.PI * 2; s += `<circle cx="${f(cx + Math.cos(a) * 96)}" cy="${f(cy + Math.sin(a) * 96)}" r="2.2" fill="${i % 2 ? '#b6402a' : '#2c5d9c'}" stroke="#1b1410" stroke-width=".8"/>`; }
    s += wedjat(cx - 2, cy + 4, 1.0);
    // 釉面高光
    s += `<path d="M${cx - 70},${cy - 40} A85,85 0 0 1 ${cx + 10},${cy - 86}" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".28"/>`;
    // 兩側紙莎草叢
    s += papyrusPlant(70, 392, 1) + papyrusPlant(430, 392, -1);
    // 下方文字 wḏ3t
    s += `<rect x="${W.x}" y="372" width="${W.w}" height="48" fill="#e2b54c"/><path d="M${W.x},372 H${W.x + W.w}" stroke="#1b1410" stroke-width="2"/>`;
    const t = ['G043', 'U028', 'G001', 'X001', 'D010'];
    s += glyphRow(t, cx - rowWidth(t, 30, 6) / 2, 410, 30, '#1b1714', 6).svg;
    return s;
  };
  function wedjat(cx, cy, k) {
    const T = `transform="translate(${cx},${cy}) scale(${k})"`;
    const ln = '#1b1410';
    return `<g ${T} stroke-linejoin="round">
      <path d="M-78,-42 Q-6,-86 70,-50 L72,-36 Q-6,-68 -76,-30 Z" fill="#2b4f93" stroke="${ln}" stroke-width="2.4"/>
      <path d="M-70,-4 Q-14,-54 50,-14 Q58,-10 66,-8 L98,-8 L98,4 L60,4 Q4,30 -70,-4 Z" fill="#f7f0dc" stroke="${ln}" stroke-width="3"/>
      <circle cx="-6" cy="-10" r="22" fill="${ln}"/>
      <circle cx="-13" cy="-17" r="5" fill="#fff" opacity=".7"/>
      <path d="M-70,-4 Q-14,-54 50,-14 Q58,-10 66,-8 L98,-8 L98,4 L60,4 Q4,30 -70,-4 Z" fill="none" stroke="${ln}" stroke-width="6"/>
      <path d="M-24,14 L-30,70 Q-30,78 -22,78 L-8,78 L-10,70 L-18,70 L-12,16 Z" fill="${ln}"/>
      <path d="M10,14 Q22,40 40,58 Q62,74 70,58 Q74,44 60,42 Q50,42 52,52 L58,52 Q58,48 62,50 Q66,56 58,62 Q44,64 32,50 Q22,36 20,14 Z" fill="${ln}"/>
    </g>`;
  }
  function papyrusPlant(x, gy, dir) {
    let s = `<g stroke="#1b1410" stroke-width="1.3">`;
    const stems = [[-14, 150, -12], [0, 186, 0], [14, 160, 12]];
    stems.forEach(([dx, h, lean]) => {
      const tx = x + dx + lean, ty = gy - h;
      s += `<path d="M${x + dx},${gy} Q${x + dx},${f(gy - h * 0.5)} ${tx},${ty}" fill="none" stroke="#3b7d58" stroke-width="4"/>`;
      s += `<path d="M${x + dx},${gy} Q${x + dx},${f(gy - h * 0.5)} ${tx},${ty}" fill="none" stroke="#1b1410" stroke-width="1" opacity=".6"/>`;
      s += `<path d="M${tx},${ty + 2} L${tx - 16},${ty - 22} Q${tx},${ty - 30} ${tx + 16},${ty - 22} Z" fill="#3b7d58"/>`;
      s += `<path d="M${tx - 16},${ty - 22} Q${tx},${ty - 30} ${tx + 16},${ty - 22}" fill="none" stroke="#b6402a" stroke-width="3"/>`;
    });
    s += `<path d="M${x - 24},${gy} Q${x - 18},${gy - 30} ${x - 6},${gy - 12} Q${x},${gy - 40} ${x + 6},${gy - 12} Q${x + 18},${gy - 30} ${x + 24},${gy} Z" fill="#2c5d9c"/>`;
    s += `</g>`;
    return s;
  }

  // 開口儀式：死者復活魔法（構圖參考胡內費爾紙草：阿努比斯扶著木乃伊，祭司舉手斧碰觸嘴巴）
  SCENES.mouth = (card) => {
    const P = MODE.papyrus;
    let s = papyrusGround(W.x, W.y, W.w, W.h, 355);
    s += blockBand(W.x, W.y, W.w, 9, ['#b6402a', '#2c5d9c', '#e2b54c', '#3b7d58']);
    s += lotusFrieze(W.x, W.y + 9, W.w, 15);
    // 背景：頂著小金字塔的墓堂
    s += `<g stroke="#1b1410" stroke-width="1.6"><path d="M40,${GROUND} V244 H112 V${GROUND} Z" fill="#f2e7cc"/>
      <path d="M44,244 L76,170 L108,244 Z" fill="#f2e7cc"/><path d="M66,193 L76,170 L86,193 Z" fill="#e2b54c"/>
      <path d="M62,${GROUND} V310 Q76,296 90,310 V${GROUND}" fill="#1b1410"/>
      <path d="M48,258 H104 M48,272 H104" stroke-width="1"/></g>`;
    // 地面
    s += `<rect x="${W.x}" y="${GROUND}" width="${W.w}" height="${W.y + W.h - GROUND}" fill="#d9a44a"/>`;
    s += `<path d="M${W.x},${GROUND} H${W.x + W.w}" stroke="#1b1410" stroke-width="2"/>`;
    s += `<rect x="${W.x}" y="${GROUND + 9}" width="${W.w}" height="4" fill="#1b1410" opacity=".8"/>`;
    // 阿努比斯在後面扶著木乃伊
    s += strider(P, 170, GROUND, 12.2, { head: 'jackal', backHold: 'ankh', frontHold: 'none', ankhFill: '#2c5d9c' });
    s += mummy(P, 206, GROUND, 12.2);
    // 阿努比斯的手扶在木乃伊背後
    s += `<g stroke="#1b1410" stroke-width="1.5"><path d="M178,252 Q184,247 190,250 L190,258 Q184,258 178,258 Z" fill="#b3552f"/></g>`;
    // 穿豹皮的祭司（面向左），舉手斧碰木乃伊的嘴
    const mouthX = 206 + 1.4 * 12.2, mouthY = GROUND - (16.7 - 1.8) * 12.2;
    const pcx = 352, ps = 12.2;
    s += `<g transform="translate(${pcx * 2},0) scale(-1,1)">` + strider(P, pcx, GROUND, ps, { head: 'bald', robe: 'leopard', backHold: 'none', frontHold: 'adze', noCollar: true, adzeTip: [(pcx - mouthX) / ps, (mouthY - GROUND) / ps] }) + `</g>`;
    // 巴鳥（靈魂回到身體）
    s += baBird(P, 268, 160, 0.95);
    // 文字：「開口」
    const t = ['F013', 'X001', 'D021'];
    s += glyphRow(t, W.x + W.w - 16 - rowWidth(t, 28, 6), 168, 28, '#1b1714', 6).svg;
    return s;
  };
  function mummy(P, cx, gy, s) {
    const sw = f(P.sw / s), L = P.line, st = `stroke="${L}" stroke-width="${sw}" stroke-linejoin="round"`;
    let g = `<g ${gT(cx, gy, s)}>`;
    const body = 'M-1.95,-15.9 Q-2.3,-12.2 -1.98,-6.2 Q-1.86,-2.6 -1.55,0 L2.62,0 Q2.75,-0.95 2.1,-1.65 Q1.62,-3.1 1.62,-6.1 Q1.78,-9.2 2.22,-12.1 Q2.48,-14.0 1.62,-15.5 L0.6,-16.0 Z';
    g += `<path d="${body}" fill="#f2e7cc" ${st}/>`;
    g += `<clipPath id="mc${++UID}"><path d="${body}"/></clipPath><g clip-path="url(#mc${UID})">`;
    // 珠網（釉陶串珠網罩）
    g += `<g stroke="#2e8c80" stroke-width="${f(0.1)}" fill="none">`;
    for (let k = -14; k < 8; k++) g += `<path d="M${k * 0.55 - 4},-1 L${k * 0.55 + 4},-12.5 M${k * 0.55 + 4},-1 L${k * 0.55 - 4},-12.5"/>`;
    g += `</g>`;
    for (const yy of [-3.2, -6.4, -9.6]) g += `<rect x="-3" y="${yy}" width="7" height=".42" fill="#b6402a" stroke="${L}" stroke-width="${f(sw * 0.6)}"/>`;
    g += `<rect x="-0.3" y="-12.6" width=".55" height="12" fill="#b6402a" opacity=".9"/>`;
    g += `</g>`;
    g += `<path d="${body}" fill="none" ${st}/>`;
    g += collar(P, s, -14.35, 2.1);
    // 面具（金色）
    g += `<g transform="translate(0,1.8)">${head(P, s, { head: 'human' }, 0, '#e2b54c')}</g>`;
    g += `</g>`;
    return g;
  }
  function baBird(P, x, y, k) {
    const L = P.line;
    return `<g transform="translate(${x},${y}) scale(${-k},${k})" stroke="${L}" stroke-width="1.5" stroke-linejoin="round">
      <path d="M-46,-6 Q-20,-30 18,-14 L34,-4 Q4,4 -46,-6 Z" fill="#2c5d9c"/>
      <path d="M-40,-6 Q-6,-20 22,-10" fill="none" stroke-width="1"/>
      <path d="M-44,-3 Q-14,-12 14,-6" fill="none" stroke-width="1"/>
      <path d="M-6,-12 Q4,10 26,8 Q38,4 34,-4 Q18,-16 -6,-12 Z" fill="#b6402a"/>
      <path d="M26,8 L44,16 L46,10 L34,2 Z" fill="#3b7d58"/>
      <path d="M8,8 L4,24 M14,8 L12,24 M2,24 h6 M10,24 h6" fill="none"/>
      <path d="M-8,-12 Q-14,-24 -6,-30 Q2,-34 6,-28 L8,-24 L11,-23 L8,-21 Q8,-17 4,-16 Q0,-12 -8,-12 Z" fill="#dfa25c"/>
      <path d="M-10,-14 Q-16,-26 -6,-32 Q4,-36 6,-30 Q-2,-30 -2,-24 Q-4,-16 -10,-14 Z" fill="#1d1b28"/>
      <path d="M1,-26 l4,0" stroke-width="1.6"/>
    </g>`;
  }

  // 假門：墓穴陷阱
  SCENES.falsedoor = (card) => {
    let s = papyrusGround(W.x, W.y, W.w, W.h, 431);
    const L = '#1b1410';
    // 牆面分格
    s += `<g stroke="${L}" stroke-width="1" opacity=".35"><path d="M${W.x},180 H${W.x + W.w} M${W.x},280 H${W.x + W.w}"/></g>`;
    // 門框（仿紅色花崗岩）
    const X0 = 136, X1 = 364, Y0 = 122, Y1 = GROUND;
    s += `<rect x="${X0 - 10}" y="${Y0}" width="${X1 - X0 + 20}" height="26" fill="#e2b54c" stroke="${L}" stroke-width="1.8"/>`;
    // 凹弧簷口的葉紋
    for (let i = 0; i < 24; i++) { const x = X0 - 6 + i * ((X1 - X0 + 12) / 24); s += `<path d="M${f(x)},${Y0 + 24} Q${f(x + 4)},${Y0 + 4} ${f(x + 9.5)},${Y0 + 24}" fill="${i % 3 === 0 ? '#2c5d9c' : i % 3 === 1 ? '#3b7d58' : '#b6402a'}" stroke="${L}" stroke-width=".9"/>`; }
    s += `<rect x="${X0 - 6}" y="${Y0 + 26}" width="${X1 - X0 + 12}" height="8" fill="#f2e7cc" stroke="${L}" stroke-width="1.4"/>`;
    for (let i = 0; i < 30; i++) s += `<path d="M${f(X0 - 6 + i * ((X1 - X0 + 12) / 30))},${Y0 + 26} l4,8" stroke="${L}" stroke-width=".8"/>`;
    const granite = (x, y, w, h, seed) => {
      const r = rng(seed); let o = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#b0563a" stroke="${L}" stroke-width="1.6"/>`;
      const n = Math.round(w * h / 60);
      for (let i = 0; i < n; i++) o += `<circle cx="${f(x + 2 + r() * (w - 4))}" cy="${f(y + 2 + r() * (h - 4))}" r="${f(0.6 + r() * 1.3)}" fill="${r() > 0.5 ? '#1b1410' : '#f0c9a8'}" opacity="${f(0.35 + r() * 0.4)}"/>`;
      return o;
    };
    s += granite(X0, Y0 + 34, X1 - X0, Y1 - Y0 - 34, 7);
    // 外柱、內柱、門楣（逐層內縮）
    s += granite(X0 + 30, Y0 + 52, X1 - X0 - 60, Y1 - Y0 - 52, 8);
    s += granite(X0 + 56, Y0 + 132, X1 - X0 - 112, Y1 - Y0 - 132, 9);
    // 供桌場景板
    s += `<rect x="${X0 + 46}" y="${Y0 + 62}" width="${X1 - X0 - 92}" height="58" fill="#f2e7cc" stroke="${L}" stroke-width="1.6"/>`;
    s += `<g stroke="${L}" stroke-width="1.3"><path d="M218,232 h40 M238,232 v-6" fill="none"/>`;
    for (let i = 0; i < 7; i++) s += `<path d="M${221 + i * 5.2},${226} Q${223.5 + i * 5.2},${200 + (i % 2) * 3} ${226 + i * 5.2},226 Z" fill="#d9a44a"/>`;
    s += `<path d="M266,232 v-26 q0,-6 6,-6 h2 q6,0 6,6 v26 Z" fill="#2c5d9c"/><path d="M196,232 v-20 q4,-8 9,0 v20 Z" fill="#3b7d58"/></g>`;
    // 鼓形捲軸與中央窄門
    s += `<rect x="${X0 + 70}" y="${Y0 + 136}" width="${X1 - X0 - 140}" height="12" rx="6" fill="#e2b54c" stroke="${L}" stroke-width="1.6"/>`;
    s += `<rect x="226" y="${Y0 + 150}" width="48" height="${Y1 - Y0 - 150}" fill="#140e0b" stroke="${L}" stroke-width="1.6"/>`;
    // 卡（ka）的雙臂從門裡浮現
    s += `<g filter="url(#GLOW)" opacity=".9">${glyph('D028', 222, 300, 56, '#f2c76a')}</g>`;
    s += glyph('D028', 222, 300, 56, '#f6dc94');
    // 門柱上的供品祈禱文：「國王給予的供品……祈求的供品」
    const colL = ['M023', 'X001', 'R004', 'X008'], colR = ['O001', 'Z001', 'P008'];
    s += `<g opacity=".95">${glyphColumn(colL, X0 + 15, Y0 + 52, 22, '#f6e3c4', 7).svg}${glyphColumn(colR, X1 - 15, Y0 + 52, 22, '#f6e3c4', 9).svg}</g>`;
    s += `<g opacity=".95">${glyphColumn(colL, X0 + 43, Y0 + 140, 20, '#f6e3c4', 6).svg}${glyphColumn(colR, X1 - 43, Y0 + 140, 20, '#f6e3c4', 8).svg}</g>`;
    // 門前地面與供品
    s += `<rect x="${W.x}" y="${GROUND}" width="${W.w}" height="${W.y + W.h - GROUND}" fill="#8a4a2c"/><path d="M${W.x},${GROUND} H${W.x + W.w}" stroke="${L}" stroke-width="2"/>`;
    s += `<g stroke="${L}" stroke-width="1.4"><path d="M70,${GROUND} v-34 q0,-10 10,-10 h4 q10,0 10,10 v34 Z" fill="#2c5d9c"/><path d="M76,${GROUND - 44} h12 v-6 h-12 Z" fill="#e2b54c"/>
      <path d="M404,${GROUND} v-26 q0,-12 12,-12 q12,0 12,12 v26 Z" fill="#b6402a"/><path d="M398,${GROUND - 38} q18,-22 36,0" fill="#3b7d58"/></g>`;
    return s;
  };

  // ───────── 聖甲蟲進化線 ─────────
  // 彩色聖甲蟲（俯視，頭朝上）：前腳高舉托住太陽
  function scarabColor(cx, cy, k, o) {
    o = o || {};
    const L = '#1b1410', sw = 2.2;
    const body = o.body || '#2f9d8c', body2 = o.body2 || '#1f6b62', cap = o.cap || '#2c5d9c';
    let g = `<g transform="translate(${cx},${cy}) scale(${k})" stroke="${L}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round">`;
    // 後腳與中腳
    for (const d of [-1, 1]) {
      g += `<path d="M${d * 26},24 L${d * 52},40 L${d * 58},58" fill="none" stroke-width="7"/><path d="M${d * 26},24 L${d * 52},40 L${d * 58},58" fill="none" stroke="#3a2a1e" stroke-width="3.6"/>`;
      g += `<path d="M${d * 30},0 L${d * 56},6 L${d * 66},24" fill="none" stroke-width="7"/><path d="M${d * 30},0 L${d * 56},6 L${d * 66},24" fill="none" stroke="#3a2a1e" stroke-width="3.6"/>`;
      // 前腳往上托住太陽
      g += `<path d="M${d * 26},-26 L${d * 54},-52 L${d * 34},-86" fill="none" stroke-width="7.5"/><path d="M${d * 26},-26 L${d * 54},-52 L${d * 34},-86" fill="none" stroke="#3a2a1e" stroke-width="4"/>`;
    }
    // 鞘翅
    g += `<path d="M0,-30 C36,-30 44,8 32,38 Q0,56 -32,38 C-44,8 -36,-30 0,-30 Z" fill="${body}"/>`;
    g += `<path d="M0,-28 V50" fill="none" stroke-width="1.8"/>`;
    for (const d of [-1, 1]) for (const r of [10, 20, 30]) g += `<path d="M${d * 3},${-24 + r * 0.2} Q${d * (r + 6)},${r - 8} ${d * (r * 0.9 + 4)},${r + 18}" fill="none" stroke="${body2}" stroke-width="1.5"/>`;
    // 前胸背板
    g += `<path d="M-32,-32 Q0,-48 32,-32 Q38,-22 30,-14 L-30,-14 Q-38,-22 -32,-32 Z" fill="${cap}"/>`;
    g += `<path d="M-18,-30 L-14,-18 M18,-30 L14,-18 M0,-34 V-16" fill="none" stroke-width="1.4"/>`;
    // 頭與頭盾的鋸齒
    g += `<path d="M-20,-46 L-14,-58 L-8,-48 L0,-62 L8,-48 L14,-58 L20,-46 L16,-36 L-16,-36 Z" fill="#3a2a1e"/>`;
    g += `<circle cx="-12" cy="-42" r="2.4" fill="#f7f0dc" stroke-width="1.2"/><circle cx="12" cy="-42" r="2.4" fill="#f7f0dc" stroke-width="1.2"/>`;
    g += `</g>`;
    return g;
  }
  function sunDiscRays(cx, cy, r, rays, col, op) {
    let s = `<g stroke="${col}" stroke-width="2" opacity="${op || 0.6}">`;
    for (let i = 0; i < rays; i++) {
      const a = (i / rays) * Math.PI * 2, r1 = r + 6, r2 = r + (i % 2 ? 18 : 30);
      s += `<path d="M${f(cx + Math.cos(a) * r1)},${f(cy + Math.sin(a) * r1)} L${f(cx + Math.cos(a) * r2)},${f(cy + Math.sin(a) * r2)}"/>`;
    }
    return s + `</g>`;
  }

  // 一階：聖甲蟲卵（糞球剖面）
  SCENES.egg = (card) => {
    let s = papyrusGround(W.x, W.y, W.w, W.h, 101);
    s += blockBand(W.x, W.y, W.w, 9, ['#e2b54c', '#2c5d9c', '#b6402a', '#3b7d58']);
    s += lotusFrieze(W.x, W.y + 9, W.w, 15);
    const cx = 250, cy = 246, r = 96;
    s += sunDiscRays(cx, cy, r, 40, '#c8902e', 0.5);
    // 糞球
    s += `<clipPath id="ball"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${r + 4}" fill="#1b1410"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#8a5a30"/>`;
    const rg = rng(17);
    s += `<g clip-path="url(#ball)">`;
    for (let i = 0; i < 90; i++) {
      const x = cx - r + rg() * r * 2, y = cy - r + rg() * r * 2, l = 10 + rg() * 26, a = rg() * Math.PI;
      s += `<path d="M${f(x)},${f(y)} l${f(Math.cos(a) * l)},${f(Math.sin(a) * l)}" stroke="${rg() > 0.5 ? '#c79a5a' : '#4a2c14'}" stroke-width="${f(0.8 + rg() * 1.6)}" stroke-linecap="round" opacity="${f(0.45 + rg() * 0.4)}"/>`;
    }
    s += `<ellipse cx="${cx - 38}" cy="${cy - 46}" rx="46" ry="26" fill="#e8b878" opacity=".22" transform="rotate(-30 ${cx - 38} ${cy - 46})"/>`;
    s += `</g>`;
    // 剖開的育房與卵
    s += `<ellipse cx="${cx}" cy="${cy + 6}" rx="43" ry="54" fill="#3a2010" stroke="#1b1410" stroke-width="2.4"/>`;
    s += `<ellipse cx="${cx}" cy="${cy + 6}" rx="40" ry="52" fill="#d9b982"/>`;
    s += `<ellipse cx="${cx}" cy="${cy + 10}" rx="25" ry="35" fill="#fbf3dc" stroke="#1b1410" stroke-width="2.4"/>`;
    s += `<path d="M${cx - 14},${cy - 8} Q${cx - 18},${cy + 14} ${cx - 10},${cy + 30}" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>`;
    s += `<path d="M${cx - 13},${cy + 36} Q${cx},${cy + 46} ${cx + 13},${cy + 36}" fill="none" stroke="#c9b27a" stroke-width="1.6"/>`;
    // 小太陽光暈（卵裡有生命）
    s += `<circle cx="${cx}" cy="${cy + 10}" r="9" fill="#e2b54c" opacity=".55"/>`;
    // 兩側紙莎草
    s += papyrusPlant(62, 392, 1) + papyrusPlant(438, 392, -1);
    // 底部金帶與文字：ḫpr（聖甲蟲，意思是「生成」）
    s += `<rect x="${W.x}" y="372" width="${W.w}" height="48" fill="#e2b54c"/><path d="M${W.x},372 H${W.x + W.w}" stroke="#1b1410" stroke-width="2"/>`;
    const t = ['L001'];
    s += glyphRow(t, cx - rowWidth(t, 34, 6) / 2, 410, 34, '#1b1714', 6).svg;
    return s;
  };

  // 二階：聖甲蟲（托起太陽）
  SCENES.scarab = (card) => {
    let s = papyrusGround(W.x, W.y, W.w, W.h, 202);
    s += blockBand(W.x, W.y, W.w, 9, ['#3b7d58', '#e2b54c', '#b6402a', '#2c5d9c']);
    s += lotusFrieze(W.x, W.y + 9, W.w, 15);
    const cx = 250, cy = 318, k = 1.36;
    // 地平線與日光
    s += `<rect x="${W.x}" y="${GROUND}" width="${W.w}" height="${W.y + W.h - GROUND}" fill="#d9a44a"/><path d="M${W.x},${GROUND} H${W.x + W.w}" stroke="#1b1410" stroke-width="2"/>`;
    s += `<rect x="${W.x}" y="${GROUND + 9}" width="${W.w}" height="4" fill="#1b1410" opacity=".8"/>`;
    const sx = cx, sy = cy - 106 * k;
    s += sunDiscRays(sx, sy, 28 * k, 36, '#c8902e', 0.55);
    s += `<circle cx="${sx}" cy="${sy}" r="${f(28 * k)}" fill="url(#SUN)" stroke="#1b1410" stroke-width="2.6"/>`;
    s += `<circle cx="${sx}" cy="${sy}" r="${f(21 * k)}" fill="none" stroke="#f3b27a" stroke-width="1.4" opacity=".7"/>`;
    s += scarabColor(cx, cy, k);
    // 直行文字：ḫpr 與 太陽
    s += `<g stroke="#1b1410" stroke-width="1.2"><path d="M70,150 V${GROUND - 8} M104,150 V${GROUND - 8} M396,150 V${GROUND - 8} M430,150 V${GROUND - 8}"/></g>`;
    s += glyphColumn(['L001', 'M017'], 87, 160, 26, '#1b1714', 8).svg + glyphColumn(['N005', 'Z001'], 413, 160, 26, '#1b1714', 8).svg;
    return s;
  };

  // 三階：凱布利（神話，黑底燙金）
  SCENES.khepri = (card) => {
    let s = goldGround(W.x, W.y, W.w, W.h, 303);
    s += `<g fill="none" stroke="url(#G)" stroke-width="1.3">
      <path d="M92,${GROUND} V196 A158,96 0 0 1 408,196 V${GROUND}"/>
      <path d="M102,${GROUND} V198 A148,88 0 0 1 398,198 V${GROUND}" stroke-dasharray="1.5 4"/>
      <path d="M112,${GROUND} V200 A138,80 0 0 1 388,200 V${GROUND}"/></g>`;
    s += papyrusColumn(60, 168, GROUND, 15, 'url(#G)', C.turq) + papyrusColumn(440, 168, GROUND, 15, 'url(#G)', C.turq);
    s += crescent(76, 128, 9, 'url(#G)') + crescent(424, 128, 9, 'url(#G)');
    // 台座
    s += `<g fill="#15100d" stroke="url(#G)" stroke-width="1.3"><path d="M120,${GROUND} H380 V${GROUND + 10} H120 Z"/><path d="M104,${GROUND + 10} H396 V${GROUND + 22} H104 Z"/></g>`;
    for (let i = 0; i < 14; i++) s += diamond(128 + i * 19, GROUND + 5, 3, 3, i % 2 ? C.turq : C.rose, 'none', 0);
    // 朝陽：日輪、日芒、有翼
    const sx = 250, sy = 176;
    s += `<g stroke="url(#G)" stroke-width="1" opacity=".9">`;
    for (let i = 0; i < 44; i++) { const a = Math.PI + (i / 43) * Math.PI; const r1 = 30, r2 = i % 2 ? 50 : 66; s += `<path d="M${f(sx + Math.cos(a) * r1)},${f(sy + Math.sin(a) * r1)} L${f(sx + Math.cos(a) * r2)},${f(sy + Math.sin(a) * r2)}"/>`; }
    s += `</g>`;
    s += wingedSun(sx, sy + 20, 0.74);
    // 聖甲蟲（金線稿）
    s += `<g transform="translate(250,326) scale(1.52)">${goldScarab()}</g>`;
    // 兩側直行文字
    s += `<g stroke="url(#G)" stroke-width="1"><path d="M140,270 V382 M360,270 V382"/></g>`;
    s += glyphColumn(['L001', 'M017'], 140, 276, 20, 'url(#G)', 5).svg + glyphColumn(['N005', 'Z001'], 360, 276, 20, 'url(#G)', 5).svg;
    return s;
  };
  function goldScarab() {
    const G = 'url(#G)';
    let o = `<g stroke="${G}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round" fill="#120d0a">`;
    for (const d of [-1, 1]) {
      o += `<path d="M${d * 26},24 L${d * 52},40 L${d * 58},58" fill="none" stroke-width="2.2"/>`;
      o += `<path d="M${d * 30},0 L${d * 56},6 L${d * 66},24" fill="none" stroke-width="2.2"/>`;
      o += `<path d="M${d * 26},-26 L${d * 56},-44 L${d * 70},-70" fill="none" stroke-width="2.2"/>`;
    }
    o += `<path d="M0,-30 C36,-30 44,8 32,38 Q0,56 -32,38 C-44,8 -36,-30 0,-30 Z"/>`;
    o += `<path d="M0,-28 V50" fill="none"/>`;
    for (const d of [-1, 1]) for (const r of [10, 20, 30]) o += `<path d="M${d * 3},${-24 + r * 0.2} Q${d * (r + 6)},${r - 8} ${d * (r * 0.9 + 4)},${r + 18}" fill="none" stroke-width=".9"/>`;
    o += `<path d="M-32,-32 Q0,-48 32,-32 Q38,-22 30,-14 L-30,-14 Q-38,-22 -32,-32 Z"/>`;
    o += `<path d="M-18,-30 L-14,-18 M18,-30 L14,-18 M0,-34 V-16" fill="none" stroke-width=".9"/>`;
    o += `<path d="M-20,-46 L-14,-58 L-8,-48 L0,-62 L8,-48 L14,-58 L20,-46 L16,-36 L-16,-36 Z"/>`;
    o += `<path d="M-24,-12 L-30,-12 L-24,-6 Z M24,-12 L30,-12 L24,-6 Z" fill="${C.turq}" stroke="none"/>`;
    o += `<path d="M-22,-24 L-12,-20 M22,-24 L12,-20" fill="none" stroke="${C.turq}" stroke-width="1.4"/>`;
    return o + `</g>`;
  }

  // ───────── 三神 ─────────
  const BR = '#e8c978';                       // 三神人物用的亮金線
  const gP = () => Object.assign({}, MODE.gold, { line: BR, sw: 1.5 });
  function podium() {
    let o = `<g fill="#15100d" stroke="url(#G)" stroke-width="1.3"><path d="M120,${GROUND} H380 V${GROUND + 10} H120 Z"/><path d="M104,${GROUND + 10} H396 V${GROUND + 22} H104 Z"/></g>`;
    for (let i = 0; i < 14; i++) o += diamond(128 + i * 19, GROUND + 5, 3, 3, i % 2 ? C.turq : C.rose, 'none', 0);
    return o;
  }
  function tint(id, cx, cy, r, col, a1, a2) {
    return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${col}" stop-opacity="${a1}"/><stop offset=".55" stop-color="${col}" stop-opacity="${a2}"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient><rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" fill="url(#${id})"/>`;
  }
  function ringGlyphs(cx, cy, r, codes, size, fill) {
    let o = '';
    codes.forEach((code, i) => {
      const a = (i / codes.length) * 360, g = GL.g[code], sc = size / GL.upm;
      const w = (g.b[2] - g.b[0]) * sc, h = (g.b[3] - g.b[1]) * sc;
      o += `<g transform="rotate(${a} ${cx} ${cy})"><path d="${g.d}" transform="translate(${f(cx - w / 2 - g.b[0] * sc)},${f(cy - r + h / 2 + g.b[1] * sc)}) scale(${f(sc * 1000) / 1000},${-f(sc * 1000) / 1000})" ${gst(fill)}/></g>`;
    });
    return o;
  }

  // 拉：巨大的日輪，鷹頭人身，頂著日輪與聖蛇
  SCENES.ra = (card) => {
    const P = gP();
    let s = goldGround(W.x, W.y, W.w, W.h, 41);
    s += tint('rg' + (++UID), 250, 240, 230, '#e2553a', 0.5, 0.2);
    const cx = 250, cy = 236, r = 118;
    // 日芒：長短相間的金色三角形
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2, a2 = ((i + 0.5) / 48) * Math.PI * 2, a3 = ((i + 1) / 48) * Math.PI * 2;
      const L = i % 2 ? 150 : 176;
      s += `<path d="M${f(cx + Math.cos(a) * (r + 8))},${f(cy + Math.sin(a) * (r + 8))} L${f(cx + Math.cos(a2) * L)},${f(cy + Math.sin(a2) * L)} L${f(cx + Math.cos(a3) * (r + 8))},${f(cy + Math.sin(a3) * (r + 8))} Z" fill="${i % 2 ? 'none' : 'url(#GF)'}" stroke="url(#G)" stroke-width="1" opacity="${i % 2 ? .8 : .55}"/>`;
    }
    s += `<circle cx="${cx}" cy="${cy}" r="${r + 5}" fill="#0d0907" stroke="url(#G)" stroke-width="2.2"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#SUN)"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${r - 10}" fill="none" stroke="#ffd9a0" stroke-width="1" stroke-dasharray="0.1 5" stroke-linecap="round" opacity=".8"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${r - 24}" fill="none" stroke="#ffd9a0" stroke-width=".8" opacity=".5"/>`;
    s += podium();
    s += strider(P, 250, GROUND, 11.4, { head: 'falcon', crown: 'sun', skin: '#3d150c', backHold: 'ankh', frontHold: 'was', ankhFill: C.turq, disk: '#e2553a', uraeus: '#5a2a1c', staff: '#1a120e', beak: '#1a120e', eyeLine: C.gold });
    // 兩側直行文字：拉（rꜥ）、天空之主（nb pt）
    s += `<g stroke="url(#G)" stroke-width="1"><path d="M96,262 V382 M404,262 V382"/></g>`;
    s += glyphColumn(['N005', 'Z001'], 96, 270, 24, 'url(#G)', 6).svg + glyphColumn(['V030', 'N001'], 404, 270, 24, 'url(#G)', 6).svg;
    return s;
  };

  // 阿蒙：夜空與方尖碑，藍色的皮膚，兩根高羽毛
  SCENES.amun = (card) => {
    const P = gP();
    let s = goldGround(W.x, W.y, W.w, W.h, 77);
    s += tint('ag' + (++UID), 250, 240, 230, '#2a56b8', 0.55, 0.22);
    const r = rng(8);
    for (let i = 0; i < 30; i++) s += sparkle(W.x + 14 + r() * (W.w - 28), W.y + 24 + r() * 190, 2.5 + r() * 6, 'url(#G)');
    // 風：三條飄動的線
    s += `<g fill="none" stroke="url(#G)" stroke-width="1.1" opacity=".55">`;
    for (const [y, x0] of [[196, 120], [244, 96], [292, 130]]) { let d = `M${x0},${y}`; for (let i = 0; i < 14; i++) d += ` q9,${i % 2 ? 8 : -8} 18,0`; s += `<path d="${d}"/>`; }
    s += `</g>`;
    // 光暈：雙圈與一圈星辰（夜、隱藏）
    const cx = 250, cy = 244;
    s += `<circle cx="${cx}" cy="${cy}" r="124" fill="none" stroke="url(#G)" stroke-width="1.8"/><circle cx="${cx}" cy="${cy}" r="116" fill="none" stroke="url(#G)" stroke-width="1" stroke-dasharray="0.1 5" stroke-linecap="round"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="96" fill="none" stroke="url(#G)" stroke-width=".8" opacity=".6"/>`;
    s += ringGlyphs(cx, cy, 106, Array(24).fill('N014'), 13, 'url(#G)');
    // 方尖碑
    const obelisk = (x) => `<g fill="#120d0a" stroke="url(#G)" stroke-width="1.4" stroke-linejoin="round"><path d="M${x - 13},${GROUND} L${x - 8},178 L${x},156 L${x + 8},178 L${x + 13},${GROUND} Z"/><path d="M${x - 8},178 H${x + 8}" fill="none"/><path d="M${x},156 L${x - 8},178 L${x + 8},178 Z" fill="${C.turq}" opacity=".8"/>
      <path d="M${x - 5},206 V${GROUND - 10} M${x + 5},206 V${GROUND - 10}" fill="none" stroke-width=".8"/>${[0, 1, 2, 3, 4].map(i => diamond(x, 232 + i * 28, 3.2, 5, i % 2 ? C.rose : C.turq, 'none', 0)).join('')}
      <path d="M${x - 19},${GROUND} H${x + 19}" fill="none"/></g>`;
    s += obelisk(86) + obelisk(414);
    s += podium();
    s += strider(P, 246, GROUND, 9.7, { head: 'human', crown: 'plumes', beard: true, skin: '#17366f', frontHold: 'ankhFwd', ankhFill: C.turq, wigLong: false, beardFill: '#1a120e', plumeA: '#14316a', plumeB: '#6a2a1c' });
    // 文字：阿蒙（imn）、偉大的神（nṯr ꜥ3）
    s += `<g stroke="url(#G)" stroke-width="1"><path d="M138,262 V382 M362,262 V382"/></g>`;
    s += glyphColumn(['M017', 'Y005', 'N035'], 138, 270, 24, 'url(#G)', 6).svg + glyphColumn(['R008', 'O029'], 362, 270, 24, 'url(#G)', 6).svg;
    return s;
  };

  // 普塔：杏仁形光環、心與舌，包著壽衣的工匠之神
  function ptahFigure(P, cx, gy, s, o) {
    const sw = f(P.sw / s), L = P.line, st = `stroke="${L}" stroke-width="${sw}" stroke-linejoin="round"`;
    const skin = o.skin;
    let g = `<g ${gT(cx, gy, s)}>`;
    // 權杖：瓦斯（底部分叉）＋傑德柱＋安卡
    g += `<path d="M3.4,-0.2 V-15.9" stroke="${L}" stroke-width=".44" stroke-linecap="round"/>`;
    g += `<path d="M3.4,-0.4 L2.9,0 M3.4,-0.4 L3.9,0" stroke="${L}" stroke-width=".3" stroke-linecap="round"/>`;
    g += `<path d="M2.95,-15.9 H3.85 V-16.5 H3.1 Q3.0,-16.5 2.95,-16.2 Z" fill="${o.djed || '#173f45'}" ${st}/>`;
    g += `<path d="M3.12,-16.5 H3.68 V-19.5 H3.12 Z" fill="${o.djed || '#173f45'}" ${st}/>`;
    for (const y of [-17.0, -17.75, -18.5, -19.25]) g += `<path d="M2.65,${y} Q2.6,${y - 0.28} 2.95,${y - 0.3} H3.85 Q4.2,${y - 0.28} 4.15,${y} Z" fill="${o.djed || '#173f45'}" ${st}/>`;
    g += ankh(3.4, -22.15, 2.55, o.ankhFill || C.turq, L, sw);
    // 壽衣
    const body = 'M-2.0,-15.9 Q-2.5,-12.5 -2.25,-7 Q-2.15,-3.2 -1.8,0 L2.05,0 Q2.35,-3.2 2.35,-7 Q2.55,-12.4 2.25,-15.9 Z';
    g += `<path d="${body}" fill="${o.shroud || '#0f2a24'}" ${st}/>`;
    g += `<g fill="none" stroke="${L}" stroke-width="${f(sw * 0.5)}" opacity=".7"><path d="M-2.3,-10.5 Q0,-10.0 2.4,-10.6"/><path d="M-2.2,-7.8 Q0,-7.3 2.35,-7.9"/><path d="M-2.1,-5.0 Q0,-4.6 2.3,-5.1"/><path d="M-1.9,-2.2 Q0,-1.8 2.1,-2.3"/></g>`;
    g += `<path d="M-1.95,-12.2 L2.2,-12.2" stroke="${L}" stroke-width="${f(sw * 0.5)}" opacity="0"/>`;
    // 雙手握杖
    g += `<ellipse cx="3.0" cy="-13.4" rx=".55" ry=".5" fill="${skin}" ${st}/><ellipse cx="3.0" cy="-12.2" rx=".55" ry=".5" fill="${skin}" ${st}/>`;
    g += `<path d="M2.1,-14.6 Q2.7,-14.2 2.7,-13.5 M2.1,-12.9 Q2.6,-12.7 2.6,-12.2" fill="none" ${st}/>`;
    // 領圈、頭、緊貼的頭帽、直鬍子
    g += `<path d="${PART.neck}" fill="${skin}" ${st}/>`;
    g += collar(P, s, -16.12, 2.45);
    g += `<path d="${FACE.head}" fill="${skin}" ${st}/>`;
    g += `<path d="${FACE.eye}" fill="${P.white}" ${st}/><circle cx="0.84" cy="-17.6" r=".1" fill="${P.black}"/>`;
    g += `<path d="${FACE.kohl}" fill="${P.black}"/><path d="${FACE.brow}" fill="none" stroke="${P.black}" stroke-width="${f(sw * 1.1)}" stroke-linecap="round"/><path d="${FACE.lip}" fill="none" ${st}/>`;
    g += `<path d="M0.5,-16.55 L0.52,-14.95 L1.3,-14.9 L1.28,-16.55 Z" fill="${o.beardFill || '#1a120e'}" ${st}/><path d="M0.7,-16.3 V-15.1 M0.9,-16.3 V-15.1 M1.1,-16.3 V-15.1" stroke="${L}" stroke-width="${f(sw * 0.4)}"/>`;
    g += `<path d="M1.12,-18.2 Q1.08,-19.15 0.1,-19.55 Q-1.4,-19.65 -1.98,-18.5 Q-2.12,-17.5 -1.85,-16.45 L-0.55,-16.5 L-0.5,-17.55 Q0.1,-17.85 0.6,-17.98 Q0.98,-18.05 1.12,-18.2 Z" fill="${o.cap || '#173f45'}" ${st}/>`;
    g += `<path d="M-1.8,-17.6 Q-0.4,-18.2 1.0,-18.05" fill="none" stroke="${C.turq}" stroke-width="${f(sw * 0.8)}"/>`;
    g += `</g>`;
    return g;
  }
  SCENES.ptah = (card) => {
    const P = gP();
    let s = goldGround(W.x, W.y, W.w, W.h, 119);
    s += tint('pg' + (++UID), 250, 240, 230, '#27b59a', 0.45, 0.18);
    const cx = 250, cy = 236;
    // 杏仁形光環（vesica）
    const vesica = (k, w) => `<path d="M${cx},${cy - 128 * k} Q${cx + w * k},${cy} ${cx},${cy + 128 * k} Q${cx - w * k},${cy} ${cx},${cy - 128 * k} Z"/>`;
    s += `<g fill="none" stroke="url(#G)"><g stroke-width="1.8">${vesica(1, 150)}</g><g stroke-width="1" stroke-dasharray="0.1 5" stroke-linecap="round">${vesica(0.92, 138)}</g><g stroke-width=".8" opacity=".7">${vesica(0.8, 120)}</g></g>`;
    // 兩側紙莎草柱
    s += papyrusColumn(60, 168, GROUND, 15, 'url(#G)', C.turq) + papyrusColumn(440, 168, GROUND, 15, 'url(#G)', C.turq);
    s += crescent(76, 128, 9, 'url(#G)') + crescent(424, 128, 9, 'url(#G)');
    // 心（ib）與舌（ns）：普塔用心想、用舌說
    const orb = (x, y, code) => `<circle cx="${x}" cy="${y}" r="30" fill="#0d0907" stroke="url(#G)" stroke-width="1.8"/><circle cx="${x}" cy="${y}" r="24" fill="none" stroke="${C.turq}" stroke-width=".9"/><circle cx="${x}" cy="${y}" r="30" fill="${C.turq}" opacity=".16"/>` + glyphColumn([code], x, y - 15, 30, 'url(#G)', 0).svg;
    s += orb(148, 176, 'F034') + orb(352, 176, 'F020');
    s += `<g fill="none" stroke="url(#G)" stroke-width="1" stroke-dasharray="0.1 4" stroke-linecap="round" opacity=".9"><path d="M178,176 Q214,150 232,168"/><path d="M322,176 Q286,150 268,168"/></g>`;
    s += podium();
    s += ptahFigure(P, 244, GROUND, 11.0, { skin: '#0f3a30', cap: '#173f45', ankhFill: C.turq });
    // 文字：普塔（ptḥ）、真理之主（nb mꜣꜥt）
    s += `<g stroke="url(#G)" stroke-width="1"><path d="M118,250 V384 M382,250 V384"/></g>`;
    s += glyphColumn(['Q003', 'X001', 'V028'], 118, 258, 24, 'url(#G)', 6).svg + glyphColumn(['V030', 'Aa011', 'D036', 'X001', 'H006'], 382, 258, 22, 'url(#G)', 4).svg;
    return s;
  };

  // ───────── 外框 ─────────
  const KIND = {
    monster: { accent: C.gold, accent2: C.goldLo, name: '神祇' },
    spell: { accent: C.turq, accent2: C.turqLo, name: '魔法' },
    trap: { accent: C.carn, accent2: '#7e3820', name: '陷阱' },
  };
  const RARITY = {
    common: { gem: '#e9e0cc', name: '普通' },
    rare: { gem: C.turq, name: '稀有' },
    epic: { gem: '#8c6fd1', name: '史詩' },
    mythic: { gem: '#f2cf72', name: '神話' },
    divine: { gem: '#ffe7a0', name: '三神' },
  };

  function domainEmblem(card, cx, cy) {
    const map = { sun: ['N005', '#d9533a'], desert: ['N025', '#d9a24a'], nile: ['N035A', '#5aa2d6'], underworld: ['R014', '#e8dcc0'], moon: ['N011', '#e9e1c8'] };
    let code, col;
    if (card.emblem) { code = card.emblem[0]; col = card.emblem[1]; }
    else if (card.kind === 'spell') { code = 'S034'; col = C.turq; }
    else if (card.kind === 'trap') { code = 'O001'; col = '#e89a72'; }
    else[code, col] = map[card.domain] || ['N005', C.gold];
    const g = GL.g[code], size = 34;
    const s = size / GL.upm, w = (g.b[2] - g.b[0]) * s, h = (g.b[3] - g.b[1]) * s;
    return `<path d="${g.d}" transform="translate(${f(cx - w / 2 - g.b[0] * s)},${f(cy + h / 2 + g.b[1] * s)}) scale(${f(s * 1000) / 1000},${-f(s * 1000) / 1000})" ${gst(col, 1.3)}/>`;
  }

  function medallion(cx, cy, r, accent) {
    let s = `<circle cx="${cx}" cy="${cy}" r="${r + 4}" fill="#0d0907"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#INK)" stroke="url(#G)" stroke-width="3"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${r - 6}" fill="none" stroke="${accent}" stroke-width="1.2"/>`;
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; s += `<circle cx="${f(cx + Math.cos(a) * (r - 3))}" cy="${f(cy + Math.sin(a) * (r - 3))}" r="1.1" fill="${C.goldHi}"/>`; }
    return s;
  }

  // 融合卡的外框：兩股金線與玫瑰銅線交纏的繩紋（兩種東西合而為一）
  function braid(x, y0, y1) {
    const n = Math.round((y1 - y0) / 10);
    let pa = `M${x},${y0}`, pb = pa;
    for (let i = 0; i < n; i++) {
      const y = y0 + i * 10, k = i % 2 ? -1 : 1;
      pa += ` Q${x + k * 7},${y + 5} ${x},${y + 10}`;
      pb += ` Q${x - k * 7},${y + 5} ${x},${y + 10}`;
    }
    return `<g fill="none" stroke-linecap="round"><path d="${pb}" stroke="#0d0907" stroke-width="4.6"/><path d="${pa}" stroke="#0d0907" stroke-width="4.6"/><path d="${pb}" stroke="${C.carn}" stroke-width="2.4"/><path d="${pa}" stroke="url(#G)" stroke-width="2.4"/></g>`;
  }

  function frame(card) {
    const K = KIND[card.kind], R = RARITY[card.rarity];
    const A = K.accent;
    let s = '';
    // 卡身
    s += `<rect x="0" y="0" width="500" height="700" rx="24" fill="url(#INK)"/>`;
    s += `<rect x="0" y="0" width="500" height="700" rx="24" fill="#fff" filter="url(#INKGRAIN)"/>`;
    // 外框雙線
    s += `<rect x="9" y="9" width="482" height="682" rx="17" fill="none" stroke="url(#G)" stroke-width="3.2"/>`;
    s += `<rect x="16" y="16" width="468" height="668" rx="12" fill="none" stroke="${A}" stroke-width="1.1" opacity=".9"/>`;
    // 頂、底中央菱形
    s += diamond(250, 13, 14, 9, A === C.gold ? C.turq : A) + diamond(250, 687, 14, 9, A === C.gold ? C.turq : A);
    // 標題列
    s += `<path d="M106,32 H418 L428,42 V82 L418,92 H106 Z" fill="#100b09" stroke="url(#G)" stroke-width="1.6"/>`;
    s += `<path d="M112,37 H415 L422,44 V80 L415,87 H112" fill="none" stroke="${A}" stroke-width=".9" opacity=".8"/>`;
    s += medallion(68, 62, 37, A);
    // 安卡小圖示（費用＝安卡）
    s += ankh(68, 18, 16, C.goldHi, '#0d0907', 1.2);
    s += medallion(448, 62, 30, A);
    s += domainEmblem(card, 448, 62);
    if (card.form === 'fusion') s += braid(24, 100, 622) + braid(476, 100, 622);
    // 插圖窗外框
    s += `<rect x="${W.x - 6}" y="${W.y - 6}" width="${W.w + 12}" height="${W.h + 12}" fill="#0d0907" stroke="url(#G)" stroke-width="2.4"/>`;
    if (card.rarity === 'divine') {
      // 三神：第三道珠點外框、側邊寶石、標題列兩端的菱形與下角扇紋
      s += `<rect x="3.6" y="3.6" width="492.8" height="692.8" rx="21" fill="none" stroke="url(#G)" stroke-width="1.2" stroke-dasharray="0.1 5" stroke-linecap="round"/>`;
      for (const y of [150, 300, 450, 560]) s += diamond(9, y, 4.5, 8, '#0d0907') + diamond(491, y, 4.5, 8, '#0d0907');
      s += diamond(106, 62, 5, 9, R.gem) + diamond(418, 62, 5, 9, R.gem);
      s += `<path d="M120,40 H404 M120,84 H404" stroke="url(#G)" stroke-width=".8" stroke-dasharray="0.1 4" stroke-linecap="round" opacity=".9"/>`;
      s += `<g opacity=".85">${cornerFan(21, 679, 38, 0, 'url(#G)')}${cornerFan(479, 679, 38, 270, 'url(#G)')}</g>`;
    }
    return s;
  }

  // 素材條：疊在插圖窗下緣，左邊是「合成」或「融合」的標籤，右邊（HTML）寫素材
  function matRibbon(card) {
    const y = W.y + W.h - 32, fu = card.form === 'fusion', tag = fu ? C.carn : C.turqLo;
    let s = `<rect x="${W.x}" y="${y}" width="${W.w}" height="32" fill="#0d0907" opacity=".94"/>`;
    s += `<path d="M${W.x},${y} H${W.x + W.w}" stroke="url(#G)" stroke-width="1.6"/>`;
    s += `<path d="M${W.x},${y} h66 l10,16 l-10,16 h-66 Z" fill="${tag}" stroke="url(#G)" stroke-width="1.4"/>`;
    s += `<path d="M${W.x + 4},${y + 4} h58 l7,12 l-7,12 h-58 Z" fill="none" stroke="#0d0907" stroke-width=".8" opacity=".55"/>`;
    return s;
  }

  // 場地卡：把插圖當成從神殿大門看出去的景——上緣是埃及式的凹弧飛簷（cavetto cornice），兩側是圓柱狀的繩紋門框
  function fieldGate(card) {
    const x0 = W.x, x1 = W.x + W.w, y0 = W.y, y1 = W.y + W.h, G = 'url(#G)';
    let s = '';
    // 兩側繩紋門框（torus）
    for (const x of [x0, x1 - 11]) {
      s += `<rect x="${x}" y="${y0}" width="11" height="${W.h}" fill="#120d0a"/>`;
      s += `<g stroke="${G}" stroke-width="1.2">`;
      for (let y = y0 + 20; y < y1; y += 8) s += `<path d="M${x},${y + 8} L${x + 11},${y}"/>`;
      s += `</g><path d="M${x + (x === x0 ? 11 : 0)},${y0} V${y1}" stroke="${G}" stroke-width="1.6"/><path d="M${x + (x === x0 ? 0 : 11)},${y0} V${y1}" stroke="#0d0907" stroke-width="1"/>`;
    }
    // 凹弧飛簷：一排直立的葉紋（棕櫚葉／羽狀），底下一條彩色橫飾帶
    s += `<path d="M${x0},${y0} H${x1} V${y0 + 14} Q${x1 - 20},${y0 + 24} ${x1 - 20},${y0 + 24} H${x0 + 20} Q${x0 + 20},${y0 + 24} ${x0},${y0 + 14} Z" fill="#100b09" stroke="${G}" stroke-width="1.4"/>`;
    const n = 36, bw = (W.w - 40) / n;
    for (let i = 0; i < n; i++) {
      const lx = x0 + 20 + i * bw, c = [C.lapis, C.turq, C.carn, C.gold][i % 4];
      s += `<path d="M${f(lx + 0.6)},${y0 + 23.5} Q${f(lx + bw / 2)},${y0 + 7} ${f(lx + bw - 0.6)},${y0 + 23.5} Z" fill="${c}" stroke="#0d0907" stroke-width=".6"/>`;
    }
    s += `<path d="M${x0},${y0 + 14} Q${x0 + 20},${y0 + 24} ${x0 + 20},${y0 + 24} M${x1},${y0 + 14} Q${x1 - 20},${y0 + 24} ${x1 - 20},${y0 + 24}" fill="none" stroke="${G}" stroke-width="1.4"/>`;
    s += `<path d="M${x0 + 11},${y0 + 25.5} H${x1 - 11}" stroke="${G}" stroke-width="1.6"/>`;
    s += wingedSun(250, y0 + 13, 0.3);
    return s;
  }

  function frameOver(card) {
    // 疊在插圖上面的框線與稀有度裝飾
    const K = KIND[card.kind], R = RARITY[card.rarity], A = K.accent;
    let s = `<rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" fill="none" stroke="#0d0907" stroke-width="2"/>`;
    s += `<rect x="${W.x - 2.5}" y="${W.y - 2.5}" width="${W.w + 5}" height="${W.h + 5}" fill="none" stroke="${A}" stroke-width="1" opacity=".9"/>`;
    // 四角小方塊
    for (const [x, y] of [[W.x - 6, W.y - 6], [W.x + W.w + 6, W.y - 6], [W.x - 6, W.y + W.h + 6], [W.x + W.w + 6, W.y + W.h + 6]]) {
      s += `<rect x="${x - 7}" y="${y - 7}" width="14" height="14" fill="#100b09" stroke="url(#G)" stroke-width="1.6"/>`;
      s += diamond(x, y, 4, 4, card.rarity === 'common' ? C.gold : R.gem, 'none', 0);
    }
    if (card.rarity === 'rare' || card.rarity === 'epic' || card.rarity === 'mythic' || card.rarity === 'divine') {
      s += diamond(W.x - 6, W.y + W.h / 2, 6, 10, R.gem) + diamond(W.x + W.w + 6, W.y + W.h / 2, 6, 10, R.gem);
    }
    if (card.rarity === 'epic' || card.rarity === 'mythic' || card.rarity === 'divine') {
      // 領圈色珠帶（插圖窗上下）
      const band = (y) => {
        let o = ''; const n = 44, bw = (W.w - 24) / n;
        for (let i = 0; i < n; i++) o += `<rect x="${f(W.x + 12 + i * bw + 0.6)}" y="${y - 2}" width="${f(bw - 1.2)}" height="4" rx="1" fill="${[C.lapis, C.turq, C.carn, C.gold][i % 4]}"/>`;
        return o;
      };
      s += band(W.y - 6) + band(W.y + W.h + 6);
    }
    if (card.form === 'field') s += fieldGate(card);
    if (card.mats) s += matRibbon(card);
    if (card.rarity === 'divine') {
      // 窗框的第二道亮金線，與上緣的有翼日輪冠飾
      s += `<rect x="${W.x - 9.5}" y="${W.y - 9.5}" width="${W.w + 19}" height="${W.h + 19}" fill="none" stroke="url(#GF)" stroke-width="1.2" opacity=".9"/>`;
      s += `<path d="M${250 - 92},${W.y - 6} H${250 + 92}" stroke="#0d0907" stroke-width="12"/>`;
      s += wingedSun(250, W.y - 5, 0.3);
      s += `<path d="M${250 - 92},${W.y + W.h + 6} H${250 + 92}" stroke="#0d0907" stroke-width="12"/>`;
      s += diamond(250, W.y + W.h + 6, 24, 8, '#120d0a') + diamond(250, W.y + W.h + 6, 10, 5, R.gem, 'none', 0);
      for (const dx of [-60, -42, 42, 60]) s += diamond(250 + dx, W.y + W.h + 6, 3.4, 3.4, C.turq, 'none', 0);
    }
    return s;
  }

  function lowerFrame(card) {
    const K = KIND[card.kind], R = RARITY[card.rarity], A = K.accent;
    let s = '';
    // 類別列
    s += `<path d="M30,434 H470 V466 H30 Z" fill="#100b09" stroke="url(#G)" stroke-width="1.3"/>`;
    s += `<path d="M30,434 L22,450 L30,466 M470,434 L478,450 L470,466" fill="none" stroke="url(#G)" stroke-width="1.3"/>`;
    // 進化階段（一階至三階）：類別列中間三顆菱形，亮到目前階段
    if (card.stageN) {
      for (let i = 0; i < 3; i++) {
        const on = i < card.stageN, x = 214 + i * 36;
        s += `<path d="M${x},441 L${x + 9},450 L${x},459 L${x - 9},450 Z" fill="${on ? C.gold : 'none'}" stroke="${on ? C.goldHi : C.goldLo}" stroke-width="1.3" opacity="${on ? 1 : .7}"/>`;
        if (i < 2) s += `<path d="M${x + 12},450 H${x + 24}" stroke="${C.goldLo}" stroke-width="1.2"/>`;
      }
    }
    // 象形文字名（右側）
    if (card.glyphName) {
      const sz = 22, wd = rowWidth(card.glyphName, sz, 3);
      s += glyphRow(card.glyphName, 458 - wd, 459, sz, A === C.gold ? C.gold : A, 3).svg;
    }
    // 文字框
    s += `<rect x="30" y="474" width="440" height="148" rx="4" fill="#120d0a" stroke="url(#G)" stroke-width="1.3"/>`;
    s += `<rect x="36" y="480" width="428" height="136" rx="2" fill="none" stroke="${A}" stroke-width=".8" opacity=".55"/>`;
    s += `<g opacity=".7">${cornerFan(37, 615, 22, 0, 'url(#G)')}${cornerFan(463, 615, 22, 270, 'url(#G)')}</g>`;
    // 下方：攻擊／生命
    if (card.kind === 'monster') {
      s += medallion(76, 652, 30, A) + medallion(424, 652, 30, A);

    }
    if (card.rarity === 'divine') {
      s += `<rect x="27" y="471" width="446" height="154" rx="6" fill="none" stroke="url(#G)" stroke-width="1" stroke-dasharray="0.1 4.5" stroke-linecap="round"/>`;
      if (card.kind === 'monster') s += `<circle cx="76" cy="652" r="38" fill="none" stroke="url(#G)" stroke-width="1.3" stroke-dasharray="0.1 4.5" stroke-linecap="round"/><circle cx="424" cy="652" r="38" fill="none" stroke="url(#G)" stroke-width="1.3" stroke-dasharray="0.1 4.5" stroke-linecap="round"/>`;
      s += `<circle cx="250" cy="652" r="27" fill="#100b09" stroke="url(#G)" stroke-width="2.2"/><circle cx="250" cy="652" r="22" fill="none" stroke="${A}" stroke-width=".9"/>`;
      for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; s += `<path d="M${f(250 + Math.cos(a) * 28.5)},${f(652 + Math.sin(a) * 28.5)} L${f(250 + Math.cos(a) * (i % 2 ? 33 : 37))},${f(652 + Math.sin(a) * (i % 2 ? 33 : 37))}" stroke="url(#G)" stroke-width="1.2"/>`; }
    }
    // 稀有度寶石
    s += diamond(250, 652, 11, 15, R.gem, 'url(#G)', 1.6);
    s += `<path d="M250,640 L256,652 L250,664" fill="none" stroke="#fff" stroke-width="1" opacity=".45"/>`;
    return s;
  }

  // ───────── 卡面 SVG（不含文字） ─────────
  function cardSVG(card) {
    const id = ++UID;
    const scene = SCENES[card.art] ? SCENES[card.art](card) : '';
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" class="card-svg" aria-hidden="true">${defs(id)}`;
    s += frame(card);
    s += `<clipPath id="art${id}"><rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}"/></clipPath>`;
    s += `<g clip-path="url(#art${id})">${scene}</g>`;
    s += frameOver(card);
    s += lowerFrame(card);
    s += `</svg>`;
    return s;
  }

  // ───────── 卡背：黑底燙金 ─────────
  function backSVG() {
    const id = ++UID;
    const G = 'url(#G)';
    let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" class="card-svg" aria-hidden="true">${defs(id)}`;
    s += `<rect x="0" y="0" width="500" height="700" rx="24" fill="url(#INK)"/>`;
    s += `<rect x="0" y="0" width="500" height="700" rx="24" fill="#fff" filter="url(#INKGRAIN)"/>`;
    // 黑色亮面象形文字（像局部上光：只有在反光時才看得到）
    {
      const pool = ['S034', 'R011', 'S040', 'N005', 'L001', 'G005', 'D010', 'N014', 'M017', 'N035', 'Q003', 'G043', 'X001', 'D021', 'D036', 'H006', 'I010', 'D046', 'S043', 'V030', 'N016', 'G026', 'R008', 'Aa011', 'G039', 'F034', 'O001', 'P001', 'N011', 'U028', 'G001', 'S029', 'I009', 'V028', 'A040', 'N025', 'Y005', 'G017'];
      const r = rng(31);
      let em = '';
      for (let x = 104; x <= 396; x += 26) {
        let y = 176;
        while (y < 612) {
          const code = pool[Math.floor(r() * pool.length)];
          const col = glyphColumn([code], x, y, 20, '#3a2c22', 0);
          em += col.svg; y = col.bottom + 7;
        }
      }
      s += `<g opacity=".95">${em}</g>`;
    }
    // 外框：雙金線＋珠點線
    s += `<rect x="12" y="12" width="476" height="676" rx="16" fill="none" stroke="${G}" stroke-width="3"/>`;
    s += `<rect x="22" y="22" width="456" height="656" rx="10" fill="none" stroke="${G}" stroke-width="1.1"/>`;
    s += `<rect x="28" y="28" width="444" height="644" rx="7" fill="none" stroke="${G}" stroke-width="1.6" stroke-dasharray="0.1 6" stroke-linecap="round"/>`;
    // 上下的「生命、穩定、權力」飾帶：安卡、傑德柱、瓦斯權杖重複排列
    const frieze = (y, flip) => {
      let o = `<rect x="44" y="${y - 22}" width="412" height="44" fill="#120d0a" stroke="${G}" stroke-width="1.2"/>`;
      const seq = ['S034', 'R011', 'S040'];
      const n = 15, step = 404 / n;
      for (let i = 0; i < n; i++) {
        const code = seq[i % 3], g = GL.g[code], sz = 32, sc = sz / GL.upm;
        const w = (g.b[2] - g.b[0]) * sc, h = (g.b[3] - g.b[1]) * sc;
        const cx = 48 + step * (i + 0.5);
        o += `<path d="${g.d}" transform="translate(${f(cx - w / 2 - g.b[0] * sc)},${f(y + h / 2 + g.b[1] * sc)}) scale(${f(sc * 1000) / 1000},${-f(sc * 1000) / 1000})" fill="${G}"/>`;
      }
      return o;
    };
    s += frieze(66) + frieze(634);
    // 有翼日輪（神廟門楣上的守護標誌）
    s += wingedSun(250, 132, 1);
    // 兩側紙莎草柱
    s += papyrusColumn(70, 182, 588, 14, G, C.turq) + papyrusColumn(430, 182, 588, 14, G, C.turq);
    s += crescent(70, 150, 8, G) + crescent(430, 150, 8, G);
    // 中央大圓：太陽船
    const cx = 250, cy = 366;
    s += `<circle cx="${cx}" cy="${cy}" r="140" fill="none" stroke="${G}" stroke-width="2.2"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="133" fill="none" stroke="${G}" stroke-width="1" stroke-dasharray="0.1 5" stroke-linecap="round"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="104" fill="#100b08" stroke="${G}" stroke-width="1.6"/>`;
    // 環形象形文字（夜空十二時辰的星辰之環）
    const ring = ['N014', 'S034', 'N014', 'R011', 'N014', 'S040', 'N014', 'L001', 'N014', 'S034', 'N014', 'R011', 'N014', 'S040', 'N014', 'N005', 'N014', 'S034', 'N014', 'R011', 'N014', 'S040', 'N014', 'G005'];
    ring.forEach((code, i) => {
      const a = (i / ring.length) * 360, g = GL.g[code], sz = code === 'N014' ? 14 : 20, sc = sz / GL.upm;
      const w = (g.b[2] - g.b[0]) * sc, h = (g.b[3] - g.b[1]) * sc;
      s += `<g transform="rotate(${a} ${cx} ${cy})"><path d="${g.d}" transform="translate(${f(cx - w / 2 - g.b[0] * sc)},${f(cy - 118 + h / 2 + g.b[1] * sc)}) scale(${f(sc * 1000) / 1000},${-f(sc * 1000) / 1000})" fill="${G}"/></g>`;
    });
    // 日芒
    s += `<g stroke="${G}" stroke-width="1">`;
    for (let i = 0; i < 48; i++) { const a = i / 48 * Math.PI * 2; const r1 = 64, r2 = i % 2 ? 98 : 88; s += `<path d="M${f(cx + Math.cos(a) * r1)},${f(cy - 18 + Math.sin(a) * r1)} L${f(cx + Math.cos(a) * r2)},${f(cy - 18 + Math.sin(a) * r2)}"/>`; }
    s += `</g>`;
    s += `<circle cx="${cx}" cy="${cy - 18}" r="58" fill="#100b08"/>`;
    // 聖甲蟲推著日輪
    s += `<circle cx="${cx}" cy="${cy - 52}" r="15" fill="${C.rose}" stroke="${G}" stroke-width="1.6"/>`;
    s += scarabTop(cx, cy - 6, 0.78, G);
    // 太陽船
    s += solarBoat(cx, cy + 58, 1, G);
    // 水波
    s += `<g fill="none" stroke="${G}" stroke-width="1.2">`;
    for (let r = 0; r < 3; r++) {
      let d = `M${cx - 80},${cy + 78 + r * 8}`;
      for (let i = 0; i < 16; i++) d += ` q5,-4 10,0`;
      s += `<path d="${d}" opacity="${1 - r * 0.25}"/>`;
    }
    s += `</g>`;
    // 散星
    const r = rng(9);
    for (let i = 0; i < 18; i++) {
      const x = 110 + r() * 280, y = 196 + r() * 330;
      if (Math.hypot(x - cx, y - cy) < 150) continue;
      s += sparkle(x, y, 3 + r() * 5, G);
    }
    // 下方王名圈（橢圓框）：太陽、聖甲蟲、船
    s += `<rect x="150" y="546" width="200" height="50" rx="25" fill="#120d0a" stroke="${G}" stroke-width="2"/>`;
    s += `<rect x="156" y="552" width="188" height="38" rx="19" fill="none" stroke="${G}" stroke-width=".8"/>`;
    s += `<path d="M350,554 V588" stroke="${G}" stroke-width="3.2"/>`;
    { const cs = ['N005', 'L001', 'P001'], wd = rowWidth(cs, 30, 14); s += glyphRow(cs, 248 - wd / 2, 584, 30, G, 14).svg; }
    s += diamond(250, 528, 7, 7, C.turq) + diamond(222, 528, 4, 4, C.rose, 'none', 0) + diamond(278, 528, 4, 4, C.rose, 'none', 0);
    // 四角扇紋
    s += cornerFan(29, 671, 40, 0, G) + cornerFan(471, 671, 40, 270, G) + cornerFan(29, 29, 40, 90, G) + cornerFan(471, 29, 40, 180, G);
    s += `</svg>`;
    return s;
  }

  function wingedSun(cx, cy, k) {
    const G = 'url(#G)';
    let s = `<g transform="translate(${cx},${cy}) scale(${k})" stroke="${G}" stroke-width="1.1" stroke-linejoin="round">`;
    const wing = () => {
      let w = '';
      const span = 172, x0 = 26;
      const yAt = (t) => -10 - Math.pow(t, 2.2) * 14; // 翅尖微微上揚
      // 由長到短三排羽毛，長羽在最下層
      const rows = [[30, 22, '#120d0a'], [20, 18, C.turq], [11, 15, '#120d0a']];
      rows.forEach(([len, n, fill], ri) => {
        const ext = span * (1 - ri * 0.12);
        for (let i = n - 1; i >= 0; i--) {
          const t0 = i / n, t1 = (i + 1) / n;
          const xa = x0 + ext * t0, xb = x0 + ext * t1;
          const ya = yAt(t0) + 2 + ri * 0, yb = yAt(t1) + 2;
          const l = len * (1 - t0 * 0.35);
          w += `<path d="M${f(xa)},${f(ya)} L${f(xb)},${f(yb)} L${f(xb - 1)},${f(yb + l - 3)} Q${f((xa + xb) / 2)},${f((ya + yb) / 2 + l + 2)} ${f(xa + 1)},${f(ya + l - 3)} Z" fill="${fill}" ${fill === C.turq ? 'fill-opacity=".85"' : ''}/>`;
          if (fill !== C.turq) w += `<path d="M${f((xa + xb) / 2)},${f((ya + yb) / 2 + 3)} L${f((xa + xb) / 2)},${f((ya + yb) / 2 + l - 4)}" stroke-width=".6"/>`;
        }
      });
      // 翼前緣
      w += `<path d="M${x0 - 2},-6 Q${x0 + 80},-16 ${x0 + span},${f(yAt(1) - 2)} L${x0 + span - 2},${f(yAt(1) + 5)} Q${x0 + 80},-8 ${x0 - 2},2 Z" fill="#120d0a"/>`;
      w += `<path d="M${x0 + 6},-4 Q${x0 + 80},-12 ${x0 + span - 12},${f(yAt(0.93))}" fill="none" stroke-dasharray=".1 4" stroke-linecap="round" stroke-width="1.6"/>`;
      return w;
    };
    s += wing() + `<g transform="scale(-1,1)">${wing()}</g>`;
    // 雙眼鏡蛇（烏賴烏斯）
    const cobra = `<path d="M18,14 Q22,2 22,-8 Q22,-18 28,-20 Q34,-20 33,-12 Q32,-6 28,-4 Q26,4 26,14 Z" fill="#120d0a"/><circle cx="29.5" cy="-14" r="1" fill="${C.turq}" stroke="none"/>`;
    s += cobra + `<g transform="scale(-1,1)">${cobra}</g>`;
    s += `<circle cx="0" cy="0" r="22" fill="${C.rose}"/>`;
    s += `<circle cx="0" cy="0" r="17" fill="none" stroke-width=".7" opacity=".7"/>`;
    s += `</g>`;
    return s;
  }
  function scarabTop(cx, cy, k, G) {
    return `<g transform="translate(${cx},${cy}) scale(${k})" stroke="${G}" stroke-width="1.6" stroke-linejoin="round" fill="#120d0a">
      <path d="M-30,-36 L-46,-50 M30,-36 L46,-50 M-34,-4 L-56,-8 L-62,-2 M34,-4 L56,-8 L62,-2 M-28,24 L-48,38 L-50,48 M28,24 L48,38 L50,48" fill="none" stroke-width="2.2"/>
      <path d="M-20,-44 Q0,-60 20,-44 L16,-34 L-16,-34 Z"/>
      <path d="M-14,-56 L-8,-50 M14,-56 L8,-50 M-4,-58 L-2,-52 M4,-58 L2,-52" fill="none"/>
      <path d="M-30,-34 Q0,-42 30,-34 Q34,-22 28,-14 L-28,-14 Q-34,-22 -30,-34 Z"/>
      <path d="M-30,-12 Q-38,20 0,44 Q38,20 30,-12 Z"/>
      <path d="M0,-12 L0,42" fill="none"/>
      <path d="M-18,-6 Q-20,14 -6,30 M18,-6 Q20,14 6,30" fill="none" stroke-width=".9"/>
      <path d="M-24,-12 L-30,-12 L-24,-6 Z M24,-12 L30,-12 L24,-6 Z" fill="${C.turq}" stroke="none"/>
    </g>`;
  }
  function solarBoat(cx, cy, k, G) {
    return `<g transform="translate(${cx},${cy}) scale(${k})" stroke="${G}" stroke-width="1.6" stroke-linejoin="round">
      <path d="M-92,-20 Q-80,-4 -56,4 L56,4 Q80,-4 92,-20 Q86,-6 70,8 Q40,16 0,16 Q-40,16 -70,8 Q-86,-6 -92,-20 Z" fill="#120d0a"/>
      <path d="M-92,-20 Q-100,-30 -96,-38 M92,-20 Q100,-30 96,-38" fill="none" stroke-width="2"/>
      <path d="M-100,-44 Q-96,-36 -90,-40 M100,-44 Q96,-36 90,-40" fill="none"/>
      <path d="M-60,4 L60,4" fill="none"/>
      ${Array.from({ length: 11 }, (_, i) => `<path d="M${-50 + i * 10},6 L${-50 + i * 10},14" stroke-width=".9"/>`).join('')}
      <path d="M-70,-4 L-70,-24 L-62,-24 L-62,-4" fill="#120d0a"/>
      <path d="M62,-4 L62,-28 Q66,-34 70,-28 L70,-4" fill="#120d0a"/>
      <path d="M66,-28 L82,-6" fill="none" stroke-width="2.2"/>
    </g>`;
  }

  // 給 cardart-ext.js 等延伸檔使用的零件
  const kit = { f, rng, C, MODE, W, GROUND, BR, gP, GL, SCENES, nextId: () => ++UID, gT, gst, glyph, glyphColumn, glyphRow, rowWidth, sparkle, crescent, diamond, cornerFan,
    papyrusColumn, blockBand, lotusFrieze, papyrusGround, goldGround, papyrusPlant, ankh, strider, head, collar, wigBlock, wigCap, plumeCrown, ptahFigure, scarabColor, sunDiscRays,
    feather, tint, ringGlyphs, podium, wingedSun, solarBoat, goldScarab, PART, FACE, JACKAL, FALCON, IBIS, wedjat, mummy, kneelingWinged };
  window.CardArt = { cardSVG, backSVG, C, KIND, RARITY, kit };
})();

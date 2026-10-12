/* 延伸卡圖：合成怪、融合怪、場地卡的插圖
 * 依賴 cardart.js 匯出的 CardArt.kit（繪圖零件）。 */
(function () {
  'use strict';
  const K = window.CardArt.kit;
  const { f, rng, C, MODE, W, BR, gP, SCENES, glyphColumn, sparkle, diamond, crescent, papyrusGround, goldGround, blockBand, lotusFrieze, papyrusPlant,
    papyrusColumn, strider, tint, ringGlyphs, wingedSun, solarBoat, FACE, wedjat } = K;
  const L = '#1b1410';
  const G = 'url(#G)';
  const uid = (p) => p + K.nextId();

  // ───────── 合成怪：卡諾卜守護者（荷魯斯四子） ─────────
  // 木乃伊化時取出的內臟，分別裝在四只罐子裡，蓋子是四個「荷魯斯之子」的頭。
  function lidHuman(cx, y0) {
    let s = `<path d="M${cx - 30},${y0 - 2} Q${cx - 35},${y0 - 56} ${cx},${y0 - 59} Q${cx + 35},${y0 - 56} ${cx + 30},${y0 - 2} Z" fill="#1d1b28" stroke="${L}" stroke-width="1.8"/>`;
    s += `<g stroke="#4a5d8c" stroke-width="1" opacity=".9">${[-24, -18, -12, 12, 18, 24].map((d) => `<path d="M${cx + d},${y0 - 6} V${y0 - 40}"/>`).join('')}</g>`;
    s += `<ellipse cx="${cx}" cy="${y0 - 25}" rx="17" ry="22" fill="#dfa25c" stroke="${L}" stroke-width="1.8"/>`;
    for (const d of [-1, 1]) {
      s += `<path d="M${cx + d * 4},${y0 - 29} Q${cx + d * 9},${y0 - 33} ${cx + d * 14},${y0 - 29} Q${cx + d * 9},${y0 - 26} ${cx + d * 4},${y0 - 29} Z" fill="#f7f0dc" stroke="${L}" stroke-width="1.2"/><circle cx="${cx + d * 9}" cy="${y0 - 29.5}" r="1.7" fill="${L}"/>`;
      s += `<path d="M${cx + d * 14},${y0 - 29} L${cx + d * 19},${y0 - 28}" stroke="${L}" stroke-width="1.6"/><path d="M${cx + d * 3},${y0 - 35} Q${cx + d * 9},${y0 - 38} ${cx + d * 15},${y0 - 34}" fill="none" stroke="${L}" stroke-width="1.8" stroke-linecap="round"/>`;
    }
    s += `<path d="M${cx - 2},${y0 - 28} Q${cx + 2},${y0 - 22} ${cx - 1},${y0 - 19}" fill="none" stroke="${L}" stroke-width="1.4"/><path d="M${cx - 6},${y0 - 12} Q${cx},${y0 - 9} ${cx + 6},${y0 - 12}" fill="none" stroke="${L}" stroke-width="1.6" stroke-linecap="round"/>`;
    s += `<path d="M${cx - 26},${y0 - 44} Q${cx},${y0 - 51} ${cx + 26},${y0 - 44}" fill="none" stroke="#e2b54c" stroke-width="4"/><path d="M${cx - 26},${y0 - 44} Q${cx},${y0 - 51} ${cx + 26},${y0 - 44}" fill="none" stroke="${L}" stroke-width=".7"/>`;
    return s;
  }
  function lidBaboon(cx, y0) {
    let s = `<ellipse cx="${cx}" cy="${y0 - 27}" rx="33" ry="30" fill="#b7a58b" stroke="${L}" stroke-width="1.8"/>`;
    s += `<g stroke="#8c7a66" stroke-width="1.1" fill="none" opacity=".8">${[-24, -17, 17, 24].map((d) => `<path d="M${cx + d},${y0 - 12} Q${cx + d * 1.15},${y0 - 30} ${cx + d * 0.95},${y0 - 48}"/>`).join('')}</g>`;
    for (const d of [-1, 1]) s += `<circle cx="${cx + d * 23}" cy="${y0 - 30}" r="6" fill="#8c7a66" stroke="${L}" stroke-width="1.5"/>`;
    s += `<ellipse cx="${cx}" cy="${y0 - 30}" rx="21" ry="21" fill="#8c7a66" stroke="${L}" stroke-width="1.8"/>`;
    s += `<path d="M${cx - 17},${y0 - 38} Q${cx},${y0 - 43} ${cx + 17},${y0 - 38}" fill="none" stroke="#5c4b3a" stroke-width="3" stroke-linecap="round"/>`;
    s += `<path d="M${cx - 12},${y0 - 28} Q${cx - 14},${y0 - 7} ${cx},${y0 - 5} Q${cx + 14},${y0 - 7} ${cx + 12},${y0 - 28} Z" fill="#6c5a49" stroke="${L}" stroke-width="1.6"/>`;
    s += `<circle cx="${cx - 4}" cy="${y0 - 15}" r="1.5" fill="${L}"/><circle cx="${cx + 4}" cy="${y0 - 15}" r="1.5" fill="${L}"/><path d="M${cx - 6},${y0 - 9} Q${cx},${y0 - 7} ${cx + 6},${y0 - 9}" fill="none" stroke="${L}" stroke-width="1.3"/>`;
    for (const d of [-1, 1]) s += `<circle cx="${cx + d * 9}" cy="${y0 - 33}" r="4.2" fill="#f2d77e" stroke="${L}" stroke-width="1.2"/><circle cx="${cx + d * 9}" cy="${y0 - 33}" r="1.7" fill="${L}"/>`;
    return s;
  }
  function lidJackal(cx, y0) {
    let s = '';
    for (const d of [-1, 1]) s += `<path d="M${cx + d * 20},${y0 - 34} L${cx + d * 17},${y0 - 66} L${cx + d * 5},${y0 - 44} Z" fill="#1a1716" stroke="${L}" stroke-width="1.8" stroke-linejoin="round"/><path d="M${cx + d * 16},${y0 - 40} L${cx + d * 15},${y0 - 58} L${cx + d * 9},${y0 - 44} Z" fill="#e2b54c" opacity=".85"/>`;
    s += `<path d="M${cx - 21},${y0 - 34} Q${cx - 23},${y0 - 54} ${cx},${y0 - 54} Q${cx + 23},${y0 - 54} ${cx + 21},${y0 - 34} L${cx + 9},${y0 - 5} Q${cx},${y0 - 1} ${cx - 9},${y0 - 5} Z" fill="#1a1716" stroke="${L}" stroke-width="1.8" stroke-linejoin="round"/>`;
    for (const d of [-1, 1]) s += `<path d="M${cx + d * 5},${y0 - 36} Q${cx + d * 10},${y0 - 41} ${cx + d * 15},${y0 - 36} Q${cx + d * 10},${y0 - 32} ${cx + d * 5},${y0 - 36} Z" fill="#f7f0dc" stroke="#e2b54c" stroke-width="1.2"/><circle cx="${cx + d * 10}" cy="${y0 - 36.5}" r="1.8" fill="${L}"/>`;
    s += `<path d="M${cx - 4},${y0 - 31} L${cx},${y0 - 16} L${cx + 4},${y0 - 31}" fill="none" stroke="#3a3330" stroke-width="1.4"/><ellipse cx="${cx}" cy="${y0 - 8}" rx="5" ry="3" fill="#3a3330" stroke="#e2b54c" stroke-width="1"/>`;
    return s;
  }
  function lidFalcon(cx, y0) {
    let s = `<path d="M${cx - 21},${y0 - 30} Q${cx - 23},${y0 - 55} ${cx},${y0 - 57} Q${cx + 23},${y0 - 55} ${cx + 21},${y0 - 30} Q${cx + 17},${y0 - 8} ${cx},${y0 - 4} Q${cx - 17},${y0 - 8} ${cx - 21},${y0 - 30} Z" fill="#4a6a8c" stroke="${L}" stroke-width="1.8"/>`;
    s += `<g stroke="#253239" stroke-width="1.2" fill="none" opacity=".8">${[-12, -6, 6, 12].map((d) => `<path d="M${cx + d},${y0 - 52} q${d * .2},12 ${d * .6},22"/>`).join('')}</g>`;
    for (const d of [-1, 1]) {
      s += `<circle cx="${cx + d * 11}" cy="${y0 - 36}" r="5" fill="#f2d77e" stroke="${L}" stroke-width="1.3"/><circle cx="${cx + d * 11}" cy="${y0 - 36}" r="2.3" fill="${L}"/>`;
      s += `<path d="M${cx + d * 11},${y0 - 31} Q${cx + d * 13},${y0 - 23} ${cx + d * 9},${y0 - 16}" fill="none" stroke="${L}" stroke-width="2" stroke-linecap="round"/>`;
    }
    s += `<path d="M${cx - 9},${y0 - 35} Q${cx},${y0 - 43} ${cx + 9},${y0 - 35} Q${cx + 8},${y0 - 17} ${cx},${y0 - 9} Q${cx - 8},${y0 - 17} ${cx - 9},${y0 - 35} Z" fill="#e2b54c" stroke="${L}" stroke-width="1.6" stroke-linejoin="round"/>`;
    s += `<path d="M${cx},${y0 - 32} V${y0 - 12}" stroke="${L}" stroke-width="1" opacity=".6"/>`;
    return s;
  }
  SCENES.canopic = (card) => {
    let s = papyrusGround(W.x, W.y, W.w, W.h, 23);
    s += blockBand(W.x, W.y, W.w, 9, ['#2c5d9c', '#b6402a', '#3b7d58', '#e2b54c', '#b6402a']);
    s += lotusFrieze(W.x, W.y + 9, W.w, 15);
    // 背後的太陽：四罐圍著一輪朝日
    s += `<circle cx="250" cy="262" r="96" fill="url(#SUN)" stroke="${L}" stroke-width="2"/><circle cx="250" cy="262" r="82" fill="none" stroke="#f4e0a8" stroke-width="1.4" stroke-dasharray="0.1 6" stroke-linecap="round" opacity=".8"/>`;
    // 石台
    s += `<rect x="46" y="364" width="408" height="26" fill="#d9c38e" stroke="${L}" stroke-width="2"/><rect x="38" y="378" width="424" height="14" fill="#c4a86e" stroke="${L}" stroke-width="2"/>`;
    s += `<path d="M52,371 H448" stroke="#b6402a" stroke-width="3"/><path d="M52,371 H448" stroke="${L}" stroke-width=".8" stroke-dasharray="10 6"/>`;
    const jars = [[94, lidHuman, '#2c5d9c'], [199, lidBaboon, '#b6402a'], [305, lidJackal, '#3b7d58'], [410, lidFalcon, '#e2b54c']];
    const top = 248, bot = 366;
    for (const [cx, lid, band] of jars) {
      const id = uid('jc');
      const body = `M${cx - 33},${top} Q${cx - 40},${top + 64} ${cx - 27},${bot} L${cx + 27},${bot} Q${cx + 40},${top + 64} ${cx + 33},${top} Z`;
      s += `<path d="${body}" fill="#efe3c0" stroke="${L}" stroke-width="2"/>`;
      s += `<clipPath id="${id}"><path d="${body}"/></clipPath><g clip-path="url(#${id})"><rect x="${cx + 10}" y="${top}" width="40" height="${bot - top}" fill="#c9b27c" opacity=".55"/><rect x="${cx - 40}" y="${top}" width="9" height="${bot - top}" fill="#fff" opacity=".35"/>`;
      s += `<rect x="${cx - 40}" y="${top + 18}" width="80" height="11" fill="${band}" stroke="${L}" stroke-width="1.6"/><rect x="${cx - 40}" y="${bot - 24}" width="80" height="7" fill="${band}" stroke="${L}" stroke-width="1.4"/></g>`;
      s += glyphColumn(['S034', 'R011', 'S034'], cx, top + 38, 20, L, 5).svg;
      s += `<rect x="${cx - 36}" y="${top - 6}" width="72" height="11" rx="2" fill="#e2b54c" stroke="${L}" stroke-width="1.8"/>`;
      s += lid(cx, top - 4);
    }
    return s;
  };

  // ───────── 合成怪：斯芬克斯（獅身人面） ─────────
  SCENES.sphinx = (card) => {
    const P = MODE.papyrus;
    let s = papyrusGround(W.x, W.y, W.w, W.h, 61);
    s += blockBand(W.x, W.y, W.w, 9, ['#2c5d9c', '#b6402a', '#3b7d58', '#e2b54c', '#b6402a']);
    s += lotusFrieze(W.x, W.y + 9, W.w, 15);
    s += `<circle cx="236" cy="178" r="40" fill="url(#SUN)" stroke="${L}" stroke-width="2"/>`;
    const pyr = (cx, base, hw, h) => `<path d="M${cx - hw},${base} L${cx},${base - h} L${cx + hw},${base} Z" fill="#f0dca8" stroke="${L}" stroke-width="2" stroke-linejoin="round"/><path d="M${cx},${base - h} L${cx + hw},${base} L${cx},${base} Z" fill="#d1a860"/><path d="M${cx},${base - h} L${cx + hw},${base} L${cx - hw},${base}" fill="none" stroke="${L}" stroke-width="2" stroke-linejoin="round"/>`;
    s += pyr(138, 344, 98, 150) + pyr(268, 344, 62, 96);
    // 沙地
    s += `<rect x="${W.x}" y="334" width="${W.w}" height="90" fill="#ecc874"/><path d="M${W.x},334 H${W.x + W.w}" stroke="${L}" stroke-width="2"/>`;
    s += `<path d="M${W.x},388 H${W.x + W.w}" stroke="${L}" stroke-width="2"/><rect x="${W.x}" y="391" width="${W.w}" height="30" fill="#b6402a"/>`;
    const r = rng(9);
    for (let i = 0; i < 70; i++) s += `<circle cx="${f(W.x + 6 + r() * (W.w - 12))}" cy="${f(340 + r() * 44)}" r="${f(0.7 + r() * 0.8)}" fill="#8a5a1c" opacity=".55"/>`;
    // 獅身
    const body = 'M50,386 C44,340 58,298 100,280 C140,264 200,260 258,258 C292,256 314,252 326,240 L328,226 L384,226 L388,246 C386,278 382,296 394,318 C406,340 438,344 452,360 L454,386 Z';
    const cid = uid('sp');
    s += `<path d="M52,374 C28,376 22,350 34,334 C42,324 56,330 54,344" fill="none" stroke="${L}" stroke-width="9" stroke-linecap="round"/><path d="M52,374 C28,376 22,350 34,334 C42,324 56,330 54,344" fill="none" stroke="#e3ab52" stroke-width="5" stroke-linecap="round"/><ellipse cx="55" cy="347" rx="6" ry="9" fill="#5a3a22" stroke="${L}" stroke-width="1.6"/>`;
    s += `<path d="${body}" fill="#e3ab52" stroke="${L}" stroke-width="2.2" stroke-linejoin="round"/>`;
    s += `<clipPath id="${cid}"><path d="${body}"/></clipPath><g clip-path="url(#${cid})"><path d="M40,360 H470 V390 H40 Z" fill="#c98a3a" opacity=".75"/><path d="M80,276 C150,262 210,262 270,258 L270,300 C200,300 120,300 80,296 Z" fill="#f2c274" opacity=".55"/></g>`;
    // 後腿與腳掌
    s += `<path d="M96,296 C132,298 156,330 146,376" fill="none" stroke="${L}" stroke-width="2"/><path d="M92,386 C96,366 132,364 166,370 L174,386 Z" fill="#e8b45e" stroke="${L}" stroke-width="2" stroke-linejoin="round"/><path d="M146,380 V386 M156,378 V386" stroke="${L}" stroke-width="1.5"/>`;
    // 前腿
    s += `<path d="M330,326 C340,352 356,360 380,360 L442,360 C454,360 460,368 460,378 L460,386 L330,386 Z" fill="#edbb68" stroke="${L}" stroke-width="2.2" stroke-linejoin="round"/><path d="M350,372 H458" stroke="${L}" stroke-width="1.6"/><path d="M436,362 V372 M446,362 V372 M455,364 V372" stroke="${L}" stroke-width="1.5"/>`;
    // 人面（法老）
    const hs = 20, sw = f(P.sw / hs), st = `stroke="${L}" stroke-width="${sw}" stroke-linejoin="round"`;
    const capD = 'M1.1,-18.15 Q1.05,-19.55 -0.3,-20.0 Q-2.0,-20.1 -2.65,-18.4 L-3.0,-15.0 L-1.6,-14.8 Q-1.3,-16.3 -0.62,-16.95 L-0.1,-17.3 Q0.3,-17.6 0.4,-18.0 Q0.8,-18.0 1.1,-18.15 Z';
    const lapD = 'M-1.5,-17.0 Q-0.5,-16.8 -0.2,-16.2 L0.5,-12.6 L-1.0,-12.4 Q-1.4,-14.8 -1.5,-17.0 Z';
    const stripes = (clip, y0, y1) => { let o = `<clipPath id="${clip}"><path d="${clip.startsWith('nc') ? capD : lapD}"/></clipPath><g clip-path="url(#${clip})">`; let i = 0; for (let y = y0; y < y1; y += 0.4, i++) o += `<rect x="-3.4" y="${f(y)}" width="4.8" height="0.4" fill="${i % 2 ? '#e2b54c' : '#2c5d9c'}"/>`; return o + `</g>`; };
    const c1 = uid('nc'), c2 = uid('nl');
    s += `<g transform="translate(360,556) scale(${hs})">`;
    s += `<path d="M-1.6,-18.2 L-3.1,-15.4 L-1.7,-14.7 L-0.9,-16.6 Z" fill="#2c5d9c" ${st}/>`;
    s += `<path d="${FACE.head}" fill="${P.skin}" ${st}/><path d="${FACE.eye}" fill="${P.white}" ${st}/><circle cx="0.84" cy="-17.6" r=".1" fill="${P.black}"/><path d="${FACE.kohl}" fill="${P.black}"/>`;
    s += `<path d="${FACE.brow}" fill="none" stroke="${P.black}" stroke-width="${f(sw * 1.1)}" stroke-linecap="round"/><path d="${FACE.lip}" fill="none" ${st}/>`;
    s += `<path d="M0.55,-16.45 Q0.95,-16.05 0.98,-14.8 L1.5,-14.35 Q1.42,-15.9 1.1,-16.55 Z" fill="#2c5d9c" ${st}/>`;
    s += `<path d="${capD}" fill="#e2b54c" ${st}/>${stripes(c1, -20.2, -14.6)}<path d="${capD}" fill="none" ${st}/>`;
    s += `<path d="${lapD}" fill="#e2b54c" ${st}/>${stripes(c2, -17.2, -12.2)}<path d="${lapD}" fill="none" ${st}/>`;
    s += `<path d="M1.02,-18.9 Q1.55,-19.0 1.45,-19.55 Q1.38,-19.85 1.12,-19.62 Q1.18,-19.3 0.95,-19.1 Z" fill="#b6402a" ${st}/>`;
    s += `</g>`;
    return s;
  };

  // ───────── 融合怪：阿蒙－拉 ─────────
  function plinth() {
    let o = `<g fill="#15100d" stroke="${G}" stroke-width="1.3"><path d="M118,372 H382 V380 H118 Z"/><path d="M104,380 H396 V388 H104 Z"/></g>`;
    for (let i = 0; i < 14; i++) o += diamond(128 + i * 19, 376, 3, 3, i % 2 ? C.turq : C.rose, 'none', 0);
    return o;
  }
  SCENES.amunra = (card) => {
    const P = gP();
    let s = goldGround(W.x, W.y, W.w, W.h, 83);
    s += tint(uid('mA'), 150, 240, 200, '#2a56b8', 0.5, 0.2) + tint(uid('mB'), 350, 240, 200, '#e2553a', 0.55, 0.22);
    const cx = 250, cy = 232, r = 108;
    // 日芒：左半是夜與星（隱藏的阿蒙），右半是日（拉）
    for (let i = 0; i < 48; i++) {
      const a = (i / 48) * Math.PI * 2, a2 = ((i + 0.5) / 48) * Math.PI * 2, a3 = ((i + 1) / 48) * Math.PI * 2, Lg = i % 2 ? 140 : 164;
      s += `<path d="M${f(cx + Math.cos(a) * (r + 8))},${f(cy + Math.sin(a) * (r + 8))} L${f(cx + Math.cos(a2) * Lg)},${f(cy + Math.sin(a2) * Lg)} L${f(cx + Math.cos(a3) * (r + 8))},${f(cy + Math.sin(a3) * (r + 8))} Z" fill="${i % 2 ? 'none' : 'url(#GF)'}" stroke="${G}" stroke-width="1" opacity="${i % 2 ? .75 : .5}"/>`;
    }
    s += `<circle cx="${cx}" cy="${cy}" r="${r + 5}" fill="#0d0907" stroke="${G}" stroke-width="2.2"/>`;
    s += `<path d="M${cx},${cy - r} A${r},${r} 0 0 0 ${cx},${cy + r} Z" fill="#0f1a38"/><path d="M${cx},${cy - r} A${r},${r} 0 0 1 ${cx},${cy + r} Z" fill="url(#SUN)"/>`;
    const rr = rng(4);
    for (let i = 0; i < 18; i++) s += sparkle(cx - 14 - rr() * (r - 24), cy - r + 22 + rr() * (2 * r - 44), 2 + rr() * 4.5, G);
    s += `<circle cx="${cx}" cy="${cy}" r="${r - 10}" fill="none" stroke="#ffd9a0" stroke-width="1" stroke-dasharray="0.1 5" stroke-linecap="round" opacity=".75"/>`;
    s += `<path d="M${cx},${cy - r - 4} V${cy + r + 4}" stroke="${G}" stroke-width="1.2" stroke-dasharray="0.1 4" stroke-linecap="round"/>`;
    s += plinth();
    s += strider(P, 246, 372, 9.0, { head: 'human', crown: 'plumes', beard: true, skin: '#17366f', backHold: 'ankh', frontHold: 'was', ankhFill: C.turq, wigLong: false, beardFill: '#1a120e', plumeA: '#14316a', plumeB: '#8a2a1c', disk: '#e2553a', diskRing: C.gold, uraeus: '#5a2a1c', staff: '#1a120e' });
    // 兩側直行文字：左 阿蒙（imn），右 拉（rꜥ）
    s += `<g stroke="${G}" stroke-width="1"><path d="M96,232 V362 M404,232 V362"/></g>`;
    s += glyphColumn(['M017', 'Y005', 'N035'], 96, 240, 24, G, 6).svg + glyphColumn(['N005', 'Z001'], 404, 240, 24, G, 6).svg;
    return s;
  };

  // ───────── 融合怪：塞拉皮斯 ─────────
  function ionic(x, top, bot, w) {
    let o = `<g fill="#15100d" stroke="${G}" stroke-width="1.3" stroke-linejoin="round">`;
    o += `<path d="M${x - w * .62},${bot} H${x + w * .62} V${bot - 7} H${x - w * .62} Z"/><path d="M${x - w * .5},${bot - 7} H${x + w * .5} V${bot - 12} H${x - w * .5} Z"/>`;
    o += `<path d="M${x - w * .42},${bot - 12} L${x - w * .36},${top + 30} H${x + w * .36} L${x + w * .42},${bot - 12} Z"/>`;
    o += `<g fill="none" stroke-width=".9">`;
    for (let i = -2; i <= 2; i++) o += `<path d="M${f(x + i * w * .15)},${bot - 14} L${f(x + i * w * .14)},${top + 32}"/>`;
    o += `</g>`;
    o += `<path d="M${x - w * .56},${top + 30} H${x + w * .56} V${top + 22} H${x - w * .56} Z"/>`;
    o += `<path d="M${x - w * .78},${top + 12} H${x + w * .78} V${top + 22} H${x - w * .78} Q${x - w * .94},${top + 26} ${x - w * .88},${top + 38} Q${x - w * .74},${top + 44} ${x - w * .7},${top + 34} Q${x - w * .74},${top + 28} ${x - w * .66},${top + 30} V${top + 22} M${x + w * .66},${top + 22} V${top + 30} Q${x + w * .74},${top + 28} ${x + w * .7},${top + 34} Q${x + w * .74},${top + 44} ${x + w * .88},${top + 38} Q${x + w * .94},${top + 26} ${x + w * .78},${top + 22}"/>`;
    o += `<path d="M${x - w * .86},${top + 6} H${x + w * .86} V${top + 12} H${x - w * .86} Z"/></g>`;
    o += `<circle cx="${x - w * .8}" cy="${top + 34}" r="3" fill="${C.turq}" opacity=".9"/><circle cx="${x + w * .8}" cy="${top + 34}" r="3" fill="${C.turq}" opacity=".9"/>`;
    return o;
  }
  SCENES.serapis = (card) => {
    const P = gP();
    let s = goldGround(W.x, W.y, W.w, W.h, 97);
    s += tint(uid('sA'), 250, 240, 230, '#27b59a', 0.45, 0.18);
    s += papyrusColumn(84, 150, 372, 16, G, C.turq);
    s += ionic(418, 140, 372, 26);
    // 從頭冠射出的光芒（晚期的塞拉皮斯像常有）
    const hx = 246, hy = 222;
    s += `<g stroke="${G}" stroke-width="1.6" stroke-linecap="round">`;
    for (let i = 0; i < 9; i++) { const a = Math.PI + (i / 8) * Math.PI, r0 = 58, r1 = i % 2 ? 78 : 92; s += `<path d="M${f(hx + Math.cos(a) * r0)},${f(hy + Math.sin(a) * r0 - 4)} L${f(hx + Math.cos(a) * r1)},${f(hy + Math.sin(a) * r1 - 4)}"/>`; }
    s += `</g><circle cx="${hx}" cy="${hy - 4}" r="52" fill="none" stroke="${G}" stroke-width="1" stroke-dasharray="0.1 5" stroke-linecap="round"/>`;
    s += plinth();
    s += strider(P, 246, 372, 9.0, { head: 'human', crown: 'modius', beard: true, skin: '#0f3a30', backHold: 'ankh', frontHold: 'was', ankhFill: C.turq, wigLong: true, beardFill: '#1a120e', modius: '#241a10', staff: '#1a120e' });
    s += `<g stroke="${G}" stroke-width="1"><path d="M150,236 V362 M342,236 V362"/></g>`;
    s += glyphColumn(['Q003', 'D004', 'A040'], 150, 244, 24, G, 6).svg + glyphColumn(['V030', 'S034'], 342, 244, 24, G, 6).svg;
    return s;
  };

  // ───────── 場地：卡納克大柱廳 ─────────
  SCENES.karnak = (card) => {
    let s = papyrusGround(W.x, W.y, W.w, W.h, 71);
    // 天花板：藍底金星（埃及神廟的天花板就是這樣畫的）
    s += `<rect x="${W.x}" y="${W.y}" width="${W.w}" height="146" fill="#2c5d9c"/>`;
    const r = rng(12);
    for (let i = 0; i < 28; i++) s += sparkle(W.x + 14 + r() * (W.w - 28), W.y + 28 + r() * 96, 3 + r() * 4, '#e8c158');
    // 盡頭的大門與日光
    s += `<rect x="212" y="214" width="76" height="116" fill="#f7e7b0" stroke="${L}" stroke-width="2"/><circle cx="250" cy="262" r="20" fill="url(#SUN)" stroke="${L}" stroke-width="1.5"/>`;
    s += `<rect x="204" y="208" width="92" height="9" fill="#e2b54c" stroke="${L}" stroke-width="1.6"/>`;
    // 地面：往遠處收攏的磚縫
    s += `<path d="M${W.x},330 H${W.x + W.w} V${W.y + W.h} H${W.x} Z" fill="#cfa86a"/>`;
    s += `<g stroke="#8d6a38" stroke-width="1.2" opacity=".7">`;
    for (let i = -8; i <= 8; i++) s += `<path d="M${250 + i * 8},330 L${250 + i * 72},${W.y + W.h}"/>`;
    for (const y of [338, 350, 366, 388, 416]) s += `<path d="M${W.x},${y} H${W.x + W.w}"/>`;
    s += `</g><path d="M${W.x},330 H${W.x + W.w}" stroke="${L}" stroke-width="2"/>`;
    // 光束
    s += `<g fill="#fff6d0" opacity=".26"><path d="M92,126 L150,126 L252,420 L120,420 Z"/><path d="M200,126 L240,126 L330,420 L252,420 Z" opacity=".7"/></g>`;
    // 柱列：由遠到近
    const col = (cx, base, h, w, open) => {
      const top = base - h, capH = h * 0.2, capW = w * 1.9;
      let o = `<rect x="${f(cx - w / 2)}" y="${f(top + capH)}" width="${f(w)}" height="${f(h - capH)}" fill="#ead8a6" stroke="${L}" stroke-width="${f(Math.max(1.2, w * 0.045))}"/>`;
      o += `<rect x="${f(cx + w * 0.1)}" y="${f(top + capH)}" width="${f(w * 0.4)}" height="${f(h - capH)}" fill="#c9ab6c" opacity=".55"/>`;
      o += `<g stroke="${L}" stroke-width="${f(Math.max(.7, w * 0.022))}" opacity=".7">` + [-0.25, 0.05, 0.3].map((k) => `<path d="M${f(cx + w * k)},${f(top + capH)} V${f(base)}"/>`).join('') + `</g>`;
      // 彩色環帶
      for (const [k, c] of [[0.0, '#b6402a'], [0.045, '#2c5d9c'], [0.09, '#3b7d58']]) o += `<rect x="${f(cx - w / 2)}" y="${f(top + capH + h * (0.04 + k))}" width="${f(w)}" height="${f(h * 0.04)}" fill="${c}" stroke="${L}" stroke-width=".8"/>`;
      // 柱頭：打開的紙莎草花（傘形）
      o += `<path d="M${f(cx - w * 0.5)},${f(top + capH)} Q${f(cx - capW * 0.52)},${f(top + capH * 0.35)} ${f(cx - capW / 2)},${f(top)} L${f(cx + capW / 2)},${f(top)} Q${f(cx + capW * 0.52)},${f(top + capH * 0.35)} ${f(cx + w * 0.5)},${f(top + capH)} Z" fill="#f1e2b4" stroke="${L}" stroke-width="${f(Math.max(1.2, w * 0.045))}"/>`;
      o += `<g stroke="${L}" stroke-width="${f(Math.max(.6, w * 0.02))}" fill="none">` + [-0.3, -0.15, 0, 0.15, 0.3].map((k) => `<path d="M${f(cx + k * capW * 0.9)},${f(top + 2)} Q${f(cx + k * capW * 0.55)},${f(top + capH * 0.6)} ${f(cx + k * w)},${f(top + capH)}"/>`).join('') + `</g>`;
      o += `<rect x="${f(cx - capW / 2 - 1)}" y="${f(top - h * 0.045)}" width="${f(capW + 2)}" height="${f(h * 0.05)}" fill="#e2b54c" stroke="${L}" stroke-width="${f(Math.max(1, w * 0.04))}"/>`;
      o += `<ellipse cx="${f(cx)}" cy="${f(base)}" rx="${f(w * 0.62)}" ry="${f(Math.max(2, w * 0.1))}" fill="#c4a86e" stroke="${L}" stroke-width="${f(Math.max(1, w * 0.04))}"/>`;
      return o;
    };
    const lint = (xa, xb, y, h) => `<rect x="${xa}" y="${y}" width="${f(xb - xa)}" height="${h}" fill="#d9c38e" stroke="${L}" stroke-width="1.6"/><rect x="${xa}" y="${f(y + h * 0.35)}" width="${f(xb - xa)}" height="${f(h * 0.3)}" fill="#2c5d9c" opacity=".9"/>`;
    // [深度 k, 底部 y, 高度, 寬度]
    const rows = [[0.17, 297, 56, 9.5], [0.26, 312, 86, 14], [0.4, 334, 132, 21], [0.62, 369, 205, 33], [1, 440, 300, 54]];
    for (const [k, base, h, w] of rows) {
      const dx = 250 - 215 * k;      // 從中軸到柱子的距離
      const cxL = 250 - dx, cxR = 250 + dx;
      if (k < 1) s += lint(cxL, cxR, base - h - h * 0.02, Math.max(5, h * 0.06));
      s += col(cxL, base, h, w) + col(cxR, base, h, w);
    }
    return s;
  };

  // ───────── 場地：冥河夜航 ─────────
  SCENES.duat = (card) => {
    let s = goldGround(W.x, W.y, W.w, W.h, 131);
    s += tint(uid('dA'), 250, 250, 240, '#27b59a', 0.4, 0.14);
    const cx = 250, cy = 240;
    // 十二個時辰的門：弧形排列
    for (let i = 0; i < 12; i++) {
      const a = Math.PI + (i + 0.5) / 12 * Math.PI, rr = 176, x = cx + Math.cos(a) * rr, y = 344 + Math.sin(a) * 196;
      s += `<g transform="translate(${f(x)},${f(y)}) rotate(${f((a - Math.PI * 1.5) * 57.3)})"><path d="M-9,8 V-6 Q-9,-12 0,-12 Q9,-12 9,-6 V8 Z" fill="#0d0907" stroke="${G}" stroke-width="1.3"/><path d="M-4,6 V-4 Q-4,-7 0,-7 Q4,-7 4,-4 V6 Z" fill="${i % 2 ? C.turq : C.rose}" opacity=".75"/></g>`;
    }
    // 光暈與日輪
    s += `<circle cx="${cx}" cy="${cy}" r="70" fill="none" stroke="${G}" stroke-width="1.2"/><circle cx="${cx}" cy="${cy}" r="64" fill="none" stroke="${G}" stroke-width=".8" stroke-dasharray="0.1 5" stroke-linecap="round"/>`;
    s += ringGlyphs(cx, cy, 54, Array(12).fill('N014'), 13, G);
    s += `<circle cx="${cx}" cy="${cy}" r="34" fill="url(#SUN)" stroke="${G}" stroke-width="2"/><circle cx="${cx}" cy="${cy}" r="25" fill="none" stroke="#ffd9a0" stroke-width=".9" stroke-dasharray="0.1 4" stroke-linecap="round" opacity=".85"/>`;
    // 冥河：波浪
    s += `<path d="M${W.x},316 H${W.x + W.w} V${W.y + W.h} H${W.x} Z" fill="#0b1513"/><g fill="none" stroke="${G}" stroke-width="1.2">`;
    for (let k = 0; k < 6; k++) { const y = 322 + k * 17; let d = `M${W.x},${y}`; for (let x = 0; x < 31; x++) d += ` q7,${x % 2 ? 4 : -4} 14,0`; s += `<path d="${d}" opacity="${f(0.85 - k * 0.1)}"/>`; }
    s += `</g>`;
    // 阿佩普：潛伏在河裡的混沌巨蛇
    const body = 'M-8,372 C40,340 70,396 118,364 C166,332 188,392 236,366 C284,340 300,392 346,360 C380,338 400,360 410,350';
    const head = `<g transform="translate(410,350) rotate(-18)"><path d="M0,-14 Q18,-18 32,-6 L48,-2 L32,6 Q16,16 0,12 Z" fill="#0d0907" stroke="${G}" stroke-width="1.6" stroke-linejoin="round"/><path d="M28,-1 L50,-2 L30,3" fill="${C.carn}"/><circle cx="14" cy="-5" r="2.4" fill="${C.turq}"/></g>`;
    s += `<path d="${body}" fill="none" stroke="${G}" stroke-width="17" stroke-linecap="round"/><path d="${body}" fill="none" stroke="#0d0907" stroke-width="13" stroke-linecap="round"/><path d="${body}" fill="none" stroke="${G}" stroke-width="1.3" stroke-dasharray="0.1 5" stroke-linecap="round"/>` + head;
    // 太陽船
    s += solarBoat(cx, 296, 1.05, G);
    s += `<path d="M${cx - 12},276 V250 M${cx + 12},276 V250" stroke="${G}" stroke-width="1.6"/>`;
    s += `<g stroke="${G}" stroke-width="1.2" fill="none" opacity=".85"><path d="M${cx - 60},286 L${cx - 60},262 M${cx + 52},286 L${cx + 52},258"/></g>`;
    s += glyphColumn(['N014', 'N001'], 82, 150, 24, G, 6).svg + glyphColumn(['N005', 'Z001'], 418, 150, 24, G, 6).svg;
    return s;
  };

  // ───────── 場地：尼羅河氾濫 ─────────
  function palm(x, gy, h, lean) {
    const tx = x + lean, ty = gy - h;
    let o = `<path d="M${x},${gy} Q${x + lean * 0.2},${f(gy - h * 0.5)} ${tx},${ty}" fill="none" stroke="${L}" stroke-width="7" stroke-linecap="round"/><path d="M${x},${gy} Q${x + lean * 0.2},${f(gy - h * 0.5)} ${tx},${ty}" fill="none" stroke="#9a6a3a" stroke-width="4" stroke-linecap="round"/>`;
    for (let i = 0; i < 8; i++) {
      const a = Math.PI * (1.05 + i * 0.13), lx = tx + Math.cos(a) * 30, ly = ty + Math.sin(a) * 18 + (i < 2 || i > 5 ? 14 : 0);
      o += `<path d="M${tx},${ty} Q${f((tx + lx) / 2)},${f(ty - 14 + Math.abs(i - 3.5) * 2)} ${f(lx)},${f(ly)}" fill="none" stroke="${L}" stroke-width="5.4" stroke-linecap="round"/><path d="M${tx},${ty} Q${f((tx + lx) / 2)},${f(ty - 14 + Math.abs(i - 3.5) * 2)} ${f(lx)},${f(ly)}" fill="none" stroke="#3b7d58" stroke-width="3" stroke-linecap="round"/>`;
    }
    return o + `<circle cx="${tx - 3}" cy="${ty + 4}" r="2.6" fill="#b6402a" stroke="${L}" stroke-width="1"/><circle cx="${tx + 3}" cy="${ty + 5}" r="2.6" fill="#b6402a" stroke="${L}" stroke-width="1"/>`;
  }
  function house(x, y, w, h) {
    return `<rect x="${x}" y="${y - h}" width="${w}" height="${h}" fill="#efe0b8" stroke="${L}" stroke-width="1.6"/><rect x="${f(x + w * .38)}" y="${f(y - h * .6)}" width="${f(w * .24)}" height="${f(h * .6)}" fill="#5a3a22" stroke="${L}" stroke-width="1.2"/><path d="M${x - 2},${y - h} H${x + w + 2}" stroke="${L}" stroke-width="2.4"/>`;
  }
  function skiff(x, y, k) {
    return `<g transform="translate(${x},${y}) scale(${k})"><path d="M-34,-12 Q-26,4 0,6 Q26,4 34,-12 Q22,-2 0,-2 Q-22,-2 -34,-12 Z" fill="#e2b54c" stroke="${L}" stroke-width="2" stroke-linejoin="round"/><path d="M-34,-12 Q-38,-20 -32,-22 M34,-12 Q38,-20 32,-22" fill="none" stroke="${L}" stroke-width="2"/><path d="M0,-2 V-34" stroke="${L}" stroke-width="2"/><path d="M0,-34 Q16,-30 14,-8 L0,-8 Z" fill="#f7f0dc" stroke="${L}" stroke-width="1.8"/><path d="M0,-26 H13 M0,-18 H14" stroke="#b6402a" stroke-width="1.8"/></g>`;
  }
  SCENES.inundation = (card) => {
    let s = papyrusGround(W.x, W.y, W.w, W.h, 83);
    // 天狼星（索普德特）：它在日出前出現，就是尼羅河要漲水的信號
    s += `<g><circle cx="250" cy="178" r="34" fill="#f4e0a8" opacity=".6"/>${sparkle(250, 178, 26, '#e2553a')}${sparkle(250, 178, 14, '#f7f0dc')}</g>`;
    s += `<path d="M250,152 V204" stroke="#b6402a" stroke-width="1.4" opacity=".5"/>`;
    // 遠處的沙漠山崖
    s += `<path d="M${W.x},262 Q70,236 110,246 Q150,236 190,252 Q250,232 310,250 Q360,236 410,248 Q440,244 ${W.x + W.w},256 V272 H${W.x} Z" fill="#d6a85e" stroke="${L}" stroke-width="2" stroke-linejoin="round"/>`;
    // 氾濫的河水
    s += `<rect x="${W.x}" y="270" width="${W.w}" height="${W.h - 170}" fill="#2f6aa6"/>`;
    s += `<g fill="none" stroke="#9cc8e0" stroke-width="1.6" opacity=".85">`;
    for (let k = 0; k < 8; k++) { const y = 282 + k * 17; let d = `M${W.x - 6 + (k % 2) * 7},${y}`; for (let x = 0; x < 34; x++) d += ` l7,${x % 2 ? 4 : -4}`; s += `<path d="${d}"/>`; }
    s += `</g><path d="M${W.x},270 H${W.x + W.w}" stroke="${L}" stroke-width="2"/>`;
    // 高地上的村子與棕櫚（洪水淹不到的小土丘）
    const mound = (cx, w) => `<path d="M${cx - w},304 Q${cx - w * 0.5},284 ${cx},284 Q${cx + w * 0.5},284 ${cx + w},304 Z" fill="#b99556" stroke="${L}" stroke-width="2"/>`;
    s += mound(112, 52) + house(86, 290, 22, 17) + house(114, 290, 20, 14) + palm(146, 292, 60, 8);
    s += mound(376, 56) + house(342, 290, 24, 18) + house(372, 290, 22, 15) + palm(404, 292, 66, -10);
    s += skiff(244, 322, 1.15) + skiff(176, 352, 0.8);
    // 近景：紙莎草與蓮花
    s += papyrusPlant(80, 410, 1) + papyrusPlant(424, 410, -1);
    for (const [x, y] of [[300, 372], [330, 392], [150, 388]]) s += `<g transform="translate(${x},${y})"><path d="M-12,0 Q-8,-14 0,-16 Q8,-14 12,0 Q0,5 -12,0 Z" fill="#f4e6c8" stroke="${L}" stroke-width="1.6"/><path d="M-6,-1 Q-4,-11 0,-14 Q4,-11 6,-1 Z" fill="#e0809a" stroke="${L}" stroke-width="1.2"/><ellipse cx="0" cy="3" rx="16" ry="3.5" fill="#3b7d58" stroke="${L}" stroke-width="1.4"/></g>`;
    return s;
  };
})();

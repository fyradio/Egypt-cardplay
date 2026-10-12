/* 對戰模擬用卡牌的插圖（第一批：神祇人形、木乃伊形）
 * 依賴 cardart.js 的 CardArt.kit。 */
(function () {
  'use strict';
  const K = window.CardArt.kit;
  const { f, C, MODE, W, GROUND, SCENES, glyphRow, glyphColumn, rowWidth, papyrusGround, goldGround, blockBand, lotusFrieze, papyrusPlant,
    strider, mummy, kneelingWinged, PART, gT, collar, head, ankh, sparkle, crescent, papyrusColumn, diamond } = K;
  const INK = '#1b1410', GOLD = 'url(#G)';
  const uid = (p) => p + K.nextId();
  K.B = K.B || {};

  // ───────── 共用背景 ─────────
  function groundStrip(col, y) {
    y = y || GROUND;
    return `<rect x="${W.x}" y="${y}" width="${W.w}" height="${W.y + W.h - y}" fill="${col}"/><path d="M${W.x},${y} H${W.x + W.w}" stroke="${INK}" stroke-width="2"/>` +
      `<rect x="${W.x}" y="${y + 9}" width="${W.w}" height="5" fill="${INK}"/><rect x="${W.x}" y="${y + 14}" width="${W.w}" height="${W.y + W.h - y - 14}" fill="#e2b54c" opacity=".9"/>`;
  }
  function templeBg(seed, bands, ground) {
    let s = papyrusGround(W.x, W.y, W.w, W.h, seed);
    s += blockBand(W.x, W.y, W.w, 9, bands || ['#2c5d9c', '#b6402a', '#3b7d58', '#e2b54c', '#b6402a']);
    s += lotusFrieze(W.x, W.y + 9, W.w, 15);
    return s + groundStrip(ground || '#b6402a');
  }
  function sunDisc(cx, cy, r, col) {
    let s = `<circle cx="${cx}" cy="${cy}" r="${r + 5}" fill="${INK}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${col}"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${r - 9}" fill="none" stroke="#e2b54c" stroke-width="2.4" opacity=".8"/>`;
    return s;
  }
  function desertBg(seed, sun, sunAt) {
    let s = papyrusGround(W.x, W.y, W.w, W.h, seed);
    s += blockBand(W.x, W.y, W.w, 9, ['#b6402a', '#e2b54c', '#2c5d9c', '#e2b54c']);
    const [sx, sy, sr] = sunAt || [370, 210, 56];
    s += `<g opacity=".8">${sunDisc(sx, sy, sr, sun || '#c8432a')}</g>`;
    // 兩層沙丘
    s += `<path d="M${W.x},330 Q110,290 180,318 T330,312 T${W.x + W.w},300 V${W.y + W.h} H${W.x} Z" fill="#dcae52" stroke="${INK}" stroke-width="1.6"/>`;
    s += `<path d="M${W.x},372 Q130,342 220,364 T${W.x + W.w},350 V${W.y + W.h} H${W.x} Z" fill="#c8902e" stroke="${INK}" stroke-width="1.6"/>`;
    s += `<g stroke="${INK}" stroke-width="1" opacity=".5" fill="none">${[0, 1, 2, 3].map((i) => `<path d="M${60 + i * 90},${392 + (i % 2) * 8} q18,-6 40,0"/>`).join('')}</g>`;
    return s + `<rect x="${W.x}" y="${GROUND + 9}" width="${W.w}" height="${W.y + W.h - GROUND - 9}" fill="#b6402a" opacity=".92"/><rect x="${W.x}" y="${GROUND + 9}" width="${W.w}" height="4" fill="${INK}"/>`;
  }
  function nileBg(seed) {
    let s = papyrusGround(W.x, W.y, W.w, W.h, seed);
    s += blockBand(W.x, W.y, W.w, 9, ['#2c5d9c', '#3b7d58', '#e2b54c', '#2c5d9c']);
    s += lotusFrieze(W.x, W.y + 9, W.w, 15);
    s += `<rect x="${W.x}" y="${GROUND - 4}" width="${W.w}" height="${W.y + W.h - GROUND + 4}" fill="#2c5d9c"/><path d="M${W.x},${GROUND - 4} H${W.x + W.w}" stroke="${INK}" stroke-width="2"/>`;
    s += `<g fill="none" stroke="#9fc4e6" stroke-width="2" opacity=".85">${Array.from({ length: 16 }, (_, i) => `<path d="M${W.x + 6 + i * 28},${GROUND + 8 + (i % 3) * 8} q7,-6 14,0 t14,0"/>`).join('')}</g>`;
    return s;
  }
  // 往 strider 輸出的最後一個 </g> 前塞入單位座標的圖形
  const inject = (svg, extra) => svg.replace(/<\/g>$/, extra + '</g>');

  // ───────── 荷魯斯 ─────────
  SCENES.horus = () => {
    const P = MODE.papyrus;
    let s = templeBg(61, ['#2c5d9c', '#e2b54c', '#b6402a', '#2c5d9c']);
    s += `<g opacity=".9">${sunDisc(376, 210, 40, '#c8432a')}</g>`;
    // （太陽圓盤）
    s += `<g stroke="${INK}" stroke-width="1.2">${[0, 1].map((i) => `<path d="M${W.x + 300 + i * 34},150 V${GROUND - 6}" opacity="0"/>`).join('')}</g>`;
    s += glyphColumn(['G005', 'D004'], 120, 150, 30, '#1b1714', 6).svg;
    s += glyphColumn(['V030', 'N001'], 440, 150, 28, '#1b1714', 6).svg;
    s += strider(P, 250, GROUND, 13, { head: 'falcon', crown: 'sun', backHold: 'ankh', frontHold: 'was', ankhFill: '#2c5d9c', beak: '#e2b54c' });
    return s;
  };

  // ───────── 法老 ─────────
  SCENES.pharaoh = () => {
    const P = MODE.papyrus;
    let s = templeBg(62, ['#e2b54c', '#2c5d9c', '#b6402a', '#e2b54c']);
    // 王名圈
    const cx = 392, y0 = 142;
    s += `<g stroke="${INK}" stroke-width="2.4" fill="#f2e7cc"><rect x="${cx - 30}" y="${y0}" width="60" height="200" rx="30"/><rect x="${cx - 21}" y="${y0 + 9}" width="42" height="182" rx="21" fill="#efdcaf" stroke-width="1.4"/><rect x="${cx - 40}" y="${y0 + 205 - 62}" width="10" height="0" opacity="0"/></g>`;
    s += `<rect x="${cx - 38}" y="${y0 + 160}" width="76" height="9" fill="#2c5d9c" stroke="${INK}" stroke-width="1.6"/>`;
    s += glyphColumn(['M023', 'X001', 'D021'], cx, y0 + 26, 26, '#1b1714', 8).svg;
    s += glyphColumn(['N005'], 112, 160, 38, '#c8432a', 6).svg;
    s += strider(P, 224, GROUND, 13, { head: 'human', beard: true, band: '#b6402a', backHold: 'ankh', frontHold: 'was', ankhFill: '#2c5d9c', staff: '#8a5a1c' });
    return s;
  };

  // ───────── 賽特 ─────────
  SCENES.set = () => {
    const P = MODE.papyrus;
    let s = desertBg(63, '#b6402a', [372, 200, 60]);
    // 風暴：斜的風沙線
    s += `<g stroke="#8d3f20" stroke-width="2" opacity=".5" fill="none">${Array.from({ length: 9 }, (_, i) => `<path d="M${50 + i * 46},${150 + (i % 3) * 22} q40,-10 90,6"/>`).join('')}</g>`;
    s += glyphColumn(['S029', 'X001'], 120, 150, 30, '#1b1714', 6).svg;
    s += strider(P, 250, GROUND, 13, { head: 'set', headFill: '#8d3f20', backHold: 'ankh', frontHold: 'was', ankhFill: '#b6402a', staff: '#5e3f22', skin: '#a8452a' });
    return s;
  };

  // ───────── 塞赫美特 ─────────
  SCENES.sekhmet = () => {
    const P = MODE.papyrus;
    let s = templeBg(64, ['#b6402a', '#e2b54c', '#b6402a', '#2c5d9c']);
    s += `<g opacity=".9">${sunDisc(366, 214, 54, '#c8432a')}</g>`;
    s += `<g stroke="#c8432a" stroke-width="2.4" opacity=".7">${Array.from({ length: 24 }, (_, i) => { const a = i / 24 * 6.2832; return `<path d="M${f(366 + Math.cos(a) * 66)},${f(214 + Math.sin(a) * 66)} L${f(366 + Math.cos(a) * (i % 2 ? 92 : 80))},${f(214 + Math.sin(a) * (i % 2 ? 92 : 80))}"/>`; }).join('')}</g>`;
    s += glyphColumn(['S042', 'D021', 'E015'], 118, 150, 30, '#1b1714', 6).svg;
    let fig = strider(P, 240, GROUND, 13, { head: 'lion', crown: 'sun', backHold: 'ankh', frontHold: 'ankhFwd', ankhFill: '#b6402a', apron: '#b6402a', headFill: '#dcae52', disk: '#c8432a' });
    s += fig;
    return s;
  };

  // ───────── 哈碧（尼羅河氾濫之神） ─────────
  SCENES.hapi = () => {
    const P = MODE.papyrus;
    const skin = '#3a8aa8';
    let s = nileBg(65);
    s += papyrusPlant(70, GROUND - 4, 1) + papyrusPlant(432, GROUND - 4, -1);
    const sw = f(P.sw / 12.5);
    let fig = strider(P, 236, GROUND - 6, 12.5, { head: 'human', crown: 'papyrus', skin, noCollar: false, frontHold: 'none', apron: '#e2b54c' });
    const tray = `<g stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round">` +
      `<path d="${PART.frontArmFwd}" fill="${skin}"/>` +
      `<rect x="4.4" y="-11.6" width="4.4" height=".38" fill="#8a5a1c"/><path d="M4.7,-11.2 V-9.6 M8.5,-11.2 V-9.6" stroke="#8a5a1c" stroke-width=".3"/>` +
      `<ellipse cx="5.6" cy="-12.05" rx=".8" ry=".45" fill="#dcae52"/><ellipse cx="6.9" cy="-12.1" rx=".8" ry=".42" fill="#dcae52"/>` +
      `<path d="M7.8,-11.7 Q8.4,-13 9.2,-12.3 Q8.6,-11.7 7.8,-11.7 Z" fill="#2c5d9c"/><path d="M8.7,-12.0 L9.5,-13.0" fill="none"/>` +
      `<path d="M4.6,-11.7 q0.6,-0.9 1.4,-0.5" fill="none"/>` +
      `<circle cx="7.4" cy="-12.45" r=".35" fill="#b6402a"/></g>`;
    fig = inject(fig, `<ellipse cx=".5" cy="-9.4" rx="1.75" ry="1.5" fill="${skin}" stroke="${INK}" stroke-width="${sw}"/><ellipse cx="1.55" cy="-12.9" rx=".85" ry=".7" fill="${skin}" stroke="${INK}" stroke-width="${sw}"/>` + tray);
    s += fig;
    s += glyphColumn(['N035', 'R004'], 120, 150, 28, '#1b1714', 6).svg;
    return s;
  };

  // ───────── 伊西斯 ─────────
  SCENES.isis = () => {
    const P = MODE.papyrus;
    let s = papyrusGround(W.x, W.y, W.w, W.h, 66);
    s += blockBand(W.x, W.y, W.w, 9, ['#2c5d9c', '#e2b54c', '#2c5d9c', '#b6402a']);
    s += lotusFrieze(W.x, W.y + 9, W.w, 15);
    const gy = 398;
    const t1 = ['Q001', 'X001', 'B001'], t2 = ['V030', 'X001', 'N001'];
    s += glyphRow(t1, W.x + 22, 172, 30, '#1b1714', 5).svg;
    s += glyphRow(t2, W.x + W.w - 22 - rowWidth(t2, 30, 5), 172, 30, '#1b1714', 5).svg;
    s += `<path d="M${W.x},${gy} H${W.x + W.w}" stroke="${INK}" stroke-width="2"/><rect x="${W.x}" y="${gy + 1}" width="${W.w}" height="${W.y + W.h - gy - 1}" fill="#2c5d9c" opacity=".9"/><rect x="${W.x}" y="${gy + 8}" width="${W.w}" height="4" fill="${INK}"/>`;
    s += kneelingWinged(P, 248, gy, 14.2, { crown: 'throne', band: P.gold });
    return s;
  };

  // ───────── 木乃伊形人物（奧西里斯、孔蘇共用） ─────────
  function mummiform(P, cx, gy, s, o) {
    const sw = f(P.sw / s), L = P.line, st = `stroke="${L}" stroke-width="${sw}" stroke-linejoin="round"`;
    const gold = P === MODE.gold;
    const body = 'M-1.95,-15.9 Q-2.3,-12.2 -1.98,-6.2 Q-1.86,-2.6 -1.55,0 L2.62,0 Q2.75,-0.95 2.1,-1.65 Q1.62,-3.1 1.62,-6.1 Q1.78,-9.2 2.22,-12.1 Q2.48,-14.0 1.62,-15.5 L0.6,-16.0 Z';
    const id = uid('mf');
    let g = `<g ${gT(cx, gy, s)}>`;
    g += `<path d="${body}" fill="${o.wrap || '#f2e7cc'}" ${st}/>`;
    g += `<clipPath id="${id}"><path d="${body}"/></clipPath><g clip-path="url(#${id})" stroke="${o.wrapLine || '#b9a67c'}" stroke-width="${f(sw * 0.7)}" fill="none">`;
    for (let y = -1; y > -15.5; y -= 0.78) g += `<path d="M-3,${f(y)} L4,${f(y - 0.35)}"/>`;
    g += `</g><path d="${body}" fill="none" ${st}/>`;
    g += collar(P, s, -14.35, 2.1);
    // 交叉的雙臂與權杖（彎鉤在左、連枷在右，兩根都立在身側，避開臉）
    const rodCol = gold ? C.gold : '#e2b54c';
    g += `<path d="M-1.2,-12.2 L-2.7,-19.0 Q-2.9,-19.9 -3.8,-19.8 Q-4.4,-19.5 -4.2,-18.8" fill="none" stroke="${L}" stroke-width="${f(0.38)}" stroke-linecap="round"/>`;
    g += `<path d="M-1.2,-12.2 L-2.7,-19.0 Q-2.9,-19.9 -3.8,-19.8 Q-4.4,-19.5 -4.2,-18.8" fill="none" stroke="${rodCol}" stroke-width="${f(0.38 - sw * 2)}" stroke-linecap="round" stroke-dasharray="0.55 0.2"/>`;
    g += `<path d="M1.5,-12.2 L3.7,-17.2" fill="none" stroke="${L}" stroke-width="${f(0.38)}" stroke-linecap="round"/><path d="M1.5,-12.2 L3.7,-17.2" fill="none" stroke="${rodCol}" stroke-width="${f(0.38 - sw * 2)}" stroke-linecap="round"/>`;
    for (const [dx, dy] of [[0.9, 0.2], [1.5, 0.8], [1.8, 1.6]]) g += `<path d="M3.7,-17.2 L${f(3.7 + dx)},${f(-17.2 + dy)}" stroke="${L}" stroke-width="${f(0.14)}"/><circle cx="${f(3.7 + dx)}" cy="${f(-17.2 + dy)}" r=".24" fill="${rodCol}" stroke="${L}" stroke-width="${f(sw * 0.7)}"/>`;
    g += `<path d="M-1.7,-12.9 Q0,-12.1 1.8,-12.9 L1.8,-11.7 Q0,-10.9 -1.7,-11.7 Z" fill="${o.skin}" ${st}/>`;
    g += `<g transform="translate(0,1.8)">${head(P, s, o.head, 0, o.skin)}</g>`;
    return g + '</g>';
  }
  K.B.mummiform = mummiform;

  SCENES.khonsu = () => {
    const P = MODE.papyrus;
    let s = templeBg(67, ['#2c5d9c', '#e2b54c', '#2c5d9c', '#b6402a'], '#2c5d9c');
    // 夜空與月
    s += `<rect x="${W.x}" y="${W.y + 24}" width="${W.w}" height="130" fill="#1d2f5c" opacity=".9"/>`;
    for (let i = 0; i < 22; i++) s += sparkle(W.x + 20 + ((i * 97) % 400), W.y + 36 + ((i * 53) % 110), 3 + (i % 3), '#f2d77e');
    s += `<g transform="translate(366,214)"><circle r="46" fill="#e9e1c8" stroke="${INK}" stroke-width="2.4"/><circle cx="14" cy="-6" r="40" fill="#1d2f5c" opacity=".0"/><g fill="#cfc7ad" opacity=".7"><circle cx="-14" cy="-10" r="8"/><circle cx="12" cy="14" r="11"/><circle cx="-6" cy="22" r="5"/></g></g>`;
    s += `<rect x="${W.x}" y="${W.y + 154}" width="${W.w}" height="6" fill="${INK}"/>`;
    s += glyphColumn(['N011', 'N014'], 118, 190, 28, '#f2d77e', 6).svg;
    s += mummiform(P, 232, GROUND, 13.5, { skin: '#6f93b5', head: { head: 'human', crown: 'lunar', moon: '#e9e1c8', moonDisk: '#f6f0dc', sidelock: true, beard: true, beardFill: '#2c5d9c' } });
    return s;
  };
  SCENES.osiris = () => {
    const P = MODE.gold;
    let s = goldGround(W.x, W.y, W.w, W.h, 68);
    s += `<g fill="none" stroke="url(#G)" stroke-width="1.3"><path d="M92,${GROUND} V196 A158,96 0 0 1 408,196 V${GROUND}"/><path d="M102,${GROUND} V198 A148,88 0 0 1 398,198 V${GROUND}" stroke-dasharray="1.5 4"/></g>`;
    s += papyrusColumn(60, 168, GROUND, 15, 'url(#G)', C.turq) + papyrusColumn(440, 168, GROUND, 15, 'url(#G)', C.turq);
    s += `<g fill="#15100d" stroke="url(#G)" stroke-width="1.3"><path d="M120,${GROUND} H380 V${GROUND + 10} H120 Z"/><path d="M104,${GROUND + 10} H396 V${GROUND + 22} H104 Z"/></g>`;
    for (let i = 0; i < 14; i++) s += diamond(128 + i * 19, GROUND + 5, 3, 3, i % 2 ? C.turq : C.rose, 'none', 0);
    s += `<g stroke="url(#G)" stroke-width="1"><path d="M323,206 V380 M351,206 V380 M379,206 V380"/></g>`;
    s += glyphColumn(['Q001', 'D004', 'B001'], 337, 212, 22, 'url(#G)', 5).svg;
    s += glyphColumn(['S038', 'S045'], 365, 212, 22, 'url(#G)', 8).svg;
    s += `<g opacity=".55">${[0, 1, 2, 3, 4, 5, 6].map((i) => `<path d="M${120 + i * 6},${GROUND} V${300 - i * 8}" stroke="${C.turq}" stroke-width="1" opacity=".0"/>`).join('')}</g>`;
    s += mummiform(P, 214, GROUND, 11.8, { skin: '#12261f', wrap: '#171210', wrapLine: C.gold, head: { head: 'human', crown: 'atef', beard: true, beardFill: '#0f1d18', atef: '#171210' } });
    // 綠色的光：皮膚用松石綠暈
    s += `<circle cx="214" cy="236" r="60" fill="${C.turq}" opacity=".08"/>`;
    return s;
  };

  // ───────── 木乃伊戰士 ─────────
  SCENES.mummy = () => {
    const P = MODE.papyrus;
    let s = templeBg(69, ['#2c5d9c', '#e2b54c', '#3b7d58', '#b6402a']);
    s += glyphColumn(['D028', 'X001'], 122, 150, 30, '#1b1714', 6).svg;
    s += mummy(P, 232, GROUND, 13);
    // 長矛與盾
    s += `<path d="M338,${GROUND - 2} V150" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><path d="M338,${GROUND - 2} V150" stroke="#8a5a30" stroke-width="3.6" stroke-linecap="round"/>`;
    s += `<path d="M338,118 Q350,138 338,158 Q326,138 338,118 Z" fill="#dcae52" stroke="${INK}" stroke-width="2"/><path d="M338,128 V152" stroke="${INK}" stroke-width="1"/>`;
    s += `<g transform="translate(150,300)"><path d="M0,-72 Q36,-72 36,-30 Q36,24 0,40 Q-36,24 -36,-30 Q-36,-72 0,-72 Z" fill="#b6402a" stroke="${INK}" stroke-width="2.4"/><path d="M0,-72 V40 M-36,-18 H36" stroke="#e2b54c" stroke-width="3"/><circle cx="0" cy="-18" r="9" fill="#e2b54c" stroke="${INK}" stroke-width="2"/></g>`;
    return s;
  };
  Object.assign(K.B, { templeBg, desertBg, nileBg, groundStrip, sunDisc, inject, INK });
})();

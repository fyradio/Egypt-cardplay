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


  Object.assign(K.B, { templeBg, desertBg, nileBg, groundStrip, sunDisc, inject, INK });
})();

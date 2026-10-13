/* 卡圖 v2：每張卡獨立構圖、單張手工繪製。
 * 標準：主角佔滿畫面、有視角與姿態、固定光源（亮面／暗面／逆光邊）、背景有遠近層次。
 * 依賴 cardart.js（CardArt.kit）。載入順序在其他 cardart-*.js 之後，會覆蓋同名場景。 */
(function () {
  'use strict';
  const K = window.CardArt.kit;
  const { f, W, SCENES } = K;
  const uid = (p) => p + K.nextId();

  // ───────── 共用工具 ─────────
  const LN = '#2e1c10';                       // 描線：深咖啡，不用純黑
  const stops = (arr) => arr.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a == null ? '' : ` stop-opacity="${a}"`}/>`).join('');
  const lin = (id, x1, y1, x2, y2, s) => `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops(s)}</linearGradient>`;
  const rad = (id, cx, cy, r, s) => `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${r}">${stops(s)}</radialGradient>`;
  // 把 inner 限制在 d 形狀裡（明暗分面用）
  const within = (d, inner) => { const id = uid('cl'); return `<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})">${inner}</g>`; };
  const path = (d, fill, sw, extra) => `<path d="${d}" fill="${fill}"${sw ? ` stroke="${LN}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"` : ''}${extra ? ' ' + extra : ''}/>`;
  const line = (d, col, w, extra) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra ? ' ' + extra : ''}/>`;
  // 三次貝茲取樣
  const bz = (s, t) => { const u = 1 - t; return [0, 1].map((k) => u * u * u * s[0][k] + 3 * u * u * t * s[1][k] + 3 * u * t * t * s[2][k] + t * t * t * s[3][k]); };
  const sample = (segs, n) => { const pts = []; segs.forEach((s, j) => { for (let i = j ? 1 : 0; i <= n; i++) pts.push(bz(s, i / n)); }); return pts; };
  const poly = (pts) => 'M' + pts.map((p) => f(p[0]) + ',' + f(p[1])).join(' L');
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  // 在兩條同參數曲線之間畫出帶狀（寬領圈用）
  const band = (O, I, t0, t1) => { const a = O.map((p, i) => mix(p, I[i], t0)), b = O.map((p, i) => mix(p, I[i], t1)).reverse(); return poly(a.concat(b)) + ' Z'; };
  const X0 = W.x, Y0 = W.y, X1 = W.x + W.w, Y1 = W.y + W.h;

  // ───────── 母獅戰士 ─────────
  // （卡通版，保留作參考）
  SCENES.lionessToon = () => {
    const id = { sky: uid('sk'), sun: uid('sn'), glow: uid('gl'), fur: uid('fu'), furD: uid('fd'), gold: uid('go'), iris: uid('ir'), dune: uid('du'), rock: uid('rk'), vig: uid('vg'), haze: uid('hz'), blur: uid('bl'), soft: uid('sf') };
    const FUR = `url(#${id.fur})`, GOLD = `url(#${id.gold})`;
    const FL = '#f0c97e', FM = '#d9a457', FD = '#a86c34', FDD = '#7c4a22', CR = '#f6e8c8', CRD = '#dcc49a', RIM = '#fff2c6';
    let s = '<defs>';
    s += lin(id.sky, 0, Y0, 0, 330, [[0, '#2f2a55'], [.35, '#8a3a4a'], [.7, '#e07a45'], [1, '#f7c46e']]);
    s += rad(id.glow, 406, 170, 230, [[0, '#fff3c0', .95], [.18, '#ffd27a', .7], [.5, '#f29a4a', .25], [1, '#f29a4a', 0]]);
    s += rad(id.sun, 406, 170, 40, [[0, '#fffbe8'], [.7, '#ffe6a0'], [1, '#ffc860']]);
    s += lin(id.fur, 0, 130, 0, 420, [[0, FL], [.45, FM], [1, '#c48a44']]);
    s += lin(id.gold, 0, 270, 0, 340, [[0, '#fff3c0'], [.35, '#eac65c'], [1, '#a8781a']]);
    s += `<radialGradient id="${id.iris}" cx=".45" cy=".42" r=".6">${stops([[0, '#ffe590'], [.55, '#eaa82c'], [1, '#93530f']])}</radialGradient>`;
    s += lin(id.dune, 0, 290, 0, 420, [[0, '#e9a868'], [1, '#b06838']]);
    s += lin(id.rock, 0, 380, 0, 420, [[0, '#8a5232'], [1, '#4a2a1c']]);
    s += rad(id.vig, 250, 260, 300, [[0, '#000', 0], [.65, '#000', 0], [1, '#1a0a05', .55]]);
    s += lin(id.haze, 0, 270, 0, 330, [[0, '#ffd8a0', 0], [.6, '#ffd8a0', .45], [1, '#ffd8a0', 0]]);
    s += `<filter id="${id.blur}" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="6"/></filter>`;
    s += `<filter id="${id.soft}" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.6"/></filter>`;
    s += '</defs>';

    // ── 天空與太陽 ──
    s += `<rect x="${X0}" y="${Y0}" width="${W.w}" height="${W.h}" fill="url(#${id.sky})"/>`;
    s += `<circle cx="406" cy="170" r="230" fill="url(#${id.glow})"/>`;
    // 光芒
    s += `<g opacity=".22" filter="url(#${id.blur})" fill="#fff4cc">${[176, 156, 136, 116, 96, 72, 50, 28].map((a) => { const r1 = a * Math.PI / 180, w = .07; return `<path d="M406,170 L${f(406 + Math.cos(r1 - w) * 460)},${f(170 + Math.sin(r1 - w) * 460)} L${f(406 + Math.cos(r1 + w) * 460)},${f(170 + Math.sin(r1 + w) * 460)} Z"/>`; }).join('')}</g>`;
    s += `<circle cx="406" cy="170" r="58" fill="#fff4c8" opacity=".35" filter="url(#${id.blur})"/><circle cx="406" cy="170" r="40" fill="url(#${id.sun})"/><circle cx="406" cy="170" r="47" fill="none" stroke="#fff2c0" stroke-width="1.4" opacity=".6"/>`;
    // 薄雲
    s += `<g fill="#f7b98a" opacity=".35"><path d="M${X0},178 C90,170 150,176 210,172 C170,182 110,184 ${X0},190 Z"/><path d="M250,150 C300,144 360,148 420,142 C380,154 300,158 250,150 Z"/></g>`;

    // ── 遠景：金字塔與神殿塔門（被霧氣吃掉一半） ──
    const far = '#c47a5e', farL = '#e8a77a';
    s += `<g opacity=".8">`;
    s += path('M44,302 L118,228 L192,302 Z', far) + path('M118,228 L192,302 L150,302 Z', farL, 0, 'opacity=".85"');
    s += path('M176,302 L214,264 L252,302 Z', far) + path('M214,264 L252,302 L230,302 Z', farL, 0, 'opacity=".85"');
    s += `</g>`;
    s += `<rect x="${X0}" y="270" width="${W.w}" height="60" fill="url(#${id.haze})"/>`;

    // ── 中景沙丘 ──
    s += path(`M${X0},306 C90,292 150,300 210,298 C280,296 340,288 400,294 C430,297 450,300 ${X1},298 L${X1},${Y1} L${X0},${Y1} Z`, `url(#${id.dune})`);
    s += path(`M${X0},334 C70,322 120,326 170,332 C230,340 300,326 360,330 C410,334 440,328 ${X1},326 L${X1},${Y1} L${X0},${Y1} Z`, '#c27a42', 0, 'opacity=".9"');
    s += line(`M${X0},334 C70,322 120,326 170,332 C230,340 300,326 360,330 C410,334 440,328 ${X1},326`, '#ffd9a0', 2, 'opacity=".55"');
    s += line('M60,352 C90,346 120,348 150,354 M300,348 C330,342 360,344 390,350', '#a85e30', 1.6, 'opacity=".6"');

    // ── 母獅 ──
    let L = '';
    // 遠側後腿（右邊、隱在暗處）
    const hind = 'M398,300 L474,300 L474,340 C467,352 465,366 460,378 C457,388 455,396 453,402 L429,402 C429,388 424,366 412,340 C406,326 400,312 398,300 Z';
    L += path(hind, FUR, 3);
    L += within(hind, path('M440,330 C452,360 450,390 446,410 L480,410 L480,330 Z', FD, 0, 'opacity=".5"'));
    L += path('M422,398 C416,403 416,410 422,413 C426,415 431,415 435,413 C439,415 444,415 448,413 C456,410 458,403 452,397 Z', '#a8743a', 2.4);
    // 遠側前腿（左邊，踏在較高的石階上）
    const farLeg = 'M200,298 C192,322 186,342 184,360 C183,368 182,372 180,376 L218,376 C220,366 224,348 230,330 C234,316 232,304 228,296 Z';
    L += path(farLeg, '#c08a48', 0);
    L += line('M196,312 C190,332 186,348 184,360 C183,368 182,372 180,376 M218,376 C220,366 224,348 230,330', LN, 3);
    L += within(farLeg, path('M180,300 L206,300 C204,330 200,360 200,380 L180,380 Z', FD, 0, 'opacity=".5"'));
    // 軀幹與頸
    const body = 'M262,152 C312,148 350,170 370,198 C390,222 426,226 470,226 L470,350 C462,348 454,346 446,342 C432,330 416,326 400,330 C380,336 360,344 340,348 C332,350 326,352 322,354 L296,336 C262,330 226,318 198,298 C214,250 236,196 262,152 Z';
    L += path(body, FUR, 3);
    L += within(body,
      // 腹側陰影、頸下陰影
      path('M290,316 C340,330 380,316 420,306 C440,302 460,306 480,312 L480,370 L290,370 Z', FD, 0, 'opacity=".55"') + line('M392,312 C410,304 430,304 448,312', '#fff0c8', 2, 'opacity=".35"') +
      path('M200,280 C240,300 290,300 320,282 C326,300 320,330 300,350 L196,330 Z', FD, 0, 'opacity=".35"') +
      // 肩胛的亮面
      path('M318,200 C344,214 356,242 350,276 C340,262 326,240 312,226 Z', FL, 0, 'opacity=".6"') +
      // 背上的逆光
      line('M262,150 C312,146 350,168 370,196 C390,220 426,224 474,224', RIM, 8, 'opacity=".9"') +
      line('M262,150 C312,146 350,168 370,196 C390,220 426,224 474,224', '#fff', 2.4, 'opacity=".7"')
    );
    L += line('M334,240 C348,262 350,290 340,314', FD, 2, 'opacity=".7"');            // 肩胛輪廓
    L += line('M384,236 C392,262 394,296 388,330', FD, 1.6, 'opacity=".45"');          // 肋
    L += line('M424,236 C454,252 468,292 458,340', FD, 2, 'opacity=".6"');              // 後腿的大腿
    L += `<g opacity=".55">${[[300, 196, 16, 22], [318, 212, 14, 24], [356, 232, 12, 20], [404, 246, 10, 18], [430, 252, 10, 16], [290, 240, 10, 22], [376, 280, 12, 26]].map(([x, y, dx, dy]) => line(`M${x},${y} q${dx / 2},${dy / 2} ${dx / 4},${dy}`, FD, 1.4)).join('')}</g>`;
    // 胸前淡色的毛
    const chest = 'M206,296 C222,308 248,314 270,308 C284,318 296,332 298,352 C286,364 262,370 242,368 C226,366 216,358 212,348 C206,332 204,312 206,296 Z';
    L += path(chest, CRD, 0, 'opacity=".55"');
    L += `<g opacity=".5">${[[226, 322], [240, 330], [256, 326], [270, 336], [234, 346], [252, 350], [280, 348]].map(([x, y]) => line(`M${x},${y} q3,7 0,13`, '#b89a6a', 1.4)).join('')}</g>`;
    // 近側前腿
    const nearLeg = 'M300,300 C294,322 290,350 290,372 C290,382 290,388 288,394 L328,394 C328,384 330,372 334,352 C340,328 348,306 344,286 Z';
    L += path(nearLeg, FUR, 0);
    L += within(nearLeg, path('M320,290 C336,320 334,360 326,400 L360,400 L360,280 Z', FD, 0, 'opacity=".55"') + line('M344,284 C348,306 340,330 334,352', RIM, 5, 'opacity=".7"'));
    L += line('M300,328 C302,346 300,362 298,376', FD, 1.6, 'opacity=".6"');
    L += line('M291,336 C290,352 290,362 290,372 C290,382 290,388 288,394 M328,394 C328,384 330,372 334,352 C338,336 342,322 342,310', LN, 3);
    // 金護腕
    L += path('M290,348 C302,355 320,355 332,346 L330,364 C318,373 302,373 290,366 Z', GOLD, 2.4);
    L += line('M291,357 C303,363 319,363 331,355', '#2a4f9a', 3);
    L += `<g fill="#b8432a" stroke="${LN}" stroke-width="1">${[296, 306, 316, 326].map((x, i) => `<circle cx="${x}" cy="${357 + (i === 0 || i === 3 ? -1 : 2)}" r="2.2"/>`).join('')}</g>`;
    // 腳掌（近側）
    L += path('M282,390 C275,397 274,407 281,412 C285,415 292,415 296,412 C300,415 306,415 310,412 C314,415 320,415 324,412 C333,409 336,399 330,390 Z', FM, 3);
    L += line('M296,404 L296,412 M310,404 L310,412', LN, 2);
    L += line('M286,392 C298,388 316,388 328,392', FL, 2.4, 'opacity=".8"');
    // 腳掌（遠側）
    L += path('M178,372 C171,378 170,388 177,391 C181,393 186,393 190,391 C194,393 199,393 203,391 C207,393 212,393 215,390 C221,386 222,378 217,371 Z', '#c08a48', 3);
    L += line('M190,385 L190,391 M203,385 L203,391', LN, 1.8);

    // 下巴投在頸上的影子
    L += `<ellipse cx="262" cy="300" rx="62" ry="18" fill="${FDD}" opacity=".35" filter="url(#${id.blur})"/>`;
    // 頸與肩的毛流
    L += `<g opacity=".5">${[[270, 176], [282, 190], [296, 206], [262, 214], [276, 228], [292, 246], [310, 262], [256, 250], [272, 266]].map(([x, y]) => line(`M${x},${y} q8,6 10,16`, FD, 1.3)).join('')}${[[328, 184], [348, 200], [372, 214], [400, 222], [430, 228]].map(([x, y]) => line(`M${x},${y} q5,2 9,8`, '#fff0c8', 1.3)).join('')}</g>`;
    // 寬領圈（繞在頸根）
    const O = sample([[[198, 300], [210, 326], [240, 346], [270, 344]], [[270, 344], [300, 342], [328, 318], [340, 288]]], 16);
    const I = sample([[[214, 292], [226, 312], [248, 324], [270, 322]], [[270, 322], [294, 320], [316, 302], [324, 278]]], 16);
    L += `<path d="${poly(O.map((p) => [p[0], p[1] + 9]))}" fill="none" stroke="${FDD}" stroke-width="10" opacity=".4" filter="url(#${id.soft})"/>`;
    L += path(band(O, I, 0, 1), GOLD, 3);
    L += path(band(O, I, .2, .42), '#2a4f9a', 0);
    L += path(band(O, I, .62, .8), '#b8432a', 0);
    for (const t of [.2, .42, .62, .8]) L += line(poly(O.map((p, i) => mix(p, I[i], t))), LN, 1.2, 'opacity=".8"');
    L += `<g fill="#46b3a5" stroke="${LN}" stroke-width=".8">${O.filter((_, i) => i % 2 === 0).map((p, i) => { const q = mix(p, I[i * 2], .52); return `<circle cx="${f(q[0])}" cy="${f(q[1])}" r="2.4"/>`; }).join('')}</g>`;
    // 外緣的垂珠
    L += `<g>${O.filter((_, i) => i % 2 === 1).map((p, k) => { const i = k * 2 + 1, q = I[i], dx = p[0] - q[0], dy = p[1] - q[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l; const tip = [p[0] + ux * 13, p[1] + uy * 13]; return `<path d="M${f(p[0] - uy * 4)},${f(p[1] + ux * 4)} Q${f(tip[0] - uy * 5)},${f(tip[1] + ux * 5)} ${f(tip[0])},${f(tip[1])} Q${f(tip[0] + uy * 5)},${f(tip[1] - ux * 5)} ${f(p[0] + uy * 4)},${f(p[1] - ux * 4)} Z" fill="${k % 2 ? '#b8432a' : '#2a4f9a'}" stroke="${LN}" stroke-width="1.2"/>`; }).join('')}</g>`;
    L += line(poly(O.slice(0, 18)), '#fff6d0', 1.6, 'opacity=".7"');
    // 胸前的日輪墜飾
    { const c = O[16]; L += `<circle cx="${f(c[0])}" cy="${f(c[1] + 12)}" r="12" fill="${GOLD}" stroke="${LN}" stroke-width="2.4"/><circle cx="${f(c[0])}" cy="${f(c[1] + 12)}" r="7" fill="#c8432a" stroke="${LN}" stroke-width="1.4"/><circle cx="${f(c[0] - 2.5)}" cy="${f(c[1] + 9)}" r="2.2" fill="#ffb08a"/>`; }

    // ── 頭 ──（整顆頭略縮小、抬高，讓頸部露出來）
    L += '<g transform="translate(6,-12) translate(250,230) scale(.9) translate(-250,-230)">';
    // 遠側的耳朵（小而圓，大半藏在額頭後）
    const earF = 'M198,162 C192,148 196,134 206,131 C215,130 219,141 218,152 C211,154 204,158 198,162 Z';
    L += path(earF, '#c08a48', 3);
    L += path('M203,153 C201,144 203,138 207,137 C212,137 213,143 213,149 Z', '#e8c9a0', 0);
    L += line('M206,131 C215,130 219,141 218,152', '#3a2414', 4);
    // 近側的耳朵
    const earN = 'M272,154 C274,138 286,127 298,131 C309,136 311,153 307,170 C296,165 284,159 272,154 Z';
    L += path(earN, FUR, 3);
    const earNi = 'M280,152 C283,142 291,136 298,140 C302,148 302,158 300,164 C293,160 286,156 280,152 Z';
    L += path(earNi, '#e8c9a0', 0);
    L += within(earNi, path('M276,156 C286,146 298,146 306,164 L306,172 L276,172 Z', '#b98a62', 0, 'opacity=".7"'));
    L += line('M285,151 q5,-7 9,-10 M289,155 q5,-5 11,-7', '#fff4dc', 1.2, 'opacity=".8"');
    L += line('M298,131 C309,136 311,153 307,170', '#3a2414', 4.4);
    L += line('M299,134 C307,140 308,152 305,164', RIM, 1.6, 'opacity=".8"');
    // 臉的外形：長而寬的口鼻
    const head = 'M220,146 C236,138 262,138 280,150 C298,164 308,190 310,214 C312,240 306,262 294,280 C280,300 256,314 232,318 C214,320 198,314 188,304 C176,292 168,280 165,268 C160,256 160,244 164,236 C168,226 174,214 180,202 C184,190 186,180 190,170 C196,158 206,150 220,146 Z';
    L += path(head, FUR, 0);
    L += within(head,
      // 遠側的臉在暗面
      path('M150,140 L212,140 C214,176 206,208 194,232 C184,252 180,282 190,330 L150,330 Z', FD, 0, 'opacity=".42"') +
      // 近側顴骨下的陰影
      path('M256,236 C274,232 294,238 312,226 L316,320 L240,326 C254,300 262,270 256,236 Z', FD, 0, 'opacity=".3"') +
      // 壓低的眉骨：讓眼神有力
      path('M220,180 C236,168 262,166 280,176 L280,190 C264,182 244,182 226,194 Z', FD, 0, 'opacity=".38"') +
      path('M182,178 C190,172 202,172 212,178 L212,190 C202,184 192,184 182,190 Z', FD, 0, 'opacity=".35"') +
      // 額頭亮面
      path('M220,150 C238,142 262,144 276,156 C262,160 240,164 226,170 C218,164 216,156 220,150 Z', FL, 0, 'opacity=".7"') +
      // 逆光邊
      line('M280,150 C298,164 308,190 310,214 C312,240 306,262 294,280', RIM, 7, 'opacity=".95"') +
      line('M220,146 C236,138 262,138 280,150', RIM, 5, 'opacity=".6"')
    );
    // 鼻樑亮面（長）
    L += path('M216,178 C222,198 216,222 202,238 C194,244 182,242 176,236 C186,218 200,198 216,178 Z', FL, 0, 'opacity=".75"');
    L += line('M208,196 C204,212 196,226 186,236', FD, 1.4, 'opacity=".5"');
    // 額頭的斑紋
    L += `<g opacity=".7">${line('M232,166 q2,-8 0,-14 M240,164 q3,-8 2,-15 M248,166 q4,-7 4,-13', FD, 1.6)}</g>`;
    // 口鼻：鬍鬚墊、下巴
    const padN = 'M184,256 C198,248 226,250 240,262 C250,274 244,290 228,294 C208,298 190,290 182,278 Z';
    const padF = 'M164,256 C170,252 182,254 186,262 C188,272 182,282 172,282 C164,280 160,268 164,256 Z';
    const chin = 'M198,298 C212,296 236,298 248,306 C242,316 224,320 210,318 C200,314 196,306 198,298 Z';
    L += path(chin, CRD, 0) + path(padF, CRD, 0) + path(padN, CR, 0);
    L += within(padN, path('M232,250 C252,272 248,298 220,302 L256,302 L256,250 Z', CRD, 0, 'opacity=".9"'));
    L += `<g fill="${FDD}">${[[198, 270], [207, 266], [216, 270], [203, 278], [212, 276], [221, 280], [174, 266], [170, 273]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.7"/>`).join('')}</g>`;
    // 鬍鬚
    L += `<g opacity=".85">${line('M222,276 C250,272 276,276 302,286 M224,282 C250,282 272,290 292,302 M220,270 C246,264 270,264 298,270', '#fffaf0', 1.1)}${line('M168,272 C150,272 134,276 120,282 M168,278 C152,282 140,288 128,296', '#fffaf0', 1.1)}</g>`;
    // 鼻子
    L += path('M164,238 C172,230 194,230 203,238 C201,250 191,258 184,260 C177,259 166,250 164,238 Z', '#8a4a3c', 2.6);
    L += path('M171,238 C179,234 191,234 198,238 C191,241 179,241 171,238 Z', '#c98a78', 0, 'opacity=".8"');
    L += line('M168,246 q4,4 9,5 M200,246 q-3,5 -9,6', LN, 1.8);
    // 嘴（閉著，嘴角平而略往下）
    L += line('M184,260 L184,276', LN, 2.2);
    L += line('M184,276 C196,288 218,293 240,291 C252,290 260,291 268,295', LN, 2.8);
    L += line('M184,276 C178,282 170,284 164,282', LN, 2.4);
    // 眼睛：近側
    const eyeN = 'M228,196 C238,186 254,180 266,184 C258,196 242,202 228,196 Z';
    L += path('M226,201 C238,211 256,208 268,192 C266,204 252,217 234,215 Z', CR, 0, 'opacity=".95"');   // 眼下白毛
    L += within(eyeN, `<circle cx="248" cy="190" r="13" fill="url(#${id.iris})"/><circle cx="248" cy="190" r="12" fill="none" stroke="#8a4a10" stroke-width="2"/><circle cx="247" cy="190" r="5.2" fill="#120804"/><circle cx="251" cy="187" r="2" fill="#fff"/><path d="M224,180 C240,178 256,178 270,180 L270,189 C254,186 240,188 224,192 Z" fill="${LN}" opacity=".4"/>`);
    L += path(eyeN, 'none', 2);
    L += line('M228,196 C238,186 254,180 266,184 L273,182', LN, 3.8);
    L += line('M228,196 C238,201 252,198 262,190', LN, 1.6);
    L += line('M228,196 C222,206 216,216 210,228', LN, 2.6);                       // 淚線
    L += line('M224,180 C238,170 256,168 272,174', FDD, 2.6, 'opacity=".7"');          // 眉骨
    // 眼睛：遠側（透視縮短）
    const eyeF = 'M210,194 C205,185 194,181 185,184 C191,193 201,197 210,194 Z';
    L += path('M211,198 C203,205 191,203 183,192 C187,204 197,209 207,207 Z', CR, 0, 'opacity=".9"');
    L += within(eyeF, `<circle cx="199" cy="189" r="9" fill="#e0a02e"/><circle cx="199" cy="189" r="8.5" fill="none" stroke="#9a5a12" stroke-width="3"/><circle cx="200" cy="189" r="4" fill="#120804"/><circle cx="202" cy="186" r="1.5" fill="#fff"/><path d="M182,178 L214,178 L214,186 C204,184 192,184 182,188 Z" fill="${LN}" opacity=".4"/>`);
    L += line('M210,194 C205,185 194,181 185,184 L181,183', LN, 3.2);
    L += line('M210,194 C203,197 193,194 186,186', LN, 1.4);
    L += line('M210,195 C210,204 206,214 200,224', LN, 2.2);
    // 臉的輪廓線
    L += path(head, 'none', 3);
    // 近側臉頰的鬃毛（蓋過輪廓線）
    const ruff = 'M294,240 C304,244 312,250 320,256 C312,258 306,260 302,263 C311,268 317,275 320,284 C310,282 300,282 292,286 C296,274 296,256 294,240 Z';
    L += path(ruff, FUR, 0);
    L += within(ruff, path('M290,262 L330,262 L330,300 L290,300 Z', FD, 0, 'opacity=".3"'));
    L += line('M305,246 C311,250 315,253 320,256 C312,258 306,260 302,263 C311,268 317,275 320,284 C310,282 300,282 293,285', LN, 2.4);
    L += line('M308,250 C312,252 315,254 317,256 M306,266 C311,270 314,274 316,279', RIM, 1.6, 'opacity=".85"');
    L += '</g>';
    s += `<g>${L}</g>`;

    // ── 前景岩石 ──
    const rockTop = `M${X0},394 C80,388 130,388 170,390 L176,382 C190,378 212,378 224,384 L230,396 C262,404 320,410 380,412 C420,412 446,414 ${X1},416 L${X1},${Y1} L${X0},${Y1} Z`;
    s += path(rockTop, `url(#${id.rock})`, 3);
    s += line(`M${X0},394 C80,388 130,388 170,390 L176,382 C190,378 212,378 224,384 L230,396 C262,404 320,410 380,412 C420,412 446,414 ${X1},416`, '#ffcf8a', 2.4, 'opacity=".7"');
    s += line('M60,404 L84,412 M120,400 L150,410 M250,412 L262,418 M400,416 L420,420', '#2a160c', 1.6, 'opacity=".7"');
    // 腳下的影子
    s += `<ellipse cx="306" cy="413" rx="34" ry="4" fill="#2a160c" opacity=".55"/><ellipse cx="198" cy="392" rx="24" ry="3.5" fill="#2a160c" opacity=".5"/>`;

    // ── 空氣中的沙塵、暗角 ──
    s += `<g fill="#fff0c0">${[[120, 250, 1.6, .7], [150, 210, 1.2, .5], [360, 180, 1.8, .8], [438, 210, 1.4, .7], [420, 320, 2, .6], [96, 330, 1.4, .5], [340, 128, 1.2, .5], [452, 290, 1.6, .7], [70, 220, 1.2, .5]].map(([x, y, r, o]) => `<circle cx="${x}" cy="${y}" r="${r}" opacity="${o}"/>`).join('')}</g>`;
    s += `<rect x="${X0}" y="${Y0}" width="${W.w}" height="${W.h}" fill="url(#${id.vig})"/>`;
    return s;
  };

  // ════════ 三神標準（黑底燙金）════════
  // 深色底＋領域色光暈＋大型幾何光環＋金線描邊的主角＋兩側建築與直行象形文字。
  const G = 'url(#G)', GF = 'url(#GF)';
  const gs = (w) => `stroke="${G}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const glow = (cx, cy, r, col, a1, a2) => { const i = uid('tg'); return `<radialGradient id="${i}" cx="${cx}" cy="${cy}" r="${r}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${col}" stop-opacity="${a1}"/><stop offset=".55" stop-color="${col}" stop-opacity="${a2}"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient><rect x="${X0}" y="${Y0}" width="${W.w}" height="${W.h}" fill="url(#${i})"/>`; };
  const base = (y, x0, x1) => `<g fill="#15100d" ${gs(1.3)}><path d="M${x0},${y} H${x1} V${y + 10} H${x0} Z"/><path d="M${x0 - 16},${y + 10} H${x1 + 16} V${y + 22} H${x0 - 16} Z"/></g>` + Array.from({ length: Math.floor((x1 - x0 - 16) / 19) + 1 }, (_, i) => K.diamond(x0 + 8 + i * 19, y + 5, 3, 3, i % 2 ? K.C.turq : K.C.rose, 'none', 0)).join('');

  // ───────── 母獅戰士 ─────────
  // 地平線上升起的半個太陽（akhet，日出），她側身大步走過，背著盾、披胸甲。不吼。
  SCENES.lioness = () => {
    const GY = K.GROUND;
    let s = K.goldGround(X0, Y0, W.w, W.h, 52);
    s += glow(250, 300, 260, '#e0552e', .5, .2);
    // 日出：半圓日輪＋放射的金芒
    const cx = 250, cy = GY - 4, r = 108;
    for (let i = 0; i <= 24; i++) {
      const a = Math.PI + (i / 24) * Math.PI, a2 = Math.PI + ((i + .5) / 24) * Math.PI, a3 = Math.PI + ((i + 1) / 24) * Math.PI;
      if (i < 24) s += `<path d="M${f(cx + Math.cos(a) * (r + 10))},${f(cy + Math.sin(a) * (r + 10))} L${f(cx + Math.cos(a2) * (i % 2 ? 196 : 240))},${f(cy + Math.sin(a2) * (i % 2 ? 196 : 240))} L${f(cx + Math.cos(a3) * (r + 10))},${f(cy + Math.sin(a3) * (r + 10))} Z" fill="${i % 2 ? 'none' : GF}" stroke="${G}" stroke-width="1" opacity="${i % 2 ? .75 : .42}"/>`;
    }
    s += `<path d="M${cx - r - 5},${cy} A${r + 5},${r + 5} 0 0 1 ${cx + r + 5},${cy} Z" fill="#0d0907" ${gs(2.2)}/>`;
    s += `<path d="M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy} Z" fill="url(#SUN)"/>`;
    s += `<path d="M${cx - r + 12},${cy} A${r - 12},${r - 12} 0 0 1 ${cx + r - 12},${cy}" fill="none" stroke="#ffd9a0" stroke-width="1" stroke-dasharray="0.1 5" stroke-linecap="round" opacity=".8"/>`;
    s += `<path d="M${cx - r + 28},${cy} A${r - 28},${r - 28} 0 0 1 ${cx + r - 28},${cy}" fill="none" stroke="#ffd9a0" stroke-width=".8" opacity=".5"/>`;
    // 兩側直行文字：母獅（E015）＋戰士（D036），右：拉的眼睛（N005 D004）
    s += `<g ${gs(1)}><path d="M66,140 V380 M434,140 V380"/></g>`;
    s += K.glyphColumn(['E015', 'D036'], 66, 150, 26, G, 8).svg + K.glyphColumn(['D004', 'N005', 'Z001'], 434, 150, 24, G, 8).svg;

    // ── 母獅（側面，往右大步走）──
    const FUR = '#5a3416', FURD = '#3a1f0c', CR = '#7a4a1e';
    const leg = (d, fill) => `<path d="${d}" fill="${fill}" ${gs(1.6)}/>`;
    const paw = (x, y, fill) => `<path d="M${x - 15},${y} C${x - 16},${y - 9} ${x - 8},${y - 13} ${x + 2},${y - 12} C${x + 12},${y - 11} ${x + 19},${y - 6} ${x + 18},${y} Z" fill="${fill}" ${gs(1.5)}/><path d="M${x + 6},${y - 1} v-4 M${x + 12},${y - 1} v-4" ${gs(.8)}/>`;
    let L = '';
    // 尾巴：由臀部往後垂，末端上翹，黑色毛簇
    L += `<path d="M156,226 C124,234 104,266 104,304 C104,328 98,340 86,336" fill="none" stroke="${G}" stroke-width="9" stroke-linecap="round"/><path d="M156,226 C124,234 104,266 104,304 C104,328 98,340 86,336" fill="none" stroke="${FUR}" stroke-width="6" stroke-linecap="round"/>`;
    L += `<path d="M88,338 C78,342 70,334 74,326 C78,320 88,322 92,330 Z" fill="#14100c" ${gs(1.3)}/>`;
    // 遠側的腿（較暗）：後腿往前、前腿往後
    L += leg('M212,268 C220,290 224,314 226,336 C227,354 230,368 234,382 L250,382 C248,366 244,348 242,330 C240,310 236,290 232,272 Z', FURD) + paw(242, GY - 6, FURD);
    L += leg('M298,276 C296,300 292,326 286,348 C282,362 278,374 272,382 L290,382 C296,370 302,356 308,340 C314,322 318,300 318,282 Z', FURD) + paw(282, GY - 6, FURD);
    // 身體＋頸＋頭：深胸、收腰
    const body = 'M156,224 C162,208 186,204 210,206 C246,210 280,212 300,206 C316,202 328,194 336,184 C342,176 352,170 362,170 C372,170 380,174 386,180 C394,186 402,192 410,198 C416,202 416,212 410,216 C404,220 398,222 396,228 C394,236 386,242 376,244 C366,246 358,252 352,262 C346,274 336,286 318,290 C300,293 286,286 270,278 C254,271 236,268 220,272 C204,277 188,278 174,268 C160,258 154,242 156,224 Z';
    const bid = uid('bd');
    L += `<linearGradient id="${bid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${CR}"/><stop offset=".6" stop-color="${FUR}"/><stop offset="1" stop-color="${FURD}"/></linearGradient>`;
    L += `<path d="${body}" fill="url(#${bid})" ${gs(1.8)}/>`;
    // 毛流與肌肉的細金線
    L += `<g fill="none" ${gs(.8)} opacity=".75"><path d="M302,214 C314,234 318,256 312,280"/><path d="M232,218 q4,12 0,24 M250,218 q4,12 0,24 M268,218 q4,12 0,24"/><path d="M338,194 C346,212 348,230 342,248"/></g>`;
    // 近側的腿：後腿往後蹬（大腿連著臀部）、前腿往前跨
    L += `<path d="M166,234 C148,252 146,284 158,302 C164,312 164,326 158,340 C154,352 148,368 144,382 L162,382 C168,368 176,354 182,342 C190,326 196,312 204,300 C210,290 210,276 202,262" fill="${FUR}" ${gs(1.6)}/>` + paw(152, GY - 6, FUR);
    L += `<path d="M322,262 C334,280 338,300 340,318 C342,336 348,354 356,372 L360,382 L378,382 C372,366 366,350 362,334 C358,314 354,292 346,270" fill="${FUR}" ${gs(1.6)}/>` + paw(368, GY - 6, FUR);
    L += `<path d="M178,262 C170,280 170,296 176,306 M336,292 C342,310 346,326 352,344" fill="none" ${gs(.8)} opacity=".7"/>`;
    // 盾牌：埃及式（上圓下平），斜背在身側，金框、豹皮紋
    L += `<g transform="rotate(-10 236 244)"><path d="M212,280 V232 C212,212 260,212 260,232 V280 Z" fill="#1b130d" ${gs(1.8)}/><path d="M218,274 V234 C218,220 254,220 254,234 V274 Z" fill="#8a5a24" stroke="${G}" stroke-width=".8"/>${[[226, 236], [240, 230], [246, 248], [230, 254], [242, 264], [226, 268], [250, 238]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#1b130d"/>`).join('')}<circle cx="236" cy="250" r="5.5" fill="${GF}" stroke="${G}" stroke-width="1"/></g>`;
    L += `<path d="M206,214 L268,276" ${gs(2.6)} opacity=".9"/>`;
    // 胸甲＋寬領圈（側面的弧形）
    L += `<path d="M330,190 C342,214 348,240 344,262 C356,256 366,246 374,240 C364,224 352,204 344,184 Z" fill="#15100d" ${gs(1.4)}/>`;
    L += `<path d="M333,194 C344,216 349,238 346,256" fill="none" stroke="${K.C.turq}" stroke-width="3"/><path d="M338,192 C348,212 354,232 354,250" fill="none" stroke="${K.C.rose}" stroke-width="2.4"/><path d="M343,189 C352,207 358,224 362,242" fill="none" stroke="${GF}" stroke-width="2.4"/>`;
    L += `<g fill="${K.C.turq}" stroke="${G}" stroke-width=".7">${[[346, 266], [356, 260], [366, 252], [374, 244]].map(([x, y]) => `<path d="M${x - 3},${y - 3} L${x},${y + 6} L${x + 3},${y - 3} Z"/>`).join('')}</g>`;
    L += `<circle cx="318" cy="250" r="9" fill="url(#SUN)" ${gs(1.3)}/><circle cx="318" cy="250" r="4" fill="none" stroke="#ffd9a0" stroke-width=".8"/>`;
    L += `<path d="M300,232 C306,238 312,244 318,241 M334,232 C330,238 326,244 322,242" fill="none" ${gs(1)}/>`;
    // 頭部細節：耳朵、眼睛、鼻、口、鬍鬚點
    L += `<path d="M352,176 C350,164 356,156 364,158 C368,164 368,170 364,174 Z" fill="${FURD}" ${gs(1.3)}/><path d="M356,170 C356,164 359,161 362,162" fill="none" ${gs(.7)}/>`;
    L += `<path d="M376,190 C382,186 390,186 394,190 C389,194 382,195 376,190 Z" fill="${GF}" stroke="#0d0907" stroke-width="1"/><circle cx="386" cy="190" r="2.2" fill="#0d0907"/>`;
    L += `<path d="M372,188 C380,183 390,182 398,186" fill="none" ${gs(1.4)}/><path d="M394,190 C398,196 400,202 404,206" fill="none" stroke="#0d0907" stroke-width="1.6" stroke-linecap="round"/>`;
    L += `<path d="M406,198 C412,198 416,202 414,207 C410,208 406,206 405,202 Z" fill="#14100c" ${gs(1)}/>`;
    L += `<path d="M410,216 C402,220 394,220 386,218" fill="none" ${gs(1.2)}/><g fill="${G}">${[[396, 210], [401, 212], [392, 213]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1"/>`).join('')}</g>`;
    L += `<path d="M368,206 C372,216 374,228 372,238 M360,200 C362,214 360,228 354,240" fill="none" ${gs(.8)} opacity=".75"/>`;
    s += L;
    s += base(GY, 104, 396);
    return s;
  };

  // ───────── 小母獅 ─────────
  // 蓮花圓窗裡，一隻大腳掌的小獅子壓低身子，準備撲向推著太陽球的聖甲蟲。
  SCENES.cub = () => {
    const GY = K.GROUND;
    // 普通卡：紙草底、墨線（構圖仍照三神標準）
    const G = LN, GF = '#e2b54c';
    const gs = (w) => `stroke="${LN}" stroke-width="${w * 1.25}" stroke-linejoin="round" stroke-linecap="round"`;
    const base = (y, x0, x1) => `<g fill="#c8902e" ${gs(1.3)}><path d="M${x0},${y} H${x1} V${y + 10} H${x0} Z"/><path d="M${x0 - 16},${y + 10} H${x1 + 16} V${y + 22} H${x0 - 16} Z" fill="#2c5d9c"/></g>` + Array.from({ length: Math.floor((x1 - x0 - 16) / 19) + 1 }, (_, i) => K.diamond(x0 + 8 + i * 19, y + 5, 3, 3, i % 2 ? '#2c5d9c' : '#b6402a', 'none', 0)).join('');
    let s = K.papyrusGround(X0, Y0, W.w, W.h, 33);
    s += K.blockBand(X0, Y0, W.w, 9, ['#2c5d9c', '#e2b54c', '#b6402a', '#3b7d58', '#e2b54c']);
    s += K.lotusFrieze(X0, Y0 + 9, W.w, 15);
    s += glow(250, 286, 220, '#f6d48a', .55, .2);
    // 蓮花圓窗：兩圈花瓣
    const cx = 250, cy = 286;
    for (const [n, r0, r1, wd, op, fill] of [[16, 96, 150, 22, 1, '#3b7d58'], [16, 70, 112, 16, 1, '#e2b54c']]) {
      for (let i = 0; i < n; i++) {
        const a = (i + (r0 === 70 ? .5 : 0)) / n * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a), px = -sn, py = c;
        const x0 = cx + c * r0, y0 = cy + sn * r0, x1 = cx + c * r1, y1 = cy + sn * r1, mx = cx + c * (r0 + r1) / 2, my = cy + sn * (r0 + r1) / 2;
        s += `<path d="M${f(x0)},${f(y0)} Q${f(mx + px * wd)},${f(my + py * wd)} ${f(x1)},${f(y1)} Q${f(mx - px * wd)},${f(my - py * wd)} ${f(x0)},${f(y0)} Z" fill="${fill}" stroke="${LN}" stroke-width="1.4" opacity="${op}"/>`;
        if (r0 === 96) s += `<path d="M${f(cx + c * (r0 + 10))},${f(cy + sn * (r0 + 10))} L${f(cx + c * (r1 - 14))},${f(cy + sn * (r1 - 14))}" stroke="${i % 2 ? '#a8d8c8' : '#2c5d9c'}" stroke-width="1.6" opacity=".9"/>`;
      }
    }
    s += `<circle cx="${cx}" cy="${cy}" r="70" fill="#b6402a" ${gs(1.8)}/><circle cx="${cx}" cy="${cy}" r="62" fill="none" stroke="#f6d48a" stroke-width="1.4" stroke-dasharray="0.1 5" stroke-linecap="round"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="58" fill="#e0a02e" opacity=".12"/>`;
    // 兩側直行文字：獅子（E015）＋ 小的（G039 鴨子＝「兒子」）→ 用 M017
    s += `<g ${gs(1)}><path d="M70,140 V380 M430,140 V380"/></g>`;
    s += K.glyphColumn(['E015', 'M017'], 70, 150, 26, G, 8).svg + K.glyphColumn(['N005', 'S034'], 430, 150, 24, G, 10).svg;

    const FUR = '#d9a457', FURL = '#ecc47a', FURD = '#a86c34';
    let L = '';
    // 尾巴：翹起來、末端彎
    L += `<path d="M152,300 C128,288 118,262 126,240 C130,230 140,228 144,236" fill="none" stroke="${G}" stroke-width="9" stroke-linecap="round"/><path d="M152,300 C128,288 118,262 126,240 C130,230 140,228 144,236" fill="none" stroke="${FUR}" stroke-width="6" stroke-linecap="round"/>`;
    L += `<path d="M144,236 C150,226 160,230 156,240 C152,246 144,246 142,240 Z" fill="#5a3416" ${gs(1.2)}/>`;
    // 遠側的前腳
    L += `<path d="M266,344 C276,360 290,372 304,378 L318,384 C316,374 300,364 290,354 C284,346 280,340 276,336 Z" fill="${FURD}" ${gs(1.4)}/>`;
    L += `<ellipse cx="318" cy="384" rx="14" ry="7" fill="${FURD}" ${gs(1.4)}/>`;
    // 身體：臀部抬高、前身壓低
    const body = 'M280,306 C254,290 212,280 182,282 C160,284 146,298 146,318 C146,340 156,356 172,364 C200,374 240,376 268,372 C284,370 294,360 292,346 C290,330 288,316 280,306 Z';
    const bid = uid('cb');
    L += `<linearGradient id="${bid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${FURL}"/><stop offset=".7" stop-color="${FUR}"/><stop offset="1" stop-color="${FURD}"/></linearGradient>`;
    L += `<path d="${body}" fill="url(#${bid})" ${gs(1.8)}/>`;
    // 幼獅的斑點
    L += `<g fill="${FURD}" opacity=".85">${[[196, 300], [214, 296], [232, 300], [206, 318], [226, 316], [248, 312], [186, 334], [262, 330]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4.5" ry="3.2"/>`).join('')}</g>`;
    // 後腿（圓圓的大腿）＋大腳掌
    L += `<path d="M150,326 C148,302 166,292 186,298 C206,304 212,330 204,350 C200,362 196,372 196,380" fill="${FUR}" ${gs(1.6)}/>`;
    L += `<ellipse cx="190" cy="384" rx="20" ry="8" fill="${FUR}" ${gs(1.5)}/><path d="M198,382 v4 M205,382 v4" ${gs(.8)}/>`;
    // 近側的前腳：往前伸、壓低
    L += `<path d="M276,334 C288,352 304,366 322,374 L340,380 C340,372 326,362 312,352 C300,344 292,334 290,324 Z" fill="${FUR}" ${gs(1.6)}/>`;
    L += `<ellipse cx="344" cy="382" rx="18" ry="8" fill="${FUR}" ${gs(1.5)}/><path d="M350,379 v5 M357,380 v4" ${gs(.8)}/>`;
    // 頭：大頭、圓耳
    L += `<circle cx="282" cy="290" r="11" fill="${FUR}" ${gs(1.5)}/><circle cx="282" cy="290" r="5" fill="${FURD}"/>`;
    const head = 'M268,320 C266,298 280,286 300,286 C322,286 336,298 338,314 C346,320 352,328 348,336 C342,346 330,350 318,350 C302,354 284,350 274,340 C268,334 268,326 268,320 Z';
    L += `<path d="${head}" fill="url(#${bid})" ${gs(1.8)}/>`;
    L += `<circle cx="302" cy="284" r="11" fill="${FUR}" ${gs(1.5)}/><circle cx="302" cy="285" r="5" fill="${FURD}"/>`;
    L += `<path d="M316,312 C322,305 332,305 336,311 C331,317 322,318 316,312 Z" fill="${GF}" stroke="#0d0907" stroke-width="1"/><circle cx="327" cy="311" r="3.2" fill="#0d0907"/><circle cx="328.5" cy="309.5" r="1" fill="#fff6d8"/>`;
    L += `<path d="M314,308 C320,302 330,301 338,306" fill="none" ${gs(1.3)}/>`;
    L += `<path d="M343,322 C348,320 352,324 350,329 C346,330 343,327 343,322 Z" fill="#14100c" ${gs(.9)}/>`;
    L += `<path d="M348,334 C342,340 334,342 326,340" fill="none" ${gs(1.1)}/><g fill="${G}">${[[336, 332], [340, 335], [333, 336]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9"/>`).join('')}</g>`;
    L += `<path d="M296,300 q6,-4 12,0" fill="none" ${gs(.8)} opacity=".7"/>`;
    // 頸上的護身符（安卡）
    L += `<path d="M276,322 C282,336 292,344 304,348" fill="none" stroke="${K.C.turq}" stroke-width="3"/><path d="M276,322 C282,336 292,344 304,348" fill="none" ${gs(.8)}/>`;
    L += K.ankh(296, 360, 16, GF, '#0d0907', .8);
    // 聖甲蟲推著太陽球
    L += `<circle cx="420" cy="370" r="16" fill="url(#SUN)" ${gs(1.4)}/><circle cx="420" cy="370" r="10" fill="none" stroke="#ffd9a0" stroke-width=".8" opacity=".7"/>`;
    L += `<g transform="translate(392,376)"><ellipse cx="0" cy="0" rx="13" ry="9" fill="#173f45" ${gs(1.3)}/><path d="M0,-9 V9" ${gs(.8)}/><circle cx="-13" cy="-1" r="4.5" fill="#173f45" ${gs(1)}/><path d="M8,6 l8,4 M2,8 l2,8 M-6,8 l-4,7 M10,-2 l9,-4" ${gs(1.2)}/></g>`;
    s += L;
    s += base(GY, 108, 436);
    return s;
  };

  // ───────── 塞赫美特 ─────────
  // 火焰光環前，獅頭女神側身坐在王座上，手持安卡；兩旁是阿蒙霍特普三世立的成排雕像。
  SCENES.sekhmet = () => {
    const GY = K.GROUND;
    let s = K.goldGround(X0, Y0, W.w, W.h, 64);
    s += glow(244, 250, 250, '#d8402a', .55, .22);
    // 火焰光環：一圈 S 形火舌
    const cx = 244, cy = 250, R = 100;
    for (let i = 0; i < 28; i++) {
      const a = i / 28 * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a), px = -sn, py = c, L = i % 2 ? 40 : 58;
      const x0 = cx + c * R, y0 = cy + sn * R, x1 = cx + c * (R + L), y1 = cy + sn * (R + L);
      const m1x = cx + c * (R + L * .35) + px * 12, m1y = cy + sn * (R + L * .35) + py * 12, m2x = cx + c * (R + L * .7) - px * 8, m2y = cy + sn * (R + L * .7) - py * 8;
      s += `<path d="M${f(x0 - px * 9)},${f(y0 - py * 9)} C${f(m1x)},${f(m1y)} ${f(m2x)},${f(m2y)} ${f(x1)},${f(y1)} C${f(m2x + px * 6)},${f(m2y + py * 6)} ${f(m1x - px * 14)},${f(m1y - py * 14)} ${f(x0 + px * 9)},${f(y0 + py * 9)} Z" fill="${i % 2 ? '#c8432a' : GF}" stroke="${G}" stroke-width=".9" opacity="${i % 2 ? .55 : .5}"/>`;
    }
    s += `<circle cx="${cx}" cy="${cy}" r="${R + 2}" fill="#0d0907" ${gs(2)}/><circle cx="${cx}" cy="${cy}" r="${R - 8}" fill="none" stroke="${G}" stroke-width="1" stroke-dasharray="0.1 5" stroke-linecap="round"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#c8432a" opacity=".14"/>`;
    // 兩旁成排的小雕像（坐姿剪影）
    const statue = (x, k, op) => `<g transform="translate(${x},${GY}) scale(${k})" opacity="${op}" fill="#120d0a" ${gs(1.2 / k)}><path d="M-14,0 V-30 H6 V0 Z"/><path d="M-8,-30 V-62 C-8,-70 4,-70 6,-62 L8,-44 H20 V-30 Z"/><circle cx="-1" cy="-74" r="9"/><path d="M5,-76 L13,-72 L6,-68"/><circle cx="-2" cy="-88" r="5"/></g>`;
    s += statue(78, .95, .8) + statue(118, .75, .55) + statue(424, .95, .8) + statue(384, .75, .55);
    // 文字：左＝塞赫美特（sḫm-m-t），右＝兩地的女主人（nbt tꜣwy）
    s += K.glyphColumn(['S042', 'G017', 'X001'], 70, 130, 22, G, 6).svg + K.glyphColumn(['V030', 'X001', 'N016', 'N016'], 432, 130, 20, G, 5).svg;

    const SK = '#6a4418', SKD = '#4a2c10', RED = '#8e2a1c';
    let L = '';
    // 王座：方塊座＋矮靠背，側面有羽毛紋
    L += `<path d="M184,${GY} V306 H272 V${GY} Z" fill="#15100d" ${gs(1.6)}/><path d="M184,306 V246 H200 V306 Z" fill="#15100d" ${gs(1.4)}/>`;
    L += `<path d="M196,318 H262 V376 H196 Z" fill="none" ${gs(1)}/>` + Array.from({ length: 5 }, (_, i) => `<path d="M${200 + i * 12},322 q6,8 0,16 q6,8 0,16 q6,8 0,16" fill="none" stroke="${G}" stroke-width=".8" opacity=".8"/>`).join('');
    L += `<path d="M262,322 v50" stroke="${K.C.turq}" stroke-width="2"/>`;
    // 身體：紅色緊身長裙（坐姿）
    const dress = 'M220,212 C242,204 258,212 260,230 C262,246 254,258 254,272 C266,286 292,288 306,292 C314,296 314,314 304,318 L302,384 L284,384 L282,320 C262,320 236,318 222,308 C214,282 214,240 220,212 Z';
    L += `<path d="${dress}" fill="${RED}" ${gs(1.8)}/>`;
    L += `<g fill="none" stroke="${G}" stroke-width=".7" opacity=".55"><path d="M230,240 V300 M240,236 V300 M262,296 H300 M262,306 H300"/></g>`;
    // 腳
    L += `<path d="M282,384 L284,${GY - 2} H326 C326,${GY - 8} 318,${GY - 12} 304,${GY - 12} L302,384 Z" fill="${SK}" ${gs(1.4)}/>`;
    // 手臂與安卡
    L += `<path d="M236,222 C232,240 234,258 242,270 C256,284 276,290 292,290" fill="none" stroke="${G}" stroke-width="14" stroke-linecap="round"/><path d="M236,222 C232,240 234,258 242,270 C256,284 276,290 292,290" fill="none" stroke="${SK}" stroke-width="10.5" stroke-linecap="round"/>`;
    L += K.ankh(300, 262, 44, GF, '#0d0907', 1);
    // 寬領圈
    L += `<path d="M222,210 C236,204 254,206 262,218 C258,232 246,240 232,240 C226,234 222,222 222,210 Z" fill="#15100d" ${gs(1.3)}/><path d="M226,214 C238,210 252,212 258,220 M226,222 C236,222 248,224 254,230 M228,230 C236,232 244,234 250,236" fill="none" stroke="${K.C.turq}" stroke-width="2"/>`;
    // 假髮（垂到肩後）
    L += `<path d="M206,168 C206,148 222,138 240,140 C252,142 258,150 258,160 L244,164 L240,214 C228,220 214,218 206,210 Z" fill="#14100c" ${gs(1.6)}/>`;
    L += `<g fill="none" stroke="${G}" stroke-width=".7" opacity=".7">${[212, 220, 228, 236].map((x) => `<path d="M${x},160 V${212}"/>`).join('')}</g>`;
    // 母獅頭（側面向右）
    const head = 'M236,166 C238,150 252,144 264,148 C274,152 280,160 286,168 C292,172 296,178 294,184 C290,188 284,188 282,192 C280,200 270,204 260,204 C250,204 242,198 238,190 C234,182 234,174 236,166 Z';
    L += `<path d="${head}" fill="${SK}" ${gs(1.7)}/>`;
    L += `<path d="M262,170 C266,166 274,166 278,170 C274,174 266,175 262,170 Z" fill="${GF}" stroke="#0d0907" stroke-width=".9"/><circle cx="271" cy="170" r="1.8" fill="#0d0907"/>`;
    L += `<path d="M258,166 C264,162 272,161 280,164" fill="none" ${gs(1.2)}/><path d="M278,171 C282,176 284,180 288,182" fill="none" stroke="#0d0907" stroke-width="1.3"/>`;
    L += `<path d="M290,176 C294,176 296,179 295,183 C292,184 290,182 289,179 Z" fill="#14100c"/><path d="M294,186 C288,190 282,190 276,188" fill="none" ${gs(1)}/>`;
    L += `<path d="M246,176 C248,186 252,194 258,198 M250,168 C254,180 260,190 268,196" fill="none" ${gs(.7)} opacity=".7"/>`;
    L += `<path d="M244,152 C242,144 246,138 252,140 C254,146 252,150 248,154 Z" fill="${SKD}" ${gs(1.1)}/>`;
    // 日輪＋聖蛇
    L += `<circle cx="250" cy="112" r="26" fill="url(#SUN)" ${gs(1.8)}/><circle cx="250" cy="112" r="18" fill="none" stroke="#ffd9a0" stroke-width=".8" opacity=".7"/>`;
    L += `<path d="M240,138 C246,136 256,136 262,140 L258,146 C252,144 246,144 242,146 Z" fill="${GF}" stroke="#0d0907" stroke-width=".8"/>`;
    L += `<path d="M268,134 C276,130 280,120 276,110 C272,106 268,110 270,116 C272,122 268,128 262,132 Z" fill="${K.C.turq}" ${gs(1.1)}/>`;
    // 腳下翻倒的紅啤酒（傳說中讓她醉倒的酒）
    L += `<g transform="translate(366,${GY - 10}) rotate(78)"><path d="M-14,-24 Q-20,0 -12,6 H12 Q20,0 14,-24 Q11,-30 4,-31 H-4 Q-11,-30 -14,-24 Z" fill="#15100d" ${gs(1.4)}/><path d="M-14,-14 H14" stroke="${G}" stroke-width=".8"/></g>`;
    L += `<path d="M332,${GY - 1} C352,${GY - 7} 380,${GY - 6} 404,${GY - 1} Z" fill="#c8432a" opacity=".85" stroke="${G}" stroke-width=".8"/>`;
    s += `<g transform="translate(244,${GY}) scale(.84) translate(-244,-${GY})">${L}</g>`;
    s += base(GY, 150, 350);
    return s;
  };

  // ───────── 主題：普通卡＝紙草底墨線；其餘＝黑底燙金 ─────────
  const theme = (pap) => {
    if (!pap) return { pap, G, GF, gs, base, ink: '#0d0907', dark: '#15100d',
      bg: (seed, col, cx, cy, r) => K.goldGround(X0, Y0, W.w, W.h, seed) + glow(cx || 250, cy || 250, r || 250, col, .5, .2) };
    const gsP = (w) => `stroke="${LN}" stroke-width="${w * 1.25}" stroke-linejoin="round" stroke-linecap="round"`;
    return { pap, G: LN, GF: '#e2b54c', gs: gsP, ink: LN, dark: '#2c5d9c',
      base: (y, x0, x1) => `<g fill="#c8902e" ${gsP(1.3)}><path d="M${x0},${y} H${x1} V${y + 10} H${x0} Z"/><path d="M${x0 - 16},${y + 10} H${x1 + 16} V${y + 22} H${x0 - 16} Z" fill="#2c5d9c"/></g>` + Array.from({ length: Math.floor((x1 - x0 - 16) / 19) + 1 }, (_, i) => K.diamond(x0 + 8 + i * 19, y + 5, 3, 3, i % 2 ? '#2c5d9c' : '#b6402a', 'none', 0)).join(''),
      bg: (seed, col, cx, cy, r) => K.papyrusGround(X0, Y0, W.w, W.h, seed) + K.blockBand(X0, Y0, W.w, 9, ['#2c5d9c', '#e2b54c', '#b6402a', '#3b7d58', '#e2b54c']) + K.lotusFrieze(X0, Y0 + 9, W.w, 15) + glow(cx || 250, cy || 250, r || 220, col, .5, .2) };
  };
  // 埃及胸飾式的翅膀：沿著上緣排三層羽毛（覆羽、次級、初級）
  const wing = (T, root, ctrl, tip, n, dir, cols) => {
    let o = '';
    const rows = [[1, 54, 11, cols[2]], [.72, 38, 11, cols[1]], [.42, 22, 10, cols[0]]];
    for (const [k, len, w, col] of rows) {
      for (let i = n - 1; i >= 0; i--) {
        const tt = (i + .5) / n, u = 1 - tt;
        const x = u * u * root[0] + 2 * u * tt * ctrl[0] + tt * tt * tip[0], y = u * u * root[1] + 2 * u * tt * ctrl[1] + tt * tt * tip[1];
        const L = len * k * (0.75 + tt * .6) * (k === 1 ? 1.25 : 1) , a = (90 - dir * (8 + tt * 34)) * Math.PI / 180;
        const ex = x + Math.cos(a) * L, ey = y + Math.sin(a) * L, px = -Math.sin(a) * w / 2, py = Math.cos(a) * w / 2;
        o += `<path d="M${f(x + px)},${f(y + py)} L${f(ex + px)},${f(ey + py)} Q${f(ex + Math.cos(a) * w * .6)},${f(ey + Math.sin(a) * w * .6)} ${f(ex - px)},${f(ey - py)} L${f(x - px)},${f(y - py)} Z" fill="${col}" ${T.gs(1)}/>`;
      }
    }
    return o + `<path d="M${root[0]},${root[1]} Q${ctrl[0]},${ctrl[1]} ${tip[0]},${tip[1]}" fill="none" ${T.gs(2.2)}/>`;
  };

  // ───────── 荷魯斯 ─────────
  // 背後是一隻巨大的荷魯斯之眼；隼展開雙翼（像王室胸飾），爪握「申」環，頭頂日輪。
  SCENES.horus = () => {
    const T = theme(false), GY = K.GROUND;
    let s = T.bg(61, '#2a6fb8', 250, 236, 250);
    // 荷魯斯之眼（wedjat）大圖騰
    s += `<g fill="none" stroke="${G}" opacity=".5"><path d="M118,214 C170,160 320,160 380,206 C318,252 172,256 118,214 Z" stroke-width="2"/><path d="M110,176 C170,134 320,130 392,170" stroke-width="7" stroke-linecap="round"/><path d="M380,206 L420,206" stroke-width="5" stroke-linecap="round"/><path d="M226,248 C224,286 214,318 196,338" stroke-width="5" stroke-linecap="round"/><path d="M262,250 C282,288 312,318 346,322 C366,324 372,306 360,298 C352,294 346,302 350,308" stroke-width="5" stroke-linecap="round"/><circle cx="248" cy="208" r="26" stroke-width="2"/></g>`;
    s += K.glyphColumn(['G005'], 70, 140, 30, G, 8).svg + K.glyphColumn(['V030', 'N001'], 432, 140, 24, G, 8).svg;
    let L = '';
    const blue = '#1c3f7a', turq = K.C.turq, red = '#a83a22';
    // 尾羽
    for (let i = -3; i <= 3; i++) L += `<path d="M${250 + i * 5},300 L${250 + i * 13},${352 + Math.abs(i) * -3} Q${250 + i * 13},${360 - Math.abs(i) * 3} ${250 + i * 13 + 8},${352 - Math.abs(i) * 3} L${250 + i * 5 + 6},300 Z" fill="${i % 2 ? blue : '#15100d'}" ${gs(1)}/>`;
    // 雙翼
    L += wing(T, [240, 238], [150, 196], [64, 214], 9, 1, [turq, red, blue]);
    L += wing(T, [260, 238], [350, 196], [436, 214], 9, -1, [turq, red, blue]);
    // 身體（胸前的羽鱗）
    L += `<path d="M232,232 C228,206 242,192 256,196 C270,200 276,220 272,250 C270,276 262,298 250,306 C238,298 232,276 232,232 Z" fill="${blue}" ${gs(1.8)}/>`;
    L += `<g fill="none" stroke="${G}" stroke-width=".8" opacity=".8">${[226, 242, 258, 274, 290].map((y, i) => `<path d="M${238 + i},${y} q6,6 12,0 q6,6 12,0"/>`).join('')}</g>`;
    // 頭（側面向右）、喙、眼紋
    L += `<path d="M240,200 C236,182 248,170 262,172 C276,174 284,184 284,194 C292,196 296,202 292,208 C286,206 282,206 278,210 C270,214 250,214 240,200 Z" fill="${blue}" ${gs(1.8)}/>`;
    L += `<path d="M284,194 C292,196 296,202 292,208 C288,206 284,204 280,204 Z" fill="${GF}" ${gs(1.2)}/>`;
    L += `<path d="M258,186 C262,182 270,182 274,186 C270,190 262,191 258,186 Z" fill="${GF}" stroke="#0d0907" stroke-width=".9"/><circle cx="267" cy="186" r="2" fill="#0d0907"/>`;
    L += `<path d="M262,192 C262,200 258,206 252,210" fill="none" stroke="${G}" stroke-width="2.4" stroke-linecap="round"/>`;
    // 日輪與聖蛇
    L += `<circle cx="258" cy="150" r="20" fill="url(#SUN)" ${gs(1.8)}/><circle cx="258" cy="150" r="13" fill="none" stroke="#ffd9a0" stroke-width=".8" opacity=".7"/>`;
    L += `<path d="M268,168 C276,166 280,158 278,150 C274,146 270,150 272,156 C273,160 270,164 266,166 Z" fill="${turq}" ${gs(1)}/>`;
    // 爪與申環
    for (const x of [230, 270]) {
      L += `<path d="M${x + (x < 250 ? 12 : -12)},296 L${x},326" stroke="${G}" stroke-width="5" stroke-linecap="round"/><path d="M${x + (x < 250 ? 12 : -12)},296 L${x},326" stroke="${GF}" stroke-width="2.6" stroke-linecap="round"/>`;
      L += `<circle cx="${x}" cy="340" r="13" fill="none" stroke="${G}" stroke-width="5"/><circle cx="${x}" cy="340" r="13" fill="none" stroke="${GF}" stroke-width="2.6"/><path d="M${x - 15},354 H${x + 15}" stroke="${G}" stroke-width="5" stroke-linecap="round"/><path d="M${x - 15},354 H${x + 15}" stroke="${GF}" stroke-width="2.6" stroke-linecap="round"/>`;
    }
    s += `<g transform="translate(0,22)">${L}</g>`;
    s += base(GY, 120, 380);
    return s;
  };

  // ───────── 法老 ─────────
  // 站在巨大的王名圈裡的正面胸像：條紋頭巾、聖蛇、辮鬚、寬領，胸前交叉著彎鉤與連枷。
  SCENES.pharaoh = () => {
    const T = theme(false), GY = K.GROUND;
    let s = T.bg(62, '#c8902e', 250, 250, 260);
    // 王名圈（繩結圍成的橢圓）
    const cart = (rx, ry) => `M250,${256 - ry} C${250 + rx * 1.1},${256 - ry} ${250 + rx * 1.1},${256 + ry} 250,${256 + ry} C${250 - rx * 1.1},${256 + ry} ${250 - rx * 1.1},${256 - ry} 250,${256 - ry} Z`;
    s += `<path d="${cart(118, 140)}" fill="#0d0907" ${gs(2.4)}/><path d="${cart(110, 132)}" fill="none" stroke="${G}" stroke-width="5" stroke-dasharray="3 3"/><path d="${cart(102, 124)}" fill="none" ${gs(1)}/>`;
    s += `<path d="${cart(102, 124)}" fill="#c8902e" opacity=".08"/>`;
    // 兩側：國王（nsw）、法老（pr-ꜥꜣ「大房子」）
    s += `<g ${gs(1)}><path d="M78,140 V380 M422,140 V380"/></g>`;
    s += K.glyphColumn(['M023', 'X001', 'N035'], 78, 150, 26, G, 8).svg + K.glyphColumn(['O001', 'O029'], 422, 160, 30, G, 10).svg;
    const skin = '#7a3a1c', lap = '#1c3f7a';
    let L = '';
    // 肩膀與胸
    L += `<path d="M120,392 Q122,324 190,302 H310 Q378,324 380,392 Z" fill="${skin}" ${gs(1.8)}/>`;
    // 頭巾：後片與兩側垂片
    const nemes = 'M172,168 Q250,118 328,168 L344,240 L334,338 H292 L294,250 H206 L208,338 H166 L156,240 Z';
    L += `<path d="${nemes}" fill="${lap}" ${gs(2)}/>`;
    L += within(nemes, Array.from({ length: 20 }, (_, i) => `<path d="M140,${150 + i * 10} H360" stroke="#d9b45e" stroke-width="4.2"/>`).join(''));
    L += `<path d="${nemes}" fill="none" ${gs(2)}/>`;
    // 頸
    L += `<path d="M214,250 H286 V330 H214 Z" fill="${skin}" ${gs(1.4)}/><path d="M222,262 Q250,276 278,262" fill="none" stroke="#4a2010" stroke-width="2" opacity=".6"/>`;
    // 臉
    const face = 'M208,196 Q206,268 250,280 Q294,268 292,196 Q290,166 250,164 Q210,166 208,196 Z';
    L += `<path d="${face}" fill="${skin}" ${gs(1.8)}/>`;
    L += `<path d="M208,200 Q200,208 208,220 M292,200 Q300,208 292,220" fill="none" ${gs(1.4)}/>`;
    for (const [cx, sx] of [[229, -1], [271, 1]]) {
      L += `<path d="M${cx - sx * 15},${213} Q${cx},${200} ${cx + sx * 15},${209} Q${cx},${220} ${cx - sx * 15},${213} Z" fill="#f2e7cc" stroke="#0d0907" stroke-width="1.2"/><circle cx="${cx}" cy="210" r="4.6" fill="#0d0907"/>`;
      L += `<path d="M${cx + sx * 13},208 L${cx + sx * 28},203" stroke="#0d0907" stroke-width="2.6" stroke-linecap="round"/><path d="M${cx - sx * 14},196 Q${cx},188 ${cx + sx * 16},194" fill="none" stroke="#0d0907" stroke-width="3" stroke-linecap="round"/>`;
    }
    L += `<path d="M250,212 Q245,234 240,242 Q250,247 260,242 Q255,234 250,212" fill="none" ${gs(1.2)}/>`;
    L += `<path d="M234,258 Q250,263 266,258 Q250,269 234,258 Z" fill="#5a2412" ${gs(1)}/>`;
    // 額前的金頭帶與聖蛇
    L += `<path d="M206,190 Q250,174 294,190 L292,198 Q250,184 208,198 Z" fill="${GF}" stroke="#0d0907" stroke-width=".8"/>`;
    L += `<path d="M250,182 C244,170 246,156 252,150 C258,152 258,160 254,164 C252,170 254,176 256,182 Z" fill="${GF}" ${gs(1.2)}/><circle cx="252" cy="155" r="2.6" fill="#c8432a"/>`;
    // 辮鬚
    L += `<path d="M242,276 H258 L262,322 Q250,334 238,322 Z" fill="${lap}" ${gs(1.4)}/><g stroke="${GF}" stroke-width="2.2">${[288, 300, 312].map((y) => `<path d="M241,${y} H259"/>`).join('')}</g>`;
    // 寬領
    const cols = [GF, K.C.turq, '#c8432a', lap, GF];
    cols.forEach((c, i) => { const d = i * 11; L += `<path d="M${168 + d * .3},${314 + d * .1} Q250,${352 + d} ${332 - d * .3},${314 + d * .1} L${326 - d * .3},${326 + d * .1} Q250,${366 + d} ${174 + d * .3},${326 + d * .1} Z" fill="${c}" ${gs(1)}/>`; });
    // 彎鉤與連枷交叉在胸前
    L += `<g transform="rotate(-24 250 384)"><path d="M250,384 V306" stroke="${G}" stroke-width="9"/><path d="M250,384 V306" stroke="${lap}" stroke-width="5"/><g stroke="${GF}" stroke-width="5">${[318, 332, 346, 360, 374].map((y) => `<path d="M250,${y} v5"/>`).join('')}</g><path d="M250,306 Q250,282 272,284 Q282,288 276,298" fill="none" stroke="${G}" stroke-width="9" stroke-linecap="round"/><path d="M250,306 Q250,282 272,284 Q282,288 276,298" fill="none" stroke="${lap}" stroke-width="5" stroke-linecap="round"/></g>`;
    L += `<g transform="rotate(24 250 384)"><path d="M250,384 V312" stroke="${G}" stroke-width="9"/><path d="M250,384 V312" stroke="${GF}" stroke-width="5"/>${[-12, 0, 12].map((x) => `<path d="M250,314 Q${250 + x * 2},298 ${250 + x * 2.4},284" fill="none" stroke="${G}" stroke-width="6" stroke-linecap="round"/><path d="M250,314 Q${250 + x * 2},298 ${250 + x * 2.4},284" fill="none" stroke="#c8432a" stroke-width="3" stroke-linecap="round" stroke-dasharray="4 2"/>`).join('')}</g>`;
    s += L;
    s += base(GY, 150, 350);
    return s;
  };

  // ───────── 伊西斯 ─────────
  // 背後是紅色的「伊西斯結」（tyet）。她站在紙莎草小船上，穿過三角洲的沼澤去尋找丈夫。
  SCENES.isis = () => {
    const T = theme(false), GY = K.GROUND;
    let s = T.bg(66, '#2a8a7a', 250, 240, 250);
    // 伊西斯結
    const tyet = (k) => { const X = (x) => f(250 + (x - 250) * k), Y = (y) => f(236 + (y - 236) * k);
      return `M${X(250)},${Y(102)} C${X(300)},${Y(102)} ${X(306)},${Y(168)} ${X(270)},${Y(184)} L${X(300)},${Y(186)} C${X(336)},${Y(188)} ${X(338)},${Y(214)} ${X(326)},${Y(250)} L${X(316)},${Y(250)} C${X(322)},${Y(222)} ${X(318)},${Y(204)} ${X(282)},${Y(206)} L${X(272)},${Y(206)} L${X(290)},${Y(380)} L${X(210)},${Y(380)} L${X(228)},${Y(206)} L${X(218)},${Y(206)} C${X(182)},${Y(204)} ${X(178)},${Y(222)} ${X(184)},${Y(250)} L${X(174)},${Y(250)} C${X(162)},${Y(214)} ${X(164)},${Y(188)} ${X(200)},${Y(186)} L${X(230)},${Y(184)} C${X(194)},${Y(168)} ${X(200)},${Y(102)} ${X(250)},${Y(102)} Z`; };
    s += `<path d="${tyet(1)}" fill="#5a1a12" opacity=".55" ${gs(2)}/><path d="${tyet(.9)}" fill="none" stroke="${G}" stroke-width="1" stroke-dasharray="0.1 5" stroke-linecap="round"/>`;
    s += `<path d="M250,128 C226,128 222,166 250,174 C278,166 274,128 250,128 Z" fill="#0d0907" ${gs(1.2)}/>`;
    // 兩旁的紙莎草
    const pap = (x, h, lean) => `<path d="M${x},${GY - 20} Q${x + lean * .5},${GY - 20 - h * .5} ${x + lean},${GY - 20 - h}" fill="none" ${gs(1.6)}/><path d="M${x + lean},${GY - 20 - h} l-16,-22 q16,-6 32,0 Z" fill="#173f45" ${gs(1.2)}/>`;
    s += pap(70, 150, -6) + pap(96, 110, 8) + pap(408, 130, 4) + pap(436, 170, -8);
    s += K.glyphColumn(['Q001', 'X001', 'B001'], 132, 140, 22, G, 6).svg + K.glyphColumn(['V030', 'X001', 'N001'], 370, 140, 22, G, 6).svg;
    // 水
    s += `<g fill="none" stroke="${G}" stroke-width="1" opacity=".7">${Array.from({ length: 9 }, (_, i) => `<path d="M${60 + i * 44},${GY - 8 - (i % 2) * 6} q11,-5 22,0 t22,0"/>`).join('')}</g>`;
    const skin = '#8a6a2a', dress = '#f2e7cc';
    let L = '';
    s += '<!--boat-->';
    // 紙莎草小船（兩端捆紮上翹）
    L += `<path d="M120,326 C150,360 350,360 380,326 C376,350 346,372 250,372 C154,372 124,350 120,326 Z" fill="#173f45" ${gs(1.8)}/>`;
    L += `<g stroke="${G}" stroke-width="1.6">${[150, 180, 320, 350].map((x) => `<path d="M${x},${x < 250 ? 346 : 346} v18"/>`).join('')}</g><path d="M128,338 C170,362 330,362 372,338" fill="none" stroke="${G}" stroke-width=".8" opacity=".7"/>`;
    L += '<!--fig-->';
    // 身體：白色貼身長裙
    const body = 'M240,204 C252,198 270,200 278,212 C282,226 270,244 268,256 C274,276 276,300 272,328 L270,348 L242,348 C236,318 234,288 236,256 C236,236 236,218 240,204 Z';
    L += `<path d="${body}" fill="${dress}" ${gs(1.8)}/>`;
    L += `<g fill="none" stroke="#b8a070" stroke-width="1">${[[248, 262], [256, 262], [264, 262]].map(([x, y]) => `<path d="M${x},${y} L${x + 2},346"/>`).join('')}</g>`;
    L += `<path d="M262,236 C268,232 276,232 280,226" fill="none" stroke="#c8432a" stroke-width="3"/>`;
    // 手（垂在身側（垂下，握安卡）
    L += `<path d="M246,212 C240,236 238,256 240,276" fill="none" stroke="${G}" stroke-width="12" stroke-linecap="round"/><path d="M246,212 C240,236 238,256 240,276" fill="none" stroke="${skin}" stroke-width="8.5" stroke-linecap="round"/>`;
    // 腳
    L += `<path d="M244,348 L242,354 H262 L260,348 Z M260,348 L262,354 H282 C282,350 276,348 270,348 Z" fill="${skin}" ${gs(1.2)}/>`;
    // 前手（舉起，護著）
    L += `<path d="M266,212 C282,214 298,206 312,190 L322,176" fill="none" stroke="${G}" stroke-width="12" stroke-linecap="round"/><path d="M266,212 C282,214 298,206 312,190 L322,176" fill="none" stroke="${skin}" stroke-width="8.5" stroke-linecap="round"/>`;
    L += `<path d="M318,178 C322,168 328,164 332,166 C332,172 328,178 322,182 Z" fill="${skin}" ${gs(1)}/>`;
    // 寬領
    L += `<path d="M240,204 C252,196 270,198 278,210 C272,222 256,226 244,222 Z" fill="#15100d" ${gs(1.2)}/><path d="M244,206 C254,202 266,203 272,210 M244,214 C254,214 264,214 270,216" fill="none" stroke="${K.C.turq}" stroke-width="2"/>`;
    L += K.ankh(240, 272, 30, GF, '#0d0907', .9);
    // 頭與假髮
    L += `<path d="M256,166 C256,150 268,142 280,146 C288,150 290,160 288,168 C292,172 294,176 290,180 C288,184 286,188 284,192 C278,198 268,196 262,190 Z" fill="${skin}" ${gs(1.6)}/>`;
    L += `<path d="M274,166 C278,162 284,162 287,166 C284,169 278,170 274,166 Z" fill="#f2e7cc" stroke="#0d0907" stroke-width=".8"/><circle cx="281" cy="166" r="1.8" fill="#0d0907"/><path d="M287,166 L294,163" stroke="#0d0907" stroke-width="1.6" stroke-linecap="round"/>`;
    L += `<path d="M252,152 C252,138 268,132 282,136 C290,140 290,148 286,150 C276,148 268,152 266,162 L264,208 C252,214 240,210 236,200 C238,180 244,162 252,152 Z" fill="#14100c" ${gs(1.6)}/>`;
    L += `<g fill="none" stroke="${G}" stroke-width=".7" opacity=".7">${[244, 250, 256].map((x) => `<path d="M${x},164 V204"/>`).join('')}</g>`;
    L += `<path d="M252,150 C262,144 276,142 286,146" fill="none" stroke="${GF}" stroke-width="3"/>`;
    // 王座頭冠
    L += `<path d="M258,134 L256,118 H282 L280,134 Z" fill="${GF}" ${gs(1.2)}/><path d="M270,118 V98 H282 V118 Z M256,118 L262,104 H270" fill="#1c3f7a" ${gs(1.2)}/>`;
    s += `<g transform="translate(250,350) scale(.8) translate(-250,-350)">${L.slice(L.indexOf('<!--fig-->'))}</g>`;
    s = s.replace('<!--boat-->', L.slice(0, L.indexOf('<!--fig-->')));
    return s;
  };

  // ───────── 哈碧 ─────────
  // 一圈圈水紋的光環前，尼羅河氾濫之神單膝跪著，捧出盛滿供品的托盤，水從瓶口流下。
  SCENES.hapi = () => {
    const T = theme(false), GY = K.GROUND;
    let s = T.bg(75, '#2a7ab8', 244, 250, 250);
    // 水紋光環：三圈波浪圓
    const wave = (r, n, a) => { let d = ''; for (let i = 0; i <= n * 8; i++) { const th = i / (n * 8) * Math.PI * 2, rr = r + Math.sin(i / 8 * Math.PI * 2) * a; d += (i ? ' L' : 'M') + f(244 + Math.cos(th) * rr) + ',' + f(246 + Math.sin(th) * rr); } return d + ' Z'; };
    s += `<path d="${wave(132, 30, 4)}" fill="#0d0907" ${gs(1.6)}/><path d="${wave(118, 26, 3)}" fill="none" stroke="${G}" stroke-width="1"/><path d="${wave(104, 22, 3)}" fill="none" stroke="${K.C.turq}" stroke-width="1" opacity=".8"/>`;
    s += `<circle cx="244" cy="246" r="100" fill="#2a7ab8" opacity=".12"/>`;
    s += `<g ${gs(1)}><path d="M70,140 V380 M432,140 V380"/></g>`;
    s += K.glyphColumn(['V028', 'D036', 'Q003', 'M017', 'M017'], 70, 146, 19, G, 4).svg + K.glyphColumn(['N035A', 'N035A'], 432, 160, 30, G, 14).svg;
    const sk = '#1f6b8a', skD = '#174f68';
    let L = '';
    // 後腿：膝蓋跪地、腳背貼地
    L += `<path d="M234,316 C224,340 218,360 216,378 C200,382 184,382 172,384 C166,388 170,392 176,392 L224,392 C232,374 242,350 250,330 Z" fill="${skD}" ${gs(1.6)}/>`;
    // 前腿：立膝，小腿垂直
    L += `<path d="M240,312 C260,310 284,310 298,314 C306,320 306,330 302,340 L300,384 C312,384 320,388 322,392 L284,392 L282,344 C268,344 252,342 240,338 Z" fill="${sk}" ${gs(1.6)}/>`;
    // 腰帶與短裙
    L += `<path d="M222,300 C236,304 256,306 270,304 L276,330 C260,334 240,334 226,330 Z" fill="#15100d" ${gs(1.4)}/><path d="M224,306 C240,310 256,310 270,308" fill="none" stroke="${GF}" stroke-width="3"/>`;
    // 身體：圓肚子、柔和的胸
    L += `<path d="M232,232 C222,250 218,276 222,302 C240,312 266,310 278,298 C288,284 284,262 272,250 C264,242 262,236 258,228 Z" fill="${sk}" ${gs(1.8)}/>`;
    L += `<path d="M258,252 C270,252 274,262 266,268" fill="none" ${gs(1)}/><path d="M246,284 C256,292 268,292 276,286" fill="none" stroke="${G}" stroke-width=".8" opacity=".7"/>`;
    // 雙臂捧著托盤
    L += `<path d="M244,238 C262,252 286,254 306,246" fill="none" stroke="${G}" stroke-width="12" stroke-linecap="round"/><path d="M244,238 C262,252 286,254 306,246" fill="none" stroke="${sk}" stroke-width="8.5" stroke-linecap="round"/>`;
    L += `<path d="M236,240 C246,262 272,270 300,262" fill="none" stroke="${G}" stroke-width="12" stroke-linecap="round"/><path d="M236,240 C246,262 272,270 300,262" fill="none" stroke="${skD}" stroke-width="8.5" stroke-linecap="round"/>`;
    L += `<path d="M290,240 H356 V246 H290 Z" fill="${GF}" ${gs(1.2)}/><path d="M298,246 V262 M348,246 V262" ${gs(1.4)}/>`;
    // 托盤上的供品：麵包、兩個水瓶、蓮花
    L += `<ellipse cx="306" cy="232" rx="9" ry="7" fill="#c8902e" ${gs(1)}/><path d="M318,240 C314,226 318,216 324,214 L324,208 H330 L330,214 C336,216 340,226 336,240 Z" fill="#173f45" ${gs(1.1)}/><path d="M338,240 C334,230 336,222 342,220 L342,214 H348 L348,220 C354,222 356,230 352,240 Z" fill="#173f45" ${gs(1.1)}/>`;
    L += `<path d="M314,226 C304,212 300,198 304,188 M304,188 l-8,-10 q8,-4 16,0 Z" fill="none" ${gs(1.2)}/><path d="M296,178 Q304,170 312,178 Q304,186 296,178 Z" fill="#c8432a" ${gs(.8)}/>`;
    // 從瓶口流下的水
    L += `<path d="M352,224 C366,226 372,250 368,290 C364,330 370,360 378,384" fill="none" stroke="${K.C.turq}" stroke-width="4" stroke-linecap="round" opacity=".9"/><path d="M356,226 C372,236 380,264 378,300 C376,336 384,362 394,384" fill="none" stroke="#9fd6e6" stroke-width="2" stroke-linecap="round" opacity=".8"/>`;
    L += `<path d="M350,${GY - 2} C370,${GY - 10} 404,${GY - 10} 424,${GY - 2} Z" fill="${K.C.turq}" opacity=".5" stroke="${G}" stroke-width=".8"/>`;
    // 頭、假鬍子、紙莎草頭冠
    L += `<path d="M244,206 C244,192 254,184 266,186 C276,188 282,196 282,206 C286,210 288,214 284,218 C280,222 278,226 276,230 C270,236 258,236 250,230 Z" fill="${sk}" ${gs(1.6)}/>`;
    L += `<path d="M266,202 C270,198 276,198 279,202 C276,205 270,206 266,202 Z" fill="#f2e7cc" stroke="#0d0907" stroke-width=".8"/><circle cx="273" cy="202" r="1.7" fill="#0d0907"/>`;
    L += `<path d="M274,232 L276,248 L282,246 L280,230 Z" fill="#14100c" ${gs(1)}/>`;
    L += `<path d="M240,196 C240,182 256,176 270,180 C276,182 280,188 280,192 C268,190 262,194 260,206 L258,234 C248,238 236,232 234,222 Z" fill="#14100c" ${gs(1.4)}/>`;
    for (const a of [-50, -25, 0, 25, 50]) { const r = a * Math.PI / 180; L += `<path d="M258,182 L${f(258 + Math.sin(r) * 30)},${f(182 - Math.cos(r) * 30)}" ${gs(1.4)}/><path d="M0,0 L-8,-12 Q0,-16 8,-12 Z" transform="translate(${f(258 + Math.sin(r) * 30)},${f(182 - Math.cos(r) * 30)}) rotate(${a})" fill="#173f45" ${gs(1.1)}/>`; }
    s += L;
    s += base(GY, 140, 340);
    return s;
  };

  // ───────── 阿比斯聖牛 ─────────
  // 神龕（naos）的門框裡，黑色聖牛大步走出：兩角間頂日輪，額上白色三角，背上披著禿鷲翅膀紋的布。
  SCENES.apis = () => {
    const T = theme(false), GY = K.GROUND;
    let s = T.bg(84, '#3a8a6a', 250, 260, 260);
    // 神龕：凹弧簷口＋圓線腳＋門框
    s += `<path d="M96,${GY} V176 H404 V${GY}" fill="#173a32" ${gs(2)}/><path d="M108,${GY} V188 H392 V${GY}" fill="none" ${gs(1)}/>`;
    s += `<path d="M90,176 H410 L420,140 C380,148 120,148 80,140 Z" fill="#15100d" ${gs(1.6)}/>` + Array.from({ length: 14 }, (_, i) => `<path d="M${102 + i * 22},174 L${98 + i * 22.4},150" stroke="${G}" stroke-width="1"/>`).join('');
    s += `<path d="M90,176 H410" stroke="${G}" stroke-width="5"/><path d="M90,176 H410" stroke="#15100d" stroke-width="2" stroke-dasharray="6 6"/>`;
    // 簷口上的有翼日輪
    s += `<circle cx="250" cy="160" r="9" fill="url(#SUN)" ${gs(1)}/><path d="M240,160 C220,152 190,154 168,160 C190,164 220,166 240,162 Z M260,160 C280,152 310,154 332,160 C310,164 280,166 260,162 Z" fill="${GF}" ${gs(.8)}/>`;
    s += K.glyphColumn(['V028', 'Q003'], 66, 190, 28, G, 10).svg;
    const blk = '#16110d';
    let L = '';
    // 遠側的腿
    L += `<path d="M178,300 C176,330 178,356 182,382 L198,382 C196,356 196,330 198,304 Z" fill="#0b0806" ${gs(1.4)}/><path d="M300,302 C304,330 310,356 316,382 L332,382 C326,356 322,328 318,300 Z" fill="#0b0806" ${gs(1.4)}/>`;
    L += `<path d="M180,382 h20 v6 h-22 Z M314,382 h20 v6 h-22 Z" fill="${GF}" ${gs(1)}/>`;
    // 尾巴
    L += `<path d="M146,236 C128,258 128,300 134,340" fill="none" stroke="${G}" stroke-width="6" stroke-linecap="round"/><path d="M146,236 C128,258 128,300 134,340" fill="none" stroke="${blk}" stroke-width="3.6" stroke-linecap="round"/><path d="M134,340 C126,350 128,362 136,364 C142,356 140,346 134,340 Z" fill="${blk}" ${gs(1)}/>`;
    // 身體＋頸＋頭
    const body = 'M146,242 C150,226 176,218 210,220 C244,222 270,212 292,200 C310,192 330,196 344,210 C352,218 358,224 364,230 C372,248 380,270 386,290 C388,300 380,306 370,304 C362,302 356,298 350,294 C344,304 336,312 324,318 C304,324 284,318 262,316 C236,314 210,316 188,314 C164,312 146,296 144,272 C144,262 144,252 146,242 Z';
    L += `<path d="${body}" fill="${blk}" ${gs(1.8)}/>`;
    // 背上的禿鷲翅膀布
    const cloth = 'M196,222 C232,226 270,220 300,208 L312,262 C278,276 236,280 200,276 Z';
    L += `<path d="${cloth}" fill="#1c3f7a" ${gs(1.2)}/>`;
    L += within(cloth, Array.from({ length: 9 }, (_, i) => `<path d="M${198 + i * 14},226 L${204 + i * 14},282" stroke="${i % 3 === 0 ? K.C.rose : i % 3 === 1 ? K.C.turq : GF}" stroke-width="6"/>`).join('') + `<path d="M190,240 C230,246 270,238 312,226" stroke="${GF}" stroke-width="4" fill="none"/>`);
    L += `<path d="${cloth}" fill="none" ${gs(1.2)}/>`;
    // 腿（近側）
    L += `<path d="M160,300 C158,330 160,356 166,382 L184,382 C180,356 180,330 184,306 Z" fill="${blk}" ${gs(1.6)}/><path d="M318,300 C326,328 334,354 340,382 L358,382 C350,354 344,324 340,298 Z" fill="${blk}" ${gs(1.6)}/>`;
    L += `<path d="M164,382 h22 v6 h-24 Z M338,382 h22 v6 h-24 Z" fill="${GF}" ${gs(1)}/>`;
    // 頸下垂肉、肌肉線
    L += `<path d="M346,286 C344,300 338,310 330,316" fill="none" ${gs(1)}/><path d="M300,220 C312,244 316,268 312,290 M200,232 C188,252 186,276 192,300" fill="none" stroke="${G}" stroke-width=".8" opacity=".6"/>`;
    // 臉：額上白色三角、眼睛、鼻孔
    L += `<path d="M354,236 L366,240 L358,252 Z" fill="#f2e7cc" stroke="#0d0907" stroke-width=".8"/>`;
    L += `<path d="M360,256 C364,252 371,252 374,256 C370,260 364,260 360,256 Z" fill="${GF}" stroke="#0d0907" stroke-width=".8"/><circle cx="367" cy="256" r="1.8" fill="#0d0907"/>`;
    L += `<path d="M378,292 C382,294 384,298 380,300" fill="none" ${gs(1)}/><path d="M352,294 C356,300 364,302 372,302" fill="none" stroke="${G}" stroke-width=".8"/>`;
    // 牛角（豎琴形）＋日輪＋聖蛇
    L += `<path d="M344,220 C326,214 318,198 324,180 C330,196 340,206 352,212 Z M356,218 C374,214 384,200 382,182 C374,196 364,204 350,210 Z" fill="${GF}" ${gs(1.2)}/>`;
    L += `<circle cx="352" cy="184" r="16" fill="url(#SUN)" ${gs(1.6)}/><circle cx="352" cy="184" r="10" fill="none" stroke="#ffd9a0" stroke-width=".8" opacity=".7"/>`;
    L += `<path d="M358,202 C366,200 370,192 368,186 C364,184 362,188 363,192 C363,196 360,199 356,200 Z" fill="${K.C.turq}" ${gs(.9)}/>`;
    s += L;
    s += base(GY, 130, 370);
    return s;
  };

  // ───────── 賽特 ─────────
  // 沙暴捲成的漩渦前，賽特獸站在岩頂：彎長的吻、方頂的豎耳、筆直分叉的尾巴。
  SCENES.set = () => {
    const T = theme(false), GY = K.GROUND;
    let s = T.bg(83, '#b8402a', 250, 236, 260);
    // 漩渦：一條金色螺旋＋沙粒
    let d = ''; for (let i = 0; i <= 220; i++) { const th = i / 220 * Math.PI * 7.2, r = 6 + i * .62; d += (i ? ' L' : 'M') + f(250 + Math.cos(th) * r) + ',' + f(232 + Math.sin(th) * r * .82); }
    s += `<path d="${d}" fill="none" stroke="${G}" stroke-width="1.6" opacity=".7"/>`;
    s += `<g fill="${GF}" opacity=".7">${Array.from({ length: 40 }, (_, i) => { const th = i * 2.4, r = 30 + (i * 37) % 120; return `<circle cx="${f(250 + Math.cos(th) * r)}" cy="${f(232 + Math.sin(th) * r * .8)}" r="${1 + (i % 3) * .6}"/>`; }).join('')}</g>`;
    // 閃電
    s += `<path d="M444,128 L428,170 L440,170 L420,214" fill="none" stroke="#fff0b0" stroke-width="3" stroke-linejoin="round"/><path d="M110,140 L98,180 L110,180 L92,222" fill="none" stroke="#fff0b0" stroke-width="2" stroke-linejoin="round" opacity=".8"/>`;
    s += K.glyphColumn(['S029', 'X001'], 66, 150, 28, G, 10).svg + K.glyphColumn(['N025'], 434, 300, 30, G, 0).svg;
    // 岩頂
    s += `<path d="M130,${GY} L150,350 L196,342 L260,346 L318,340 L360,350 L376,${GY} Z" fill="#2a1a10" ${gs(1.6)}/><path d="M164,356 L190,368 M300,350 L330,370 M230,350 L240,376" fill="none" stroke="${G}" stroke-width=".8" opacity=".6"/>`;
    const red = '#8e3a22', dk = '#5a2414';
    let L = '';
    // 遠側的腿
    L += `<path d="M210,292 L212,336 L206,372" fill="none" stroke="${G}" stroke-width="9" stroke-linecap="round"/><path d="M210,292 L212,336 L206,372" fill="none" stroke="${dk}" stroke-width="5.5" stroke-linecap="round"/><path d="M314,292 L328,334 L330,372" fill="none" stroke="${G}" stroke-width="9" stroke-linecap="round"/><path d="M314,292 L328,334 L330,372" fill="none" stroke="${dk}" stroke-width="5.5" stroke-linecap="round"/>`;
    // 尾巴：筆直上翹、末端分叉
    L += `<path d="M184,252 L172,214 L168,182" fill="none" stroke="${G}" stroke-width="10" stroke-linecap="round"/><path d="M184,252 L172,214 L168,182" fill="none" stroke="${red}" stroke-width="6" stroke-linecap="round"/><path d="M168,182 L156,160 M168,182 L180,158" fill="none" stroke="${G}" stroke-width="8" stroke-linecap="round"/><path d="M168,182 L156,160 M168,182 L180,158" fill="none" stroke="${red}" stroke-width="4" stroke-linecap="round"/>`;
    // 身體：細長的犬形
    L += `<path d="M180,262 C178,244 196,236 222,238 C252,240 280,240 304,234 C320,230 330,224 336,214 C344,198 356,190 368,194 L380,208 C386,214 390,222 390,230 C404,236 420,246 428,258 C430,264 424,268 416,266 C400,262 388,256 380,252 C372,262 358,272 344,284 C328,296 306,302 282,302 C256,302 232,300 210,296 C190,292 182,280 180,262 Z" fill="${red}" ${gs(1.8)}/>`;
    L += `<g stroke="${dk}" stroke-width="3" opacity=".8">${[0, 1, 2, 3, 4].map((i) => `<path d="M${214 + i * 22},246 l6,${30 - (i % 2) * 6}"/>`).join('')}</g>`;
    // 近側的腿
    L += `<path d="M194,284 L184,330 L190,372" fill="none" stroke="${G}" stroke-width="11" stroke-linecap="round"/><path d="M194,284 L184,330 L190,372" fill="none" stroke="${red}" stroke-width="7" stroke-linecap="round"/><path d="M298,290 L298,330 L308,372" fill="none" stroke="${G}" stroke-width="11" stroke-linecap="round"/><path d="M298,290 L298,330 L308,372" fill="none" stroke="${red}" stroke-width="7" stroke-linecap="round"/>`;
    L += `<path d="M180,372 h20 l-2,5 h-20 Z M298,372 h20 l-2,5 h-20 Z" fill="${GF}" ${gs(.9)}/>`;
    // 方頂豎耳
    L += `<path d="M364,196 L358,160 L376,156 L378,194 Z M380,200 L388,164 L404,170 L394,206 Z" fill="${red}" ${gs(1.6)}/><path d="M364,186 L362,166 L372,164 L373,186 Z" fill="${dk}" opacity=".7"/>`;
    // 眼與口
    L += `<path d="M380,220 C386,216 394,216 398,220 C394,224 386,225 380,220 Z" fill="#ffdc70" stroke="#0d0907" stroke-width=".9"/><circle cx="390" cy="220" r="1.8" fill="#0d0907"/>`;
    L += `<path d="M418,262 C406,262 394,258 384,252" fill="none" ${gs(1)}/>`;
    // 頸上的金環
    L += `<path d="M334,214 C344,226 350,240 352,252" fill="none" stroke="${G}" stroke-width="7"/><path d="M334,214 C344,226 350,240 352,252" fill="none" stroke="${K.C.turq}" stroke-width="3"/>`;
    s += `<g transform="translate(0,-28)">${L}</g>`;
    s += base(GY, 140, 360);
    return s;
  };

  // ───────── 沙漠蠍（普通卡：紙草底）─────────
  // 傳說伊西斯帶著小荷魯斯逃亡時，有七隻蠍子護送她：一隻大蠍在中央，六隻小蠍圍成一圈。
  const scorpion = (T, cx, cy, k, rot, body, dark) => {
    const st = T.gs(1.4 / k);
    let o = `<g transform="translate(${cx},${cy}) rotate(${rot}) scale(${k})">`;
    for (const sx of [-1, 1]) {
      for (let i = 0; i < 4; i++) o += `<path d="M${sx * 8},${-6 + i * 7} L${sx * (20 + i * 2)},${-10 + i * 9} L${sx * (26 + i * 2)},${-2 + i * 11}" fill="none" stroke="${T.G}" stroke-width="${3.2}" stroke-linecap="round" stroke-linejoin="round"/><path d="M${sx * 8},${-6 + i * 7} L${sx * (20 + i * 2)},${-10 + i * 9} L${sx * (26 + i * 2)},${-2 + i * 11}" fill="none" stroke="${dark}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`;
      o += `<path d="M${sx * 6},-18 L${sx * 18},-30 L${sx * 20},-40" fill="none" stroke="${T.G}" stroke-width="5" stroke-linecap="round"/><path d="M${sx * 6},-18 L${sx * 18},-30 L${sx * 20},-40" fill="none" stroke="${body}" stroke-width="3" stroke-linecap="round"/>`;
      o += `<path d="M${sx * 20},-38 C${sx * 30},-44 ${sx * 30},-58 ${sx * 22},-62 C${sx * 22},-54 ${sx * 20},-50 ${sx * 16},-48 C${sx * 12},-54 ${sx * 12},-60 ${sx * 14},-64 C${sx * 6},-58 ${sx * 8},-44 ${sx * 20},-38 Z" fill="${body}" ${st}/>`;
    }
    o += `<ellipse cx="0" cy="-10" rx="11" ry="13" fill="${body}" ${st}/><circle cx="-3" cy="-17" r="1.4" fill="${T.ink}"/><circle cx="3" cy="-17" r="1.4" fill="${T.ink}"/>`;
    for (let i = 0; i < 5; i++) o += `<rect x="${-12 + i * .8}" y="${3 + i * 6}" width="${24 - i * 1.6}" height="6.5" rx="3" fill="${body}" ${st}/>`;
    const tail = [[0, 38], [3, 46], [9, 53], [17, 57], [26, 56], [33, 50]];
    tail.forEach(([x, y], i) => { o += `<ellipse cx="${x}" cy="${y}" rx="${4.6 - i * .3}" ry="${4.2 - i * .3}" fill="${body}" ${st}/>`; });
    o += `<path d="M33,50 C40,46 42,38 38,32 C37,38 34,42 30,44 Z" fill="${dark}" ${st}/>`;
    return o + '</g>';
  };
  SCENES.scorp = () => {
    const T = theme(true), GY = K.GROUND;
    let s = T.bg(132, '#f6d48a', 250, 254, 220);
    // 沙紋光環
    for (const [r, w, c] of [[132, 2, LN], [120, 1, '#b6402a'], [96, 1.4, LN]]) s += `<ellipse cx="250" cy="254" rx="${r * 1.12}" ry="${r * .86}" fill="none" stroke="${c}" stroke-width="${w}" ${r === 120 ? 'stroke-dasharray="2 5"' : ''}/>`;
    s += `<ellipse cx="250" cy="254" rx="${96 * 1.12}" ry="${96 * .86}" fill="#e2b54c" opacity=".35"/>`;
    s += `<g fill="none" stroke="#c8902e" stroke-width="1.4" opacity=".8">${Array.from({ length: 6 }, (_, i) => `<path d="M${180 + i * 6},${214 + i * 16} q35,-10 70,0 t70,0"/>`).join('')}</g>`;
    // 六隻小蠍圍成一圈
    for (let i = 0; i < 6; i++) { const a = -90 + 30 + i * 60, r = a * Math.PI / 180; s += scorpion(T, f(250 + Math.cos(r) * 148), f(254 + Math.sin(r) * 112), .62, a + 90, '#c8902e', '#5a3416'); }
    // 中央的大蠍
    s += scorpion(T, 250, 262, 1.75, -10, '#dcae52', '#8a4a1c');
    s += K.glyphColumn(['N025', 'D021'], 60, 150, 26, LN, 8).svg;
    return s;
  };

  // ───────── 阿佩普 ─────────
  // 被吞到只剩一圈火光的太陽（日蝕）前，巨蛇阿佩普盤成一圈圈；身上插著刀，表示牠已被制伏。
  SCENES.apep = () => {
    const T = theme(false), GY = K.GROUND;
    let s = T.bg(133, '#6a2a8a', 250, 220, 260);
    // 日蝕：黑色圓盤＋紅色日冕
    for (let i = 0; i < 36; i++) { const a = i / 36 * Math.PI * 2, L = i % 2 ? 22 : 38; s += `<path d="M${f(250 + Math.cos(a - .05) * 84)},${f(214 + Math.sin(a - .05) * 84)} L${f(250 + Math.cos(a) * (84 + L))},${f(214 + Math.sin(a) * (84 + L))} L${f(250 + Math.cos(a + .05) * 84)},${f(214 + Math.sin(a + .05) * 84)} Z" fill="${i % 2 ? '#c8432a' : GF}" opacity=".6"/>`; }
    s += `<circle cx="250" cy="214" r="86" fill="#c8432a" opacity=".5"/><circle cx="250" cy="214" r="80" fill="#050403" ${gs(1.6)}/><circle cx="250" cy="214" r="72" fill="none" stroke="${G}" stroke-width=".8" stroke-dasharray="0.1 5" stroke-linecap="round"/>`;
    s += K.glyphColumn(['D036', 'G001', 'Q003', 'Q003'], 66, 140, 22, G, 6).svg;
    // 蛇身：擺線形成一圈圈的盤繞
    const pts = []; for (let i = 0; i <= 260; i++) { const tt = i / 260; pts.push([96 + 250 * tt - 26 * Math.sin(tt * Math.PI * 7), 318 - 34 * Math.cos(tt * Math.PI * 7) + tt * 10]); }
    const last = pts[pts.length - 1];
    let d = poly(pts) + ` C${f(last[0] + 30)},${f(last[1] - 10)} ${f(last[0] + 46)},${f(last[1] - 60)} ${f(last[0] + 30)},${f(last[1] - 96)}`;
    s += `<path d="${d}" fill="none" stroke="${G}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#1a1410" stroke-width="21" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += `<path d="${d}" fill="none" stroke="${K.C.turq}" stroke-width="7" stroke-dasharray="2 9" stroke-linejoin="round" opacity=".85"/><path d="${d}" fill="none" stroke="${GF}" stroke-width="2" stroke-dasharray="1 10" stroke-dashoffset="5" opacity=".9"/>`;
    // 尾尖
    s += `<path d="M${f(pts[0][0] - 4)},${f(pts[0][1] + 6)} L${f(pts[0][0] - 26)},${f(pts[0][1] + 14)} L${f(pts[0][0] + 2)},${f(pts[0][1] - 8)} Z" fill="#1a1410" ${gs(1.4)}/>`;
    // 頭：張口朝向太陽
    const hx = last[0] + 30, hy = last[1] - 96;
    s += `<g transform="translate(${f(hx)},${f(hy)}) rotate(-20)"><path d="M10,8 C4,-8 -14,-16 -36,-14 L-52,-22 L-40,-6 L-56,4 L-36,6 C-20,14 0,20 10,8 Z" fill="#1a1410" ${gs(1.8)}/><path d="M-40,-6 L-52,-22 M-36,6 L-56,4" stroke="#f2e7cc" stroke-width="1.6"/><path d="M-44,-14 L-42,-6 M-44,4 L-42,-2" stroke="#f2e7cc" stroke-width="2.2" stroke-linecap="round"/><circle cx="-18" cy="-6" r="3.4" fill="#e0402a" stroke="${G}" stroke-width=".8"/><path d="M-6,-10 C2,-4 6,2 6,8" fill="none" stroke="${K.C.turq}" stroke-width="2"/></g>`;
    // 插在身上的刀
    for (const k of [40, 92, 150, 204]) { const [x, y] = pts[k]; s += `<g transform="translate(${f(x)},${f(y)}) rotate(${k % 2 ? 14 : -10})"><path d="M-3,-4 L0,-46 L3,-4 Z" fill="#e8ecf2" ${gs(1)}/><rect x="-5" y="-4" width="10" height="4" fill="${GF}" ${gs(.8)}/><rect x="-2.6" y="0" width="5.2" height="14" fill="#8a5a30" ${gs(.8)}/></g>`; }
    s += base(GY, 130, 370);
    return s;
  };

  // ───────── 木乃伊戰士（普通卡：紙草底）─────────
  // 從墓室的「假門」走出來的守衛：全身亞麻繃帶、金色面具，一手長矛、一手牛皮盾。
  SCENES.mummy = () => {
    const T = theme(true), GY = K.GROUND;
    let s = T.bg(141, '#f6d48a', 250, 250, 220);
    // 假門：層層內縮的門框＋凹弧簷口＋上方的供桌浮雕
    const fd = (x0, x1, y0, fill) => `<path d="M${x0},${GY} V${y0} H${x1} V${GY}" fill="${fill}" ${T.gs(1.4)}/>`;
    s += `<path d="M112,150 H388 L396,128 C340,134 160,134 104,128 Z" fill="#3b7d58" ${T.gs(1.4)}/>` + Array.from({ length: 12 }, (_, i) => `<path d="M${122 + i * 23},148 L${118 + i * 23.4},132" stroke="${LN}" stroke-width="1.2"/>`).join('');
    s += fd(112, 388, 150, '#b6402a') + fd(136, 364, 176, '#c8902e') + fd(160, 340, 200, '#b6402a') + fd(186, 314, 226, '#3a2a1e');
    s += `<g fill="none" stroke="${LN}" stroke-width="1" opacity=".55">${[[124, 160], [148, 186], [172, 210]].map(([x, y]) => `<path d="M${x},${y + 14} V${GY - 6} M${500 - x},${y + 14} V${GY - 6}"/>`).join('')}</g>`;
    s += `<path d="M200,226 V${GY}" stroke="#e2b54c" stroke-width="1" opacity=".6"/>`;
    s += K.glyphColumn(['D028', 'X001'], 124, 192, 22, LN, 8).svg + K.glyphColumn(['S034'], 376, 200, 30, LN, 0).svg;
    const wrap = '#efe2c0', wl = '#a8946a';
    let L = '';
    // 長矛
    L += `<path d="M190,${GY - 4} V140" stroke="${LN}" stroke-width="7" stroke-linecap="round"/><path d="M190,${GY - 4} V140" stroke="#8a5a30" stroke-width="4" stroke-linecap="round"/><path d="M190,112 C198,124 198,136 190,146 C182,136 182,124 190,112 Z" fill="#c8902e" ${T.gs(1.2)}/>`;
    // 身體（繃帶）
    const body = 'M218,224 C232,216 268,216 282,224 C290,250 288,290 280,330 C276,354 272,372 268,384 L232,384 C228,372 224,354 220,330 C212,290 210,250 218,224 Z';
    L += `<path d="${body}" fill="${wrap}" ${T.gs(1.6)}/>`;
    L += within(body, Array.from({ length: 16 }, (_, i) => `<path d="M200,${226 + i * 11} L300,${216 + i * 11 + (i % 2 ? 8 : -2)}" stroke="${wl}" stroke-width="1.6"/>`).join(''));
    L += `<path d="${body}" fill="none" ${T.gs(1.6)}/>`;
    L += `<path d="M232,384 L230,${GY} H248 L248,384 Z M252,384 L252,${GY} H270 L268,384 Z" fill="${wrap}" ${T.gs(1.2)}/>`;
    // 手臂：右臂握矛、左臂舉盾
    L += `<path d="M222,232 C206,244 198,258 196,272" fill="none" stroke="${LN}" stroke-width="16" stroke-linecap="round"/><path d="M222,232 C206,244 198,258 196,272" fill="none" stroke="${wrap}" stroke-width="12" stroke-linecap="round"/><ellipse cx="192" cy="276" rx="8" ry="7" fill="${wrap}" ${T.gs(1.2)}/>`;
    L += `<path d="M278,232 C292,246 300,262 302,276" fill="none" stroke="${LN}" stroke-width="16" stroke-linecap="round"/><path d="M278,232 C292,246 300,262 302,276" fill="none" stroke="${wrap}" stroke-width="12" stroke-linecap="round"/>`;
    // 盾：上圓下平的牛皮盾
    L += `<path d="M282,338 V262 C282,238 338,238 338,262 V338 Z" fill="#7a3a1c" ${T.gs(1.8)}/><path d="M290,330 V264 C290,248 330,248 330,264 V330 Z" fill="#f2e7cc" ${T.gs(.8)}/>`;
    L += `<g fill="#3a2414">${[[300, 270], [318, 262], [310, 290], [298, 310], [322, 304], [314, 322]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="4.5"/>`).join('')}</g><circle cx="310" cy="282" r="5" fill="#e2b54c" ${T.gs(1)}/>`;
    // 金面具（條紋頭巾＋金臉）
    L += `<path d="M222,196 C222,166 278,166 278,196 L284,232 H264 L262,214 H238 L236,232 H216 Z" fill="#2c5d9c" ${T.gs(1.6)}/>`;
    L += within('M222,196 C222,166 278,166 278,196 L284,232 H264 L262,214 H238 L236,232 H216 Z', Array.from({ length: 8 }, (_, i) => `<path d="M210,${174 + i * 8} H290" stroke="#e2b54c" stroke-width="3.4"/>`).join(''));
    L += `<path d="M232,190 C232,174 268,174 268,190 C268,208 262,218 250,220 C238,218 232,208 232,190 Z" fill="#e2b54c" ${T.gs(1.6)}/>`;
    L += `<path d="M236,192 Q242,186 248,192 Q242,196 236,192 Z M252,192 Q258,186 264,192 Q258,196 252,192 Z" fill="#fff8e0" stroke="${LN}" stroke-width="1"/><circle cx="242" cy="192" r="2" fill="${LN}"/><circle cx="258" cy="192" r="2" fill="${LN}"/>`;
    L += `<path d="M234,186 L248,186 M252,186 L266,186 M250,196 V206 M244,212 H256" fill="none" stroke="${LN}" stroke-width="1.4" stroke-linecap="round"/><path d="M246,220 H254 L256,232 Q250,236 244,232 Z" fill="#2c5d9c" ${T.gs(1)}/>`;
    s += L;
    s += T.base(GY, 150, 350);
    return s;
  };

  // ───────── 奧西里斯（神話卡）─────────
  // 一圈發芽的麥穗光環（重生），兩旁是傑德柱；綠臉的奧西里斯正面站立，戴阿提夫冠，胸前交叉彎鉤與連枷。
  SCENES.osiris = () => {
    const T = theme(false), GY = K.GROUND;
    let s = T.bg(142, '#27b56a', 250, 236, 260);
    // 麥穗光環
    const cx = 250, cy = 240;
    for (let i = 0; i < 30; i++) {
      const a = i / 30 * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a), r0 = 104, r1 = i % 2 ? 140 : 156;
      s += `<path d="M${f(cx + c * r0)},${f(cy + sn * r0)} L${f(cx + c * r1)},${f(cy + sn * r1)}" stroke="${G}" stroke-width="1"/>`;
      for (let k = 0; k < 4; k++) { const rr = r0 + 14 + k * ((r1 - r0 - 14) / 4); for (const sd of [-1, 1]) s += `<ellipse cx="${f(cx + c * rr - sn * sd * 4)}" cy="${f(cy + sn * rr + c * sd * 4)}" rx="4.6" ry="2" transform="rotate(${f(a * 180 / Math.PI + sd * 30)} ${f(cx + c * rr - sn * sd * 4)} ${f(cy + sn * rr + c * sd * 4)})" fill="${GF}" opacity=".8"/>`; }
    }
    s += `<circle cx="${cx}" cy="${cy}" r="104" fill="#0d0907" ${gs(1.8)}/><circle cx="${cx}" cy="${cy}" r="96" fill="none" stroke="${G}" stroke-width="1" stroke-dasharray="0.1 5" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="96" fill="#27b56a" opacity=".12"/>`;
    // 兩旁的傑德柱
    const djed = (x) => `<g fill="#15100d" ${gs(1.4)}><path d="M${x - 10},${GY} V230 H${x + 10} V${GY} Z"/>${[0, 1, 2, 3].map((i) => `<path d="M${x - 22},${178 + i * 13} H${x + 22} V${188 + i * 13} H${x - 22} Z"/>`).join('')}<path d="M${x - 14},230 H${x + 14} V218 C${x + 10},210 ${x - 10},210 ${x - 14},218 Z"/></g>` + [0, 1, 2, 3].map((i) => K.diamond(x, 183 + i * 13, 3, 3, i % 2 ? K.C.turq : K.C.rose, 'none', 0)).join('');
    s += djed(70) + djed(430);
    s += K.glyphColumn(['Q001', 'D004'], 70, 270, 22, G, 10).svg + K.glyphColumn(['S038', 'S045'], 430, 270, 22, G, 10).svg;
    const green = '#1f6a3a', wrap = '#ece3cc';
    let L = '';
    // 身體：白色裹布，正面
    const body = 'M216,232 C230,224 270,224 284,232 C290,268 286,306 278,340 C274,360 270,374 268,386 H232 C230,374 226,360 222,340 C214,306 210,268 216,232 Z';
    L += `<path d="${body}" fill="${wrap}" ${gs(1.8)}/>`;
    L += within(body, `<path d="M250,300 V390" stroke="#c8b890" stroke-width="1.2"/>` + Array.from({ length: 9 }, (_, i) => `<path d="M206,${300 + i * 10} Q250,${306 + i * 10} 294,${300 + i * 10}" fill="none" stroke="#c8b890" stroke-width="1"/>`).join(''));
    L += `<path d="M228,330 H272 L270,344 H230 Z" fill="#c8432a" ${gs(1)}/><path d="M242,344 V384 M258,344 V384" stroke="#c8432a" stroke-width="3"/>`;
    // 雙手交叉，握彎鉤與連枷
    L += `<path d="M222,248 C236,276 258,282 274,276 M278,248 C264,276 242,282 226,276" fill="none" stroke="${G}" stroke-width="14" stroke-linecap="round"/><path d="M222,248 C236,276 258,282 274,276 M278,248 C264,276 242,282 226,276" fill="none" stroke="${green}" stroke-width="10" stroke-linecap="round"/>`;
    L += `<path d="M236,280 L262,212 M262,212 C268,196 286,198 284,212 C283,218 278,220 276,216" fill="none" stroke="${G}" stroke-width="7" stroke-linecap="round"/><path d="M236,280 L262,212 M262,212 C268,196 286,198 284,212 C283,218 278,220 276,216" fill="none" stroke="#1c3f7a" stroke-width="3.6" stroke-linecap="round"/>`;
    L += `<path d="M264,280 L240,214" stroke="${G}" stroke-width="7" stroke-linecap="round"/><path d="M264,280 L240,214" stroke="${GF}" stroke-width="3.6" stroke-linecap="round"/>` + [-12, 0, 12].map((x) => `<path d="M240,214 Q${232 + x * .4},200 ${226 + x},190" fill="none" stroke="${G}" stroke-width="4.6" stroke-linecap="round"/><path d="M240,214 Q${232 + x * .4},200 ${226 + x},190" fill="none" stroke="#c8432a" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 2"/>`).join('');
    // 寬領
    L += `<path d="M218,230 Q250,256 282,230 L280,240 Q250,266 220,240 Z" fill="${GF}" ${gs(1)}/><path d="M222,236 Q250,258 278,236" fill="none" stroke="${K.C.turq}" stroke-width="2.4"/>`;
    // 綠色的臉、假鬍子
    L += `<path d="M232,188 C232,168 268,168 268,188 C268,208 262,220 250,222 C238,220 232,208 232,188 Z" fill="${green}" ${gs(1.6)}/>`;
    L += `<path d="M236,192 Q242,186 248,192 Q242,196 236,192 Z M252,192 Q258,186 264,192 Q258,196 252,192 Z" fill="#f2e7cc" stroke="#0d0907" stroke-width="1"/><circle cx="242" cy="192" r="2" fill="#0d0907"/><circle cx="258" cy="192" r="2" fill="#0d0907"/>`;
    L += `<path d="M234,186 L248,186 M252,186 L266,186" stroke="#0d0907" stroke-width="1.8" stroke-linecap="round"/><path d="M250,196 V206 M244,212 H256" fill="none" stroke="#0d0907" stroke-width="1.3" stroke-linecap="round"/>`;
    L += `<path d="M245,222 H255 L258,240 Q250,246 242,240 Z" fill="#14100c" ${gs(1)}/>`;
    // 阿提夫冠：白冠＋兩根羽毛＋公羊角＋聖蛇
    L += `<path d="M236,176 C234,146 242,122 250,108 C258,122 266,146 264,176 Z" fill="${wrap}" ${gs(1.6)}/><circle cx="250" cy="106" r="5" fill="${GF}" ${gs(1)}/>`;
    L += `<path d="M236,174 C226,150 222,128 224,112 C230,126 234,146 238,168 Z M264,174 C274,150 278,128 276,112 C270,126 266,146 262,168 Z" fill="${GF}" ${gs(1.2)}/>`;
    L += `<path d="M236,178 C218,176 208,182 206,188 C216,186 226,186 236,186 Z M264,178 C282,176 292,182 294,188 C284,186 274,186 264,186 Z" fill="${GF}" ${gs(1)}/>`;
    L += `<path d="M250,172 C246,164 248,156 252,154 C255,158 254,164 252,168 Z" fill="${K.C.turq}" ${gs(.8)}/>`;
    s += `<g transform="translate(250,${GY}) scale(.92) translate(-250,-${GY})">${L}</g>`;
    s += base(GY, 150, 350);
    return s;
  };

  // ───────── 孔蘇 ─────────
  // 夜空上排著一整個月的月相（他是「旅行者」，也是計算月份的神），中央是新月托滿月；他乘月船渡過夜空。
  SCENES.khonsu = () => {
    const T = theme(false), GY = K.GROUND;
    let s = T.bg(151, '#3a5ab8', 250, 220, 260);
    // 月相弧
    for (let i = 0; i < 9; i++) {
      const a = Math.PI * (1.08 + i * .105), x = 250 + Math.cos(a) * 200, y = 330 + Math.sin(a) * 196, ph = i / 8;
      const id = uid('mp');
      s += `<clipPath id="${id}"><circle cx="${f(x)}" cy="${f(y)}" r="11"/></clipPath><circle cx="${f(x)}" cy="${f(y)}" r="11" fill="#1a2440" ${gs(1)}/>`;
      const off = i <= 4 ? -i / 4 * 22 : (8 - i) / 4 * 22;
      s += `<g clip-path="url(#${id})"><circle cx="${f(x)}" cy="${f(y)}" r="11" fill="#eef2fa"/><circle cx="${f(x + off)}" cy="${f(y)}" r="11" fill="#1a2440"/></g><circle cx="${f(x)}" cy="${f(y)}" r="11" fill="none" ${gs(1)}/>`;
    }
    // 中央：新月托著滿月
    s += `<circle cx="250" cy="214" r="64" fill="#eef2fa" ${gs(2)}/><circle cx="250" cy="214" r="54" fill="none" stroke="#b8c4e0" stroke-width="1.2"/><g fill="#cdd6ea"><circle cx="228" cy="196" r="10"/><circle cx="270" cy="228" r="14"/><circle cx="262" cy="192" r="5"/></g>`;
    s += `<path d="M168,226 C176,300 324,300 332,226 C316,272 184,272 168,226 Z" fill="${GF}" ${gs(1.6)}/>`;
    s += K.glyphColumn(['N011', 'N014'], 66, 150, 26, G, 10).svg + K.glyphColumn(['N014', 'N011'], 434, 150, 26, G, 10).svg;
    // 夜空中的河
    s += `<g fill="none" stroke="${G}" stroke-width="1" opacity=".6">${Array.from({ length: 9 }, (_, i) => `<path d="M${60 + i * 44},${GY - 6 - (i % 2) * 5} q11,-5 22,0 t22,0"/>`).join('')}</g>`;
    let L = '';
    // 月船
    L += `<path d="M110,330 C140,368 360,368 390,330 C384,360 350,380 250,380 C150,380 116,360 110,330 Z" fill="#15100d" ${gs(1.8)}/><path d="M110,330 C102,316 106,302 116,296 C118,308 116,318 122,328 Z M390,330 C398,316 394,302 384,296 C382,308 384,318 378,328 Z" fill="${GF}" ${gs(1.2)}/>`;
    L += `<path d="M126,350 C180,366 320,366 374,350" fill="none" stroke="${K.C.turq}" stroke-width="2.4"/>`;
    // 船上的小神龕
    L += `<path d="M300,350 V318 H340 V350 Z" fill="#15100d" ${gs(1.2)}/><path d="M296,318 H344 L340,310 H300 Z" fill="${GF}" ${gs(1)}/>`;
    L += '<g transform="translate(248,352) scale(.86) translate(-248,-352)">';
    // 孔蘇：側面、木乃伊形、側髮辮
    const sk = '#5a7ab8', wr = '#ece3cc';
    L += `<path d="M226,250 C238,244 258,244 266,252 C268,282 264,316 260,352 H232 C228,318 224,282 226,250 Z" fill="${wr}" ${gs(1.6)}/>`;
    L += within('M226,250 C238,244 258,244 266,252 C268,282 264,316 260,352 H232 C228,318 224,282 226,250 Z', Array.from({ length: 10 }, (_, i) => `<path d="M220,${262 + i * 9} L272,${258 + i * 9}" stroke="#c8b890" stroke-width="1"/>`).join(''));
    L += `<path d="M250,264 L262,236 M262,236 C264,226 276,226 276,236" fill="none" stroke="${G}" stroke-width="5" stroke-linecap="round"/><path d="M250,264 L262,236 M262,236 C264,226 276,226 276,236" fill="none" stroke="#1c3f7a" stroke-width="2.4" stroke-linecap="round"/>`;
    L += `<path d="M256,264 L272,240" stroke="${G}" stroke-width="5" stroke-linecap="round"/><path d="M256,264 L272,240" stroke="${GF}" stroke-width="2.4" stroke-linecap="round"/>` + [-6, 0, 6].map((x) => `<path d="M272,240 l${8 + x * .3},${-4 + x}" stroke="#c8432a" stroke-width="2"/>`).join('');
    L += `<ellipse cx="256" cy="264" rx="7" ry="6" fill="${sk}" ${gs(1)}/>`;
    L += `<path d="M228,250 C236,244 256,244 266,250 C262,258 250,262 238,260 Z" fill="${GF}" ${gs(1)}/>`;
    L += `<path d="M240,224 C240,210 252,204 262,206 C270,208 274,216 274,224 C278,228 278,232 274,234 C270,240 260,244 250,242 C244,240 240,232 240,224 Z" fill="${sk}" ${gs(1.6)}/>`;
    L += `<path d="M262,220 C265,217 270,217 272,220 C269,222 265,223 262,220 Z" fill="#f2e7cc" stroke="#0d0907" stroke-width=".8"/><circle cx="267" cy="220" r="1.4" fill="#0d0907"/>`;
    L += `<path d="M240,222 C238,210 248,202 262,204 C270,206 274,210 274,214 C262,212 254,216 252,226 Z" fill="#14100c" ${gs(1.2)}/><path d="M240,222 C232,232 232,248 238,258" fill="none" stroke="${G}" stroke-width="7" stroke-linecap="round"/><path d="M240,222 C232,232 232,248 238,258" fill="none" stroke="#14100c" stroke-width="4" stroke-linecap="round"/>`;
    L += `<path d="M268,240 L270,252 L276,250 L274,238 Z" fill="#1c3f7a" ${gs(.8)}/>`;
    // 頭上：小的新月托滿月
    L += `<path d="M240,204 C242,190 270,190 272,204 C266,196 246,196 240,204 Z" fill="${GF}" ${gs(1)}/><circle cx="256" cy="186" r="10" fill="#eef2fa" ${gs(1.2)}/>`;
    L += '</g>';
    s += L;
    return s;
  };
})();

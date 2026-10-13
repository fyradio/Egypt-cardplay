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
    let s = K.goldGround(X0, Y0, W.w, W.h, 33);
    s += glow(250, 286, 240, '#e0a02e', .42, .16);
    // 蓮花圓窗：兩圈花瓣
    const cx = 250, cy = 286;
    for (const [n, r0, r1, wd, op, fill] of [[16, 96, 150, 22, .9, '#0f0b08'], [16, 70, 112, 16, .8, '#15100b']]) {
      for (let i = 0; i < n; i++) {
        const a = (i + (r0 === 70 ? .5 : 0)) / n * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a), px = -sn, py = c;
        const x0 = cx + c * r0, y0 = cy + sn * r0, x1 = cx + c * r1, y1 = cy + sn * r1, mx = cx + c * (r0 + r1) / 2, my = cy + sn * (r0 + r1) / 2;
        s += `<path d="M${f(x0)},${f(y0)} Q${f(mx + px * wd)},${f(my + py * wd)} ${f(x1)},${f(y1)} Q${f(mx - px * wd)},${f(my - py * wd)} ${f(x0)},${f(y0)} Z" fill="${fill}" stroke="${G}" stroke-width="1.1" opacity="${op}"/>`;
        if (r0 === 96) s += `<path d="M${f(cx + c * (r0 + 10))},${f(cy + sn * (r0 + 10))} L${f(cx + c * (r1 - 14))},${f(cy + sn * (r1 - 14))}" stroke="${i % 2 ? K.C.turq : K.C.rose}" stroke-width="1.4" opacity=".8"/>`;
      }
    }
    s += `<circle cx="${cx}" cy="${cy}" r="70" fill="#0d0907" ${gs(1.8)}/><circle cx="${cx}" cy="${cy}" r="62" fill="none" stroke="${G}" stroke-width="1" stroke-dasharray="0.1 5" stroke-linecap="round"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="58" fill="#e0a02e" opacity=".12"/>`;
    // 兩側直行文字：獅子（E015）＋ 小的（G039 鴨子＝「兒子」）→ 用 M017
    s += `<g ${gs(1)}><path d="M70,140 V380 M430,140 V380"/></g>`;
    s += K.glyphColumn(['E015', 'M017'], 70, 150, 26, G, 8).svg + K.glyphColumn(['N005', 'S034'], 430, 150, 24, G, 10).svg;

    const FUR = '#7a4a1e', FURL = '#9a6428', FURD = '#4a2a10';
    let L = '';
    // 尾巴：翹起來、末端彎
    L += `<path d="M152,300 C128,288 118,262 126,240 C130,230 140,228 144,236" fill="none" stroke="${G}" stroke-width="9" stroke-linecap="round"/><path d="M152,300 C128,288 118,262 126,240 C130,230 140,228 144,236" fill="none" stroke="${FUR}" stroke-width="6" stroke-linecap="round"/>`;
    L += `<path d="M144,236 C150,226 160,230 156,240 C152,246 144,246 142,240 Z" fill="#3a1f0c" ${gs(1.2)}/>`;
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
})();

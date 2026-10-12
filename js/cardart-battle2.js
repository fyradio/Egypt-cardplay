/* 對戰模擬用卡牌的插圖（第二批：動物、魔法與陷阱） */
(function () {
  'use strict';
  const K = window.CardArt.kit, B = K.B;
  const { f, C, W, GROUND, SCENES, glyphRow, glyphColumn, rowWidth, papyrusGround, blockBand, lotusFrieze, papyrusPlant, sparkle } = K;
  const { templeBg, desertBg, nileBg, sunDisc, INK } = B;

  // ───────── 獅子（小母獅／母獅戰士） ─────────
  // 座標：腳底在 y=0，朝右。cub=true 時頭大腿短。
  function lion(cx, gy, k, o) {
    o = o || {};
    const tan = '#dcae52', shade = '#b8862e';
    let g = `<g transform="translate(${cx},${gy}) scale(${k})" stroke="${INK}" stroke-width="${f(1.6 / k)}" stroke-linejoin="round" stroke-linecap="round">`;
    // 尾巴
    g += `<path d="M-52,-50 Q-82,-56 -78,-22 Q-77,-12 -70,-8" fill="none" stroke-width="${f(5 / k)}"/><path d="M-52,-50 Q-82,-56 -78,-22 Q-77,-12 -70,-8" fill="none" stroke="${tan}" stroke-width="${f(2.8 / k)}"/>`;
    g += `<path d="M-74,-14 Q-66,-2 -76,2 Q-82,-6 -74,-14 Z" fill="#3a2414"/>`;
    // 後腿、前腿（遠側）
    g += `<path d="M-30,-30 L-30,-2 L-18,-2 L-18,-30 Z" fill="${shade}"/><path d="M26,-30 L28,-2 L40,-2 L38,-30 Z" fill="${shade}"/>`;
    // 身體
    g += `<path d="M-56,-40 Q-60,-66 -34,-68 Q-4,-72 22,-66 Q40,-70 52,-64 L50,-34 Q34,-24 10,-28 Q-12,-24 -34,-28 Q-52,-24 -56,-40 Z" fill="${tan}"/>`;
    g += `<g fill="none" stroke="${shade}" stroke-width="${f(1.2 / k)}"><path d="M-20,-62 q-4,12 0,24 M-4,-64 q-4,12 0,26 M12,-62 q-4,12 0,24"/></g>`;
    // 近側腿
    g += `<path d="M-48,-36 Q-54,-18 -46,-2 L-30,-2 L-32,-8 Q-36,-20 -32,-34 Z" fill="${tan}"/><path d="M-48,-2 H-28" stroke-width="${f(3 / k)}"/>`;
    g += `<path d="M30,-36 Q34,-18 32,-2 L48,-2 L46,-8 Q44,-22 48,-36 Z" fill="${tan}"/><path d="M30,-2 H50" stroke-width="${f(3 / k)}"/>`;
    if (o.shield) {
      g += `<g transform="translate(-6,-48)"><circle r="22" fill="#b6402a"/><circle r="22" fill="none" stroke="#e2b54c" stroke-width="${f(3 / k)}"/><circle r="6.5" fill="#e2b54c"/><path d="M0,-22 V22 M-22,0 H22" stroke="#e2b54c" stroke-width="${f(1.5 / k)}"/></g>`;
    }
    // 頭（cub 時放大）
    const hs = o.cub ? 1.22 : 1;
    g += `<g transform="translate(52,-64) scale(${hs}) translate(-52,64)">`;
    g += `<path d="M42,-62 Q40,-90 60,-92 Q80,-92 82,-72 Q86,-62 76,-54 L50,-50 Z" fill="${tan}"/>`;
    g += `<path d="M42,-84 Q40,-102 56,-98 Q62,-92 58,-84 Z" fill="${tan}"/><path d="M47,-88 Q47,-96 54,-94" fill="none" stroke="${shade}" stroke-width="${f(1.4 / k)}"/>`;
    g += `<path d="M64,-68 Q76,-70 84,-64 Q88,-60 84,-55 Q76,-51 66,-54 Z" fill="#efdcaf"/>`;
    g += `<ellipse cx="85" cy="-61" rx="3.2" ry="2.4" fill="#3a2414"/>`;
    g += `<path d="M66,-76 Q72,-80 78,-76 Q73,-72 66,-76 Z" fill="#fff8e0"/><circle cx="73" cy="-76" r="1.8" fill="#2a1a10"/>`;
    g += `<path d="M64,-80 L74,-83" fill="none" stroke-width="${f(1.4 / k)}"/><path d="M86,-56 Q80,-52 72,-54" fill="none" stroke-width="${f(1.2 / k)}"/>`;
    g += `</g>`;
    if (o.armor) {
      g += `<g transform="translate(46,-52)"><path d="M-12,-8 Q4,12 24,-8" fill="none" stroke="#1b1410" stroke-width="${f(10 / k)}"/><path d="M-12,-8 Q4,12 24,-8" fill="none" stroke="#2c5d9c" stroke-width="${f(7 / k)}"/><path d="M-10,-4 Q4,13 22,-4" fill="none" stroke="#e2b54c" stroke-width="${f(3.4 / k)}" stroke-dasharray="1.8 2.2"/></g>`;
    }
    if (o.amulet) g += `<path d="M38,-48 Q46,-40 54,-48" fill="none" stroke="#b6402a" stroke-width="${f(3 / k)}"/><circle cx="46" cy="-40" r="4.5" fill="#2c5d9c"/>`;
    return g + '</g>';
  }

  // ───────── 阿比斯聖牛 ─────────
  SCENES.apis = () => {
    let s = nileBg(83);
    s += papyrusPlant(66, GROUND - 4, 1);
    const k = 2.0, black = '#1d1a1c';
    s += `<g transform="translate(232,${GROUND - 4}) scale(${k})" stroke="${INK}" stroke-width="${f(1.5 / k)}" stroke-linejoin="round" stroke-linecap="round">`;
    s += `<path d="M-58,-62 Q-74,-52 -70,-20 Q-69,-10 -63,-4" fill="none" stroke-width="${f(4 / k)}"/><path d="M-58,-62 Q-74,-52 -70,-20 Q-69,-10 -63,-4" fill="none" stroke="${black}" stroke-width="${f(2.2 / k)}"/><path d="M-67,-12 Q-60,0 -69,4 Q-75,-4 -67,-12 Z" fill="${black}"/>`;
    s += `<path d="M-30,-30 L-30,-2 L-19,-2 L-19,-30 Z" fill="#2b262a"/><path d="M26,-30 L28,-2 L38,-2 L36,-30 Z" fill="#2b262a"/>`;
    s += `<path d="M-60,-46 Q-64,-76 -36,-78 Q-8,-82 18,-78 Q32,-84 46,-74 L50,-48 Q36,-30 10,-30 Q-14,-26 -36,-30 Q-56,-28 -60,-46 Z" fill="${black}"/>`;
    s += `<path d="M-50,-40 Q-56,-20 -48,-2 L-31,-2 L-33,-8 Q-37,-22 -33,-36 Z" fill="${black}"/><path d="M30,-38 Q34,-20 32,-2 L46,-2 L44,-8 Q42,-22 46,-38 Z" fill="${black}"/>`;
    s += `<path d="M-50,-2 H-30 M32,-2 H48" stroke-width="${f(3 / k)}"/>`;
    // 背上的彩色披巾與禿鷹形白斑
    s += `<path d="M-40,-79 Q-4,-86 30,-78 L26,-52 Q-4,-56 -36,-54 Z" fill="#b6402a"/><path d="M-40,-79 Q-4,-86 30,-78 L29,-72 Q-4,-79 -39,-73 Z" fill="#2c5d9c"/><path d="M-37,-60 Q-4,-64 27,-58 L26,-52 Q-4,-56 -36,-54 Z" fill="#e2b54c"/>`;
    s += `<path d="M38,-64 q8,-3 12,2 q-4,4 -12,2 z" fill="#f4ecd4"/>`;
    // 頭
    s += `<path d="M44,-76 Q44,-100 62,-98 Q76,-96 82,-82 Q90,-66 82,-52 L64,-46 L50,-52 Z" fill="${black}"/>`;
    s += `<path d="M62,-94 L68,-80 L56,-80 Z" fill="#f4ecd4"/>`;
    s += `<path d="M52,-92 Q36,-108 44,-120 Q52,-108 62,-100" fill="#f4ecd4"/><path d="M82,-92 Q96,-108 90,-122 Q84,-108 74,-100" fill="#f4ecd4"/>`;
    s += `<ellipse cx="82" cy="-56" rx="6" ry="4" fill="#3a2a2e"/><circle cx="84" cy="-58" r="1.4" fill="#8a7a7e"/>`;
    s += `<path d="M64,-84 Q70,-88 76,-84 Q71,-80 64,-84 Z" fill="#fff8e0"/><circle cx="71" cy="-84" r="2" fill="${INK}"/>`;
    s += `<path d="M56,-60 Q50,-52 58,-48" fill="none"/>`;
    // 兩角之間的日輪與聖蛇
    s += `<circle cx="67" cy="-122" r="9" fill="#c8432a"/><path d="M60,-117 Q55,-110 50,-112" fill="none" stroke="#e2b54c" stroke-width="${f(2.4 / k)}"/><path d="M75,-116 Q79,-109 84,-111" fill="none" stroke="#e2b54c" stroke-width="${f(2.4 / k)}"/>`;
    s += `</g>`;
    s += glyphColumn(['E016', 'O001'], 122, 150, 28, '#1b1714', 6).svg;
    return s;
  };

  // ───────── 巴斯泰特 ─────────
  SCENES.bastet = () => {
    let s = templeBg(84, ['#2c5d9c', '#e2b54c', '#2c5d9c', '#e2b54c']);
    s += `<g opacity=".95">${sunDisc(250, 230, 100, '#e9e1c8')}</g>`;
    s += `<g fill="#cfc7ad" opacity=".55"><circle cx="205" cy="190" r="14"/><circle cx="292" cy="258" r="20"/><circle cx="238" cy="282" r="9"/></g>`;
    const cx = 250, k = 2.1, black = '#1a1716';
    s += `<g transform="translate(${cx},${GROUND}) scale(${k})" stroke="${INK}" stroke-width="${f(1.6 / k)}" stroke-linejoin="round" stroke-linecap="round">`;
    s += `<path d="M30,-4 Q70,-6 66,-38 Q64,-60 50,-60" fill="none" stroke-width="${f(8 / k)}"/><path d="M30,-4 Q70,-6 66,-38 Q64,-60 50,-60" fill="none" stroke="${black}" stroke-width="${f(5 / k)}"/>`;
    s += `<path d="M-38,0 Q-52,-60 -16,-104 Q2,-114 22,-104 Q44,-62 38,0 Z" fill="${black}"/>`;
    s += `<path d="M10,-92 Q16,-50 14,-2 L36,-2 Q40,-50 26,-96 Z" fill="#2a2426"/><path d="M12,-2 H38" stroke-width="${f(3 / k)}"/><path d="M20,-6 V-30 M28,-6 V-34" stroke="#3a3234" stroke-width="${f(1 / k)}"/>`;
    // 頭
    s += `<path d="M-14,-132 L-12,-158 L2,-142 Q10,-146 20,-142 L34,-158 L36,-132 Q42,-118 34,-108 Q10,-96 -8,-108 Q-18,-118 -14,-132 Z" fill="${black}"/>`;
    s += `<path d="M-10,-140 L-9,-152 L-1,-143 Z M30,-143 L33,-152 L32,-139 Z" fill="#e2b54c" opacity=".8" stroke="none"/>`;
    s += `<path d="M-2,-126 Q4,-131 10,-126 Q4,-121 -2,-126 Z M18,-126 Q24,-131 30,-126 Q24,-121 18,-126 Z" fill="#f2d77e"/><ellipse cx="4" cy="-126" rx="1.2" ry="4" fill="${INK}" stroke="none"/><ellipse cx="24" cy="-126" rx="1.2" ry="4" fill="${INK}" stroke="none"/>`;
    s += `<path d="M10,-120 L14,-120 L12,-116 Z" fill="#c98a6a"/><path d="M12,-116 Q8,-111 2,-113 M12,-116 Q16,-111 22,-113" fill="none" stroke="#c98a6a" stroke-width="${f(1 / k)}"/>`;
    s += `<g stroke="#c98a6a" stroke-width="${f(0.8 / k)}" fill="none"><path d="M-6,-120 H-20 M-6,-116 H-18 M30,-120 H44 M30,-116 H42"/></g>`;
    // 項圈與耳環
    s += `<path d="M-14,-104 Q10,-90 36,-104" fill="none" stroke="${INK}" stroke-width="${f(11 / k)}"/><path d="M-14,-104 Q10,-90 36,-104" fill="none" stroke="#e2b54c" stroke-width="${f(8 / k)}"/><path d="M-12,-102 Q10,-88 34,-102" fill="none" stroke="#2c5d9c" stroke-width="${f(3.6 / k)}" stroke-dasharray="2.4 2.6"/>`;
    s += `<path d="M-14,-142 q-6,2 -5,9" fill="none" stroke="#e2b54c" stroke-width="${f(1.4 / k)}"/><circle cx="-19" cy="-131" r="2.6" fill="#e2b54c"/>`;
    s += `</g>`;
    s += glyphColumn(['B001', 'X001'], 122, 150, 28, '#1b1714', 6).svg;
    return s;
  };

  // ───────── 沙漠蠍 ─────────
  SCENES.scorp = () => {
    let s = desertBg(85, '#c8432a', [370, 196, 52]);
    const body = '#b87a2a', dark = '#6a4412';
    const g = (inner) => `<g stroke="${INK}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">${inner}</g>`;
    let sc = '';
    // 腳（四對）
    for (const [x0, y0, x1, y1, x2, y2] of [[220, 300, 170, 290, 150, 318], [222, 318, 172, 322, 156, 352], [280, 300, 330, 290, 350, 318], [278, 318, 328, 322, 344, 352], [226, 334, 190, 350, 176, 378], [274, 334, 310, 350, 324, 378]]) sc += `<path d="M${x0},${y0} L${x1},${y1} L${x2},${y2}" fill="none" stroke-width="8"/><path d="M${x0},${y0} L${x1},${y1} L${x2},${y2}" fill="none" stroke="${dark}" stroke-width="4"/>`;
    // 螯
    for (const d of [-1, 1]) {
      const X = (x) => 250 + d * x;
      sc += `<path d="M${X(24)},282 Q${X(54)},262 ${X(62)},232" fill="none" stroke-width="12"/><path d="M${X(24)},282 Q${X(54)},262 ${X(62)},232" fill="none" stroke="${body}" stroke-width="8"/>`;
      sc += `<path d="M${X(62)},232 Q${X(86)},224 ${X(78)},196 Q${X(70)},214 ${X(56)},212 Q${X(48)},224 ${X(62)},232 Z" fill="${body}"/>`;
      sc += `<path d="M${X(62)},232 Q${X(52)},222 ${X(64)},206" fill="none" stroke-width="2.4"/>`;
    }
    // 尾巴：從腹部彎向上方
    const seg = [[250, 340, 17], [252, 362, 15], [258, 380, 13], [270, 394, 11.5], [290, 400, 10], [310, 392, 9], [322, 372, 8], [322, 346, 7.2], [310, 326, 6.5]];
    // 先畫腹部
    sc += `<path d="M232,296 Q226,330 238,352 Q250,368 262,352 Q274,330 268,296 Z" fill="${body}"/>`;
    sc += `<g stroke-width="1.6" fill="none" stroke="${INK}"><path d="M232,312 H268 M234,326 H266 M238,340 H262 M242,352 H258"/></g>`;
    seg.forEach(([x, y, r], i) => { sc += `<circle cx="${x}" cy="${y - (i === 0 ? 8 : 0)}" r="${r}" fill="${i % 2 ? '#c88a38' : body}"/>`; });
    sc += `<path d="M310,322 Q330,300 318,284 Q312,288 316,298 Q300,300 304,318 Z" fill="#8d3f20"/>`;
    // 頭胸甲
    sc += `<path d="M222,282 Q222,254 250,250 Q278,254 278,282 Q278,306 250,310 Q222,306 222,282 Z" fill="${body}"/><path d="M236,266 Q250,258 264,266 M232,286 H268" fill="none" stroke="${dark}" stroke-width="2"/>`;
    sc += `<circle cx="242" cy="264" r="4" fill="#f2d77e"/><circle cx="258" cy="264" r="4" fill="#f2d77e"/><circle cx="242" cy="264" r="1.5" fill="${INK}"/><circle cx="258" cy="264" r="1.5" fill="${INK}"/>`;
    s += g(sc);
    s += glyphColumn(['N025', 'D021'], 118, 150, 28, '#1b1714', 6).svg;
    return s;
  };

  // ───────── 阿佩普 ─────────
  SCENES.apep = () => {
    let s = papyrusGround(W.x, W.y, W.w, W.h, 86);
    s += blockBand(W.x, W.y, W.w, 9, ['#2c5d9c', '#b6402a', '#2c5d9c', '#3a2a50']);
    s += `<rect x="${W.x}" y="${W.y + 9}" width="${W.w}" height="${W.h - 9}" fill="#3a2f5c" opacity=".26"/>`;
    s += lotusFrieze(W.x, W.y + 9, W.w, 15);
    for (let i = 0; i < 18; i++) s += sparkle(W.x + 18 + ((i * 89) % 410), W.y + 40 + ((i * 47) % 260), 3 + (i % 3), '#e2b54c');
    // 河（冥界之水）
    s += `<rect x="${W.x}" y="${GROUND - 4}" width="${W.w}" height="${W.y + W.h - GROUND + 4}" fill="#2c3f6c"/><path d="M${W.x},${GROUND - 4} H${W.x + W.w}" stroke="${INK}" stroke-width="2"/>`;
    const path = 'M392,214 C340,160 230,168 196,214 C168,254 238,282 300,292 C378,304 420,342 330,364 C260,380 170,370 120,350';
    const sw = (w, c, extra) => `<path d="${path}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${extra || ''}/>`;
    s += sw(44, INK) + sw(37, '#26202e') + sw(26, '#4c3a66', 'stroke-dasharray="3 5"') + sw(10, '#b6402a', 'opacity=".85" stroke-dasharray="14 7"');
    // 鱗片
    s += sw(34, '#6a5486', 'stroke-dasharray="1.5 9" opacity=".8"');
    // 頭
    s += `<g transform="translate(392,214)" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"><path d="M-6,-28 Q26,-34 52,-14 Q60,-4 52,8 Q30,26 -4,22 Q-22,6 -6,-28 Z" fill="#26202e"/><path d="M6,-8 Q28,-22 48,-8" fill="none" stroke="#4c3a66" stroke-width="3"/>`;
    s += `<path d="M44,6 Q56,10 64,4 Q56,16 42,14 Z" fill="#f4ecd4"/><path d="M52,-2 L60,-14 L58,2 Z" fill="#f4ecd4"/>`;
    s += `<path d="M20,-12 Q30,-20 40,-12 Q30,-6 20,-12 Z" fill="#f2d77e"/><ellipse cx="30" cy="-12.5" rx="1.6" ry="4.5" fill="${INK}" stroke="none"/>`;
    s += `<path d="M62,6 Q82,4 92,-6 M62,6 Q82,10 94,18" fill="none" stroke="#b6402a" stroke-width="3.4"/></g>`;
    // 插在身上的刀
    const knives = [[246, 168, -30], [190, 232, 40], [330, 300, -50], [292, 372, 20]];
    for (const [x, y, a] of knives) s += `<g transform="translate(${x},${y}) rotate(${a})" stroke="${INK}" stroke-width="1.8"><path d="M0,-30 L5,2 L-5,2 Z" fill="#cfd6dc"/><rect x="-9" y="2" width="18" height="5" fill="#e2b54c"/><rect x="-3" y="7" width="6" height="16" fill="#8a5a30"/></g>`;
    s += glyphColumn(['I009', 'N025'], 118, 150, 28, '#e2b54c', 6).svg;
    return s;
  };

  // ───────── 魔法：赫卡之焰 ─────────
  SCENES.heka = () => {
    let s = papyrusGround(W.x, W.y, W.w, W.h, 87);
    s += blockBand(W.x, W.y, W.w, 9, ['#b6402a', '#e2b54c', '#2c5d9c', '#b6402a']);
    s += lotusFrieze(W.x, W.y + 9, W.w, 15);
    const cx = 220, cy = 252;
    s += `<g stroke="#c8902e" stroke-width="2" opacity=".5">${Array.from({ length: 36 }, (_, i) => { const a = i / 36 * 6.2832; return `<path d="M${f(cx + Math.cos(a) * 120)},${f(cy + Math.sin(a) * 120)} L${f(cx + Math.cos(a) * (i % 2 ? 156 : 142))},${f(cy + Math.sin(a) * (i % 2 ? 156 : 142))}"/>`; }).join('')}</g>`;
    s += sunDisc(cx, cy, 108, '#e2b54c');
    // 眼鏡蛇
    s += `<g stroke="${INK}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">`;
    s += `<path d="M150,396 Q330,380 250,350 Q150,322 224,290" fill="none" stroke-width="40"/><path d="M150,396 Q330,380 250,350 Q150,322 224,290" fill="none" stroke="#3b7d58" stroke-width="32"/><path d="M150,396 Q330,380 250,350 Q150,322 224,290" fill="none" stroke="#e2b54c" stroke-width="16" stroke-dasharray="6 5" opacity=".9"/>`;
    s += `<path d="M224,296 Q196,250 214,226 L214,206 Q232,196 250,204 Q266,214 262,230 Q282,236 294,266 Q284,292 252,298 Z" fill="#3b7d58"/>`;
    s += `<path d="M205,232 Q196,200 224,178 Q258,168 276,192 Q282,214 264,228 Q238,238 205,232 Z" fill="#2f6a4a"/>`;
    s += `<path d="M226,226 Q242,260 250,296" fill="none" stroke="#e2b54c" stroke-width="3"/><path d="M230,236 Q250,236 256,232" fill="none" stroke="#b6402a" stroke-width="5"/>`;
    s += `<path d="M252,196 Q262,188 272,196 Q262,204 252,196 Z" fill="#f2d77e"/><ellipse cx="262" cy="196" rx="1.6" ry="4" fill="${INK}" stroke="none"/>`;
    s += `</g>`;
    // 火焰
    s += `<g stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"><path d="M276,206 Q316,160 372,176 Q350,190 392,204 Q356,214 380,238 Q340,236 322,252 Q308,222 276,222 Z" fill="#c8432a"/><path d="M282,210 Q316,184 352,192 Q338,204 362,214 Q332,222 316,236 Q304,216 284,218 Z" fill="#ef8a3a"/><path d="M286,213 Q312,200 334,206 Q322,214 338,220 Q318,224 308,230 Q298,218 286,218 Z" fill="#f6d46a"/></g>`;
    s += `<g fill="#f6d46a" stroke="${INK}" stroke-width="1">${[[404, 190, 4], [418, 216, 3], [396, 250, 3.4], [352, 150, 3], [372, 142, 2.4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>`;
    s += `<rect x="${W.x}" y="372" width="${W.w}" height="48" fill="#e2b54c"/><path d="M${W.x},372 H${W.x + W.w}" stroke="${INK}" stroke-width="2"/>`;
    const t = ['I010', 'D021', 'S034'];
    s += glyphRow(t, 250 - rowWidth(t, 30, 8) / 2, 410, 30, '#1b1714', 8).svg;
    return s;
  };

  // ───────── 魔法：融合・合體神 ─────────
  SCENES.fusion = () => {
    let s = papyrusGround(W.x, W.y, W.w, W.h, 88);
    s += blockBand(W.x, W.y, W.w, 9, ['#2c5d9c', '#b6402a', '#e2b54c', '#2c5d9c']);
    s += lotusFrieze(W.x, W.y + 9, W.w, 15);
    const cy = 242, r = 82, ax = 200, bx = 300;
    s += `<g stroke="#c8902e" stroke-width="2" opacity=".5">${Array.from({ length: 32 }, (_, i) => { const a = i / 32 * 6.2832; return `<path d="M${f(250 + Math.cos(a) * 130)},${f(cy + Math.sin(a) * 130)} L${f(250 + Math.cos(a) * (i % 2 ? 168 : 152))},${f(cy + Math.sin(a) * (i % 2 ? 168 : 152))}"/>`; }).join('')}</g>`;
    s += `<clipPath id="fa"><circle cx="${ax}" cy="${cy}" r="${r}"/></clipPath><clipPath id="fb"><circle cx="${bx}" cy="${cy}" r="${r}"/></clipPath>`;
    s += `<circle cx="${ax}" cy="${cy}" r="${r + 5}" fill="${INK}"/><circle cx="${bx}" cy="${cy}" r="${r + 5}" fill="${INK}"/>`;
    s += `<circle cx="${ax}" cy="${cy}" r="${r}" fill="#c8432a"/><circle cx="${bx}" cy="${cy}" r="${r}" fill="#2c5d9c"/>`;
    s += `<g clip-path="url(#fa)"><circle cx="${bx}" cy="${cy}" r="${r}" fill="#e2b54c"/></g>`;
    s += `<g fill="none" stroke="${INK}" stroke-width="2.4"><circle cx="${ax}" cy="${cy}" r="${r}"/><circle cx="${bx}" cy="${cy}" r="${r}"/></g>`;
    s += `<g fill="none" stroke="#f4ecd4" stroke-width="2" opacity=".8"><circle cx="${ax}" cy="${cy}" r="${r - 12}" stroke-dasharray="1 7" stroke-linecap="round"/><circle cx="${bx}" cy="${cy}" r="${r - 12}" stroke-dasharray="1 7" stroke-linecap="round"/></g>`;
    // 安卡
    s += `<g transform="translate(250,${cy - 54}) scale(1.0)">${K.ankh(0, 0, 108, '#f4ecd4', INK, 2.4)}</g>`;
    // 繩紋：兩股繩纏繞
    let a = `M${ax - r},${cy + 118}`, b = a;
    for (let i = 0; i < 20; i++) { const x = ax - r + i * ((bx + r - ax + r) / 20), k = i % 2 ? -1 : 1; a += ` Q${f(x + 9)},${cy + 118 + k * 8} ${f(x + 18)},${cy + 118}`; b += ` Q${f(x + 9)},${cy + 118 - k * 8} ${f(x + 18)},${cy + 118}`; }
    s += `<g fill="none" stroke-linecap="round"><path d="${a}" stroke="${INK}" stroke-width="8"/><path d="${b}" stroke="${INK}" stroke-width="8"/><path d="${a}" stroke="#b6402a" stroke-width="4.4"/><path d="${b}" stroke="#2c5d9c" stroke-width="4.4"/></g>`;
    s += `<rect x="${W.x}" y="378" width="${W.w}" height="42" fill="#e2b54c"/><path d="M${W.x},378 H${W.x + W.w}" stroke="${INK}" stroke-width="2"/>`;
    const t = ['N005', 'S034', 'R014'];
    s += glyphRow(t, 250 - rowWidth(t, 28, 8) / 2, 412, 28, '#1b1714', 8).svg;
    return s;
  };

  // ───────── 陷阱：沙坑 ─────────
  function sandLayers(seed) {
    let s = papyrusGround(W.x, W.y, W.w, W.h, seed);
    s += blockBand(W.x, W.y, W.w, 9, ['#e2b54c', '#b6402a', '#e2b54c', '#2c5d9c']);
    s += `<rect x="${W.x}" y="${W.y + 9}" width="${W.w}" height="130" fill="#efdcaf" opacity=".5"/>`;
    s += `<g opacity=".7">${sunDisc(380, 190, 44, '#c8432a')}</g>`;
    return s;
  }
  SCENES.pit = () => {
    let s = sandLayers(89);
    const top = 268;
    // 剖面：沙層
    s += `<path d="M${W.x},${top} H${W.x + W.w} V${W.y + W.h} H${W.x} Z" fill="#dcae52" stroke="${INK}" stroke-width="2"/>`;
    for (const [y, c] of [[300, '#c8902e'], [338, '#b8782a'], [376, '#a8661e']]) s += `<path d="M${W.x},${y} q60,-10 120,0 t120,0 t120,0 t80,0 V${y + 40} H${W.x} Z" fill="${c}" stroke="${INK}" stroke-width="1.2" opacity=".9"/>`;
    // 坑
    s += `<path d="M150,${top} L190,418 H312 L352,${top} Z" fill="#2a1a10" stroke="${INK}" stroke-width="2.4"/>`;
    s += `<g stroke="${INK}" stroke-width="1.6" fill="#e8d3a0">${[200, 226, 252, 278, 304].map((x, i) => `<path d="M${x},418 L${x + 9},${352 - (i % 2) * 16} L${x + 18},418 Z"/>`).join('')}</g>`;
    // 蓋在坑口的蘆葦蓆（破了一半）
    s += `<path d="M138,${top - 4} H250 L236,${top + 14} L214,${top + 6} L188,${top + 18} L150,${top + 10} Z" fill="#c8a85a" stroke="${INK}" stroke-width="2"/><path d="M146,${top} H246" stroke="${INK}" stroke-width="1" stroke-dasharray="6 4" opacity=".7"/>`;
    s += `<path d="M262,${top - 4} H364 L356,${top + 8} L330,${top + 2} L300,${top + 14} L270,${top + 4} Z" fill="#dcae52" stroke="${INK}" stroke-width="1.6" opacity=".95"/>`;
    s += `<g fill="#e2b54c" stroke="${INK}" stroke-width="1">${[[232, 252], [284, 250], [258, 244], [206, 256]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3"/>`).join('')}</g>`;
    s += `<rect x="${W.x}" y="${W.y + W.h - 22}" width="${W.w}" height="22" fill="#b6402a" opacity=".9"/><rect x="${W.x}" y="${W.y + W.h - 22}" width="${W.w}" height="4" fill="${INK}"/>`;
    s += glyphRow(['N025', 'O001'], W.x + 22, 172, 30, '#1b1714', 6).svg;
    return s;
  };
  SCENES.shaft = () => {
    let s = sandLayers(90);
    const top = 232;
    s += `<path d="M${W.x},${top} H${W.x + W.w} V${W.y + W.h} H${W.x} Z" fill="#dcae52" stroke="${INK}" stroke-width="2"/>`;
    for (const [y, c] of [[262, '#c8902e'], [300, '#b8782a'], [340, '#a8661e']]) s += `<path d="M${W.x},${y} q60,-10 120,0 t120,0 t120,0 t80,0 V${y + 40} H${W.x} Z" fill="${c}" stroke="${INK}" stroke-width="1.2" opacity=".9"/>`;
    // 地上的馬斯塔巴
    s += `<path d="M64,${top} L84,${top - 52} H196 L216,${top} Z" fill="#efdcaf" stroke="${INK}" stroke-width="2.4"/><rect x="132" y="${top - 38}" width="18" height="38" fill="${INK}"/><path d="M84,${top - 52} H196" stroke="#b6402a" stroke-width="5"/>`;
    // 豎井
    s += `<rect x="318" y="${top}" width="44" height="152" fill="#2a1a10" stroke="${INK}" stroke-width="2.4"/>`;
    s += `<g stroke="#8a5a30" stroke-width="3"><path d="M326,${top + 6} V380 M354,${top + 6} V380"/>${Array.from({ length: 9 }, (_, i) => `<path d="M326,${top + 18 + i * 16} H354"/>`).join('')}</g>`;
    s += `<path d="M310,${top} H370" stroke="${INK}" stroke-width="5"/>`;
    // 墓室
    s += `<path d="M168,360 H362 V418 H168 Z" fill="#2a1a10" stroke="${INK}" stroke-width="2.4"/><path d="M168,360 H362" stroke="#e2b54c" stroke-width="3" opacity=".7"/>`;
    s += `<g stroke="${INK}" stroke-width="2"><rect x="196" y="384" width="82" height="26" rx="5" fill="#efdcaf"/><rect x="190" y="376" width="94" height="12" rx="4" fill="#e2b54c"/><rect x="298" y="390" width="14" height="20" rx="4" fill="#c8902e"/><rect x="318" y="390" width="14" height="20" rx="4" fill="#c8902e"/><rect x="338" y="390" width="14" height="20" rx="4" fill="#c8902e"/></g>`;
    s += `<g opacity=".5" stroke="${INK}" stroke-width="1"><path d="M200,398 H274 M200,404 H274"/></g>`;
    // 封石
    s += `<rect x="318" y="350" width="44" height="12" fill="#a9a08a" stroke="${INK}" stroke-width="2"/>`;
    s += `<rect x="${W.x}" y="${W.y + W.h - 22}" width="${W.w}" height="0" fill="none"/>`;
    s += glyphRow(['O001', 'D028'], W.x + 22, 172, 30, '#1b1714', 6).svg;
    return s;
  };
})();

/* 對戰用卡牌的插圖（重畫版）：每張卡一個獨有的構圖與姿勢，不共用站姿模板。
 * 依賴 cardart.js 的 CardArt.kit 與 cardart-battle.js 匯出的背景工具（K.B）。 */
(function () {
  'use strict';
  const K = window.CardArt.kit, B = K.B;
  const { f, C, MODE, W, GROUND, SCENES, glyphRow, glyphColumn, rowWidth, papyrusGround, goldGround, blockBand, lotusFrieze, papyrusPlant, sparkle, crescent, head, collar, ankh, gT, diamond, papyrusColumn } = K;
  const { templeBg, desertBg, nileBg, sunDisc, INK } = B;
  const uid = (p) => p + K.nextId();
  const TAN = '#dcae52', SHADE = '#b8862e', CREAM = '#efdcaf';

  // ───────── 小工具 ─────────
  // 以粗線畫四肢：外黑內色
  const limb = (pts, w, col, ink) => {
    const d = 'M' + pts.map((p) => p.join(',')).join(' L');
    return `<path d="${d}" fill="none" stroke="${ink || INK}" stroke-width="${w + 5}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  };
  // 羽毛：由原點往 +x 長出，再旋轉到 ang 度
  const leaf = (x, y, ang, len, w, fill, rib) => `<g transform="translate(${x},${y}) rotate(${ang})"><path d="M0,0 C${f(len * .25)},${-w} ${f(len * .8)},${f(-w * .9)} ${len},0 C${f(len * .8)},${f(w * .55)} ${f(len * .25)},${f(w * .7)} 0,0 Z" fill="${fill}" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>${rib ? `<path d="M${f(len * .1)},0 L${f(len * .92)},0" stroke="${rib}" stroke-width="1" opacity=".8"/>` : ''}</g>`;
  const eyeFront = (cx, cy, sx, o) => { // 正面的杏仁眼（sx=±1 為左右）
    o = o || {};
    return `<path d="M${cx - sx * 18},${cy + 2} Q${cx},${cy - 14} ${cx + sx * 18},${cy - 2} Q${cx},${cy + 10} ${cx - sx * 18},${cy + 2} Z" fill="#fff8e0" stroke="${INK}" stroke-width="2"/>` +
      `<circle cx="${cx + sx * 1}" cy="${cy - 1}" r="${o.r || 6}" fill="${o.iris || '#8a5a1c'}"/><circle cx="${cx + sx * 1}" cy="${cy - 1}" r="${(o.r || 6) * .5}" fill="${INK}"/>` +
      `<path d="M${cx + sx * 16},${cy - 2} L${cx + sx * 34},${cy - 8}" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
  };

  // ───────── 小母獅：正面坐姿的幼獅（大頭、大腳掌） ─────────
  SCENES.cub = () => {
    let s = templeBg(81, ['#e2b54c', '#3b7d58', '#e2b54c', '#b6402a'], '#3b7d58');
    s += `<g opacity=".8">${sunDisc(250, 240, 112, '#f0d9a0')}</g>`;
    s += papyrusPlant(64, GROUND, 1) + papyrusPlant(436, GROUND, -1);
    // 尾巴
    s += limb([[316, 372], [378, 366], [388, 322]], 11, TAN) + `<ellipse cx="388" cy="312" rx="11" ry="17" fill="#3a2414" stroke="${INK}" stroke-width="2"/>`;
    // 身體（梨形）與斑點
    s += `<path d="M250,262 C186,262 164,330 172,374 C176,396 324,396 328,374 C336,330 314,262 250,262 Z" fill="${TAN}" stroke="${INK}" stroke-width="2.4"/>`;
    s += `<ellipse cx="250" cy="346" rx="34" ry="44" fill="${CREAM}"/>`;
    s += `<g fill="${SHADE}" opacity=".85">${[[200, 320, 7, 5], [212, 350, 6, 4], [300, 322, 7, 5], [290, 356, 6, 4], [190, 372, 6, 4], [312, 376, 6, 4]].map(([x, y, rx, ry]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`).join('')}</g>`;
    // 後腿的大腿
    s += `<ellipse cx="190" cy="368" rx="36" ry="30" fill="${TAN}" stroke="${INK}" stroke-width="2.2"/><ellipse cx="310" cy="368" rx="36" ry="30" fill="${TAN}" stroke="${INK}" stroke-width="2.2"/>`;
    // 前腳與大腳掌
    for (const x of [224, 276]) s += `<path d="M${x - 15},316 Q${x - 18},360 ${x - 20},386 L${x + 20},386 Q${x + 18},360 ${x + 15},316 Z" fill="${TAN}" stroke="${INK}" stroke-width="2.2"/><ellipse cx="${x}" cy="388" rx="26" ry="12" fill="${TAN}" stroke="${INK}" stroke-width="2.2"/><path d="M${x - 9},380 V390 M${x},380 V392 M${x + 9},380 V390" stroke="${INK}" stroke-width="1.6"/>`;
    // 頸圈與護身符
    s += `<path d="M196,262 Q250,292 304,262" fill="none" stroke="${INK}" stroke-width="13"/><path d="M196,262 Q250,292 304,262" fill="none" stroke="#2c5d9c" stroke-width="9"/><path d="M200,264 Q250,293 300,264" fill="none" stroke="#e2b54c" stroke-width="3.4" stroke-dasharray="3 4"/>`;
    s += K.ankh(250, 282, 30, '#e2b54c', INK, 1.6);
    // 頭
    s += `<circle cx="196" cy="160" r="26" fill="${TAN}" stroke="${INK}" stroke-width="2.4"/><circle cx="304" cy="160" r="26" fill="${TAN}" stroke="${INK}" stroke-width="2.4"/><circle cx="196" cy="162" r="14" fill="#d98a6a"/><circle cx="304" cy="162" r="14" fill="#d98a6a"/>`;
    s += `<path d="M184,200 Q168,214 180,232 Q172,244 190,252 Q250,290 310,252 Q328,244 320,232 Q332,214 316,200 Q320,150 250,146 Q180,150 184,200 Z" fill="${TAN}" stroke="${INK}" stroke-width="2.4"/>`;
    s += `<g stroke="${SHADE}" stroke-width="3" stroke-linecap="round" fill="none"><path d="M250,152 V176 M232,156 L236,174 M268,156 L264,174"/></g>`;
    s += `<ellipse cx="250" cy="236" rx="34" ry="26" fill="${CREAM}" stroke="${INK}" stroke-width="2"/>`;
    s += eyeFront(218, 202, -1, { r: 8, iris: '#b87818' }) + eyeFront(282, 202, 1, { r: 8, iris: '#b87818' });
    s += `<path d="M226,184 Q240,176 244,186 M274,184 Q260,176 256,186" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
    s += `<path d="M238,218 H262 L250,232 Z" fill="#8d3f20" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>`;
    s += `<path d="M250,232 V244 M250,244 Q236,258 222,248 M250,244 Q264,258 278,248" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;
    s += `<g fill="${INK}">${[[232, 238], [226, 242], [234, 246], [268, 238], [274, 242], [266, 246]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.6"/>`).join('')}</g>`;
    // 腳邊的聖甲蟲與糞球
    s += `<circle cx="372" cy="384" r="14" fill="#8a5a30" stroke="${INK}" stroke-width="2"/><ellipse cx="344" cy="388" rx="13" ry="9" fill="#2c5d9c" stroke="${INK}" stroke-width="2"/><path d="M336,388 q-8,-7 -12,-2 M340,394 q-7,3 -9,9 M350,394 q4,7 -1,10" fill="none" stroke="${INK}" stroke-width="1.8"/>`;
    s += glyphColumn(['E015', 'M017'], 112, 150, 28, '#1b1714', 6).svg;
    return s;
  };

  // ───────── 母獅戰士：飛躍怒吼的母獅，披金甲 ─────────
  SCENES.lioness = () => {
    let s = desertBg(82, '#c8432a', [250, 230, 100]);
    // 衝出的沙塵
    s += `<g fill="#e8c780" stroke="${INK}" stroke-width="1.6" opacity=".95">${[[96, 386, 24], [128, 392, 18], [64, 390, 16], [160, 394, 12]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>`;
    s += `<g transform="rotate(-9 250 300)">`;
    // 尾
    s += limb([[132, 282], [86, 262], [60, 214]], 10, TAN) + `<path d="M60,214 Q42,198 56,184 Q74,190 72,214 Z" fill="#3a2414" stroke="${INK}" stroke-width="2"/>`;
    // 遠側四肢（較暗）：後腿蹬地、前腿前伸
    s += limb([[176, 316], [128, 330], [96, 364]], 15, SHADE) + limb([[348, 318], [392, 336], [420, 366]], 14, SHADE);
    // 身體
    s += `<path d="M120,292 C136,250 226,236 300,248 C346,256 374,274 382,300 C374,332 330,340 290,334 C240,340 170,338 140,324 C122,316 116,302 120,292 Z" fill="${TAN}" stroke="${INK}" stroke-width="2.6"/>`;
    s += `<path d="M150,324 C200,336 270,336 330,330" fill="none" stroke="${CREAM}" stroke-width="9" opacity=".9"/>`;
    s += `<g stroke="${SHADE}" stroke-width="2" fill="none" opacity=".8"><path d="M190,258 q6,16 0,34 M220,254 q6,16 0,36 M250,254 q6,16 0,36"/></g>`;
    // 近側後腿：大腿＋小腿＋腳掌
    s += `<ellipse cx="170" cy="304" rx="46" ry="34" transform="rotate(-18 170 304)" fill="${TAN}" stroke="${INK}" stroke-width="2.4"/>`;
    s += limb([[150, 326], [112, 340], [78, 372]], 15, TAN);
    s += `<ellipse cx="68" cy="376" rx="20" ry="10" transform="rotate(-30 68 376)" fill="${TAN}" stroke="${INK}" stroke-width="2.2"/>`;
    // 近側前腿：肩＋前臂＋腳掌（前伸）
    s += `<ellipse cx="344" cy="300" rx="36" ry="32" fill="${TAN}" stroke="${INK}" stroke-width="2.4"/>`;
    s += limb([[352, 318], [398, 334], [432, 360]], 15, TAN);
    s += `<ellipse cx="446" cy="368" rx="19" ry="10" transform="rotate(32 446 368)" fill="${TAN}" stroke="${INK}" stroke-width="2.2"/>`;
    s += `<path d="M54,380 l-8,2 M60,386 l-8,4 M452,372 l7,5 M446,378 l6,7" stroke="${INK}" stroke-width="1.6" stroke-linecap="round"/>`;
    // 金色護臂與胸甲
    s += `<path d="M376,328 L396,336" stroke="${INK}" stroke-width="22" stroke-linecap="round"/><path d="M376,328 L396,336" stroke="#e2b54c" stroke-width="16" stroke-linecap="round"/><path d="M382,320 L390,346" stroke="#2c5d9c" stroke-width="3"/>`;
    s += `<path d="M338,262 Q374,272 384,306" fill="none" stroke="${INK}" stroke-width="22"/><path d="M338,262 Q374,272 384,306" fill="none" stroke="#e2b54c" stroke-width="16"/><path d="M342,262 Q374,274 382,304" fill="none" stroke="#2c5d9c" stroke-width="5" stroke-dasharray="3 3"/>`;
    // 頭：張口怒吼
    s += `<path d="M362,246 Q372,214 408,214 Q440,220 446,246 Q458,248 460,262 Q452,272 432,272 L400,278 Q374,280 366,266 Z" fill="${TAN}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`;
    s += `<path d="M396,274 L430,274 Q452,276 458,288 Q448,300 424,298 L396,290 Z" fill="${TAN}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`;
    s += `<path d="M408,272 L458,264 Q456,280 440,282 L412,282 Z" fill="#8d2a20" stroke="${INK}" stroke-width="1.8"/>`;
    s += `<path d="M418,272 l4,10 l4,-10 M436,270 l4,10 l4,-10 M424,288 l3,-8 l3,8" fill="#fff8e0" stroke="${INK}" stroke-width="1.2"/>`;
    s += `<path d="M366,230 Q364,208 378,208 Q388,214 384,230 Z" fill="${TAN}" stroke="${INK}" stroke-width="2.2"/>`;
    s += `<path d="M392,236 Q404,228 416,236 Q404,244 392,236 Z" fill="#fff8e0" stroke="${INK}" stroke-width="1.8"/><circle cx="404" cy="236" r="4.5" fill="#b87818"/><circle cx="404" cy="236" r="2" fill="${INK}"/><path d="M386,232 L396,226 M416,236 L424,240" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;
    s += `<path d="M440,246 L452,248" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
    // 戰帽：條紋頭巾與聖蛇
    s += `<path d="M360,244 Q366,208 400,204 Q428,206 432,226 L420,222 Q404,216 388,222 Q372,230 372,252 Z" fill="#2c5d9c" stroke="${INK}" stroke-width="2.2"/><path d="M366,234 Q378,222 398,216 M372,246 Q384,230 408,224" fill="none" stroke="#e2b54c" stroke-width="3"/>`;
    s += `<path d="M426,222 Q442,214 438,200 Q432,204 432,210 Q426,206 424,214 Z" fill="#b6402a" stroke="${INK}" stroke-width="1.8"/>`;
    s += `</g>`;
    s += glyphColumn(['E015', 'D036'], 116, 150, 28, '#1b1714', 6).svg;
    return s;
  };

  // ───────── 塞赫美特：正面站立的神殿雕像，腳邊是紅色啤酒 ─────────
  SCENES.sekhmet = () => {
    const red = '#b6402a';
    let s = templeBg(64, ['#b6402a', '#e2b54c', '#b6402a', '#2c5d9c'], '#b6402a');
    // 紅色天光
    s += `<g opacity=".9">${sunDisc(250, 190, 126, '#e69a6a')}</g>`;
    s += `<g stroke="#c8432a" stroke-width="2.4" opacity=".7">${Array.from({ length: 40 }, (_, i) => { const a = i / 40 * 6.2832; return `<path d="M${f(250 + Math.cos(a) * 136)},${f(190 + Math.sin(a) * 136)} L${f(250 + Math.cos(a) * (i % 2 ? 178 : 156))},${f(190 + Math.sin(a) * (i % 2 ? 178 : 156))}"/>`; }).join('')}</g>`;
    // 兩旁的石柱（神殿）
    s += K.papyrusColumn(78, 150, GROUND, 17, INK, '#b6402a') + K.papyrusColumn(422, 150, GROUND, 17, INK, '#b6402a');
    // 身體：緊身紅裙
    s += `<path d="M206,262 Q250,276 294,262 L304,300 Q300,340 304,392 H196 Q200,340 196,300 Z" fill="${red}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`;
    s += `<g stroke="${INK}" stroke-width="1.2" opacity=".5" fill="none"><path d="M226,300 V388 M250,300 V388 M274,300 V388"/></g>`;
    s += `<path d="M206,262 L204,330 Q198,352 206,372 L196,372 Q190,340 196,300 Z" fill="#8d3f20" opacity=".6"/>`;
    // 雙臂：右手握安卡，左手持紙莎草權杖
    s += limb([[204, 276], [190, 318], [196, 344]], 13, '#a8452a') + limb([[296, 276], [310, 318], [304, 344]], 13, '#a8452a');
    s += K.ankh(190, 330, 56, '#e2b54c', INK, 1.8);
    s += `<path d="M311,342 V198" stroke="${INK}" stroke-width="7" stroke-linecap="round"/><path d="M311,342 V198" stroke="#3b7d58" stroke-width="3.6" stroke-linecap="round"/><path d="M296,200 Q311,172 326,200 Q311,208 296,200 Z" fill="#3b7d58" stroke="${INK}" stroke-width="2"/>`;
    // 寬領圈
    s += `<path d="M196,250 Q250,300 304,250 L300,266 Q250,312 200,266 Z" fill="#e2b54c" stroke="${INK}" stroke-width="2.4"/><path d="M204,256 Q250,300 296,256" fill="none" stroke="#2c5d9c" stroke-width="5"/><path d="M208,262 Q250,303 292,262" fill="none" stroke="#3b7d58" stroke-width="3.4"/>`;
    // 假髮：兩側垂到肩
    s += `<path d="M186,150 Q250,120 314,150 L322,262 Q300,268 290,256 L288,196 H212 L210,256 Q200,268 178,262 Z" fill="#1d1b28" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`;
    s += `<g stroke="#4a5d8c" stroke-width="1.4" opacity=".9">${Array.from({ length: 11 }, (_, i) => `<path d="M${194 + i * 6},160 V${i < 5 ? 262 : 0}" opacity="${i < 5 ? 1 : 0}"/><path d="M${290 + i * 3},180 V258" opacity="${i < 5 ? 1 : 0}"/>`).join('')}</g>`;
    // 母獅臉（正面）
    s += `<circle cx="206" cy="166" r="17" fill="${TAN}" stroke="${INK}" stroke-width="2.2"/><circle cx="294" cy="166" r="17" fill="${TAN}" stroke="${INK}" stroke-width="2.2"/><circle cx="206" cy="168" r="8" fill="#d98a6a"/><circle cx="294" cy="168" r="8" fill="#d98a6a"/>`;
    s += `<path d="M212,190 Q204,212 214,226 Q226,248 250,250 Q274,248 286,226 Q296,212 288,190 Q290,158 250,156 Q210,158 212,190 Z" fill="${TAN}" stroke="${INK}" stroke-width="2.4"/>`;
    s += `<ellipse cx="250" cy="226" rx="22" ry="17" fill="${CREAM}" stroke="${INK}" stroke-width="1.8"/>`;
    s += `<path d="M228,192 Q240,180 246,192 Q238,200 228,192 Z M272,192 Q260,180 254,192 Q262,200 272,192 Z" fill="#fff8e0" stroke="${INK}" stroke-width="1.8"/><circle cx="238" cy="192" r="4" fill="#b87818"/><circle cx="262" cy="192" r="4" fill="#b87818"/><circle cx="238" cy="192" r="1.8" fill="${INK}"/><circle cx="262" cy="192" r="1.8" fill="${INK}"/>`;
    s += `<path d="M222,190 L212,186 M278,190 L288,186 M226,182 Q238,174 246,182 M274,182 Q262,174 254,182" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>`;
    s += `<path d="M242,212 H258 L250,224 Z" fill="#8d3f20" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M250,224 V234 M250,234 Q240,244 232,238 M250,234 Q260,244 268,238" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>`;
    // 頭頂日輪與聖蛇
    s += `<path d="M232,150 Q250,142 268,150 L262,158 Q250,152 238,158 Z" fill="#e2b54c" stroke="${INK}" stroke-width="2"/>`;
    s += `<circle cx="250" cy="126" r="26" fill="#c8432a" stroke="${INK}" stroke-width="2.6"/><circle cx="250" cy="126" r="17" fill="none" stroke="#e2b54c" stroke-width="2.4"/>`;
    s += `<path d="M268,148 Q290,146 288,122 Q282,114 276,120 Q280,130 272,138 Z" fill="#b6402a" stroke="${INK}" stroke-width="1.8"/>`;
    // 打翻的紅色啤酒壺與流出的啤酒
    for (const [x, rot] of [[110, -32], [392, 28]]) s += `<g transform="translate(${x},378) rotate(${rot})"><path d="M-22,-34 Q-30,0 -18,6 H18 Q30,0 22,-34 Q18,-44 8,-46 H-8 Q-18,-44 -22,-34 Z" fill="#c8902e" stroke="${INK}" stroke-width="2.4"/><path d="M-22,-24 H22" stroke="${INK}" stroke-width="1.6"/><path d="M-8,-46 H8" stroke="${INK}" stroke-width="4"/></g>`;
    s += `<path d="M30,392 Q96,376 130,392 Q200,384 250,392 Q310,380 370,392 Q420,380 470,392 V420 H30 Z" fill="#b6402a" stroke="${INK}" stroke-width="2"/><path d="M60,402 q20,-8 40,0 t40,0 t40,0 t40,0 t40,0 t40,0 t40,0" fill="none" stroke="#e69a6a" stroke-width="2"/>`;
    // 腳
    s += `<path d="M204,392 H236 L240,380 H206 Z M264,392 H296 L294,380 H260 Z" fill="#a8452a" stroke="${INK}" stroke-width="2"/>`;
    s += glyphColumn(['S042', 'D021', 'E015'], 112, 150, 28, '#1b1714', 6).svg;
    return s;
  };

  // ───────── 荷魯斯：展翅飛翔的隼，爪握「申」環 ─────────
  SCENES.horus = () => {
    let s = papyrusGround(W.x, W.y, W.w, W.h, 61);
    s += blockBand(W.x, W.y, W.w, 9, ['#2c5d9c', '#e2b54c', '#b6402a', '#2c5d9c']);
    s += `<rect x="${W.x}" y="${W.y + 9}" width="${W.w}" height="${W.h - 9}" fill="#9fc4e6" opacity=".35"/>`;
    s += lotusFrieze(W.x, W.y + 9, W.w, 15);
    // 天空：光暈與遠方的尼羅
    s += `<g opacity=".9">${sunDisc(330, 232, 100, '#f6d9a0')}</g>`;
    s += `<rect x="${W.x}" y="${GROUND - 4}" width="${W.w}" height="${W.y + W.h - GROUND + 4}" fill="#2c5d9c"/><path d="M${W.x},${GROUND - 4} H${W.x + W.w}" stroke="${INK}" stroke-width="2"/>`;
    s += `<g fill="none" stroke="#9fc4e6" stroke-width="2">${Array.from({ length: 14 }, (_, i) => `<path d="M${W.x + 8 + i * 32},${GROUND + 10 + (i % 3) * 8} q8,-6 16,0 t16,0"/>`).join('')}</g>`;
    const blue = '#2c5d9c', gold = '#e2b54c', white = '#f4ecd4', red = '#b6402a';
    // 遠側翅膀（較暗）
    const wingFar = [[-168, 150], [-150, 160], [-132, 164], [-114, 158], [-98, 146], [-84, 130]];
    for (const [a, l] of wingFar) s += leaf(300, 268, a, l, 14, '#244a80');
    // 尾
    for (const [a, l] of [[196, 78], [184, 90], [172, 88], [160, 78]]) s += leaf(190, 300, a, l, 14, [blue, gold][(Math.abs(a) | 0) % 2], white);
    // 身體
    s += `<path d="M180,306 Q214,254 300,252 Q352,252 374,274 Q384,292 362,306 Q318,336 246,336 Q196,340 180,306 Z" fill="${blue}" stroke="${INK}" stroke-width="2.6"/>`;
    s += `<path d="M232,330 Q300,336 360,304 Q340,318 300,322 Q260,324 232,330 Z" fill="${CREAM}"/>`;
    s += `<g stroke="${INK}" stroke-width="1.6" fill="none" opacity=".75">${[0, 1, 2, 3, 4].map((i) => `<path d="M${270 + i * 16},${300 + i * 3} q8,6 16,0"/>`).join('')}</g>`;
    // 近側翅膀三層羽毛
    const prim = [[-176, 168], [-162, 178], [-148, 182], [-134, 180], [-120, 172], [-106, 160], [-92, 146], [-78, 130]];
    prim.forEach(([a, l], i) => { s += leaf(306, 270, a, l, 17, i % 2 ? '#3b7d58' : blue, white); });
    const cov = [[-172, 100], [-154, 108], [-136, 110], [-118, 106], [-100, 98], [-84, 88]];
    cov.forEach(([a, l], i) => { s += leaf(310, 266, a, l, 16, i % 2 ? gold : red, '#fff0c0'); });
    for (let i = 0; i < 9; i++) { const a = -168 + i * 12; s += leaf(318, 262, a, 48, 12, i % 2 ? white : '#9fc4e6'); }
    // 頭、喙與荷魯斯的眼紋
    s += `<path d="M360,262 Q354,236 380,230 Q410,228 418,250 Q414,268 392,274 Q372,278 360,270 Z" fill="${blue}" stroke="${INK}" stroke-width="2.6"/>`;
    s += `<path d="M408,244 Q440,244 446,270 Q444,278 436,274 Q432,262 408,262 Z" fill="${gold}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M412,258 H430" stroke="${INK}" stroke-width="1.2"/>`;
    s += `<circle cx="394" cy="248" r="7" fill="${white}" stroke="${INK}" stroke-width="1.8"/><circle cx="396" cy="248" r="3.4" fill="${INK}"/>`;
    s += `<path d="M390,255 Q388,268 378,276 M396,256 Q408,264 410,272" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>`;
    // 頭頂日輪與聖蛇
    s += `<path d="M376,232 Q392,224 408,232 L402,238 Q392,232 382,238 Z" fill="${gold}" stroke="${INK}" stroke-width="1.8"/><circle cx="392" cy="212" r="20" fill="#c8432a" stroke="${INK}" stroke-width="2.4"/><circle cx="392" cy="212" r="12" fill="none" stroke="${gold}" stroke-width="2"/>`;
    s += `<path d="M406,226 Q424,224 421,204 Q416,198 411,203 Q414,212 408,218 Z" fill="${red}" stroke="${INK}" stroke-width="1.6"/>`;
    // 爪與申環
    s += limb([[300, 334], [326, 352], [334, 366]], 8, '#c8902e') + limb([[270, 336], [290, 356], [300, 370]], 8, '#b87818');
    s += `<path d="M334,366 l10,-4 M334,366 l8,4 M300,370 l8,-4 M300,370 l6,6" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
    s += `<g stroke="${INK}" stroke-width="2.4"><ellipse cx="318" cy="378" rx="34" ry="14" fill="none" stroke-width="7"/><ellipse cx="318" cy="378" rx="34" ry="14" fill="none" stroke="#e2b54c" stroke-width="3.6"/><path d="M286,362 V394" stroke-width="6"/><path d="M286,362 V394" stroke="#e2b54c" stroke-width="3"/></g>`;
    s += glyphColumn(['G005', 'D004'], 100, 150, 28, '#1b1714', 6).svg;
    return s;
  };

  // ───────── 法老：正面的王像胸像（條紋頭巾、聖蛇、辮鬚、寬領、權杖交叉） ─────────
  SCENES.pharaoh = () => {
    const blue = '#2c5d9c', gold = '#e2b54c', skin = '#c8864a';
    let s = templeBg(65, ['#2c5d9c', '#e2b54c', '#b6402a', '#e2b54c'], '#2c5d9c');
    s += `<g opacity=".9">${sunDisc(250, 262, 132, '#f3dca4')}</g>`;
    s += papyrusColumn(58, 140, GROUND, 16, INK, '#b6402a') + papyrusColumn(442, 140, GROUND, 16, INK, '#b6402a');
    // 肩與胸
    s += `<path d="M112,392 Q114,322 186,300 H314 Q386,322 388,392 Z" fill="${skin}" stroke="${INK}" stroke-width="2.6"/>`;
    // 頭巾後片與兩側垂片
    s += `<path d="M170,160 Q250,112 330,160 L346,236 L336,340 H292 L294,244 H206 L208,340 H164 L154,236 Z" fill="${blue}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`;
    s += `<g stroke="${gold}" stroke-width="3.2" opacity=".95">${Array.from({ length: 11 }, (_, i) => `<path d="M${158 + i * 0},${170 + i * 14} H${344 - 0}" opacity="0"/>`).join('')}${Array.from({ length: 9 }, (_, i) => `<path d="M${i < 9 ? 160 : 0},${248 + i * 10} H206 M294,${248 + i * 10} H340"/>`).join('')}${Array.from({ length: 6 }, (_, i) => `<path d="M${176 + i * 3},${150 + i * 14} H${324 - i * 3}"/>`).join('')}</g>`;
    // 臉
    s += `<path d="M206,190 Q204,262 250,274 Q296,262 294,190 Q292,158 250,156 Q208,158 206,190 Z" fill="${skin}" stroke="${INK}" stroke-width="2.6"/>`;
    s += `<path d="M206,196 Q198,204 206,216 M294,196 Q302,204 294,216" fill="none" stroke="${INK}" stroke-width="2.6"/>`;
    s += eyeFront(228, 206, -1, { r: 5.5, iris: '#3a2414' }) + eyeFront(272, 206, 1, { r: 5.5, iris: '#3a2414' });
    s += `<path d="M212,190 Q226,182 240,190 M260,190 Q274,182 288,190" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round"/>`;
    s += `<path d="M250,208 Q244,230 238,238 Q250,244 262,238 Q256,230 250,208" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`;
    s += `<path d="M232,254 Q250,260 268,254 Q250,266 232,254 Z" fill="#9a4a30" stroke="${INK}" stroke-width="2"/>`;
    // 額上聖蛇
    s += `<path d="M250,160 Q240,146 246,134 Q252,130 256,136 Q252,142 258,150 Z" fill="${gold}" stroke="${INK}" stroke-width="2"/><circle cx="250" cy="138" r="4" fill="#b6402a" stroke="${INK}" stroke-width="1.4"/>`;
    // 辮鬚
    s += `<path d="M242,270 H258 L262,318 Q250,332 238,318 Z" fill="${blue}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><g stroke="${gold}" stroke-width="2.4">${[282, 294, 306].map((y) => `<path d="M241,${y} H259"/>`).join('')}</g>`;
    // 寬領
    const rings = [['#e2b54c', 0], ['#2c5d9c', 12], ['#3b7d58', 24], ['#b6402a', 36], ['#e2b54c', 48]];
    rings.forEach(([c, d], i) => { s += `<path d="M${164 + d * .3},${312 + d * .1} Q250,${352 + d} ${336 - d * .3},${312 + d * .1} L${340 - d * .3 - 8},${326 + d * .1} Q250,${370 + d} ${160 + d * .3 + 8},${326 + d * .1} Z" fill="${c}" stroke="${INK}" stroke-width="1.8" opacity="${i ? 1 : 1}"/>`; });
    // 王杖與連枷（交叉在胸前）
    s += `<g transform="rotate(-24 250 372)"><path d="M250,372 V304" stroke="${INK}" stroke-width="9"/><path d="M250,372 V304" stroke="${gold}" stroke-width="5"/><path d="M250,304 Q250,280 272,282 Q282,286 276,296" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M250,304 Q250,280 272,282 Q282,286 276,296" fill="none" stroke="${blue}" stroke-width="5" stroke-linecap="round"/></g>`;
    s += `<g transform="rotate(24 250 372)"><path d="M250,372 V310" stroke="${INK}" stroke-width="9"/><path d="M250,372 V310" stroke="${gold}" stroke-width="5"/>${[-12, 0, 12].map((x) => `<path d="M250,312 Q${250 + x * 2},${296} ${250 + x * 2.4},${284}" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M250,312 Q${250 + x * 2},${296} ${250 + x * 2.4},${284}" fill="none" stroke="#b6402a" stroke-width="2.4" stroke-linecap="round"/>`).join('')}</g>`;
    s += glyphColumn(['M017', 'N035', 'G043'], 108, 150, 28, '#1b1714', 6).svg;
    s += glyphColumn(['N001', 'V030'], 394, 150, 28, '#1b1714', 6).svg;
    return s;
  };

  // ───────── 伊西斯：坐在獅足王座上，抱著幼年荷魯斯餵奶 ─────────
  SCENES.isis = () => {
    const blue = '#2c5d9c', gold = '#e2b54c', skin = '#c8864a', wh = '#f4ecd4';
    let s = templeBg(71, ['#3b7d58', '#e2b54c', '#2c5d9c', '#b6402a'], '#3b7d58');
    s += `<g opacity=".85">${sunDisc(290, 236, 104, '#f3dca4')}</g>`;
    s += papyrusPlant(448, GROUND, -1);
    // 王座：宮殿立面的椅背、座塊與獅足
    s += `<path d="M96,386 V236 H176 V386 Z" fill="${gold}" stroke="${INK}" stroke-width="2.6"/>`;
    s += `<g fill="${blue}" stroke="${INK}" stroke-width="1.6">${[0, 1, 2, 3].map((i) => `<rect x="${104 + i * 17}" y="248" width="11" height="${i % 2 ? 34 : 54}"/>`).join('')}</g><g stroke="${INK}" stroke-width="1.4" fill="none">${[0, 1, 2].map((i) => `<path d="M104,${296 + i * 22} H168"/>`).join('')}</g>`;
    s += `<path d="M96,330 H314 V386 H96 Z" fill="${gold}" stroke="${INK}" stroke-width="2.6"/><g fill="${blue}" stroke="${INK}" stroke-width="1.4">${Array.from({ length: 6 }, (_, i) => `<rect x="${108 + i * 34}" y="344" width="22" height="26"/>`).join('')}</g>`;
    s += `<ellipse cx="318" cy="388" rx="16" ry="8" fill="${gold}" stroke="${INK}" stroke-width="2"/>`;
    // 身體：直立的白色貼身長裙
    s += `<path d="M178,330 Q170,274 192,236 Q214,228 232,238 Q246,276 250,324 Z" fill="${wh}" stroke="${INK}" stroke-width="2.6"/>`;
    s += `<g stroke="#bda878" stroke-width="1.3" fill="none"><path d="M192,252 Q196,290 192,326 M206,246 Q212,290 208,326 M220,246 Q228,290 224,326"/></g>`;
    // 大腿與小腿
    s += `<path d="M190,320 H318 Q338,322 336,342 H190 Z" fill="${wh}" stroke="${INK}" stroke-width="2.6"/><path d="M308,334 H336 V386 H306 Z" fill="${wh}" stroke="${INK}" stroke-width="2.4"/><path d="M304,388 H352 V378 H336 Z" fill="${skin}" stroke="${INK}" stroke-width="2.2"/>`;
    // 頭（側面）與假髮
    s += `<path d="M196,224 Q194,194 214,184 Q238,178 244,198 L252,214 L246,222 L250,232 L244,238 Q230,246 214,240 Z" fill="${skin}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`;
    s += `<path d="M192,222 Q186,172 224,168 Q254,166 252,196 L244,196 Q236,182 222,188 Q208,196 214,252 Q196,264 188,240 Z" fill="#1d1b28" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`;
    s += `<path d="M232,204 Q242,198 250,206 Q242,212 232,204 Z" fill="${wh}" stroke="${INK}" stroke-width="1.6"/><circle cx="242" cy="205" r="2.6" fill="${INK}"/><path d="M226,200 Q238,192 252,200 M246,206 L256,204" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;
    // 王座頭冠（象形字 Q001）
    s += `<path d="M204,172 L200,150 H244 L240,172 Z" fill="${gold}" stroke="${INK}" stroke-width="2.2"/><path d="M226,150 V122 H244 V150 Z M200,150 L208,128 H226" fill="${blue}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`;
    s += `<path d="M180,180 Q168,168 176,152 Q186,158 188,172 Z" fill="${gold}" stroke="${INK}" stroke-width="1.8"/>`;
    // 抱著孩子的手臂
    s += `<path d="M214,262 Q262,284 296,278" fill="none" stroke="${INK}" stroke-width="18" stroke-linecap="round"/><path d="M214,262 Q262,284 296,278" fill="none" stroke="${skin}" stroke-width="13" stroke-linecap="round"/>`;
    // 幼年荷魯斯（在她的懷裡，側髮辮，手指放在嘴邊）
    s += `<path d="M236,290 Q268,314 322,296 Q340,282 330,262 Q300,250 266,262 Q244,270 236,290 Z" fill="#e4a36a" stroke="${INK}" stroke-width="2.4"/>`;
    s += `<circle cx="322" cy="252" r="22" fill="#e4a36a" stroke="${INK}" stroke-width="2.4"/><path d="M308,240 Q322,226 338,240 Q330,236 322,238 Q314,236 308,240 Z" fill="#1d1b28"/><path d="M336,246 Q354,252 350,278 Q342,268 338,262 Z" fill="#1d1b28" stroke="${INK}" stroke-width="1.6"/>`;
    s += `<circle cx="330" cy="254" r="2.6" fill="${INK}"/><path d="M324,244 L334,243" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/><path d="M334,266 q-6,2 -8,-2" stroke="${INK}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    s += `<path d="M338,262 L346,258" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M338,262 L346,258" stroke="#e4a36a" stroke-width="2.4" stroke-linecap="round"/>`;
    s += `<path d="M300,296 Q312,312 330,308 M286,300 Q290,326 278,336" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M300,296 Q312,312 330,308 M286,300 Q290,326 278,336" fill="none" stroke="#e4a36a" stroke-width="5" stroke-linecap="round"/>`;
    // 腳邊的蓮花
    for (const [x, h] of [[398, 70], [420, 52]]) s += `<path d="M${x},${GROUND} Q${x - 6},${GROUND - h / 2} ${x},${GROUND - h}" fill="none" stroke="${INK}" stroke-width="5"/><path d="M${x},${GROUND} Q${x - 6},${GROUND - h / 2} ${x},${GROUND - h}" fill="none" stroke="#3b7d58" stroke-width="2.6"/><path d="M${x},${GROUND - h} Q${x - 14},${GROUND - h - 12} ${x - 8},${GROUND - h - 26} Q${x},${GROUND - h - 14} ${x},${GROUND - h} Q${x},${GROUND - h - 14} ${x + 8},${GROUND - h - 26} Q${x + 14},${GROUND - h - 12} ${x},${GROUND - h} Z" fill="#e8a0b0" stroke="${INK}" stroke-width="1.8"/>`;
    s += glyphColumn(['V030', 'N001'], 424, 150, 24, '#1b1714', 6).svg;
    s += glyphColumn(['Q001', 'X001', 'B001'], 70, 150, 24, '#1b1714', 6).svg;
    return s;
  };

  // ───────── 哈比：兩位尼羅河神把紙莎草與蓮花綁在「統一」符號上 ─────────
  SCENES.hapi = () => {
    const blue = '#3a78b5', INKB = INK;
    let s = nileBg(75);
    s += `<g opacity=".85">${sunDisc(250, 236, 96, '#f3dca4')}</g>`;
    // 中央的「統一」符號：氣管與雙肺
    s += `<path d="M236,150 H264 V348 H236 Z" fill="#e2b54c" stroke="${INK}" stroke-width="2.6"/><g stroke="${INK}" stroke-width="1.6">${[170, 190, 210, 230, 250, 270, 290, 310, 330].map((y) => `<path d="M236,${y} H264"/>`).join('')}</g>`;
    s += `<path d="M236,160 Q196,142 190,196 Q196,228 236,214 Z" fill="#b6402a" stroke="${INK}" stroke-width="2.4"/><path d="M264,160 Q304,142 310,196 Q304,228 264,214 Z" fill="#b6402a" stroke="${INK}" stroke-width="2.4"/>`;
    // 繩結：兩股莖纏繞
    s += `<path d="M236,248 C200,262 206,288 250,296 S300,320 264,338" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M236,248 C200,262 206,288 250,296 S300,320 264,338" fill="none" stroke="#3b7d58" stroke-width="6" stroke-linecap="round"/>`;
    s += `<path d="M264,248 C300,262 294,288 250,296 S200,320 236,338" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M264,248 C300,262 294,288 250,296 S200,320 236,338" fill="none" stroke="#e8a0b0" stroke-width="6" stroke-linecap="round"/>`;
    const hapi = (dir, crown) => {
      let g = `<g transform="translate(${dir > 0 ? 70 : 430},${GROUND + 6}) scale(${dir * 1.15},1.15)">`;
      g += limb([[-18, 0], [-10, -34], [14, -52]], 15, blue) + limb([[22, 0], [26, -34], [14, -52]], 15, blue);
      g += `<ellipse cx="14" cy="-70" rx="44" ry="36" fill="${blue}" stroke="${INK}" stroke-width="2.6"/><path d="M-2,-60 Q16,-44 40,-58" fill="none" stroke="#2c5d9c" stroke-width="2.4"/>`;
      g += `<ellipse cx="0" cy="-104" rx="26" ry="32" fill="${blue}" stroke="${INK}" stroke-width="2.6"/><circle cx="20" cy="-90" r="13" fill="${blue}" stroke="${INK}" stroke-width="2.2"/>`;
      g += limb([[8, -118], [46, -106], [82, -118]], 12, blue);
      g += `<circle cx="86" cy="-118" r="8" fill="${blue}" stroke="${INK}" stroke-width="2"/>`;
      g += `<path d="M-4,-150 Q-20,-150 -22,-132 Q-14,-116 -10,-134 Z" fill="#14264a" stroke="${INK}" stroke-width="2"/><circle cx="2" cy="-136" r="20" fill="${blue}" stroke="${INK}" stroke-width="2.6"/><path d="M-14,-146 Q2,-166 20,-148 L12,-140 Q2,-150 -8,-140 Z" fill="#14264a" stroke="${INK}" stroke-width="2"/>`;
      g += `<path d="M20,-136 Q28,-132 22,-124 Q26,-120 20,-118" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="-138" r="2.6" fill="${INK}"/><path d="M6,-146 L18,-144" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`;
      g += `<path d="M0,-118 Q10,-108 8,-96" fill="none" stroke="#14264a" stroke-width="4" stroke-linecap="round"/>`;
      if (crown === 'papyrus') g += `<path d="M2,-152 V-196" stroke="${INK}" stroke-width="6"/><path d="M2,-152 V-196" stroke="#3b7d58" stroke-width="3"/><g stroke="${INK}" stroke-width="1.8" fill="#3b7d58">${[-60, -30, 0, 30, 60].map((a) => `<path d="M2,-196 L${f(2 + Math.sin(a * Math.PI / 180) * 26)},${f(-196 - Math.cos(a * Math.PI / 180) * 26)}" fill="none" stroke-width="3"/>`).join('')}</g>`;
      else g += `<path d="M2,-152 V-182" stroke="${INK}" stroke-width="6"/><path d="M2,-152 V-182" stroke="#3b7d58" stroke-width="3"/><path d="M2,-182 Q-14,-186 -12,-204 Q-2,-196 2,-186 Q6,-196 16,-204 Q18,-186 2,-182 Z" fill="#e8a0b0" stroke="${INK}" stroke-width="1.8"/>`;
      return g + '</g>';
    };
    s += hapi(1, 'papyrus') + hapi(-1, 'lotus');
    // 兩人手中的繩索往中央拉
    s += `<path d="M162,${GROUND - 98} Q206,${GROUND - 126} 236,248 M338,${GROUND - 98} Q294,${GROUND - 126} 264,248" fill="none" stroke="${INK}" stroke-width="5"/><path d="M162,${GROUND - 98} Q206,${GROUND - 126} 236,248 M338,${GROUND - 98} Q294,${GROUND - 126} 264,248" fill="none" stroke="#efdcaf" stroke-width="2.4"/>`;
    s += glyphColumn(['N035', 'M017'], 250, 118, 22, '#1b1714', 4).svg ? '' : '';
    return s;
  };

  // ───────── 賽特：獸形的賽特在暴風沙丘上走過，尾巴筆直分叉 ─────────
  SCENES.set = () => {
    const red = '#b8603a', dark = '#6a2c1c';
    let s = papyrusGround(W.x, W.y, W.w, W.h, 83);
    s += blockBand(W.x, W.y, W.w, 9, ['#b6402a', '#2c2c2c', '#b6402a', '#e2b54c']);
    s += `<rect x="${W.x}" y="${W.y + 9}" width="${W.w}" height="260" fill="#c8432a" opacity=".38"/>`;
    // 被遮住的太陽與捲動的風暴雲
    s += `<g opacity=".9">${sunDisc(160, 220, 64, '#7a2a20')}</g>`;
    s += `<g fill="none" stroke="${INK}" stroke-width="2.4" opacity=".7">${[0, 1, 2, 3].map((i) => `<path d="M${W.x + 10},${150 + i * 30} Q${100 + i * 14},${130 + i * 30} ${190},${150 + i * 30} T${360},${146 + i * 30} T${W.x + W.w},${160 + i * 28}"/>`).join('')}</g>`;
    s += `<path d="M390,132 L370,186 L388,186 L362,248" fill="none" stroke="#fff0b0" stroke-width="4" stroke-linejoin="round"/><path d="M390,132 L370,186 L388,186 L362,248" fill="none" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>`;
    // 沙丘
    s += `<path d="M${W.x},330 Q120,296 220,326 T${W.x + W.w},316 V${W.y + W.h} H${W.x} Z" fill="#c8902e" stroke="${INK}" stroke-width="1.8"/><path d="M${W.x},380 Q150,352 260,376 T${W.x + W.w},362 V${W.y + W.h} H${W.x} Z" fill="#a8702a" stroke="${INK}" stroke-width="1.8"/>`;
    s += `<g fill="#f0d9a0" opacity=".6">${[[60, 300], [140, 286], [300, 300], [420, 290], [80, 340]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="26" ry="5"/>`).join('')}</g>`;
    // 賽特獸：細長的身軀、長而下彎的吻、方形的長耳、筆直分叉的尾
    s += limb([[198, 332], [188, 358], [196, 384]], 9, dark) + limb([[322, 330], [330, 356], [342, 384]], 9, dark);
    s += `<path d="M150,262 Q150,300 190,308 Q250,320 312,300 Q338,290 346,262 Q330,236 290,240 Q240,246 190,244 Q150,244 150,262 Z" fill="${red}" stroke="${INK}" stroke-width="2.6"/>`;
    s += `<g stroke="${dark}" stroke-width="3.4" opacity=".85">${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${180 + i * 24},${248 + (i % 2) * 2} l${8},${34 - (i % 3) * 4}"/>`).join('')}</g>`;
    s += `<path d="M330,270 Q346,236 372,214 Q380,206 392,210 L404,226 Q412,236 412,246 Q430,254 454,268 Q462,276 452,282 Q420,282 396,268 Q380,280 362,292 Z" fill="${red}" stroke="${INK}" stroke-width="2.6" stroke-linejoin="round"/>`;
    s += `<path d="M376,208 L370,176 L388,172 L394,206 Z M396,208 L402,178 L420,184 L408,216 Z" fill="${red}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><path d="M376,200 L374,182 L384,180 L386,200 Z" fill="${dark}" opacity=".6"/>`;
    s += `<path d="M392,232 Q402,226 412,232 Q402,238 392,232 Z" fill="#ffdc70" stroke="${INK}" stroke-width="1.8"/><circle cx="403" cy="232" r="2.6" fill="${INK}"/>`;
    s += `<path d="M446,272 Q430,276 412,270" fill="none" stroke="${INK}" stroke-width="2"/>`;
    s += limb([[170, 296], [158, 340], [166, 388]], 11, red) + limb([[310, 296], [318, 336], [330, 388]], 11, red);
    s += `<g fill="${dark}" stroke="${INK}" stroke-width="2"><path d="M154,392 H182 L178,400 H150 Z"/><path d="M316,392 H346 L342,400 H312 Z"/></g>`;
    // 筆直上翹的分叉尾
    s += `<path d="M156,262 L140,206 L132,150" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M156,262 L140,206 L132,150" fill="none" stroke="${red}" stroke-width="7" stroke-linecap="round"/><path d="M132,150 L118,118 M132,150 L146,116" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M132,150 L118,118 M132,150 L146,116" fill="none" stroke="${red}" stroke-width="4.6" stroke-linecap="round"/>`;
    s += glyphColumn(['E016', 'N001'], 82, 152, 24, '#1b1714', 4).svg ? '' : '';
    s += glyphColumn(['G005'], 440, 150, 26, '#1b1714', 6).svg;
    return s;
  };

  // ───────── 木乃伊戰士：從石棺中直起身，揮起彎刀 ─────────
  SCENES.mummy = () => {
    const wrap = '#d9c9a0', wl = '#a8946a', glow = '#5fe0c8';
    let s = templeBg(91, ['#3b2a5a', '#e2b54c', '#3b2a5a', '#2c5d9c'], '#3b2a5a');
    s += `<defs><radialGradient id="mg" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="${glow}" stop-opacity=".55"/><stop offset="1" stop-color="${glow}" stop-opacity="0"/></radialGradient></defs><circle cx="250" cy="236" r="170" fill="url(#mg)"/>`;
    // 飛揚的繃帶
    const strip = (d) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${wrap}" stroke-width="8" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${wl}" stroke-width="1.4" stroke-dasharray="6 7"/>`;
    s += strip('M204,220 C150,200 120,170 74,176') + strip('M300,226 C350,210 392,230 430,196') + strip('M214,330 C160,340 120,320 70,344') + strip('M286,330 C340,336 380,320 436,352');
    // 石棺（正面，前緣）
    s += `<path d="M130,392 V330 Q130,318 142,318 H358 Q370,318 370,330 V392 Z" fill="#e2b54c" stroke="${INK}" stroke-width="2.6"/><g fill="#2c5d9c" stroke="${INK}" stroke-width="1.4">${Array.from({ length: 7 }, (_, i) => `<rect x="${142 + i * 30}" y="334" width="20" height="44"/>`).join('')}</g>`;
    // 軀幹
    s += `<path d="M196,224 Q250,204 304,224 L296,320 H204 Z" fill="${wrap}" stroke="${INK}" stroke-width="2.6"/><g stroke="${wl}" stroke-width="2.2">${Array.from({ length: 8 }, (_, i) => `<path d="M${200 + (i % 2) * 2},${236 + i * 11} L${300 - (i % 2) * 2},${228 + i * 11}"/>`).join('')}</g>`;
    // 左臂：圓盾
    s += limb([[204, 238], [172, 266], [166, 296]], 20, wrap) + `<circle cx="164" cy="296" r="36" fill="#2c5d9c" stroke="${INK}" stroke-width="2.6"/><circle cx="164" cy="296" r="26" fill="#e2b54c" stroke="${INK}" stroke-width="2"/><circle cx="164" cy="296" r="8" fill="#b6402a" stroke="${INK}" stroke-width="1.6"/>`;
    // 右臂：高舉的彎刀（khopesh）
    s += limb([[298, 238], [344, 214], [356, 160]], 20, wrap);
    s += `<path d="M356,164 V132" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M356,164 V132" stroke="#8a5a30" stroke-width="5" stroke-linecap="round"/><path d="M344,134 H368" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M344,134 H368" stroke="#e2b54c" stroke-width="4" stroke-linecap="round"/>`;
    s += `<path d="M356,130 V112 Q356,98 372,100 Q402,104 400,138 Q396,150 388,142 Q392,120 376,116 Q368,116 368,128 V130 Z" fill="#e8ecf2" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><path d="M372,102 Q396,108 394,134" fill="none" stroke="#9fb4c8" stroke-width="2"/>`;
    // 頭
    s += `<ellipse cx="250" cy="170" rx="38" ry="46" fill="${wrap}" stroke="${INK}" stroke-width="2.6"/><g stroke="${wl}" stroke-width="2.2">${Array.from({ length: 8 }, (_, i) => `<path d="M${214 + (i % 2) * 2},${140 + i * 10} L${286 - (i % 2) * 2},${132 + i * 10}"/>`).join('')}</g>`;
    s += `<path d="M216,162 H284 V182 H216 Z" fill="#14100d"/>`;
    s += `<circle cx="234" cy="172" r="9" fill="${glow}" opacity=".35"/><circle cx="266" cy="172" r="9" fill="${glow}" opacity=".35"/><circle cx="234" cy="172" r="5" fill="#d8fff2"/><circle cx="266" cy="172" r="5" fill="#d8fff2"/>`;
    s += `<path d="M222,158 L244,164 M278,158 L256,164" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
    s += glyphColumn(['D036', 'S029'], 108, 150, 26, '#1b1714', 6).svg;
    return s;
  };

  // ───────── 奧西里斯：黃金的「杰德柱」，柱頂是戴阿太夫冠的臉 ─────────
  SCENES.osiris = () => {
    const G = 'url(#G)';
    let s = goldGround(W.x, W.y, W.w, W.h, 68);
    s += `<g fill="none" stroke="${G}" stroke-width="1.3"><circle cx="250" cy="236" r="132"/><circle cx="250" cy="236" r="122" stroke-dasharray="1.5 5"/></g>`;
    s += papyrusColumn(58, 168, GROUND, 14, G, C.turq) + papyrusColumn(442, 168, GROUND, 14, G, C.turq);
    s += `<g fill="#15100d" stroke="${G}" stroke-width="1.3"><path d="M150,${GROUND} H350 V${GROUND + 10} H150 Z"/><path d="M126,${GROUND + 10} H374 V${GROUND + 22} H126 Z"/></g>`;
    s += `<g transform="translate(250,${GROUND}) scale(.76) translate(-250,-${GROUND})">`;
    // 杰德柱的柱身
    s += `<path d="M232,300 H268 L274,${GROUND} H226 Z" fill="#15100d" stroke="${G}" stroke-width="1.6"/><g stroke="${G}" stroke-width="1">${[318, 336, 354].map((y) => `<path d="M230,${y} H270"/>`).join('')}</g>`;
    s += glyphColumn(['Q001', 'D004'], 250, 316, 18, G, 4).svg;
    // 四道橫桿
    [[210, 36], [236, 52], [262, 68], [288, 80]].forEach(([y, hw], i) => { s += `<path d="M${250 - hw * 1.1},${y} H${250 + hw * 1.1} V${y + 18} H${250 - hw * 1.1} Z" fill="#15100d" stroke="${G}" stroke-width="1.6"/>` + diamond(250, y + 9, 5, 5, i % 2 ? C.turq : C.rose, 'none', 0); });
    // 交叉雙臂：彎鉤與連枷
    s += `<path d="M196,262 L240,236 M304,262 L260,236" stroke="#15100d" stroke-width="12" stroke-linecap="round"/><path d="M196,262 L240,236 M304,262 L260,236" stroke="${G}" stroke-width="1.6" stroke-linecap="round" fill="none"/>`;
    s += `<path d="M180,266 Q166,226 150,236 Q146,248 160,252" fill="none" stroke="${G}" stroke-width="4" stroke-linecap="round"/><path d="M320,266 V210 M320,210 Q334,190 330,176 M320,210 Q320,186 316,170 M320,210 Q308,190 304,178" fill="none" stroke="${G}" stroke-width="3.4" stroke-linecap="round"/>`;
    // 臉：正面，綠色的皮膚
    s += `<path d="M222,142 Q220,196 250,206 Q280,196 278,142 Q276,112 250,112 Q224,112 222,142 Z" fill="#12261f" stroke="${G}" stroke-width="2"/>`;
    s += `<path d="M232,138 Q241,130 248,138 Q241,144 232,138 Z M268,138 Q259,130 252,138 Q259,144 268,138 Z" fill="${C.turq}" stroke="${G}" stroke-width="1.2"/><path d="M226,128 L246,126 M254,126 L274,128" stroke="${G}" stroke-width="2.4"/><path d="M250,140 V158 M244,160 H256" stroke="${G}" stroke-width="1.8" fill="none"/><path d="M240,174 Q250,180 260,174" fill="none" stroke="${G}" stroke-width="2"/>`;
    s += `<path d="M244,200 H256 L260,236 Q250,248 240,236 Z" fill="#12261f" stroke="${G}" stroke-width="1.6"/>`;
    // 阿太夫冠
    s += `<path d="M236,112 Q232,76 250,56 Q268,76 264,112 Z" fill="#171210" stroke="${G}" stroke-width="2"/><path d="M226,104 Q196,100 192,70 Q212,80 230,86 Z M274,104 Q304,100 308,70 Q288,80 270,86 Z" fill="#171210" stroke="${G}" stroke-width="1.8"/><circle cx="250" cy="52" r="6" fill="${C.rose}" stroke="${G}" stroke-width="1.4"/>`;
    s += '</g>';
    return s;
  };

  // ───────── 孔蘇：月亮船上的小神，滿月在背後 ─────────
  SCENES.khonsu = () => {
    const P = MODE.papyrus;
    let s = papyrusGround(W.x, W.y, W.w, W.h, 77);
    s += blockBand(W.x, W.y, W.w, 9, ['#2c3a6a', '#d4def2', '#2c3a6a', '#e2b54c']);
    s += `<rect x="${W.x}" y="${W.y + 9}" width="${W.w}" height="${W.h - 9}" fill="#1b2a52" opacity=".86"/>`;
    s += lotusFrieze(W.x, W.y + 9, W.w, 15);
    s += `<g opacity=".95"><circle cx="250" cy="236" r="112" fill="${INK}"/><circle cx="250" cy="236" r="104" fill="#eef2fa"/><circle cx="250" cy="236" r="94" fill="none" stroke="#b8c4e0" stroke-width="2"/><g fill="#cdd6ea"><circle cx="214" cy="204" r="18"/><circle cx="288" cy="262" r="24"/><circle cx="270" cy="188" r="9"/></g></g>`;
    s += `<g fill="#f4f6ff">${[[80, 160, 4], [130, 200, 3], [400, 170, 4], [440, 230, 3], [90, 270, 3], [420, 300, 4], [180, 150, 3], [330, 150, 3]].map(([x, y, r]) => sparkle(x, y, r * 2.2, '#f4f6ff')).join('')}</g>`;
    // 夜裡的尼羅河
    s += `<rect x="${W.x}" y="${GROUND - 14}" width="${W.w}" height="${W.y + W.h - GROUND + 14}" fill="#142a5a"/><path d="M${W.x},${GROUND - 14} H${W.x + W.w}" stroke="${INK}" stroke-width="2"/>`;
    s += `<g fill="none" stroke="#7a94cc" stroke-width="2">${Array.from({ length: 14 }, (_, i) => `<path d="M${W.x + 8 + i * 34},${GROUND + (i % 3) * 9} q8,-6 16,0 t16,0"/>`).join('')}</g>`;
    // 孔蘇（站在船中央的小神）
    {
      const bl = '#2c5d9c', sk = '#6f93b5', gd = '#e2b54c';
      s += `<path d="M216,262 Q250,244 284,262 L280,342 Q250,352 220,342 Z" fill="${bl}" stroke="${INK}" stroke-width="2.6"/><g stroke="${gd}" stroke-width="2.4" opacity=".9">${[282, 298, 314, 330].map((y) => `<path d="M219,${y} Q250,${y + 8} 281,${y}"/>`).join('')}</g><path d="M250,262 V346" stroke="#8fb4e0" stroke-width="1.6" opacity=".7"/>`;
      s += `<path d="M214,262 Q250,300 286,262 L284,274 Q250,314 216,274 Z" fill="${gd}" stroke="${INK}" stroke-width="2"/>`;
      // 彎鉤與連枷：手從裹布中伸出
      s += `<path d="M232,288 V222 Q232,200 214,204 Q206,212 214,222" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M232,288 V222 Q232,200 214,204 Q206,212 214,222" fill="none" stroke="${gd}" stroke-width="4.4" stroke-linecap="round"/>`;
      s += `<path d="M268,288 V226" stroke="${INK}" stroke-width="8" stroke-linecap="round"/><path d="M268,288 V226" stroke="${gd}" stroke-width="4.4" stroke-linecap="round"/>${[-14, 0, 14].map((x) => `<path d="M268,228 Q${268 + x * 1.4},214 ${268 + x * 2},200" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><path d="M268,228 Q${268 + x * 1.4},214 ${268 + x * 2},200" fill="none" stroke="#e8eef8" stroke-width="2.4" stroke-linecap="round"/>`).join('')}`;
      s += `<circle cx="232" cy="288" r="8" fill="${sk}" stroke="${INK}" stroke-width="2"/><circle cx="268" cy="288" r="8" fill="${sk}" stroke="${INK}" stroke-width="2"/>`;
      // 頭：孩童的側髮辮、月牙加圓盤頭冠
      s += `<path d="M226,214 Q212,230 218,262" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M226,214 Q212,230 218,262" fill="none" stroke="#14264a" stroke-width="6" stroke-linecap="round"/><circle cx="218" cy="266" r="6" fill="${gd}" stroke="${INK}" stroke-width="1.6"/>`;
      s += `<ellipse cx="250" cy="220" rx="26" ry="30" fill="${sk}" stroke="${INK}" stroke-width="2.6"/><path d="M224,214 Q226,188 250,186 Q276,188 276,214 Q262,200 250,202 Q236,200 224,214 Z" fill="#14264a" stroke="${INK}" stroke-width="2.2"/>`;
      s += `<path d="M232,218 Q240,212 246,218 Q240,224 232,218 Z M268,218 Q260,212 254,218 Q260,224 268,218 Z" fill="#fff8e0" stroke="${INK}" stroke-width="1.6"/><circle cx="240" cy="218" r="2.6" fill="${INK}"/><circle cx="260" cy="218" r="2.6" fill="${INK}"/><path d="M230,210 L244,212 M270,210 L256,212 M250,222 V232 M244,238 Q250,242 256,238" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`;
      s += `<path d="M244,248 H256 L258,264 Q250,270 242,264 Z" fill="${bl}" stroke="${INK}" stroke-width="2"/>`;
      s += `<path d="M232,184 Q212,170 228,146 Q222,170 250,172 Q278,170 272,146 Q288,170 268,184 Q250,194 232,184 Z" fill="#f2eedc" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><circle cx="250" cy="156" r="13" fill="#f6f0dc" stroke="${INK}" stroke-width="2.2"/><circle cx="250" cy="156" r="7" fill="none" stroke="${gd}" stroke-width="1.6"/>`;
    }
    // 月牙形的船
    s += `<path d="M62,${GROUND - 62} Q70,${GROUND - 6} 250,${GROUND - 4} Q430,${GROUND - 6} 438,${GROUND - 62} Q420,${GROUND - 30} 392,${GROUND - 28} Q250,${GROUND - 20} 108,${GROUND - 28} Q80,${GROUND - 30} 62,${GROUND - 62} Z" fill="#e2b54c" stroke="${INK}" stroke-width="2.8"/>`;
    s += `<path d="M96,${GROUND - 26} Q250,${GROUND - 16} 404,${GROUND - 26}" fill="none" stroke="#2c5d9c" stroke-width="5"/><path d="M62,${GROUND - 62} Q56,${GROUND - 78} 70,${GROUND - 88} Q74,${GROUND - 74} 82,${GROUND - 68} Z M438,${GROUND - 62} Q444,${GROUND - 78} 430,${GROUND - 88} Q426,${GROUND - 74} 418,${GROUND - 68} Z" fill="#e2b54c" stroke="${INK}" stroke-width="2.2"/><circle cx="66" cy="${GROUND - 88}" r="7" fill="#eef2fa" stroke="${INK}" stroke-width="2"/><circle cx="434" cy="${GROUND - 88}" r="7" fill="#eef2fa" stroke="${INK}" stroke-width="2"/>`;
    s += glyphColumn(['N001', 'D021'], 70, 140, 24, '#d4def2', 6).svg;
    return s;
  };
})();

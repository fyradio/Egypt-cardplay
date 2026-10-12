/* 對戰畫面：把引擎的事件串流演成牌桌上的動畫（草案）
 * 做法：引擎先把整場打完，每個事件帶一份牌桌快照；這裡逐事件把畫面改成該快照，並依差異演出動畫。
 */
(function () {
  'use strict';
  const E = window.SimEngine, DEFS = E.DEFS;
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (id) => document.getElementById(id);
  const stage = $('stage');
  const DC = { sun: 'var(--sun)', desert: 'var(--desert)', nile: 'var(--nile)', underworld: 'var(--underworld)', moon: 'var(--moon)' };
  const KIND = { god: '神祇', spell: '魔法', trap: '陷阱', field: '場地魔法' };

  // ───────── 卡資料：有做好的用真卡，其他用占位卡 ─────────
  const ART = {};
  for (const arr of [window.SAMPLE_CARDS, window.EVO_CARDS, window.TRINITY_CARDS, window.SYNTH_CARDS, window.FUSION_CARDS, window.FIELD_CARDS, window.BATTLE_CARDS]) for (const c of arr || []) ART[c.id] = c;
  function cardOf(id) {
    if (ART[id] && DEFS[id] && DEFS[id].art) return ART[id];
    const d = DEFS[id];
    const isGod = d.kind === 'god';
    return {
      id, no: '---', name: d.name, en: '', kind: isGod ? 'monster' : d.kind === 'trap' ? 'trap' : 'spell', domain: d.domain || 'sun',
      rarity: 'common', cost: d.cost, atk: d.atk, hp: d.hp, art: 'placeholder', style: '紙草壁畫',
      typeLine: isGod ? `神祇｜${E.DN[d.domain]}` : KIND[d.kind], sub: KIND[d.kind], stage: d.stage && d.stage > 1 ? d.stage : 0,
      text: d.desc || '', flavor: '', glyphName: [], codex: [],
    };
  }
  const tpl = {};
  function flatOf(id) { if (!tpl[id]) tpl[id] = window.CardView.flat(cardOf(id)); return tpl[id].cloneNode(true); }
  function backOf() { if (!tpl._b) tpl._b = window.CardView.flatBack(); return tpl._b.cloneNode(true); }

  // ───────── 版面（橫式 1280×720／直式 720×1280）─────────
  const PORT = /layout=p/.test(location.search) || (!/layout=l/.test(location.search) && window.innerWidth < window.innerHeight);
  const EXPL = /[#&]x=1/.test(location.hash); // 解說欄（預設關閉，正式版面）
  const CFG = PORT && !EXPL ? {
    SW: 720, SH: 984, PW: 720, CW: 138, CH: 193, HW: 104, HH: 146, cx: 360, cy: 440, castW: 270,
    gy: [486, 192], hy: [796, 76], hudX: 12, hudY: [716, 8], hudH: 64, wide: true,
    slotX: [24, 174, 324], field: { x: 484, dy: 0, w: 66, h: 92 }, deck: { x: 556, dy: 0, w: 66, h: 92 }, grave: { x: 628, dy: 0, w: 66, h: 92 },
    trap: { x: [484, 544, 604], dy: 112, w: 52, h: 73 }, arkDy: 192,
    cap: { x: 0, y: 414, w: 720, h: 52 }, side: { x: 12, y: 828, w: 696, h: 272 }, bannerW: 720,
  } : PORT ? {
    SW: 720, SH: 1280, PW: 720, CW: 138, CH: 193, HW: 92, HH: 129, cx: 360, cy: 462, castW: 270,
    gy: [514, 226], hy: [1124, 80], hudX: 12, hudY: [748, 8], hudH: 64, wide: true,
    slotX: [24, 174, 324], field: { x: 484, dy: 0, w: 66, h: 92 }, deck: { x: 556, dy: 0, w: 66, h: 92 }, grave: { x: 628, dy: 0, w: 66, h: 92 },
    trap: { x: [484, 544, 604], dy: 112, w: 52, h: 73 }, arkDy: 192,
    cap: { x: 0, y: 436, w: 720, h: 52 }, side: { x: 12, y: 828, w: 696, h: 272, row: true }, bannerW: 720,
  } : {
    SW: EXPL ? 1280 : 1028, SH: 720, PW: 1028, CW: 96, CH: 134, HW: 78, HH: 109, cx: 514, cy: 362, castW: 250,
    gy: [410, 150], hy: [596, 8], hudX: 14, hudY: [518, 10], hudH: 140, wide: false,
    slotX: [330, 462, 594], field: { x: 222, dy: 0, w: 86, h: 120 }, deck: { x: 880, dy: 0, w: 68, h: 95 }, grave: { x: 952, dy: 0, w: 68, h: 95 },
    trap: { x: [706, 762, 818], dy: 0, w: 50, h: 70 }, arkDy: 96,
    cap: { x: 210, y: 340, w: 800, h: 44 }, side: { x: 1028, y: 10, w: 244, h: 700 }, bannerW: 1028,
  };
  const { CW, CH, HW, HH } = CFG;
  const L = [{ gy: CFG.gy[0], hy: CFG.hy[0], hudY: CFG.hudY[0] }, { gy: CFG.gy[1], hy: CFG.hy[1], hudY: CFG.hudY[1] }]; // 0 = 甲（下）、1 = 乙（上）
  const SLOTX = CFG.slotX, TRAPX = CFG.trap.x, TRAPW = CFG.trap.w, TRAPH = CFG.trap.h;
  const DECKX = CFG.deck.x, GRAVEX = CFG.grave.x, PILEW = CFG.deck.w, PILEH = CFG.deck.h;
  const FIELDX = CFG.field.x, FIELDW = CFG.field.w, FIELDH = CFG.field.h, CX = CFG.cx;
  stage.style.width = CFG.SW + 'px'; stage.style.height = CFG.SH + 'px';

  const mk = (cls, parent, css, html) => { const d = document.createElement('div'); if (cls) d.className = cls; if (css) d.style.cssText = css; if (html != null) d.innerHTML = html; (parent || stage).appendChild(d); return d; };

  // 牌桌背景
  const mat = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  mat.id = 'mat'; mat.setAttribute('viewBox', `0 0 ${CFG.SW} ${CFG.SH}`); mat.style.width = CFG.SW + 'px'; mat.style.height = CFG.SH + 'px';
  { const PW = CFG.PW, SH = CFG.SH, cy = CFG.cy, cx = CFG.cx;
  mat.innerHTML = `<defs>
    <radialGradient id="mg" cx="40%" cy="50%" r="75%"><stop offset="0" stop-color="#2a2016"/><stop offset=".7" stop-color="#17110c"/><stop offset="1" stop-color="#0b0806"/></radialGradient>
    <linearGradient id="mgold" x1="0" x2="1"><stop offset="0" stop-color="#8a6a2e"/><stop offset=".5" stop-color="#f1dc9a"/><stop offset="1" stop-color="#8a6a2e"/></linearGradient>
    <pattern id="mp" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M18 3 L33 18 L18 33 L3 18Z" fill="none" stroke="#e9cd85" stroke-opacity=".05"/></pattern>
  </defs>
  <rect width="${CFG.SW}" height="${SH}" fill="url(#mg)"/><rect width="${PW}" height="${SH}" fill="url(#mp)"/>
  <rect x="6" y="6" width="${PW - 12}" height="${SH - 12}" rx="14" fill="none" stroke="url(#mgold)" stroke-opacity=".55" stroke-width="2"/>
  <rect x="12" y="12" width="${PW - 24}" height="${SH - 24}" rx="10" fill="none" stroke="#e9cd85" stroke-opacity=".18"/>
  <line x1="40" y1="${cy}" x2="${PW - 40}" y2="${cy}" stroke="url(#mgold)" stroke-opacity=".5" stroke-width="1.5"/>
  <circle cx="${cx}" cy="${cy}" r="22" fill="#120d0a" stroke="url(#mgold)" stroke-width="2"/>
  <circle cx="${cx}" cy="${cy}" r="9" fill="none" stroke="#e9cd85" stroke-opacity=".7"/><circle cx="${cx}" cy="${cy}" r="3" fill="#e9cd85"/>
  ${PORT || !EXPL ? '' : `<path d="M1028 0V720" stroke="#e9cd85" stroke-opacity=".25"/><rect x="1028" width="252" height="720" fill="#0e0a07"/>`}`; }
  stage.appendChild(mat);

  const side = mk('', null); side.id = 'side';
  const prevCard = mk('', side); prevCard.id = 'prev-card';
  const note = mk('', side); note.id = 'note';
  const cap = mk('', null); cap.id = 'cap';
  const banner = mk('', null); banner.id = 'banner'; banner.innerHTML = '<div class="b1"></div><div class="b2"></div>';
  const fx = mk('', null); fx.id = 'fx'; fx.style.width = CFG.SW + 'px'; fx.style.height = CFG.SH + 'px';
  { const c = CFG.cap, sd = CFG.side;
    cap.style.cssText = `left:${c.x}px;top:${c.y}px;width:${c.w}px;height:${c.h}px`;
    side.style.cssText = `left:${sd.x}px;top:${sd.y}px;width:${sd.w}px;height:${sd.h}px`; if (sd.row) side.classList.add('row');
    if (!EXPL) side.style.display = 'none';
    banner.style.cssText = `top:${CFG.cy - 60}px;width:${CFG.bannerW}px`; }
  const handEl = [mk('hand', null, 'left:0;top:0;width:0;height:0'), mk('hand mine', null, 'left:0;top:0;width:0;height:0')];
  handEl[0].className = 'hand'; handEl[1].className = 'hand mine';
  // 讓 fx 與 cap 疊在最上層（依 DOM 順序）
  [cap, banner, fx].forEach((x) => stage.appendChild(x));

  // 區域底框與 HUD
  const P = [0, 1].map((i) => {
    const y = L[i].gy, o = { i }, F = CFG.field, D = CFG.deck, G = CFG.grave, TR = CFG.trap;
    for (let k = 0; k < 3; k++) mk('zone', null, `left:${SLOTX[k] - 3}px;top:${y - 3}px;width:${CW + 6}px;height:${CH + 6}px`);
    mk('zlabel', null, `left:${SLOTX[0]}px;width:${SLOTX[2] + CW - SLOTX[0]}px;top:${i ? y + CH + 22 : y - 19}px`, '神　祇');
    for (let k = 0; k < 3; k++) mk('zone', null, `left:${TRAPX[k] - 2}px;top:${y + TR.dy - 2}px;width:${TRAPW + 4}px;height:${TRAPH + 4}px`);
    mk('zlabel', null, `left:${TRAPX[0]}px;width:${TRAPX[2] + TRAPW - TRAPX[0]}px;top:${y + TR.dy + TRAPH + 6}px`, PORT ? '' : '墓　室');
    o.ark = mk('zlabel', null, `left:${TRAPX[0] - 10}px;width:${TRAPX[2] + TRAPW - TRAPX[0] + 20}px;top:${y + CFG.arkDy}px;color:#7fa6a0;font-size:12px;letter-spacing:.04em`, '');
    mk('zone', null, `left:${F.x - 3}px;top:${y + F.dy - 3}px;width:${F.w + 6}px;height:${F.h + 6}px`);
    mk('zlabel', null, `left:${F.x - 3}px;width:${F.w + 6}px;top:${y + F.dy + F.h + 6}px`, '場　地');
    o.deckZ = mk('zone', null, `left:${D.x - 3}px;top:${y + D.dy - 3}px;width:${D.w + 6}px;height:${D.h + 6}px`);
    o.graveZ = mk('zone', null, `left:${G.x - 3}px;top:${y + G.dy - 3}px;width:${G.w + 6}px;height:${G.h + 6}px`);
    mk('zlabel', null, `left:${D.x}px;width:${D.w}px;top:${y + D.dy + D.h + 6}px`, '牌組');
    o.graveLbl = mk('zlabel', null, `left:${G.x - 10}px;width:${G.w + 20}px;top:${y + G.dy + G.h + 6}px`, '墓地');
    // HUD
    o.hud = mk('hud' + (CFG.wide ? ' wide' : ''), null, `left:${CFG.hudX}px;top:${L[i].hudY}px`,
      `<div class="nm"></div><div class="dk"></div><div class="hv"><span class="hn">20</span><small>心</small></div><div class="hb"><i></i></div><div class="gems"></div><div class="cnt"></div><div class="tg">行動中</div>`);
    o.q = (s) => o.hud.querySelector(s);
    o.gods = new Map(); o.hand = []; o.traps = []; o.field = null; o.deck = null; o.grave = null; o.graveId = null;
    o.heart = null; o.origin = {};
    return o;
  });
  // 牌堆元件
  P.forEach((o, i) => {
    const y = L[i].gy;
    o.deck = mk('pc', null, `left:${DECKX}px;top:${y + CFG.deck.dy}px;width:${PILEW}px;height:${PILEH}px`);
    o.deck.appendChild(backOf()); o.deckN = mk('pile-n', o.deck, '', '0');
    o.grave = mk('pc', null, `left:${GRAVEX}px;top:${y + CFG.grave.dy}px;width:${PILEW}px;height:${PILEH}px`);
    o.graveBox = mk('', o.grave, 'position:absolute;inset:0'); o.graveN = mk('pile-n', o.grave, '', '0');
  });

  // ───────── 工具 ─────────
  let speed = 1, peek = false;
  const T = (ms) => (reduce ? 1 : ms / speed);
  function anim(el, kf, opt) { if (reduce) { return Promise.resolve(); } const a = el.animate(kf, Object.assign({ fill: 'both', easing: 'cubic-bezier(.3,.7,.3,1)' }, opt, { duration: T(opt.duration) })); return a.finished.catch(() => {}); }
  const sleep = (ms) => new Promise((r) => { sleepWake = r; setTimeout(r, ms); });
  let sleepWake = null;
  const wake = () => { if (sleepWake) sleepWake(); };
  const tr = (x, y, s, r) => `translate(${x}px,${y}px) scale(${s == null ? 1 : s}) rotate(${r || 0}deg)`;
  const pos = (el) => ({ x: parseFloat(el.style.left), y: parseFloat(el.style.top) });

  function burst(x, y, color, n) {
    n = n || 10;
    const r = mk('ring', fx, `left:${x}px;top:${y}px;width:20px;height:20px;border-color:${color || 'var(--gold)'}`);
    anim(r, [{ transform: 'translate(-50%,-50%) scale(.3)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(5)', opacity: 0 }], { duration: 650 }).then(() => r.remove());
    for (let k = 0; k < n; k++) {
      const d = mk('dust', fx, `left:${x}px;top:${y}px`), a = Math.random() * 6.283, s = 40 + Math.random() * 60;
      anim(d, [{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${Math.cos(a) * s}px,${Math.sin(a) * s}px) scale(.2)`, opacity: 0 }], { duration: 600 + Math.random() * 300 }).then(() => d.remove());
    }
  }
  function floatTxt(x, y, txt, cls) {
    const f = mk('float ' + cls, fx, `left:${x}px;top:${y}px`, txt);
    anim(f, [{ transform: 'translate(-50%,-50%) scale(.6)', opacity: 0 }, { transform: 'translate(-50%,-90%) scale(1.25)', opacity: 1, offset: .25 }, { transform: 'translate(-50%,-190%) scale(1)', opacity: 0 }], { duration: 1300 }).then(() => f.remove());
  }
  function shake(el) { return anim(el, [{ transform: 'translate(0,0)' }, { transform: 'translate(-7px,2px)' }, { transform: 'translate(6px,-2px)' }, { transform: 'translate(-4px,1px)' }, { transform: 'translate(0,0)' }], { duration: 380, easing: 'linear' }); }
  function flashRed(el) {
    const f = mk('', el, 'position:absolute;inset:0;border-radius:5px;background:rgba(255,70,40,.55);mix-blend-mode:screen;pointer-events:none;z-index:4');
    anim(f, [{ opacity: 0 }, { opacity: 1, offset: .2 }, { opacity: 0 }], { duration: 520 }).then(() => f.remove());
  }

  // ───────── 元件建立 ─────────
  function godEl(g, p) {
    const d = DEFS[g.id];
    const el = mk('pc god', null, `left:${SLOTX[g.slot]}px;top:${L[p.i].gy}px;width:${CW}px;height:${CH}px;--dc:${DC[d.domain] || 'transparent'};z-index:2`);
    el.dataset.uid = g.uid; el._id = g.id;
    el.appendChild(flatOf(g.id));
    mk('tint', el);
    el._atk = mk('bd atk', el, '', g.atk); el._hp = mk('bd hp', el, '', g.hp);
    el._flag = mk('flag', el, 'display:none');
    const nm = mk('gname', el, 'display:block;bottom:-21px', d.name);
    return el;
  }
  function updGod(el, g) {
    el._atk.textContent = g.atk; el._hp.textContent = g.hp;
    el._atk.classList.toggle('up', g.atk > g.base); el._atk.classList.toggle('low', g.atk < g.base);
    el._hp.classList.toggle('low', g.hp < g.max);
    const f = g.stun ? '昏睡中' : g.sick ? '剛召喚' : DEFS[g.id].kw.includes('noatk') ? '不能攻擊' : '';
    el._flag.style.display = f ? '' : 'none'; el._flag.textContent = f;
  }
  const slotCenter = (pi, slot) => ({ x: SLOTX[slot] + CW / 2, y: L[pi].gy + CH / 2 });

  // ───────── 手牌 ─────────
  const OPS = 0.7; // 對手手牌縮小
  const hsz = (i) => (i ? [Math.round(HW * OPS), Math.round(HH * OPS)] : [HW, HH]);
  function layoutHand(o, animateNew, delay0) {
    const hand = o.hand, n = hand.length, y = L[o.i].hy, HWx = hsz(o.i)[0];
    const gap = Math.min(HWx * 0.92, (CFG.PW - 360 + (PORT ? 200 : 0)) / Math.max(1, n));
    const total = gap * (n - 1) + HWx;
    hand.forEach((h, k) => {
      const m = k - (n - 1) / 2;
      const x = CX - total / 2 + k * gap, yy = y + Math.abs(m) * Math.abs(m) * 0.7 * (o.i ? -1 : 1) + (o.i ? 0 : 0);
      const rot = m * 2.4 * (o.i ? -1 : 1);
      h.style.left = x + 'px'; h.style.top = yy + 'px'; h.style.transform = `rotate(${rot}deg)`; h.style.zIndex = k + 1;
      if (h._isNew && animateNew) {
        h._isNew = false;
        const dx = DECKX + PILEW / 2 - HWx / 2 - x, dy = L[o.i].gy + CFG.deck.dy - yy;
        anim(h, [{ transform: `translate(${dx}px,${dy}px) scale(.85) rotate(0deg)`, opacity: 0 }, { opacity: 1, offset: .15 }, { transform: `rotate(${rot}deg)`, opacity: 1 }], { duration: 520, delay: T((delay0 || 0) + (h._k || 0) * 110) });
      }
      h._isNew = false;
    });
  }
  function showFace(i) { return i === 0 || peek; }
  function newHandCard(o, id) {
    const sz = hsz(o.i), h = mk('pc', handEl[o.i], `width:${sz[0]}px;height:${sz[1]}px`);
    h._id = id; h._face = showFace(o.i);
    h.appendChild(h._face ? flatOf(id) : backOf());
    h._isNew = true;
    return h;
  }
  function syncHand(o, ids, animated) {
    const pool = o.hand.slice(), next = [], added = [];
    for (const id of ids) {
      const j = pool.findIndex((h) => h._id === id && h._face === showFace(o.i));
      if (j >= 0) next.push(pool.splice(j, 1)[0]);
      else { const h = newHandCard(o, id); next.push(h); added.push(h); }
    }
    added.forEach((h, k) => { h._k = k; });
    // 沒配到的 = 離手
    const gone = pool;
    for (const h of gone) { const p0 = pos(h); o.origin[h._id] = { x: p0.x + parseFloat(h.style.width) / 2, y: p0.y + parseFloat(h.style.height) / 2, el: h }; }
    o.hand = next;
    layoutHand(o, animated, 0);
    return gone;
  }

  // ───────── 渲染某個快照 ─────────
  let cur = null; // 目前畫面所代表的快照
  function render(snap, animated, ev) {
    const type = ev ? ev.type : '';
    const gonePiles = [];
    snap.p.forEach((sp, i) => {
      const o = P[i];
      // HUD
      o.q('.nm').textContent = sp.name; o.q('.dk').textContent = `「${sp.deckName}」`;
      const old = o.heart; o.heart = sp.heart;
      o.q('.hn').textContent = Math.max(0, sp.heart); o.q('.hb i').style.width = Math.max(0, Math.min(100, sp.heart * 5)) + '%';
      if (animated && old != null && old !== sp.heart) {
        const d = sp.heart - old, hp = o.q('.hv').getBoundingClientRect(), sc = stage.getBoundingClientRect().width / CFG.SW;
        floatTxt((hp.left - stage.getBoundingClientRect().left) / sc + 40, (hp.top - stage.getBoundingClientRect().top) / sc + 10, (d > 0 ? '+' : '') + d, d > 0 ? 'heal' : 'dmg');
        if (d < 0) { shake(o.hud); flashRed(o.hud); } else burst(CFG.hudX + 110, L[i].hudY + CFG.hudH / 2, '#7ef0b0', 6);
      }
      let gm = ''; const nile = sp.nileAnkh || 0;
      for (let k = 0; k < sp.ankhMax; k++) gm += `<span class="${k < sp.ankh ? 'on' : 'off'}">◆</span>`;
      for (let k = 0; k < nile; k++) gm += '<span class="nile">◆</span>';
      o.q('.gems').innerHTML = gm;
      o.q('.cnt').textContent = `手牌 ${sp.hand.length}・神殿 ${sp.temple}・放逐 ${sp.exiled}`;
      o.hud.classList.toggle('on', snap.cur === i && type !== 'setup' && !(ev && ev.type === 'end'));

      // 牌堆
      o.deckN.textContent = sp.deck; o.deck.style.opacity = sp.deck ? 1 : 0.25;
      o.graveN.textContent = sp.grave.length;
      const top = sp.grave.length ? sp.grave[sp.grave.length - 1] : null;
      if (top !== o.graveId) {
        o.graveId = top; o.graveBox.innerHTML = '';
        if (top) { o.graveBox.appendChild(flatOf(top)); if (animated) anim(o.graveBox, [{ transform: 'scale(1.25)', opacity: .3 }, { transform: 'scale(1)', opacity: 1 }], { duration: 400 }); }
      }
      o.grave.style.display = sp.grave.length ? '' : 'none'; o.graveN.style.display = sp.grave.length ? '' : 'none';
      o.ark.textContent = sp.ark.length ? '聖櫃：' + sp.ark.map((a) => DEFS[a].name).join('、') : '';

      // 手牌
      const gone = syncHand(o, sp.hand, animated);
      gonePiles.push([i, gone]);
    });

    // 神祇
    const removedGods = [];
    snap.p.forEach((sp, i) => {
      const o = P[i], seen = new Set();
      for (const g of sp.gods) {
        seen.add(g.uid);
        let el = o.gods.get(g.uid);
        if (!el) {
          el = godEl(g, o); o.gods.set(g.uid, el); stage.appendChild(el);
          if (animated) {
            const org = (o.origin[g.id] && o.origin[g.id].el.isConnected !== undefined) ? o.origin[g.id] : null;
            const from = org || { x: DECKX + PILEW / 2, y: L[i].gy + CFG.deck.dy + PILEH / 2 };
            const c = slotCenter(i, g.slot);
            const big = ['evolve', 'synth', 'fusion'].includes(type) || DEFS[g.id].divine;
            el._arrive = true;
            anim(el, [{ transform: tr(from.x - c.x, from.y - c.y, .8, 0), opacity: 0 }, { opacity: 1, offset: .25 }, { transform: tr(0, 0, 1, 0), opacity: 1 }], { duration: big ? 700 : 560 }).then(() => {
              burst(c.x, c.y, big ? '#ffe9a0' : 'var(--gold)', big ? 16 : 8);
            });
          }
        } else if (el._id !== g.id) { // 進化：同一隻換了樣子
          el._id = g.id; const f = el.querySelector('.flat'); f.replaceWith(flatOf(g.id)); el.querySelector('.gname').textContent = DEFS[g.id].name; el.style.setProperty('--dc', DC[DEFS[g.id].domain] || 'transparent');
          if (animated) { const c = slotCenter(i, g.slot); anim(el, [{ filter: 'brightness(3)', transform: 'scale(1.18)' }, { filter: 'brightness(1)', transform: 'scale(1)' }], { duration: 800 }); burst(c.x, c.y, '#ffe9a0', 18); }
        } else if (animated) {
          if (g.hp < el._hpv) { shake(el); flashRed(el); }
        }
        if (animated && el._hpv != null && g.hp !== el._hpv) {
          const c = slotCenter(i, g.slot), d = g.hp - el._hpv;
          floatTxt(c.x, c.y - 20, (d > 0 ? '+' : '') + d, d > 0 ? 'heal' : 'dmg');
          if (d < 0) burst(c.x, c.y, '#ff7a5c', 8);
        }
        el._hpv = g.hp; updGod(el, g);
        el.style.left = SLOTX[g.slot] + 'px';
      }
      for (const [uid, el] of o.gods) if (!seen.has(uid)) { o.gods.delete(uid); removedGods.push([i, el]); }
    });
    for (const [i, el] of removedGods) {
      const p0 = pos(el), cx = p0.x + CW / 2, cy = p0.y + CH / 2;
      if (!animated) { el.remove(); continue; }
      el.style.zIndex = 3;
      if (type === 'synth' || type === 'fusion') {
        const tgt = snap.p[i].gods.filter((g) => !(el._id === g.id)).pop();
        const c = tgt ? slotCenter(i, tgt.slot) : { x: CX, y: cy };
        anim(el, [{ transform: tr(0, 0, 1, 0), opacity: 1 }, { transform: tr(c.x - cx, c.y - cy, .6, 0), opacity: 0 }], { duration: 650 }).then(() => el.remove());
      } else if (type === 'death' || type === 'dmg' || type === 'effect' || type === 'spell' || type === 'trap' || type === 'attack') {
        burst(cx, cy, '#d98a6a', 14);
        anim(el, [{ transform: tr(0, 0, 1, 0), opacity: 1, filter: 'none' }, { transform: tr(0, 0, 1.04, 0), filter: 'brightness(2.2) saturate(.2)', opacity: 1, offset: .25 }, { transform: tr(0, 14, .8, i ? 7 : -7), opacity: 0, filter: 'grayscale(1)' }], { duration: 950 }).then(() => el.remove());
      } else if (type === 'evolve') {
        anim(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).then(() => el.remove());
      } else el.remove();
    }

    // 場地與陷阱
    snap.p.forEach((sp, i) => {
      const o = P[i], y = L[i].gy, fy = y + CFG.field.dy, tyy = y + CFG.trap.dy;
      // 場地
      if ((o.field && o.field._id) !== sp.field) {
        if (o.field) { const f0 = o.field; o.field = null; if (animated) anim(f0, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 }).then(() => f0.remove()); else f0.remove(); }
        if (sp.field) {
          const f = mk('pc', null, `left:${FIELDX}px;top:${fy}px;width:${FIELDW}px;height:${FIELDH}px;--dc:var(--gold)`);
          f._id = sp.field; f.appendChild(flatOf(sp.field)); mk('tint', f); o.field = f;
          if (animated) {
            const org = o.origin[sp.field] || { x: CX, y: fy + 40 };
            anim(f, [{ transform: tr(org.x - FIELDX - FIELDW / 2, org.y - fy - FIELDH / 2, 1.1, 0), opacity: 0 }, { opacity: 1, offset: .3 }, { transform: tr(0, 0, 1, 0), opacity: 1 }], { duration: 700 });
            burst(FIELDX + FIELDW / 2, fy + FIELDH / 2, '#ffe9a0', 14);
          }
        }
      }
      // 陷阱
      const pool = o.traps.slice(), next = [];
      sp.traps.forEach((id, k) => {
        const j = pool.findIndex((t) => t._id === id && t._face === showFace(i));
        let t;
        if (j >= 0) t = pool.splice(j, 1)[0];
        else {
          t = mk('pc', null, `left:${TRAPX[k]}px;top:${tyy}px;width:${TRAPW}px;height:${TRAPH}px`);
          t._id = id; t._face = showFace(i); t.appendChild(t._face ? flatOf(id) : backOf());
          if (animated) { const org = o.origin[id] || { x: CX, y: tyy + 30 }; anim(t, [{ transform: tr(org.x - TRAPX[k] - TRAPW / 2, org.y - tyy - TRAPH / 2, 1.5, 0), opacity: 0 }, { opacity: 1, offset: .3 }, { transform: tr(0, 0, 1, 0), opacity: 1 }], { duration: 600 }); }
        }
        t.style.left = TRAPX[k] + 'px'; next.push(t);
      });
      for (const t of pool) { if (animated) anim(t, [{ opacity: 1 }, { opacity: 0, transform: tr(0, 0, 1.3, 0) }], { duration: 500 }).then(() => t.remove()); else t.remove(); }
      o.traps = next;
    });
    cur = snap;
  }

  // ───────── 字幕、說明、紀錄 ─────────
  let game = null, idx = -1, playing = false, token = 0, seed = 0;
  const logEl = $('dlog');
  function side_(e, i) {
    const id = e.cards && e.cards[0];
    prevCard.innerHTML = '';
    if (id && DEFS[id]) {
      const wrap = mk('', prevCard, 'position:absolute;inset:0'); wrap.appendChild(flatOf(id));
      anim(wrap, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 300 });
    } else prevCard.innerHTML = '<div class="none">這一步沒有特定卡牌</div>';
    let h = '';
    if (id && DEFS[id]) { const d = DEFS[id]; h += `<div><b style="color:var(--gold-hi);font-family:var(--serif);font-size:15px">${d.name}</b> <span style="color:var(--dim)">${KIND[d.kind]}${d.domain ? '・' + E.DN[d.domain] : ''}・費用 ${d.cost}${d.kind === 'god' ? `・${d.atk}／${d.hp}` : ''}</span></div><div style="color:var(--dim);font-size:12px">${d.desc || ''}</div>`; }
    if (e.why) h += `<div class="why">${e.why}</div>`;
    if (e.rule) h += `<div class="rule">${e.rule}</div>`;
    const hist = []; for (let k = Math.max(0, i - 3); k < i; k++) hist.push(`<div>${game.events[k].text}</div>`);
    h += `<div class="hist">${hist.join('')}</div>`;
    note.innerHTML = h;
  }
  function pushLog(e, i) {
    const d = document.createElement('div'); d.className = e.type === 'turn' ? 't' : ''; d.textContent = e.text; d.dataset.i = i; logEl.appendChild(d);
    if (e.why) { const w = document.createElement('div'); w.className = 'w'; w.textContent = '→ ' + e.why; logEl.appendChild(w); }
  }
  function fillLog(upto) { logEl.innerHTML = ''; for (let k = 0; k <= upto; k++) pushLog(game.events[k], k); logEl.scrollTop = logEl.scrollHeight; }

  // ───────── 事件演出 ─────────
  function lunge(e, prev) {
    const att = e.cards[0], who = e.who, tgtId = e.cards[1];
    const a = [...P[who].gods.values()].find((el) => el._id === att);
    if (!a) return Promise.resolve();
    const op = P[1 - who];
    let tx, ty, tEl = null;
    if (e.cards.length > 1) tEl = [...op.gods.values()].find((el) => el._id === tgtId);
    if (tEl) { const p0 = pos(tEl); tx = p0.x + CW / 2; ty = p0.y + CH / 2; }
    else { tx = CFG.hudX + 110; ty = L[1 - who].hudY + CFG.hudH / 2; }
    const p1 = pos(a), cx = p1.x + CW / 2, cy = p1.y + CH / 2;
    const dx = (tx - cx) * 0.78, dy = (ty - cy) * 0.78;
    a.style.zIndex = 8;
    anim(a, [{ transform: tr(0, 0, 1, 0) }, { transform: tr(-dx * .08, -dy * .08, 1.04, 0), offset: .22 }, { transform: tr(dx, dy, 1.2, 0), offset: .5 }, { transform: tr(0, 0, 1, 0) }], { duration: 1000, easing: 'ease-in-out' }).then(() => { a.style.zIndex = 2; });
    setTimeout(() => burst(tx, ty, '#ffd89a', 12), T(500));
    return Promise.resolve();
  }
  async function cast(e) {
    // 魔法／陷阱翻開：卡片飛到中央放大
    const id = e.cards[0], who = e.who, o = P[who];
    let src = null, w = hsz(who)[0], h = hsz(who)[1];
    if (e.type === 'spell') src = o.hand.find((x) => x._id === id);
    else { src = o.traps.find((x) => x._id === id); w = TRAPW; h = TRAPH; }
    const p0 = src ? pos(src) : { x: CX, y: L[who].gy };
    const big = mk('pc', fx, `left:${p0.x}px;top:${p0.y}px;width:${w}px;height:${h}px;z-index:25`);
    big.appendChild(flatOf(id)); mk('tint', big, '', '').style.cssText += ';--dc:var(--gold)';
    big.style.setProperty('--dc', 'var(--gold)');
    const s = CFG.castW / w, tx = CX - p0.x - w / 2, ty = CFG.cy - 32 - p0.y - h / 2;
    big.style.zIndex = 25;
    await anim(big, [{ transform: tr(0, 0, 1, 0) }, { transform: tr(tx, ty, s, 0) }], { duration: 520 });
    burst(CX, CFG.cy - 32, '#ffe9a0', 18);
    setTimeout(() => anim(big, [{ opacity: 1 }, { opacity: 0 }], { duration: 400 }).then(() => big.remove()), T(520));
  }
  function showBanner(b1, b2, hold) {
    banner.querySelector('.b1').textContent = b1; banner.querySelector('.b2').textContent = b2;
    return anim(banner, hold ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 0, transform: 'scale(.9)' }, { opacity: 1, transform: 'scale(1)', offset: .2 }, { opacity: 1, offset: .75 }, { opacity: 0 }], { duration: hold ? 700 : 1500 });
  }
  const dwell = (e) => {
    const base = { turn: 1500, setup: 1500, draw: 900, sac: 1300, summon: 1700, evolve: 1900, synth: 2000, fusion: 2000, spell: 1700, trap: 1900, field: 1800, attack: 1700, dmg: 1400, death: 1500, effect: 1400, heal: 1300, info: 1000, end: 2000 }[e.type] || 1200;
    return base + Math.min(900, ((e.why ? e.why.length : 0) + (e.rule ? e.rule.length : 0)) * 6);
  };

  function resetFx() {
    banner.getAnimations().forEach((a) => a.cancel()); banner.style.opacity = 0;
    fx.innerHTML = '';
  }
  function setCaption(e, i) {
    cap.textContent = e.text; cap.classList.toggle('turn', e.type === 'turn'); side_(e, i);
    $('m-turn').textContent = e.turn; $('m-step').textContent = i + 1; $('m-total').textContent = game.events.length;
    $('prev').disabled = i <= 0; $('next').disabled = i >= game.events.length - 1;
  }
  async function present(i, myToken) {
    const e = game.events[i];
    setCaption(e, i); pushLog(e, i); logEl.scrollTop = logEl.scrollHeight;
    if (e.type === 'turn') showBanner(`第 ${e.turn} 回合`, `${game.p0 && ''}${e.text.replace(/━/g, '').replace(/^\s*第 \d+ 回合：/, '').trim()}`);
    if (e.type === 'attack') { render(e.snap, true, e); lunge(e); await sleep(T(900)); if (myToken !== token) return; }
    else if ((e.type === 'spell') || (e.type === 'trap' && !/蓋進/.test(e.text))) { await cast(e); if (myToken !== token) return; render(e.snap, true, e); }
    else if (e.type === 'end') { render(e.snap, true, e); const w = game.winner; showBanner(w == null ? '平手' : `${game.p[w]}獲勝`, e.text.replace(/！$/, ''), true); }
    else render(e.snap, true, e);
    await sleep(T(dwell(e)) - (e.type === 'attack' ? T(900) : 0));
  }
  function jump(i) { // 瞬間跳到某事件（不演動畫）
    resetFx(); idx = i; const e = game.events[i];
    clearAll(); render(e.snap, false, e); setCaption(e, i); fillLog(i);
    if (e.type === 'end') { const w = game.winner; banner.querySelector('.b1').textContent = w == null ? '平手' : `${game.p[w]}獲勝`; banner.querySelector('.b2').textContent = e.text.replace(/！$/, ''); banner.style.opacity = 1; }
  }
  function clearAll() {
    P.forEach((o) => {
      for (const el of o.gods.values()) el.remove(); o.gods.clear();
      o.hand.forEach((h) => h.remove()); o.hand = []; o.traps.forEach((t) => t.remove()); o.traps = [];
      if (o.field) { o.field.remove(); o.field = null; } o.graveId = null; o.heart = null; o.origin = {};
    });
  }
  function settle() { token++; wake(); stage.getAnimations({ subtree: true }).forEach((a) => { try { a.finish(); } catch (_) { } }); }

  // ───────── 控制 ─────────
  function setPlaying(v) { playing = v; $('play').disabled = v || !game || idx >= game.events.length - 1; $('pause').disabled = !v; }
  async function run() {
    const my = ++token; setPlaying(true);
    while (playing && my === token && idx < game.events.length - 1) {
      idx++; await present(idx, my);
    }
    if (my === token) setPlaying(false);
  }
  function start(sd, autoplay) {
    settle(); seed = sd; game = E.play(sd, ['A', 'B']); game.p = game.p.map((p) => p.name);
    $('m-seed').textContent = sd; logEl.innerHTML = ''; setPlaying(false);
    jump(0); if (autoplay) setTimeout(run, 400);
    try { history.replaceState(null, '', '#seed=' + sd + (EXPL ? '&x=1' : '')); } catch (_) { }
  }
  $('play').onclick = () => { if (idx >= game.events.length - 1) { start(seed, true); return; } settle(); run(); };
  $('pause').onclick = () => { playing = false; setPlaying(false); wake(); token++; };
  $('restart').onclick = () => start(Math.floor(Math.random() * 90000) + 10000, true);
  $('next').onclick = async () => { settle(); setPlaying(false); if (idx < game.events.length - 1) { idx++; const my = ++token; await present(idx, my); } };
  $('prev').onclick = () => { settle(); setPlaying(false); if (idx > 0) jump(idx - 1); };
  $('speed').onchange = (e) => { speed = +e.target.value; };
  $('peek').onchange = (e) => { peek = e.target.checked; settle(); const i = idx; clearAll(); jump(i); };
  $('logbtn').onclick = () => $('drawer').classList.toggle('on');
  $('dclose').onclick = () => $('drawer').classList.remove('on');
  document.addEventListener('keydown', (e) => { if (e.key === ' ' && e.target === document.body) { e.preventDefault(); (playing ? $('pause') : $('play')).click(); } });

  // 縮放
  function fit() {
    const wrap = $('wrap'), bar = document.querySelector('.bar').offsetHeight;
    const w = window.innerWidth, h = Math.max(200, window.innerHeight - bar);
    const f = Math.min(w / CFG.SW, h / CFG.SH);
    stage.style.transform = `scale(${f})`; wrap.style.height = CFG.SH * f + 'px'; stage.style.left = (w - CFG.SW * f) / 2 + 'px';
  }
  window.addEventListener('resize', () => { if ((window.innerWidth < window.innerHeight) !== PORT && !/layout=/.test(location.search)) { try { sessionStorage.setItem('sim-idx', idx); } catch (_) { } location.reload(); } else fit(); }); fit();

  const m = /seed=(\d+)/.exec(location.hash);
  $('explain').checked = EXPL;
  $('explain').onchange = (e) => { try { sessionStorage.setItem('sim-idx', idx); } catch (_) { } history.replaceState(null, '', '#seed=' + seed + (e.target.checked ? '&x=1' : '')); location.reload(); };
  start(m ? +m[1] : 3874, false);
  try { const k = sessionStorage.getItem('sim-idx'); if (k != null) { sessionStorage.removeItem('sim-idx'); jump(Math.min(+k, game.events.length - 1)); } } catch (_) { }
  window.__battle = { get game() { return game; }, jump, present: (i) => present(i, ++token), get idx() { return idx; } };
})();

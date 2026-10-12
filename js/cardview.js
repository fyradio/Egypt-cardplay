/* 卡牌元件：組出卡片 DOM、立體翻牌、傾斜與燙金反光 */
(function () {
  'use strict';
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let backCache = null;

  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function frontHTML(card) {
    const R = window.CardArt.RARITY[card.rarity];
    let h = window.CardArt.cardSVG(card);
    h += `<div class="cf cf-cost">${card.cost}</div>`;
    h += `<div class="cf cf-name${card.name.length > 4 ? ' long' : ''}">${card.name}</div>`;
    h += `<div class="cf cf-type">${card.typeLine}${card.stage ? `<span class="stage">${card.stage}</span>` : ''}</div>`;
    h += `<div class="cf cf-text"><div>${card.text}</div>${card.flavor ? `<div class="cf-flavor">${card.flavor}</div>` : ''}</div>`;
    if (card.kind === 'monster') {
      h += `<div class="cf cf-stat cf-atk" aria-label="攻擊">${card.atk}</div><div class="cf cf-stat cf-hp" aria-label="生命">${card.hp}</div>`;
      h += `<div class="cf cf-foot l">${R.name}</div><div class="cf cf-foot r">No.${card.no}</div>`;
    } else {
      h += `<div class="cf cf-foot l">${card.sub}</div><div class="cf cf-foot r">No.${card.no}　${R.name}</div>`;
    }
    h += `${card.rarity === 'mythic' ? '<div class="shimmer"></div>' : ''}<div class="foil"></div><div class="glint"></div>`;
    return h;
  }

  function create(card, opts) {
    opts = opts || {};
    const root = el('div', `card3d kind-${card.kind} rarity-${card.rarity}`);
    root.dataset.id = card.id;
    root.setAttribute('role', 'button');
    root.setAttribute('tabindex', '0');
    root.setAttribute('aria-label', `${card.name}（點一下翻牌）`);
    const shadow = el('div', 'shadow');
    const tilt = el('div', 'tilt');
    const flipper = el('div', 'flipper');
    if (!backCache) backCache = window.CardArt.backSVG();
    const back = el('div', 'face back', backCache + `<div class="shimmer" style="--sd:${(Math.random() * 3).toFixed(2)}s"></div><div class="foil"></div>`);
    const front = el('div', 'face front', frontHTML(card));
    const edge = el('div', 'edge');
    flipper.append(back, edge, front);
    if (card.rarity === 'mythic') {
      const burst = el('div', 'burst', '<div class="ray"></div>' + Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2 + Math.random() * 0.3, d = 90 + Math.random() * 80;
        return `<i style="--tx:${Math.cos(a) * d}%;--ty:${Math.sin(a) * d}%;--d:${(Math.random() * 0.18).toFixed(2)}s"></i>`;
      }).join(''));
      tilt.append(burst);
    }
    tilt.append(flipper);
    root.append(shadow, tilt);
    root._state = { faceUp: !!opts.faceUp, busy: false };
    flipper.style.setProperty('--flip', root._state.faceUp ? '180deg' : '0deg');
    bindTilt(root);
    return root;
  }

  // 立體翻牌：抬起 → 翻轉（看得到燙金側邊）→ 落下 → 一道光掃過
  function flip(root, toFaceUp) {
    const st = root._state;
    if (st.busy) return Promise.resolve();
    if (toFaceUp == null) toFaceUp = !st.faceUp;
    if (toFaceUp === st.faceUp) return Promise.resolve();
    st.busy = true;
    const flipper = root.querySelector('.flipper');
    const from = st.faceUp ? 180 : 0, to = toFaceUp ? 180 : 0;
    const dir = to > from ? 1 : -1;
    const mid1 = from + dir * 70, mid2 = from + dir * 150;
    const shadow = root.querySelector('.shadow');
    const done = () => {
      st.faceUp = toFaceUp; st.busy = false;
      flipper.style.setProperty('--flip', to + 'deg');
      root.setAttribute('aria-label', `${root.dataset.name || ''}${toFaceUp ? '' : '（點一下翻牌）'}`);
      if (toFaceUp) {
        const g = root.querySelector('.front .glint');
        if (g && !reduce) { g.classList.remove('run'); void g.offsetWidth; g.classList.add('run'); }
      }
    };
    if (reduce || !flipper.animate) { done(); return Promise.resolve(); }
    flipper.style.setProperty('--flip', from + 'deg');
    const anim = flipper.animate([
      { transform: `translateZ(0) rotateY(${from}deg) scale(1)` },
      { transform: `translateZ(120px) rotateY(${mid1}deg) scale(1.08)`, offset: 0.38 },
      { transform: `translateZ(120px) rotateY(${mid2}deg) scale(1.08)`, offset: 0.72 },
      { transform: `translateZ(0) rotateY(${to + dir * -6}deg) scale(1)`, offset: 0.9 },
      { transform: `translateZ(0) rotateY(${to}deg) scale(1)` },
    ], { duration: 980, easing: 'cubic-bezier(.35,.1,.25,1)' });
    shadow.animate([{ opacity: 1, transform: 'translateZ(-1px) scale(1)' }, { opacity: .45, transform: 'translateZ(-1px) scale(1.12) translateY(6%)', offset: .5 }, { opacity: 1, transform: 'translateZ(-1px) scale(1)' }], { duration: 980, easing: 'ease-in-out' });
    if (toFaceUp && root.classList.contains('rarity-mythic')) {
      setTimeout(() => { const b = root.querySelector('.burst'); if (b) { b.classList.remove('run'); void b.offsetWidth; b.classList.add('run'); } }, 600);
    }
    return anim.finished.then(done, done);
  }

  // 傾斜＋反光位置跟著手指或滑鼠
  function bindTilt(root) {
    if (reduce) return;
    const set = (cx, cy) => {
      const r = root.getBoundingClientRect();
      const px = Math.min(1, Math.max(0, (cx - r.left) / r.width)), py = Math.min(1, Math.max(0, (cy - r.top) / r.height));
      root.style.setProperty('--ry', ((px - 0.5) * 16).toFixed(2) + 'deg');
      root.style.setProperty('--rx', ((0.5 - py) * 14).toFixed(2) + 'deg');
      root.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      root.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    };
    root.addEventListener('pointermove', (e) => { root.classList.add('is-tilting'); set(e.clientX, e.clientY); });
    root.addEventListener('pointerleave', () => {
      root.classList.remove('is-tilting');
      root.style.setProperty('--rx', '0deg'); root.style.setProperty('--ry', '0deg');
    });
  }

  window.CardView = { create, flip };
})();

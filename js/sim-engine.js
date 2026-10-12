/* 《太陽船之書》對戰模擬引擎（草案規則）
 * 一口氣把整局打完，每個動作記成一個「事件」（文字說明＋當下盤面快照）；
 * 網頁只負責播放這些事件。這樣播放／暫停／單步都很簡單，規則也能單獨用 node 測試。
 */
(function (root) {
  'use strict';
  const DEFS = root.SIM_DEFS, DECKS = root.SIM_DECKS, SYNTH = root.SIM_SYNTH;
  const BEATS = { sun: 'desert', desert: 'nile', nile: 'underworld', underworld: 'moon', moon: 'sun' };
  const DN = { sun: '太陽', desert: '沙漠', nile: '尼羅', underworld: '冥界', moon: '月亮' };
  const KWN = { guard: '守護', fly: '飛行', poison: '劇毒', rush: '狂暴', undying: '不朽', hidden: '隱匿', noatk: '不能攻擊', night: '夜行' };
  const RULES = {
    start: '【開局】雙方心 20 點，牌組 30 張，起手 5 張；先攻的人第一回合不抽牌。',
    sac: '【資源】每回合可以把 1 張手牌蓋放到「神殿」當祭品。神殿每多 1 張，安卡（☥）上限 +1，最高 8；祭品當回合就能用。',
    ankh: '【資源】安卡每回合開始全部回復到神殿張數（上限 8）。召喚、進化、施法都要付安卡。',
    summon: '【召喚】神祇欄只有 3 格。剛召喚的神祇當回合不能攻擊（狂暴除外）。',
    evolve: '【進化】進化卡直接疊在場上的低階神祇上：它必須已經在場滿 1 回合，只付「進化費用」，傷害保留，每回合每隻最多進化一次。',
    synth: '【合成】不用魔法卡：場上指定的素材各在場滿 1 回合，在你的回合開始時自動合體；素材進墓地，合成怪保留素材一半的傷害。',
    fusion: '【融合】要打出融合魔法：把場上的素材送去墓地，從「聖櫃」（額外牌組）召喚融合怪。',
    revive: '【死者復活】倒下的神祇會進墓地，復活類的牌可以把它們放回場上。',
    trap: '【陷阱】陷阱蓋放在「墓室」（3 格），對手的動作符合條件時自動翻開，用一次就進墓地。',
    field: '【場地】場地區只有 1 格，新的場地會取代舊的。',
    domain: '【領域剋制】太陽 > 沙漠 > 尼羅 > 冥界 > 月亮 > 太陽。剋制對方時，攻擊 +2。',
    guard: '【守護】敵方有「守護」神祇時，攻擊者必須先打它（飛行者不受限制）。',
    fly: '【飛行】飛行的神祇不受守護者阻擋。',
    poison: '【劇毒】被劇毒神祇打傷的神祇會直接死亡。',
    combat: '【戰鬥】防守方先扣血；如果沒死，會反擊。敵方沒有神祇時才能直接攻擊「心」。',
    undying: '【不朽】木乃伊類神祇第一次死亡時不進墓地，而是回到手牌。',
    hidden: '【隱匿】不會成為對手魔法或陷阱的對象。',
    fatigue: '【疲勞】牌組抽完還要抽牌時，心扣 2 點。',
    heart: '【勝負】心降到 0 就輸。',
    rush: '【狂暴】召喚當回合就能攻擊。',
    night: '【夜行】偶數回合攻擊 +2。',
    divine: '【三神】三神只能特殊召喚：阿蒙要放逐 3 張手牌，而且你的神殿至少要有 5 張（草案：避免第 2 回合就出神）。',
    spell: '【魔法】魔法用完進墓地；每回合托特在場時，第一張魔法費用 −1。',
  };

  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  const kwBonus = { guard: 2, fly: 2, poison: 3, rush: 1.5, undying: 2, hidden: 4, noatk: -2, night: 1 };
  function valueOf(d) {
    if (d.fv) return d.fv;
    if (d.kind !== 'god') return 4;
    let v = d.atk * 1.1 + d.hp * 0.7 + (d.vb || 0);
    for (const k of d.kw) v += kwBonus[k] || 0;
    return v;
  }

  function newGame(seed, keys) {
    const rng = mulberry32(seed);
    const g = { seed, rng, turn: 0, cur: 0, over: false, winner: null, events: [], seen: new Set(), uid: 1, p: [], DEFS };
    keys = keys || ['A', 'B'];
    for (let i = 0; i < 2; i++) {
      const dk = DECKS[keys[i]];
      const deck = [];
      for (const id in dk.cards) for (let k = 0; k < dk.cards[id]; k++) deck.push(id);
      for (let k = deck.length - 1; k > 0; k--) { const j = Math.floor(rng() * (k + 1)); [deck[k], deck[j]] = [deck[j], deck[k]]; }
      g.p.push({ i, key: keys[i], name: dk.player, deckName: dk.name, style: dk.style, ai: dk.ai, deck, hand: [], grave: [], gods: [], traps: [], field: null, temple: 0, ankh: 0, heart: 20, turns: 0, ark: dk.ark.slice(), flags: {}, used: {}, exiled: 0 });
    }
    return g;
  }

  // ───────── 事件與快照 ─────────
  const nm = (id) => DEFS[id].name;
  const pn = (p) => `【${p.name}】`;
  function mod(g, inst) {
    const p = g.p[inst.owner], d = inst.def; let a = 0, h = 0;
    const f = p.field ? p.field.id : null;
    if (f === 'karnak') h += 2;
    if (f === 'inundation' && d.domain === 'nile') { a += 1; h += 1; }
    if (f === 'duat' && (d.domain === 'underworld' || d.domain === 'moon')) a += 2;
    if (d.kw.includes('night') && p.turns % 2 === 0) a += 2;
    return { a, h };
  }
  const ATK = (g, inst) => Math.max(0, inst.def.atk + mod(g, inst).a);
  const MAXHP = (g, inst) => inst.def.hp + mod(g, inst).h;
  const HP = (g, inst) => MAXHP(g, inst) - inst.damage;
  const beats = (a, b) => !!a && !!b && BEATS[a] === b;
  const ankhMax = (p) => Math.min(8, p.temple);

  function snap(g) {
    return {
      turn: g.turn, cur: g.cur,
      p: g.p.map((p) => ({
        name: p.name, deckName: p.deckName, heart: p.heart, ankh: p.ankh, nileAnkh: p.flags.nile || 0, ankhMax: ankhMax(p), temple: p.temple, deck: p.deck.length,
        hand: p.hand.slice(), grave: p.grave.slice(), ark: p.ark.slice(), exiled: p.exiled,
        gods: p.gods.map((x) => ({ uid: x.uid, id: x.def.id, atk: ATK(g, x), hp: HP(g, x), max: MAXHP(g, x), sick: x.sick, stun: x.stun, base: x.def.atk })),
        traps: p.traps.map((t) => t.id), field: p.field ? p.field.id : null,
      })),
    };
  }
  function ev(g, type, text, o) {
    o = o || {};
    const keys = [].concat(o.rule || []).filter((k) => k && !g.seen.has(k));
    keys.forEach((k) => g.seen.add(k));
    const rule = keys.length ? keys.map((k) => RULES[k]).join('\n') : null;
    g.events.push({ type, text, why: o.why || null, rule, cards: o.cards || [], who: o.who == null ? g.cur : o.who, turn: g.turn, snap: snap(g) });
  }

  // ───────── 基本動作 ─────────
  function mkInst(g, def, owner) { return { uid: g.uid++, def, owner, damage: 0, age: 0, sick: true, stun: false, sleep: 0, evolved: false, under: [] }; }
  function draw(g, p, n, why) {
    const got = [];
    for (let k = 0; k < n; k++) {
      if (!p.deck.length) { p.heart -= 2; ev(g, 'dmg', `${pn(p)}牌組已經抽完，還要抽牌 → 疲勞，心 −2（剩 ${p.heart}）。`, { rule: 'fatigue', who: p.i }); checkEnd(g); if (g.over) return got; continue; }
      const id = p.deck.pop(); p.hand.push(id); got.push(id);
    }
    return got;
  }
  function checkEnd(g) {
    if (g.over) return;
    for (const p of g.p) if (p.heart <= 0) {
      g.over = true; g.winner = 1 - p.i;
      ev(g, 'end', `${pn(p)}的心降到 0。${pn(g.p[1 - p.i])}獲勝！`, { rule: 'heart', who: 1 - p.i });
      return;
    }
  }
  function hurtHeart(g, p, n) { p.heart -= n; checkEnd(g); }
  function checkDeaths(g, by) {
    let again = true;
    while (again && !g.over) {
      again = false;
      for (const p of g.p) for (const inst of p.gods.slice()) {
        if (HP(g, inst) <= 0) { destroy(g, p, inst, by); again = true; }
      }
    }
  }
  function destroy(g, p, inst, by) {
    p.gods = p.gods.filter((x) => x !== inst);
    const d = inst.def;
    if (d.kw.includes('undying') && !p.used['u' + d.id]) {
      p.used['u' + d.id] = true; p.hand.push(d.id); p.grave.push(...inst.under);
      ev(g, 'death', `${pn(p)}的「${d.name}」倒下了，但它有「不朽」→ 不進墓地，回到手牌（這是它這場第一次死亡）。`, { rule: 'undying', cards: [d.id], who: p.i });
      return;
    }
    p.grave.push(d.id, ...inst.under);
    ev(g, 'death', `${pn(p)}的「${d.name}」倒下，送進墓地。`, { cards: [d.id], who: p.i });
    if (by && by.def && by.def.id === 'anubis' && by.owner !== p.i && !g.over) {
      const got = draw(g, g.p[by.owner], 1);
      ev(g, 'effect', `阿努比斯的能力：擊敗敵方神祇 → ${pn(g.p[by.owner])}抽 1 張牌。`, { cards: ['anubis'], who: by.owner });
    }
  }
  function pay(p, cost, def) {
    let n = cost;
    if (def && def.domain === 'nile' && p.flags.nile) { const u = Math.min(n, p.flags.nile); p.flags.nile -= u; n -= u; }
    p.ankh -= n;
  }
  const avail = (p, def) => p.ankh + (def && def.domain === 'nile' ? (p.flags.nile || 0) : 0);

  // ───────── 進場與效果 ─────────
  function enter(g, p, inst, how) {
    const d = inst.def, o = g.p[1 - p.i];
    if (d.id === 'scarab') { draw(g, p, 1); ev(g, 'effect', `聖甲蟲進場：${pn(p)}抽 1 張牌。`, { cards: ['scarab'] }); }
    if (d.id === 'isis') { p.heart = Math.min(20, p.heart + 3); ev(g, 'heal', `伊西斯進場：${pn(p)}的心回復 3 點（現在 ${p.heart}）。`, { cards: ['isis'] }); }
    if (d.id === 'thoth') { draw(g, p, 2); ev(g, 'effect', `托特召喚：${pn(p)}抽 2 張牌。`, { cards: ['thoth'] }); }
    if (d.id === 'osiris') {
      const best = bestGrave(g, p);
      if (best != null && p.gods.length < 3) { reviveFromGrave(g, p, best, '奧西里斯進場'); }
      else ev(g, 'effect', `奧西里斯進場：墓地沒有可復活的神祇（或沒有空位），效果落空。`, { cards: ['osiris'] });
    }
    if (d.id === 'serapis') {
      const k = p.grave.indexOf('mouth');
      if (k >= 0) { p.grave.splice(k, 1); p.hand.push('mouth'); ev(g, 'effect', `塞拉皮斯召喚：把墓地的「開口儀式」收回手牌。`, { cards: ['serapis', 'mouth'] }); }
      else ev(g, 'effect', `塞拉皮斯召喚：墓地沒有「開口儀式」可收回。`, { cards: ['serapis'] });
    }
    if (p.field && p.field.id === 'karnak' && !p.flags.karnak && how !== 'evolve') {
      p.flags.karnak = true; p.ankh += 1;
      ev(g, 'effect', `卡納克大柱廳：${pn(p)}本回合第一次召喚神祇 → 獲得 1 安卡（現在 ${p.ankh}）。`, { cards: ['karnak'], rule: 'field' });
    }
    // 對手的陷阱
    if (how !== 'evolve') triggerTraps(g, o, 'summon', { inst });
  }
  function bestGrave(g, p) {
    let best = null, bv = -1;
    p.grave.forEach((id, k) => { const d = DEFS[id]; if (d.kind === 'god' && !d.divine && valueOf(d) > bv && !(d.from && false)) { bv = valueOf(d); best = k; } });
    return best;
  }
  function reviveFromGrave(g, p, idx, src) {
    const id = p.grave.splice(idx, 1)[0], d = DEFS[id];
    const inst = mkInst(g, d, p.i); p.gods.push(inst);
    inst.damage = Math.max(0, MAXHP(g, inst) - 3);
    ev(g, 'summon', `${src}：${pn(p)}從墓地把「${d.name}」放回場上（生命 3），它這回合不能攻擊。`, { cards: [id], rule: 'revive' });
  }
  function summon(g, p, id, how) {
    const d = DEFS[id], inst = mkInst(g, d, p.i);
    inst.sick = !d.kw.includes('rush');
    p.gods.push(inst);
    return inst;
  }
  function triggerTraps(g, owner, kind, ctx) {
    for (const t of owner.traps.slice()) {
      if (g.over) return;
      if (kind === 'summon' && ctx.inst && !ctx.inst.def.kw.includes('hidden') && ctx.inst.owner !== owner.i && g.p[ctx.inst.owner].gods.includes(ctx.inst)) {
        if (t.id === 'pit') {
          owner.traps = owner.traps.filter((x) => x !== t); owner.grave.push('pit');
          ctx.inst.damage += 2;
          ev(g, 'trap', `${pn(owner)}的陷阱翻開：「沙坑」！${nm(ctx.inst.def.id)}一進場就掉進沙坑，受到 2 點傷害。`, { cards: ['pit'], who: owner.i, rule: 'trap' });
          checkDeaths(g);
        } else if (t.id === 'shaft') {
          owner.traps = owner.traps.filter((x) => x !== t); owner.grave.push('shaft');
          ctx.inst.sleep = 1;
          ev(g, 'trap', `${pn(owner)}的陷阱翻開：「豎井陷阱」！${nm(ctx.inst.def.id)}掉進深坑，下一個回合不能行動。`, { cards: ['shaft'], who: owner.i, rule: 'trap' });
        }
      }
    }
  }

  // ───────── 回合開始：合成、抽牌 ─────────
  function startTurn(g) {
    const p = g.p[g.cur], o = g.p[1 - g.cur];
    g.turn++; p.turns++;
    p.flags = { nile: 0 };
    for (const x of p.gods) { x.age++; x.sick = false; x.evolved = false; x.stunned = false; if (x.sleep > 0) { x.sleep--; x.stun = true; } else x.stun = false; }
    p.ankh = ankhMax(p);
    ev(g, 'turn', `━━ 第 ${g.turn} 回合：${pn(p)}（${p.deckName}）━━`, { rule: g.turn === 1 ? 'start' : null });
    const kh = p.gods.filter((x) => x.def.id === 'khepri').length;
    if (kh) { p.ankh += kh; ev(g, 'effect', `凱布利的「晨光」：${pn(p)}本回合安卡 +${kh}（現在 ${p.ankh}）。`, { cards: ['khepri'] }); }
    if (p.field && p.field.id === 'inundation') { p.flags.nile = 1; ev(g, 'effect', `尼羅河氾濫：${pn(p)}多得 1 安卡（只能用來召喚尼羅神祇）。`, { cards: ['inundation'] }); }
    // 合成
    for (const r of SYNTH) {
      if (g.over) return;
      const mats = r.mats.map((id) => p.gods.find((x) => x.def.id === id && x.age >= 1));
      if (mats.every(Boolean)) {
        const dmg = Math.floor(mats.reduce((a, x) => a + x.damage, 0) / 2);
        p.gods = p.gods.filter((x) => !mats.includes(x));
        for (const m of mats) p.grave.push(m.def.id, ...m.under);
        const inst = mkInst(g, DEFS[r.into], p.i); inst.age = 1; inst.sick = false; inst.damage = dmg; p.gods.push(inst);
        ev(g, 'synth', `合成！${r.mats.map(nm).join('＋')}都在場滿 1 回合 → 合體成「${nm(r.into)}」（保留一半傷害：${dmg}）。素材進墓地。`, { cards: [r.into, ...r.mats], rule: 'synth' });
      }
    }
    if (g.turn === 1) { ev(g, 'draw', `${pn(p)}是先攻，第一回合不抽牌。`); return; }
    const got = draw(g, p, 1);
    if (got.length) ev(g, 'draw', `${pn(p)}抽 1 張牌（手牌 ${p.hand.length} 張，牌組剩 ${p.deck.length} 張）。`, { why: null });
  }

  // ───────── AI 判斷：祭品 ─────────
  function keepValue(g, p, id) {
    const d = DEFS[id];
    if (d.divine) return 99;
    let v = valueOf(d);
    if (d.from && p.gods.some((x) => x.def.id === d.from)) v += 5;
    else if (d.from) v -= 0.5;
    if (d.id === 'mouth') v = p.grave.some((i) => DEFS[i].kind === 'god') ? 6 : 2.5;
    if (d.id === 'fusion') v = p.ark.some((a) => DEFS[a].fusion.every((m) => p.gods.some((x) => x.def.id === m))) ? 9 : 3;
    if (d.id === 'heka') v = g.p[1 - p.i].gods.length ? 5 : 2.5;
    if (d.id === 'eye') v = 4;
    if (d.kind === 'trap') v = 4 + (p.ai.trapLove || 0) * 0.5;
    if (d.kind === 'field') v = (p.field ? 3 : 5);
    if (SYNTH.some((r) => r.mats.includes(id))) v += 1.5;
    if (needMat(g, p, id)) v += 4;
    if (p.hand.filter((x) => x === id).length > 1) v -= 1.2;
    return v;
  }
  function sacrificePhase(g, p) {
    if (p.flags.sac || p.hand.length < 2 || p.temple >= 8) return;
    const playableNow = listActions(g, p).some((a) => a.score > 0);
    const want = p.temple < p.ai.temple;
    const stuck = !playableNow && p.temple < 8;
    if (!want && !stuck) return;
    let worst = null, wv = 1e9;
    p.hand.forEach((id, k) => { const v = keepValue(g, p, id) + g.rng() * 0.3; if (v < wv) { wv = v; worst = k; } });
    const id = p.hand.splice(worst, 1)[0];
    p.temple++; p.ankh++; p.flags.sac = true;
    ev(g, 'sac', `${pn(p)}把手牌「${nm(id)}」蓋放到神殿當祭品。神殿 ${p.temple} 張 → 安卡上限 ${ankhMax(p)}，本回合安卡 ${p.ankh}。`,
      { why: want ? `AI 想法：神殿目標是 ${p.ai.temple} 張，先把資源養起來；挑手牌裡最沒用的那張。` : 'AI 想法：現在沒有東西可用，不如多養一點安卡。', cards: [id], rule: ['sac', 'ankh'] });
  }

  // ───────── AI 判斷：主要階段 ─────────
  function spellCost(g, p, d) {
    let c = d.cost;
    if (d.kind === 'spell' && !p.flags.spell && p.gods.some((x) => x.def.id === 'thoth')) c = Math.max(0, c - 1);
    return c;
  }
  // 這張牌是不是「正在湊的合成／融合素材」：湊得起來的話，AI 會優先把它放上場
  function needMat(g, p, id) {
    for (const r of SYNTH) if (r.mats.includes(id) && r.mats.filter((m) => m !== id).every((m) => p.gods.some((x) => x.def.id === m) || p.hand.includes(m))) return true;
    if (p.hand.includes('fusion')) for (const a of p.ark) { const f = DEFS[a].fusion; if (f.includes(id) && f.filter((m) => m !== id).every((m) => p.gods.some((x) => x.def.id === m) || p.hand.includes(m))) return true; }
    return false;
  }
  function listActions(g, p) {
    const o = g.p[1 - p.i], acts = [];
    const slots = p.gods.length < 3;
    const uniq = new Set();
    p.hand.forEach((id, hi) => {
      if (uniq.has(id)) return; uniq.add(id);
      const d = DEFS[id];
      if (d.kind === 'god') {
        if (d.special) {
          if (slots && p.hand.length >= 4 && p.temple >= 5) acts.push({ score: 20, run: () => doAmun(g, p) });
          return;
        }
        if (d.from) {
          const base = p.gods.find((x) => x.def.id === d.from && x.age >= 1 && !x.evolved);
          if (base && avail(p, d) >= d.evoCost) acts.push({ score: valueOf(d) - valueOf(base.def) + 3, run: () => doEvolve(g, p, id, base) });
        } else if (slots && avail(p, d) >= d.cost) {
          let sc = valueOf(d) + d.cost * 0.35;
          if (d.stage === 1) sc = valueOf(d) * 0.75;
          if (needMat(g, p, id)) sc += 4;
          acts.push({ score: sc, run: () => doSummon(g, p, id) });
        }
      } else if (d.kind === 'spell') {
        const c = spellCost(g, p, d); if (p.ankh < c) return;
        if (d.id === 'eye') {
          const hurt = p.gods.filter((x) => x.damage >= 3).sort((a, b) => b.damage - a.damage)[0];
          if (hurt || p.heart <= 14) acts.push({ score: 5 + (hurt ? hurt.damage * 0.3 : 0), run: () => doEye(g, p, hurt) });
          else acts.push({ score: 1.2, run: () => doEye(g, p, null) });
        }
        if (d.id === 'mouth' && slots) { const k = bestGrave(g, p); if (k != null) acts.push({ score: valueOf(DEFS[p.grave[k]]) * 0.9, run: () => doMouth(g, p, k) }); }
        if (d.id === 'heka') {
          const ts = o.gods.filter((x) => !x.def.kw.includes('hidden'));
          const kill = ts.filter((x) => HP(g, x) <= 3).sort((a, b) => valueOf(b.def) - valueOf(a.def))[0];
          if (kill) acts.push({ score: valueOf(kill.def) + 2.5, run: () => doHeka(g, p, kill) });
          else if (ts.length && p.ankh >= c + 1) acts.push({ score: 1, run: () => doHeka(g, p, ts.sort((a, b) => HP(g, a) - HP(g, b))[0]) });
        }
        if (d.id === 'fusion') {
          for (const aid of p.ark) {
            const ad = DEFS[aid]; const mats = ad.fusion.map((m) => p.gods.find((x) => x.def.id === m)); 
            if (mats.every(Boolean)) acts.push({ score: valueOf(ad) + 4, run: () => doFusion(g, p, aid, mats) });
          }
        }
      } else if (d.kind === 'trap') {
        if (p.traps.length < 3 && p.ankh >= d.cost && !(p.ankh - d.cost < 1 && p.hand.length > 3 && false)) acts.push({ score: 3 + (p.ai.trapLove || 0) + (o.gods.length ? 0.5 : 0) - p.traps.length * 0.8, run: () => doTrap(g, p, id) });
      } else if (d.kind === 'field') {
        if (p.ankh >= d.cost && (!p.field || p.field.id !== d.id)) {
          const same = p.gods.filter((x) => d.id === 'karnak' || (d.id === 'inundation' && x.def.domain === 'nile') || (d.id === 'duat' && (x.def.domain === 'underworld' || x.def.domain === 'moon'))).length;
          acts.push({ score: (p.field ? 1.5 : 3) + same * 1.2 - (p.field ? 1 : 0), run: () => doField(g, p, id) });
        }
      }
    });
    if (p.field && p.field.id === 'duat' && !p.flags.duat && p.grave.length >= 2 && p.deck.length) acts.push({ score: 2.5, run: () => doDuat(g, p) });
    return acts;
  }
  function mainPhase(g, p) {
    let n = 0;
    while (n++ < 24 && !g.over) {
      const acts = listActions(g, p).filter((a) => a.score > 0.5);
      if (!acts.length) break;
      acts.sort((a, b) => b.score - a.score);
      acts[0].run();
    }
  }
  function removeHand(p, id) { const k = p.hand.indexOf(id); p.hand.splice(k, 1); }
  function why(p, t) { return `AI 想法：${t}`; }
  function doSummon(g, p, id) {
    const d = DEFS[id]; removeHand(p, id); pay(p, d.cost, d);
    const inst = summon(g, p, id, 'hand');
    const kws = d.kw.filter((k) => KWN[k]).map((k) => KWN[k]).join('、');
    ev(g, 'summon', `${pn(p)}花 ${d.cost} 安卡召喚「${d.name}」（${DN[d.domain]}・攻 ${d.atk}／生 ${d.hp}${kws ? '・' + kws : ''}）。剩 ${p.ankh} 安卡。`, { cards: [id], rule: ['summon'].concat(d.kw.filter((k) => RULES[k])), why: why(p, d.stage === 1 ? '先放一階，之後有機會進化。' : '這是現在花得起、最有價值的選擇。') });
    enter(g, p, inst, 'summon');
  }
  function doAmun(g, p) {
    removeHand(p, 'amun');
    const ex = [];
    for (let k = 0; k < 3; k++) {
      let worst = 0, wv = 1e9;
      p.hand.forEach((id, i) => { const v = keepValue(g, p, id); if (v < wv) { wv = v; worst = i; } });
      ex.push(p.hand.splice(worst, 1)[0]);
    }
    p.exiled += 3;
    const inst = summon(g, p, 'amun', 'special');
    ev(g, 'summon', `${pn(p)}特殊召喚三神之一「阿蒙」！放逐手牌「${ex.map(nm).join('、')}」（不進墓地）。阿蒙 6／10，擁有「隱匿」。`, { cards: ['amun'], rule: 'divine', why: why(p, '手牌夠多，用 3 張換一隻 6/10 的大神，值得。') });
    enter(g, p, inst, 'special');
  }
  function doEvolve(g, p, id, base) {
    const d = DEFS[id]; removeHand(p, id); pay(p, d.evoCost, d);
    const dmg = base.damage; base.under.push(base.def.id); base.def = d; base.evolved = true; base.damage = dmg;
    ev(g, 'evolve', `進化！${pn(p)}花 ${d.evoCost} 安卡，把「${nm(base.under[base.under.length - 1])}」進化成「${d.name}」（${d.stage} 階，攻 ${ATK(g, base)}／生 ${MAXHP(g, base)}）。傷害保留。`, { cards: [id, base.under[base.under.length - 1]], rule: 'evolve', why: why(p, '進化只付差額，比直接召喚划算。') });
    enter(g, p, base, 'evolve');
  }
  function doEye(g, p, tgt) {
    const d = DEFS.eye, c = spellCost(g, p, d); removeHand(p, 'eye'); p.ankh -= c; p.flags.spell = true; p.grave.push('eye');
    if (tgt) { tgt.damage = Math.max(0, tgt.damage - 4); ev(g, 'spell', `${pn(p)}打出「荷魯斯之眼」：「${tgt.def.name}」回復 4 點生命（現在 ${HP(g, tgt)}／${MAXHP(g, tgt)}），並抽 1 張。`, { cards: ['eye'], rule: 'spell' }); }
    else { p.heart = Math.min(20, p.heart + 4); ev(g, 'spell', `${pn(p)}打出「荷魯斯之眼」：沒有受傷的神祇，改回復心 4 點（現在 ${p.heart}），並抽 1 張。`, { cards: ['eye'], rule: 'spell' }); }
    draw(g, p, 1);
  }
  function doMouth(g, p, k) {
    const d = DEFS.mouth, c = spellCost(g, p, d); removeHand(p, 'mouth'); p.ankh -= c; p.flags.spell = true; p.grave.push('mouth');
    const idx = k > p.grave.length - 1 ? bestGrave(g, p) : bestGrave(g, p);
    ev(g, 'spell', `${pn(p)}打出「開口儀式」。`, { cards: ['mouth'], rule: 'spell' });
    if (idx != null) reviveFromGrave(g, p, idx, '開口儀式');
  }
  function doHeka(g, p, t) {
    const d = DEFS.heka, c = spellCost(g, p, d); removeHand(p, 'heka'); p.ankh -= c; p.flags.spell = true; p.grave.push('heka');
    t.damage += 3;
    ev(g, 'spell', `${pn(p)}打出「赫卡之焰」，對敵方「${t.def.name}」造成 3 點傷害（剩 ${Math.max(0, HP(g, t))}）。`, { cards: ['heka', t.def.id], rule: 'spell', why: why(p, HP(g, t) <= 0 ? '剛好能燒死它。' : '先削弱它。') });
    checkDeaths(g);
  }
  function doFusion(g, p, aid, mats) {
    const d = DEFS.fusion, c = spellCost(g, p, d); removeHand(p, 'fusion'); p.ankh -= c; p.flags.spell = true; p.grave.push('fusion');
    p.gods = p.gods.filter((x) => !mats.includes(x));
    for (const m of mats) p.grave.push(m.def.id, ...m.under);
    p.ark.splice(p.ark.indexOf(aid), 1);
    const inst = summon(g, p, aid, 'fusion');
    ev(g, 'fusion', `融合！${pn(p)}打出「融合・合體神」：把「${mats.map((m) => m.def.name).join('」「')}」送去墓地，從聖櫃召喚「${nm(aid)}」（攻 ${DEFS[aid].atk}／生 ${DEFS[aid].hp}）。`, { cards: [aid, ...mats.map((m) => m.def.id)], rule: 'fusion', why: why(p, '兩隻中等的神祇換一隻 5/10 的合體神。') });
    enter(g, p, inst, 'fusion');
  }
  function doTrap(g, p, id) {
    const d = DEFS[id]; removeHand(p, id); p.ankh -= d.cost;
    p.traps.push({ id, uid: g.uid++ });
    ev(g, 'trap', `${pn(p)}花 ${d.cost} 安卡，把一張陷阱面朝下蓋進墓室（${p.traps.length}/3）。（觀戰模式才看得到是「${d.name}」）`, { cards: [id], rule: 'trap', why: why(p, '陷阱要在對手動作之前先放好。') });
  }
  function doField(g, p, id) {
    const d = DEFS[id]; removeHand(p, id); p.ankh -= d.cost;
    if (p.field) { p.grave.push(p.field.id); }
    p.field = d;
    ev(g, 'field', `${pn(p)}花 ${d.cost} 安卡發動場地「${d.name}」：${d.desc}`, { cards: [id], rule: 'field' });
    checkDeaths(g);
  }
  function doDuat(g, p) {
    p.flags.duat = true; p.grave.splice(0, 2); p.exiled += 2; draw(g, p, 1);
    ev(g, 'effect', `冥河夜航：${pn(p)}放逐墓地 2 張卡，抽 1 張。`, { cards: ['duat'] });
  }

  // ───────── 戰鬥 ─────────
  function legalTargets(g, att) {
    const o = g.p[1 - att.owner];
    if (!o.gods.length) return ['heart'];
    const guards = o.gods.filter((x) => x.def.kw.includes('guard'));
    if (guards.length && !att.def.kw.includes('fly')) return guards;
    return o.gods.slice();
  }
  const canAttack = (g, x) => !x.sick && !x.stun && !x.noMore && ATK(g, x) > 0 && !x.def.kw.includes('noatk');
  function battlePhase(g, p) {
    const o = g.p[1 - p.i];
    const order = p.gods.slice().sort((a, b) => ATK(g, b) - ATK(g, a));
    for (const att of order) {
      if (g.over) return;
      if (!p.gods.includes(att) || !canAttack(g, att)) continue;
      const ts = legalTargets(g, att);
      let best = null, bs = -1e9, note = '';
      for (const t of ts) {
        let sc, nt;
        if (t === 'heart') { sc = ATK(g, att) * 1.3 * p.ai.aggr + (o.heart <= ATK(g, att) ? 100 : 0); nt = '敵方沒有神祇，可以直接打「心」。'; }
        else {
          const A = ATK(g, att) + (beats(att.def.domain, t.def.domain) ? 2 : 0);
          const B = ATK(g, t) + (beats(t.def.domain, att.def.domain) ? 2 : 0);
          const kill = A >= HP(g, t) || (att.def.kw.includes('poison') && A > 0);
          const die = !kill && (B >= HP(g, att) || (t.def.kw.includes('poison') && B > 0));
          sc = (kill ? valueOf(t.def) + 1 : A * 0.5) - (die ? valueOf(att.def) * 1.2 : B * 0.35);
          if (beats(att.def.domain, t.def.domain)) sc += 0.8;
          sc += p.ai.aggr * 0.6;
          nt = kill ? `打得死「${t.def.name}」。` : die ? `會被「${t.def.name}」反擊打死，不划算。` : `打不死「${t.def.name}」，但能削血。`;
        }
        if (sc > bs) { bs = sc; best = t; note = nt; }
      }
      if (best == null || bs < (p.ai.brave || 0) - 0.2) { ev(g, 'info', `「${att.def.name}」這回合不攻擊，留著當防守。`, { why: why(p, '主動攻擊的結果不划算（' + note + '）。') }); continue; }
      attack(g, p, att, best, note);
    }
  }
  function attack(g, p, att, tgt, note) {
    const o = g.p[1 - p.i], d = att.def;
    if (tgt === 'heart') {
      ev(g, 'attack', `「${d.name}」攻擊${pn(o)}的心！`, { cards: [d.id], rule: 'combat', why: why(p, note) });
    } else {
      const guarded = tgt.def.kw.includes('guard') && o.gods.length > 1;
      ev(g, 'attack', `「${d.name}」（${DN[d.domain]}・攻 ${ATK(g, att)}）攻擊「${tgt.def.name}」（${DN[tgt.def.domain]}・生 ${HP(g, tgt)}）。`, { cards: [d.id, tgt.def.id], rule: 'combat', why: why(p, (guarded ? '對面有守護者，只能打它。' : '') + note) });
    }
    if (d.id === 'sekhmet') {
      for (const x of o.gods) x.damage += 1;
      ev(g, 'effect', `塞赫美特的「毀滅之眼」：敵方所有神祇各受到 1 點傷害。`, { cards: ['sekhmet'] }); checkDeaths(g, att); if (g.over) return;
      if (tgt !== 'heart' && !o.gods.includes(tgt)) { att.noMore = true; return; }
    }
    // 陷阱：假門
    const fd = o.traps.find((t) => t.id === 'falsedoor');
    if (fd) {
      o.traps = o.traps.filter((t) => t !== fd); o.grave.push('falsedoor'); att.noMore = true;
      ev(g, 'trap', `${pn(o)}的陷阱翻開：「假門」！這次攻擊被引到假門上，無效；「${d.name}」這回合不能再攻擊。`, { cards: ['falsedoor'], who: o.i, rule: 'trap' });
      return;
    }
    att.noMore = true;
    if (tgt === 'heart') {
      o.heart -= ATK(g, att);
      ev(g, 'dmg', `${pn(o)}的心 −${ATK(g, att)}，剩 ${Math.max(0, o.heart)}。`, { who: o.i, rule: 'heart' }); checkEnd(g); return;
    }
    const A = ATK(g, att) + (beats(d.domain, tgt.def.domain) ? 2 : 0);
    if (beats(d.domain, tgt.def.domain)) ev(g, 'info', `領域剋制：${DN[d.domain]}剋${DN[tgt.def.domain]}，「${d.name}」攻擊 +2（共 ${A}）。`, { rule: 'domain' });
    tgt.damage += A;
    const poisoned = d.kw.includes('poison') && A > 0 && HP(g, tgt) > 0;
    if (poisoned) { tgt.damage = MAXHP(g, tgt); ev(g, 'effect', `劇毒！「${tgt.def.name}」被「${d.name}」打傷，毒發身亡。`, { rule: 'poison' }); }
    else ev(g, 'dmg', `「${tgt.def.name}」受到 ${A} 點傷害（剩 ${Math.max(0, HP(g, tgt))}）。`, {});
    if (HP(g, tgt) <= 0) { checkDeaths(g, att); return; }
    const B = ATK(g, tgt) + (beats(tgt.def.domain, d.domain) ? 2 : 0);
    if (B > 0) {
      att.damage += B;
      const pz = tgt.def.kw.includes('poison') && HP(g, att) > 0;
      if (pz) att.damage = MAXHP(g, att);
      ev(g, 'dmg', `「${tgt.def.name}」沒死 → 反擊！「${d.name}」受到 ${B} 點傷害（剩 ${Math.max(0, HP(g, att))}）${pz ? '，而且中毒身亡' : ''}。`, {});
      checkDeaths(g, tgt);
    } else ev(g, 'dmg', `「${tgt.def.name}」沒有攻擊力，無法反擊。`, {});
  }

  // ───────── 一整局 ─────────
  function play(seed, keys) {
    const g = newGame(seed, keys);
    ev(g, 'setup', `對戰開始！${pn(g.p[0])}「${g.p[0].deckName}」vs ${pn(g.p[1])}「${g.p[1].deckName}」。雙方洗牌，各抽 5 張。`, { who: 0 });
    for (const p of g.p) draw(g, p, 5);
    g.cur = g.rng() < 0.5 ? 0 : 1;
    ev(g, 'setup', `擲硬幣：${pn(g.p[g.cur])}先攻。`, { who: g.cur });
    while (!g.over && g.turn < 80) {
      const p = g.p[g.cur];
      startTurn(g);
      if (g.over) break;
      sacrificePhase(g, p);
      mainPhase(g, p);
      if (g.over) break;
      sacrificePhase(g, p);
      mainPhase(g, p);
      battlePhase(g, p);
      if (g.over) break;
      for (const x of p.gods) x.noMore = false;
      ev(g, 'info', `${pn(p)}回合結束。場上：${p.gods.map((x) => `${x.def.name}${ATK(g, x)}/${HP(g, x)}`).join('、') || '沒有神祇'}；心 ${p.heart}／${g.p[1 - p.i].heart}。`, {});
      g.cur = 1 - g.cur;
    }
    if (!g.over) {
      const [a, b] = g.p; g.over = true; g.winner = a.heart === b.heart ? null : a.heart > b.heart ? 0 : 1;
      ev(g, 'end', g.winner == null ? `打到第 ${g.turn} 回合仍未分勝負，雙方平手。` : `打到第 ${g.turn} 回合仍未分勝負，依「心」多寡，${pn(g.p[g.winner])}獲勝。`, {});
    }
    return g;
  }

  root.SimEngine = { play, RULES, DEFS, DECKS, DN, KWN, valueOf };
  if (typeof module !== 'undefined') module.exports = root.SimEngine;
})(typeof window !== 'undefined' ? window : globalThis);

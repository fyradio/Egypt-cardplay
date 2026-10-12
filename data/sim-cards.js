/* 對戰模擬用的卡牌資料與兩副牌組（草案數值，為了看規則而簡化）。
 * art:true 表示「這張卡的卡面已經做好」，模擬時會在旁邊顯示真正的卡；其他用文字代替。
 */
(function () {
  const D = {};
  const god = (id, name, domain, cost, atk, hp, o) => (D[id] = Object.assign({ id, name, kind: 'god', domain, cost, atk, hp, kw: [], desc: '' }, o || {}));
  const spell = (id, name, cost, desc, o) => (D[id] = Object.assign({ id, name, kind: 'spell', cost, desc, kw: [] }, o || {}));
  const trap = (id, name, cost, desc, o) => (D[id] = Object.assign({ id, name, kind: 'trap', cost, desc, kw: [] }, o || {}));
  const field = (id, name, cost, desc, o) => (D[id] = Object.assign({ id, name, kind: 'field', cost, desc, kw: [] }, o || {}));

  // 太陽
  god('egg', '聖甲蟲卵', 'sun', 1, 0, 2, { art: true, stage: 1, kw: ['noatk'], fv: 6, desc: '進化：在場滿 1 回合後，補 1 費進化成聖甲蟲。不能攻擊。' });
  god('scarab', '聖甲蟲', 'sun', 2, 2, 3, { art: true, stage: 2, from: 'egg', evoCost: 1, fv: 6, desc: '進場時：抽 1 張。' });
  god('khepri', '凱布利', 'sun', 3, 4, 7, { art: true, stage: 3, from: 'scarab', evoCost: 2, vb: 3, desc: '晨光：每回合開始，安卡 +1。' });
  god('cub', '小母獅', 'sun', 1, 1, 2, { art: true, stage: 1, fv: 6, desc: '進化：在場滿 1 回合後，可進化成母獅戰士。' });
  god('lioness', '母獅戰士', 'sun', 3, 4, 4, { art: true, stage: 2, from: 'cub', evoCost: 2, fv: 7, desc: '進化：從小母獅進化。' });
  god('sekhmet', '塞赫美特', 'sun', 5, 6, 7, { art: true, stage: 3, from: 'lioness', evoCost: 3, vb: 3, desc: '毀滅之眼：攻擊時，對所有敵方神祇各造成 1 點傷害。' });
  god('horus', '隼神荷魯斯', 'sun', 4, 4, 5, { art: true, kw: ['fly'], desc: '飛行：不受敵方守護者阻擋。' });
  god('pharaoh', '法老', 'sun', 3, 4, 4, { art: true, desc: '（可與小母獅合成斯芬克斯）' });
  god('sphinx', '斯芬克斯', 'desert', 5, 5, 6, { art: true, kw: ['guard'], synth: true, vb: 2, desc: '合成：小母獅＋法老。守門：敵人必須先攻擊它。' });
  // 尼羅
  god('crocegg', '鱷魚蛋', 'nile', 1, 0, 2, { stage: 1, kw: ['noatk'], fv: 6, desc: '進化：在場滿 1 回合後，可進化成尼羅小鱷。不能攻擊。' });
  god('crocy', '尼羅小鱷', 'nile', 2, 2, 3, { stage: 2, from: 'crocegg', evoCost: 1, fv: 6, desc: '進化：從鱷魚蛋進化。' });
  god('sobek', '索貝克', 'nile', 5, 4, 7, { stage: 3, from: 'crocy', evoCost: 3, kw: ['guard'], vb: 2, desc: '守護：敵人必須先攻擊它。' });
  god('isis', '伊西斯', 'nile', 4, 3, 5, { art: true, vb: 1, desc: '進場時：你的心回復 3 點。' });
  god('hapi', '哈碧', 'nile', 3, 2, 6, { art: true, kw: ['guard'], desc: '守護：敵人必須先攻擊它。' });
  god('apis', '阿比斯聖牛', 'nile', 3, 4, 4, { art: true, desc: '（可與奧西里斯融合成塞拉皮斯）' });
  // 沙漠
  god('set', '賽特', 'desert', 4, 5, 4, { art: true, kw: ['rush'], desc: '狂暴：召喚當回合就能攻擊。' });
  god('apep', '阿佩普', 'desert', 5, 4, 6, { art: true, kw: ['poison'], vb: 1, desc: '劇毒：被它打傷的神祇會死亡。' });
  god('scorp', '沙漠蠍', 'desert', 2, 1, 2, { art: true, kw: ['poison'], desc: '劇毒：被它打傷的神祇會死亡。' });
  // 冥界
  god('mummy', '木乃伊戰士', 'underworld', 2, 2, 3, { art: true, kw: ['undying'], desc: '不朽：每場戰鬥第一次死亡時，回到手牌。' });
  god('anubis', '阿努比斯', 'underworld', 4, 3, 6, { art: true, kw: ['guard'], vb: 1, desc: '守護。擊敗敵方神祇時，你抽 1 張牌。' });
  god('osiris', '奧西里斯', 'underworld', 5, 4, 7, { art: true, vb: 2, desc: '進場時：從墓地選 1 隻神祇，以 3 點生命放回場上。' });
  god('serapis', '塞拉皮斯', 'underworld', 5, 5, 10, { art: true, fusion: ['osiris', 'apis'], vb: 3, desc: '融合：奧西里斯＋阿比斯聖牛。召喚時：把墓地 1 張「開口儀式」收回手牌。' });
  // 月亮
  god('thoth', '托特', 'moon', 4, 2, 5, { art: true, vb: 2, desc: '召喚時：抽 2 張。你每回合使用的第一張魔法，費用 -1。' });
  god('khonsu', '孔蘇', 'moon', 3, 2, 4, { art: true, kw: ['night'], desc: '夜行：偶數回合攻擊 +2。' });
  god('bastet', '巴斯泰特', 'moon', 3, 2, 5, { art: true, kw: ['guard'], desc: '守護：敵人必須先攻擊它。' });
  god('amun', '阿蒙', 'moon', 0, 6, 10, { art: true, special: true, kw: ['hidden'], divine: true, vb: 6, desc: '特殊召喚：放逐手牌 3 張。隱匿：不會成為對手卡牌效果的對象。' });
  // 魔法
  spell('eye', '荷魯斯之眼', 2, '選一隻受傷最重的己方神祇回復 4 點生命（沒有則回復心 4 點），並抽 1 張。', { art: true });
  spell('mouth', '開口儀式', 3, '從墓地選 1 隻神祇，以 3 點生命放回場上。它這回合不能攻擊。', { art: true });
  spell('heka', '赫卡之焰', 2, '對 1 隻敵方神祇造成 3 點傷害。', { art: true });
  spell('fusion', '融合・合體神', 2, '把場上寫在聖櫃怪獸上的素材送去墓地，從聖櫃召喚它。', { art: true });
  // 場地
  field('karnak', '卡納克大柱廳', 2, '你的神祇生命 +2。每回合第一次召喚神祇，獲得 1 安卡。', { art: true });
  field('duat', '冥河夜航', 3, '你的冥界、月亮神祇攻擊 +2。每回合一次：放逐墓地 2 張卡，抽 1 張。', { art: true });
  field('inundation', '尼羅河氾濫', 1, '你的尼羅神祇攻擊 +1、生命 +1。每回合多得 1 安卡（限召喚尼羅神祇）。', { art: true });
  // 陷阱
  trap('falsedoor', '假門', 1, '敵方神祇宣告攻擊時：那次攻擊無效，那隻神祇這回合不能再攻擊。', { art: true });
  trap('pit', '沙坑', 1, '敵方召喚神祇時：那隻神祇受到 2 點傷害。', { art: true });
  trap('shaft', '豎井陷阱', 1, '敵方召喚神祇時：它掉進深坑，下一個回合不能行動。', { art: true });

  window.SIM_DEFS = D;
  window.SIM_SYNTH = [{ mats: ['cub', 'pharaoh'], into: 'sphinx' }];
  window.SIM_DECKS = {
    A: {
      player: '甲', name: '日輪先鋒', style: '進攻型：太陽與尼羅的神祇，靠進化、合成和場地把場面養大。',
      ai: { temple: 4, aggr: 1.1, trapLove: 0, brave: -0.5 },
      cards: { egg: 1, scarab: 1, khepri: 1, cub: 2, lioness: 2, sekhmet: 1, horus: 2, isis: 2, hapi: 2, pharaoh: 2, apis: 2, set: 2, heka: 2, eye: 2, karnak: 1, inundation: 1, falsedoor: 2, anubis: 2 },
      ark: [],
    },
    B: {
      player: '乙', name: '亡者與月', style: '控制型：陷阱、復活和融合，多放祭品換大招。',
      ai: { temple: 6, aggr: 0.85, trapLove: 2, brave: 0 },
      cards: { mummy: 2, anubis: 2, osiris: 1, thoth: 1, khonsu: 2, bastet: 2, set: 2, apep: 1, scorp: 2, apis: 2, amun: 1, mouth: 2, falsedoor: 2, pit: 1, shaft: 2, fusion: 2, duat: 1, heka: 2 },
      ark: ['serapis'],
    },
  };
})();

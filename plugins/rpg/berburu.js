"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');

const pluginConfig = {
  name: "berburu",
  alias: ["huntanimal", "buru"],
  category: "rpg",
  description: "Caza el animal para conseguirlo",
  usage: ".berburu",
  example: ".berburu",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 120,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};

  const staminaCost = 25;
  user.rpg.stamina = _nullishCoalesce(user.rpg.stamina, () => ( 100));

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡Oh hermana, tu resiscia se está enfriando!😭⚡\n\nLa crema es una caza ciega.${staminaCost}Stamina, pero te traje un restante${user.rpg.stamina}*.\nDescanse primero. Descanse.🛌💤`);
  }

  user.rpg.stamina -= staminaCost;

  await m.react("🏹");
  await m.reply(`Stow @-@ detrás @-@ el escritorio @-@ en el bosque..🤫🌳\n¡Prepárate para estar caliente y biped con huevos!🏹👀`);
  await new Promise((r) => setTimeout(r, 3000));

  const animals = [
    { name: "🐰 Kelinci", item: "daging_kelinci", chance: 80, min: 1, max: 3, exp: 50, money: 500 },
    { name: "🦌 Rusa", item: "daging_rusa", chance: 50, min: 1, max: 2, exp: 100, money: 1500 },
    { name: "🐗 Babi Hutan", item: "daging_babi", chance: 40, min: 1, max: 2, exp: 150, money: 2000 },
    { name: "🦊 Rubah", item: "bulu_rubah", chance: 30, min: 1, max: 1, exp: 200, money: 3000 },
    { name: "🐻 Beruang", item: "cakar_beruang", chance: 15, min: 1, max: 1, exp: 500, money: 10000 },
    { name: "🦁 Singa", item: "taring_singa", chance: 5, min: 1, max: 1, exp: 1000, money: 25000 },
  ];

  const caught = animals.filter((a) => Math.random() * 100 <= a.chance);

  if (caught.length === 0) {
    await m.react("😢");
    db.save();
    return m.reply(`Bueno, lo siento por hoy,😭😭\n\nLos animales están corriendo, nada viene...\nEn lo que la resistencia de los peludos es arrugada${staminaCost}*⚡¡Pruébalo otra vez más tarde!🥺🌿`);
  }

  let results = [];
  let totalExp = 0;
  let totalMoney = 0;

  for (const animal of caught.slice(0, 3)) {
    const qty = Math.floor(Math.random() * (animal.max - animal.min + 1)) + animal.min;
    user.inventory[animal.item] = (user.inventory[animal.item] || 0) + qty;
    totalExp += animal.exp * qty;
    totalMoney += animal.money * qty;
    results.push({ name: animal.name, qty, money: animal.money * qty });
  }

  user.koin = (user.koin || 0) + totalMoney;
  const levelResult = await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, totalExp);

  db.save();

  await m.react("✅");

  let txt = `¡Kena sasaran hermano!🎯🏹\n\nHas vuelto con una mala acción:\n`;
  for (const r of results) {
    txt += `• ${r.name}: *+${r.qty} ekor*\n`;
  }
  txt += `\n¡La caza es una sorpresa automática!🎉\n`;
  txt += `💸Monedas: *+Rp${totalMoney.toLocaleString("id-ID")}*\n`;
  txt += `📈 EXP: *+${totalExp}*\n`;
  txt += `⚡ Stamina terpakai: *-${staminaCost}*\n\n`;
  txt += `Consigue un par de brazaletes, beca...bek... vuelve a ir tras la prisa de nuevo🔥🥩`;

  m.reply(txt);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

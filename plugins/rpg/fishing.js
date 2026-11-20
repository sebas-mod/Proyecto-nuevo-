"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');

const pluginConfig = {
  name: "fishing",
  alias: ["rpgfish", "mancing"],
  category: "rpg",
  description: "Pesca para conseguir pescado ( RPG )",
  usage: ".fishing",
  example: ".fishing",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};

  const staminaCost = 15;
  user.rpg.stamina = user.rpg.stamina || 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡Oh hermana, tu resiscia se está enfriando!😭⚡\n\nCrema pesca buth *${staminaCost}Stamina, pero te traje un restante${user.rpg.stamina}*.\nDescanse primero. Descanse.🛌💤`);
  }

  user.rpg.stamina -= staminaCost;

  await m.react("🎣");
  await m.reply(`Tira el gancho en el agua tranquila.🌊🎣\nShh, no hagas eso, ¡deje que el pescado coma la olla!🤫👀`);
  await new Promise((r) => setTimeout(r, 4000));

  const drops = [
    { item: "trash", chance: 20, name: "🗑️ Sampah", exp: 10 },
    { item: "fish", chance: 50, name: "🐟 Ikan", exp: 100 },
    { item: "prawn", chance: 30, name: "🦐 Udang", exp: 150 },
    { item: "octopus", chance: 15, name: "🐙 Gurita", exp: 300 },
    { item: "shark", chance: 5, name: "🦈 Hiu", exp: 800 },
    { item: "whale", chance: 1, name: "🐳 Paus", exp: 2000 },
  ];

  const rand = Math.random() * 100;
  let caught = drops[0];

  for (const drop of drops.sort((a, b) => a.chance - b.chance)) {
    if (rand <= drop.chance) {
      caught = drop;
      break;
    }
  }

  const qty = 1;
  user.inventory[caught.item] = (user.inventory[caught.item] || 0) + qty;

  const expReward = caught.exp;
  const levelResult = await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expReward);

  db.save();

  await m.react("✅");

  let txt = `¡El gancho está abajo!🎣💦\n\nBueno, lo hiciste.\n`;
  if (caught.item === "trash") {
    txt += `> ${caught.name} 🤢\nSí, está llegando.${expReward} EXP* experiencia tirar sampah en tempatnya! 😂\n\n`;
  } else {
    txt += `> *${caught.name}*🎉✨\n¡También es bienvenido!${expReward}EXP* aquí!\n\n`;
  }
  
  txt += `⚡ Stamina terpakai: *-${staminaCost}*\n`;
  txt += `\n- La basura está en la bolsa.\`- Inv.\`¡No olvides deletrearlo otra vez más tarde!💖🌊`;

  await m.reply(txt);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

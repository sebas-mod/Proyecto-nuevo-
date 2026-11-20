"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');

const pluginConfig = {
  name: "mining",
  alias: ["mine", "tambang"],
  category: "rpg",
  description: "Ampliar para conseguir ores y gemas",
  usage: ".mining",
  example: ".mining",
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

  const staminaCost = 20;
  user.rpg.stamina = user.rpg.stamina || 100;

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`¡Ouch hermana, vas a tener que mercado por ello!🥵\n\nSin embargo pesado aí, necesita *${staminaCost}Stamina, estás tan triste.${user.rpg.stamina}* solo. Descanso vamos! 🛌💤`);
  }

  user.rpg.stamina -= staminaCost;

  await m.react("⛏️");
  await m.reply("Trangg! Tranggg! ⛏️💎\nMemecah batu keras di kedalaman gua...");
  await new Promise((r) => setTimeout(r, 3000));

  const drops = [
    { item: "rock", chance: 80, name: "🪨 Batu", min: 2, max: 5 },
    { item: "coal", chance: 50, name: "⚫ Batubara", min: 1, max: 3 },
    { item: "iron", chance: 30, name: "⛓️ Besi", min: 1, max: 2 },
    { item: "gold", chance: 15, name: "🥇 Emas", min: 1, max: 1 },
    { item: "diamond", chance: 5, name: "💠 Berlian", min: 1, max: 1 },
    { item: "emerald", chance: 2, name: "💚 Emerald", min: 1, max: 1 },
  ];

  let results = [];
  for (const drop of drops) {
    if (Math.random() * 100 <= drop.chance) {
      const qty = Math.floor(Math.random() * (drop.max - drop.min + 1)) + drop.min;
      user.inventory[drop.item] = (user.inventory[drop.item] || 0) + qty;
      results.push({ name: drop.name, qty });
    }
  }

  if (results.length === 0) {
    user.inventory["rock"] = (user.inventory["rock"] || 0) + 1;
    results.push({ name: "🪨 Batu", qty: 1 });
  }

  const expGain = Math.floor(Math.random() * 500) + 100;
  const levelResult = await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expGain);

  db.save();

  await m.react("✅");

  let txt = `CROOT! BATUNYA PECAH Hermano! ⛏♪✨\n\n`;
  txt += `Tienes este material:\n`;
  for (const r of results) {
    txt += `• ${r.name}: *+${r.qty}*\n`;
  }
  txt += `\n📈 EXP: *+${expGain}*\n`;
  txt += `⚡ Stamina: *-${staminaCost}*\n\n`;
  txt += `Ser bueno, hermana,¡se monoá o se venderá!💎💰`;

  await m.reply(txt);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

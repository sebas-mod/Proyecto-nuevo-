"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');

const pluginConfig = {
  name: "crime",
  alias: ["curi", "jahat"],
  category: "rpg",
  description: "Melakukan kejahatan membobol ATM (risiko tinggi)",
  usage: ".crime",
  example: ".crime",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 300,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  await m.react("💣");
  await m.reply("Memasang alat peretas di ATM seberang jalan... 💣💻");
  await new Promise((r) => setTimeout(r, 2500));

  const successRate = 0.5;
  const isSuccess = Math.random() < successRate;

  if (isSuccess) {
    const stolen = Math.floor(Math.random() * 15000) + 5000;
    const expGain = Math.floor(stolen / 20);

    user.koin = (user.koin || 0) + stolen;
    await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expGain);

    db.save();

    let txt = `¡Recoge sus pantalones!💻💵\n\n`;
    txt += `Mesin ATM ngeluarin dinero kayak agua terjun! Lu langsung kabur bawa koper lleno dinero.\n\n`;
    txt += `💰Boob Preset: * + Rp${stolen.toLocaleString("id-ID")}*\n`;
    txt += `📈 EXP Kriminal: *+${expGain}*`;

    await m.reply(txt);
  } else {
    const fine = Math.floor(Math.random() * 10000) + 5000;
    const actualFine = Math.min(fine, user.koin || 0);

    user.koin = Math.max(0, (user.koin || 0) - actualFine);
    user.rpg.health = Math.max(0, (user.rpg.health || 100) - 15);

    db.save();

    let txt = `NGIIING NGIING!! ALARM BUNYI!! 🚨🚓\n\n`;
    txt += `¡Mierda, la máquina frita y la policía están agitando todo!\n`;
    txt += `Usted 're a cop @-@ battered pad and kept a phagar multa on your back.\n\n`;
    txt += `💸Pidania fina: * - Rp${actualFine.toLocaleString("id-ID")}*\n`;
    txt += `🤕 Memar Kena Pentung: *-15 HP*`;

    await m.reply(txt);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

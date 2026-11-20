"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');
var _ourincontextjs = require('../../src/lib/ourin-context.js');

const pluginConfig = {
  name: "maling",
  alias: ["copet", "pickpocket"],
  category: "rpg",
  description: "Empaquetar a la gente en el mercado (más noticias que el crimen )",
  usage: ".maling",
  example: ".maling",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 180,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  user.rpg.health = user.rpg.health || 100;

  if (user.rpg.health < 40) {
    return m.reply(`¡No vas a meterte con mi madre!🤒\nAl menos 40 CV * ya jefe, ahora estás sangrando *${user.rpg.health}¡Vuelve al auto!`);
  }

  await _ourincontextjs.sendRpgPreview.call(void 0, sock, m.chat, "Nyempil di keramaian pasar... Mengincar tas emak-emak... 🦹‍♂️🤏", "🦹 COPET", "Beraksi!", { quoted: m });
  await new Promise((r) => setTimeout(r, 2500));

  const outcomes = [
    { success: true, type: "big", money: 20000, exp: 500, msg: "GILA! Lu dapet dompet isinya *ATM Black Card* sama duit gepokan! 🤑" },
    { success: true, type: "medium", money: 8000, exp: 200, msg: "De nada. Tienes mucha piel en tus manos.😏" },
    { success: true, type: "small", money: 2000, exp: 50, msg: "¡Tus abejas, tus padres son KTP y tú eres el Indominet!😑Pero hay un poco de duit." },
    { success: false, type: "caught", fine: 15000, health: 30, msg: "¡Ay, ayúdenme!😱¡Eres una madre que se está burlando y eres un dihakomaniac!" },
    { success: false, type: "police", fine: 25000, health: 10, msg: "Lagi asik nyeloteh dompet, eh tangan lu *digenggam intel* nyamar! 👮‍♂️ Busted!" },
    { success: false, type: "fail", fine: 0, health: 0, msg: "¡Los blancos sienten que están en una multitud!😤Fallido bro." },
  ];

  const weights = [5, 20, 30, 15, 10, 20];
  const rand = Math.random() * 100;
  let cumulative = 0;
  let outcome = outcomes[5];

  for (let i = 0; i < outcomes.length; i++) {
    cumulative += weights[i];
    if (rand <= cumulative) {
      outcome = outcomes[i];
      break;
    }
  }

  let txt = "";

  if (outcome.success) {
    user.koin = (user.koin || 0) + outcome.money;
    await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, outcome.exp);

    txt = `OPERASI BERSIH! 🦹‍♂♪✨\n\n`;
    txt += `${outcome.msg}\n\n`;
    txt += `💰Tela Haram: * + Rp${outcome.money.toLocaleString("id-ID")}*\n`;
    txt += `📈 EXP Copet: *+${outcome.exp}*`;
  } else {
    const actualFine = Math.min(outcome.fine, user.koin || 0);
    user.koin = Math.max(0, (user.koin || 0) - actualFine);
    user.rpg.health = Math.max(0, user.rpg.health - outcome.health);

    txt = `KACAU BALAU!! 🚨🤬\n\n`;
    txt += `${outcome.msg}\n\n`;
    if (outcome.fine > 0) txt += `💸Dinero Damai / Rampasan: * - Rp${actualFine.toLocaleString("id-ID")}*\n`;
    if (outcome.health > 0) txt += `🤕Dariah Crouch: * -${outcome.health} HP*`;

    if (user.rpg.health <= 0) {
      user.rpg.health = 0;
      user.exp = Math.floor((user.exp || 0) / 2);
      txt += `\n\n💀* You 're DeAD the GEGARA GET THE MASIS!\nEx- ¡Estás colgando el 50%!😭`;
    }
  }

  db.save();
  await _ourincontextjs.sendRpgPreview.call(void 0, sock, m.chat, txt, "🦹 HASIL NYOPET", "Result!", { quoted: m });
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

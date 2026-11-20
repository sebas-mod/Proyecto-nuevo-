"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');

const pluginConfig = {
  name: "adventure",
  alias: ["adv", "petualangan"],
  category: "rpg",
  description: "Adventurero para conseguir ExP y presentes",
  usage: ".adventure",
  example: ".adventure",
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
  user.rpg.health = user.rpg.health || 100;

  if (user.rpg.health < 30) {
    return m.reply(`¡Tu teléfono está muriendo!😭💔\n\nAl menos 30 hps para ir de viaje a morir en la calle.\nAhora tu HP es sólo un restante${user.rpg.health}¡¡Vamos a la radio!💉✨`);
  }

  const locations = ["🌲 Hutan Gelap", "🏔️ Gunung Es Abadi", "🏜️ Padang Pasir Kematian", "🌋 Gunung Berapi", "🏰 Kastil Tua Berhantu", "🌊 Pantai Misterius"];
  const location = locations[Math.floor(Math.random() * locations.length)];

  await m.react("🗺️");
  await m.reply(`Empaque la mochila y copie el oboe.${location}..⚔♪🗺♪\nTen cuidado, hermana, el auranya está agarrándose!`);
  await new Promise((r) => setTimeout(r, 2500));

  const isWin = Math.random() < 0.6;

  if (isWin) {
    const expGain = Math.floor(Math.random() * 2000) + 500;
    const moneyGain = Math.floor(Math.random() * 10000) + 2000;

    user.koin = (user.koin || 0) + moneyGain;
    const levelResult = await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expGain);

    db.save();

    let txt = `🗡*El equipo está muerto!🗡♪\n\n`;
    txt += `📍Ubicación: *${location}*\n\n`;
    txt += `¡Le pepste al monstruo cazador y encontract a cofre harta karun!\n`;
    txt += `💰Monedas: *+Rp${moneyGain.toLocaleString("id-ID")}*\n`;
    txt += `📈 EXP: *+${expGain.toLocaleString("id-ID")}*\n\n`;
    txt += `Ve y consigue una pequeña aventura.🚀✨`;

    await m.reply(txt);
  } else {
    const healthLoss = Math.floor(Math.random() * 30) + 10;
    user.rpg.health = Math.max(0, user.rpg.health - healthLoss);

    let msg = `☠️ *DISERGAP Monstruo!!* ☠♪\n\n`;
    msg += `📍Ubicación: *${location}*\n\n`;
    msg += `Sabes, un montón de monstruos están luchando.\n`;
    msg += `❤Deslizamiento @-@ fuera de HP: * -${healthLoss}HP* (Restante:${user.rpg.health})\n\n`;

    if (user.rpg.health <= 0) {
      user.rpg.health = 0;
      user.exp = Math.floor((user.exp || 0) / 2);
      msg += `💀*Tu Muerto!*\nOh mi, hermano, estás muerto.💔🥀`;
    } else {
      msg += `¡Aún estás en problemas, hermana!🏃💨`;
    }

    db.save();
    await m.reply(msg);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

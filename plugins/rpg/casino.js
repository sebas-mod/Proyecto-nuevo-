"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
  name: "casino",
  alias: ["judi", "gamble"],
  category: "rpg",
  description: "Jugar casino para judi",
  usage: ".casino <jumlah>",
  example: ".casino 10000",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);
  const args = m.args || [];

  let bet = args[0];

  if (!bet) {
    let txt = `🎰 *LAS VEGAS KELILING* 🎰\n\n`;
    txt += `¡Bienvenido a Kasino!\n\n`;
    txt += `*Cara Taruhan:*\n`;
    txt += `👉 \`${m.prefix}casino <jumlah>\`\n\n`;
    txt += `Ejemplo:\n`;
    txt += `👉 \`${m.prefix}casino 10000\`\n`;
    txt += `👉 \`${m.prefix}casino all\` (Nekat bener!)`;
    return m.reply(txt);
  }

  if (/^all$/i.test(bet)) {
    bet = user.koin || 0;
  } else {
    bet = parseInt(bet);
  }

  if (isNaN(bet) || bet < 1000) {
    return m.reply(`Hadh.¿Quieres que judi capital receiver?💸\nAl menos positar aquí * Rp 1 000 * hermano!`);
  }

  if (bet > (user.koin || 0)) {
    return m.reply(`¡¡¡No hay moléculas al jefe!😂\nDinero tu cuma * Rp${(user.koin || 0).toLocaleString("id-ID")}Pero sok - marcar la apuesta${bet.toLocaleString("id-ID")}*.\nSana, ¡trabaja primero!`);
  }

  await m.react("🎰");
  await m.reply(`🎲El distribuidor arrancó los dados y arruinó la rotonda de la ruleta.`);
  await new Promise((r) => setTimeout(r, 2500));

  const playerScore = Math.floor(Math.random() * 100);
  const botScore = Math.floor(Math.random() * 100);

  let result, emoji, moneyChange, bandarTaunt;

  if (playerScore > botScore) {
    result = "MENANG!";
    emoji = "🎉";
    moneyChange = bet;
    user.koin = (user.koin || 0) + bet;
    bandarTaunt = `Está vez, vas a ser un héroe.😒`;
  } else if (playerScore < botScore) {
    result = "KALAH TELAK!";
    emoji = "💸";
    moneyChange = -bet;
    user.koin = (user.koin || 0) - bet;
    bandarTaunt = `"AHAHA! Ya pobre makin pobre lu! Volver a casa sana!" - *Bandar* 😈`;
  } else {
    result = "SERI!";
    emoji = "🤝";
    moneyChange = 0;
    bandarTaunt = `No voy a dejarte ir, pero voy a tener que ir.👀`;
  }

  db.save();

  await m.react(emoji);

  let txt = `🎰* KASINO 'S CLOSED!🎰\n\n`;
  txt += `* Papan Pungacion: *\n`;
  txt += `👤Puntos Lu: *${playerScore}*\n`;
  txt += `🤖Bandar Puntos: *${botScore}*\n\n`;
  txt += `*Resultado:${emoji} ${result}*\n`;
  if (moneyChange !== 0) {
    txt += `Bandar Vest: *${moneyChange > 0 ? "+" : ""}Rp ${moneyChange.toLocaleString("id-ID")}*\n\n`;
  } else {
    txt += `Reforzamientos ( Capital Balk )\n\n`;
  }
  txt += `${bandarTaunt}\n\n`;
  txt += `* Restante Saldo Lu: * Rp${(user.koin || 0).toLocaleString("id-ID")}`;

  m.reply(txt);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourincontextjs = require('../../src/lib/ourin-context.js');

const pluginConfig = {
  name: "dice",
  alias: ["dadu", "roll"],
  category: "rpg",
  description: "Arranca los dados para la elaboración",
  usage: ".dice <1-6> <bet>",
  example: ".dice 6 5000",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  const args = m.args || [];
  const guess = parseInt(args[0]);
  const bet = parseInt(args[1]);

  if (!guess || guess < 1 || guess > 6) {
    return m.reply(
      `🎲 *Bandar Dadu Jalanan* 🎲\n\n` +
        `¡Adivina que es el número que se ha hecho!\n\n` +
        `*Cara Juega:*\n` +
        `👉 \`.dice <angka> <taruhan>\`\n\n` +
        `*Ejemplo:*\n` +
        `👉 \`.dice 6 5000\``
    );
  }

  if (!bet || bet < 1000) {
    return m.reply(`Mana ada bandar nerima taruhan segitu! Minimal bawa *Rp 1.000* sini! 🎲`);
  }

  if ((user.koin || 0) < bet) {
    return m.reply(`Dinero lu menos bos! En saku cuma ada *Rp ${(user.koin || 0).toLocaleString("id-ID")}* ¡No te molestes aquí!😤`);
  }

  user.koin -= bet;

  await _ourincontextjs.sendRpgPreview.call(void 0, sock, m.chat, `🎲El banquero retuerce los dados en su tazón..`, "🎲 DADU JALANAN", "Rolling!", { quoted: m });
  await new Promise((r) => setTimeout(r, 2500));

  const result = Math.floor(Math.random() * 6) + 1;
  const diceEmoji = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][result - 1];

  const isWin = guess === result;

  let txt = `*MANGKOK Abierto!*🎲💥\n\n`;
  txt += `Tebakan Lu: *${guess}*\n`;
  txt += `Mata Dadu: *${result}* ${diceEmoji}\n\n`;

  if (isWin) {
    const winnings = bet * 5;
    user.koin = (user.koin || 0) + winnings;
    txt += `🎉* CRAZY LU HOKI Mucho!\n`;
    txt += `💰Vault 5x* + Rp${winnings.toLocaleString("id-ID")}*`;
  } else {
    txt += `🤣* HAHAHAHA MAPUS LUTTERS!\n`;
    txt += `💸Dinero Lu Interesante Bandar: * - Rp${bet.toLocaleString("id-ID")}*`;
  }

  db.save();
  await _ourincontextjs.sendRpgPreview.call(void 0, sock, m.chat, txt, "🎲 HASIL DADU", "Result!", { quoted: m });
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

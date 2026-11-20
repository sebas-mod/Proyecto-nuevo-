"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourincontextjs = require('../../src/lib/ourin-context.js');

const pluginConfig = {
  name: "coinflip",
  alias: ["cf", "flip", "toss"],
  category: "rpg",
  description: "Gambling coin flip",
  usage: ".coinflip <heads/tails> <bet>",
  example: ".coinflip heads 5000",
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
  const choice = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);
  const bet = parseInt(args[1]);

  if (!choice || (choice !== "heads" && choice !== "tails" && choice !== "h" && choice !== "t")) {
    return m.reply(
      `🪙Supongo que Tela Bandar🪙\n\n` +
        `¡Elija un Garuda (cabezas) o un número!\n\n` +
        `*Cara Juega:*\n` +
        `👉 \`.coinflip heads <taruhan>\`\n` +
        `👉 \`.coinflip tails <taruhan>\``
    );
  }

  if (!bet || bet < 1000) {
    return m.reply(`Taruhan receh ditolak! Minimal *Rp 1.000* ya bos! 🪙`);
  }

  if ((user.koin || 0) < bet) {
    return m.reply(`Mana monedas lu? En kantong restante *Rp ${(user.koin || 0).toLocaleString("id-ID")}* solo, sok quiere positar *${bet.toLocaleString("id-ID")}*! 😜`);
  }

  user.koin -= bet;

  const userChoice = choice === "heads" || choice === "h" ? "heads" : "tails";
  const result = Math.random() < 0.5 ? "heads" : "tails";
  const emoji = result === "heads" ? "🦅" : "🪙";

  await _ourincontextjs.sendRpgPreview.call(void 0, sock, m.chat, `*CLING!* Monedas oro dilempar alto a udara... berputar-reproduce... 🪙✨`, "🪙 COINFLIP", "Flipping!", { quoted: m });
  await new Promise((r) => setTimeout(r, 2500));

  const isWin = userChoice === result;

  let txt = `¡El distribuidor tenía una moneda en la mano!👋\n\n`;
  txt += `Tebakan Lu: *${userChoice.toUpperCase()}*\n`;
  txt += `Monedas Menunjukkan: *${result.toUpperCase()}* ${emoji}\n\n`;

  if (isWin) {
    const winnings = bet * 2;
    user.koin = (user.koin || 0) + winnings;
    txt += `🎉 *MANTAP! TEBAKAN LU BENER!*\n`;
    txt += `💰Ganancia: *+Rp${winnings.toLocaleString("id-ID")}*`;
  } else {
    txt += `🤣 *HAHAHA! LU Incorrecto TEBAK!*\n`;
    txt += `💸Tela en el vendador: * - Rp${bet.toLocaleString("id-ID")}*`;
  }

  db.save();
  await _ourincontextjs.sendRpgPreview.call(void 0, sock, m.chat, txt, "🪙 COINFLIP", "Result!", {
    quoted: m,
  });
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

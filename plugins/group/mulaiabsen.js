"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
  name: "mulaiabsen",
  alias: ["startabsen", "bukaabsen", "openabsen"],
  category: "group",
  description: "Sesi absen en grupo ( administrador only)",
  usage: ".mulaiabsen [keterangan]",
  example: ".mulaiabsen Rapat Mingguan",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
  isAdmin: true,
};

if (!global.absensi) global.absensi = {};

async function handler(m, { sock }) {
  const chatId = m.chat;

  if (global.absensi[chatId]) {
    return m.reply(
      `❌ *ᴍᴀsɪʜ ᴀᴅᴀ ᴀʙsᴇɴ*\n\n` +
        `¡Hay un sesi ausente en este grupo!\n\n` +
        `*Suspesión*\n` +
        `Para ver la lista.`,
    );
  }

  const keterangan = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]) || "Absen Harian";

  global.absensi[chatId] = {
    keterangan: keterangan,
    createdBy: m.sender,
    createdAt: new Date().toISOString(),
    peserta: [],
  };

  const saluranId = _optionalChain([_configjs2.default, 'access', _4 => _4.saluran, 'optionalAccess', _5 => _5.id]) || "120363400911374213@newsletter";
  const saluranName = _optionalChain([_configjs2.default, 'access', _6 => _6.saluran, 'optionalAccess', _7 => _7.name]) || _optionalChain([_configjs2.default, 'access', _8 => _8.bot, 'optionalAccess', _9 => _9.name]) || "Ourin-AI";

  await m.reply(
    `📋 *ABSEN Ya Calle NIHH*\n\n` +
      `「 📋 *ɪɴғᴏ* 」\n` +
      `📝 ${keterangan}\n` +
      `👑Hecho por: @${m.sender.split("@")[0]}\n` +
      `👥Participante: 0\n\n` +
      `Para aquellos que quieren seguir a Aben, quiten la axila.${m.prefix}absen*` +
      `Para un administrador para comprobar el abseno, por favor tome la axila.${m.prefix}cekabsen*` +
      `Para un administrador para eliminar ausencias, por favor tome la axila *${m.prefix}hapusabsen*`,
    { mentions: [m.sender] },
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

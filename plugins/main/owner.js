"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikudatabasejs = require('../../src/lib/almiku-database.js');




var _almiku = require('almiku');
var _almikubuilderjs = require('../../src/lib/almiku-builder.js');
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _sharp = require('sharp'); var _sharp2 = _interopRequireDefault(_sharp);
const pluginConfig = {
  name: "owner",
  alias: ["creator", "dev", "developer"],
  category: "main",
  description: "Asa de arranque de sujeción",
  usage: ".owner",
  example: ".owner",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config: botConfig }) {
  const db = _almikudatabasejs.getDatabase.call(void 0, );
  const ownerType = db.setting("ownerType") || 1;
  const configOwners = _optionalChain([botConfig, 'access', _ => _.owner, 'optionalAccess', _2 => _2.number]) || [];
  const dbOwners = db.data.owner || [];
  const ownerNumbers = [...new Set([...configOwners, ...dbOwners])];
  const botName = _optionalChain([botConfig, 'access', _3 => _3.bot, 'optionalAccess', _4 => _4.name]) || "Al Miku-AI";
  if (ownerType === 2) {
    const contacts = [];

    for (const number of ownerNumbers) {
      const cleanNumber = number.replace(/[^0-9]/g, "");

      const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${_configjs.getOwnerName.call(void 0, number)}\nTEL;type=CELL;type=VOICE;waid=${cleanNumber}:+${cleanNumber}\nEND:VCARD`;

      contacts.push({ vcard });
    }

    const zanne = await sock.sendMessage(
      m.chat,
      {
        contacts: {
          displayName: `Este es nuestro dueño.`,
          contacts,
        },
      },
      { quoted: m.raw },

    );
    await sock.sendMessage(m.chat, {
      text: "💬Si tiene alguna pregunta, no dude en hacer, socio. Es muy agradable."
    }, { quoted: zanne })
  } else {
    const ownerText = `👑 *ᴏᴡɴᴇʀ ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ*\n\n╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n┃ ㊗ ɴᴀᴍᴀ: *${ownerNumbers.map((n) => _configjs.getOwnerName.call(void 0, n)).join(", ")}*\n┃ ㊗ ʙᴏᴛ: *${botName}*\n┃ ㊗Sᴛᴀᴛᴜs: *🟢Online *\n╰┈┈⬡\n\nSi hay alguna pregunta o control,\n# ¡Que llames al dueño arriba!\n¿Qué?📞La tarjeta de contacto está bautizada. _`;

    await m.reply(ownerText);

    for (const number of ownerNumbers) {
      const cleanNumber = number.replace(/[^0-9]/g, "");

      const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${_configjs.getOwnerName.call(void 0, number)}(Propietario${botName})\nTEL;type=CELL;type=VOICE;waid=${cleanNumber}:+${cleanNumber}\nEND:VCARD`;

      await sock.sendMessage(
        m.chat,
        {
          contacts: {
            displayName: _configjs.getOwnerName.call(void 0, number),
            contacts: [{ vcard }],
          },
        },
        { quoted: m.raw },
      );
    }
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

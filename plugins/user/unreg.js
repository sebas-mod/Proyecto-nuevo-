"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
  name: "unreg",
  alias: ["unregister", "hapusdaftar"],
  category: "user",
  description: "Retire su registro de datos del bot",
  usage: ".unreg",
  example: ".unreg",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _almikudatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!_optionalChain([user, 'optionalAccess', _ => _.isRegistered])) {
    return m.reply(
      `❌¡No estás en la lista!\n\n` + `• Para hacer con\`${m.prefix}daftar\``,
    );
  }

  const saluranId = _optionalChain([_configjs2.default, 'access', _2 => _2.saluran, 'optionalAccess', _3 => _3.id]) || "120363400911374213@newsletter";
  const saluranName = _optionalChain([_configjs2.default, 'access', _4 => _4.saluran, 'optionalAccess', _5 => _5.name]) || _optionalChain([_configjs2.default, 'access', _6 => _6.bot, 'optionalAccess', _7 => _7.name]) || "Al Miku-AI";
  const unregisteredAt = new Date().toISOString();

  db.setUser(m.sender, {
    isRegistered: false,
    regName: null,
    regAge: null,
    regGender: null,
    unregisteredAt,
  });

  await db.save();

  await sock.sendMessage(
    m.chat,
    {
      text:
        `✅ *ᴜɴʀᴇɢɪsᴛᴇʀ ʙᴇʀʜᴀsɪʟ!*\n\n` +
        `Su lista de listas ha sido comprometida.\n\n` +
        `Para una relist:\`${m.prefix}daftar\``,
      contextInfo: {
        forwardingScore: 9999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: saluranId,
          newsletterName: saluranName,
          serverMessageId: 127,
        },
      },
    },
    { quoted: m },
  );

  m.react("✅");
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

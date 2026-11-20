"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourin = require('ourin');

const pluginConfig = {
  name: "test",
  alias: ["poll"],
  category: "test",
  description: "Test Poll Menu Interaktif",
  usage: ".poll",
  example: ".poll",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    await m.reply("test")
    const msg = _ourin.generateWAMessageFromContent.call(void 0, m.chat, {
      pollCreationMessageV6: {
        name: "🔥 PILIH MENU INTERAKTIF 🔥",
        options: [
          { optionName: "Anime" },
          { optionName: "Game" },
          { optionName: "Profile" }
        ],
        selectableOptionsCount: 1
      }
    }, { quoted: m });

    await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
  } catch (error) {
    console.error("[TestPoll] Gagal:", error);
    m.reply("Gagal membuat poll menu.");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

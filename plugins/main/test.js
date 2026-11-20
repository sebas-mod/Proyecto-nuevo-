"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almiku = require('almiku');

const pluginConfig = {
  name: "test",
  alias: ["poll"],
  category: "test",
  description: "Prueba de la encuesta interactiva de menús",
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
    const msg = _almiku.generateWAMessageFromContent.call(void 0, m.chat, {
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
    console.error("[TestPoll] Fallido:", error);
    m.reply("Steenner hace un menú de encuestas.");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

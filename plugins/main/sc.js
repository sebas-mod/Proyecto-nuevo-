"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _ourinassetmanagerjs = require('../../src/lib/ourin-asset-manager.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

const pluginConfig = {
    name: "sc",
    alias: ["script"],
    category: "main",
    description: "Nuevo script de enlace wa bot",
    usage: ".sc",
    example: ".sc",
    isPremium: false,
    isOwner: false,
    isBanned: false,
    isAdmin: false,
    cooldown: 10,
    energi: 0,
    isBotAdmin: false,
    isEnabled: true
}

async function handler(m, { sock }) {
    return await sock.sendMessage(m.chat, {
        image: _ourinassetmanagerjs.getAssetBuffer.call(void 0, "ourin"),
        caption: `🌾 Hola hermano *${m.pushName}*
        
De hecho, desde estas botas, puede atravesar los enlaces y, a continuación, puede encontrar la palabra clave " OURIN MENE ".`,
        footer: "💬Este enlace te llevará a Youtube.",
        interactiveButtons: [
            {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                    display_text: "🥐 Kunjungi Youtube Zanspiw",
                    url: "https://youtube.com/@JanpiwWok",
                    merchant_url: "https://youtube.com/@JanpiwWok"
                })
            }
        ]

    }, { quoted: m })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);

const pluginConfig = {
    name: "alightmotiondl",
    alias: ["alightmotion", "amdl"],
    category: "downloader",
    description: "Download project/preset Alight Motion",
    usage: ".amdl <link>",
    example: ".amdl https://alight.link/...",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 2,
    isEnabled: true,
};

async function handler(m, { sock, text }) {
    if (!text) {
        let help = `📥 *ALIGHT MOTION DOWNLOADER*\n\n`
        help += `Está función le ayuda a descargar proyectos o presets de la Moción Bright con un barato!\n\n`
        help += `*Como usarlo:*\n`
        help += `- Tickety${m.prefix}amdl <link_alight_motion>*\n\n`
        help += `*Ejemplo:*${m.prefix}amdl https://alight.link/xxxxx`
        return m.reply(help);
    }

    await m.react("🕕");

    try {
        const targetUrl = text.trim();

        const apiUrl = `https://kyzznekoo.zone.id/api/alightmotion/download?url=${encodeURIComponent(targetUrl)}`;

        const response = await _axios2.default.get(apiUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
                "Content-Type": "application/json"
            },
            data: {},
            timeout: 60000
        });

        const data = response.data;

        if (!data || !data.status || !data.data || !data.data.url) {
            await m.react("❌");
            return m.reply(`Lo sentimos, el enlace Alight Motion no es válido o el proyecto ha sido interceptado.`);
        }

        const downloadUrl = data.data.url;

        await sock.sendMessage(m.chat, {
            document: { url: downloadUrl },
            mimetype: "application/zip",
            fileName: `AlightMotion_${_configjs2.default.bot.name}.zip`,
            caption: `✅¡Es una descarga del preset de Alight Motion!`
        }, { quoted: m });

        await m.react("✅");

    } catch (error) {
        console.error("[AMDL Plugin Error]", error);
        await m.react("☢");
        m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

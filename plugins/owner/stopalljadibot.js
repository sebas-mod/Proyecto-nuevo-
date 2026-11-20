"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _ourinjadibotmanagerjs = require('../../src/lib/ourin-jadibot-manager.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'stopalljadibot',
    alias: ['stopsemuajadibot', 'killalljadibots'],
    category: 'owner',
    description: 'Detengan todos los jabots activos',
    usage: '.stopalljadibot',
    example: '.stopalljadibot',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const active = _ourinjadibotmanagerjs.getActiveJadibots.call(void 0, )

    if (active.length === 0) {
        return m.reply(`❌No hay jabots activos`)
    }

    await m.react('🕕')

    try {
        const stopped = await _ourinjadibotmanagerjs.stopAllJadibots.call(void 0, )

        await m.react('✅')

        const names = stopped.map(id => `@${id}`).join(', ')

        await sock.sendMessage(m.chat, {
            text: `🛑 *sᴇᴍᴜᴀ ᴊᴀᴅɪʙᴏᴛ ᴅɪʜᴇɴᴛɪᴋᴀɴ*\n\n` +
                `> 📊 Total: *${stopped.length}* jadibot\n` +
                `•💾Session: *Guardado*\n\n` +
                `Detenido:${names}\n\n` +
                `Para todas las sesiones a ser mantenidos y reactivados.`,
            mentions: stopped.map(id => id + '@s.whatsapp.net')
        }, { quoted: m })
    } catch (error) {
        await m.react('☢')
        await m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

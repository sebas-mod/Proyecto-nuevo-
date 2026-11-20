"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _almikujadibotmanagerjs = require('../../src/lib/almiku-jadibot-manager.js');

const pluginConfig = {
    name: 'stopjadibot',
    alias: ['berhentijadibot', 'stopbot', 'unjadibot'],
    category: 'main',
    description: 'Detén tu sesque así bot.',
    usage: '.stopjadibot',
    example: '.stopjadibot',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
}

async function handler(m, { sock }) {
    const sender = m.sender
    if (!sender) return m.reply('❌Stunner ID \'d su número')

    if (!_almikujadibotmanagerjs.isJadibotActive.call(void 0, sender)) {
        return m.reply(
            `❌ *ᴋᴀᴍᴜ ᴛɪᴅᴀᴋ ᴀᴅᴀʟᴀʜ ᴊᴀᴅɪʙᴏᴛ*\n\n` +
            `> Escribe \`${m.prefix}jadibot <número>\`para convertirse en un bot`
        )
    }

    const status = _almikujadibotmanagerjs.getJadibotStatus.call(void 0, sender)
    const uptime = status ? formatUptime(Date.now() - status.startedAt) : '-'

    await m.react('🕕')

    try {
        await _almikujadibotmanagerjs.stopJadibot.call(void 0, sender, false)
        await m.react('✅')

        await m.reply(
            `🛑 *ᴊᴀᴅɪʙᴏᴛ ᴅɪʜᴇɴᴛɪᴋᴀɴ*\n\n` +
            `• 📱 Número: *@${sender.split('@')[0]}*\n` +
            `> ⏱️ Uptime: *${uptime}*\n` +
            `• 💾 Sesión: *Guardado*\n\n` +
            `Escribe \`${m.prefix}jadibot <número>\` para reactivar.`,
            { mentions: [sender] }
        )
    } catch (e) {
        await m.react('☢')
        await m.reply(`❌ Error al detener el jadibot: ${e.message}`)
    }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

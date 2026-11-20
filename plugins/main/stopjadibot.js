"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourinjadibotmanagerjs = require('../../src/lib/ourin-jadibot-manager.js');

const pluginConfig = {
    name: 'stopjadibot',
    alias: ['berhentijadibot', 'stopbot', 'unjadibot'],
    category: 'main',
    description: 'Hentikan sesi jadibot kamu',
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
    if (!sender) return m.reply('❌ Gagal mengidentifikasi nomor kamu')

    if (!_ourinjadibotmanagerjs.isJadibotActive.call(void 0, sender)) {
        return m.reply(
            `❌ *ᴋᴀᴍᴜ ᴛɪᴅᴀᴋ ᴀᴅᴀʟᴀʜ ᴊᴀᴅɪʙᴏᴛ*\n\n` +
            `> Ketik \`${m.prefix}jadibot\` untuk menjadi bot`
        )
    }

    const status = _ourinjadibotmanagerjs.getJadibotStatus.call(void 0, sender)
    const uptime = status ? formatUptime(Date.now() - status.startedAt) : '-'

    await m.react('🕕')

    try {
        await _ourinjadibotmanagerjs.stopJadibot.call(void 0, sender, false)
        await m.react('✅')

        await m.reply(
            `🛑 *ᴊᴀᴅɪʙᴏᴛ ᴅɪʜᴇɴᴛɪᴋᴀɴ*\n\n` +
            `> 📱 Nomor: *@${sender.split('@')[0]}*\n` +
            `> ⏱️ Uptime: *${uptime}*\n` +
            `> 💾 Session: *Tersimpan*\n\n` +
            `Ketik \`${m.prefix}jadibot\` untuk mengaktifkan kembali.`,
            { mentions: [sender] }
        )
    } catch (e) {
        await m.react('☢')
        await m.reply(`❌ Gagal menghentikan jadibot: ${e.message}`)
    }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _almikujadibotmanagerjs = require('../../src/lib/almiku-jadibot-manager.js');
const pluginConfig = {
    name: 'listjadibot',
    alias: ['jadibotlist', 'alljadibot'],
    category: 'owner',
    description: 'Mira todas las sesiones tan bien salvadas',
    usage: '.listjadibot',
    example: '.listjadibot',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const sessions = _almikujadibotmanagerjs.getAllJadibotSessions.call(void 0, )
    const active = _almikujadibotmanagerjs.getActiveJadibots.call(void 0, )

    if (sessions.length === 0) {
        return m.reply(`❌No se ha mantenido ninguna sesión`)
    }

    let txt = `🤖 *ᴅᴀꜰᴛᴀʀ ᴊᴀᴅɪʙᴏᴛ*\n\n`
    txt += `> 📊 Total: *${sessions.length}* session\n`
    txt += `•🟢Activo: *${active.length}*\n`
    txt += `> ⚫ Offline: *${sessions.length - active.length}*\n\n`

    sessions.forEach((s, i) => {
        const status = s.isActive ? '🟢' : '⚫'
        const label = s.isActive ? 'Online' : 'Offline'
        txt += `${status} *${i + 1}.* @${s.id} — _${label}_\n`
    })

    txt += `\n> \`${m.prefix}listjadibotaktif\` — Detail aktif\n`
    txt += `> \`${m.prefix}stopalljadibot\` — Stop semua\n`
    txt += `> \`${m.prefix}stopdandeletejadibot @ usuario\` —Elimina session`

    const mentions = sessions.map(s => s.jid)

    await sock.sendMessage(m.chat, {
        text: txt,
        mentions,
        interactiveButtons: [
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '🟢 Lihat Aktif',
                    id: `${m.prefix}listjadibotaktif`
                })
            },
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '🛑 Stop Semua',
                    id: `${m.prefix}stopalljadibot`
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

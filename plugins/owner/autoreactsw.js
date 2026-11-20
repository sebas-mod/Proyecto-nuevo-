"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
    name: 'autoreactsw',
    alias: ['autoreaksi', 'reactsw', 'autoreactstory'],
    category: 'owner',
    description: 'Auto react semua status/story WA',
    usage: '.autoreactsw on/off [emoji]',
    example: '.autoreactsw on 🔥',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const args = m.args || []
    const action = (args[0] || '').toLowerCase()
    const emoji = args[1] || '🔥'

    const current = db.setting('autoReactSW') || { enabled: false, emoji: '🔥' }

    if (!action) {
        return m.reply(
            `👁️ *ᴀᴜᴛᴏ ʀᴇᴀᴄᴛ sᴛᴏʀʏ*\n\n` +
            `> Status: *${current.enabled ? '✅ ON' : '❌ OFF'}*\n` +
            `> Emoji: *${current.emoji}*\n\n` +
            `*ᴄᴀʀᴀ ᴘᴀᴋᴀɪ:*\n` +
            `> \`${m.prefix}autoreactsw\` —Activación (por defecto emoji🔥)\n` +
            `> \`${m.prefix}autoreactsw😍\` —Activar con emoji\n` +
            `> \`${m.prefix}autoreactsw off\` — Matikan`
        )
    }

    if (action === 'on') {
        db.setting('autoReactSW', { enabled: true, emoji })
        db.save()
        await m.react('✅')
        return m.reply(
            `✅ *ᴀᴜᴛᴏ ʀᴇᴀᴄᴛ sᴛᴏʀʏ ᴀᴋᴛɪꜰ*\n\n` +
            `> Emoji: *${emoji}*\n` +
            `• Para la automatización leer todas las historias de la WA •`
        )
    }

    if (action === 'off') {
        db.setting('autoReactSW', { enabled: false, emoji: current.emoji })
        db.save()
        await m.react('✅')
        return m.reply(`❌ *ᴀᴜᴛᴏ ʀᴇᴀᴄᴛ sᴛᴏʀʏ ᴅɪᴍᴀᴛɪᴋᴀɴ*`)
    }

    return m.reply(`❌Usa\`on\`o\`apagado\``)
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

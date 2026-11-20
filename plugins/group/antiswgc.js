"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
    name: 'antiswgc',
    alias: ['antiswgroup', 'antiswmentiongc', 'antiswtaggc'],
    category: 'group',
    description: 'Deteksi tipe SW group mention atau status mention yang masuk ke grup',
    usage: '.antiswgc <on/off>',
    example: '.antiswgc on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { db }) {
    const action = _optionalChain([(m.args || []), 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()])
    const group = db.getGroup(m.chat) || {}

    if (!action) {
        const status = group.antiswgc || 'off'
        await m.reply(
            `📡 *ᴀɴᴛɪsᴡɢᴄ*\n\n` +
            `> Status: *${status === 'on' ? '✅ Aktif' : '❌ Nonaktif'}*\n\n` +
            `> Fitur ini mendeteksi tipe SW group mention seperti:\n` +
            `> • groupStatusMentionMessage\n` +
            `> • groupMentionedMessage\n` +
            `> • statusMentionMessage\n` +
            `> • contextInfo.groupMentions\n\n` +
            `> \`${m.prefix}antiswgc on\`\n` +
            `> \`${m.prefix}antiswgc off\``
        )
        return
    }

    if (action === 'on') {
        db.setGroup(m.chat, { ...group, antiswgc: 'on' })
        await m.reply('✅ *AntiSWGC aktif*\n\n> Tipe SW group mention akan dihapus otomatis.')
        return
    }

    if (action === 'off') {
        db.setGroup(m.chat, { ...group, antiswgc: 'off' })
        await m.reply('❌ *AntiSWGC nonaktif*')
        return
    }

    await m.reply('❌ Gunakan: on atau off')
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

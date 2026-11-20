"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
    name: 'aktifaudiomenu',
    alias: ['audiomenu', 'setaudiomenu', 'toggleaudiomenu'],
    category: 'owner',
    description: 'Toggle audio saat menampilkan menu',
    usage: '.aktifaudiomenu ya/gak',
    example: '.aktifaudiomenu ya',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const option = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()])

    const current = db.setting('audioMenu') !== false

    if (!option) {
        return m.reply(
            `🔊 *ᴀᴜᴅɪᴏ ᴍᴇɴᴜ sᴇᴛᴛɪɴɢ*\n\n` +
            `> Status: *${current ? '✅ Aktif' : '❌ Nonaktif'}*\n\n` +
            `*Cara pakai:*\n` +
            `> \`${m.prefix}aktifaudiomenu ya\` - Aktifkan audio\n` +
            `> \`${m.prefix}aktifaudiomenu gak\` - Nonaktifkan audio`
        )
    }

    if (option === 'ya' || option === 'on' || option === '1' || option === 'aktif') {
        if (current) {
            return m.reply(`⚠️ Audio menu sudah aktif!`)
        }
        db.setting('audioMenu', true)
        await db.save()
        await m.react('✅')
        return m.reply(`✅ Audio menu *diaktifkan*!\n\n> Sekarang ketika ada yang ketik \`.menu\`, audio akan muncul.`)
    }

    if (option === 'gak' || option === 'off' || option === '0' || option === 'nonaktif') {
        if (!current) {
            return m.reply(`⚠️ Audio menu sudah nonaktif!`)
        }
        db.setting('audioMenu', false)
        await db.save()
        await m.react('✅')
        return m.reply(`❌ Audio menu *dinonaktifkan*!\n\n> Sekarang \`.menu\` tidak akan ada audio.`)
    }

    return m.reply(`❌ Opsi tidak valid!\n\nGunakan: \`ya\` atau \`gak\``)
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

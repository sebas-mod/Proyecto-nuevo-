"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
    name: 'autoreadsw',
    alias: ['autoreadstory', 'readstory', 'bacasw'],
    category: 'owner',
    description: 'Auto read semua status/story WA',
    usage: '.autoreadsw on/off',
    example: '.autoreadsw on',
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
    const action = (_optionalChain([m, 'access', _ => _.args, 'optionalAccess', _2 => _2[0]]) || '').toLowerCase()
    const current = db.setting('autoReadSW') || { enabled: false }

    if (!action) {
        return m.reply(
            `👁️ *ᴀᴜᴛᴏ ʀᴇᴀᴅ sᴛᴏʀʏ*\n\n` +
            `> Status: *${current.enabled ? '✅ ON' : '❌ OFF'}*\n\n` +
            `*ᴄᴀʀᴀ ᴘᴀᴋᴀɪ:*\n` +
            `> \`${m.prefix}autoreadsw on\` — Aktifkan\n` +
            `> \`${m.prefix}autoreadsw off\` — Matikan`
        )
    }

    if (action === 'on') {
        db.setting('autoReadSW', { enabled: true })
        db.save()
        await m.react('✅')
        return m.reply(
            `✅ *ᴀᴜᴛᴏ ʀᴇᴀᴅ sᴛᴏʀʏ ᴀᴋᴛɪꜰ*\n\n` +
            `♪ Para la automatización leer todas las historias de la WA ♪`
        )
    }

    if (action === 'off') {
        db.setting('autoReadSW', { enabled: false })
        db.save()
        await m.react('✅')
        return m.reply(`❌ *ᴀᴜᴛᴏ ʀᴇᴀᴅ sᴛᴏʀʏ ᴅɪᴍᴀᴛɪᴋᴀɴ*`)
    }

    return m.reply(`❌Usa\`on\`o\`apagado\``)
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

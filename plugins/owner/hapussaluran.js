"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: ['hapussaluran', 'deletesaluran', 'deletenewsletter'],
    alias: [],
    category: 'owner',
    description: 'Hapus saluran/newsletter',
    usage: '.hapussaluran <id_saluran>',
    example: '.hapussaluran 120363xxx@newsletter',
    isOwner: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]) || ''
    let targetJid = text

    if (!targetJid) {
        return m.reply(
            '🗑️ *ʜᴀᴘᴜs sᴀʟᴜʀᴀɴ*\n\n' +
            '> `.hapussaluran <id_saluran>` — Hapus saluran\n\n' +
            '📝 Contoh:\n' +
            '> `.hapussaluran 120363xxx@newsletter`\n\n' +
            '⚠" La Silhouette será eliminada a cualquier costo ".'
        )
    }

    if (!targetJid.endsWith('@newsletter')) {
        targetJid += '@newsletter'
    }

    try {
        await sock.newsletterDelete(targetJid)
        await m.react('✅')
        return m.reply(`🗑* Tirándose en las nubes *\n\nAXID:${targetJid}`)
    } catch (err) {
        return m.reply(`❌Gagali borrado canal:${err.message}`)
    }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

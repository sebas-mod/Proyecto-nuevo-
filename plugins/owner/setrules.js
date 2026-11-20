"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
    name: 'setrules',
    alias: ['setbotrules', 'setaturanbot'],
    category: 'owner',
    description: 'Set rules/aturan bot custom',
    usage: '.setrules <text>',
    example: '.setrules 1. Jangan spam\n2. Hormati sesama',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]) || (_optionalChain([m, 'access', _4 => _4.quoted, 'optionalAccess', _5 => _5.body]) || _optionalChain([m, 'access', _6 => _6.quoted, 'optionalAccess', _7 => _7.text]) || '')
    
    if (!text) {
        return m.reply(
            `📝 *sᴇᴛ ʙᴏᴛ ʀᴜʟᴇs*\n\n` +
            `> Masukkan teks rules yang baru\n\n` +
            `\`Contoh:\`\n` +
            `\`${m.prefix}setrules 1. Jangan spam\\n2. Hormati sesama\``
        )
    }
    
    db.setting('botRules', text)
    
    m.reply(
        `✅ *ʙᴏᴛ ʀᴜʟᴇs ᴅɪᴜᴘᴅᴀᴛᴇ*\n\n` +
        `> Rules bot berhasil diubah!\n` +
        `> Ketik \`${m.prefix}rules\` untuk melihat.`
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

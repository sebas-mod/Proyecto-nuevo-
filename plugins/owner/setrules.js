"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('../../src/lib/almiku-database.js');
const pluginConfig = {
    name: 'setrules',
    alias: ['setbotrules', 'setaturanbot'],
    category: 'owner',
    description: 'Establecer reglas / reglas de bot personalizado',
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
    const db = _almikudatabasejs.getDatabase.call(void 0, )
    const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]) || (_optionalChain([m, 'access', _4 => _4.quoted, 'optionalAccess', _5 => _5.body]) || _optionalChain([m, 'access', _6 => _6.quoted, 'optionalAccess', _7 => _7.text]) || '')
    
    if (!text) {
        return m.reply(
            `📝 *sᴇᴛ ʙᴏᴛ ʀᴜʟᴇs*\n\n` +
            `*Pon nuevas reglas de texto*\n\n` +
            `Ejemplo:\n` +
            `\`${m.prefix}setrules Prohibido enviar spam\``
        )
    }
    
    db.setting('botRules', text)
    
    m.reply(
        `✅ *ʙᴏᴛ ʀᴜʟᴇs ᴅɪᴜᴘᴅᴀᴛᴇ*\n\n` +
        `¡Ezacuum bot 's been reformed!\n` +
        `> Escribe\`${m.prefix}rules\`para ver.`
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
    name: 'setrulesgrup',
    alias: ['setgrouprules', 'setaturangrup'],
    category: 'group',
    description: 'Establecer / reglas de reglas grupo personalizado ( administrador solamente )',
    usage: '.setrulesgrup <text>',
    example: '.setrulesgrup 1. Jangan spam\n2. Hormati sesama',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]) || (_optionalChain([m, 'access', _4 => _4.quoted, 'optionalAccess', _5 => _5.body]) || _optionalChain([m, 'access', _6 => _6.quoted, 'optionalAccess', _7 => _7.text]) || '')

    if (!text) {
        return m.reply(
            `📝 *sᴇᴛ ɢʀᴜᴘ ʀᴜʟᴇs*\n\n` +
            `*Pon nuevas reglas de texto*\n\n` +
            `\`Contoh:\`\n` +
            `\`${m.prefix}setrulesgrup 1.
2. Hormati sesama\``
        )
    }

    db.setGroup(m.chat, { groupRules: text })

    m.reply(
        `✅ *ɢʀᴜᴘ ʀᴜʟᴇs ᴅɪᴜᴘᴅᴀᴛᴇ*\n\n` +
        `¡Las reglas del grupo están siendo cambiadas!\n` +
        `Escribe\`${m.prefix}rulesgrup\`para ver.`
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

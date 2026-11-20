"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
    name: 'setlimitdefault',
    alias: ['setdefaultlimit', 'limitdefault'],
    category: 'owner',
    description: 'Set default limit untuk user baru',
    usage: '.setlimitdefault <jumlah>',
    example: '.setlimitdefault 50',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const args = m.args || []
    const newLimit = parseInt(args[0])
    
    if (!args[0] || isNaN(newLimit)) {
        const db = _ourindatabasejs.getDatabase.call(void 0, )
        const currentDefault = db.setting('defaultLimit') || _optionalChain([_configjs2.default, 'access', _ => _.limits, 'optionalAccess', _2 => _2.default]) || 25
        
        return m.reply(
            `📊 *sᴇᴛ ᴅᴇғᴀᴜʟᴛ ʟɪᴍɪᴛ*\n\n` +
            `> Limit default saat ini: \`${currentDefault}\`\n\n` +
            `*Cara pakai:*\n` +
            `> \`${m.prefix}setlimitdefault <jumlah>\`\n\n` +
            `*Contoh:*\n` +
            `> \`${m.prefix}setlimitdefault 50\``
        )
    }
    
    if (newLimit < 1 || newLimit > 1000) {
        return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Limit harus antara 1 - 1000`)
    }
    
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    db.setting('defaultLimit', newLimit)
    
    await m.reply(
        `✅ *ʙᴇʀʜᴀsɪʟ*\n\n` +
        `> Default limit diubah menjadi: \`${newLimit}\`\n` +
        `> User baru akan mendapat limit ini`
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

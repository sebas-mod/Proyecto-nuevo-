"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'top',
    alias: ['top5', 'toplist'],
    category: 'fun',
    description: 'Random top 5 member untuk kategori tertentu',
    usage: '.top <kategori>',
    example: '.top orang pintar',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const kategori = _optionalChain([m, 'access', _ => _.args, 'access', _2 => _2.join, 'call', _3 => _3(' '), 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()])
    
    if (!kategori) {
        return m.reply(
            `\`Contoh: ${m.prefix}top orang pintar\``
        )
    }
    
    m.react('🕕')
    
    try {
        const groupMeta = m.groupMetadata
        const participants = groupMeta.participants || []
        
        const members = participants
            .map(p => p.jid)
            .filter(id => id && id !== _optionalChain([sock, 'access', _6 => _6.user, 'optionalAccess', _7 => _7.id, 'optionalAccess', _8 => _8.split, 'call', _9 => _9(':'), 'access', _10 => _10[0]]) + '@s.whatsapp.net')
        
        if (members.length < 2) {
            return m.reply(`❌ Member grup kurang dari 5 orang!`)
        }
        
        const shuffled = members.sort(() => Math.random() - 0.5)
        const top5 = shuffled.slice(0, 5)
        
        const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣']
        let list = ''
        
        top5.forEach((jid, index) => {
            list += `*${index + 1}* ${medals[index]} @${jid.split('@')[0]}\n`
        })
        
        await m.reply(`🏆 *ᴛᴏᴘ 5 ${kategori.toUpperCase()}*\n${list}`, { mentions: top5 })
        m.react('✅')
    } catch (error) {
        m.react('☢')
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

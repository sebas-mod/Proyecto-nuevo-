"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
    name: 'delpremall',
    alias: ['delpremiumall', 'removepremall'],
    category: 'owner',
    description: 'Quitar todas las fotos de grupo del estreno',
    usage: '.delprem all',
    example: '.delprem all',
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    try {
        const groupMeta = m.groupMetadata
        const participants = groupMeta.participants || []
        
        if (participants.length === 0) {
            return m.reply(`❌*ɢᴀɢᴀʟ*\n\n*No hay foto en este grupo*`)
        }
        
        await m.react('🕕')
        
        const db = _almikudatabasejs.getDatabase.call(void 0, )
        if (!db.data.premium) db.data.premium = []
        
        let removedCount = 0
        let notPremCount = 0
        
        for (const participant of participants) {
            const number = _optionalChain([participant, 'access', _ => _.jid, 'optionalAccess', _2 => _2.replace, 'call', _3 => _3(/[^0-9]/g, '')]) || ''
            if (!number) continue
            
            const index = _optionalChain([db, 'access', _4 => _4.data, 'optionalAccess', _5 => _5.premium, 'access', _6 => _6.indexOf, 'call', _7 => _7(number)])
            
            if (index === -1) {
                notPremCount++
                continue
            }
            
            _optionalChain([db, 'access', _8 => _8.data, 'access', _9 => _9.premium, 'optionalAccess', _10 => _10.splice, 'call', _11 => _11(index, 1)])
            const jid = number + '@s.whatsapp.net'
            const user = db.getUser(jid)
            if (user) {
                user.isPremium = false
                db.setUser(jid, user)
            }
            
            removedCount++
        }
        
        db.save()
        
        await m.react('🗑️')
        
        await m.reply(
            `🗑️ *ᴅᴇʟ ᴘʀᴇᴍɪᴜᴍ ᴀʟʟ*\n\n` +
            `╭┈┈⬡「 📋 *ʜᴀsɪʟ* 」\n` +
            `┃ 👥 ᴛᴏᴛᴀʟ ᴍᴇᴍʙᴇʀ: \`${participants.length}\`\n` +
            `┃ ✅ ᴅɪʜᴀᴘᴜs: \`${removedCount}\`\n` +
            `┃ ⏭️ ʙᴜᴋᴀɴ ᴘʀᴇᴍɪᴜᴍ: \`${notPremCount}\`\n` +
            `┃ 💎 sɪsᴀ ᴘʀᴇᴍɪᴜᴍ: \`${db.data.premium.length}\`\n` +
            `╰┈┈⬡\n\n` +
            `> Grupo:${groupMeta.subject}`
        )
        
    } catch (error) {
        await m.react('☢')
        await m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'addpremall',
    alias: ['addpremiumall', 'setpremall'],
    category: 'owner',
    description: 'Menambahkan semua member grup ke premium',
    usage: '.addprem all',
    example: '.addprem all',
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
            return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Tidak ada member di grup ini`)
        }
        
        await m.react('🕕')
        
        const db = _ourindatabasejs.getDatabase.call(void 0, )
        if (!db.data.premium) db.data.premium = []
        
        let addedCount = 0
        let alreadyPremCount = 0
        
        for (const participant of participants) {
            const number = _optionalChain([participant, 'access', _ => _.jid, 'optionalAccess', _2 => _2.replace, 'call', _3 => _3(/[^0-9]/g, '')]) || ''
            
            if (!number) continue
            
            if (db.data.premium.includes(number)) {
                alreadyPremCount++
                continue
            }  
            db.data.premium.push(number)
            
            const jid = number + '@s.whatsapp.net'
            const premLimit = _optionalChain([_configjs2.default, 'access', _4 => _4.limits, 'optionalAccess', _5 => _5.premium]) || 100
            const user = db.getUser(jid) || db.setUser(jid)
            
            user.energi = premLimit
            user.isPremium = true
            
            db.setUser(jid, user)
            db.updateExp(jid, 200000)
            db.updateKoin(jid, 20000)
            addedCount++
        }
        
        db.save()
        
        await m.react('💎')
        await m.reply(
            `💎 *ᴀᴅᴅ ᴘʀᴇᴍɪᴜᴍ ᴀʟʟ*\n\n` +
            `╭┈┈⬡「 📋 *ʜᴀsɪʟ* 」\n` +
            `┃ 👥 ᴛᴏᴛᴀʟ ᴍᴇᴍʙᴇʀ: \`${participants.length}\`\n` +
            `┃ ✅ ᴅɪᴛᴀᴍʙᴀʜᴋᴀɴ: \`${addedCount}\`\n` +
            `┃ ⏭️ sᴜᴅᴀʜ ᴘʀᴇᴍɪᴜᴍ: \`${alreadyPremCount}\`\n` +
            `┃ 💎 ᴛᴏᴛᴀʟ ᴘʀᴇᴍɪᴜᴍ: \`${db.data.premium.length}\`\n` +
            `╰┈┈⬡\n\n` +
            `> Grup: ${groupMeta.subject}`
        )
        
    } catch (error) {
        await m.react('☢')
        await m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

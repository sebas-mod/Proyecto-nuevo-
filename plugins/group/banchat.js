"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
    name: 'banchat',
    alias: ['bangroup', 'bangrup', 'unbanchat', 'unbangroup'],
    category: 'group',
    description: 'Ban grupo del uso de botas ( sólo el propietario puede realmente trabajar )',
    usage: '.banchat',
    example: '.banchat',
    isOwner: true,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = _almikudatabasejs.getDatabase.call(void 0, )
    const cmd = m.command.toLowerCase()
    const isUnban = ['unbanchat', 'unbangroup'].includes(cmd)
    
    try {
        const groupMeta = m.groupMetadata
        const groupName = groupMeta.subject || 'Unknown'
        const groupData = db.getGroup(m.chat) || {}
        
        if (isUnban) {
            if (!groupData.isBanned) {
                return m.reply(
                    `⚠️ *ɢʀᴜᴘ ᴛɪᴅᴀᴋ ᴅɪʙᴀɴ*\n\n` +
                    `Este tipo de Grupo no está en el estaya prohibida.\n` +
                    `Para ver si todos los usuarios podrían usar las botas.`
                )
            }
            
            db.setGroup(m.chat, { ...groupData, isBanned: false })
            
            return sock.sendMessage(m.chat, {
                text: `✅ *ɢʀᴜᴘ ᴅɪ-ᴜɴʙᴀɴ*\n\n` +
                    `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
                    `┃ 📛 ɢʀᴜᴘ: *${groupName}*\n` +
                    `┃ 📊Sᴛᴀᴛᴜs: *✅Activo*\n` +
                    `┃ 👤 ᴜɴʙᴀɴ ᴏʟᴇʜ: @${m.sender.split('@')[0]}\n` +
                    `╰┈┈⬡\n\n` +
                    `Todas las fotos ahora pueden usar las botas de nuevo.`,
                mentions: [m.sender]
            }, { quoted: m })
        }
        
        if (groupData.isBanned) {
            return m.reply(
                `⚠️ *ɢʀᴜᴘ sᴜᴅᴀʜ ᴅɪʙᴀɴ*\n\n` +
                `Este Grupo si está en estaya prohibida.\n` +
                `> Usa\`Unbanchat.\`Para abrir el acto.`
            )
        }
        
        db.setGroup(m.chat, { ...groupData, isBanned: true })
        
        await m.reply(`🚫 *ɢʀᴜᴘ ᴅɪʙᴀɴ*\n\n` +
                `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
                `┃ 📛 ɢʀᴜᴘ: *${groupName}*\n` +
                `┃ 📊 sᴛᴀᴛᴜs: *🔴 BANNED*\n` +
                `┃ 👤 ʙᴀɴ ᴏʟᴇʜ: @${m.sender.split('@')[0]}\n` +
                `╰┈┈⬡\n\n` +
                `Sí, bueno, no podemos usar las botas en este grupo.\n` +
                `Sólo el propietario puede usar las botas.`, {  mentions: [m.sender] })
        
    } catch (error) {
        m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

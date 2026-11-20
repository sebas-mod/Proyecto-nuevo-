"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'inspect',
    alias: ['cekgrup', 'ceksaluran', 'groupinfo', 'channelinfo'],
    category: 'utility',
    description: 'Información instantánea grupo o canal whatsApp vía enlace',
    usage: '.inspect <link grup/saluran>',
    example: '.inspect https://chat.whatsapp.com/xxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()])

    if (!text) {
        return m.reply(
            `🔍 *ɪɴsᴘᴇᴄᴛ*\n\n` +
            `# Verificar el grupo o canal a través de enlaces\n\n` +
            `*ᴄᴏɴᴛᴏʜ:*\n` +
            `> \`${m.prefix}inspect https://chat.whatsapp.com/xxx\`\n` +
            `> \`${m.prefix}inspect https://whatsapp.com/channel/xxx\``
        )
    }

    const grupPattern = /chat\.whatsapp\.com\/([\w\d]*)/
    const saluranPattern = /whatsapp\.com\/channel\/([\w\d]*)/

    m.react('🔍')

    try {
        if (grupPattern.test(text)) {
            const inviteCode = text.match(grupPattern)[1]
            
            const groupInfo = await sock.groupGetInviteInfo(inviteCode)
            
            let teks = 
                `📋 *ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ ɢʀᴏᴜᴘ*\n\n` +
                `╭┈┈⬡「 📊 *ᴅᴇᴛᴀɪʟ* 」\n` +
                `┃ 📝 ɴᴀᴍᴇ: *${groupInfo.subject}*\n` +
                `┃ 🆔 ɪᴅ: \`${groupInfo.id}\`\n` +
                `┃ 📅 ᴄʀᴇᴀᴛᴇᴅ: ${new Date(groupInfo.creation * 1000).toLocaleString('id-ID')}\n`

            if (groupInfo.owner) {
                teks += `┃ 👑 ᴄʀᴇᴀᴛᴏʀ: @${groupInfo.owner.split('@')[0]}\n`
            }

            teks += 
                `┃ 🔗 ʟɪɴᴋᴇᴅ ᴘᴀʀᴇɴᴛ: ${groupInfo.linkedParent || 'None'}\n` +
                `┃ 🔒 ʀᴇsᴛʀɪᴄᴛ: ${groupInfo.restrict ? '✅' : '❌'}\n` +
                `┃ 📢 ᴀɴɴᴏᴜɴᴄᴇ: ${groupInfo.announce ? '✅' : '❌'}\n` +
                `┃ 🏘️ ɪs ᴄᴏᴍᴍᴜɴɪᴛʏ: ${groupInfo.isCommunity ? '✅' : '❌'}\n` +
                `┃ 📣 ᴄᴏᴍᴍᴜɴɪᴛʏ ᴀɴɴᴏᴜɴᴄᴇ: ${groupInfo.isCommunityAnnounce ? '✅' : '❌'}\n` +
                `┃ ✅ ᴊᴏɪɴ ᴀᴘᴘʀᴏᴠᴀʟ: ${groupInfo.joinApprovalMode ? '✅' : '❌'}\n` +
                `┃ ➕ ᴍᴇᴍʙᴇʀ ᴀᴅᴅ ᴍᴏᴅᴇ: ${groupInfo.memberAddMode ? '✅' : '❌'}\n` +
                `┃ 👥 ᴘᴀʀᴛɪᴄɪᴘᴀɴᴛs: ${_optionalChain([groupInfo, 'access', _4 => _4.participants, 'optionalAccess', _5 => _5.length]) || 0}\n` +
                `╰┈┈⬡\n\n`

            if (groupInfo.desc) {
                teks += `📝 *ᴅᴇsᴄʀɪᴘᴛɪᴏɴ:*\n${groupInfo.desc}\n\n`
            }

            if (_optionalChain([groupInfo, 'access', _6 => _6.participants, 'optionalAccess', _7 => _7.length]) > 0) {
                const admins = groupInfo.participants.filter(p => p.admin)
                if (admins.length > 0) {
                    teks += `👑 *ᴀᴅᴍɪɴs:*\n`
                    admins.forEach(a => {
                        teks += `├ @${a.id.split('@')[0]} [${a.admin}]\n`
                    })
                    teks += `╰┈┈⬡`
                }
            }

            const mentions = []
            if (groupInfo.owner) mentions.push(groupInfo.owner)
            if (groupInfo.participants) {
                groupInfo.participants.filter(p => p.admin).forEach(a => mentions.push(a.id))
            }

            m.react('✅')
            return sock.sendMessage(m.chat, { text: teks, mentions }, { quoted: m })

        } else if (saluranPattern.test(text) || text.endsWith('@newsletter') || !isNaN(text)) {
            const channelId = saluranPattern.test(text) ? text.match(saluranPattern)[1] : text
            
            const channelInfo = await sock.newsletterMsg(channelId)
            
            const teks = 
                `📺 *ɪɴꜰᴏʀᴍᴀᴛɪᴏɴ ᴄʜᴀɴɴᴇʟ*\n\n` +
                `╭┈┈⬡「 📊 *ᴅᴇᴛᴀɪʟ* 」\n` +
                `┃ 🆔 ɪᴅ: \`${channelInfo.id}\`\n` +
                `┃ 📌 sᴛᴀᴛᴇ: ${_optionalChain([channelInfo, 'access', _8 => _8.state, 'optionalAccess', _9 => _9.type]) || '-'}\n` +
                `┃ 📝 ɴᴀᴍᴇ: *${_optionalChain([channelInfo, 'access', _10 => _10.thread_metadata, 'optionalAccess', _11 => _11.name, 'optionalAccess', _12 => _12.text]) || '-'}*\n` +
                `┃ 📅 ᴄʀᴇᴀᴛᴇᴅ: ${new Date((_optionalChain([channelInfo, 'access', _13 => _13.thread_metadata, 'optionalAccess', _14 => _14.creation_time]) || 0) * 1000).toLocaleString('id-ID')}\n` +
                `┃ 👥 sᴜʙsᴄʀɪʙᴇʀs: ${_optionalChain([channelInfo, 'access', _15 => _15.thread_metadata, 'optionalAccess', _16 => _16.subscribers_count]) || 0}\n` +
                `┃ ✅ ᴠᴇʀɪꜰɪᴄᴀᴛɪᴏɴ: ${_optionalChain([channelInfo, 'access', _17 => _17.thread_metadata, 'optionalAccess', _18 => _18.verification]) || '-'}\n` +
                `╰┈┈⬡\n\n` +
                `📝 *ᴅᴇsᴄʀɪᴘᴛɪᴏɴ:*\n${_optionalChain([channelInfo, 'access', _19 => _19.thread_metadata, 'optionalAccess', _20 => _20.description, 'optionalAccess', _21 => _21.text]) || 'No description'}`

            m.react('✅')
            return m.reply(teks)

        } else {
            return m.reply('❌¡Sólo un soporte de Grupo URL o un WhathsApp Slush!')
        }

    } catch (error) {
        m.react('❌')
        
        if (error.data) {
            if ([400, 406].includes(error.data)) {
                return m.reply('❌¡Grupo / Slurp no se encuentra!')
            }
            if (error.data === 401) {
                return m.reply('❌Aquí vamos.')
            }
            if (error.data === 410) {
                return m.reply('❌¡El grupo de choque ha sido reajustado!')
            }
        }
        
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _ourinlidjs = require('../../src/lib/ourin-lid.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'listadmin',
    alias: ['admins', 'adminlist'],
    category: 'group',
    description: 'Menampilkan daftar admin grup',
    usage: '.listadmin',
    example: '.listadmin',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: false,
    isBotAdmin: false
}

async function handler(m, { sock }) {
    try {
        const groupMeta = m.groupMetadata
        const participants = groupMeta.participants || []
        const admins = participants.filter(p => p.admin)

        if (admins.length === 0) {
            await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Tidak ada admin di grup ini.`)
            return
        }

        const owner = admins.find(a => a.admin === 'superadmin')
        const regularAdmins = admins.filter(a => a.admin === 'admin')

        let adminList = `👑 *ʟɪsᴛ ᴀᴅᴍɪɴ*\n\n`

        if (owner) {
            adminList += `\`\`\`━━━ ᴏᴡɴᴇʀ ━━━\`\`\`\n`
            adminList += `\`\`\`👑 @${_ourinlidjs.getParticipantJid.call(void 0, owner).split('@')[0]}\`\`\`\n\n`
        }

        if (regularAdmins.length > 0) {
            adminList += `\`\`\`━━━ ᴀᴅᴍɪɴ ━━━\`\`\`\n`
            regularAdmins.forEach((admin, i) => {
                adminList += `\`\`\`${i + 1}. @${_ourinlidjs.getParticipantJid.call(void 0, admin).split('@')[0]}\`\`\`\n`
            })
        }
        adminList += `\n\`Total Admin: ${admins.length}\``

        const mentions = admins.map(a => _ourinlidjs.getParticipantJid.call(void 0, a))

        await m.reply(adminList, { mentions })

    } catch (error) {
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

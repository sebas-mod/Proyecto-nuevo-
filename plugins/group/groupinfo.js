"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourinlidjs = require('../../src/lib/ourin-lid.js');
var _ourintimejs = require('../../src/lib/ourin-time.js'); var timeHelper = _interopRequireWildcard(_ourintimejs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'groupinfo',
    alias: ['infogroup', 'gcinfo', 'infogc', 'gc'],
    category: 'group',
    description: 'Adjuntar información de grupos',
    usage: '.groupinfo',
    example: '.groupinfo',
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

function featureStatus(val) {
    if (val === true || val === 'on') return '✅'
    return '❌'
}

async function handler(m, { sock, db }) {
    try {
        const groupMeta = m.groupMetadata
        const participants = groupMeta.participants || []
        const admins = participants.filter(p => p.admin)

        let ownerJid = null
        if (groupMeta.owner) ownerJid = _ourinlidjs.resolveAnyLidToJid.call(void 0, groupMeta.owner, participants)
        if (!ownerJid || ownerJid.includes('@lid')) {
            const superAdmin = participants.find(p => p.admin === 'superadmin')
            if (superAdmin) ownerJid = _ourinlidjs.getParticipantJid.call(void 0, superAdmin)
        }
        if (!ownerJid || ownerJid.includes('@lid')) {
            const firstAdmin = admins[0]
            if (firstAdmin) ownerJid = _ourinlidjs.getParticipantJid.call(void 0, firstAdmin)
        }

        const group = db.getGroup(m.chat) || {}

        const createdDate = groupMeta.creation
            ? timeHelper.fromTimestamp(groupMeta.creation * 1000, 'D MMMM YYYY')
            : 'No diketahui'

        const ownerNumber = ownerJid ? ownerJid.split('@')[0] : null
        const ownerDisplay = ownerNumber && !ownerNumber.includes(':')
            ? `@${ownerNumber}`
            : 'No diketahui'

        let ppUrl = null
        try {
            ppUrl = await sock.profilePictureUrl(m.chat)
        } catch (e) {}

        const isOpen = groupMeta.announce === false || !groupMeta.announce

        let text = `👥91; INFO Grupo\n\n`
        text += `Nombre: *${groupMeta.subject}*\n`
        text += `ID: ${m.chat}\n`
        text += `Propietario:${ownerDisplay}\n`
        text += `Creado:${createdDate}\n`
        text += `Status: ${isOpen ? '🔓 Terbuka' : '🔒 Tertutup'}\n\n`

        text += `📊 *MEMBER*\n`
        text += `Total: ${participants.length}\n`
        text += `Administrador:${admins.length}\n`
        text += `Member: ${participants.length - admins.length}\n\n`

        text += `🔧*Función Activo*\n`
        text += `Welcome: ${featureStatus(group.welcome)}\n`
        text += `Goodbye: ${featureStatus(group.goodbye)}\n`
        text += `Autoreply: ${featureStatus(group.autoreply)}\n`
        text += `AutoAI: ${featureStatus(group.autoai)}\n`
        text += `AutoDL: ${featureStatus(group.autodl)}\n`
        text += `AutoSticker: ${featureStatus(group.autosticker)}\n`
        text += `AutoMedia: ${featureStatus(group.automedia)}\n\n`

        text += `🛡️ *PROTEKSI*\n`
        text += `AntiLink: ${featureStatus(group.antilink)}\n`
        text += `AntiBot: ${featureStatus(group.antibot)}\n`
        text += `AntiToxic: ${featureStatus(group.antitoxic)}\n`
        text += `AntiRemove: ${featureStatus(group.antiremove)}\n`
        text += `AntiHidetag: ${featureStatus(group.antihidetag)}\n`
        text += `AntiSticker: ${featureStatus(group.antisticker)}\n`
        text += `AntiMedia: ${featureStatus(group.antimedia)}\n`
        text += `AntiDocument: ${featureStatus(group.antidocument)}`

        if (groupMeta.desc) {
            text += `\n\n📝*Descripción*\n${groupMeta.desc}`
        }

        const mentions = ownerJid && !ownerJid.includes(':') ? [ownerJid] : []

        if (ppUrl) {

            try {
                const ppBuffer = Buffer.from((await _axios2.default.get(ppUrl, { responseType: 'arraybuffer', timeout: 10000 })).data)
                await sock.sendMessage(m.chat, {
                    image: ppBuffer,
                    caption: text,
                    mentions
                }, { quoted: m })
            } catch (e2) {
                await m.reply(text, { mentions })
            }
        } else {
            await m.reply(text, { mentions })
        }
    } catch (error) {
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

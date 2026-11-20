"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _almikulidjs = require('../../src/lib/almiku-lid.js');
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
    name: 'demote',
    alias: ['unadmin', 'turunkan'],
    category: 'group',
    description: 'Quita el rol de administrador a un miembro',
    usage: '.demote @user',
    example: '.demote @user',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

async function handler(m, { sock }) {
    let target = null

    if (m.quoted) {
        target = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        target = m.mentionedJid[0]
    }

    if (!target) {
        await m.reply(
            `❌ *ᴜsᴜᴀʀɪᴏ ɴᴏ ᴇɴᴄᴏɴᴛʀᴀᴅᴏ*\n\n` +
            `¡Responde a un usuario o menciónalo!\n` +
            `> Ejemplo:\`${m.prefix}demote @usuario\``
        )
        return
    }

    try {
        const groupMeta = m.groupMetadata
        const participant = groupMeta.participants.find(p => _almikulidjs.getParticipantJid.call(void 0, p) === target)

        if (!participant) {
            await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n¡No se encontró al usuario en el grupo!`)
            return
        }

        if (!participant.admin) {
            await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n¡Este usuario no es administrador!`)
            return
        }

        if (participant.admin === 'superadmin') {
            await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n*No puedes quitar el rol al dueño del grupo!*`)
            return
        }

        await sock.groupParticipantsUpdate(m.chat, [target], 'demote')

        await m.reply(
            `@${target.split('@')[0]} ya no es administrador.`,
            { mentions: [target] }
        )

    } catch (error) {
        m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

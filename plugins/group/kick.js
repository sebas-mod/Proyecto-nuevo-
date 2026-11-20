"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikulidjs = require('../../src/lib/almiku-lid.js');
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
    name: 'kick',
    alias: ['remove', 'tendang'],
    category: 'group',
    description: 'Kickphoto del grupo',
    usage: '.kick @user',
    example: '.kick @user',
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
    let targetJid = null

    if (m.quoted) {
        targetJid = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetJid = m.mentionedJid[0]
    }

    if (!targetJid) {
        await m.reply(
            `❌ *ᴛᴀʀɢᴇᴛ ᴛɪᴅᴀᴋ ᴅɪᴛᴇᴍᴜᴋᴀɴ*\n\n` +
            `¡Ezely ordena un usuario o una mención!\n` +
            `> Ejemplo:\`${m.prefix}kick @user\``
        )
        return
    }

    const botNumber = _optionalChain([sock, 'access', _ => _.user, 'optionalAccess', _2 => _2.id, 'optionalAccess', _3 => _3.split, 'call', _4 => _4(':'), 'access', _5 => _5[0]]) + '@s.whatsapp.net'
    const targetNumber = targetJid.replace(/@.*$/, '')

    if (targetJid === botNumber || targetNumber === botNumber.replace(/@.*$/, '')) {
        await m.reply(`❌*ɢᴀɢᴀʟ*\n\n¡No puedes patear tu propio bot!`)
        return
    }

    if (targetJid === m.sender) {
        await m.reply(`❌*ɢᴀɢᴀʟ*\n\n¡No puedes patearte!`)
        return
    }

    try {
        const groupMeta = m.groupMetadata
        const targetParticipant = _almikulidjs.findParticipantByNumber.call(void 0, groupMeta.participants, targetJid)
        
        if (!targetParticipant) {
            await m.reply(`❌*ɢᴀɢᴀʟ*\n\n- ¡No se encontró al usuario en un grupo!`)
            return
        }
        
        if (targetParticipant.admin) {
            await m.reply(`❌*ɢᴀɢᴀʟ*\n\n¡No puede patear a administrador del grupo!`)
            return
        }
        
        await sock.groupParticipantsUpdate(m.chat, [targetParticipant.id], 'remove')

        await m.reply(`✅ @${targetNumber}ha sido eliminado de este grupo.`, { mentions: [targetJid] })

    } catch (error) {
        m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

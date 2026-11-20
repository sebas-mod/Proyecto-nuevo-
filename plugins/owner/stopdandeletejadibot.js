"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinjadibotmanagerjs = require('../../src/lib/ourin-jadibot-manager.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'stopdandeletejadibot',
    alias: ['deletejadibot', 'removejadibot', 'hapusjadibot'],
    category: 'owner',
    description: 'Stop and remove session so it \'s a regular user.',
    usage: '.stopdandeletejadibot @user',
    example: '.stopdandeletejadibot @628xxx',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let target = null

    if (m.quoted) {
        target = m.quoted.sender
    } else if (_optionalChain([m, 'access', _ => _.mentionedJid, 'optionalAccess', _2 => _2[0]])) {
        target = m.mentionedJid[0]
    } else if (_optionalChain([m, 'access', _3 => _3.text, 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()])) {
        const num = m.text.trim().replace(/[^0-9]/g, '')
        if (num) target = num + '@s.whatsapp.net'
    }

    if (!target) {
        const sessions = _ourinjadibotmanagerjs.getAllJadibotSessions.call(void 0, )

        if (sessions.length === 0) {
            return m.reply(`❌No se ha mantenido ninguna sesión`)
        }

        let txt = `🗑️ *sᴛᴏᴘ & ᴅᴇʟᴇᴛᴇ ᴊᴀᴅɪʙᴏᴛ*\n\n`
        txt += `Seleccione objetivos con mención o respuesta:\n\n`

        sessions.forEach((s, i) => {
            const status = s.isActive ? '🟢' : '⚫'
            txt += `${status} *${i + 1}.* @${s.id}\n`
        })

        txt += `\n> Ejemplo:\`${m.prefix}stopdandeletejadibot @628xxx\``

        return sock.sendMessage(m.chat, {
            text: txt,
            mentions: sessions.map(s => s.jid)
        }, { quoted: m })
    }

    const id = target.replace(/@.+/g, '')
    const sessions = _ourinjadibotmanagerjs.getAllJadibotSessions.call(void 0, )
    const session = sessions.find(s => s.id === id)

    if (!session) {
        return m.reply(`❌Sesión JERBED FOR * @${id}* not found`, { mentions: [target] })
    }

    await m.react('🕕')

    try {
        await _ourinjadibotmanagerjs.stopJadibot.call(void 0, target, true)

        await m.react('✅')

        await sock.sendMessage(m.chat, {
            text: `🗑️ *ᴊᴀᴅɪʙᴏᴛ ᴅɪʜᴀᴘᴜs*\n\n` +
                `•📱Número: *@${id}*\n` +
                `> 🗑️ Status: *Deleted*\n\n` +
                `El período de sesiones se ha visto comprometido de manera de servicio.\n` +
                `User necesita\`.\`Repetido para crear una nueva sesión.`,
            mentions: [target]
        }, { quoted: m })
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

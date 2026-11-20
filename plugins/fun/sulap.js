"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: 'sulap',
    alias: ['magic', 'magictrick'],
    category: 'fun',
    description: 'Pertunjukan sulap - kick member secara dramatis',
    usage: '.sulap',
    example: '.sulap',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}

if (!global.sulapSessions) global.sulapSessions = new Map()

const successLines = [
    '💨* POOF!',
    '🌟¡La magia lo hizo!',
    '✨ Absen dulu ya, ditunggu berikutnya!',
    '🎪Pertunjukan terminado!👏'
]

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function handler(m, { sock }) {
    await m.react('🎩')

    const sent = await m.reply(`🎩✨ *ᴘᴇʀᴛᴜɴᴊᴜᴋᴀɴ sᴜʟᴀᴘ*\n\n` +
            `¿Quién quiere perder?\n\n` +
            `* Responder este mensaje + mencionar a su persona*`)

    global.sulapSessions.set(sent.key.id, {
        admin: m.sender,
        chat: m.chat,
        timestamp: Date.now()
    })

    setTimeout(() => {
        global.sulapSessions.delete(sent.key.id)
    }, 120000)
}

async function replyHandler(m, sock) {
    if (!m.quoted) return false

    const quotedId = _optionalChain([m, 'access', _ => _.quoted, 'optionalAccess', _2 => _2.id]) || _optionalChain([m, 'access', _3 => _3.quoted, 'optionalAccess', _4 => _4.key, 'optionalAccess', _5 => _5.id])
    if (!quotedId) return false

    const session = global.sulapSessions.get(quotedId)
    if (!session) return false
    if (session.chat !== m.chat) return false
    if (session.admin !== m.sender) return false

    let targetJid = null
    if (_optionalChain([m, 'access', _6 => _6.mentionedJid, 'optionalAccess', _7 => _7[0]])) {
        targetJid = m.mentionedJid[0]
    } else if (_optionalChain([m, 'access', _8 => _8.quoted, 'optionalAccess', _9 => _9.sender]) && m.quoted.sender !== _optionalChain([sock, 'access', _10 => _10.user, 'optionalAccess', _11 => _11.id])) {
        return false
    }

    if (!targetJid) {
        await sock.sendMessage(m.chat, { text: '❌ Mention orangnya dong!' }, { quoted: m })
        return true
    }

    global.sulapSessions.delete(quotedId)

    const targetNumber = targetJid.split('@')[0]
    const botNumber = _optionalChain([sock, 'access', _12 => _12.user, 'optionalAccess', _13 => _13.id, 'optionalAccess', _14 => _14.split, 'call', _15 => _15(':'), 'access', _16 => _16[0]])
    const senderNumber = m.sender.split('@')[0]

    if (targetNumber === botNumber) {
        await sock.sendMessage(m.chat, { text: '🎭¡No puede perderse!' })
        return true
    }

    if (targetJid === m.sender) {
        await sock.sendMessage(m.chat, { text: '🎭¡No puedes perderte!' })
        return true
    }

    try {
        const groupMeta = m.groupMetadata
        const target = groupMeta.participants.find(p =>
            p.jid === targetJid || _optionalChain([p, 'access', _17 => _17.jid, 'optionalAccess', _18 => _18.includes, 'call', _19 => _19(targetNumber)])
        )

        if (!target) {
            await sock.sendMessage(m.chat, { text: '👻¡Ese tipo no está en el grupo!' })
            return true
        }

        if (['admin', 'superadmin'].includes(target.admin)) {
            await sock.sendMessage(m.chat, { text: '🛡¡AyaAdmin kehl a magia!' })
            return true
        }

        await sock.sendMessage(m.chat, {
            text: `🪄 *Bersiaplah @${targetNumber}...* ✨`,
            mentions: [targetJid]
        })

        await sleep(2000)

        await sock.groupParticipantsUpdate(m.chat, [targetJid], 'remove')

        const line = successLines[Math.floor(Math.random() * successLines.length)]
        await sock.sendMessage(m.chat, {
            text: `${line}\n\n` +
                `🎯 @${targetNumber} telah menghilang!\n` +
                `🎩 Pesulap: @${senderNumber}\n\n` +
                `*El espectáculo ha terminado*✨`,
            mentions: [targetJid, m.sender]
        })

    } catch (error) {
        await sock.sendMessage(m.chat, { text: `😅Sulapnya fallido...\n\n•${error.message}` })
    }

    return true
}

exports.config = pluginConfig; exports.handler = handler; exports.replyHandler = replyHandler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

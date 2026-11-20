"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: ['pinchat', 'pin'],
    alias: [],
    category: 'owner',
    description: 'Pin/unpin chat',
    usage: '.pinchat <nomor/reply> atau .pinchat buka <nomor>',
    example: '.pinchat 628xxx',
    isOwner: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const action = _optionalChain([m, 'access', _ => _.args, 'access', _2 => _2[0], 'optionalAccess', _3 => _3.toLowerCase, 'call', _4 => _4()])
    let targetJid = null
    let pin = true

    if (action === 'buka' || action === 'unpin') {
        pin = false
        const num = (m.args[1] || '').replace(/[^0-9]/g, '')
        if (num) targetJid = num + '@s.whatsapp.net'
        else if (m.quoted) targetJid = m.quoted.sender || m.quoted.participant
        else if (!m.isGroup) targetJid = m.chat
    } else {
        if (_optionalChain([m, 'access', _5 => _5.mentionedJid, 'optionalAccess', _6 => _6.length]) > 0) {
            targetJid = m.mentionedJid[0]
        } else if (m.quoted) {
            targetJid = m.quoted.sender || m.quoted.participant
        } else if (m.args[0]) {
            const num = m.args[0].replace(/[^0-9]/g, '')
            if (num) targetJid = num + '@s.whatsapp.net'
        } else if (!m.isGroup) {
            targetJid = m.chat
        }
    }

    if (!targetJid) {
        return m.reply(
            '📌 *ᴘɪɴ ᴄʜᴀᴛ*\n\n' +
            '> `.pinchat 628xxx` — Pin chat\n' +
            '♪`Pinchat.`(en la charla primaria )—Esto es divertido.\n' +
            '> `.pinchat buka 628xxx` — Unpin chat'
        )
    }

    try {
        await sock.chatModify({ pin }, targetJid)
        await m.react('✅')
        const target = targetJid.split('@')[0]
        return m.reply(
            pin
                ? `📌 *ᴄʜᴀᴛ ᴅɪᴘɪɴ*\n\n> Objetivo: ${target}`
                : `📍 *ᴘɪɴ ᴅɪʜᴀᴘᴜs*\n\n> Objetivo: ${target}`
        )
    } catch (err) {
        return m.reply(`❌Fallido:${err.message}`)
    }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

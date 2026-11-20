"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: ['block', 'blokir'],
    alias: [],
    category: 'owner',
    description: 'Números de bloque WhatsApp',
    usage: '.block <nomor/reply/mention>',
    example: '.block 628xxx',
    isOwner: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let targetJid = null

    if (_optionalChain([m, 'access', _ => _.mentionedJid, 'optionalAccess', _2 => _2.length]) > 0) {
        targetJid = m.mentionedJid[0]
    } else if (m.quoted) {
        targetJid = m.quoted.sender || m.quoted.participant
    } else if (m.args[0]) {
        let num = m.args[0].replace(/[^0-9]/g, '')
        if (!num) return m.reply('❌El número no es válido.')
        targetJid = num + '@s.whatsapp.net'
    } else if (!m.isGroup) {
        targetJid = m.chat
    }

    if (!targetJid) {
        return m.reply(
            '⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n' +
            '> `.block 628xxx` — Blokir via nomor\n' +
            '•`- Bloque.`(responder mensaje)—Bloqueo\n' +
            '•`. bloque @ mención` —Bloquear el uno en mención\n' +
            '•`- Bloque.`(en la charla primaria )—Bloquear este usuario'
        )
    }

    const botJid = _optionalChain([sock, 'access', _3 => _3.user, 'optionalAccess', _4 => _4.id, 'optionalAccess', _5 => _5.split, 'call', _6 => _6(':'), 'access', _7 => _7[0]]) + '@s.whatsapp.net'
    if (targetJid === botJid) {
        return m.reply('❌No puede bloquear sus propios números de bot.')
    }

    try {
        await sock.updateBlockStatus(targetJid, 'block')
        await m.react('🚫')
        return m.reply(
            `🚫 *ɴᴏᴍᴏʀ ᴅɪʙʟᴏᴋɪʀ*\n\n` +
            `> Objetivo: @${targetJid.split('@')[0]}\n` +
            `> Usa\`. desbloquear.\`para bloquear`,
            { mentions: [targetJid] }
        )
    } catch (err) {
        return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

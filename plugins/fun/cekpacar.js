"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
    name: 'cekpacar',
    alias: ['pacar', 'pasangan', 'gebetan'],
    category: 'fun',
    description: 'Cek status hubungan seseorang',
    usage: '.cekpacar atau .cekpacar @tag',
    example: '.cekpacar',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const args = m.args || []
    let targetJid = m.sender
    let isOther = false
    if (m.quoted) {
        targetJid = m.quoted.sender
        isOther = true
    } else if (_optionalChain([m, 'access', _ => _.mentionedJid, 'optionalAccess', _2 => _2[0]])) {
        targetJid = m.mentionedJid[0]
        isOther = true
    } else if (args[0]) {
        let num = args[0].replace(/[^0-9]/g, '')
        if (num.length > 5 && num.length < 20) {
            targetJid = num + '@s.whatsapp.net'
            isOther = true
        }
    }
    
    const userData = db.getUser(targetJid) || {}
    
    if (!_optionalChain([userData, 'access', _3 => _3.fun, 'optionalAccess', _4 => _4.pasangan])) {
        const nama = isOther ? `@${targetJid.split('@')[0]}` : 'Tu'
        await m.react('💔')
        return m.reply(
            `💔 *sᴛᴀᴛᴜs ʜᴜʙᴜɴɢᴀɴ*\n\n` +
            `*${nama}* no tiene par.\n` +
            `Primero consigue un par.\`${m.prefix}tembak @tag\``,
            { mentions: isOther ? [targetJid] : [] }
        )
    }
    
    const partnerJid = userData.fun.pasangan
    const partnerData = db.getUser(partnerJid) || {}
    const isMutual = _optionalChain([partnerData, 'access', _5 => _5.fun, 'optionalAccess', _6 => _6.pasangan]) === targetJid
    const nama = isOther ? `@${targetJid.split('@')[0]}` : 'Tu'
    if (isMutual) {
        await m.react('💕')
        await m.reply(
            `💕 *sᴛᴀᴛᴜs ʜᴜʙᴜɴɢᴀɴ*\n\n` +
            `*${nama}* en una cita con @${partnerJid.split('@')[0]}! 🥳`,
            { mentions: [targetJid, partnerJid] }
        )
    } else {
        await m.react('💭')
        await m.reply(
            `💭 *sᴛᴀᴛᴜs ʜᴜʙᴜɴɢᴀɴ*\n\n` +
            `*${nama}* again pdkt same @${partnerJid.split('@')[0]}\n` +
            `Status: *Digantung* 😅\n\n` +
            `Esperar respuesta...`,
            { mentions: [targetJid, partnerJid] }
        )
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

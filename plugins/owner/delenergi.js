"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
    name: 'delenergi',
    alias: ['kurangenergi', 'removeenergi', 'hapusenergi', 'delenergy'],
    category: 'owner',
    description: 'Kurangi energi user',
    usage: '.delenergi <jumlah> @user',
    example: '.delenergi 50 @user',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function formatNumber(num) {
    if (num === -1) return '∞ Unlimited'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function extractTarget(m) {
    if (m.quoted) return m.quoted.sender
    if (_optionalChain([m, 'access', _ => _.mentionedJid, 'optionalAccess', _2 => _2.length])) return m.mentionedJid[0]
    return null
}

async function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const args = m.args
    
    const numArg = args.find(a => !isNaN(a) && !a.startsWith('@'))
    const amount = parseInt(numArg) || 0
    
    let targetJid = await extractTarget(m)
    
    if (!targetJid && amount > 0) {
        targetJid = m.sender
    }
    
    if (!targetJid || amount <= 0) {
        return m.reply(
            `⚡ *ᴅᴇʟ ᴇɴᴇʀɢɪ*\n\n` +
            `♪\`- Delenergi.<jumlah>\`- de ti mismo.\n` +
            `♪\`- Delenergi.<jumlah>@ usuario\`- del usuario\n\n` +
            `\`Contoh: ${m.prefix}delenergi 50\``
        )
    }
    
    if (amount <= 0) {
        return m.reply(`❌*ɢᴀɢᴀʟ*\n\nEsto debe ser más de 0`)
    }
    
    const user = db.getUser(targetJid)
    
    if (!user) {
        return m.reply(`❌*ɢᴀɢᴀʟ*\n\n*El usuario no fue encontrado en la base de datos*`)
    }
    
    if (user.energi === -1) {
        db.setUser(targetJid, { energi: 25 })
    }
    
    const newEnergi = db.updateEnergi(targetJid, -amount)
    
    await m.react('✅')
    
    await m.reply(
        `✅ *ᴇɴᴇʀɢɪ ᴅɪᴋᴜʀᴀɴɢɪ*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ 👤 ᴜsᴇʀ: @${targetJid.split('@')[0]}\n` +
        `┃ ➖ ᴋᴜʀᴀɴɢ: *-${formatNumber(amount)}*\n` +
        `┃ ⚡ sɪsᴀ: *${formatNumber(newEnergi)}*\n` +
        `╰┈┈⬡`,
        { mentions: [targetJid] }
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

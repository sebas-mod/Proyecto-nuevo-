"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
    name: 'setbirthday',
    alias: ['setbday', 'setultah', 'settgl'],
    category: 'user',
    description: '¡Fuera de mi cumpleaños!',
    usage: '.setbirthday <DD-MM>',
    example: '.setbirthday 25-12',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const input = _optionalChain([m, 'access', _ => _.args, 'optionalAccess', _2 => _2[0], 'optionalAccess', _3 => _3.trim, 'call', _4 => _4()])
    const userJid = m.sender
    const cleanJid = userJid.replace(/@.+/g, '')
    
    if (!input) {
        const user = db.getUser(userJid)
        const currentBday = _optionalChain([user, 'optionalAccess', _5 => _5.birthday])
        
        let text = `🎂 *sᴇᴛ ʙɪʀᴛʜᴅᴀʏ*\n\n`
        
        if (currentBday) {
            text += `Tus cumpleaños${currentBday}*\n\n`
        }
        
        text += `╭┈┈⬡「 📋 *ғᴏʀᴍᴀᴛ* 」\n`
        text += `┃ ${m.prefix}setbirthday DD-MM\n`
        text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        text += `*Ejemplo:*\n`
        text += `> ${m.prefix}setbirthday 25-12\n`
        text += `> ${m.prefix}setbirthday 01-01`
        
        return m.reply(text)
    }
    
    const dateRegex = /^(\d{1,2})[-\/](\d{1,2})$/
    const match = input.match(dateRegex)
    
    if (!match) {
        return m.reply(`❌ Formato incorrecto! Usa: DD-MM\n\n> Ejemplo:${m.prefix}setbirthday 25-12`)
    }
    
    const day = parseInt(match[1])
    const month = parseInt(match[2])
    
    if (month < 1 || month > 12) {
        return m.reply(`❌¡Toros no válidos! ( 1 12 )`)
    }
    
    const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    if (day < 1 || day > daysInMonth[month - 1]) {
        return m.reply(`❌La fecha no es válida durante meses${month}!`)
    }
    
    const formattedDate = `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}`
    
    db.setUser(m.sender, { 
        birthday: formattedDate 
    })
    
    await db.save()
    
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    
    await m.reply(
        `✅ *ʙɪʀᴛʜᴅᴀʏ ᴅɪsɪᴍᴘᴀɴ!*\n\n` +
        `╭┈┈⬡「 🎂 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ 📅 Fecha: *${day} ${months[month - 1]}*\n` +
        `┃ 👤 User: @${cleanJid}\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `*Será felicitante*\n` +
        `¡Feliz cumpleaños en tu día especial!🎉`,
        { mentions: [userJid] }
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

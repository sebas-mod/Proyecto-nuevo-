"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
    name: 'birthday',
    alias: ['bday', 'ultah', 'ulangtahun'],
    category: 'user',
    description: 'Mira el miembro del cumpleaños',
    usage: '.birthday [@user]',
    example: '.birthday @user',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const target = _optionalChain([m, 'access', _ => _.mentionedJid, 'optionalAccess', _2 => _2[0]]) || _optionalChain([m, 'access', _3 => _3.quoted, 'optionalAccess', _4 => _4.sender]) || m.sender
    const cleanJid = target.replace(/@.+/g, '')
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const user = db.getUser(target)
    
    if (!_optionalChain([user, 'optionalAccess', _5 => _5.birthday])) {
        if (target === m.sender) {
            return m.reply(
                `❌¡No has fijado el cumpleaños!\n\n` +
                `> Usa: ${m.prefix}setbirthday DD-MM\n` +
                `> Ejemplo:${m.prefix}setbirthday 25-12`
            )
        }
        return m.reply(`❌¡El usuario no ha cumplido todavía!`)
    }
    
    const [day, month] = user.birthday.split('-').map(Number)
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
    
    const now = new Date()
    const currentYear = now.getFullYear()
    let nextBday = new Date(currentYear, month - 1, day)
    
    if (nextBday < now) {
        nextBday = new Date(currentYear + 1, month - 1, day)
    }
    
    const diffTime = nextBday.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    const isToday = now.getDate() === day && now.getMonth() === month - 1
    
    let text = `🎂 *ʙɪʀᴛʜᴅᴀʏ ɪɴғᴏ*\n\n`
    text += `╭┈┈⬡「 👤 *ᴜsᴇʀ* 」\n`
    text += `┃ 🏷️ @${cleanJid}\n`
    text += `┃ 📅 ${day} ${months[month - 1]}\n`
    
    if (isToday) {
        text += `┃ 🎉¡Espera que esto sea la situación!\n`
    } else {
        text += `┃ 🕕 ${diffDays}el otra vez\n`
    }
    
    text += `╰┈┈┈┈┈┈┈┈⬡`
    
    if (isToday) {
        text += `\n\n🎊 *HAPPY BIRTHDAY!* 🎊\n`
        text += `*Mi corazón es levantado*\n`
        text += `" ¡El éxito siempre! "🎉🎂`
    }
    
    await m.reply(text, { mentions: [target] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

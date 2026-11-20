"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
    name: 'birthdaylist',
    alias: ['bdaylist', 'listultah', 'ultahlist'],
    category: 'user',
    description: 'Mira la lista de los cumpleaños de vídeo',
    usage: '.birthdaylist',
    example: '.birthdaylist',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = _almikudatabasejs.getDatabase.call(void 0, )
    const groupMeta = m.groupMetadata
    const participants = groupMeta.participants.map(p => p.id)
    
    const birthdays = []
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentDay = now.getDate()
    
    for (const jid of participants) {
        const user = db.getUser(jid)
        if (_optionalChain([user, 'optionalAccess', _ => _.birthday])) {
            const [day, month] = user.birthday.split('-').map(Number)
            birthdays.push({
                jid,
                day,
                month,
                name: user.name || jid.split('@')[0]
            })
        }
    }
    
    if (birthdays.length === 0) {
        return m.reply(
            `❌ *ᴛɪᴅᴀᴋ ᴀᴅᴀ ᴅᴀᴛᴀ*\n\n` +
            `No hay fotos que pongan a luzDay\n\n` +
            `Desocupados: setbirthday DD MMs`
        )
    }
    
    birthdays.sort((a, b) => {
        const aNext = a.month > currentMonth || (a.month === currentMonth && a.day >= currentDay)
        const bNext = b.month > currentMonth || (b.month === currentMonth && b.day >= currentDay)
        
        if (aNext && !bNext) return -1
        if (!aNext && bNext) return 1
        
        if (a.month !== b.month) return a.month - b.month
        return a.day - b.day
    })
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    
    let text = `╭━━━━━━━━━━━━━━━━━╮\n`
    text += `┃  🎂 *ᴅᴀғᴛᴀʀ ᴜʟᴛᴀʜ*\n`
    text += `╰━━━━━━━━━━━━━━━━━╯\n\n`
    text += `╭┈┈⬡「 📋 *${birthdays.length} ᴍᴇᴍʙᴇʀ* 」\n`
    
    const mentions = []
    
    for (const b of birthdays.slice(0, 15)) {
        const isToday = b.day === currentDay && b.month === currentMonth
        const emoji = isToday ? '🎉' : '🎂'
        text += `┃ ${emoji} ${b.day} ${months[b.month - 1]} - @${b.jid.split('@')[0]}${isToday ? ' *HARI INI!*' : ''}\n`
        mentions.push(b.jid)
    }
    
    if (birthdays.length > 15) {
        text += `┃... y${birthdays.length - 15} lainnya\n`
    }
    
    text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    text += `> Set birthday: .setbirthday DD-MM`
    
    await m.reply(text, { mentions })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

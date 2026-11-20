"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _almikudatabasejs = require('../../src/lib/almiku-database.js');
const pluginConfig = {
    name: 'addtoxic',
    alias: ['tambahtoxic', 'addkata'],
    category: 'group',
    description: 'Tambah kata toxic ke daftar',
    usage: '.addtoxic <kata>',
    example: '.addtoxic kata_kasar',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = _almikudatabasejs.getDatabase.call(void 0, )
    const word = m.args.join(' ').trim().toLowerCase()
    
    if (!word) {
        return m.reply(
            `📝 *ᴀᴅᴅ ᴛᴏxɪᴄ*\n\n` +
            `> Usa: \`Addto.xic<kata>\`\n\n` +
            `\`Contoh: ${m.prefix}addtoxic katakasar\``
        )
    }
    
    if (word.length < 2) {
        return m.reply(`❌*ɢᴀɢᴀʟ*\n\n- # Demasiado corto line # - # Demasiado corto term ( menos 2 letra )`)
    }
    
    if (word.length > 30) {
        return m.reply(`❌*ɢᴀɢᴀʟ*\n\n> Palabra demasiado largo (max30 letra)`)
    }
    
    const groupData = db.getGroup(m.chat) || {}
    const toxicWords = groupData.toxicWords || []
    
    if (toxicWords.includes(word)) {
        return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Kata \`${word}\`Ya está en la lista.`)
    }
    
    toxicWords.push(word)
    db.setGroup(m.chat, { toxicWords })
    
    m.react('✅')
    
    await m.reply(
        `✅ *ᴋᴀᴛᴀ ᴛᴏxɪᴄ ᴅɪᴛᴀᴍʙᴀʜ*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ 📝 ᴋᴀᴛᴀ: \`${word}\`\n` +
        `┃ 📊 ᴛᴏᴛᴀʟ: \`${toxicWords.length}\` kata\n` +
        `╰┈┈⬡`
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

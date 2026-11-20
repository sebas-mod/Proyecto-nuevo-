"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _antitoxicjs = require('./antitoxic.js');
const pluginConfig = {
    name: 'listtoxic',
    alias: ['toxiclist', 'katatoxic', 'lihatkata'],
    category: 'group',
    description: 'Lihat daftar kata toxic',
    usage: '.listtoxic',
    example: '.listtoxic',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = _almikudatabasejs.getDatabase.call(void 0, )
    const groupData = db.getGroup(m.chat) || {}
    
    const customWords = groupData.toxicWords || []
    const defaultWords = _antitoxicjs.DEFAULT_TOXIC_WORDS || []
    
    let text = `📋 *ᴅᴀꜰᴛᴀʀ ᴋᴀᴛᴀ ᴛᴏxɪᴄ*\n\n`
    
    if (customWords.length > 0) {
        text += `╭┈┈⬡「 ✏️ *ᴄᴜsᴛᴏᴍ* (${customWords.length}) 」\n`
        for (let i = 0; i < customWords.length; i++) {
            text += `┃ ${i + 1}. ${customWords[i]}\n`
        }
        text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    }
    
    text += `╭┈┈⬡「 📦 *ᴅᴇꜰᴀᴜʟᴛ* (${defaultWords.length}) 」\n`
    
    for (let i = 0; i < defaultWords.length; i++) {
        text += `┃ ${i + 1}. ${defaultWords[i]}\n`
    }
    text += `╰┈┈┈┈┈┈┈┈⬡\n\n`
    
    text += `Total: *${customWords.length + defaultWords.length}* kata\n`
    text += `\`Addto.xic<kata>\`para anade\n`
    text += `\`- Delto.xic<kata>\`para elimina`
    
    await m.reply(text)
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

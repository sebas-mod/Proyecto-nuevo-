"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _almikudatabasejs = require('../../src/lib/almiku-database.js');
const pluginConfig = {
    name: 'similarity',
    alias: ['setsimilarity', 'sim'],
    category: 'owner',
    description: 'Características de similitud ( sans typo )',
    usage: '.similarity <on/off>',
    example: '.similarity on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = _almikudatabasejs.getDatabase.call(void 0, )
    const args = m.args
    
    if (!args[0]) {
        return m.reply(`⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n> \`.similarity on\` - Aktifkan\n> \`.similarity off\` - Matikan`)
    }
    
    const mode = args[0].toLowerCase()
    
    if (mode === 'on') {
        db.setting('similarity', true)
        await m.react('✅')
        await m.reply(`✅*ᴜᴋSᴇs •\n\n*El comando de la similitud característica*`)
    } else if (mode === 'off') {
        db.setting('similarity', false)
        await m.react('✅')
        await m.reply(`✅*ᴜᴋSᴇs •\n\n*El mismo comando de similitud*`)
    } else {
        return m.reply(`⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n> \`.similarity on\` - Aktifkan\n> \`.similarity off\` - Matikan`)
    }
    
    await db.save()
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

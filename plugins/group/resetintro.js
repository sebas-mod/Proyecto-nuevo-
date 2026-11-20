"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _introjs = require('./intro.js');
const pluginConfig = {
    name: 'resetintro',
    alias: ['introdel', 'delintro', 'deleteintro'],
    category: 'group',
    description: 'Retablecer intro grupo a predeterminado ( administrador solamente )',
    usage: '.resetintro',
    example: '.resetintro',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true
}

async function handler(m) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const groupData = db.getGroup(m.chat) || db.setGroup(m.chat)
    
    if (!groupData.intro) {
        return m.reply(`❌¡Este Grupo ha utilizado el defecto de entrada!`)
    }
    
    delete groupData.intro
    db.setGroup(m.chat, groupData)
    db.save()
    
    await m.reply(
        `✅ *ɪɴᴛʀᴏ ᴅɪʀᴇsᴇᴛ!*\n` +
        `Intro grupo regresswa predeterminado.\n\n` +
        `Escribe *${m.prefix}Introducción para ver los resultados.`
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

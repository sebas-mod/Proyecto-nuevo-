"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
    name: 'resetrulesgrup',
    alias: ['resetgrouprules'],
    category: 'group',
    description: 'Reiniciar reglas grupo a predeterminado ( administrador solamente )',
    usage: '.resetrulesgrup',
    example: '.resetrulesgrup',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    
    db.setGroup(m.chat, { groupRules: null })
    
    m.reply(
        `✅ *ɢʀᴜᴘ ʀᴜʟᴇs ᴅɪʀᴇsᴇᴛ*\n` +
        `¡Las reglas del grupo lograron reasentarse a la predeterminación!\n` +
        `Escribe\`${m.prefix}rulesgrup\`para ver.`
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

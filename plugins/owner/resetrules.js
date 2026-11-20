"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
    name: 'resetrules',
    alias: ['resetbotrules'],
    category: 'owner',
    description: 'Reset rules bot ke default',
    usage: '.resetrules',
    example: '.resetrules',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    
    db.setting('botRules', null)
    
    m.reply(
        `✅ *ʙᴏᴛ ʀᴜʟᴇs ᴅɪʀᴇsᴇᴛ*\n\n` +
        `> Rules bot berhasil direset ke default!\n` +
        `> Ketik \`${m.prefix}rules\` untuk melihat.`
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
    name: 'mute',
    alias: ['bisukan'],
    category: 'group',
    description: 'Establece un grupo entero (sólo el administrador puede enviar un mensaje )',
    usage: '.mute',
    example: '.mute',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const group = db.getGroup(m.chat) || {}
    const groupName = m.groupMetadata.subject

    if (group.mute) return m.reply('❌Grup \'s in a state of mute.')

    db.setGroup(m.chat, { ...group, mute: true })
    m.reply(`✅Grupo *${groupName}* Sucesivamente en - mute by @${m.sender.split('@')[0]}\n\nSólo el administrador puede enviar un mensaje.\nEscribe *${m.prefix}Para reabrir.`, { mentions: [m.sender] })
}

function isMuted(groupJid, db) {
    const group = db.getGroup(groupJid) || {}
    return !!group.mute
}

exports.config = pluginConfig; exports.handler = handler; exports.isMuted = isMuted;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

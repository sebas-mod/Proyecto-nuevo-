"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _almikudatabasejs = require('../../src/lib/almiku-database.js');
const pluginConfig = {
    name: 'unmute',
    alias: ['unbisukan'],
    category: 'group',
    description: 'Batir el mudo del grupo',
    usage: '.unmute',
    example: '.unmute',
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
    const db = _almikudatabasejs.getDatabase.call(void 0, )
    const group = db.getGroup(m.chat) || {}
    const groupName = m.groupMetadata.subject

    if (!group.mute) return m.reply('❌Grup \'s not in a mute.')

    db.setGroup(m.chat, { ...group, mute: false })
    m.reply(`✅Grupo *${groupName}* Éxito en -un minuto por @${m.sender.split('@')[0]}\n\nTodas las fotos pueden enviar ahora un mensaje.`, { mentions: [m.sender] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

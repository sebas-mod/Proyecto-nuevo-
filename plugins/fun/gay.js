"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
    name: 'gay',
    alias: ['howgay'],
    category: 'fun',
    description: 'Mostrar las fotos más gay en grupo',
    usage: '.gay',
    isGroup: true,
    isBotAdmin: false,
    isAdmin: false,
    cooldown: 10,
    energi: 2,
    isEnabled: true
};

async function handler(m, { sock }) {
    if (!m.isGroup) return m.reply(_configjs2.default.messages.groupOnly);
    const groupMetadata = m.groupMetadata;
    const participants = groupMetadata.participants;
    const member = participants.map(u => u.jid);
    const orang1 = member[Math.floor(Math.random() * member.length)];
    const orang2 = member[Math.floor(Math.random() * member.length)];
    const text = `@${orang1.split('@')[0]}* Nge gay same * @${orang2.split('@')[0]}`;
    await m.reply(text, { mentions: [orang1, orang2] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

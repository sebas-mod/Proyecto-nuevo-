"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'bratvid2',
    alias: ['bratv2'],
    category: 'sticker',
    description: 'Generate brat video v2',
    usage: '.bratvid2 <text>',
    example: '.bratvid2 hello world',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.args.join(' ')
    
    if (!text) {
        return m.reply(`🎬 *ʙʀᴀᴛ ᴠɪᴅᴇᴏ ᴠ2*\n\n> Masukkan teks\n\n\`Contoh: ${m.prefix}bratvid2 hello world\``)
    }
    
    m.react('🕕')
    
    try {
        const url = `https://api-faa.my.id/faa/bratvid?text=${encodeURIComponent(text)}`
        await sock.sendVideoAsSticker(m.chat, url, m, {
            packname: _configjs2.default.sticker.packname,
            author: _configjs2.default.sticker.author
        })
        m.react('✅')
    } catch (error) {
        m.react('☢')
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

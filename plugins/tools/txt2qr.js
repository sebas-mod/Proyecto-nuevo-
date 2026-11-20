"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
    name: 'txt2qr',
    alias: ['texttoqr', 'qrcode', 'qrcreate'],
    category: 'tools',
    description: 'GenerarQCódigo de texto R',
    usage: '.txt2qr <text>',
    example: '.txt2qr https://google.com',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.args.join(' ')
    
    if (!text) {
        return m.reply(`📱*ᴛᴇxᴛ ᴛᴏ Qʀ*\n\n> Introduce texto/URL\n\n\`Ejemplo:${m.prefix}txt2qr https://google.com\``)
    }
    
    m.react('📱')
    
    try {
        const url = `https://api-faa.my.id/faa/qr-create?text=${encodeURIComponent(text)}`
        const res = await _axios2.default.get(url, {
            responseType: 'arraybuffer',
            timeout: 30000
        })
        
        m.react('✅')
        
        await sock.sendMessage(m.chat, {
            image: Buffer.from(res.data),
            caption: `📱 *Qʀ ᴄᴏᴅᴇ*\n\n> ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`
        }, { quoted: m })
        
    } catch (error) {
        m.react('☢')
        m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

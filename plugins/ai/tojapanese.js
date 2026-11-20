"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourinuploaderjs = require('../../src/lib/ourin-uploader.js');
var _ourinhttpjs = require('../../src/lib/ourin-http.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'tojapanese',
    alias: ['japanese', 'japanesestyle'],
    category: 'ai',
    description: 'Editar imagen al estilo japonés',
    usage: '.tojapanese (reply gambar)',
    example: '.tojapanese',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 2,
    isEnabled: true
}

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && m.quoted.type === 'imageMessage')
    
    if (!isImage) {
        return m.reply(`🎌*ᴊᴀᴘᴀɴᴇSᴇSᴛʏʟᴇ*\n\n# Ksena / respuestas imágenes para convertir a estilo japonés\n\n\`${m.prefix}tojapanese\``)
    }
    
    m.react('🕕')
 
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            m.react('❌')
            return m.reply(`❌Paso de descarga de imagen`)
        }
        
        const imageUrl = await _ourinuploaderjs.uploadImage.call(void 0, buffer, 'image.jpg')
        
        const url = `https://api-faa.my.id/faa/tojapanese?url=${encodeURIComponent(imageUrl)}`
        const res = await _ourinhttpjs.f.call(void 0, url, 'arrayBuffer')
        
        m.react('✅')
        
        await sock.sendMedia(m.chat, Buffer.from(res), null, m, {
            type: 'image',
        })
        
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

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _almikuuploaderjs = require('../../src/lib/almiku-uploader.js');
var _almikuhttpjs = require('../../src/lib/almiku-http.js');
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
    name: 'tofigure',
    alias: ['figure', 'figurestyle'],
    category: 'ai',
    description: 'Editar imagen a la Figura / Acción',
    usage: '.tofigure (reply gambar)',
    example: '.tofigure',
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
        return m.reply(`🎭*ꜰɪɢᴜʀᴇSᴛʏʟᴇ*\n\nâ a Ksently / réplica imágenes para convertir a estilo Figura\n\n\`${m.prefix}tofigure\``)
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
        
        const imageUrl = await _almikuuploaderjs.uploadImage.call(void 0, buffer, 'image.jpg')
        
        const apiUrl = `https://api-faa.my.id/faa/tofigura?url=${encodeURIComponent(imageUrl)}`
        const res = await _axios2.default.get(apiUrl, { responseType: 'arraybuffer' })
        
        m.react('✅')
        
        await sock.sendMedia(m.chat, Buffer.from(res.data), null, m, {
            type: 'image',
        })
        
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

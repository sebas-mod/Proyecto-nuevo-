"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _almikuuploaderjs = require('../../src/lib/almiku-uploader.js');
var _almikuhttpjs = require('../../src/lib/almiku-http.js');
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _seaartjs = require('../../src/scraper/seaart.js');
const pluginConfig = {
    name: 'tochibi',
    alias: ['chibi', 'chibistyle'],
    category: 'ai',
    description: 'Editar imagen a Chibi graple',
    usage: '.tochibi (reply gambar)',
    example: '.tochibi',
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
        return m.reply(`🎀*ᴄʜɪʙɪSᴛʏʟᴇ*\n\n# Ksently / réplica imágenes para convertir a Chibi estilo\n\n\`${m.prefix}tochibi\``)
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

        const PROMPT = `Transform into chibi style, big head and small body proportions, cute expression, big sparkling eyes, smooth shading, soft lighting, highly detailed, high quality`
        
        const result = await _seaartjs.live3d.call(void 0, buffer, PROMPT)
        
        m.react('✅')
        
        await sock.sendMedia(m.chat, result.image, null, m, {
            type: 'image'
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

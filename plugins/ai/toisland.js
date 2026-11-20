"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _seaartjs = require('../../src/scraper/seaart.js');
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);

const pluginConfig = {
    name: 'toisland',
    alias: ['island', 'tropical'],
    category: 'ai',
    description: 'Convierte una foto a ambiente de isla tropical',
    usage: '.toisland (reply/kirim gambar)',
    example: '.toisland',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 3,
    isEnabled: true
}

const PROMPT = `Transform this image into a tropical island scene. 
Place the subject in a beautiful island environment with clear blue ocean, palm trees, and warm sunlight. 
Add realistic lighting, shadows, and vibrant tropical colors. 
Keep the original identity, high detail, cinematic, photorealistic.`

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && (m.quoted.isImage || m.quoted.type === 'imageMessage'))
    
    if (!isImage) {
        return m.reply(
            `🏝️ *ᴛᴏ ɪsʟᴀɴᴅ*\n\n` +
            `Respondé a una imagen para aplicarle el estilo isla\n\n` +
            `\`${m.prefix}toisland\``
        )
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
        
        const result = await _seaartjs.live3d.call(void 0, buffer, PROMPT)
        
        m.react('✅')
        
        await sock.sendMedia(m.chat, result.image, null, m, {
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

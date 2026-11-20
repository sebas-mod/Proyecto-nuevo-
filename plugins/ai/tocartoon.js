"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _seaartjs = require('../../src/scraper/seaart.js');
const pluginConfig = {
    name: 'tocartoon',
    alias: ['cartoon', 'cartoonify', 'tooncartoon'],
    category: 'ai',
    description: 'Convierte una foto a estilo dibujo animado',
    usage: '.tocartoon (reply/kirim gambar)',
    example: '.tocartoon',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 60,
    energi: 3,
    isEnabled: true
}

const PROMPT = `Transform this image into a vibrant cartoon style like Disney or Pixar animation. 
Apply bold colors, smooth shading, exaggerated features, and that playful cartoon aesthetic. 
Keep the original composition but make it look like a frame from an animated movie with 
clean lines, expressive faces, and bright cheerful colors.`

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && (m.quoted.isImage || m.quoted.type === 'imageMessage'))
    
    if (!isImage) {
        return m.reply(
            `🎬 *ᴛᴏ ᴄᴀʀᴛᴏᴏɴ*\n\n` +
            `Respondé a una imagen para convertirla a dibujo animado\n\n` +
            `\`${m.prefix}tocartoon\``
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

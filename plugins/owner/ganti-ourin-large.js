"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'ourin-large',
    alias: ['setourinlarge', 'gantiourinlarge'],
    category: 'owner',
    description: 'Preset: Cambia image ourin. Jpg, serta ourin - v7 horange ourin - v11. Jpg una vez',
    usage: '.ourin-large (responde o envía una imagen)',
    example: '.ourin-large',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && m.quoted.type === 'imageMessage')
    
    if (!isImage) {
        return m.reply(`🖼ᴏᴜʀɪɴ ʟᴀʀɢᴇ ᴘʀᴇSᴇᴛ*\n\nEscoger / responder imágenes para reemplazar grandes fotos ( ourin. jpg, ourin - v8. jpg, ourin - v10.\nSólo asegúrate de que la imagen sea deseada.`)
    }
    
    await m.react('🕕')
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            await m.react('❌')
            return m.reply(`❌Paso de descarga de imagen`)
        }
        
        const targetImages = [
            'ourin.jpg',
            'ourin-v8.jpg',
            'ourin-v10.jpg'
        ]
        
        const assetsDir = _path2.default.join(process.cwd(), 'assets', 'images')
        if (!_fs2.default.existsSync(assetsDir)) {
            _fs2.default.mkdirSync(assetsDir, { recursive: true })
        }
        
        for (const imgName of targetImages) {
            const targetPath = _path2.default.join(assetsDir, imgName)
            _fs2.default.writeFileSync(targetPath, buffer)
        }
        
        await m.react('✅')
        m.reply(`✅*ʙᴇʀʜᴀSɪʟ*\n\nA Imagen-grande, sustituido con éxito de una manera que ' no es posible.\n# Crashing:${targetImages.join(', ')}\nReinicie el bot si el cuadro no cambia.`)
        
    } catch (error) {
        await m.react('☢')
        await m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

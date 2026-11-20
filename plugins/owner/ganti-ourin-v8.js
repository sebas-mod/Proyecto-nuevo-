"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourinuploaderjs = require('../../src/lib/ourin-uploader.js');
const pluginConfig = {
    name: 'ganti-ourin-v8.jpg',
    alias: ['gantiourinv8', 'setourinv8'],
    category: 'owner',
    description: 'Imagen Cambia ourin - v8.',
    usage: '.ganti-ourin-v8.jpg (reply/kirim gambar)',
    example: '.ganti-ourin-welcome.jpg',
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
        return m.reply(`🖼ɢᴀɴᴛɪ ᴏᴜʀɪɴ-ᴠOcho.ᴊᴘɢ*\n\n# Ksently / réplica imágenes para reemplazar\nâ a Archivo: activos / imágenes / ourin - v9.`)
    }
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            return m.reply(`❌Paso de descarga de imagen`)
        }
        
        await m.reply(`⏳La jaula subió una foto..`)
        try {
            const newUrl = await _ourinuploaderjs.updateAssetUrl.call(void 0, 'ourin-v8', buffer, 'ourin-v8.jpg')
            m.reply(`✅*ʙᴇʀʜᴀSɪʟ*\n\nEstoGambar ourin - v8. Jpg se ha convertido en una nueva URL:\n•${newUrl}\n" Config has been updated as a reality "!`)
        } catch (e) {
            m.reply(`❌Gagalm subió la imagen:${e.message}`)
        }
    } catch (error) {
        await m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

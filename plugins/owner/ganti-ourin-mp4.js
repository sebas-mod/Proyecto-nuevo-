"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourinuploaderjs = require('../../src/lib/ourin-uploader.js');
const pluginConfig = {
    name: 'ganti-ourin.mp4',
    alias: ['gantiourinvideo', 'setourinvideo'],
    category: 'owner',
    description: 'Ganti video ourin.mp4',
    usage: '.ganti-ourin.mp4 (reply/kirim video)',
    example: '.ganti-ourin.mp4',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const isVideo = m.type === 'videoMessage' || (m.quoted && m.quoted.type === 'videoMessage')
    
    if (!isVideo) {
        return m.reply(`🎬*ɢᴀɴᴛɪ ᴏᴜʀɪɴ.ᴍᴘ4 *\n\nKsena / respuesta vídeo para reemplazar\nâ a Archivo: activos / video / ourin. â a mp4 â a`)
    }
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            return m.reply(`❌Video de descarga de descargas`)
        }
        
        await m.reply(`⏳La jaula subió una foto..`)
        try {
            const newUrl = await _ourinuploaderjs.updateAssetUrl.call(void 0, 'ourin-mp4', buffer, 'ourin.mp4')
            m.reply(`✅*ʙᴇʀʜᴀSɪʟ*\n\n" Archivo ourin. ". " mp4 has been transferred to the new URL:\n•${newUrl}\n" Config has been updated as a reality "!`)
        } catch (e) {
            m.reply(`❌Archivo cargado de Gagalm:${e.message}`)
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

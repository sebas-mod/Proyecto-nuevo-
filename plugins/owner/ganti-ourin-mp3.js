"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourinuploaderjs = require('../../src/lib/ourin-uploader.js');
const pluginConfig = {
    name: 'ganti-ourin.mp3',
    alias: ['gantiourinaudio', 'setourinaudio'],
    category: 'owner',
    description: 'Ganti audio ourin.mp3',
    usage: '.ganti-ourin.mp3 (reply/kirim audio)',
    example: '.ganti-ourin.mp3',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const isAudio = m.type === 'audioMessage' || (m.quoted && m.quoted.type === 'audioMessage')
    
    if (!isAudio) {
        return m.reply(`🎵*ɢᴀɴᴛɪ ᴏᴜʀɪɴ.ᴍᴘ3 *\n\nKsena / respuesta audio para reemplazar\nâ a Archivo: activos / audio / nuestroin. â a`)
    }
    
    try {
        let buffer
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download()
        } else if (m.isMedia) {
            buffer = await m.download()
        }
        
        if (!buffer) {
            return m.reply(`❌Descarga pegajosa audios`)
        }
        
        await m.reply(`⏳La jaula subió una foto..`)
        try {
            const newUrl = await _ourinuploaderjs.updateAssetUrl.call(void 0, 'ourin-mp3', buffer, 'ourin.mp3')
            m.reply(`✅*ʙᴇʀʜᴀSɪʟ*\n\nEz Archivo ourin. MP3 ha sido transferido a la nueva URL:\n•${newUrl}\n" Config has been updated as a reality "!`)
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

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _almikuuploaderjs = require('../../src/lib/almiku-uploader.js');
const pluginConfig = {
    name: 'ganti-almiku.mp4',
    alias: ['gantialmikuvideo', 'setalmikuvideo'],
    category: 'owner',
    description: 'Ganti video almiku.mp4',
    usage: '.ganti-almiku.mp4 (responde o envía un video)',
    example: '.ganti-almiku.mp4',
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
        return m.reply(`🎬*ɢᴀɴᴛɪ ᴀʟ ᴍɪᴋᴜ.ᴍᴘ4 *\n\nKsena / respuesta vídeo para reemplazar\nâ a Archivo: activos / video / almiku. â a mp4 â a`)
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
            const newUrl = await _almikuuploaderjs.updateAssetUrl.call(void 0, 'almiku-mp4', buffer, 'almiku.mp4')
            m.reply(`✅*ʙᴇʀʜᴀSɪʟ*\n\n" Archivo almiku. ". " mp4 has been transferred to the new URL:\n•${newUrl}\n" Config has been updated as a reality "!`)
        } catch (e) {
            m.reply(`❌Archivo cargado de Gagalm:${e.message}`)
        }
    } catch (error) {
        await m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

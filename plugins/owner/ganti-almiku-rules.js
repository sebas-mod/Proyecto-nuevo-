"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _almikuuploaderjs = require('../../src/lib/almiku-uploader.js');
const pluginConfig = {
    name: 'ganti-almiku-rules.jpg',
    alias: ['gantirules', 'setalmikurules'],
    category: 'owner',
    description: 'Imagen Cambia nuestrain - reglas.',
    usage: '.ganti-almiku-rules.jpg (responde o envía una imagen)',
    example: '.ganti-almiku-rules.jpg',
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
        return m.reply(`🖼ɢᴀɴᴛɪ ᴀʟ ᴍɪᴋᴜ-ʀᴜʟᴇs.ᴊᴘɢ*\n\n# Ksently / réplica imágenes para reemplazar\nArchivo: activos / imágenes / nuestroin - reglas.`)
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
            const newUrl = await _almikuuploaderjs.updateAssetUrl.call(void 0, 'almiku-rules', buffer, 'almiku-rules.jpg')
            m.reply(`✅*ʙᴇʀʜᴀSɪʟ*\n\nEstoGambar almiku - reglas. Jpg ha sido transferido a la nueva URL:\n•${newUrl}\n" Config has been updated as a reality "!`)
        } catch (e) {
            m.reply(`❌Gagalm subió la imagen:${e.message}`)
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

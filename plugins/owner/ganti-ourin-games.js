"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourinuploaderjs = require('../../src/lib/ourin-uploader.js');
const pluginConfig = {
    name: 'ganti-ourin-games.jpg',
    alias: ['gantigames', 'setouringames'],
    category: 'owner',
    description: 'Imagen Cambia nuestrain @-@ juegos.',
    usage: '.ganti-ourin-games.jpg (reply/kirim gambar)',
    example: '.ganti-ourin-games.jpg',
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
        return m.reply(`🖼♪ɢᴀɴᴛɪ ᴏᴜʀɪɴ-ɢᴀᴍᴇs.ᴊᴘɢ*\n\n# Ksently / réplica imágenes para reemplazar\nArchivo: activos / imágenes / nuestroin - juegos.`)
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
            const newUrl = await _ourinuploaderjs.updateAssetUrl.call(void 0, 'ourin-games', buffer, 'ourin-games.jpg')
            m.reply(`✅*ʙᴇʀʜᴀSɪʟ*\n\nPara Imagen ourin @-@ juegos. Jpg ha sido transferido a la nueva URL:\n♪${newUrl}\n" Config has been updated as a reality "!`)
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

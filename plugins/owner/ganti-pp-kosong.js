"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _almikuuploaderjs = require('../../src/lib/almiku-uploader.js');
const pluginConfig = {
    name: 'ganti-pp-kosong.jpg',
    alias: ['gantippkosong', 'setppkosong'],
    category: 'owner',
    description: 'Pp vacio dibujo Cambia.',
    usage: '.ganti-pp-kosong.jpg (responde o envía una imagen)',
    example: '.ganti-pp-kosong.jpg',
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
    if (!isImage) return m.reply(`🖼ɢᴀɴᴛɪPP-Vacio.JPG*\n\n# Ksently / réplica imágenes para reemplazar\nâ a Archivo: activos / imágenes / pp vacio.`)
    try {
        let buffer = m.quoted && m.quoted.isMedia ? await m.quoted.download() : await m.download()
        if (!buffer) return m.reply('❌Paso de descarga de imagen')
        await m.reply(`⏳La jaula subió una foto..`)
        try {
            const newUrl = await _almikuuploaderjs.updateAssetUrl.call(void 0, 'pp-kosong', buffer, 'pp-kosong.jpg')
            m.reply(`✅*ʙᴇʀʜᴀSɪʟ*\n\nJpg se ha convertido en una nueva URL:\n•${newUrl}\n" Config has been updated as a reality "!`)
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

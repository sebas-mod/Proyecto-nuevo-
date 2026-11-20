"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _almikuuploaderjs = require('../../src/lib/almiku-uploader.js');
const pluginConfig = {
    name: 'ganti-almiku-demote.jpg',
    alias: ['gantialmikudemote', 'setalmikudemote'],
    category: 'owner',
    description: 'Cambia la imagen de almiku-demote del bot.',
    usage: '.ganti-almiku-demote.jpg (responde o envía una imagen)',
    example: '.ganti-almiku-demote.jpg',
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
    if (!isImage) return m.reply(`🖼 *Cambiar almiku-demote*

Respondé a una imagen o enviá una foto para reemplazarla.`)
    try {
        let buffer = m.quoted && m.quoted.isMedia ? await m.quoted.download() : await m.download()
        if (!buffer) return m.reply('❌ No se pudo descargar el archivo.')
        await m.reply(`⏳ Subiendo el archivo nuevo...`)
        try {
            const newUrl = await _almikuuploaderjs.updateAssetUrl.call(void 0, 'almiku-demote', buffer, 'almiku-demote.jpg')
            m.reply(`✅ *Listo*

El archivo almiku-demote fue actualizado.
•${newUrl}
¡La configuración ya quedó guardada!`)
        } catch (e) {
            m.reply(`❌ No se pudo subir el archivo: ${e.message}`)
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

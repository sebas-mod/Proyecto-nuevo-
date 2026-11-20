"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
    name: 'almiku-large',
    alias: ['setalmikularge', 'gantialmikularge'],
    category: 'owner',
    description: 'Cambia la imagen de almiku del bot.',
    usage: '.almiku-large (responde o envía una imagen)',
    example: '.almiku-large',
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
        return m.reply(`🖼 *Cambiar almiku*

Respondé a una imagen o enviá una foto para reemplazarla.`)
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
            return m.reply(`❌ No se pudo subir el archivo: ${e.message}`)
        }
        
        const targetImages = [
            'almiku.jpg',
            'almiku-v8.jpg',
            'almiku-v10.jpg'
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
        m.reply(`✅ *Listo*

El archivo almiku fue actualizado.
•${newUrl}
¡La configuración ya quedó guardada!`)
        
    } catch (error) {
        await m.react('☢')
        await m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

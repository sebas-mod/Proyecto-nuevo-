"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _video = require('brat-canvas/video');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _os = require('os'); var _os2 = _interopRequireDefault(_os);

const pluginConfig = {
    name: 'bratvid',
    alias: ['bratgif', 'bratvideo'],
    category: 'sticker',
    description: 'Membuat sticker brat animated',
    usage: '.bratvid <text>',
    example: '.bratvid Hai semua',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.args.join(' ')
    if (!text) {
        return m.reply(`🎬*ʙʀᴀᴛ ᴀɴɪᴍᴀᴛᴇᴅ*\n\n*Pon los mensajes*\n\n\`Ejemplo:${m.prefix}*Todo lo que queda de ella*\``)
    }
    
    m.react('🕕')
    
    try {
        const tempFile = _path2.default.join(_os2.default.tmpdir(), `brat-${Date.now()}.webp`)
        const url = await _video.bratVid.call(void 0, text, {
            outputFormat: 'mp4',
        })
        await _fs2.default.promises.writeFile(tempFile, url)
        await sock.sendVideoAsSticker(m.chat, tempFile, m, {
            packname: _configjs2.default.sticker.packname,
            author: _configjs2.default.sticker.author
        })
        await _fs2.default.promises.unlink(tempFile)
        m.react('✅')
    } catch (error) {
        m.react('☢')
        m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

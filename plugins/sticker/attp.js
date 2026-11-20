"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinexifjs = require('../../src/lib/ourin-exif.js');
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinhttpjs = require('../../src/lib/ourin-http.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const NEOXR_APIKEY = _optionalChain([_configjs2.default, 'access', _ => _.APIkey, 'optionalAccess', _2 => _2.neoxr]) || 'Millik - Eurinprobable'
const pluginConfig = {
    name: 'attp',
    alias: ['attp2', 'attp3'],
    category: 'sticker',
    description: 'Membuat sticker animated text',
    usage: '.attp <teks>',
    example: '.attp Hello World',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}
function getRandomColor() {
    const colors = ['FF5733', 'C70039', '900C3F', '581845', '2E86AB', 'A23B72', 'F18F01', 'C73E1D', '3A0CA3', '7209B7', '4361EE', '4CC9F0']
    return colors[Math.floor(Math.random() * colors.length)]
}
async function handler(m, { sock }) {
    let text = _optionalChain([m, 'access', _3 => _3.text, 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()])
    if (!text && _optionalChain([m, 'access', _6 => _6.quoted, 'optionalAccess', _7 => _7.text])) {
        text = m.quoted.text.trim()
    }
    if (!text) {
        return m.reply(
            `🎨 *ᴀɴɪᴍᴀᴛᴇᴅ ᴛᴇxᴛ sᴛɪᴄᴋᴇʀ*\n\n` +
            `*Pon los textos para pegatinas*\n\n` +
            `> Ejemplo:\`${m.prefix}attp Hello World\``
        )
    }
    if (text.length > 100) {
        return m.reply(`❌Las pruebas son demasiado largas! 100 caracteres al máximo.`)
    }
    m.react('🕕')
    try {
        const color = getRandomColor()
        const url = `https://api.neoxr.eu/api/attp3?text=${encodeURIComponent(text)}&color=${color}&apikey=${NEOXR_APIKEY}`
        const data = await _ourinhttpjs.f.call(void 0, url)
        if (!_optionalChain([data, 'optionalAccess', _8 => _8.status]) || !_optionalChain([data, 'optionalAccess', _9 => _9.data, 'optionalAccess', _10 => _10.url])) {
            throw new Error('API no devolvió datos válidos')
        }
        const stickerUrl = data.data.url
        const stickerRes = await _ourinhttpjs.f.call(void 0, stickerUrl, 'buffer')
        if (!stickerRes) throw new Error('Steenace descarga pegatinas del servidor')
        let finalSticker = stickerRes
        try {
            finalSticker = await _ourinexifjs.addExifToWebp.call(void 0, stickerRes, {
                packname: _configjs2.default.sticker.packname,
                author: _configjs2.default.sticker.author
            })
        } catch (e) {
            console.log('Exif error:', e)
        }
        await sock.sendMessage(m.chat, { sticker: finalSticker }, { quoted: m })
        m.react('✅')
    } catch (err) {
        m.react('☢')
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}
exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

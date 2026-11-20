"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _formdata = require('form-data'); var _formdata2 = _interopRequireDefault(_formdata);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: ['qrcustom', 'qrcode', 'qr'],
    alias: [],
    category: 'tools',
    description: 'GenerarQCódigo R personalizado con logo',
    usage: '.qrcustom <url>',
    example: '.qrcustom https://wa.me/628xxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

const BASE_URL = 'https://api.denayrestapi.xyz'

async function uploadTo0x0(buffer) {
    try {
        const form = new (0, _formdata2.default)()
        form.append('file', buffer, { filename: 'logo.png', contentType: 'image/png' })
        
        const response = await _axios2.default.post('https://c.termai.cc/api/upload?key=AIzaBj7z2z3xBjsk', form, {
            headers: form.getHeaders(),
            timeout: 30000
        })
        
        if (_optionalChain([response, 'access', _ => _.data, 'optionalAccess', _2 => _2.status]) === 'success' && _optionalChain([response, 'access', _3 => _3.data, 'optionalAccess', _4 => _4.files, 'optionalAccess', _5 => _5[0], 'optionalAccess', _6 => _6.url])) {
            return response.data
        }
        return null
    } catch (e) {
        return null
    }
}

async function handler(m, { sock }) {
    const data = _optionalChain([m, 'access', _7 => _7.text, 'optionalAccess', _8 => _8.trim, 'call', _9 => _9()])
    
    if (!data) {
        return m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> \`${m.prefix}qrcustom <url/text>\`\n\n` +
            `*Ejemplo:*\n` +
            `> \`${m.prefix}qrcustom https://wa.me/628xxx\`\n\n` +
            `💡Imagen de respuesta para logotipo personalizado en el centroQR`
        )
    }
    
    await m.reply(`🕕 *Generating QR code...*`)
    
    try {
        let imageUrl = ''
        
        if (m.isImage) {
            const buffer = await m.download()
            imageUrl = await uploadTo0x0(buffer) || ''
        } else if (_optionalChain([m, 'access', _10 => _10.quoted, 'optionalAccess', _11 => _11.isImage])) {
            const buffer = await m.quoted.download()
            imageUrl = await uploadTo0x0(buffer) || ''
        }
        
        const params = new URLSearchParams({
            data: data,
            type: 'png',
            size: '300'
        })
        
        if (imageUrl) {
            params.append('image', imageUrl)
        }
        
        const apiUrl = `${BASE_URL}/api/v1/tools/qrcustom?${params.toString()}`
        
        await sock.sendMessage(m.chat, {
            image: { url: apiUrl },
            caption: `📱 *QR Code*\n> ${data.substring(0, 50)}${data.length > 50 ? '...' : ''}`
        }, { quoted: m })
        
        m.react('📱')
        
    } catch (err) {
        m.react('☢')
        return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

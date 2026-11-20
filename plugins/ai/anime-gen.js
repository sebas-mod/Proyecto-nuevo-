"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinhttpjs = require('../../src/lib/ourin-http.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'anime-gen',
    alias: ['animegen', 'aianimegen', 'genai-anime'],
    category: 'ai',
    description: 'Generar arte de anime AI del impulso',
    usage: '.anime-gen <prompt>',
    example: '.anime-gen girl, vibrant color, smilling',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const prompt = m.text
    
    if (!prompt) {
        return m.reply(
            `🎨 *ᴀɴɪᴍᴇ ᴀʀᴛ ɢᴇɴᴇʀᴀᴛᴏʀ*\n\n` +
            `# Generar imagen anime AI del impulso!\n\n` +
            `*ᴄᴀʀᴀ ᴘᴀᴋᴀɪ:*\n` +
            `> \`${m.prefix}anime-gen <deskripsi>\`\n\n` +
            `*ᴄᴏɴᴛᴏʜ:*\n` +
            `> \`${m.prefix}anime-gen girl, vibrant color, smilling, yellow pink gradient hair\`\n` +
            `> \`${m.prefix}anime-gen boy, dark aesthetic, silver hair, red eyes\`\n\n` +
            `*ᴛɪᴘs:*\n` +
            `♪•Uso del idioma inglés\n` +
            `♪•Hacer el detalle rápido, hacer buen uso\n` +
            `♪•Añadir grapa: vibrante, con estrellas, pastel, etc`
        )
    }
    
    m.react('🕕')

    try {
        const NEOXR_APIKEY = _optionalChain([_configjs2.default, 'access', _ => _.APIkey, 'optionalAccess', _2 => _2.neoxr]) || 'Millik - Eurinprobable'
        const apiUrl = `https://api.neoxr.eu/api/ai-anime?q=${encodeURIComponent(prompt)}&apikey=${NEOXR_APIKEY}`
        
        const data = await _ourinhttpjs.f.call(void 0, apiUrl)
        
        if (!_optionalChain([data, 'optionalAccess', _3 => _3.status]) || !_optionalChain([data, 'optionalAccess', _4 => _4.data, 'optionalAccess', _5 => _5.url])) {
            m.react('❌')
            return m.reply('❌*ɢᴀɢᴀʟ*\n\n¡Inténtalo de nuevo más tarde!')
        }
        
        const result = data.data  
        await sock.sendMedia(m.chat, result.url, null, m, {
            type: 'image'
        })
        m.react('✅')
    } catch (error) {
        m.react('☢')
        if (error.code === 'ECONNABORTED') {
            m.reply('⏱️ *ᴛɪᴍᴇᴏᴜᴛ*\n\n> Request terlalu lama. Coba lagi!')
        } else {
            m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
        }
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

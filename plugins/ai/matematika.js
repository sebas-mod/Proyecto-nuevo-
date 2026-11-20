"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

const pluginConfig = {
    name: 'matematika',
    alias: ['mathgpt', 'math', 'mathsolver'],
    category: 'ai',
    description: 'AI para completar la ciencia matemática',
    usage: '.matematika <soal>',
    example: '.matematika 2+2 berapa?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.args.join(' ')

    if (!text) {
        return m.reply(`📐*ᴍᴀᴛʜ ɢᴘᴛ*\n\nPon el canal de matemáticas en.\n\n\`Ejemplo:${m.prefix}¿Cuál es la matemática de 2 + 2?\``)
    }

    m.react('🕕')

    try {
        const url = `https://api.nexray.eu.cc/ai/mathgpt?text=${encodeURIComponent(text)}`
        
        const { data } = await _axios2.default.get(url, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
            }
        })

        if (!data.status || !data.result) {
            await m.react('❌')
            return m.reply("⚠Para procesar matemáticas.")
        }

        const answer = data.result

        m.react('✅')
        await m.reply(`${answer}`)

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

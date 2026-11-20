"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);

const pluginConfig = {
  name: 'text2img2',
  alias: ['t2i2', 'genimg'],
  category: 'ai',
  description: 'Generate image from text using AI',
  usage: '.text2img2 <prompt>',
  example: '.text2img2 a futuristic city in mars',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 5,
  isEnabled: true,
}

async function handler(m, { sock }) {
  if (!m.fullArgs) return m.reply(`Por favor, introduzca el aviso.\nEjemplo:${m.prefix + m.command} car`)

  await m.react('🕕')

  try {
    const url = `https://api-abztech.zone.id/ai/genimg?text=${encodeURIComponent(m.fullArgs)}`
    const response = await _axios2.default.get(url, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.data || response.data.length < 100) {
      throw new Error('Invalid image data received')
    }

    await sock.sendMedia(m.chat, response.data, m.fullArgs, m, { type: 'image' })
    await m.react('✅')
  } catch (e) {
    console.error(e)
    await m.react('❌')
    return m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
  }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

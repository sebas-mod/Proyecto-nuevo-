"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourinhttpjs = require('../../src/lib/ourin-http.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
    name: 'gita',
    alias: ['gitagpt', 'bhagavadgita'],
    category: 'ai',
    description: 'Chat con Gita GPT ( Bhagavad Gita AI )',
    usage: '.gita <pertanyaan>',
    example: '.gita What is dharma?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = m.args.join(' ')
    if (!text) {
        return m.reply(`📿*ɢɪᴛᴀ ɢᴘᴛ*\n\nHe aquí una pregunta\n\n\`Ejemplo:${m.prefix}gita What is dharma?\``)
    }

    m.react('🕕')

    try {
        const url = `https://api.cuki.biz.id/api/ai/gita?apikey=${_configjs2.default.APIkey.cuki}&q=${encodeURIComponent(text)}`
        const data = await _ourinhttpjs.f.call(void 0, url)

        const content = data.results

        m.react('✅')
        await m.reply(`${_optionalChain([content, 'optionalAccess', _ => _.trim, 'call', _2 => _2()])}`)

    } catch (error) {
        m.react('☢')
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

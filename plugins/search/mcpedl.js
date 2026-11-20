"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
    name: 'mcpedl',
    alias: ['mcpe', 'mcpesearch', 'searchmcpe'],
    category: 'search',
    description: 'Busca Mup y addon Minecraft PE de MCPEDL',
    usage: '.mcpe <query>',
    example: '.mcpe survival',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 8,
    energi: 1,
    isEnabled: true
}

const CUKI_APIKEY = _optionalChain([_configjs2.default, 'access', _ => _.APIkey, 'optionalAccess', _2 => _2.cuki]) || 'cuki-x'

function trimText(text, max = 60) {
    const value = (text || '').replace(/\s+/g, ' ').trim()
    if (!value) return '-'
    if (value.length <= max) return value
    return value.slice(0, max) + '...'
}

async function fetchMcpe(query) {
    const { data } = await _axios2.default.get(`https://api.cuki.biz.id/api/search/mcpe?apikey=${encodeURIComponent(CUKI_APIKEY)}&query=${encodeURIComponent(query)}`, {
        timeout: 30000,
        headers: {
            'x-api-key': CUKI_APIKEY,
            'user-agent': 'Mozilla/5.0'
        }
    })

    if (!_optionalChain([data, 'optionalAccess', _3 => _3.status]) || !Array.isArray(_optionalChain([data, 'optionalAccess', _4 => _4.data, 'optionalAccess', _5 => _5.results]))) {
        throw new Error(_optionalChain([data, 'optionalAccess', _6 => _6.message]) || 'Confianza MCPEDL no encontrada')
    }

    return data.data
}

async function handler(m, { sock }) {
    const query = _optionalChain([m, 'access', _7 => _7.text, 'optionalAccess', _8 => _8.trim, 'call', _9 => _9()])

    if (!query) {
        return m.reply(`🧱* MCPEDL SEARCH *\n\n> Ejemplo:\n\`${m.prefix}mcpe survival\``)
    }

    m.react('🔍')

    try {
        const result = await fetchMcpe(query)
        const items = result.results.slice(0, 10)

        if (items.length === 0) {
            m.react('❌')
            return m.reply(`❌No se han encontrado resultados MCPEDL para:${query}`)
        }

        let caption = '🧱 *MCPEDL SEARCH*\n\n'
        caption += `🔎 *Query:* ${result.query || query}\n`
        caption += `📦 *Total:* ${result.total || items.length}\n`
        caption += `🌐 *Source:* ${result.source || 'mcpedl.org'}\n\n`

        items.forEach((item, index) => {
            caption += `*${index + 1}.* ${trimText(item.title)}\n`
            caption += `   ├ ⭐ Rating: ${item.rating || '-'}\n`
            caption += `   ├ ${item.link}\n\n`
        })

        const cover = _optionalChain([items, 'access', _10 => _10[0], 'optionalAccess', _11 => _11.image])
        if (cover) {
            await sock.sendMedia(m.chat, cover, caption.trim(), m, {
                type: 'image'
            })
        } else {
            await m.reply(caption.trim())
        }

        m.react('✅')
    } catch (error) {
        console.log(error)
        m.react('☢')
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

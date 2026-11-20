"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinhttpjs = require('./../../src/lib/ourin-http.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'emojimix',
    alias: ['mixemoji', 'emix'],
    category: 'sticker',
    description: 'Gabungkan 2 emoji menjadi 1',
    usage: '.emojimix <emoji1><emoji2>',
    example: '.emojimix 😂🔥',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()])

    if (!text) {
        return m.reply(
            `🎭 *ᴇᴍᴏᴊɪ ᴍɪx*\n\n` +
            `> Gabungkan 2 emoji menjadi 1\n\n` +
            `> Ejemplo:\`${m.prefix}emojimix 😂🔥\``
        )
    }

    const emojiRegex = /\p{Extended_Pictographic}/gu
    const emojis = text.match(emojiRegex)

    if (!emojis || emojis.length < 2) {
        return m.reply(`❌¡Pon un poco de 2 emojis!\n\nEjemplo:${m.prefix}emojimix 😂🔥`)
    }

    const emoji1 = emojis[0]
    const emoji2 = emojis[1]

    m.react('🕕')

    try {
        const apiUrl = `https://api.neoxr.eu/api/emoji?q=${encodeURIComponent(emoji1 + '_' + emoji2)}&apikey=${_configjs2.default.APIkey.neoxr}`

        const data = await _ourinhttpjs.f.call(void 0, apiUrl)

        if (!data.status || !_optionalChain([data, 'access', _4 => _4.data, 'optionalAccess', _5 => _5.url])) {
            return m.reply(`❌¡La combinación de emojis no se encuentra!\n\nOtro disparo de emoji.`)
        }

        const imageUrl = data.data.url

        await sock.sendImageAsSticker(m.chat, imageUrl, m, {
            packname: _configjs2.default.sticker.packname,
            author: _configjs2.default.sticker.author
        })

        m.react('✅')

    } catch (err) {
        console.log(err)
        m.react('☢')
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

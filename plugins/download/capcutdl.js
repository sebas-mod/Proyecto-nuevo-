"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _btchdownloader = require('btch-downloader');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'capcutdl',
    alias: ['ccdl', 'capcut', 'cc'],
    category: 'download',
    description: 'Download video CapCut',
    usage: '.ccdl <url>',
    example: '.ccdl https://www.capcut.com/t/xxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const url = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()])

    if (!url) {
        return m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> \`${m.prefix}ccdl <url>\`\n\n` +
            `> Ejemplo:\n` +
            `> \`${m.prefix}ccdl https://www.capcut.com/t/xxx\``
        )
    }

    if (!url.match(/capcut\.com/i)) {
        return m.reply(`❌URL inválida.`)
    }

    await m.react('🕕')

    try {
        const data = await _btchdownloader.capcut.call(void 0, url)

        if (!_optionalChain([data, 'optionalAccess', _4 => _4.status]) || !_optionalChain([data, 'optionalAccess', _5 => _5.originalVideoUrl])) {
            return m.reply(`❌Gagal tomó el video, otro Cobalink.`)
        }

        await sock.sendMedia(m.chat, data.originalVideoUrl, null, m, {
            type: 'video',
            contextInfo: {
                forwardingScore: 99,
                isForwarded: true
            }
        })

    } catch (err) {
        return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const sadCommands = ['mengkane']
for (let i = 1; i <= 52; i++) {
    sadCommands.push(`mengkane${i}`)
}

const pluginConfig = {
    name: sadCommands,
    alias: [],
    category: 'media',
    description: 'Kirim musik mengkane (mengkane1 - mengkane55)',
    usage: '.mengkane1 atau .mengkane55',
    example: '.mengkane1',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const command = _optionalChain([m, 'access', _ => _.command, 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()])
    
    if (command === 'mengkane' || !command.startsWith('mengkane')) {
        return m.reply(
            `🎵 *ᴍᴇɴɢᴋᴀɴᴇ ᴍᴜsɪᴄ*\n\n` +
            `Sentimental: right 1 - right 52\n` +
            `> Ejemplo:\`${m.prefix}mengkane1\``
        )
    }
    
    const num = parseInt(command.replace('mengkane', ''))
    if (isNaN(num) || num < 1 || num > 52) {
        return m.reply(`❌Elección inválida. Use el número 1 hasta que se trate de 52.`)
    }
    m.react('🕕')
    let sound
    try {
        const fixcmd = command.replace('mengkane', 'mangkane')
        if (num < 25) sound = `https://raw.githubusercontent.com/hyuura/Rest-Sound/main/HyuuraKane/${fixcmd}.mp3`
        if (num > 24) sound = `https://raw.githubusercontent.com/aisyah-rest/mangkane/main/Mangkanenya/${fixcmd}.mp3`
        await sock.sendMedia(m.chat, sound, null, m, {
            type: 'audio',
            mimetype: 'audio/mpeg',
            ptt: false
        })
    } catch (err) {
        console.log(err)
        return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

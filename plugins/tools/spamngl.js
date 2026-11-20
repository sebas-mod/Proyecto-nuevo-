"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
    name: 'spamngl',
    alias: [],
    category: 'tools',
    description: 'Send NGL Spam',
    usage: '.spamngl <url> | <text> | <jumlah>',
    example: '.spamngl https://ngl.link/xxxx | hai | 10',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.split, 'call', _3 => _3('|')])
    const [ link, kata, jumlah ] = text
    if(!link) return m.reply(`*Falta el enlace NGL*\nEjemplo:\`${_optionalChain([m, 'optionalAccess', _4 => _4.prefix])}spamngl https://ngl.link/xxxx | hola | 10\``)
    if(!kata) return m.reply(`*Falta el texto*\n\nEjemplo:\`${_optionalChain([m, 'optionalAccess', _5 => _5.prefix])}spamngl https://ngl.link/xxxx | hola | 10\``)
    if(!jumlah) return m.reply(`*Falta la cantidad*\n\nEjemplo:\`${_optionalChain([m, 'optionalAccess', _6 => _6.prefix])}spamngl https://ngl.link/xxxx | hola | 10\``)
    if(isNaN(jumlah)) return m.reply(`*La cantidad debe ser un número*\n\nEjemplo:\`${_optionalChain([m, 'optionalAccess', _7 => _7.prefix])}spamngl https://ngl.link/xxxx | hola | 10\``)
    m.react('🎴')
    
    try {
        for(let i = 0; i < jumlah; i++) {
            _axios2.default.get(`https://api.cuki.biz.id/api/tools/sendngl?apikey=cuki-x&link=${encodeURIComponent(link)}&text=${encodeURIComponent(kata)}`, {
                timeout: 30000
            })
            await new Promise(resolve => setTimeout(resolve, 4000))
        }
        await m.react('✅')
        await sock.sendMessage(m.chat, {
            text: `✅NO\n\n¡Funciónín bien para el Spam mensje NGL!\nMetas:${link}\nPesan: ${kata} (${jumlah}x)`
        }, { quoted: m })
        
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

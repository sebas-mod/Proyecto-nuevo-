"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'tafsirmimpi',
    alias: ['artimimpi', 'mimpi'],
    category: 'primbon',
    description: 'Cari tafsir mimpi',
    usage: '.tafsirmimpi <kata kunci>',
    example: '.tafsirmimpi bertemu',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const keyword = m.args.join(' ')
    if (!keyword) {
        return m.reply(`🌙 *ᴛᴀꜰsɪʀ ᴍɪᴍᴘɪ*\n\n> Masukkan kata kunci mimpi\n\n\`Contoh: ${m.prefix}tafsirmimpi bertemu\``)
    }
    
    m.react('🌙')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/tafsirmimpi?mimpi=${encodeURIComponent(keyword)}`
        const { data } = await _axios2.default.get(url, { timeout: 30000 })
        
        if (!_optionalChain([data, 'optionalAccess', _ => _.status]) || !_optionalChain([data, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.hasil, 'optionalAccess', _4 => _4.length])) {
            m.react('❌')
            return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Tidak ditemukan tafsir untuk: ${keyword}`)
        }
        
        const r = data.data
        let response = `🌙 *ᴛᴀꜰsɪʀ ᴍɪᴍᴘɪ*\n\n`
        response += `> Kata kunci: *${r.keyword}*\n`
        response += `> Ditemukan: *${r.total} hasil*\n\n`
        
        r.hasil.slice(0, 10).forEach((h, i) => {
            response += `*${i+1}. ${h.mimpi}*\n> ${h.tafsir}\n\n`
        })
        
        if (r.total > 10) {
            response += `_...dan ${r.total - 10} hasil lainnya_`
        }
        
        m.react('✅')
        await m.reply(response)
        
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

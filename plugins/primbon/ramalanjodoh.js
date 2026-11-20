"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'ramalanjodoh',
    alias: ['jodoh', 'cekjodoh'],
    category: 'primbon',
    description: 'Ramalan jodoh berdasarkan primbon Jawa',
    usage: '.ramalanjodoh nama1 tgl1 bln1 thn1 nama2 tgl2 bln2 thn2',
    example: '.ramalanjodoh putu 16 11 2007 keyla 1 1 2008',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (m.args.length < 8) {
        return m.reply(`💑 *ʀᴀᴍᴀʟᴀɴ ᴊᴏᴅᴏʜ*\n\n> Format:\nrama1 tgl1 bln1 thn1 nama2 tgl2 bln2 thn2\n\n\`Contoh:\n${m.prefix}ramalanjodoh putu 16 11 2007 keyla 1 1 2008\``)
    }
    
    const [nama1, tgl1, bln1, thn1, nama2, tgl2, bln2, thn2] = m.args
    
    m.react('💑')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/ramalanjodoh?nama1=${encodeURIComponent(nama1)}&tgl1=${tgl1}&bln1=${bln1}&thn1=${thn1}&nama2=${encodeURIComponent(nama2)}&tgl2=${tgl2}&bln2=${bln2}&thn2=${thn2}`
        const { data } = await _axios2.default.get(url, { timeout: 30000 })
        
        if (!_optionalChain([data, 'optionalAccess', _ => _.status]) || !_optionalChain([data, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.result])) {
            m.react('❌')
            return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Gagal meramal`)
        }
        
        const r = data.data.result
        let response = `💑 *ʀᴀᴍᴀʟᴀɴ ᴊᴏᴅᴏʜ*\n\n`
        response += `👤 *${r.orang_pertama.nama}*\n> ${r.orang_pertama.tanggal_lahir}\n\n`
        response += `👤 *${r.orang_kedua.nama}*\n> ${r.orang_kedua.tanggal_lahir}\n\n`
        response += `📜 *ʜᴀꜱɪʟ ʀᴀᴍᴀʟᴀɴ:*\n`
        
        r.hasil_ramalan.forEach((h, i) => {
            response += `${i+1}. ${h}\n\n`
        })
        
        response += `> ⚠️ _${data.data.peringatan}_`
        
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

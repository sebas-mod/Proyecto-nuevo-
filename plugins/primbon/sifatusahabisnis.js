"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'sifatusahabisnis',
    alias: ['usahabisnis', 'sifatbisnis'],
    category: 'primbon',
    description: 'Cek sifat usaha/bisnis berdasarkan tanggal lahir',
    usage: '.sifatusahabisnis <tgl> <bln> <thn>',
    example: '.sifatusahabisnis 1 1 2000',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    if (m.args.length < 3) {
        return m.reply(`💼 *sɪꜰᴀᴛ ᴜsᴀʜᴀ/ʙɪsɴɪs*\n\n> Format: tgl bln thn\n\n\`Contoh: ${m.prefix}sifatusahabisnis 1 1 2000\``)
    }
    
    const [tgl, bln, thn] = m.args
    
    m.react('💼')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/sifat_usaha_bisnis?tgl=${tgl}&bln=${bln}&thn=${thn}`
        const { data } = await _axios2.default.get(url, { timeout: 30000 })
        
        if (!_optionalChain([data, 'optionalAccess', _ => _.status]) || !_optionalChain([data, 'optionalAccess', _2 => _2.data])) {
            m.react('❌')
            return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Gagal menganalisa`)
        }
        
        const r = data.data
        const response = `💼 *sɪꜰᴀᴛ ᴜsᴀʜᴀ/ʙɪsɴɪs*\n\n` +
            `> Lahir: *${r.hari_lahir}*\n\n` +
            `📊 *ᴀɴᴀʟɪsᴀ:*\n${r.usaha}\n\n` +
            `> _${r.catatan}_`
        
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

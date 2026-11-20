"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'nomerhoki',
    alias: ['nomorhoki', 'ceknomor'],
    category: 'primbon',
    description: 'Compruebe los números de HP',
    usage: '.nomerhoki <nomor>',
    example: '.nomerhoki 6281234567890',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    let nomor = m.args.join('').replace(/[^0-9]/g, '')
    if (!nomor) {
        return m.reply(`🍀*ɴᴏᴍᴏʀ ʜᴏᴋɪ*\n\n*Pon el número para el teléfono*\n\n\`Ejemplo:${m.prefix}nomerhoki 6281234567890\``)
    }
    
    m.react('🍀')
    
    try {
        const url = `https://api.siputzx.my.id/api/primbon/nomorhoki?phoneNumber=${nomor}`
        const { data } = await _axios2.default.get(url, { timeout: 30000 })
        
        if (!_optionalChain([data, 'optionalAccess', _ => _.status]) || !_optionalChain([data, 'optionalAccess', _2 => _2.data])) {
            m.react('❌')
            return m.reply(`❌*ɢᴀɢᴀʟ*\n\n# Poderoso análisis de los números #`)
        }
        
        const r = data.data
        const ep = r.energi_positif.details
        const en = r.energi_negatif.details
        
        const response = `🍀 *ɴᴏᴍᴏʀ ʜᴏᴋɪ*\n\n` +
            `* Nuna:${r.nomor}*\n\n` +
            `📊 *ᴀɴɢᴋᴀ ʙᴀɢᴜᴀ:* ${r.angka_bagua_shuzi.value}%\n\n` +
            `✅ *ᴇɴᴇʀɢɪ ᴘᴏꜱɪᴛɪꜰ:* ${r.energi_positif.total}%\n` +
            `├ Kekayaan: ${ep.kekayaan}\n` +
            `├ Salud: ${ep.kesehatan}\n` +
            `├ Cinta: ${ep.cinta}\n` +
            `└ Kestabilan: ${ep.kestabilan}\n\n` +
            `❌ *ᴇɴᴇʀɢɪ ɴᴇɢᴀᴛɪꜰ:* ${r.energi_negatif.total}%\n` +
            `├ Perselisihan: ${en.perselisihan}\n` +
            `├ Kehilangan: ${en.kehilangan}\n` +
            `├ Malapetaka: ${en.malapetaka}\n` +
            `└ Kehancuran: ${en.kehancuran}\n\n` +
            `> Status: ${r.analisis.status ? '✅ HOKI' : '❌ TIDAK HOKI'}`
        
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

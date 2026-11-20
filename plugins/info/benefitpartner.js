"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
    name: 'benefitpartner',
    alias: ['partnerbenefits', 'keuntunganpartner'],
    category: 'info',
    description: 'Lihat keuntungan menjadi partner bot',
    usage: '.benefitpartner',
    example: '.benefitpartner',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {

    const prefix = m.prefix || '.'

    let txt = `🤝 *BENEFIT PARTNER*\n\n`
    txt += `Keuntungan menjadi partner ${_optionalChain([_configjs2.default, 'access', _ => _.bot, 'optionalAccess', _2 => _2.name]) || 'Bot'}:\n\n`

    txt += `🔓 *Akses Fitur*\n`
    txt += `├ Semua fitur premium terbuka\n`
    txt += `├ Energi & koin unlimited\n`
    txt += `├ Akses command owner tertentu\n`
    txt += `└ Prioritas support\n\n`

    txt += `📦 *Panel Pterodactyl*\n`
    txt += `├ Bisa create server sendiri\n`
    txt += `├ Akses panel management\n`
    txt += `└ Bisa jualan panel (reseller)\n\n`

    txt += `💎 *Bonus*\n`
    txt += `├ +200.000 EXP saat aktivasi\n`
    txt += `├ +20.000 Koin saat aktivasi\n`
    txt += `├ Badge partner di profil\n`
    txt += `└ Akses early feature\n\n`

    txt += `💰 *Cara Jadi Partner*\n`
    txt += `├ Hubungi owner: ${_optionalChain([_configjs2.default, 'access', _3 => _3.owner, 'optionalAccess', _4 => _4.name]) || 'Owner'}\n`
    txt += `├ Durasi: 30/60/90 hari\n`
    txt += `└ Command: \`${prefix}addpartner\` (owner only)\n\n`

    txt += `📋 *Command Partner*\n`
    txt += `├ \`${prefix}cekpartner\` — Cek status partner\n`
    txt += `├ \`${prefix}cekprem\` — Cek status premium\n`
    txt += `├ \`${prefix}cekowner\` — Cek role user\n`
    txt += `└ \`${prefix}listpartner\` — Daftar partner\n\n`

    txt += `> _Hubungi owner untuk info lebih lanjut_`

    await m.reply(txt)
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

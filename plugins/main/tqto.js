"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _ourinbuilderjs = require('../../src/lib/ourin-builder.js');
const pluginConfig = {
    name: 'tqto',
    alias: ['thanksto', 'credits', 'kredit'],
    category: 'main',
    description: 'Menampilkan daftar kontributor bot',
    usage: '.tqto',
    example: '.tqto',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const botName = _optionalChain([_configjs2.default, 'access', _ => _.bot, 'optionalAccess', _2 => _2.name]) || 'Ourin-AI'
    const version = _optionalChain([_configjs2.default, 'access', _3 => _3.bot, 'optionalAccess', _4 => _4.version]) || '1.0.0'
    const developer = _optionalChain([_configjs2.default, 'access', _5 => _5.bot, 'optionalAccess', _6 => _6.developer]) || 'Lucky Archz'

    const credits = [
        { name: 'hyuuOkkotsuX', role: 'Lead Staff', icon: '👨‍💻' },
        { name: 'Zann', role: 'Creator Ourin MD dan APK Stardem Ourin', icon: '👨‍💻' },
        { name: 'SenzOkkotsu', role: 'Developer', icon: '👨‍💻' },
        { name: 'Ell', role: 'Developer', icon: '👨‍💻' },
        { name: 'Aqell', role: 'Developer SC BUG Ourin Glitch', icon: '👨‍💻' },
        { name: 'Mobbc', role: 'Staff', icon: '👨‍💻' },
        { name: 'Raka', role: 'Staff', icon: '👨‍💻' },
        { name: 'Sanxz', role: 'Tangan Kanan', icon: '👨‍💻' },
        { name: 'Dinz', role: 'Tangan Kanan', icon: '👨‍💻' },
        { name: 'Forone Store', role: 'Tangan Kanan', icon: '🛒' },
        { name: 'Fahmi', role: 'Tangan Kanan', icon: '👨‍💻' },
        { name: 'Sabila', role: 'Tangan Kanan', icon: '👩‍💻' },
        { name: 'Syura Store', role: 'Tangan Kanan', icon: '👩‍💻' },
        { name: 'Xero', role: 'Tangan Kanan', icon: '👩‍💻' },
        { name: 'Aji', role: 'Tangan Kanan', icon: '👩‍💻' },
        { name: 'Lyoraaa', role: 'Owner', icon: '👩‍💻' },
        { name: 'Danzzz', role: 'Owner', icon: '👨‍💻' },
        { name: 'Muzan', role: 'Owner', icon: '👨‍💻' },
        { name: 'Gray', role: 'Owner', icon: '👨‍💻' },
        { name: 'Baim', role: 'Moderator', icon: '👨‍💻' },
        { name: 'Vadel', role: 'Moderator', icon: '👨‍💻' },
        { name: 'Fikzz', role: 'Moderator', icon: '🛒' },
        { name: 'Caca', role: 'Moderator', icon: '👨‍💻' },
        { name: 'panceo', role: 'Partner', icon: '🛒' },
        { name: 'KingSatzID', role: 'Partner', icon: '🛒' },
        { name: 'Dashxz', role: 'Partner', icon: '🛒' },
        { name: 'This JanzZ', role: 'Partner', icon: '🛒' },
        { name: 'Ahmad', role: 'Partner', icon: '🛒' },
        { name: 'nopal', role: 'Partner', icon: '🛒' },
        { name: 'tuadit', role: 'Partner', icon: '🛒' },
        { name: 'andry', role: 'Partner', icon: '🛒' },
        { name: 'kingdanz', role: 'Partner', icon: '🛒' },
        { name: 'patih', role: 'Partner', icon: '🛒' },
        { name: 'Ryuu', role: 'Partner', icon: '🛒' },
        { name: 'Pororo', role: 'Partner', icon: '🛒' },
        { name: 'Janzz', role: 'Partner', icon: '🛒' },
        { name: 'Morvic', role: 'Partner', icon: '🛒' },
        { name: 'zylnzee', role: 'Partner', icon: '🛒' },
        { name: 'Farhan', role: 'Partner', icon: '🛒' },
        { name: 'Alizz', role: 'Partner', icon: '🛒' },
        { name: 'Kiram', role: 'Partner', icon: '🛒' },
        { name: 'Minerva', role: 'Partner', icon: '🛒' },
        { name: 'HanzPiw', role: 'Partner', icon: '🛒' },
        { name: 'Ryuzen', role: 'Partner', icon: '🛒' },
        { name: 'Ahmad', role: 'Partner', icon: '🛒' },
        { name: 'Riam', role: 'Partner', icon: '🛒' },
        { name: 'Erren', role: 'Partner', icon: '🛒' },
        { name: 'ranzen', role: 'Partner', icon: '🛒' },
        { name: 'Febri', role: 'Partner', icon: '🛒' },
        { name: 'Kuze', role: 'Partner', icon: '🛒' },
        { name: 'Oscar Dani', role: 'Partner', icon: '🛒' },
        { name: 'Udun', role: 'Partner', icon: '🛒' },
        { name: 'Renn', role: 'Partner', icon: '🛒' },
        { name: 'Taka', role: 'Partner', icon: '🛒' },
        { name: 'Tatskuyy', role: 'Partner', icon: '🛒' },
        { name: 'Yann', role: 'Partner', icon: '🛒' },
        { name: 'Zanspiw', role: 'Youtuber', icon: '🌐' },
        { name: 'Danzz Nano', role: 'Youtuber', icon: '🌐' },
        { name: 'Youtuber Lain yang udah review', role: 'Youtuber', icon: '🌐' },
        { name: 'Kalian Semua', role: 'Best', icon: '🌐' },
        { name: 'Open Source Community', role: 'Libraries & Tools', icon: '🌐' },

    ]

    const headers = ['No', 'Nama', 'Role / Tier']
    const rows = credits.map((c, i) => [i + 1, c.name, c.role])

    await m.reply(`🍟 *Berikut ini adalah orang orang yang sudah berkontribusi di bot ${_configjs2.default.bot.name}*
        
${credits.map((c, i) => `*${i + 1}*. *${c.name}* [ ${c.icon} ${c.role} ]`).join('\n')}}`)
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
    name: 'koin',
    alias: ['saldo', 'money', 'cash', 'coin', 'coins'],
    category: 'user',
    description: 'Cek koin user',
    usage: '.koin [@user]',
    example: '.koin',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function formatKoin(num) {
    if (num >= 1000000000000) return (num / 1000000000000).toFixed(2) + 'T'
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

async function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    
    let targetJid = m.sender
    let targetName = m.pushName || 'Tu'
    
    if (m.quoted) {
        targetJid = m.quoted.sender
        targetName = m.quoted.pushName || targetJid.split('@')[0]
    } else if (_optionalChain([m, 'access', _ => _.mentionedJid, 'optionalAccess', _2 => _2.length])) {
        targetJid = m.mentionedJid[0]
        targetName = targetJid.split('@')[0]
    }
    
    const user = db.getUser(targetJid) || db.setUser(targetJid)
    const koinDisplay = formatKoin(user.koin || 0)
    
    const isSelf = targetJid === m.sender
    
    let text = `*〔 💰INFO COIN〕*\n\n`

text += `*〔 👤 User 〕* ${targetName}\n`
text += `*〔 💰Monedas〕*${koinDisplay}\n`
const isOwner = _configjs2.default.isOwner(targetJid) ? 'Owner' : ''
const isPremium = user.isPremium ? 'Premium' : 'Free'

text += `*〔 💎 Status 〕* ${isOwner || isPremium}\n`

if (isSelf) {
  text += `\n*〔 🛒 SHOP 〕*\n`
  text += `• \`. buyenergi<jml>\`( 1 = 100 monedas )\n`
  text += `• \`. buyfinitur.\`( 1 = 30.000 monedas )\n`
  text += `\n¿Qué?🎮Juego principal para conseguir la moneda!`
}
    
    await m.reply(text)
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

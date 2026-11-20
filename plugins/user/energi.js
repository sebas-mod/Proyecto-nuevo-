"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
    name: 'energi',
    alias: ['cekenergi', 'myenergi', 'energy', 'limit', 'ceklimit'],
    category: 'user',
    description: 'Cek energi user',
    usage: '.energi [@user]',
    example: '.energi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

function formatNumber(num) {
    if (num === -1) return '∞ Unlimited'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

async function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    
    let targetJid = m.sender
    let targetName = m.pushName || 'Kamu'
    
    if (m.quoted) {
        targetJid = m.quoted.sender
        targetName = m.quoted.pushName || targetJid.split('@')[0]
    } else if (_optionalChain([m, 'access', _ => _.mentionedJid, 'optionalAccess', _2 => _2.length])) {
        targetJid = m.mentionedJid[0]
        targetName = targetJid.split('@')[0]
    }
    
    const user = db.getUser(targetJid) || db.setUser(targetJid)
    const isOwner = _optionalChain([_configjs2.default, 'access', _3 => _3.owner, 'optionalAccess', _4 => _4.number, 'optionalAccess', _5 => _5.includes, 'call', _6 => _6(targetJid.replace(/[^0-9]/g, ''))]) || _optionalChain([_configjs2.default, 'access', _7 => _7.isOwner, 'optionalCall', _8 => _8(targetJid)])

    const dbToggle = db.setting('energi')
    const energiEnabled = dbToggle !== undefined ? dbToggle : (_optionalChain([_configjs2.default, 'access', _9 => _9.energi, 'optionalAccess', _10 => _10.enabled]) !== false)

    let finalEnergi
    if (!energiEnabled || isOwner) {
        finalEnergi = -1
    } else if (user.isPremium) {
        finalEnergi = _nullishCoalesce(_nullishCoalesce(user.energi, () => ( _optionalChain([_configjs2.default, 'access', _11 => _11.energi, 'optionalAccess', _12 => _12.premium]))), () => ( 100))
    } else {
        finalEnergi = _nullishCoalesce(_nullishCoalesce(user.energi, () => ( _optionalChain([_configjs2.default, 'access', _13 => _13.energi, 'optionalAccess', _14 => _14.default]))), () => ( 25))
    }

    const isUnlimited = finalEnergi === -1
    const energiDisplay = formatNumber(finalEnergi)
    
    const isSelf = targetJid === m.sender
    
    let userStatus = 'Free'
    if (isOwner) userStatus = 'Owner'
    else if (user.isPremium) userStatus = 'Premium'
    if (!energiEnabled) userStatus += ' (Energi OFF)'
    
    let text = `*〔 ⚡ ENERGI INFO 〕*\n\n`

text += `*〔 👤 User 〕* ${targetName}\n`
text += `*〔 ⚡ Energi 〕* ${energiDisplay}\n`
text += `*〔 💎 Status 〕* ${userStatus}\n\n`
    
    if (!energiEnabled) {
        text += `🔌 Sistem energi dinonaktifkan — semua command gratis`
    } else if (isSelf && !isUnlimited && finalEnergi < 10) {
        text += `⚠️ Energi hampir habis!\n`
        text += `Gunakan \`.buyenergi\` untuk beli`
    } else if (isUnlimited) {
        text += `✨ Energi unlimited aktif!`
    }
    
    await m.reply(text)
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

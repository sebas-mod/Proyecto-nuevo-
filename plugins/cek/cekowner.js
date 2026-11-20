"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
    name: 'cekowner',
    alias: ['ownerinfo'],
    category: 'cek',
    description: 'Compruebe si el usuario es el propietario del bot',
    usage: '.cekowner @user',
    example: '.cekowner',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    let targetNumber = ''
    let targetJid = ''

    if (m.quoted) {
        targetNumber = _optionalChain([m, 'access', _ => _.quoted, 'access', _2 => _2.sender, 'optionalAccess', _3 => _3.replace, 'call', _4 => _4(/[^0-9]/g, '')]) || ''
        targetJid = m.quoted.sender
    } else if (_optionalChain([m, 'access', _5 => _5.mentionedJid, 'optionalAccess', _6 => _6.length])) {
        targetNumber = _optionalChain([m, 'access', _7 => _7.mentionedJid, 'access', _8 => _8[0], 'optionalAccess', _9 => _9.replace, 'call', _10 => _10(/[^0-9]/g, '')]) || ''
        targetJid = m.mentionedJid[0]
    } else if (_optionalChain([m, 'access', _11 => _11.args, 'optionalAccess', _12 => _12.length])) {
        targetNumber = m.args[0].replace(/[^0-9]/g, '')
        targetJid = targetNumber + '@s.whatsapp.net'
    } else {
        targetNumber = _optionalChain([m, 'access', _13 => _13.sender, 'optionalAccess', _14 => _14.replace, 'call', _15 => _15(/[^0-9]/g, '')]) || ''
        targetJid = m.sender
    }

    if (targetNumber.startsWith('0')) targetNumber = '62' + targetNumber.slice(1)

    const isOwnerUser = _configjs2.default.isOwner(targetNumber)
    const isPartnerUser = _configjs2.default.isPartner(targetNumber)
    const isPremiumUser = _configjs2.default.isPremium(targetNumber)
    const user = db.getUser(targetJid)

    const roles = []
    if (isOwnerUser) roles.push('👑Propietario')
    if (isPartnerUser) roles.push('🤝 Partner')
    if (isPremiumUser) roles.push('💎 Premium')
    if (roles.length === 0) roles.push('👤 Free User')

    const ownerList = db.data.owner || []
    const isInOwnerDb = ownerList.includes(targetNumber)

    let txt = `📋* Comproeba USUARIO INFO *\n\n`
    txt += `👤 User: @${targetNumber}\n`
    txt += `🏷️ Role: *${roles.join(' • ')}*\n`
    txt += `📊Propietario DB: *${isInOwnerDb ? 'Ya' : 'Tidak'}*\n`
    if (user) {
        txt += `⚡Energía: *${user.energi === -1 ? '∞' : (_nullishCoalesce(user.energi, () => ( 0)))}*\n`
        txt += `💰Monedas: *${user.koin === -1 ? '∞' : (_nullishCoalesce(user.koin, () => ( 0))).toLocaleString('es-AR')}*\n`
        txt += `⭐ Level: *${_nullishCoalesce(user.level, () => ( 1))}*\n`
    }

    await m.reply(txt, { mentions: [targetJid] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

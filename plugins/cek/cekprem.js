"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikudatabasejs = require('../../src/lib/almiku-database.js');
const pluginConfig = {
    name: 'cekprem',
    alias: ['cekpremium', 'preminfo'],
    category: 'cek',
    description: 'Cek detail status premium user',
    usage: '.cekprem @user',
    example: '.cekprem',
    isOwner: false,
    isPremium: true,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function formatDate(ts) {
    return new Date(ts).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })
}

async function handler(m) {
    const db = _almikudatabasejs.getDatabase.call(void 0, )
    let targetNumber = ''

    if (m.quoted) {
        targetNumber = _optionalChain([m, 'access', _ => _.quoted, 'access', _2 => _2.sender, 'optionalAccess', _3 => _3.replace, 'call', _4 => _4(/[^0-9]/g, '')]) || ''
    } else if (_optionalChain([m, 'access', _5 => _5.mentionedJid, 'optionalAccess', _6 => _6.length])) {
        targetNumber = _optionalChain([m, 'access', _7 => _7.mentionedJid, 'access', _8 => _8[0], 'optionalAccess', _9 => _9.replace, 'call', _10 => _10(/[^0-9]/g, '')]) || ''
    } else if (_optionalChain([m, 'access', _11 => _11.args, 'optionalAccess', _12 => _12.length])) {
        targetNumber = m.args[0].replace(/[^0-9]/g, '')
    } else {
        targetNumber = _optionalChain([m, 'access', _13 => _13.sender, 'optionalAccess', _14 => _14.replace, 'call', _15 => _15(/[^0-9]/g, '')]) || ''
    }

    if (targetNumber.startsWith('0')) targetNumber = '62' + targetNumber.slice(1)
    if (!db.data.premium) db.data.premium = []

    const premData = db.data.premium.find(p =>
        typeof p === 'string' ? p === targetNumber : p.id === targetNumber
    )
    const jid = targetNumber + '@s.whatsapp.net'
    const isConfigPrem = _configjs2.default.isPremium(targetNumber)
    const isConfigOwner = _configjs2.default.isOwner(targetNumber)

    if (!premData && !isConfigPrem && !isConfigOwner) {
        return m.reply(`❌ @${targetNumber}No es una prima.`, { mentions: [jid] })
    }

    const user = db.getUser(jid)
    const now = Date.now()

    let txt = `💎* PREMUM DE DETALLES*\n\n`
    txt += `👤 User: @${targetNumber}\n`

    if (isConfigOwner) {
        txt += `🏷*👑Propietario (Permanent)*\n`
    } else if (typeof premData === 'string' || !_optionalChain([premData, 'optionalAccess', _16 => _16.expired])) {
        txt += `🏷️ Role: *💎Premium ( Permanent ) *\n`
    } else {
        const remaining = Math.ceil((premData.expired - now) / (1000 * 60 * 60 * 24))
        const totalDays = premData.addedAt ? Math.ceil((premData.expired - premData.addedAt) / (1000 * 60 * 60 * 24)) : '?'
        txt += `📛Nombre: *${premData.name || 'Unknown'}*\n`
        txt += `📅Empieza: *${premData.addedAt ? formatDate(premData.addedAt) : 'Unknown'}*\n`
        txt += `⏳ Expired: *${formatDate(premData.expired)}*\n`
        txt += `🗓Duración${totalDays}el*\n`
        txt += `📊Restante: *${remaining > 0 ? remaining + ' hari' : '⚠️ Expired'}*\n`
    }

    if (user) {
        txt += `⚡Energía: *${user.energi === -1 ? '∞' : (_nullishCoalesce(user.energi, () => ( 0)))}*\n`
        txt += `💰Monedas: *${user.koin === -1 ? '∞' : (_nullishCoalesce(user.koin, () => ( 0))).toLocaleString('es-AR')}*\n`
        txt += `⭐ Exp: *${(_nullishCoalesce(user.exp, () => ( 0))).toLocaleString('es-AR')}*\n`
        txt += `📊 Level: *${_nullishCoalesce(user.level, () => ( 1))}*\n`
    }

    await m.reply(txt, { mentions: [jid] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

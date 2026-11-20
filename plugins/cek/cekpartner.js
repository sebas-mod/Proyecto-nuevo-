"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikudatabasejs = require('../../src/lib/almiku-database.js');
const pluginConfig = {
    name: 'cekpartner',
    alias: ['partnerinfo'],
    category: 'cek',
    description: 'Cek detail status partner user',
    usage: '.cekpartner @user',
    example: '.cekpartner',
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
    if (!db.data.partner) db.data.partner = []

    const info = db.data.partner.find(p => p.id === targetNumber)
    const jid = targetNumber + '@s.whatsapp.net'

    if (!info) {
        return m.reply(`❌ @${targetNumber}no es partner`, { mentions: [jid] })
    }

    const now = Date.now()
    const remaining = Math.ceil((info.expired - now) / (1000 * 60 * 60 * 24))
    const totalDays = info.addedAt ? Math.ceil((info.expired - info.addedAt) / (1000 * 60 * 60 * 24)) : '?'
    const user = db.getUser(jid)

    let txt = `🤝 *DETAIL PARTNER*\n\n`
    txt += `👤 User: @${targetNumber}\n`
    txt += `📛Nombre: *${info.name || 'Unknown'}*\n`
    txt += `📅Empieza: *${info.addedAt ? formatDate(info.addedAt) : 'Unknown'}*\n`
    txt += `⏳ Expired: *${formatDate(info.expired)}*\n`
    txt += `🗓Duración${totalDays}el*\n`
    txt += `📊Restante: *${remaining > 0 ? remaining + ' hari' : '⚠️ Expired'}*\n`
    if (user) {
        txt += `⚡Energía: *${user.energi === -1 ? '∞' : (_nullishCoalesce(user.energi, () => ( 0)))}*\n`
        txt += `💰Monedas: *${user.koin === -1 ? '∞' : (_nullishCoalesce(user.koin, () => ( 0))).toLocaleString('es-AR')}*\n`
    }

    await m.reply(txt, { mentions: [jid] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

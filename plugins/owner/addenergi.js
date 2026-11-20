"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikudatabasejs = require('../../src/lib/almiku-database.js');
const pluginConfig = {
    name: 'addenergi',
    alias: ['tambahenergi', 'giveenergi', 'addenergy'],
    category: 'owner',
    description: 'Tambah energi user',
    usage: '.addenergi <jumlah> @user',
    example: '.addenergi 100 @user',
    isOwner: true,
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
    const db = _almikudatabasejs.getDatabase.call(void 0, )
    const args = m.args || []

    let amount = 0
    let isUnlimited = false
    let targetJid = null

    if (_optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3(), 'access', _4 => _4.includes, 'call', _5 => _5('--unlimited')]) || _optionalChain([m, 'access', _6 => _6.text, 'optionalAccess', _7 => _7.toLowerCase, 'call', _8 => _8(), 'access', _9 => _9.includes, 'call', _10 => _10('--unli')])) {
        isUnlimited = true
    }

    const numArg = args.find(a => !isNaN(a) && !a.includes('@') && !a.startsWith('-'))
    if (numArg) amount = parseInt(numArg)

    if (m.quoted) {
        targetJid = m.quoted.sender
    } else if (_optionalChain([m, 'access', _11 => _11.mentionedJid, 'optionalAccess', _12 => _12.length])) {
        targetJid = m.mentionedJid[0]
    } else {
        const phoneArg = args.find(a => a !== numArg && a.length > 5 && /^\d+$/.test(a.replace(/[^0-9]/g, '')))
        if (phoneArg) {
            targetJid = phoneArg.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        }
    }

    if (!targetJid && (amount > 0 || isUnlimited)) {
        targetJid = m.sender
    }

    if (!targetJid || (!isUnlimited && amount <= 0)) {
        return m.reply(
            `⚡ *ᴀᴅᴅ ᴇɴᴇʀɢɪ*\n\n` +
            `> \`.addenergi <jumlah>\` - ke diri sendiri\n` +
            `> \`.addenergi <jumlah> @user\` - ke user\n` +
            `> \`.addenergi --unlimited\` - unlimited\n\n` +
            `\`Contoh: ${m.prefix}addenergi 100\``
        )
    }

    const user = db.getUser(targetJid) || db.setUser(targetJid)

    const effectiveUnlimited = user.energi === -1 ||
        (_configjs2.default.isOwner(targetJid) && (_nullishCoalesce(_optionalChain([_configjs2.default, 'access', _13 => _13.energi, 'optionalAccess', _14 => _14.owner]), () => ( -1))) === -1) ||
        (_configjs2.default.isPremium(targetJid) && (_nullishCoalesce(_optionalChain([_configjs2.default, 'access', _15 => _15.energi, 'optionalAccess', _16 => _16.premium]), () => ( -1))) === -1)

    if (!isUnlimited && effectiveUnlimited) {
        return m.reply(
            `⚡*Información*\n` +
            `@${targetJid.split('@')[0]}ya tiene energía *∞Unlimited *\n` +
            `No es necesario añadir más energía`,
            { mentions: [targetJid] }
        )
    }

    if (isUnlimited) {
        db.setUser(targetJid, { energi: -1 })

        await m.react('✅')
        await m.reply(
            `✅*Energía @${targetJid.split('@')[0]}Ahora ilimitado. *`,
            { mentions: [targetJid] }
        )
    } else {
        const newEnergi = db.updateEnergi(targetJid, amount)

        await m.react('✅')
        await m.reply(
            `✅Energía *@${targetJid.split('@')[0]}* Sucesivamente en el parque tanto *${formatNumber(amount)}*\nAhora el mempunyai *${formatNumber(newEnergi)}* energía`,
            { mentions: [targetJid] }
        )
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

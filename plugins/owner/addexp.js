"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js'); var levelHelper = _interopRequireWildcard(_ourinleveljs);
const pluginConfig = {
    name: 'addexp',
    alias: ['tambahexp', 'giveexp', 'addxp'],
    category: 'owner',
    description: 'Tambah exp user (max 9 Miliar)',
    usage: '.addexp <jumlah> @user',
    example: '.addexp 10000 @user',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
}

const MAX_EXP = 9000000000

function formatNumber(num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(2) + 'K'
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}

function extractTarget(m) {
    if (m.quoted) return m.quoted.sender
    if (_optionalChain([m, 'access', _ => _.mentionedJid, 'optionalAccess', _2 => _2.length])) return m.mentionedJid[0]
    return null
}

async function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const args = m.args
    
    const numArg = args.find(a => !isNaN(a) && !a.startsWith('@'))
    let amount = parseInt(numArg) || 0
    
    let targetJid = await extractTarget(m)
    
    if (!targetJid && amount > 0) {
        targetJid = m.sender
    }
    
    if (!targetJid || amount <= 0) {
        return m.reply(
            `⭐ *ᴀᴅᴅ ᴇxᴘ*\n\n` +
            `> \`.addexp <jumlah>\` - ke diri sendiri\n` +
            `> \`.addexp <jumlah> @user\` - ke user\n` +
            `> Max: 9.000.000.000 (9B)\n\n` +
            `\`Contoh: ${m.prefix}addexp 10000\``
        )
    }
    
    if (amount <= 0) {
        return m.reply(`❌*ɢᴀɢᴀʟ*\n\n# Sólo salta en el agujero #xp debe ser más de 0`)
    }
    
    if (amount > MAX_EXP) {
        amount = MAX_EXP
    }
    
    const user = db.getUser(targetJid) || db.setUser(targetJid)
 
    await levelHelper.addExpWithLevelCheck(sock, m, db, user, amount)
    
    await m.react('✅')
    
    await m.reply(
        `✅♪ Trabajar en el plus e ♪x*${formatNumber(amount)}* ke *@${targetJid.split('@')[0]}*`,
        { mentions: [targetJid] }
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

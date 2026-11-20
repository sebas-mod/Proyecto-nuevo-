"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('./../../src/lib/ourin-level.js');

const pluginConfig = {
    name: 'addlevel',
    alias: ['tambahlevel', 'givelevel', 'addlvl'],
    category: 'owner',
    description: 'Tambah level user (via exp)',
    usage: '.addlevel <jumlah> @user',
    example: '.addlevel 5 @user',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
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
    let levels = parseInt(numArg) || 0
    
    let targetJid = extractTarget(m)
    
    if (!targetJid && levels > 0) {
        targetJid = m.sender
    }
    
    if (!targetJid || levels <= 0) {
        return m.reply(
            `📊 *ADD LEVEL*\n\n` +
            `El sistema para añadir nivel a la entrada @-@ miembro de estilo.\n\n` +
            `*Uso:*\n` +
            `- *${m.prefix}addlevel de adición<jumlah>*— (a diri propio)\n` +
            `- *${m.prefix}addlevel de adición<jumlah>@ user *—(a otros)\n\n` +
            `*Ejemplo de uso:*\n` +
            `- *${m.prefix}addlevel 5*\n` +
            `- *${m.prefix}addlevel 10 @user*`
        )
    }
    
    await m.react('🕕')
    
    const user = db.getUser(targetJid) || db.setUser(targetJid, {})
    if (!user.rpg) user.rpg = {}
    
    const expToAdd = levels * 10000
    
    const oldExp = user.exp || 0
    const newExp = db.updateExp(targetJid, expToAdd)
    user.exp = newExp
    
    const mockM = { ...m, sender: targetJid, pushName: m.pushName }
    const addResult = await _ourinleveljs.checkAndNotifyLevelUp.call(void 0, sock, mockM, db, user, oldExp, newExp)
    
    db.setUser(targetJid, user)
    
    await m.react('✅')
    
    const finalLevel = addResult.newLevel || _ourinleveljs.calculateLevel.call(void 0, user.exp)
    
    await m.reply(
        `✅* GASPS ]\n\n` +
        `Level milik *@${targetJid.split('@')[0]}* ha logrado tanto en la minería *${levels} Level*.\n\n` +
        `* Estadísticas de Terkini: *\n` +
        `- Nivel Ahora: *${finalLevel}*\n` +
        `- Función Cuando It: *${_ourinleveljs.getRole.call(void 0, finalLevel)}*\n` +
        `- Total XP: *${user.exp.toLocaleString()}* XP`,
        { mentions: [targetJid] }
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

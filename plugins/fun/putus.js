"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }/**
 * Putus - End relationship
 */

var _almikudatabasejs = require('../../src/lib/almiku-database.js');
const pluginConfig = {
    name: 'putus',
    alias: ['breakup', 'cerai'],
    category: 'fun',
    description: 'Refinar enlaces con pares',
    usage: '.putus',
    example: '.putus',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 60,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = _almikudatabasejs.getDatabase.call(void 0, )
    let senderData = db.getUser(m.sender) || {}
    if (!senderData.fun) senderData.fun = {}
    if (!senderData.fun.pasangan) {
        await m.react('❌')
        return m.reply(
            `❌* No juegues novio weh *\n\n` +
            `Primera mirada\`${m.prefix}tembak @tag\``
        )
    }
    const exPartner = senderData.fun.pasangan
    let exData = db.getUser(exPartner) || {}
    delete senderData.fun.pasangan
    if (_optionalChain([exData, 'access', _ => _.fun, 'optionalAccess', _2 => _2.pasangan]) === m.sender) {
        delete exData.fun.pasangan
        db.setUser(exPartner, exData)
    }
    db.setUser(m.sender, senderData)
    await m.react('💔')
    await m.reply(
        `💔 *PUTUS!*\n\n` +
        `@${m.sender.split('@')[0]}y @${exPartner.split('@')[0]}¡Responde el descanso!\n\n` +
        `¡Semoga se pone mejor!🙏`,
        { mentions: [m.sender, exPartner] }
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

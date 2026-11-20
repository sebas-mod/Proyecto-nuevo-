"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('../../src/lib/almiku-database.js');
const pluginConfig = {
    name: 'claninvite',
    alias: ['inviteclan'],
    category: 'clan',
    description: 'Invite & langsung tambahkan user ke clan',
    usage: '.claninvite @user',
    example: '.claninvite @user',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const db = _almikudatabasejs.getDatabase.call(void 0, )
    const user = db.getUser(m.sender)

    if (!_optionalChain([user, 'optionalAccess', _ => _.clanId])) return m.reply(`❌Aún no tienes un clan.`)
    if (!db.db.data.clans) db.db.data.clans = {}

    const clan = db.db.data.clans[user.clanId]
    if (!clan) return m.reply(`❌- ¿Qué?`)

    const target = _optionalChain([m, 'access', _2 => _2.mentionedJid, 'optionalAccess', _3 => _3[0]]) || _optionalChain([m, 'access', _4 => _4.quoted, 'optionalAccess', _5 => _5.sender])
    if (!target) {
        return m.reply(
            `📨 *CLAN INVITE*\n\n` +
            `Tag or responder user to invite\n\n` +
            `Ejemplo: *.claninvite @user*`
        )
    }

    if (target === m.sender) return m.reply(`❌No puedes invitarte a ti mismo`)

    const targetUser = db.getUser(target)
    if (_optionalChain([targetUser, 'optionalAccess', _6 => _6.clanId])) return m.reply(`❌El usuario ya tiene un clan`)
    if (clan.members.length >= 50) return m.reply(`❌- No te va a gustar esto.`)

    clan.members.push(target)
    db.setUser(target, { clanId: user.clanId })
    db.save()

    const emblem = clan.emblem || '🏰'

    await m.reply(
        `${emblem} *INVITED!*\n\n` +
        `@${target.split('@')[0]}# Cucarachado a #${clan.name}*\n` +
        `Members: ${clan.members.length}/50`,
        { mentions: [m.sender, target] }
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

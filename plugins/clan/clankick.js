"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
    name: 'clankick',
    alias: ['kickclan'],
    category: 'clan',
    description: 'Kickphoto del clan (sólo líder)',
    usage: '.clankick @user',
    example: '.clankick @user',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const user = db.getUser(m.sender)

    if (!_optionalChain([user, 'optionalAccess', _ => _.clanId])) return m.reply(`❌Aún no tienes un clan.`)
    if (!db.db.data.clans) db.db.data.clans = {}

    const clan = db.db.data.clans[user.clanId]
    if (!clan) return m.reply(`❌- ¿Qué?`)
    if (clan.leader !== m.sender) return m.reply(`❌Sólo un líder puede patear`)

    const target = _optionalChain([m, 'access', _2 => _2.mentionedJid, 'optionalAccess', _3 => _3[0]]) || _optionalChain([m, 'access', _4 => _4.quoted, 'optionalAccess', _5 => _5.sender])
    if (!target) {
        return m.reply(
            `👢 *CLAN KICK*\n\n` +
            `Tag or responder.\n\n` +
            `Ejemplo: *.clankick @user*`
        )
    }

    if (target === m.sender) return m.reply(`❌No puedes patearte`)
    if (!clan.members.includes(target)) return m.reply(`❌El usuario no es un cliente actual`)

    clan.members = clan.members.filter(jid => jid !== target)
    db.setUser(target, { clanId: null })
    db.save()

    const emblem = clan.emblem || '🏰'

    await m.reply(
        `${emblem} *KICKED*\n\n` +
        `@${target.split('@')[0]}eyectados de *${clan.name}*\n` +
        `Restante members:${clan.members.length}/50`,
        { mentions: [target] }
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

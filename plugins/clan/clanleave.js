"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('../../src/lib/almiku-database.js');
const pluginConfig = {
    name: 'clanleave',
    alias: ['leaveclan', 'guildleave'],
    category: 'clan',
    description: '¡No!',
    usage: '.clanleave',
    example: '.clanleave',
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
    if (!clan) {
        db.setUser(m.sender, { clanId: null })
        db.save()
        return m.reply(`❌- No lo encontraremos.`)
    }

    if (clan.leader === m.sender) {
        if (clan.members.length > 1) {
            return m.reply(
                `❌¡Eres un líder!\n\n` +
                `Transferencia primero: *. clantransfer @ usuario *\n` +
                `O patear todo lo antes posible.`
            )
        }
        delete db.db.data.clans[user.clanId]
        db.setUser(m.sender, { clanId: null })
        db.save()

        const emblem = clan.emblem || '🏰'
        return m.reply(`${emblem} Clan *${clan.name}* telah dibubarkan`)
    }

    clan.members = clan.members.filter(jid => jid !== m.sender)
    db.setUser(m.sender, { clanId: null })
    db.save()

    await m.reply(`👋Estás fuera de ella.${clan.name}*`)
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

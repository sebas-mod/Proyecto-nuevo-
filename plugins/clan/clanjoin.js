"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
    name: 'clanjoin',
    alias: ['joinclan', 'guildjoin'],
    category: 'clan',
    description: 'Gabung ke clan',
    usage: '.clanjoin <clan_id>',
    example: '.clanjoin clan_123456',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

const MAX_MEMBERS = 50

async function handler(m) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const user = db.getUser(m.sender)
    const clanId = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()])

    if (!clanId) {
        return m.reply(
            `🏰 *JOIN CLAN*\n\n` +
            `¡Pon un clan de identificación!\n\n` +
            `*. clanjin clanoka 123456 *\n` +
            `Comprobación de id: *. clanleaderboard *`
        )
    }

    if (user.clanId) {
        return m.reply(`❌Ya tienes un clan.\nSal primero: *. clanleave *.`)
    }

    if (!db.db.data.clans) db.db.data.clans = {}

    const clan = db.db.data.clans[clanId]
        || Object.values(db.db.data.clans).find(c => c.name.toLowerCase() === clanId.toLowerCase())
        || Object.values(db.db.data.clans).find(c => c.id.toLowerCase() === clanId.toLowerCase())
    if (!clan) return m.reply(`❌- ¿Qué?`)
    if (!clan.isOpen) return m.reply(`❌ *${clan.name}* Está cubierto`)
    if (clan.members.length >= MAX_MEMBERS) return m.reply(`❌ *${clan.name}* está lleno (${MAX_MEMBERS}/${MAX_MEMBERS})`)

    clan.members.push(m.sender)
    db.setUser(m.sender, { clanId })
    db.save()

    const emblem = clan.emblem || '🏰'

    await m.reply(
        `${emblem} *WELCOME!*\n\n` +
        `@${m.sender.split('@')[0]}# Cucarachado a #${clan.name}*\n\n` +
        `Leader: @${clan.leader.split('@')[0]}\n` +
        `Members: ${clan.members.length}/${MAX_MEMBERS}\n\n` +
        `Mira la información: *. claninfo *`,
        { mentions: [m.sender, clan.leader] }
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

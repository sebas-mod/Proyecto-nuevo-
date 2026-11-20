"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
    name: 'clanmembers',
    alias: ['clanmember', 'guildmembers'],
    category: 'clan',
    description: 'Lihat daftar member clan',
    usage: '.clanmembers',
    example: '.clanmembers',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
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

    const emblem = clan.emblem || '🏰'
    const mentions = []

    const memberLines = clan.members.map((jid, i) => {
        const memberUser = db.getUser(jid)
        const isLeader = jid === clan.leader
        const level = _optionalChain([memberUser, 'optionalAccess', _2 => _2.rpg, 'optionalAccess', _3 => _3.level]) || _optionalChain([memberUser, 'optionalAccess', _4 => _4.level]) || 1
        const koin = (_optionalChain([memberUser, 'optionalAccess', _5 => _5.koin]) || 0).toLocaleString('id-ID')
        mentions.push(jid)

        const role = isLeader ? '👑' : '•'
        return `${role} @${jid.split('@')[0]}  Lv.${level} · Rp ${koin}`
    })

    await m.reply(
        `${emblem} *${clan.name}* — Members\n\n` +
        memberLines.join('\n') +
        `\n\n${clan.members.length}/50 members`,
        { mentions }
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

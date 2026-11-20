"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('../../src/lib/almiku-database.js');
const pluginConfig = {
    name: 'claninfo',
    alias: ['infoclan', 'myclan', 'guildinfo'],
    category: 'clan',
    description: 'Lihat info clan',
    usage: '.claninfo [clan_id]',
    example: '.claninfo',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function expBar(exp, nextLevel) {
    const target = nextLevel * 10000
    const progress = Math.min(exp / target, 1)
    const filled = Math.round(progress * 10)
    return '█'.repeat(filled) + '░'.repeat(10 - filled) + ` ${(progress * 100).toFixed(0)}%`
}

function getRankTitle(level) {
    if (level >= 50) return '👑 Legendary'
    if (level >= 30) return '💎 Diamond'
    if (level >= 20) return '🏆 Platinum'
    if (level >= 10) return '🥇 Gold'
    if (level >= 5) return '🥈 Silver'
    return '🥉 Bronze'
}

async function handler(m) {
    const db = _almikudatabasejs.getDatabase.call(void 0, )
    const user = db.getUser(m.sender)
    let clanId = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]) || _optionalChain([user, 'optionalAccess', _4 => _4.clanId])

    if (!clanId) {
        return m.reply(
            `❌Aún no tienes un clan.\n\n` +
            `Crea: *.clancreate<nama>*\n` +
            `Unirse: *.clanjoin<id>*`
        )
    }

    if (!db.db.data.clans) db.db.data.clans = {}

    const clan = db.db.data.clans[clanId]
        || Object.values(db.db.data.clans).find(c => c.name.toLowerCase() === clanId.toLowerCase())
        || Object.values(db.db.data.clans).find(c => c.id.toLowerCase() === clanId.toLowerCase())
    if (!clan) return m.reply(`❌- ¿Qué?`)

    const totalGames = (clan.wins || 0) + (clan.losses || 0)
    const winRate = totalGames > 0
        ? ((clan.wins / totalGames) * 100).toFixed(1)
        : '—'

    const rank = getRankTitle(clan.level || 1)
    const emblem = clan.emblem || '🏰'
    const bar = expBar(clan.exp || 0, clan.level || 1)

    await m.reply(
        `${emblem} *${clan.name}*\n` +
        `${rank} · Level ${clan.level || 1}\n\n` +
        `EXP  ${bar}\n\n` +
        `┌ 👑 Leader · @${clan.leader.split('@')[0]}\n` +
        `├ 👥 Members · ${clan.members.length}/50\n` +
        `├ 🔓 Status · ${clan.isOpen ? 'Open' : 'Closed'}\n` +
        `└ 📅Creado· ${new Date(clan.createdAt).toLocaleDateString('es-AR')}\n\n` +
        `⚔️ *War Stats*\n` +
        `${clan.wins || 0}W · ${clan.losses || 0}L · ${winRate}% WR\n\n` +
        `_${clan.description || 'Belum ada deskripsi'}_\n\n` +
        `ID: \`${clan.id}\``,
        { mentions: [clan.leader] }
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

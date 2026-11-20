"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
    name: 'clanwar',
    alias: ['war', 'guildwar'],
    category: 'clan',
    description: 'War melawan clan lain',
    usage: '.clanwar <clan_id>',
    example: '.clanwar clan_123456',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3600,
    energi: 0,
    isEnabled: true
}

const REWARDS = {
    koinWin: 30000,
    koinLose: 6000,
    expWin: 15000,
    expLose: 3000,
    energiWin: 15,
    energiLose: 3,
    clanExpWin: 5000,
    clanExpLose: 1000
}

function calculatePower(db, clan) {
    let totalPower = 0
    for (const jid of clan.members) {
        const user = db.getUser(jid)
        const level = _optionalChain([user, 'optionalAccess', _ => _.rpg, 'optionalAccess', _2 => _2.level]) || _optionalChain([user, 'optionalAccess', _3 => _3.level]) || 1
        const exp = _optionalChain([user, 'optionalAccess', _4 => _4.rpg, 'optionalAccess', _5 => _5.exp]) || _optionalChain([user, 'optionalAccess', _6 => _6.exp]) || 0
        totalPower += (level * 100) + (exp / 10)
    }
    totalPower += (clan.level || 1) * 500
    totalPower += (clan.wins || 0) * 50
    return Math.floor(totalPower)
}

function getScaledRewards(clan) {
    const level = clan.level || 1
    const mult = 1 + (level * 0.1)
    return {
        koinWin: Math.floor(REWARDS.koinWin * mult),
        koinLose: Math.floor(REWARDS.koinLose * mult),
        expWin: Math.floor(REWARDS.expWin * mult),
        expLose: Math.floor(REWARDS.expLose * mult),
        energiWin: Math.floor(REWARDS.energiWin * mult),
        energiLose: Math.floor(REWARDS.energiLose * mult)
    }
}

function simulateWar(power1, power2) {
    const total = power1 + power2
    return Math.random() < (power1 / total) ? 1 : 2
}

function powerBar(p1, p2) {
    const total = p1 + p2
    const ratio = Math.round((p1 / total) * 10)
    return '🟩'.repeat(ratio) + '🟥'.repeat(10 - ratio)
}

async function handler(m) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const user = db.getUser(m.sender)
    const targetClanId = _optionalChain([m, 'access', _7 => _7.text, 'optionalAccess', _8 => _8.trim, 'call', _9 => _9()])

    if (!_optionalChain([user, 'optionalAccess', _10 => _10.clanId])) return m.reply(`❌Aún no tienes un clan.`)

    if (!targetClanId) {
        return m.reply(
            `⚔️ *CLAN WAR*\n\n` +
            `¡Otro desafío a la guerra!\n\n` +
            `*. clanwar clankhank12346 *\n` +
            `Comprobación de id: *. clanleaderboard *\n\n` +
            `Süat: Mínimo 3 foto por clan\n` +
            `Refrigeración: 1 hora`
        )
    }

    if (!db.db.data.clans) db.db.data.clans = {}

    const myClan = db.db.data.clans[user.clanId]
    const enemyClan = db.db.data.clans[targetClanId]
        || Object.values(db.db.data.clans).find(c => c.name.toLowerCase() === targetClanId.toLowerCase())
        || Object.values(db.db.data.clans).find(c => c.id.toLowerCase() === targetClanId.toLowerCase())

    if (!myClan) return m.reply(`❌No se encuentra.`)
    if (!enemyClan) return m.reply(`❌- La forma en que estás mirando... - # La forma en que estás mirando #`)
    if (user.clanId === targetClanId) return m.reply(`❌No puede la guerra contra un clan por sí mismo`)
    if (myClan.members.length < 3) return m.reply(`❌Necesitas tener un mínimo de 3 disparos`)
    if (enemyClan.members.length < 3) return m.reply(`❌Burke oponente necesita un mínimo de 3 fotos`)

    const myPower = calculatePower(db, myClan)
    const enemyPower = calculatePower(db, enemyClan)
    const winner = simulateWar(myPower, enemyPower)
    const isWin = winner === 1

    const myR = getScaledRewards(myClan)
    const enemyR = getScaledRewards(enemyClan)

    if (isWin) {
        myClan.wins = (myClan.wins || 0) + 1
        myClan.exp = (myClan.exp || 0) + REWARDS.clanExpWin
        enemyClan.losses = (enemyClan.losses || 0) + 1
        enemyClan.exp = (enemyClan.exp || 0) + REWARDS.clanExpLose

        for (const jid of myClan.members) {
            db.updateKoin(jid, myR.koinWin)
            db.updateExp(jid, myR.expWin)
            db.updateEnergi(jid, myR.energiWin)
        }
        for (const jid of enemyClan.members) {
            db.updateKoin(jid, enemyR.koinLose)
            db.updateExp(jid, enemyR.expLose)
            db.updateEnergi(jid, enemyR.energiLose)
        }
    } else {
        myClan.losses = (myClan.losses || 0) + 1
        myClan.exp = (myClan.exp || 0) + REWARDS.clanExpLose
        enemyClan.wins = (enemyClan.wins || 0) + 1
        enemyClan.exp = (enemyClan.exp || 0) + REWARDS.clanExpWin

        for (const jid of myClan.members) {
            db.updateKoin(jid, myR.koinLose)
            db.updateExp(jid, myR.expLose)
            db.updateEnergi(jid, myR.energiLose)
        }
        for (const jid of enemyClan.members) {
            db.updateKoin(jid, enemyR.koinWin)
            db.updateExp(jid, enemyR.expWin)
            db.updateEnergi(jid, enemyR.energiWin)
        }
    }

    myClan.level = Math.floor(myClan.exp / 10000) + 1
    enemyClan.level = Math.floor(enemyClan.exp / 10000) + 1
    db.save()

    const myE = myClan.emblem || '🏰'
    const enE = enemyClan.emblem || '🏰'
    const bar = powerBar(myPower, enemyPower)
    const winnerClan = isWin ? myClan : enemyClan
    const winnerE = isWin ? myE : enE
    const r = isWin ? myR : myR

    let txt = `⚔️ *WAR RESULT*\n\n`
    txt += `${myE} *${myClan.name}*  vs  *${enemyClan.name}* ${enE}\n`
    txt += `💪 ${myPower.toLocaleString('id-ID')}  vs  ${enemyPower.toLocaleString('id-ID')}\n`
    txt += `${bar}\n\n`
    txt += `${winnerE} *${winnerClan.name} WINS!*\n\n`

    if (isWin) {
        txt += `🎁 Reward per member:\n`
        txt += `+Rp ${myR.koinWin.toLocaleString('id-ID')} · +${myR.expWin.toLocaleString('id-ID')} EXP · +${myR.energiWin} Energi\n`
        txt += `+${REWARDS.clanExpWin.toLocaleString('id-ID')} Clan EXP`
    } else {
        txt += `😔 Konsolasi per member:\n`
        txt += `+Rp ${myR.koinLose.toLocaleString('id-ID')} · +${myR.expLose.toLocaleString('id-ID')} EXP · +${myR.energiLose} Energi\n`
        txt += `+${REWARDS.clanExpLose.toLocaleString('id-ID')} Clan EXP`
    }

    await m.reply(txt)
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
    name: 'clancreate',
    alias: ['createclan', 'guildcreate'],
    category: 'clan',
    description: 'Buat clan baru',
    usage: '.clancreate <nama>',
    example: '.clancreate DragonSlayer',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

const CLAN_CREATE_COST = 50000
const MAX_CLAN_NAME = 20
const CLAN_EMBLEMS = ['🐉', '🦅', '🐺', '🦁', '🔥', '⚡', '🌙', '☀️', '💎', '🗡️']

function generateShortId(name, existingClans) {
    const clean = name.replace(/[^a-zA-Z]/g, '').toUpperCase()
    let id = clean.length >= 3 ? clean.slice(0, 3) : clean.padEnd(3, 'X')
    if (!existingClans[id]) return id
    id = clean.slice(0, 4) || id
    if (!existingClans[id]) return id
    for (let i = 1; i <= 99; i++) {
        const attempt = clean.slice(0, 3) + i
        if (!existingClans[attempt]) return attempt
    }
    return clean.slice(0, 2) + Math.random().toString(36).slice(2, 5).toUpperCase()
}

async function handler(m) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const user = db.getUser(m.sender)
    const clanName = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()])

    if (!clanName) {
        return m.reply(
            `⚔️ *CREATE CLAN*\n\n` +
            `¡Abran clan y levanten las fotos!\n\n` +
            `Coste: *Rp${CLAN_CREATE_COST.toLocaleString('es-AR')}*\n` +
            `Maxnombre: *${MAX_CLAN_NAME}caracter*\n\n` +
            `*. clancreate DragonSlayer *`
        )
    }

    if (clanName.length > MAX_CLAN_NAME) {
        return m.reply(`❌Nombre del clan máximo${MAX_CLAN_NAME}caracter`)
    }

    if (!/^[a-zA-Z0-9\s]+$/.test(clanName)) {
        return m.reply(`❌Nombre del clan sólo permitido para letra, número y espacio`)
    }

    if (!db.db.data.clans) db.db.data.clans = {}

    if (user.clanId) {
        return m.reply(`❌Ya tienes un clan.\nSal primero: *. clanleave *.`)
    }

    const existingClan = Object.values(db.db.data.clans).find(c => c.name.toLowerCase() === clanName.toLowerCase())
    if (existingClan) {
        return m.reply(`❌Nombre *${clanName}* Ya utilizado`)
    }

    if ((user.koin || 0) < CLAN_CREATE_COST) {
        return m.reply(
            `❌Kain no es suficiente\n\n` +
            `Necesito: *Rp${CLAN_CREATE_COST.toLocaleString('es-AR')}*\n` +
            `Tener: *Rp${(user.koin || 0).toLocaleString('es-AR')}*`
        )
    }

    const emblem = CLAN_EMBLEMS[Math.floor(Math.random() * CLAN_EMBLEMS.length)]
    const clanId = generateShortId(clanName, db.db.data.clans)
    const clan = {
        id: clanId,
        name: clanName,
        emblem,
        leader: m.sender,
        members: [m.sender],
        exp: 0,
        level: 1,
        wins: 0,
        losses: 0,
        createdAt: new Date().toISOString(),
        description: 'Eram tiene una descripción',
        isOpen: true
    }

    db.db.data.clans[clanId] = clan
    db.updateKoin(m.sender, -CLAN_CREATE_COST)
    db.setUser(m.sender, { clanId })
    await db.save()

    await m.reply(
        `${emblem} *CLAN CREATED*\n\n` +
        `*${clanName}*\n` +
        `Leader: @${m.sender.split('@')[0]}\n` +
        `Status: Open · 1/50 members\n\n` +
        `_-Rp ${CLAN_CREATE_COST.toLocaleString('es-AR')}_\n\n` +
        `Invitar amigo: *. claninvite @ usuario *\n` +
        `O share id: *${clanId}*`,
        { mentions: [m.sender] }
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

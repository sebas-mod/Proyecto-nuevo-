"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourintimejs = require('../../src/lib/ourin-time.js'); var timeHelper = _interopRequireWildcard(_ourintimejs);
const pluginConfig = {
    name: 'listsewa',
    alias: ['sewalist', 'daftarsewa'],
    category: 'owner',
    description: 'Ver una lista de grupos firmados',
    usage: '.listsewa',
    example: '.listsewa',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function formatCountdown(data) {
    if (data.status === 'expired') return '🚫 EXPIRED (left)'
    if (data.isLifetime) return '♾️ Permanent'
    const diff = data.expiredAt - Date.now()
    if (diff <= 0) return '❌ EXPIRED'
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
}

function getStatusEmoji(data) {
    if (data.status === 'expired') return '🚫'
    if (data.isLifetime) return '♾️'
    const diff = data.expiredAt - Date.now()
    if (diff <= 0) return '❌'
    if (diff <= 259200000) return '⚠️'
    return '✅'
}

function handler(m) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    if (!db.db.data.sewa) {
        db.db.data.sewa = { enabled: false, groups: {} }
        db.db.write()
    }

    const sewaGroups = db.db.data.sewa.groups || {}
    const groupIds = Object.keys(sewaGroups)

    if (groupIds.length === 0) {
        return m.reply(
            `📋*Registrate Alquiler*\n\n` +
            `Status: *${db.db.data.sewa.enabled ? '✅ AKTIF' : '❌ NONAKTIF'}*\n` +
            `Aún no es un grupo firmado\n\n` +
            `Añadir con: *${m.prefix}addsewa <link> <durasi>*`
        )
    }

    const sorted = groupIds.sort((a, b) => {
        const aData = sewaGroups[a]
        const bData = sewaGroups[b]
        if (aData.isLifetime && !bData.isLifetime) return 1
        if (!aData.isLifetime && bData.isLifetime) return -1
        return (aData.expiredAt || 0) - (bData.expiredAt || 0)
    })

    const active = sorted.filter(id => sewaGroups[id].isLifetime || sewaGroups[id].expiredAt > Date.now())
    const expired = sorted.filter(id => !sewaGroups[id].isLifetime && sewaGroups[id].expiredAt <= Date.now())

    let text = `📋*Registrate Alquiler*\n\n`
    text += `Estado del sistema: *${db.db.data.sewa.enabled ? '✅ AKTIF' : '❌ NONAKTIF'}*\n`
    text += `Total: *${groupIds.length}* grupo (${active.length}activo,${expired.length} expired)\n\n`

    for (let i = 0; i < sorted.length; i++) {
        const gid = sorted[i]
        const data = sewaGroups[gid]
        const status = getStatusEmoji(data)
        const countdown = formatCountdown(data)
        const addedDate = data.addedAt ? timeHelper.fromTimestamp(data.addedAt, 'DD/MM/YYYY') : '-'

        text += `${status} *${i + 1}. ${data.name || 'Unknown'}*\n`
        text += `   ID: ${gid.split('@')[0]}\n`
        text += `Restante:${countdown}\n`
        text += `Anadido:${addedDate}\n\n`
    }

    text += `*AKSI:*\n`
    text += `• *${m.prefix}renewsewa <id> <durasi>* — Perpanjang\n`
    text += `• *${m.prefix}delsewa<id>*—Retirar de la lista blanca`

    return m.reply(text)
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

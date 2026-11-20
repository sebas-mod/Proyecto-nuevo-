"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourintimejs = require('../../src/lib/ourin-time.js'); var timeHelper = _interopRequireWildcard(_ourintimejs);
const pluginConfig = {
    name: 'checksewa',
    alias: ['ceksewa', 'sisasewa'],
    category: 'group',
    description: 'Compruebe el alquiler @-@ a @-@ hora bot en este grupo',
    usage: '.checksewa',
    example: '.checksewa',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

function formatCountdown(expiredAt) {
    const diff = expiredAt - Date.now()
    if (diff <= 0) return { text: 'EXPIRED', expired: true }
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    let text = ''
    if (days > 0) text += `${days}el`
    if (hours > 0) text += `${hours}hora`
    if (minutes > 0 && days === 0) text += `${minutes}minuto`
    return { text: text.trim(), expired: false }
}

function handler(m) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    if (!db.db.data.sewa) {
        db.db.data.sewa = { enabled: false, groups: {} }
        db.db.write()
    }

    if (!db.db.data.sewa.enabled) {
        return m.reply(`* El alquiller de Sistem está desactivado *\n\nEsto es un uso para todos.`)
    }

    const sewaData = db.db.data.sewa.groups[m.chat]

    if (!sewaData) {
        return m.reply(`❌Este grupo no está registrado en el sistema de alquileres\n\nLlame al bot propietario para las IV.`)
    }

    const groupName = sewaData.name || m.chat.split('@')[0]
    const addedDate = sewaData.addedAt ? timeHelper.fromTimestamp(sewaData.addedAt, 'D MMMM YYYY') : '-'

    if (sewaData.isLifetime) {
        m.react('♾️')
        return m.reply(
            `♾SETUS SETUS\n\n` +
            `Grupo: *${groupName}*\n` +
            `Status: *Permanent* ♾️\n` +
            `Registrado después de: *${addedDate}*\n\n` +
            `Lamento que siempre haya estado activo en este grupo.`
        )
    }

    const countdown = formatCountdown(sewaData.expiredAt)
    const expiredStr = timeHelper.fromTimestamp(sewaData.expiredAt, 'D MMMM YYYY HH:mm')

    if (countdown.expired) {
        return m.reply(
            `❌*Alquiler EXPIRED*\n\n` +
            `Grupo: *${groupName}*\n` +
            `Berakhir: *${expiredStr}*\n\n` +
            `Llame al propietario bot para un contrato de arrendamiento largo.`
        )
    }

    const diff = sewaData.expiredAt - Date.now()
    const isAlmostExpired = diff <= 259200000

    m.react(isAlmostExpired ? '⚠️' : '⏱️')
    let text = `⏱SETUS SETUS\n\n`
    text += `Grupo: *${groupName}*\n`
    text += `Tiempo de ahorro: *${countdown.text}*\n`
    text += `Berakhir: *${expiredStr}*\n`
    text += `Registrado después de: *${addedDate}*`

    if (isAlmostExpired) {
        text += `\n\n⚠¡Hyjwa casi! El dueño de Hankuni bot por mucho tiempo.`
    }

    return m.reply(text)
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

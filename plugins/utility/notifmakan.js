"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinnotifschedulerjs = require('../../src/lib/ourin-notif-scheduler.js');

const pluginConfig = {
    name: 'notifmakan',
    alias: ['jadwalmakan', 'makanreminder'],
    category: 'group',
    description: 'Auto recordatorio de alimentación',
    usage: '.notifmakan on <hora1,hora2,...> [menú] / off / edit <hora1,hora2,...> [menú]',
    example: '.notifmakan on 07.00,12.00,19.00 Nasi Padang',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const args = m.args || []
    const sub = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()])
    const chatJid = m.chat
    const sender = m.sender

    const existing = _ourinnotifschedulerjs.getNotif.call(void 0, 'makan', sender, chatJid)

    if (!sub || !['on', 'off', 'edit'].includes(sub)) {
        const status = existing
            ? (existing.enabled ? '✅ Aktif' : '❌ Nonaktif')
            : '⚪Aún no configurado'

        let info = `🍽*El alimento Recordar*\n\n`
        info += `📌 *Status:* ${status}\n`

        if (existing) {
            info += `⏰ *Jadwal:* ${existing.jadwal.map(j => `*${j}* ART`).join(', ')}\n`
            if (existing.menu) info += `🍴* Menú: *${existing.menu}_\n`
        }

        info += `\n*📋Como usarlo:*\n`
        info += `> \`${m.prefix}notifmakan on 07.00,12.00,19.00\`\n`
        info += `> \`${m.prefix}notifmakan on 07.00,12.00 Arroz Goreng\`\n`
        info += `> \`${m.prefix}notifmakan edit 08.00,13.00\`\n`
        info += `> \`${m.prefix}notifmakan off\`\n`
        info += `\n•💡Las horas pueden usar un cero o un dos ( 07. 00 / 07: 00 ) _\n`
        info += `•💡# Doble hora puede, rompe con comas #`

        return m.reply(info)
    }

    if (sub === 'off') {
        if (!existing) {
            return m.reply(`❌* No hay una sola persona que esté comiendo * en este gráfico`)
        }
        _ourinnotifschedulerjs.toggleNotif.call(void 0, 'makan', sender, chatJid, false)
        return m.reply(`✅*El recordatorio de comida está desactivado*🔕\n\n> Escribe\`${m.prefix}notifmakan not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not not\`para reactivar`)
    }

    if (sub === 'on') {
        if (_optionalChain([existing, 'optionalAccess', _4 => _4.enabled]) && args.length === 1) {
            return m.reply(`⚠* Hombre > * ¡Apoyando a Lining Man!\n\n⏰Programado:${existing.jadwal.map(j => `*${j}*`).join(', ')}¡Vaya!\n\n> Usa \`${m.prefix}notifmakan se edita\`cambiar el habilitado`)
        }

        if (existing && args.length === 1) {
            _ourinnotifschedulerjs.toggleNotif.call(void 0, 'makan', sender, chatJid, true)
            return m.reply(`✅>#91; ¡El recordatorio de alimentos es re activado! ]🔔\n\n⏰Programado:${existing.jadwal.map(j => `*${j}*`).join(', ')} ART`)
        }

        const timeInput = args[1]
        if (!timeInput) {
            return m.reply(`❌* Pon algo de comida!\n\n> Ejemplo:\`${m.prefix}notifmakan on 07.00,12.00,19.00\``)
        }

        const jadwal = _ourinnotifschedulerjs.parseJadwal.call(void 0, timeInput)
        if (jadwal.length === 0) {
            return m.reply(`❌= = Sincronización, corregido por elderman = =\n\n* Gunwill formfort * HH. * * o * HH: MM *\n> Ejemplo:\`07. 00, 12. 30, 19. 00.\``)
        }

        const menu = args.slice(2).join(' ').trim()
        _ourinnotifschedulerjs.setNotifMakan.call(void 0, sender, chatJid, jadwal, menu)

        let reply = `✅> #91; ¡El recordatorio de comida está encendido!🔔\n\n`
        reply += `⏰ *Jadwal:*\n`
        for (const j of jadwal) {
            const label = getMealLabel(j)
            reply += `> 🕐 *${j}* ART _(${label})_\n`
        }
        if (menu) reply += `\n🍴* Menú: *${menu}_`
        reply += `\n\n•💡" Las notificaciones se enviarán a este gráfico todos los días ".`

        return m.reply(reply)
    }

    if (sub === 'edit') {
        if (!existing) {
            return m.reply(`❌* No un recordatorio de comida!\n\nDisfruta del espectáculo.\`${m.prefix}notifmakan on 07.00,12.00,19.00\``)
        }

        const timeInput = args[1]
        if (!timeInput) {
            return m.reply(`❌¡Pon una bolsa nueva!\n\n> Ejemplo:\`${m.prefix}notifmakan edit 08.00,13.00,20.00\``)
        }

        const jadwal = _ourinnotifschedulerjs.parseJadwal.call(void 0, timeInput)
        if (jadwal.length === 0) {
            return m.reply(`❌= = Sincronización, corregido por elderman = =\n\n* Gunwill formfort * HH. * * o * HH: MM *\n> Ejemplo:\`8: 00, 13: 00, 20: 00.\``)
        }

        const menu = args.slice(2).join(' ').trim() || existing.menu || ''
        _ourinnotifschedulerjs.setNotifMakan.call(void 0, sender, chatJid, jadwal, menu)

        let reply = `✅ *Jadwal come diperbarui!* ✏\n\n`
        reply += `⏰*Jadwal nuevo:*\n`
        for (const j of jadwal) {
            const label = getMealLabel(j)
            reply += `> 🕐 *${j}* ART _(${label})_\n`
        }
        if (menu) reply += `\n🍴* Menú: *${menu}_`

        return m.reply(reply)
    }
}

function getMealLabel(jam) {
    const hour = parseInt(jam.split(':')[0], 10)
    if (hour >= 4 && hour < 10) return 'pagi'
    if (hour >= 10 && hour < 15) return 'siang'
    if (hour >= 15 && hour < 18) return 'sore'
    return 'malam'
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

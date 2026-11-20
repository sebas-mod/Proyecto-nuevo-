"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinnotifschedulerjs = require('../../src/lib/ourin-notif-scheduler.js');

const pluginConfig = {
    name: 'notiftidur',
    alias: ['jadwaltidur', 'tidurreminder', 'sleepreminder'],
    category: 'group',
    description: 'Recordatorio de memoria Auto @-@',
    usage: '.notiftidur on <jam1,jam2,...> / off / edit <jam1,jam2,...>',
    example: '.notiftidur on 22.00',
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

    const existing = _ourinnotifschedulerjs.getNotif.call(void 0, 'tidur', sender, chatJid)

    if (!sub || !['on', 'off', 'edit'].includes(sub)) {
        const status = existing
            ? (existing.enabled ? '✅ Aktif' : '❌ Nonaktif')
            : '⚪Aún no configurado'

        let info = `🌙*PENGINGAT Duerme*\n\n`
        info += `📌 *Status:* ${status}\n`

        if (existing) {
            info += `⏰ *Jadwal:* ${existing.jadwal.map(j => `*${j}* WIB`).join(', ')}\n`
        }

        info += `\n*📋Como usarlo:*\n`
        info += `> \`${m.prefix}notiftidur on 22.00\`\n`
        info += `> \`${m.prefix}notiftidur on 22.00,23.30\`\n`
        info += `> \`${m.prefix}notiftidur edit 23.00\`\n`
        info += `> \`${m.prefix}notiftidur off\`\n`
        info += `\n♪💡Las horas pueden usar un punto o punto dos ( 22. 00 / 22: 00 ) _\n`
        info += `♪💡# Doble hora puede, rompe con comas #`

        return m.reply(info)
    }

    if (sub === 'off') {
        if (!existing) {
            return m.reply(`❌* Por no mencionar el recordatorio de dormir * en este gráfico`)
        }
        _ourinnotifschedulerjs.toggleNotif.call(void 0, 'tidur', sender, chatJid, false)
        return m.reply(`✅*Recorde de dormir desactivado*🔕\n\n> Escribe\`${m.prefix}durmiendo\`para reactivar`)
    }

    if (sub === 'on') {
        if (_optionalChain([existing, 'optionalAccess', _4 => _4.enabled]) && args.length === 1) {
            return m.reply(`⚠- [ Sleeping Beauty ] - [ Sleeping Beauty Opens > - [ Sleeping *\n\n⏰Programado:${existing.jadwal.map(j => `*${j}*`).join(', ')}¡Vaya!\n\n> Usa \`${m.prefix}Edición de la notificación del sueño\`cambiar el habilitado`)
        }

        if (existing && args.length === 1) {
            _ourinnotifschedulerjs.toggleNotif.call(void 0, 'tidur', sender, chatJid, true)
            return m.reply(`✅* Recordatorio de sueño reactivado! *🔔\n\n⏰Programado:${existing.jadwal.map(j => `*${j}*`).join(', ')} WIB`)
        }

        const timeInput = args[1]
        if (!timeInput) {
            return m.reply(`❌* Ponte la ropa de dormir!\n\n> Ejemplo:\`${m.prefix}notiftidur on 22.00\``)
        }

        const jadwal = _ourinnotifschedulerjs.parseJadwal.call(void 0, timeInput)
        if (jadwal.length === 0) {
            return m.reply(`❌= = Sincronización, corregido por elderman = =\n\n* Gunwill formfort * HH. * * o * HH: MM *\n> Ejemplo:\`22. 00\`o\`23\``)
        }

        _ourinnotifschedulerjs.setNotifTidur.call(void 0, sender, chatJid, jadwal)

        let reply = `✅* ¡El recordatorio de sueño es activo! ]🔔\n\n`
        reply += `⏰ *Jadwal:*\n`
        for (const j of jadwal) {
            reply += `> 🕐 *${j}* WIB\n`
        }
        reply += `\n♪💡" Las notificaciones se enviarán a este gráfico todos los días ".`

        return m.reply(reply)
    }

    if (sub === 'edit') {
        if (!existing) {
            return m.reply(`❌* No un recordatorio de dormir! *\n\nDisfruta del espectáculo.\`${m.prefix}notiftidur on 22.00\``)
        }

        const timeInput = args[1]
        if (!timeInput) {
            return m.reply(`❌¡Pon una bolsa nueva!\n\n> Ejemplo:\`${m.prefix}notiftidur edit 23.00\``)
        }

        const jadwal = _ourinnotifschedulerjs.parseJadwal.call(void 0, timeInput)
        if (jadwal.length === 0) {
            return m.reply(`❌= = Sincronización, corregido por elderman = =\n\n* Gunwill formfort * HH. * * o * HH: MM *\n> Ejemplo:\`23. 00\`o\`22. 30\``)
        }

        _ourinnotifschedulerjs.setNotifTidur.call(void 0, sender, chatJid, jadwal)

        let reply = `✅* Tiempo de cama actualizado!✏♪\n\n`
        reply += `⏰*Jadwal nuevo:*\n`
        for (const j of jadwal) {
            reply += `> 🕐 *${j}* WIB\n`
        }

        return m.reply(reply)
    }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

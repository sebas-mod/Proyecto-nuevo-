"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinnotifschedulerjs = require('../../src/lib/ourin-notif-scheduler.js');

const pluginConfig = {
    name: 'notifmakan',
    alias: ['jadwalmakan', 'makanreminder'],
    category: 'group',
    description: 'Atur pengingat waktu makan otomatis',
    usage: '.notifmakan on <jam1,jam2,...> [menu] / off / edit <jam1,jam2,...> [menu]',
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
            : '⚪ Belum diatur'

        let info = `🍽️ *PENGINGAT MAKAN*\n\n`
        info += `📌 *Status:* ${status}\n`

        if (existing) {
            info += `⏰ *Jadwal:* ${existing.jadwal.map(j => `*${j}* WIB`).join(', ')}\n`
            if (existing.menu) info += `🍴 *Menu:* _${existing.menu}_\n`
        }

        info += `\n*📋 Cara Pakai:*\n`
        info += `> \`${m.prefix}notifmakan on 07.00,12.00,19.00\`\n`
        info += `> \`${m.prefix}notifmakan on 07.00,12.00 Nasi Goreng\`\n`
        info += `> \`${m.prefix}notifmakan edit 08.00,13.00\`\n`
        info += `> \`${m.prefix}notifmakan off\`\n`
        info += `\n> 💡 _Jam bisa pakai titik atau titik dua (07.00 / 07:00)_\n`
        info += `> 💡 _Bisa multiple jam, pisahkan pakai koma_`

        return m.reply(info)
    }

    if (sub === 'off') {
        if (!existing) {
            return m.reply(`❌ *Belum ada pengingat makan* yang aktif di chat ini`)
        }
        _ourinnotifschedulerjs.toggleNotif.call(void 0, 'makan', sender, chatJid, false)
        return m.reply(`✅ *Pengingat makan dinonaktifkan* 🔕\n\n> Ketik \`${m.prefix}notifmakan on\` untuk mengaktifkan kembali`)
    }

    if (sub === 'on') {
        if (_optionalChain([existing, 'optionalAccess', _4 => _4.enabled]) && args.length === 1) {
            return m.reply(`⚠️ *Pengingat makan sudah aktif!*\n\n⏰ Jadwal: ${existing.jadwal.map(j => `*${j}*`).join(', ')} WIB\n\n> Gunakan \`${m.prefix}notifmakan edit\` untuk mengubah jadwal`)
        }

        if (existing && args.length === 1) {
            _ourinnotifschedulerjs.toggleNotif.call(void 0, 'makan', sender, chatJid, true)
            return m.reply(`✅ *Pengingat makan diaktifkan kembali!* 🔔\n\n⏰ Jadwal: ${existing.jadwal.map(j => `*${j}*`).join(', ')} WIB`)
        }

        const timeInput = args[1]
        if (!timeInput) {
            return m.reply(`❌ *Masukkan jadwal makan!*\n\n> Contoh: \`${m.prefix}notifmakan on 07.00,12.00,19.00\``)
        }

        const jadwal = _ourinnotifschedulerjs.parseJadwal.call(void 0, timeInput)
        if (jadwal.length === 0) {
            return m.reply(`❌ *Format jam salah!*\n\n> Gunakan format *HH.MM* atau *HH:MM*\n> Contoh: \`07.00,12.30,19.00\``)
        }

        const menu = args.slice(2).join(' ').trim()
        _ourinnotifschedulerjs.setNotifMakan.call(void 0, sender, chatJid, jadwal, menu)

        let reply = `✅ *Pengingat makan aktif!* 🔔\n\n`
        reply += `⏰ *Jadwal:*\n`
        for (const j of jadwal) {
            const label = getMealLabel(j)
            reply += `> 🕐 *${j}* WIB _(${label})_\n`
        }
        if (menu) reply += `\n🍴 *Menu:* _${menu}_`
        reply += `\n\n> 💡 _Notifikasi akan dikirim ke chat ini setiap hari_`

        return m.reply(reply)
    }

    if (sub === 'edit') {
        if (!existing) {
            return m.reply(`❌ *Belum ada pengingat makan!*\n\n> Aktifkan dulu: \`${m.prefix}notifmakan on 07.00,12.00,19.00\``)
        }

        const timeInput = args[1]
        if (!timeInput) {
            return m.reply(`❌ *Masukkan jadwal baru!*\n\n> Contoh: \`${m.prefix}notifmakan edit 08.00,13.00,20.00\``)
        }

        const jadwal = _ourinnotifschedulerjs.parseJadwal.call(void 0, timeInput)
        if (jadwal.length === 0) {
            return m.reply(`❌ *Format jam salah!*\n\n> Gunakan format *HH.MM* atau *HH:MM*\n> Contoh: \`08.00,13.00,20.00\``)
        }

        const menu = args.slice(2).join(' ').trim() || existing.menu || ''
        _ourinnotifschedulerjs.setNotifMakan.call(void 0, sender, chatJid, jadwal, menu)

        let reply = `✅ *Jadwal makan diperbarui!* ✏️\n\n`
        reply += `⏰ *Jadwal baru:*\n`
        for (const j of jadwal) {
            const label = getMealLabel(j)
            reply += `> 🕐 *${j}* WIB _(${label})_\n`
        }
        if (menu) reply += `\n🍴 *Menu:* _${menu}_`

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

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinlidjs = require('../../src/lib/ourin-lid.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'warn',
    alias: ['warning', 'peringatan'],
    category: 'group',
    description: 'Memberi peringatan kepada member',
    usage: '.warn @user <alasan>',
    example: '.warn @user spam',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    
    let groupData = db.getGroup(m.chat) || {}
    let warnings = groupData.warnings || {}
    const maxWarns = groupData.maxWarnings || 3

    const args = m.args
    if (!args[0] && !m.quoted && (!m.mentionedJid || m.mentionedJid.length === 0)) {
        return m.reply(
            `⚠️ *SISTEM WARNING GRUP*\n\n` +
            `Sistem manajemen pelanggaran untuk member grup.\n` +
            `Batas Warning: *${maxWarns} kali* (Otomatis Kick)\n\n` +
            `*PENGGUNAAN:*\n` +
            `• *${m.prefix}warn @user <alasan>* — Memberi warning\n` +
            `• *${m.prefix}warn max <angka>* — Mengubah batas maksimal warning\n` +
            `• *${m.prefix}listwarn* — Melihat daftar member bermasalah\n` +
            `• *${m.prefix}resetwarn @user* — Menghapus semua warning member\n\n` +
            `*PENJELASAN ALUR PENGGUNAAN:*\n` +
            `1. Saat member melakukan pelanggaran pertama, beri mereka SP1: *${m.prefix}warn @user Spam pesan*\n` +
            `2. Bot akan mencatat "Spam pesan" sebagai warning ke-1 mereka.\n` +
            `3. Jika melanggar lagi, beri peringatan kedua dengan alasan baru: *${m.prefix}warn @user Berkata kasar*\n` +
            `4. Jika total peringatan member mencapai batas maksimal (saat ini *${maxWarns}*), bot akan otomatis MENGELUARKAN (Kick) member tersebut.\n` +
            `5. Riwayat pelanggaran bisa dilihat lengkap dengan mengetik *${m.prefix}listwarn @user*.`
        )
    }
    if (_optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]) === 'max') {
        const newMax = parseInt(args[1])
        if (isNaN(newMax) || newMax < 1 || newMax > 20) {
            return m.reply(`❌ *GAGAL*\n\nBatas referensi warning harus berupa angka 1-20.\nContoh: *${m.prefix}warn max 5*`)
        }
        groupData.maxWarnings = newMax
        db.setGroup(m.chat, groupData)
        return m.reply(`✅ *BATAS WARNING DIUBAH*\n\nMaksimal warning grup ini telah diupdate menjadi *${newMax} kali*.`)
    }

    let targetUser = null
    if (m.quoted) {
        targetUser = m.quoted.sender
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        targetUser = m.mentionedJid[0]
    }
    
    if (!targetUser) {
        await m.reply(
            `⚠️ *CARA PAKAI*\n\n` +
            `> Reply pesan user + \`${m.prefix}warn alasan\`\n` +
            `> Atau: \`${m.prefix}warn @user alasan\``
        )
        return
    }
    try {
        const groupMeta = m.groupMetadata
        const participant = groupMeta.participants.find(p => _ourinlidjs.getParticipantJid.call(void 0, p) === targetUser)
        if (_optionalChain([participant, 'optionalAccess', _4 => _4.admin])) {
            await m.reply(`❌ Tidak bisa memberikan warning kepada admin grup.`)
            return
        }
    } catch (e) {}
    
    const botJid = _optionalChain([sock, 'access', _5 => _5.user, 'optionalAccess', _6 => _6.id, 'optionalAccess', _7 => _7.split, 'call', _8 => _8(':'), 'access', _9 => _9[0]]) + '@s.whatsapp.net'
    if (targetUser === botJid) {
        await m.reply(`❌ Gak usah warn aku, aku cuma bot.`)
        return
    }
    
    const reasonArg = m.quoted ? _optionalChain([m, 'access', _10 => _10.text, 'optionalAccess', _11 => _11.trim, 'call', _12 => _12()]) : _optionalChain([m, 'access', _13 => _13.text, 'optionalAccess', _14 => _14.replace, 'call', _15 => _15(/@\d+/g, ''), 'access', _16 => _16.replace, 'call', _17 => _17(/^\s*warn\s*/i, ''), 'access', _18 => _18.trim, 'call', _19 => _19()])
    const reason = reasonArg || 'Tidak ada alasan'
    
    let userWarnings = warnings[targetUser] || []
    userWarnings.push({
        reason: reason,
        by: m.sender,
        time: Date.now()
    })
    
    warnings[targetUser] = userWarnings
    db.setGroup(m.chat, { ...groupData, warnings: warnings })
    
    const warnCount = userWarnings.length
    const targetName = targetUser.split('@')[0]
    
    if (warnCount >= maxWarns) {
        try {
            await sock.groupParticipantsUpdate(m.chat, [targetUser], 'remove')
            await m.reply(
                `🚨 *MAX WARNING TERCAPAI*\n\n` +
                `@${targetName} telah dikeluarkan dari grup karena mencapai batas pelanggaran!\n\n` +
                `*Rincian:*\n` +
                `> Warning: *${warnCount}/${maxWarns}*\n` +
                `> Alasan Terakhir: *${reason}*`,
                { mentions: [targetUser] }
            )
            delete warnings[targetUser]
            db.setGroup(m.chat, { ...groupData, warnings: warnings })
        } catch (e) {
            m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
        }
    } else {
        await m.reply(
            `⚠️ *PERINGATAN DIBERIKAN*\n\n` +
            `@${targetName} telah menerima Surat Peringatan (SP${warnCount})!\n\n` +
            `*Rincian:*\n` +
            `> Warning ke: *${warnCount}/${maxWarns}*\n` +
            `> Alasan: *${reason}*\n\n` +
            `_${maxWarns - warnCount} warning lagi = KICK OTOMATIS_`,
            { mentions: [targetUser] }
        )
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

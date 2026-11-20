"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
    name: 'hapusdata',
    alias: ['resetdata', 'cleardata', 'wipedata'],
    category: 'owner',
    description: 'Reset semua data database ke default',
    usage: '.hapusdata',
    example: '.hapusdata',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 30,
    energi: 0,
    isEnabled: true
}

const pendingReset = new Map()

async function handler(m, { sock }) {
    const args = m.text

    if (args === 'ya' || args === 'yes' || args === 'confirm') {
        const pending = pendingReset.get(m.sender)
        if (!pending || Date.now() - pending > 60000) {
            pendingReset.delete(m.sender)
            return m.reply(`❌No hay reiniciaciones activadas.\n\n> Escribe\`${m.prefix}hapusdata\` terlebih dahulu`)
        }

        pendingReset.delete(m.sender)
        await m.react('🕕')

        const db = _ourindatabasejs.getDatabase.call(void 0, )
        const result = db.resetToDefaults()

        await m.react('✅')

        await sock.sendMessage(m.chat, {
            text:
                `🗑️ *ᴅᴀᴛᴀ ᴅɪʀᴇsᴇᴛ*\n\n` +
                `♪📁 Archivo restablecido: *${result.resetCount}/${result.total}*\n` +
                `> 💾 Backup: \`${result.backupFolder}/\`\n\n` +
                `Todos los datos han sido restaurados por defecto.\n\n` +
                `♪⚠Reinicie el bot para hacer sincronizar datos`
        }, { quoted: m })
        return
    }

    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const dbPath = db.dbPath
    const fileMap = [
        { key: 'users', label: '👥 Users' },
        { key: 'groups', label: '👥 Groups' },
        { key: 'settings', label: '⚙️ Settings' },
        { key: 'stats', label: '📊 Stats' },
        { key: 'sewa', label: '🏪 Sewa' },
        { key: 'premium', label: '⭐ Premium' },
        { key: 'owner', label: '👑Propietario' },
        { key: 'partner', label: '🤝 Partner' },
    ]

    const existing = []
    let totalSize = 0

    for (const { key, label } of fileMap) {
        const data = db.db.data[key]
        if (!data) continue
        const entries = Array.isArray(data) ? data.length : Object.keys(data).length
        const size = Buffer.byteLength(JSON.stringify(data))
        totalSize += size
        existing.push({ label, key, entries, size: `${(size / 1024).toFixed(1)} KB` })
    }

    if (existing.length === 0) {
        return m.reply(`❌No se han encontrado datos de bases de datos`)
    }

    pendingReset.set(m.sender, Date.now())

    let txt = `⚠️ *ᴘᴇʀɪɴɢᴀᴛᴀɴ — ʜᴀᴘᴜs ᴅᴀᴛᴀ*\n\n`
    txt += `Está acción borrará los siguientes datos * DlNT * DlNT ( DlNT ):\n\n`

    for (const { label, entries, size } of existing) {
        txt += `> ${label}: *${entries}* data (${size})\n`
    }

    txt += `\n> 📦 Total: *${(totalSize / 1024).toFixed(1)} KB*\n`
    txt += `♪💾Reverso automático creado antes de reiniciar\n\n`
    txt += `Escribe\`${m.prefix}hapusdata ya\`60 segundos para completar.`

    await sock.sendMessage(m.chat, {
        text: txt,
        interactiveButtons: [
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '✅ Ya, Hapus Semua',
                    id: `${m.prefix}hapusdata ya`
                })
            },
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '❌ Batalkan',
                    id: `${m.prefix}menuú`
                })
            }
        ]
    }, { quoted: m })

    setTimeout(() => { pendingReset.delete(m.sender) }, 60000)
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

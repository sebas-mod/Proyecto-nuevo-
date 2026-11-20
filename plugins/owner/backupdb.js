"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourinstorebackupjs = require('../../src/lib/ourin-store-backup.js');
const pluginConfig = {
    name: 'backupdb',
    alias: ['dbbackup', 'backupstore', 'storebackup'],
    category: 'owner',
    description: 'Backup database/store dan kirim ke owner',
    usage: '.backupdb',
    isOwner: true,
    isGroup: false,
    isEnabled: true
}

async function handler(m, { sock }) {
    const backupContents = [
        '📁 database/*.json (semua file JSON)',
        '📁 database/cpanel/* (data cPanel)',
        '📄 storage/database.json (main database)',
        '📄 db.json (root database)',
        '📄 database/main/*.json (main database)',
        '📋 backup_metadata.json (info schema)'
    ]
    
    await m.reply(
        `🕕 *Membuat backup database...*\n\n` +
        `╭┈┈⬡「 📦 *ᴀᴘᴀ ʏᴀɴɢ ᴅɪ-ʙᴀᴄᴋᴜᴘ* 」\n` +
        backupContents.map(c => `┃ ${c}`).join('\n') +
        `\n╰┈┈┈┈┈┈┈┈⬡`
    )
    
    const result = await _ourinstorebackupjs.sendStoreBackup.call(void 0, sock)
    
    if (result.success) {
        await m.reply(
            `✅ *Backup Berhasil!*\n\n` +
            `📦 Size: ${result.size}\n` +
            `📁 Files: ${result.files}\n` +
            `🔖 Schema: v${_ourinstorebackupjs.SCHEMA_VERSION}\n\n` +
            `> Type-safe backup, kompatibel dengan update mendatang.\n` +
            `> Backup telah dikirim ke owner utama.`
        )
    } else {
        await m.reply(`❌ Backup gagal: ${result.error}`)
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourinstorebackupjs = require('../../src/lib/ourin-store-backup.js');
const pluginConfig = {
    name: 'backupdb',
    alias: ['dbbackup', 'backupstore', 'storebackup'],
    category: 'owner',
    description: 'Cocer la base de datos / tormenta y enviarlo al propietario',
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
        `🕕* Crear una base de datos de respaldo.\n\n` +
        `╭┈┈⬡「 📦 *ᴀᴘᴀ ʏᴀɴɢ ᴅɪ-ʙᴀᴄᴋᴜᴘ* 」\n` +
        backupContents.map(c => `┃ ${c}`).join('\n') +
        `\n╰┈┈┈┈┈┈┈┈⬡`
    )
    
    const result = await _ourinstorebackupjs.sendStoreBackup.call(void 0, sock)
    
    if (result.success) {
        await m.reply(
            `✅*Backup Exito!*\n\n` +
            `📦 Size: ${result.size}\n` +
            `📁 Files: ${result.files}\n` +
            `🔖 Schema: v${_ourinstorebackupjs.SCHEMA_VERSION}\n\n` +
            `*Escribe @-@ respaldo seguro, permitible con actualizaciones futuras.*\n` +
            `El respaldo ha sido enviado al propietario principal.`
        )
    } else {
        await m.reply(`❌Backup fallido:${result.error}`)
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

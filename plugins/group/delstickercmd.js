"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourinstickercommandjs = require('../../src/lib/ourin-sticker-command.js');
const pluginConfig = {
    name: 'delstickercmd',
    alias: ['delcmdsticker', 'removesticker', 'unsticker'],
    category: 'group',
    description: 'Hapus sticker command',
    usage: '.delstickercmd <command> atau reply sticker',
    example: '.delstickercmd menu',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isAdmin: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const args = m.args || []
    const commandName = args[0]
    if (!commandName && !m.quoted) {
        const existingCmds = _ourinstickercommandjs.listStickerCommands.call(void 0, )
        if (existingCmds.length === 0) {
            return m.reply(
                `🖼️ *sᴛɪᴄᴋᴇʀ ᴄᴏᴍᴍᴀɴᴅs*\n\n` +
                `> Tidak ada sticker command yang terdaftar.\n` +
                `> Tambahkan dengan \`.addcmdsticker\``
            )
        }
        
        let txt = `🖼️ *sᴛɪᴄᴋᴇʀ ᴄᴏᴍᴍᴀɴᴅs*\n\n`
        txt += `╭┈┈⬡「 📋 *ᴅᴀꜰᴛᴀʀ* 」\n`
        
        for (const cmd of existingCmds) {
            txt += `┃ 🖼️ → \`.${cmd.command}\`\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        
        txt += `*Hapus dengan:*\n`
        txt += `> \`.delstickercmd <command>\`\n`
        txt += `> atau reply sticker + \`.delstickercmd\``
        
        return m.reply(txt)
    }
    
    let deleted = false
    let deletedCmd = ''
    if (m.quoted) {
        const stickerHash = _ourinstickercommandjs.getQuotedStickerHash.call(void 0, m)
        if (stickerHash) {
            const success = _ourinstickercommandjs.deleteStickerCommand.call(void 0, stickerHash)
            if (success) {
                deleted = true
                deletedCmd = 'sticker yang di-reply'
            }
        }
    }
    if (!deleted && commandName) {
        const cleanCmd = commandName.toLowerCase().replace(/^\./, '')
        const found = _ourinstickercommandjs.findByCommand.call(void 0, cleanCmd)
        
        if (found) {
            const success = _ourinstickercommandjs.deleteStickerCommand.call(void 0, found.hash)
            if (success) {
                deleted = true
                deletedCmd = cleanCmd
            }
        } else {
            return m.reply(
                `❌ Sticker command \`${cleanCmd}\` tidak ditemukan!\n\n` +
                `> Lihat daftar dengan \`.delstickercmd\``
            )
        }
    }
    
    if (deleted) {
        await m.react('✅')
        await m.reply(
            `✅ *sᴛɪᴄᴋᴇʀ ᴄᴏᴍᴍᴀɴᴅ ᴅɪʜᴀᴘᴜs*\n\n` +
            `> 🗑️ \`${deletedCmd}\` telah dihapus.`
        )
    } else {
        await m.reply(
            `❌ Gagal menghapus!\n\n` +
            `> Reply sticker yang ingin dihapus, atau\n` +
            `> Ketik nama command: \`.delstickercmd menu\``
        )
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

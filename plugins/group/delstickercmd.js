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
                `No hay pegatinas registradas.\n` +
                `# Ver incluso con\`Agregador de pared.\``
            )
        }
        
        let txt = `🖼️ *sᴛɪᴄᴋᴇʀ ᴄᴏᴍᴍᴀɴᴅs*\n\n`
        txt += `╭┈┈⬡「 📋 *ᴅᴀꜰᴛᴀʀ* 」\n`
        
        for (const cmd of existingCmds) {
            txt += `┃ 🖼️ → \`.${cmd.command}\`\n`
        }
        txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`
        
        txt += `*Elimina con:*\n`
        txt += `> \`.delstickercmd <command>\`\n`
        txt += `*Y si quieres* *o responde* *pegatina +*\`- Delstickercmd.\``
        
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
                deletedCmd = 'La respuesta pegatinas'
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
                `❌Sticker comando\`${cleanCmd}\`no encontrado!\n\n` +
                `*Ve una lista con\`- Delstickercmd.\``
            )
        }
    }
    
    if (deleted) {
        await m.react('✅')
        await m.reply(
            `✅ *sᴛɪᴄᴋᴇʀ ᴄᴏᴍᴍᴀɴᴅ ᴅɪʜᴀᴘᴜs*\n\n` +
            `> 🗑️ \`${deletedCmd}\`telah eliminado.`
        )
    } else {
        await m.reply(
            `❌No se pudo eliminar!\n\n` +
            `Responder pegatinas que quieren ser cubiertas, o\n` +
            `* El nombre de Escribe ordena:\`delstickercmd mentacus.\``
        )
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

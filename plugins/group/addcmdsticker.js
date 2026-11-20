"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _almikustickercommandjs = require('../../src/lib/almiku-sticker-command.js');
var _almikupluginsjs = require('../../src/lib/almiku-plugins.js');
const pluginConfig = {
    name: 'addcmdsticker',
    alias: ['addstickercmd', 'setsticker', 'stickeradd'],
    category: 'group',
    description: 'Jadikan sticker sebagai shortcut command',
    usage: '.addcmdsticker <command> (reply sticker)',
    example: '.addcmdsticker menu',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    isAdmin: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const args = m.args || []
    const commandName = args[0]
    
    //Nombre de comando Validasi
    if (!commandName) {
        const existingCmds = _almikustickercommandjs.listStickerCommands.call(void 0, )
        
        let txt = `🖼️ *sᴛɪᴄᴋᴇʀ ᴛᴏ ᴄᴏᴍᴍᴀɴᴅ*\n\n`
        txt += `Responder sticker + comando de axila que es ser acortado.\n\n`
        txt += `*Ejemplo:*\n`
        txt += `Responder pegatina, luego axila:\n`
        txt += `> \`.addcmdsticker menu\`\n\n`
        
        if (existingCmds.length > 0) {
            txt += `╭┈┈⬡「 📋 *ᴀᴋᴛɪꜰ* 」\n`
            for (const cmd of existingCmds.slice(0, 10)) {
                txt += `┃ 🖼️ → \`${cmd.command}\`\n`
            }
            if (existingCmds.length > 10) {
                txt += `┃... y${existingCmds.length - 10} lainnya\n`
            }
            txt += `╰┈┈┈┈┈┈┈┈⬡`
        }
        
        return m.reply(txt)
    }
    
    //Validaciones réplica pegatinas
    if (!m.quoted) {
        return m.reply('⚠Responder pegatinas a ser hecho!')
    }
    
    const stickerHash = _almikustickercommandjs.getQuotedStickerHash.call(void 0, m)
    if (!stickerHash) {
        return m.reply('⚠¡Para ordenar la respuesta en lugar de pegatinas!')
    }
    
    //Validasi comand exists
    const cleanCmd = commandName.toLowerCase().replace(/^\./, '')
    const plugin = _almikupluginsjs.getPlugin.call(void 0, cleanCmd)
    
    if (!plugin) {
        return m.reply(
            `❌Comando\`${cleanCmd}\`no encontrado!\n\n` +
            `Para asegurarse de que el código es ser atajo válido.`
        )
    }
    
    //Agregar el comando sticker
    const success = _almikustickercommandjs.addStickerCommand.call(void 0, stickerHash, cleanCmd, m.sender)
    
    if (success) {
        await m.react('✅')
        await m.reply(
            `✅ *sᴛɪᴄᴋᴇʀ ᴄᴏᴍᴍᴀɴᴅ ᴅɪᴛᴀᴍʙᴀʜᴋᴀɴ*\n\n` +
            `> 🖼️ Sticker → \`.${cleanCmd}\`\n\n` +
            `*El Ksentsticker que llamas para ejecutar tu comando!`
        )
    } else {
        await m.reply('❌¡Mantenga pegajoso comando!')
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

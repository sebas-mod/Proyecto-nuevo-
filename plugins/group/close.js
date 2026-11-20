"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'close',
    alias: ['tutup', 'closegroup', 'tutupgroup'],
    category: 'group',
    description: 'Envuelve un grupo de para que sólo admin puede chatear',
    usage: '.close',
    example: '.close',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
};

async function handler(m, { sock }) {
    try {
        const groupMeta = m.groupMetadata;
        
        if (groupMeta.announce) {
            await m.reply(
                `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
                `Soop ya está en el estado\`cerrado\`.\n` +
                `Sólo el administrador puede enviar un mensaje.`
            );
            return;
        }
        
        await sock.groupSettingUpdate(m.chat, 'announcement');
        
        const senderNum = m.sender.split('@')[0];
        
        const successMsg = `✅ @${senderNum}ha cerrado este grupo`;
        
        await m.reply(successMsg, {mentions: [m.sender]})
        
    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `- Sí, cuelga el grupo.\n` +
            `> _${error.message}_`
        );
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

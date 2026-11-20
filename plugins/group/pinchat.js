"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'pinchat',
    alias: ['pinmsg', 'pinpesan'],
    category: 'group',
    description: 'Disfruta del importante mensaje en grupo',
    usage: '.pinchat (reply pesan)',
    example: '.pinchat',
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

async function handler(m, { sock, args }) {
    if (!m.quoted || !m.quoted.key || !m.quoted.key.id) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
            `Ezely un mensaje que quieres poner!\n\n` +
            `*Como usarlo:*\n` +
            `*Responde mensajes*→escribe\`Pinchat.\`\n` +
            `Opcional:\`- Pinchat 24.\`( 24 hora pin )`
        );
        return;
    }
    
    let duration = 86400;
    if (args && args.length > 0 && args[0]) {
        const hours = parseInt(args[0]);
        if (!isNaN(hours) && hours >= 1 && hours <= 720) {
            duration = hours * 3600;
        }
    }
    
    try {
        const pinKey = {
            remoteJid: m.chat,
            fromMe: m.quoted.key.fromMe || false,
            id: m.quoted.key.id,
            participant: m.quoted.key.participant || m.quoted.sender
        };
        
        await sock.sendMessage(m.chat, {
            pin: pinKey,
            type: 1,
            time: duration
        });
        
        const durationText = duration >= 86400 
            ? `${Math.floor(duration / 86400)}el` 
            : `${Math.floor(duration / 3600)}hora`;
        
        const successMsg = `✅Los éxitos marcan este mensaje`;
        await m.reply(successMsg, { mentions: [m.sender] })
        
    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `- Lo siento.\n` +
            `> _${error.message}_`
        );
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

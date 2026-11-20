"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'poll',
    alias: ['voting', 'vote', 'survei'],
    category: 'group',
    description: 'Polling / voting booth in grupo',
    usage: '.poll <pertanyaan> | <opsi1>, <opsi2>, ...',
    example: '.poll Makan apa? | Nasi Goreng, Mie Ayam, Bakso',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 30,
    energi: 1,
    isEnabled: true
};

async function handler(m, { sock }) {
    const text = m.text || '';
    
    if (!text || text.trim() === '') {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
            `¡Fata no es válida!\n\n` +
            `*Formato:*\n` +
            `♪\`- Encuesta. Pregunta. Epopsi1, opciones.\`\n\n` +
            `*Ejemplo:*\n` +
            `♪\`¿Qué pasa?\`\n\n` +
            `*Opsi adicional:*\n` +
            `♪\`.poll multi | pregunta | opsi1, opsi2, opsi3, dst\`\n` +
            `Soop (para selección de ganda )`
        );
        return;
    }
    
    let isMultiple = false;
    let parts = text.split('|').map(p => p.trim());
    
    if (parts[0].toLowerCase() === 'multi') {
        isMultiple = true;
        parts = parts.slice(1);
    }
    
    if (parts.length < 2) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
            `> Formato:\`Pregunta a opsi1, opciones,.\``
        );
        return;
    }
    
    const question = parts[0];
    const options = parts[1].split(',').map(o => o.trim()).filter(o => o);
    
    if (options.length < 2) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
            `Soomal 2 opciones!`
        );
        return;
    }
    
    if (options.length > 12) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
            `¡Al máximo de 12 opciones!`
        );
        return;
    }
    
    if (question.length > 255) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
            `¡A la pregunta es demasiado!\n` +
            `Al máximo 255 caracteres.`
        );
        return;
    }
    
    try {
        const pollMsg = `✅El éxito hace que la encuesta`;
        
        await m.reply(pollMsg, { mentions: [m.sender] });
        
        await sock.sendMessage(m.chat, {
            poll: {
                name: question,
                values: options,
                selectableCount: isMultiple ? options.length : 1
            }
        });
        
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

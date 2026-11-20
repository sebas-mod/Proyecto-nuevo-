"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
    name: 'jadwalgroup',
    alias: ['schedulegroup', 'jdwlgrup', 'autoopenclose'],
    category: 'group',
    description: 'Loop de grupo automático',
    usage: '.jadwalgroup <open/close> <HH:MM>',
    example: '.jadwalgroup open 06:00',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
};

function parseTime(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return null;
    
    const cleaned = timeStr.trim().replace(/\s+/g, '');
    const match = cleaned.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    
    const hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    
    return { hours, minutes };
}

function formatTime(hours, minutes) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

async function handler(m, { sock, db }) {
    const args = m.args || []
    const action = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);
    
    let time = args[1];
    if (args.length >= 4 && args[2] === ':') {
        time = `${args[1]}:${args[3]}`;
    } else if (args.length >= 2) {
        time = args.slice(1).join('').replace(/\s+/g, '');
    }
    
    if (!action) {
        const group = db.getGroup(m.chat) || {};
        const openTime = group.scheduleOpen || null;
        const closeTime = group.scheduleClose || null;
        
        let scheduleInfo = `⏰ *ᴊᴀᴅᴡᴀʟ ɢʀᴜᴘ*

「 📋 *sᴛᴀᴛᴜs* 」
🔓 ᴏᴘᴇɴ: *${openTime || 'Tidak aktif'}*
🔒 ᴄʟᴏsᴇ: *${closeTime || 'Tidak aktif'}*

*Como usarlo:*
\`.jadwalgroup open 06:00\`
\`.jadwalgroup close 22:00\`
\`- Los promotores están creciendo.\`
\`- Promocionamiento, eliminar el cierre.\``;
        
        await m.reply(scheduleInfo);
        return;
    }
    
    if (action === 'hapus' || action === 'delete' || action === 'remove') {
        const type = _optionalChain([args, 'access', _4 => _4[1], 'optionalAccess', _5 => _5.toLowerCase, 'call', _6 => _6()]);
        
        if (type !== 'open' && type !== 'close') {
            await m.reply(
                `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
                `> Usa: \`- Los promotores están creciendo.\`\n` +
                `> o:\`- Promocionamiento, eliminar el cierre.\``
            );
            return;
        }
        
        const group = db.getGroup(m.chat) || {};
        
        if (type === 'open') {
            delete group.scheduleOpen;
            db.setGroup(m.chat, group);
            
            await m.reply(
                `✅ *ʙᴇʀʜᴀsɪʟ*\n\n` +
                `El grupo abre ha sido hackeado.`
            );
        } else {
            delete group.scheduleClose;
            db.setGroup(m.chat, group);
            
            await m.reply(
                `✅ *ʙᴇʀʜᴀsɪʟ*\n\n` +
                `El horario del grupo ha sido hackeado.`
            );
        }
        return;
    }
    
    if (action !== 'open' && action !== 'close') {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
            `*La acción debe*\`abierto\`o\`cerrado\`!\n\n` +
            `> *Ejemplo:*\n` +
            `> \`.jadwalgroup open 06:00\`\n` +
            `> \`.jadwalgroup close 22:00\``
        );
        return;
    }
    
    if (!time) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
            `¡A tiempo debe ser llenado!\n\n` +
            `> *Formato:*\`HH: MMM\`(24 hora)\n` +
            `> *Ejemplo:*\`- Promueve el crecimiento.${action} 08:00\``
        );
        return;
    }
    
    const parsed = parseTime(time);
    if (!parsed) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ ɢᴀɢᴀʟ*\n\n` +
            `¡El tiempo de formación de Fata no es válido!\n\n` +
            `> *Formato:*\`HH: MMM\`(24 hora)\n` +
            `> *Ejemplo:*\`06: 00\`.\`22: 30\`.\`8: 15\``
        );
        return;
    }
    
    const group = db.getGroup(m.chat) || {};
    const formattedTime = formatTime(parsed.hours, parsed.minutes);
    
    if (action === 'open') {
        group.scheduleOpen = formattedTime;
    } else {
        group.scheduleClose = formattedTime;
    }
    
    db.setGroup(m.chat, group);
    
    const actionText = action === 'open' ? 'BUKA' : 'TUTUP';
    const emoji = action === 'open' ? '🔓' : '🔒';
    
    const successMsg = `✅ *ᴊᴀᴅᴡᴀʟ ᴅɪsɪᴍᴘᴀɴ*

╭┈┈⬡「 ⏰ *sᴇᴛᴛɪɴɢ* 」
┃ ㊗ ${emoji} ᴀᴋsɪ: *${actionText}*
┃ ㊗ ⏱️ ᴡᴀᴋᴛᴜ: *${formattedTime} ART*
┃ ㊗ 📡Sᴛᴀᴛᴜs: *🟢Activo*
╰┈┈⬡

Grupo automatizará${action === 'open' ? 'dibuka' : 'ditutup'}_
# Pasa cada día con el reloj #${formattedTime}* ART._`;
    
    await m.reply(successMsg);
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

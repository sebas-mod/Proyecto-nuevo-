"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
    name: 'jedacreate',
    alias: ['setjeda', 'paneljeda', 'jedapanel'],
    category: 'panel',
    description: 'Establecer tiempo jeda para todo panel crear comando',
    usage: '.jedacreate <waktu>',
    example: '.jedacreate 5m',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
}

function parseTime(input) {
    if (!input || input === '0') return 0
    
    const match = input.match(/^(\d+)(s|m|h)?$/i)
    if (!match) return null
    
    const value = parseInt(match[1])
    const unit = (match[2] || 's').toLowerCase()
    
    switch (unit) {
        case 's': return value * 1000
        case 'm': return value * 60 * 1000
        case 'h': return value * 60 * 60 * 1000
        default: return value * 1000
    }
}

function formatTime(ms) {
    if (ms <= 0) return 'Tanpa jeda'
    
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}hora${minutes % 60}minuto`
    if (minutes > 0) return `${minutes}minuto${seconds % 60}segundo`
    return `${seconds}segundo`
}

function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const input = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()])
    
    const DEFAULT_JEDA = 5 * 60 * 1000
    
    if (!input) {
        const currentJeda = _nullishCoalesce(db.setting('panelCreateJeda'), () => ( DEFAULT_JEDA))
        return m.reply(
            `⏱️ *ᴊᴇᴅᴀ ᴘᴀɴᴇʟ ᴄʀᴇᴀᴛᴇ*\n\n` +
            `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n` +
            `┃ ◦Pausa actual: *${formatTime(currentJeda)}*\n` +
            `┃ ◦Predeterminado: * 5 minutos *\n` +
            `╰┈┈⬡\n\n` +
            `> Usa: \`${m.prefix}jedacreate <waktu>\`\n` +
            `> Ejemplo:\`${m.prefix}jedacreado 5m\`(5 minuto)\n` +
            `Para desactivar:\`${m.prefix}jedacreate 0\`\n\n` +
            `*Formato tiempo:*\n` +
            `• \`30s\` = 30 detik\n` +
            `• \`5m\` = 5 menit\n` +
            `• \`1h\`= 1 hora`
        )
    }
    
    const jedaMs = parseTime(input)
    
    if (jedaMs === null) {
        return m.reply(`❌¡El tiempo de formato no es válido!\n\n* * * * *#91; Vocalizing > *93;`)
    }
    
    db.setting('panelCreateJeda', jedaMs)
    db.setting('panelCreateLastUsed', 0)
    
    m.react('✅')
    
    if (jedaMs === 0) {
        return m.reply(
            `✅ *ᴊᴇᴅᴀ ᴅɪɴᴏɴᴀᴋᴛɪꜰᴋᴀɴ*\n\n` +
            `* Panel crear ahora sin jeda*`
        )
    }
    
    return m.reply(
        `✅ *ᴊᴇᴅᴀ ᴅɪsᴇᴛ*\n\n` +
        `╭┈┈⬡「 ⏱️ *ᴋᴏɴꜰɪɢ* 」\n` +
        `┃ ◦ Jeda: *${formatTime(jedaMs)}*\n` +
        `╰┈┈⬡\n\n` +
        `El panel ha sido hecho, el usuario debe esperar${formatTime(jedaMs)}Antes de que podamos crear de nuevo.`
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

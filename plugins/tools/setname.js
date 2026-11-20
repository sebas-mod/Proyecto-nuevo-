"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: 'setname',
    alias: ['setnamebot', 'setbotnama'],
    category: 'tools',
    description: 'Renombrar el perfil de bot',
    usage: '.setname <nama baru>',
    example: '.setname Ourin-AI',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const newName = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()])
    
    if (!newName) {
        await m.reply(
            `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
            `> \`${m.prefix}nombre del set de Nuevo\``
        )
        return
    }
    
    if (newName.length < 1 || newName.length > 25) {
        await m.reply(
            `⚠️ *ᴠᴀʟɪᴅᴀsɪ*\n\n` +
            `El nombre del bot debe ser de 1 a 25 caracteres.`
        )
        return
    }
    
    try {
        await sock.updateProfileName(newName)
        
        await m.reply(
            `✅ *ɴᴀᴍᴀ ʙᴏᴛ ᴅɪᴜʙᴀʜ*\n\n` +
            `Nombre el bot ahora: *${newName}*`
        )
    } catch (error) {
        await m.reply(
            `❌ *ɢᴀɢᴀʟ*\n\n` +
            `No puede cambiar el nombre del bot.\n` +
            `> _${error.message}_`
        )
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('../../src/lib/almiku-database.js');
const pluginConfig = {
    name: 'setintro',
    alias: ['setperkenalan', 'introset'],
    category: 'group',
    description: 'Estabblecer llama intro grupo ( sólo adminiracyn )',
    usage: '.setintro <pesan>',
    example: '.setintro Selamat datang @user di @group!',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true,
    isAdmin: true
}

async function handler(m) {
    const db = _almikudatabasejs.getDatabase.call(void 0, )
    const introText = _optionalChain([m, 'access', _ => _.fullArgs, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]) || _optionalChain([m, 'access', _4 => _4.text, 'optionalAccess', _5 => _5.trim, 'call', _6 => _6()])
    
    if (!introText) {
        return m.reply(
            `📝 *sᴇᴛ ɪɴᴛʀᴏ*\n\n` +
            `¡Aquí hay un mensaje de introducción!\n\n` +
            `* Titular disponible: *\n` +
            `- Nombre de usuario\n` +
            `- Grupo - * Nombre de la explosión*\n` +
            `- Salta en la foto.\n` +
            `- Hoy\n` +
            `- Hora.\n` +
            `> @desc - Descripción grupo\n` +
            `- *El nombre del bot*\n\n` +
            `*Ejemplo:*\n` +
            `Sí, Setintro Bienvenido.👋`
        )
    }
    
    const groupData = db.getGroup(m.chat) || db.setGroup(m.chat)
    groupData.intro = introText
    db.setGroup(m.chat, groupData)
    db.save()
    
    await m.reply(
        `✅ *ɪɴᴛʀᴏ ᴅɪsᴀᴠᴇ!*\n` +
        `El orden de intro grupo fue alterado con éxEstá bien.\n` +
        `Escribe *${m.prefix}introón para ver los resultados.`
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

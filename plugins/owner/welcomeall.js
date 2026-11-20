"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'welcomeall',
    alias: ['wcall', 'globalwelcome'],
    category: 'owner',
    description: 'Activar / deshabilitar la bienvenida en todo el grupo',
    usage: '.welcomeall <on/off>',
    example: '.welcomeall on',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const args = m.args || []
    const action = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()])
    
    if (!action || !['on', 'off'].includes(action)) {
        return m.reply(
            `👋 *ᴡᴇʟᴄᴏᴍᴇ ɢʟᴏʙᴀʟ*\n\n` +
            `Alojamiento en el sótano de inmediato\n\n` +
            `╭┈┈⬡「 📋 *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ* 」\n` +
            `┃ ${m.prefix}welcomeall on\n` +
            `┃ ${m.prefix}welcomeall off\n` +
            `╰┈┈┈┈┈┈┈┈⬡`
        )
    }
    
    await m.react('🕕')
    
    try {
        const groups = await sock.groupFetchAllParticipating()
        const groupIds = Object.keys(groups)
        const status = action === 'on'
        let count = 0
        
        for (const groupId of groupIds) {
            db.setGroup(groupId, { welcome: status })
            count++
        }
        
        await m.react('✅')
        
        if (status) {
            return m.reply(
                `✅ *ᴡᴇʟᴄᴏᴍᴇ ɢʟᴏʙᴀʟ ᴏɴ*\n\n` +
                `╭┈┈⬡「 📊 *ʀᴇsᴜʟᴛ* 」\n` +
                `┃ 🌐Top Grupo: *${count}*\n` +
                `┃ ✅Welcome: *Activo*\n` +
                `╰┈┈┈┈┈┈┈┈⬡\n\n` +
                `¡Todas las fotos nuevas serán pavimentadas automáticamente!`
            )
        } else {
            return m.reply(
                `❌ *ᴡᴇʟᴄᴏᴍᴇ ɢʟᴏʙᴀʟ ᴏꜰꜰ*\n\n` +
                `╭┈┈⬡「 📊 *ʀᴇsᴜʟᴛ* 」\n` +
                `┃ 🌐Top Grupo: *${count}*\n` +
                `┃ ❌Welcome: *Inactivo*\n` +
                `╰┈┈┈┈┈┈┈┈⬡\n\n` +
                `Ezelcome se activa en todo grupo.`
            )
        }
    } catch (error) {
        console.error('[WelcomeAll] Error:', error.message)
        await m.react('☢')
        await m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
    name: 'antilinkgc',
    alias: ['algc', 'antilinkgrup'],
    category: 'group',
    description: 'Anti @-@ link whatsApp.',
    usage: '.antilinkgc <on/off/metode> [kick/remove]',
    example: '.antilinkgc on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true,
    isAdmin: true,
    isBotAdmin: true
}



function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const option = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3(), 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()])
    
    if (!option) {
        const groupData = db.getGroup(m.chat) || {}
        const status = groupData.antilinkgc || 'off'
        const mode = groupData.antilinkgcMode || 'remove'
        
        return m.reply(
            `🔗 *ᴀɴᴛɪʟɪɴᴋ ᴡᴀ*\n\n` +
            `╭┈┈⬡「 📋 *sᴛᴀᴛᴜs* 」\n` +
            `┃ ◦ Status: *${status.toUpperCase()}*\n` +
            `┃ ◦ Mode: *${mode.toUpperCase()}*\n` +
            `╰┈┈⬡\n\n` +
            `*ᴅᴇᴛᴇᴋsɪ:*\n` +
            `♪•chat.whatsapp.com (grupo)\n` +
            `♪•wa.me (contacto)\n` +
            `> • whatsapp.com/channel (saluran)\n\n` +
            `*ᴄᴀʀᴀ ᴘᴀᴋᴀɪ:*\n` +
            `> \`${m.prefix}antilinkgc on\` - Aktifkan\n` +
            `> \`${m.prefix}antilinkgc off\` - Nonaktifkan\n` +
            `> \`${m.prefix}patada del método antilinkgc\`- Usuario de patada de modo\n` +
            `> \`${m.prefix}método antilinkgc eliminar\`- Modo de eliminación de mensajes.`
        )
    }
    
    if (option === 'on') {
        db.setGroup(m.chat, { antilinkgc: 'on' })
        return m.reply(`✅*ᴀɴᴛɪʟɪɴᴋ ᴡᴀ¡Activo!\n\nWWA Enlace será hackeado por automatización.`)
    }
    
    if (option === 'off') {
        db.setGroup(m.chat, { antilinkgc: 'off' })
        return m.reply(`❌*ᴀɴᴛɪʟɪɴᴋ ᴡᴀ* desactivado!`)
    }
    
    if (option.startsWith('metode')) {
        const method = _optionalChain([m, 'access', _6 => _6.args, 'optionalAccess', _7 => _7[1], 'optionalAccess', _8 => _8.toLowerCase, 'call', _9 => _9()])
        if (method === 'kick') {
            db.setGroup(m.chat, { antilinkgc: 'on', antilinkgcMode: 'kick' })
            return m.reply(`✅*ᴀɴᴛɪʟɪɴᴋ ᴡᴀ> 91; ¡Modo KICK activado!\n\nEl usuario que envió el enlace WA va a ser pateado.`)
        } else if (method === 'remove' || method === 'delete') {
            db.setGroup(m.chat, { antilinkgc: 'on', antilinkgcMode: 'remove' })
            return m.reply(`✅*ᴀɴᴛɪʟɪɴᴋ ᴡᴀ- 91.¡¡Modo DELEGOT está activado!\n\n" Mensaje with WA enlace will be destroyed. "`)
        } else {
            return m.reply(`❌¡Método inválido!\`Patito\`o\`Retirar\`\n\n> Ejemplo:\`${m.prefix}patada del método antilinkgc\``)
        }
    }
    
    if (option === 'kick') {
        db.setGroup(m.chat, { antilinkgc: 'on', antilinkgcMode: 'kick' })
        return m.reply(`✅*ᴀɴᴛɪʟɪɴᴋ ᴡᴀ> 91; ¡Modo KICK activado!\n\nEl usuario que envió el enlace WA va a ser pateado.`)
    }
    
    if (option === 'remove' || option === 'delete') {
        db.setGroup(m.chat, { antilinkgc: 'on', antilinkgcMode: 'remove' })
        return m.reply(`✅*ᴀɴᴛɪʟɪɴᴋ ᴡᴀ- 91.¡¡Modo DELEGOT está activado!\n\n" Mensaje with WA enlace will be destroyed. "`)
    }
    
    return m.reply(`❌¡Opsi inválido!\`on\`.\`apagado\`.\`metodo kick\`.\`metodo remove\``)
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

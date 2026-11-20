"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('../../src/lib/almiku-database.js');
const pluginConfig = {
    name: 'delantilink',
    alias: ['delalink', 'delblocklink', 'remantilink'],
    category: 'group',
    description: 'Eliminar los enlaces de la lista de antivínculos',
    usage: '.delantilink <domain/pattern>',
    example: '.delantilink tiktok.com',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m) {
    const db = _almikudatabasejs.getDatabase.call(void 0, )
    const link = _optionalChain([m, 'access', _ => _.args, 'access', _2 => _2.join, 'call', _3 => _3(' '), 'optionalAccess', _4 => _4.trim, 'call', _5 => _5(), 'optionalAccess', _6 => _6.toLowerCase, 'call', _7 => _7()])
    
    if (!link) {
        const groupData = db.getGroup(m.chat) || {}
        const antilinkList = groupData.antilinkList || []
        
        if (antilinkList.length === 0) {
            return m.reply(`📋¡La lista de antivínculos!`)
        }
        
        let txt = `🔗 *ᴅᴀꜰᴛᴀʀ ᴀɴᴛɪʟɪɴᴋ*\n\n`
        antilinkList.forEach((l, i) => {
            txt += `> ${i + 1}. \`${l}\`\n`
        })
        txt += `\n> Total: *${antilinkList.length}* enlace`
        txt += `\n\n\`${m.prefix}delantilink<domain>\`para elimina`
        
        return m.reply(txt)
    }
    
    const groupData = db.getGroup(m.chat) || {}
    const antilinkList = groupData.antilinkList || []
    
    const index = antilinkList.findIndex(l => l === link)
    
    if (index === -1) {
        return m.reply(`⚠️ Enlace\`${link}\`No, no se encuentra en la lista de antivínculos!`)
    }
    
    antilinkList.splice(index, 1)
    db.setGroup(m.chat, { antilinkList })
    
    m.reply(
        `✅ *ᴀɴᴛɪʟɪɴᴋ ᴅɪʜᴀᴘᴜs*\n\n` +
        `> Enlace:\`${link}\`\n` +
        `Restante: *${antilinkList.length}* enlace`
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

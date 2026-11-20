"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('../../src/lib/almiku-database.js');
const pluginConfig = {
    name: ['autodl', 'autodownload'],
    alias: [],
    category: 'group',
    description: 'Toggle auto download link sosmed',
    usage: '.autodl on/off',
    example: '.autodl on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    isBotAdmin: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock }) {
    const db = _almikudatabasejs.getDatabase.call(void 0, )
    const args = _optionalChain([m, 'access', _ => _.args, 'access', _2 => _2[0], 'optionalAccess', _3 => _3.toLowerCase, 'call', _4 => _4()])
    
    const groupData = db.getGroup(m.chat)
    const current = _optionalChain([groupData, 'optionalAccess', _5 => _5.autodl]) || false
    
    if (!args || args === 'status') {
        return m.reply(
            `🔗 *ᴀᴜᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ*\n\n` +
            `> Status: ${current ? '✅ Aktif' : '❌ Nonaktif'}\n\n` +
            `*Platform Support:*\n` +
            `> TikTok, Instagram, Facebook\n` +
            `> YouTube, Twitter/X\n` +
            `> Telegram, Discord\n\n` +
            `*Uso:*\n` +
            `> \`${m.prefix}autodl on\` - Aktifkan\n` +
            `> \`${m.prefix}autodl off\`- Desactiva`
        )
    }
    
    if (args === 'on') {
        db.setGroup(m.chat, { ...groupData, autodl: true })
        m.react('✅')
        return m.reply(
            `✅ *ᴀᴜᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ ᴀᴋᴛɪꜰ*\n\n` +
            `Ksenglink sembrado y bot se descarga automáticamente!\n` +
            `> Support: TikTok, IG, FB, YouTube, Twitter/X`
        )
    }
    
    if (args === 'off') {
        db.setGroup(m.chat, { ...groupData, autodl: false })
        m.react('❌')
        return m.reply(`❌ *ᴀᴜᴛᴏ ᴅᴏᴡɴʟᴏᴀᴅ ɴᴏɴᴀᴋᴛɪꜰ*`)
    }
    
    return m.reply(`❌*ᴀʀɢᴜᴍᴇɴ ᴛɪᴅᴀᴋ ᴠᴀʟɪᴅ*\n\n> Usa:\`on\`o\`apagado\``)
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikudatabasejs = require('../../src/lib/almiku-database.js');
const pluginConfig = {
    name: 'listban',
    alias: ['listbanned', 'banlist'],
    category: 'owner',
    description: 'Melihat daftar banned user',
    usage: '.listban',
    example: '.listban',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = _almikudatabasejs.getDatabase.call(void 0, )
    const bannedUsers = _configjs2.default.bannedUsers && _configjs2.default.bannedUsers.length > 0 ? _configjs2.default.bannedUsers : (db.setting('bannedUsers') || [])
    
    if (bannedUsers.length === 0) {
        return m.reply(`🚫*ʟɪSᴛ ʙᴀɴɴᴇᴅ*\n\n# No se niega a ningún usuario\n\n\`Usa:${m.prefix}ban <nomor>\``)
    }
    
    let caption = `🚫 *ʟɪsᴛ ʙᴀɴɴᴇᴅ*\n\n`
    caption += `╭┈┈⬡「 ⛔ *ᴜsᴇʀs* 」\n`
    
    for (let i = 0; i < bannedUsers.length; i++) {
        caption += `┃ ${i + 1}. \`${bannedUsers[i]}\`\n`
    }
    
    caption += `╰┈┈⬡\n\n`
    caption += `> ᴛᴏᴛᴀʟ: \`${bannedUsers.length}\` ʙᴀɴɴᴇᴅ ᴜsᴇʀ`
    
    await m.reply(caption)
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

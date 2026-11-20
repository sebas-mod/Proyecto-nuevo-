"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: 'notifpromote',
    alias: [],
    category: 'group',
    description: 'Toggle notifikasi saat ada yang dijadikan admin',
    usage: '.notifpromote on/off',
    example: '.notifpromote on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

function handler(m, { sock, db }) {
    if (!m.isAdmin && !m.isOwner) {
        return m.reply(`❌ Hanya admin grup yang bisa menggunakan fitur ini`)
    }
    
    const args = _optionalChain([m, 'access', _ => _.args, 'access', _2 => _2[0], 'optionalAccess', _3 => _3.toLowerCase, 'call', _4 => _4()])
    const group = db.getGroup(m.chat) || {}
    
    if (!['on', 'off'].includes(args)) {
        const status = group.notifPromote === true ? '✅ Aktif' : '❌ Nonaktif'
        return m.reply(`👑 *ɴᴏᴛɪꜰ ᴘʀᴏᴍᴏᴛᴇ*\n\n> Status: ${status}\n\n*Penggunaan:*\n\`${m.prefix}notifpromote on\` - Aktifkan\n\`${m.prefix}notifpromote off\` - Nonaktifkan`)
    }
    
    if (args === 'on') {
        group.notifPromote = true
        db.setGroup(m.chat, group)
        return m.reply(`✅ *ɴᴏᴛɪꜰ ᴘʀᴏᴍᴏᴛᴇ ᴅɪᴀᴋᴛɪꜰᴋᴀɴ*`)
    }
    
    if (args === 'off') {
        group.notifPromote = false
        db.setGroup(m.chat, group)
        return m.reply(`❌ *ɴᴏᴛɪꜰ ᴘʀᴏᴍᴏᴛᴇ ᴅɪɴᴏɴᴀᴋᴛɪꜰᴋᴀɴ*`)
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

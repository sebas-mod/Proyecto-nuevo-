"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
    name: 'automedia',
    alias: ['automedi', 'am'],
    category: 'group',
    description: 'Toggle auto media - otomatis jadikan sticker jadi gambar/video',
    usage: '.automedia on/off',
    example: '.automedia on',
    isOwner: false,
    isPremium: false,
    isGroup: true,
    isPrivate: false,
    isAdmin: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const args = m.args || []
    const groupData = db.getGroup(m.chat) || {}
    const current = _nullishCoalesce(groupData.automedia, () => ( false))
    const arg = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()])
    
    if (!arg) {
        const status = current ? '✅ Aktif' : '❌ Nonaktif'
        return m.reply(
            `🎬 *ᴀᴜᴛᴏᴍᴇᴅɪᴀ*\n\n` +
            `> Status: ${status}\n\n` +
            `> Gunakan:\n` +
            `> \`${m.prefix}automedia on\` - aktifkan\n` +
            `> \`${m.prefix}automedia off\` - nonaktifkan\n\n` +
            `> _Otomatis jadikan sticker jadi gambar_\n` +
            `> Video gak jadi bang`
        )
    }
    
    if (arg === 'on' || arg === '1' || arg === 'aktif') {
        if (current) {
            return m.reply(`🎬 *ᴀᴜᴛᴏᴍᴇᴅɪᴀ*\n\n> Sudah aktif!`)
        }
        db.setGroup(m.chat, { automedia: true })
        await db.save()
        return m.reply(`🎬 *ᴀᴜᴛᴏᴍᴇᴅɪᴀ*\n\n> ✅ Berhasil diaktifkan!\n> Sticker akan otomatis jadi gambar/video`)
    }
    
    if (arg === 'off' || arg === '0' || arg === 'nonaktif') {
        if (!current) {
            return m.reply(`🎬 *ᴀᴜᴛᴏᴍᴇᴅɪᴀ*\n\n> Sudah nonaktif!`)
        }
        db.setGroup(m.chat, { automedia: false })
        await db.save()
        return m.reply(`🎬 *ᴀᴜᴛᴏᴍᴇᴅɪᴀ*\n\n> ❌ Berhasil dinonaktifkan!`)
    }
    
    return m.reply(`❌ Gunakan: \`${m.prefix}automedia on/off\``)
}

async function autoMediaHandler(m, sock) {
    try {
        if (!m) return false
        if (!m.isGroup) return false
        if (m.isCommand) return false
        if (m.fromMe === true) return false
        
        const db = _ourindatabasejs.getDatabase.call(void 0, )
        const groupData = db.getGroup(m.chat) || {}
        
        if (!groupData.automedia) return false
        
        const msg = m.message
        if (!msg) return false
        
        const hasSticker = msg.stickerMessage
        if (!hasSticker) return false
        
        if (hasSticker.isAnimated) return false
        
        const buffer = await m.download()
        if (!buffer || buffer.length === 0) return false
        
        await sock.sendMedia(m.chat, buffer, null, m, { 
            type: 'image',
        })
        
        return true
    } catch (err) {
        return false
    }
}

exports.config = pluginConfig; exports.handler = handler; exports.autoMediaHandler = autoMediaHandler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

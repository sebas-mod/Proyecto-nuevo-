"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
    name: 'autosticker',
    alias: ['autostiker', 'as'],
    category: 'group',
    description: 'Toggle auto sticker - otomatis jadikan gambar/video jadi sticker',
    usage: '.autosticker on/off',
    example: '.autosticker on',
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
    const current = _nullishCoalesce(groupData.autosticker, () => ( false))
    const arg = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()])
    
    if (!arg) {
        const status = current ? '✅ Aktif' : '❌ Nonaktif'
        return m.reply(
            `🖼️ *ᴀᴜᴛᴏsᴛɪᴄᴋᴇʀ*\n\n` +
            `> Status: ${status}\n\n` +
            `> Gunakan:\n` +
            `> \`${m.prefix}autosticker on\` - aktifkan\n` +
            `> \`${m.prefix}autosticker off\` - nonaktifkan\n\n` +
            `> _Otomatis jadikan gambar/video jadi sticker_`
        )
    }
    
    
    if (arg === 'on' || arg === '1' || arg === 'aktif') {
        if (current) {
            return m.reply(`🖼️ *ᴀᴜᴛᴏsᴛɪᴄᴋᴇʀ*\n\n> Sudah aktif!`)
        }
        db.setGroup(m.chat, { autosticker: true })
        await db.save()
        return m.reply(`🖼️ *ᴀᴜᴛᴏsᴛɪᴄᴋᴇʀ*\n\n> ✅ Berhasil diaktifkan!\n> Gambar/video akan otomatis jadi sticker`)
    }
    
    if (arg === 'off' || arg === '0' || arg === 'nonaktif') {
        if (!current) {
            return m.reply(`🖼️ *ᴀᴜᴛᴏsᴛɪᴄᴋᴇʀ*\n\n> Sudah nonaktif!`)
        }
        db.setGroup(m.chat, { autosticker: false })
        await db.save()
        return m.reply(`🖼️ *ᴀᴜᴛᴏsᴛɪᴄᴋᴇʀ*\n\n> ❌ Berhasil dinonaktifkan!`)
    }
    
    return m.reply(`❌ Gunakan: \`${m.prefix}autosticker on/off\``)
}

async function autoStickerHandler(m, sock) {
    try {
        if (!m) return false
        if (!m.isGroup) return false
        if (m.isCommand) return false
        if (m.fromMe === true) return false
        
        const db = _ourindatabasejs.getDatabase.call(void 0, )
        const groupData = db.getGroup(m.chat) || {}
        
        if (!groupData.autosticker) return false
        
        const msg = m.message
        if (!msg) return false
        
        const type = Object.keys(msg)[0]
        const content = msg[type]

        const isImage = type === 'imageMessage' || 
                        (type === 'viewOnceMessage' && _optionalChain([content, 'optionalAccess', _4 => _4.message, 'optionalAccess', _5 => _5.imageMessage])) ||
                        (type === 'viewOnceMessageV2' && _optionalChain([content, 'optionalAccess', _6 => _6.message, 'optionalAccess', _7 => _7.imageMessage]))
        
        const isVideo = type === 'videoMessage' ||
                        (type === 'viewOnceMessage' && _optionalChain([content, 'optionalAccess', _8 => _8.message, 'optionalAccess', _9 => _9.videoMessage])) ||
                        (type === 'viewOnceMessageV2' && _optionalChain([content, 'optionalAccess', _10 => _10.message, 'optionalAccess', _11 => _11.videoMessage]))
        
        if (!isImage && !isVideo) return false
        
        const buffer = await m.download()
        if (!buffer || buffer.length === 0) return false
        
        if (buffer.length > 10 * 1024 * 1024) return false
        
        if (isImage) {
            await sock.sendImageAsSticker(m.chat, buffer, m, {
                packname: _optionalChain([_configjs2.default, 'access', _12 => _12.sticker, 'optionalAccess', _13 => _13.packname]) || 'Ourin',
                author: _optionalChain([_configjs2.default, 'access', _14 => _14.sticker, 'optionalAccess', _15 => _15.author]) || 'Bot'
            })
        } else if (isVideo) {
            const videoMsg = msg.videoMessage || _optionalChain([content, 'optionalAccess', _16 => _16.message, 'optionalAccess', _17 => _17.videoMessage])
            const duration = _optionalChain([videoMsg, 'optionalAccess', _18 => _18.seconds]) || 0
            if (duration > 10) return false
            
            await sock.sendVideoAsSticker(m.chat, buffer, m, {
                packname: _optionalChain([_configjs2.default, 'access', _19 => _19.sticker, 'optionalAccess', _20 => _20.packname]) || 'Ourin',
                author: _optionalChain([_configjs2.default, 'access', _21 => _21.sticker, 'optionalAccess', _22 => _22.author]) || 'Bot'
            })
        }
        
        return true
    } catch (err) {
        return false
    }
}

exports.config = pluginConfig; exports.handler = handler; exports.autoStickerHandler = autoStickerHandler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourinexifjs = require('../../src/lib/ourin-exif.js');

const pluginConfig = {
    name: 'swm',
    alias: ['wm', 'stickerwm', 'stickermark', 'colong'],
    category: 'sticker',
    description: 'Sustituir el nombre de paquete y subastador en pegatinas',
    usage: '.swm <packname> atau .swm <packname>|<author>',
    example: '.swm BotName',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock, config: botConfig }) {
    const quoted = m.quoted
    
    if (!quoted) {
        return m.reply(
            `🖼️ *sᴛɪᴄᴋᴇʀ ᴡᴀᴛᴇʀᴍᴀʀᴋ*\n\n` +
            `Responder pegatina con capción:\n` +
            `> \`${m.prefix}swm packname\`\n\n` +
            `*ᴄᴏɴᴛᴏʜ:*\n` +
            `> \`${m.prefix}swm Ourin-AI\`\n` +
            `> \`${m.prefix}swm Ourin-AI|LuckyArchz\` _(packname + author)_`
        )
    }
    
    const isSticker = quoted.type === 'stickerMessage' || quoted.isSticker
    if (!isSticker) {
        return m.reply(`❌*ɢᴀɢᴀʟ*\n\nResponder ordena una pegatina, ¿no?${_optionalChain([quoted, 'access', _ => _.type, 'optionalAccess', _2 => _2.replace, 'call', _3 => _3('Message', '')]) || 'media lain'}`)
    }
    
    const input = _optionalChain([m, 'access', _4 => _4.text, 'optionalAccess', _5 => _5.trim, 'call', _6 => _6()])
    if (!input) {
        return m.reply(
            `❌ *ɢᴀɢᴀʟ*\n\n` +
            `*Pon el nombre de la mochila*\n\n` +
            `*ᴄᴏɴᴛᴏʜ:*\n` +
            `> \`${m.prefix}swm Ourin-AI\`\n` +
            `> \`${m.prefix}swm Ourin-AI|LuckyArchz\` _(+ author)_`
        )
    }
    
    let packname, author
    
    if (input.includes('|')) {
        const parts = input.split('|')
        packname = _optionalChain([parts, 'access', _7 => _7[0], 'optionalAccess', _8 => _8.trim, 'call', _9 => _9()]) || ''
        author = _optionalChain([parts, 'access', _10 => _10[1], 'optionalAccess', _11 => _11.trim, 'call', _12 => _12()]) || ''
    } else {
        packname = input
        author = ''
    }
    
    m.react('🕕')
    
    try {
        const buffer = await quoted.download()
        
        if (!buffer || buffer.length === 0) {
            m.react('❌')
            return m.reply(`❌*ɢᴀɢᴀʟ*\n\n*Cargando pegatinas descargables*`)
        }
        
        const exifOpts = { packname, author, emojis: ['🤖'] }
        const riff = buffer.slice(0, 4).toString('ascii')
        const webpSig = buffer.length >= 12 ? buffer.slice(8, 12).toString('ascii') : ''
        const isWebp = riff === 'RIFF' && webpSig === 'WEBP'
        
        if (isWebp) {
            const stickerBuffer = await _ourinexifjs.addExifToWebp.call(void 0, buffer, exifOpts)
            await sock.sendMessage(m.chat, {
                sticker: stickerBuffer,
                contextInfo: { isForwarded: true, forwardingScore: 1 }
            }, { quoted: m })
        } else {
            const isVideo = buffer.slice(0, 3).toString('hex') === '000000' ||
                            buffer.slice(4, 8).toString('ascii') === 'ftyp'
            
            if (isVideo) {
                await sock.sendVideoAsSticker(m.chat, buffer, m, exifOpts)
            } else {
                await sock.sendImageAsSticker(m.chat, buffer, m, exifOpts)
            }
        }
        
        m.react('✅')
        
    } catch (error) {
        console.error('[SWM] Error:', error.message)
        m.react('☢')
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

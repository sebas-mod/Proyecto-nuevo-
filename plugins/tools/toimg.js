"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: 'toimg',
    alias: ['toimage', 'stickertoimage', 'stimg'],
    category: 'tools',
    description: 'Mengubah sticker menjadi gambar',
    usage: '.toimg (reply/caption sticker)',
    example: '.toimg',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    let mediaSource = null
    let downloadFn = null
    const selfIsSticker = m.isSticker || 
                          m.type === 'stickerMessage' || 
                          _optionalChain([m, 'access', _ => _.message, 'optionalAccess', _2 => _2.stickerMessage])
    const quotedIsSticker = m.quoted && (
        m.quoted.isSticker || 
        m.quoted.type === 'stickerMessage' || 
        m.quoted.mtype === 'stickerMessage' ||
        _optionalChain([m, 'access', _3 => _3.quoted, 'access', _4 => _4.message, 'optionalAccess', _5 => _5.stickerMessage])
    )
    
    if (selfIsSticker) {
        mediaSource = 'self'
        downloadFn = m.download
    } else if (quotedIsSticker) {
        mediaSource = 'quoted'
        downloadFn = m.quoted.download
    }
    
    if (!mediaSource) {
        await m.reply(
            `❌ *ɢᴀɢᴀʟ*\n\n` +
            `> Tidak ada sticker yang terdeteksi!\n\n` +
            `*Cara penggunaan:*\n` +
            `> 1. Kirim sticker + caption \`${m.prefix}toimg\`\n` +
            `> 2. Reply sticker dengan \`${m.prefix}toimg\``
        )
        return
    }

    const stickerMsg = mediaSource === 'self' 
        ? _optionalChain([m, 'access', _6 => _6.message, 'optionalAccess', _7 => _7.stickerMessage]) 
        : _optionalChain([m, 'access', _8 => _8.quoted, 'optionalAccess', _9 => _9.message, 'optionalAccess', _10 => _10.stickerMessage])
    const isAnimated = _optionalChain([stickerMsg, 'optionalAccess', _11 => _11.isAnimated])

    if (isAnimated) {
        await m.reply(
            `⚠️ *sᴛɪᴄᴋᴇʀ ᴀɴɪᴍᴀsɪ*\n\n` +
            `> Sticker ini adalah sticker animasi (GIF).\n` +
            `> Gunakan \`${m.prefix}tovideo\` untuk mengubahnya.`
        )
        return
    }

    await m.react('🕕')

    try {
        const buffer = await downloadFn()

        if (!buffer || buffer.length === 0) {
            await m.reply(
                `❌ *ɢᴀɢᴀʟ*\n\n` +
                `> Tidak dapat mengunduh sticker.\n` +
                `> Sticker mungkin sudah tidak tersedia.`
            )
            return
        }

        if (buffer.length < 100) {
            await m.reply(
                `❌ *ꜰɪʟᴇ ᴋᴏʀᴜᴘ*\n\n` +
                `> File sticker tidak valid atau rusak.\n` +
                `> Coba kirim ulang stickernya.`
            )
            return
        }

        await sock.sendMedia(m.chat, buffer, null, m, {
            type: 'image'
        })

    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `> Terjadi kesalahan saat memproses.\n` +
            `> _${error.message}_`
        )
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

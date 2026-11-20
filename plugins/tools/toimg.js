"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
    name: 'toimg',
    alias: ['toimage', 'stickertoimage', 'stimg'],
    category: 'tools',
    description: 'Convierta las pegatinas en imágenes',
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
            `¡No detecten pegatinas!\n\n` +
            `*Como usarlo:*\n` +
            `Kpensmacker + capción\`${m.prefix}toimg\`\n` +
            `Responder pegatina con\`${m.prefix}toimg\``
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
            `Está pegatina es una pegatina animada.\n` +
            `> Usa \`${m.prefix}tovideo\`para mengubahnya.`
        )
        return
    }

    await m.react('🕕')

    try {
        const buffer = await downloadFn()

        if (!buffer || buffer.length === 0) {
            await m.reply(
                `❌ *ɢᴀɢᴀʟ*\n\n` +
                `No se pueden descargar pegatinas.\n` +
                `La pegatina puede no estar disponible.`
            )
            return
        }

        if (buffer.length < 100) {
            await m.reply(
                `❌ *ꜰɪʟᴇ ᴋᴏʀᴜᴘ*\n\n` +
                `*Las pegatinas de archivo no son válidas ni rotas.*\n` +
                `> Intenta envia repite stickernya.`
            )
            return
        }

        await sock.sendMedia(m.chat, buffer, null, m, {
            type: 'image'
        })

    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `" Se ha cometido un error durante el procesamiento.\n` +
            `> _${error.message}_`
        )
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

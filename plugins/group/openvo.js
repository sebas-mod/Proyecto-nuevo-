"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourin = require('ourin');
const pluginConfig = {
    name: 'rvo',
    alias: [],
    category: 'group',
    description: 'Mensaje abierto 1xvéase la respuesta',
    usage: '.rvo (reply pesan 1x lihat)',
    example: '.rvo',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const quoted = m.quoted

    if (!quoted) {
        await m.reply(
            `❌ *ɢᴀɢᴀʟ*\n\n` +
            `*Otro*x¡Míralo con este orden!\n` +
            `> Usa: \`${m.prefix}openvo\`(mensaje de respuesta 1xmira)`
        )
        return
    }

    const quotedMsg = quoted.message
    if (!quotedMsg) {
        await m.reply(
            `❌ *ᴘᴇsᴀɴ ᴛɪᴅᴀᴋ ᴅɪᴛᴇᴍᴜᴋᴀɴ*\n\n` +
            `No se pueden leer mensajes que se reponen.`
        )
        return
    }

    const type = Object.keys(quotedMsg)[0]
    const content = quotedMsg[type]

    if (!content) {
        await m.reply(
            `❌ *ᴋᴏɴᴛᴇɴ ᴛɪᴅᴀᴋ ᴅɪᴛᴇᴍᴜᴋᴀɴ*\n\n` +
            `Para Contenidos los mensajes no se pueden pegar.`
        )
        return
    }

    if (!content.viewOnce) {
        await m.reply(
            `❌ *ʙᴜᴋᴀɴ ᴠɪᴇᴡᴏɴᴄᴇ*\n\n` +
            `Mensaje, quien no responde a un mensaje 1xmira!\n` +
            `*Mensajes de Responde con icono 1*xmira (👁- (Gruñido)`
        )
        return
    }

    await m.react('🕕')

    try {
        let mediaType = null
        if (type.includes('image')) {
            mediaType = 'image'
        } else if (type.includes('video')) {
            mediaType = 'video'
        } else if (type.includes('audio')) {
            mediaType = 'audio'
        }

        if (!mediaType) {
            await m.reply(
                `El tipo es compatible, sólo soporte imágenes, vídeo, audio`
            )
            return
        }

        const stream = await _ourin.downloadContentFromMessage.call(void 0, content, mediaType)
        
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        if (!buffer || buffer.length < 100) {
            await m.reply(
                `❌ *ɢᴀɢᴀʟ ᴍᴇɴɢᴜɴᴅᴜʜ*\n\n` +
                `No se puede descargar los medios de comunicación.\n` +
                `Ehemedia puede haber expirado.`
            )
            return
        }
        const quoted = m.quoted ? m.quoted : m

        if (mediaType === 'image') {
            await sock.sendMedia(m.chat, buffer, null, quoted, {
                type: 'image'
            })
        } else if (mediaType === 'video') {
            await sock.sendMedia(m.chat, buffer, null, quoted, {
                type: 'video'
            })
        } else if (mediaType === 'audio') {
            await sock.sendMedia(m.chat, buffer, null, quoted, {
                type: 'audio',
                mimetype: 'audio/mpeg',
                ptt: true
            })
        }

    } catch (error) {
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `Gafl hace el mensaje 1xmira.\n` +
            `> _${error.message}_`
        )
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

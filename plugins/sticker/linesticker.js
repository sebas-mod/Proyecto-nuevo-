"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
    name: 'linesticker',
    alias: ['linepack', 'line'],
    category: 'sticker',
    description: 'Download sticker pack LINE',
    usage: '.linesticker <url>',
    example: '.linesticker https://store.line.me/stickershop/product/9801/en',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 25,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const url = _optionalChain([m, 'access', _ => _.args, 'optionalAccess', _2 => _2[0], 'optionalAccess', _3 => _3.trim, 'call', _4 => _4()])
    
    if (!url || !url.includes('store.line.me')) {
        return m.reply(
            `🎨 *ʟɪɴᴇ sᴛɪᴄᴋᴇʀ ᴘᴀᴄᴋ*\n\n` +
            `> Download LINE sticker pack\n\n` +
            `╭┈┈⬡「 📋 *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ* 」\n` +
            `┃ ${m.prefix}linesticker <url>\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `*ᴄᴀʀᴀ ᴅᴀᴘᴀᴛ ᴜʀʟ:*\n` +
            `Abrehttps://store.line.me\n` +
            `Escoge un paquete de pegatinas.\n` +
            `Copiar la URL del navegador.\n\n` +
            `*ᴄᴏɴᴛᴏʜ:*\n` +
            `> ${m.prefix}linesticker https://store.line.me/stickershop/product/9801/en`
        )
    }
    
    await m.react('🕕')
    
    try {
        const apikey = _optionalChain([_configjs2.default, 'access', _5 => _5.APIkey, 'optionalAccess', _6 => _6.neoxr])
        if (!apikey) {
            await m.react('❌')
            return m.reply(`❌¿Qué pasa?xr no se encuentra en el config!`)
        }
        
        const apiUrl = `https://api.neoxr.eu/api/linesticker?url=${encodeURIComponent(url)}&apikey=${apikey}`
        const res = await _axios2.default.get(apiUrl, { timeout: 60000 })
        
        if (!_optionalChain([res, 'access', _7 => _7.data, 'optionalAccess', _8 => _8.status]) || !_optionalChain([res, 'access', _9 => _9.data, 'optionalAccess', _10 => _10.data])) {
            await m.react('❌')
            return m.reply(`❌Gagalt tomó las pegatinas de la URL!`)
        }
        
        const data = res.data.data
        const title = data.title || 'LINE Sticker'
        const author = data.author || 'Unknown'
        const isAnimated = data.animated || false
        
        const stickerUrls = isAnimated && _optionalChain([data, 'access', _11 => _11.sticker_animation_url, 'optionalAccess', _12 => _12.length])
            ? data.sticker_animation_url
            : data.sticker_url || []
        
        if (!stickerUrls.length) {
            await m.react('❌')
            return m.reply(`❌¡No se encontraron pegatinas!`)
        }
        
        await m.reply(
            `🎨 *ʟɪɴᴇ sᴛɪᴄᴋᴇʀ ᴘᴀᴄᴋ*\n\n` +
            `╭┈┈⬡「 📦 *ɪɴꜰᴏ* 」\n` +
            `┃ 📝 *Title:* ${title}\n` +
            `┃ 👤 *Author:* ${author}\n` +
            `┃ 🎬 *Animated:* ${isAnimated ? 'Ya' : 'Tidak'}\n` +
            `┃ 📊 *Total:* ${stickerUrls.length}\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `•🕕Enviando sticker...`
        )
        
        const maxStickers = Math.min(stickerUrls.length, 10)
        const packname = title
        const packAuthor = author
        
        let sent = 0
        for (let i = 0; i < maxStickers; i++) {
            try {
                const response = await _axios2.default.get(stickerUrls[i], {
                    responseType: 'arraybuffer',
                    timeout: 30000,
                    headers: { 'User-Agent': 'Mozilla/5.0' }
                })
                const buffer = Buffer.from(response.data)
                
                if (isAnimated) {
                    await sock.sendVideoAsSticker(m.chat, buffer, m, { packname, author: packAuthor })
                } else {
                    await sock.sendImageAsSticker(m.chat, buffer, m, { packname, author: packAuthor })
                }
                sent++
                await new Promise(r => setTimeout(r, 600))
            } catch (e) {
                console.error('[LineSticker] Sticker error:', e.message)
            }
        }
        
        if (sent > 0) {
            await m.react('✅')
            await m.reply(`✅Exito envia${sent}/${stickerUrls.length} sticker`)
        } else {
            await m.react('☢')
            await m.reply(`❌El truco envió las pegatinas`)
        }
        
    } catch (error) {
        console.error('[LineSticker] Error:', error.message)
        await m.react('☢')
        m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

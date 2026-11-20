"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fbdownjs = require('../../src/scraper/fbdown.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
    name: 'facebookdl',
    alias: ['fbdown', 'fb', 'facebook', 'fbdl'],
    category: 'download',
    description: 'Download video Facebook',
    usage: '.facebookdl <url>',
    example: '.facebookdl https://www.facebook.com/watch?v=xxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const url = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()])
    
    if (!url) {
        return m.reply(
            `⚠♪ CARA PACKAI ♪\n\n` +
            `- \`${m.prefix}facebookdl <url>\`\n\n` +
            `*Ejemplo:*\n` +
            `- \`${m.prefix}fbdown https://www.facebook.com/watch?v=xxx\``
        )
    }
    
    if (!url.match(/facebook\.com|fb\.watch|fb\.com/i)) {
        return m.reply(`❌URL inválida. Use enlace Facebook.`)
    }
    
    await m.react('🕕')
    
    try {
        const data = await _fbdownjs.fbdown.call(void 0, url)
        
        if (!_optionalChain([data, 'optionalAccess', _4 => _4.status]) || !data.result || !data.result.medias || data.result.medias.length === 0) {
            await m.react('❌')
            return m.reply(`❌Stebuli tomó otro video.\n\nNota: El sistema actual no ha descargado aún la foto de Facebook, sólo el vídeo. _`)
        }
        
        //Encontrar HD si está disponible, más SD, otro elemento firme
        let video = data.result.medias.find(m => m.quality === "hd") || 
                    data.result.medias.find(m => m.quality === "sd") || 
                    data.result.medias[0];
        
        if (!video || !video.url) {
            await m.react('❌')
            return m.reply(`❌El vídeo no se encontró en el enlace.\n\nNota: El sistema actual no ha descargado aún la foto de Facebook, sólo el vídeo. _`)
        }
        
        let caption = `🎥 *FACEBOOK DOWNLOADER*\n\n`
        caption += `*Judul:* ${data.result.title || "Video Facebook"}\n`
        caption += `*Kualitas:* ${video.quality ? video.quality.toUpperCase() : "Normal"}\n`
        if (video.formattedSize) {
            caption += `*Ukuran:* ${video.formattedSize}\n`
        }
        caption += `\nNota: Está característica no admite las publicaciones de fotos. _`

        await sock.sendMedia(m.chat, video.url, caption, m, {
            type: 'video',
            contextInfo: {
                forwardingScore: 99,
                isForwarded: true
            }
        })
        
        await m.react('✅')
    } catch (err) {
        await m.react('❌')
        return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

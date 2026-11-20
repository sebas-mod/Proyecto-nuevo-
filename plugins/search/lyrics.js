"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

async function fetchLyrics(judul) {
  try {
    const res = await _axios2.default.get(`https://api.nexray.eu.cc/search/lyrics?q=${encodeURIComponent(judul)}`)
    if (res.data && res.data.status && res.data.result) {
      return res.data.result
    }
    return null
  } catch (error) {
    return null
  }
}

const pluginConfig = {
    name: 'lirik',
    alias: ['lyric', 'lyrics', 'liriklagu'],
    category: 'search',
    description: 'Cari lirik lagu',
    usage: '.lirik <query>',
    example: '.lirik sempurna',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const query = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()])
    
    if (!query) {
        return m.reply(
            `Hola hermano!✨Eka entrar en el gimiso,¿¿No?😅\n\n` +
            `Intenta como en el mando como este: *${m.prefix}lirik sempurna andra and the backbone* 🎶\n\n` +
            `¡Vamos a buscar una silla para cantar una canción!🎤🔥`
        )
    }
    
    m.react('🔍')
    
    try {
        const data = await fetchLyrics(query)
        
        if (!data || !data.lyrics || !data.lyrics.plain_lyrics) {
            m.react('❌')
            return m.reply(`Lo siento, hermano.🥺como canciones *${query}¡Intente usar una contraseña o encabezado más específico!💔`)
        }
        
        const title = data.title || query
        const artist = data.artist || data.lyrics.artist_name || 'No diketahui'
        const lyricsText = data.lyrics.plain_lyrics
        
        const texts = `¡La reunión litúrgica!🎉\n\n` +
                      `🎵 *Judul:* ${title}\n` +
                      `🎤 *Artis:* ${artist}\n\n` +
                      `Aquí tienes.\n\n` +
                      `${lyricsText}\n\n` +
                      `Canta bien, hermana!🎧💖`
                      
        if (data.thumbnail && data.thumbnail !== '-') {
            await sock.sendMessage(m.chat, {
                image: { url: data.thumbnail },
                caption: texts
            }, { quoted: m })
        } else {
            await m.reply(texts)
        }
        
        m.react('✅')
        
    } catch (error) {
        m.react('☢')
        m.reply(`Bueno, la letra del servidor está tomando pies fríos.😭¡Inténtalo de nuevo más tarde!🛠✨`)
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

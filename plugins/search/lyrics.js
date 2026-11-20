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
            `Hai kak! ✨ Lupa masukin judul lagunya ya? 😅\n\n` +
            `Coba deh ketik perintahnya begini: *${m.prefix}lirik sempurna andra and the backbone* 🎶\n\n` +
            `Yuk, masukin judulnya biar kita bisa nyanyi bareng! 🎤🔥`
        )
    }
    
    m.react('🔍')
    
    try {
        const data = await fetchLyrics(query)
        
        if (!data || !data.lyrics || !data.lyrics.plain_lyrics) {
            m.react('❌')
            return m.reply(`Waduh, maaf banget kak 🥺 lirik lagu *${query}* nggak ketemu nih di database. Coba pakai kata kunci atau judul yang lebih spesifik ya! 💔`)
        }
        
        const title = data.title || query
        const artist = data.artist || data.lyrics.artist_name || 'Tidak diketahui'
        const lyricsText = data.lyrics.plain_lyrics
        
        const texts = `Ketemu nih liriknya! 🎉\n\n` +
                      `🎵 *Judul:* ${title}\n` +
                      `🎤 *Artis:* ${artist}\n\n` +
                      `Ini dia lirik lengkapnya buat kamu:\n\n` +
                      `${lyricsText}\n\n` +
                      `Selamat bernyanyi ria, kak! 🎧💖`
                      
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
        m.reply(`Yah, server liriknya lagi ngambek nih kak 😭 Coba lagi nanti ya! 🛠️✨`)
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

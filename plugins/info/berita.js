"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _cheerio = require('cheerio'); var cheerio = _interopRequireWildcard(_cheerio);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
    name: ['antara', 'cnn', 'cnbc', 'sindonews', 'berita'],
    alias: [],
    category: 'berita',
    description: 'Obteniendo las últimas noticias de una fuente.',
    usage: '.berita <sumber>',
    example: '.kompas atau .berita cnn',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

const NEWS_SOURCES = {
    antara: {
        url: 'https://www.antaranews.com/rss/terkini.xml',
        name: 'Antara News',
        emoji: '📰'
    },
    cnn: {
        url: 'https://www.cnnindonesia.com/nasional/rss',
        name: 'CNN Indonesia',
        emoji: '📺'
    },
    cnbc: {
        url: 'https://www.cnbcindonesia.com/rss',
        name: 'CNBC Indonesia',
        emoji: '💹'
    },
    sindonews: {
        url: 'https://international.sindonews.com/rss',
        name: 'Sindo News',
        emoji: '📰'
    },
}

async function fetchRSS(url) {
    const response = await _axios2.default.get(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 15000
    })
    
    const $ = cheerio.load(response.data, { xmlMode: true })
    const items = []
    
    $('item').each((i, el) => {
        if (i >= 10) return false
        
        const title = $(el).find('title').text().trim()
        const link = $(el).find('link').text().trim()
        const pubDate = $(el).find('pubDate').text().trim()
        const description = $(el).find('description').text().trim()
            .replace(/<[^>]*>/g, '')
            .substring(0, 150)
        
        if (title && link) {
            items.push({ title, link, pubDate, description })
        }
    })
    
    return items
}

function formatDate(dateStr) {
    try {
        const date = new Date(dateStr)
        return date.toLocaleString('es-AR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    } catch (e) {
        return dateStr
    }
}

async function handler(m) {
    const cmd = m.command.toLowerCase()
    let source = cmd
    
    if (cmd === 'berita') {
        const arg = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3(), 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()])
        if (!arg) {
            let txt = `📰 *ᴅᴀꜰᴛᴀʀ sᴜᴍʙᴇʀ ʙᴇʀɪᴛᴀ*\n\n`
            for (const [key, val] of Object.entries(NEWS_SOURCES)) {
                txt += `> ${val.emoji} \`${m.prefix}${key}\` - ${val.name}\n`
            }
            txt += `\n_Atau usa: \`${m.prefix}berita<sumber>\`¿Qué?`
            return m.reply(txt)
        }
        
        if (!NEWS_SOURCES[arg]) {
            return m.reply(`❌La fuente de las noticias no fue encontrada.\n> Usa:\`${m.prefix}berita\`para ver la lista.`)
        }
        source = arg
    }
    
    const newsSource = NEWS_SOURCES[source]
    if (!newsSource) {
        return m.reply(`❌La fuente de las noticias no es válida.`)
    }
    
    await m.react('🕕')
    
    try {
        const articles = await fetchRSS(newsSource.url)
        
        if (articles.length === 0) {
            return m.reply(`❌No se han encontrado noticias.`)
        }
        
        let txt = `${newsSource.emoji} *${newsSource.name.toUpperCase()}*\n`
        txt += `━━━━━━━━━━━━━━━\n\n`
        
        for (let i = 0; i < Math.min(articles.length, 7); i++) {
            const article = articles[i]
            txt += `*${i + 1}. ${article.title}*\n`
            if (article.description) {
                txt += `${_optionalChain([article, 'access', _6 => _6.description, 'optionalAccess', _7 => _7.trim, 'call', _8 => _8()])}...\n`
            }
            txt += `🔗 ${article.link}\n`
            if (article.pubDate) {
                txt += `📅 _${formatDate(article.pubDate)}_\n`
            }
            txt += `\n`
        }
        
        txt += `━━━━━━━━━━━━━━━\n`
        txt += `_Total: ${articles.length}artículos disponibles`
        
        await m.reply(txt)
        m.react('📰')
        
    } catch (err) {
        m.react('☢')
        return m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

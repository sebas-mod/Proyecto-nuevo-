"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _cheerio = require('cheerio'); var cheerio = _interopRequireWildcard(_cheerio);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
    name: "movieku",
    alias: ["movie", "film", "carifilm", "carimovie"],
    category: "search",
    description: "Busca y mostrar información completa de filmación de mi Movieku a lo largo de las descargas de enlaces en calidad",
    usage: ".movieku <judul film>",
    example: ".movieku avengers",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function searchMovies(query) {
    const res = await _axios2.default.post(
        "https://movieku.rest/wp-admin/admin-ajax.php",
        `action=ts_ac_do_search&ts_ac_query=${encodeURIComponent(query)}`,
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "X-Requested-With": "XMLHttpRequest"
            },
            timeout: 30000
        }
    )
    return _optionalChain([res, 'access', _2 => _2.data, 'optionalAccess', _3 => _3.post, 'optionalAccess', _4 => _4[0], 'optionalAccess', _5 => _5.all]) || []
}

async function getMovieDetail(movieUrl) {
    const res = await _axios2.default.get(movieUrl, { timeout: 30000 })
    const $ = cheerio.load(res.data)

    const title = $("h1").first().text().trim()
    const synopsis = $(".entry-content p").first().text().trim()
    const poster = $('img[src*="wp-content/uploads"]').first().attr("src")

    const detail = {}
    $("ul li").each((_, el) => {
        const text = $(el).text().trim()
        if (text.startsWith("Genre:")) detail.genre = $(el).find("a").map((_, a) => $(a).text()).get().join(", ")
        if (text.startsWith("Release:")) detail.release = text.replace("Release:", "").trim()
        if (text.startsWith("Duration:")) detail.duration = text.replace("Duration:", "").trim()
        if (text.startsWith("Director:")) detail.director = $(el).find("a").first().text().trim()
        if (text.startsWith("Country:")) detail.country = $(el).find("a").first().text().trim()
        if (text.startsWith("Quality:")) detail.quality = text.replace("Quality:", "").trim()
        if (text.startsWith("Score:")) detail.score = text.replace("Score:", "").trim()
        if (text.startsWith("Rating:")) detail.rating = text.replace("Rating:", "").trim()
        if (text.startsWith("Stars:")) detail.stars = $(el).find("a").map((_, a) => $(a).text()).get().join(", ")
    })

    const stream = $('a[href*="abyssplayer"]').first().attr("href") || null

    const downloads = {}
    $("strong").each((_, el) => {
        const label = $(el).text().trim()
        if (["1080p", "720p", "480p", "360p"].includes(label)) {
            downloads[label] = {}
            $(el).parent().find("a").each((_, a) => {
                downloads[label][$(a).text().trim()] = $(a).attr("href")
            })
        }
    })

    return { title, poster, synopsis, ...detail, stream, downloads }
}

function formatDownloads(downloads) {
    if (!downloads || Object.keys(downloads).length === 0) return ""
    let txt = `\n🔽*Enlace DOWNLOAD*\n\n`
    const qualities = ["1080p", "720p", "480p", "360p"]
    for (const q of qualities) {
        if (!downloads[q]) continue
        const links = Object.entries(downloads[q])
        if (links.length === 0) continue
        txt += `📀 *${q}*\n`
        for (const [server, url] of links) {
            txt += `- ${server}: ${url}\n`
        }
        txt += `\n`
    }
    return txt
}

async function handler(m, { sock }) {
    const query = _optionalChain([m, 'access', _6 => _6.text, 'optionalAccess', _7 => _7.trim, 'call', _8 => _8()])

    if (!query) {
        return m.reply(
            `🎬 *MOVIEKU*\n\n` +
            `Está función le ayuda a buosación compleción sobleta so ( las elículas de mi base de datos Moview, sintopis, detllada peícula y encargas en la recituid de la resolución\n\n` +
            `*Como usarlo:*\n` +
            `> \`${m.prefix}movieku <judul film>\`\n\n` +
            `*Ejemplo:*\n` +
            `> \`${m.prefix}movieku avengers\`\n` +
            `> \`${m.prefix}movieku one piece\`\n\n` +
            `* La búsqueda mostrará la pepeícula más relevante con el encabezado que buscas *`
        )
    }

    m.react("🔍")

    try {
        const movies = await searchMovies(query)

        if (!movies || movies.length === 0) {
            m.react("❌")
            return m.reply(`❌Películas con palabras clave *${query}* no encontrado, tratar de utilizar un título más específico sí`)
        }

        const movie = movies[0]
        const detail = await getMovieDetail(movie.post_link)

        let txt = `🎬 *${detail.title || movie.post_title || query.toUpperCase()}*\n\n`

        if (detail.synopsis) {
            const synopsisText = detail.synopsis.length > 500
                ? detail.synopsis.substring(0, 497) + "..."
                : detail.synopsis
            txt += `📝 *Sinopsis:*\n${synopsisText}\n\n`
        }

        txt += `📋 *DETAIL FILM*\n\n`
        if (detail.genre) txt += `🎭 Genre: *${detail.genre}*\n`
        if (detail.release) txt += `📅 Rilis: *${detail.release}*\n`
        if (detail.duration) txt += `⏱Duración${detail.duration}*\n`
        if (detail.quality) txt += `📺 Kualitas: *${detail.quality}*\n`
        if (detail.country) txt += `🌍 Pais: *${detail.country}*\n`
        if (detail.director) txt += `🎬 Sutradara: *${detail.director}*\n`
        if (detail.rating) txt += `⭐ Rating: *${detail.rating}*\n`
        if (detail.score) txt += `📊 Score: *${detail.score}*\n`
        if (detail.stars) txt += `🌟 Pemeran: *${detail.stars}*\n`

        if (detail.stream) {
            txt += `\n▶️ *Streaming:* ${detail.stream}\n`
        }

        txt += formatDownloads(detail.downloads)

        txt += `🔗 ${movie.post_link}`

        m.react("✅")

        const poster = detail.poster || movie.post_image
        if (poster) {
            await sock.sendMessage(m.chat, {
                image: { url: poster },
                caption: txt
            }, { quoted: m })
        } else {
            await m.reply(txt)
        }

        if (movies.length > 1) {
            let listTxt = `🎬*Resultado Otros*\n\n`
            listTxt += `Ditemukan *${movies.length}* La única buena peícula con su búsqueda, junto a la lista compleja:\n\n`
            const maxShow = Math.min(movies.length, 10)
            for (let i = 1; i < maxShow; i++) {
                listTxt += `- *${movies[i].post_title}*\n  > ${movies[i].post_link}\n\n`
            }
            if (movies.length > 10) {
                listTxt += `_...y${movies.length - 10}Otras peículas`
            }
            await m.reply(listTxt.trim())
        }

    } catch (error) {
        m.react("☢")
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

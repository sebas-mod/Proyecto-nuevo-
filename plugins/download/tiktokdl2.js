"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _cheerio = require('cheerio'); var cheerio = _interopRequireWildcard(_cheerio);
var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);
var _ourin = require('ourin');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    Origin: 'https://savett.cc',
    Referer: 'https://savett.cc/en1/download',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'
}

async function getToken() {
    const res = await _axios2.default.get('https://savett.cc/en1/download')
    return {
        csrf: _optionalChain([res, 'access', _2 => _2.data, 'access', _3 => _3.match, 'call', _4 => _4(/name="csrf_token" value="([^"]+)"/), 'optionalAccess', _5 => _5[1]]),
        cookie: res.headers['set-cookie'].map(v => v.split(';')[0]).join('; ')
    }
}

async function fetchTikTok(url, csrf, cookie) {
    const res = await _axios2.default.post(
        'https://savett.cc/en1/download',
        `Token Crftuse =${encodeURIComponent(csrf)}&url=${encodeURIComponent(url)}`,
        { headers: { ...headers, Cookie: cookie } }
    )
    return res.data
}

function parseResponse(html) {
    const $ = cheerio.load(html)

    const stats = []
    $('#video-info .my-1 span').each((_, el) => {
        stats.push($(el).text().trim())
    })

    const data = {
        username: $('#video-info h3').first().text().trim(),
        views: stats[0] || null,
        likes: stats[1] || null,
        bookmarks: stats[2] || null,
        comments: stats[3] || null,
        shares: stats[4] || null,
        duration: $('#video-info p.text-muted').first().text().replace(/Duration:/i, '').trim() || null,
        type: null,
        downloads: { nowm: [], wm: [] },
        mp3: [],
        slides: []
    }

    const slides = $('.carousel-item[data-data]')

    if (slides.length) {
        data.type = 'photo'
        slides.each((_, el) => {
            try {
                const json = JSON.parse($(el).attr('data-data').replace(/&quot;/g, '"'))
                if (Array.isArray(json.URL)) {
                    json.URL.forEach(url => {
                        data.slides.push({ index: data.slides.length + 1, url })
                    })
                }
            } catch (e2) {}
        })
        return data
    }

    data.type = 'video'

    $('#formatselect option').each((_, el) => {
        const label = $(el).text().toLowerCase()
        const raw = $(el).attr('value')
        if (!raw) return

        try {
            const json = JSON.parse(raw.replace(/&quot;/g, '"'))
            if (!json.URL) return

            if (label.includes('mp4') && !label.includes('watermark')) {
                data.downloads.nowm.push(...json.URL)
            }
            if (label.includes('watermark')) {
                data.downloads.wm.push(...json.URL)
            }
            if (label.includes('mp3')) {
                data.mp3.push(...json.URL)
            }
        } catch (e3) {}
    })

    return data
}

async function savett(url) {
    const { csrf, cookie } = await getToken()
    const html = await fetchTikTok(url, csrf, cookie)
    return parseResponse(html)
}

const pluginConfig = {
    name: ['tiktok2', 'tt2', 'ttmp4'],
    alias: ['tiktokdl2', 'ttdown2'],
    category: 'download',
    description: 'Download video/slide TikTok tanpa watermark',
    usage: '.tiktok2 <url>',
    example: '.tiktok2 https://vt.tiktok.com/xxx',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const url = _optionalChain([m, 'access', _6 => _6.text, 'optionalAccess', _7 => _7.trim, 'call', _8 => _8()])

    if (!url) {
        return m.reply(
            `╭┈┈⬡「 🎵 *ᴛɪᴋᴛᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅ* 」\n` +
            `┃ ㊗ ᴜsᴀɢᴇ: \`${m.prefix}tiktok2 <url>\`\n` +
            `╰┈┈⬡\n\n` +
            `> Ejemplo:${m.prefix}tiktok2 https://vt.tiktok.com/xxx`
        )
    }

    if (!url.match(/tiktok\.com|vt\.tiktok/i)) {
        return m.reply('❌Uplink no es válido, utilice los enlaces TikTok.')
    }

    m.react('⏱️')

    try {
        const result = await savett(url)

        const caption =
            `✅*Done hermano*\n\n` +
            `👤 *${result.username || '-'}*\n` +
            `👁️ Views: ${result.views || '-'} | ❤️ Likes: ${result.likes || '-'}\n` +
            `� Comments: ${result.comments || '-'} | 🔗 Shares: ${result.shares || '-'}\n` +
            `⏱️ Duration: ${result.duration || '-'}`

        if (result.type === 'video' && result.downloads.nowm.length > 0) {
            const videoRes = await _axios2.default.get(result.downloads.nowm[0], {
                responseType: 'arraybuffer',
                timeout: 60000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
                    'Referer': 'https://www.tiktok.com/'
                }
            })

            await sock.sendMessage(
                m.chat,
                {
                    video: Buffer.from(videoRes.data),
                    mimetype: 'video/mp4',
                    caption,
                },
                { quoted: m }
            )

            m.react('✅')
            return
        }

        if (result.type === 'photo' && result.slides.length > 0) {
            await m.reply(`📸*Enviando${result.slides.length} slide...*`)

            const mediaList = []
            for (let i = 0; i < result.slides.length; i++) {
                const imgUrl = result.slides[i].url
                if (!imgUrl) continue

                try {
                    const res = await _axios2.default.get(imgUrl, {
                        responseType: 'arraybuffer',
                        timeout: 30000
                    })
                    mediaList.push({
                        image: Buffer.from(res.data),
                        caption: i === 0 ? caption : ''
                    })
                } catch (e) {
                    console.error(`[TikTok2] Failed to download slide ${i}:`, e.message)
                }
            }

            if (mediaList.length === 0) {
                throw new Error('Descarga pegajosa imagen de diapositiva')
            }

            const opener = _ourin.generateWAMessageFromContent.call(void 0, 
                m.chat,
                {
                    messageContextInfo: { messageSecret: _crypto2.default.randomBytes(32) },
                    albumMessage: {
                        expectedImageCount: mediaList.length,
                        expectedVideoCount: 0
                    }
                },
                {
                    userJid: _ourin.jidNormalizedUser.call(void 0, sock.user.id),
                    quoted: m,
                    upload: sock.waUploadToServer
                }
            )

            await sock.relayMessage(opener.key.remoteJid, opener.message, {
                messageId: opener.key.id
            })

            for (const content of mediaList) {
                const msg = await _ourin.generateWAMessage.call(void 0, 
                    opener.key.remoteJid,
                    content,
                    { upload: sock.waUploadToServer }
                )

                msg.message.messageContextInfo = {
                    messageSecret: _crypto2.default.randomBytes(32),
                    messageAssociation: {
                        associationType: 1,
                        parentMessageKey: opener.key
                    }
                }

                await sock.relayMessage(msg.key.remoteJid, msg.message, {
                    messageId: msg.key.id
                })
            }

            if (result.mp3.length > 0) {
                await sock.sendMessage(
                    m.chat,
                    {
                        audio: { url: result.mp3[0] },
                        mimetype: 'audio/mpeg'
                    },
                    { quoted: m }
                )
            }

            m.react('✅')
            return
        }

        if (result.mp3.length > 0) {
            m.reply(`🍀# No\nA este contenido no tiene vídeo / diapositiva, enviar un audio solamente..`)
            await sock.sendMessage(
                m.chat,
                {
                    audio: { url: result.mp3[0] },
                    mimetype: 'audio/mpeg'
                },
                { quoted: m }
            )
            m.react('✅')
            return
        }

        throw new Error('No hay grano que pueda descargarse')

    } catch (err) {
        console.error('[TikTokDL2] Error:', err)
        m.react('☢')
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

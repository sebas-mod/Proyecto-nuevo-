"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);
var _ourin = require('ourin');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
    name: 'tiktokfoto',
    alias: ['ttfoto', 'ttphotosearch', 'searchtiktokfoto'],
    category: 'search',
    description: 'Cari foto TikTok dan kirim album gambar',
    usage: '.tiktokfoto <query>',
    example: '.tiktokfoto cosplay',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}

const CUKI_APIKEY = _optionalChain([_configjs2.default, 'access', _ => _.APIkey, 'optionalAccess', _2 => _2.cuki]) || 'cuki-x'

function formatNumber(n) {
    const value = Number(n) || 0
    if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
    if (value >= 1000) return (value / 1000).toFixed(1) + 'K'
    return value.toString()
}

function trimText(text, max = 180) {
    const value = (text || '').replace(/\s+/g, ' ').trim()
    if (!value) return '-'
    if (value.length <= max) return value
    return value.slice(0, max) + '...'
}

async function fetchTiktokFoto(query) {
    const { data } = await _axios2.default.get(`https://api.cuki.biz.id/api/search/tiktokfoto?apikey=${encodeURIComponent(CUKI_APIKEY)}&query=${encodeURIComponent(query)}`, {
        timeout: 30000,
        headers: {
            'x-api-key': CUKI_APIKEY,
            'user-agent': 'Mozilla/5.0'
        }
    })

    if (!_optionalChain([data, 'optionalAccess', _3 => _3.success]) || !_optionalChain([data, 'optionalAccess', _4 => _4.data, 'optionalAccess', _5 => _5.results, 'optionalAccess', _6 => _6.length])) {
        throw new Error(_optionalChain([data, 'optionalAccess', _7 => _7.message]) || 'Foto TikTok tidak ditemukan')
    }

    return data.data
}

async function handler(m, { sock }) {
    const query = _optionalChain([m, 'access', _8 => _8.text, 'optionalAccess', _9 => _9.trim, 'call', _10 => _10()])

    if (!query) {
        return m.reply(`📸 *TIKTOK FOTO SEARCH*\n\n> Contoh:\n\`${m.prefix}tiktokfoto cosplay\``)
    }

    m.react('🔍')

    try {
        const result = await fetchTiktokFoto(query)
        const post = result.results[0]
        const images = Array.isArray(_optionalChain([post, 'optionalAccess', _11 => _11.images])) ? post.images.slice(0, 10) : []

        if (!post || images.length === 0) {
            m.react('❌')
            return m.reply(`❌ Tidak ditemukan foto TikTok untuk: ${query}`)
        }

        let caption = '📸 *TIKTOK FOTO SEARCH*\n\n'
        caption += `🔎 *Query:* ${result.query || query}\n`
        caption += `📌 *Judul:* ${trimText(post.title || post.description)}\n`
        caption += `👤 *Author:* ${_optionalChain([post, 'access', _12 => _12.author, 'optionalAccess', _13 => _13.nickname]) || '-'}\n`
        caption += `🌍 *Region:* ${post.region || '-'}\n`
        caption += `🖼️ *Foto:* ${post.image_count || images.length}\n`
        caption += `❤️ *Like:* ${formatNumber(_optionalChain([post, 'access', _14 => _14.stats, 'optionalAccess', _15 => _15.like]))}\n`
        caption += `💬 *Comment:* ${formatNumber(_optionalChain([post, 'access', _16 => _16.stats, 'optionalAccess', _17 => _17.comment]))}\n`
        caption += `🔁 *Share:* ${formatNumber(_optionalChain([post, 'access', _18 => _18.stats, 'optionalAccess', _19 => _19.share]))}\n`
        caption += `🆔 *ID:* ${post.id || '-'}\n\n`
        caption += `📝 ${trimText(post.description || post.title, 220)}`

        await m.reply(caption)

        const mediaList = []
        for (const url of images) {
            try {
                const imageRes = await _axios2.default.get(url, {
                    responseType: 'arraybuffer',
                    timeout: 20000,
                    headers: {
                        'user-agent': 'Mozilla/5.0'
                    }
                })
                const buffer = Buffer.from(imageRes.data)
                if (buffer.length > 1000) {
                    mediaList.push({ image: buffer })
                }
            } catch (e) {}
        }

        if (mediaList.length === 0) {
            m.react('❌')
            return m.reply('❌ Gagal memuat foto TikTok')
        }

        try {
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
                const msg = await _ourin.generateWAMessage.call(void 0, opener.key.remoteJid, content, {
                    upload: sock.waUploadToServer
                })

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
        } catch (e2) {
            for (const content of mediaList) {
                await sock.sendMessage(m.chat, content, { quoted: m })
            }
        }

        m.react('✅')
    } catch (error) {
        console.log(error)
        m.react('☢')
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourinuploaderjs = require('../../src/lib/ourin-uploader.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourinserializejs = require('../../src/lib/ourin-serialize.js');
var _awesomephonenumber = require('awesome-phonenumber');

const pluginConfig = {
    name: 'qwa',
    alias: ['quotewa', 'fakeqwa'],
    category: 'tools',
    description: 'Membuat gambar quote WhatsApp',
    usage: '.qwa [teks]',
    example: '.qwa Halo Dunia',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 2,
    isEnabled: true
}

async function getPp(sock, jid) {
    try {
        const url = await sock.profilePictureUrl(jid, 'image')
        return url
    } catch (e2) {
        return 'https://files.catbox.moe/ios0gb.jfif'
    }
}

async function handler(m, { sock }) {
    try {
        let mainMsg = m
        let quoteMsg = null
        let textToQuote = m.args.join(' ')

        if (m.quoted && !textToQuote) {
            mainMsg = m.quoted
            textToQuote = mainMsg.body || ''
            
            if (sock.store && sock.store.loadMessage && mainMsg.id) {
                const originalMainMsg = await sock.store.loadMessage(m.chat, mainMsg.id)
                if (originalMainMsg) {
                    const serializedOriginal = await _ourinserializejs.serialize.call(void 0, sock, originalMainMsg)
                    if (serializedOriginal && serializedOriginal.quoted) {
                        quoteMsg = serializedOriginal.quoted
                    }
                }
            }
        } else if (m.quoted && textToQuote) {
            mainMsg = m
            quoteMsg = m.quoted
        }

        if (!textToQuote && !mainMsg.isMedia) {
            return m.reply(`❌ *FORMAT SALAH*\n\nKirim perintah \`.qwa <teks>\` atau reply pesan orang lain dengan \`.qwa\`.`)
        }
        await m.react('🕕')
        const msgTime = mainMsg.messageTimestamp ? new Date(mainMsg.messageTimestamp * 1000) : new Date()
        const timeStr = `${String(msgTime.getHours()).padStart(2, '0')}.${String(msgTime.getMinutes()).padStart(2, '0')}`
        let mainImage = null
        if (mainMsg.isMedia) {
            try {
                const buffer = await mainMsg.download()
                if (buffer) {
                    mainImage = await _ourinuploaderjs.uploadImage.call(void 0, buffer)
                }
            } catch (err) {
                console.error("Gagal download/upload media utama:", err)
            }
        }

        let quotedImage = null
        if (quoteMsg && quoteMsg.isMedia) {
            try {
                const buffer = await quoteMsg.download()
                if (buffer) {
                    quotedImage = await _ourinuploaderjs.uploadImage.call(void 0, buffer)
                }
            } catch (err) {
                console.error("Gagal download/upload media quoted:", err)
            }
        }

        const formatNumber = (numStr) => {
            try {
                const cleanNum = numStr.split('@')[0]
                const pn = _awesomephonenumber.parsePhoneNumber.call(void 0, "+" + cleanNum)
                if (pn && pn.valid && pn.number && pn.number.international) {
                    return pn.number.international.replace(/-/g, ' ')
                }
            } catch (e) {}
            return "+" + numStr.split('@')[0]
        }

        const payload = {
            sender_name:  `~ ${mainMsg.pushName}` || "~ User",
            sender_number: formatNumber(mainMsg.sender),
            sender_avatar: await getPp(sock, mainMsg.sender),
            message: textToQuote,
            time: timeStr,
            background: false
        }

        if (mainImage) payload.sender_image = mainImage

        if (quoteMsg) {
            payload.quoted = {
                name: `~ ${quoteMsg.pushName}` || "~ User",
                number: formatNumber(quoteMsg.sender),
                message: quoteMsg.body || ""
            }
            if (quotedImage) payload.quoted.image = quotedImage
        }
        const res = await _axios2.default.post('https://qwa.eeq.my.id/api/generate', payload, {
            headers: { 'Content-Type': 'application/json' },
            responseType: 'arraybuffer'
        })
        await sock.sendMessage(m.chat, {
            image: Buffer.from(res.data),
            caption: `✅ Berhasil membuat quote WhatsApp!`
        }, { quoted: m })

        await m.react('✅')
    } catch (error) {
        console.error("Error QWA:", error)
        await m.react('❌')
        m.reply(`❌ *GAGAL MEMBUAT QUOTE*\n\n> Terjadi kesalahan atau API sedang bermasalah.`)
    }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

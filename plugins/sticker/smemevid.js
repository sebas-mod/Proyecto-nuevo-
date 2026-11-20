"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _os = require('os'); var _os2 = _interopRequireDefault(_os);
var _fluentffmpeg = require('fluent-ffmpeg'); var _fluentffmpeg2 = _interopRequireDefault(_fluentffmpeg);
var _ffmpeg = require('@ffmpeg-installer/ffmpeg'); var _ffmpeg2 = _interopRequireDefault(_ffmpeg);
var _canvas = require('@napi-rs/canvas');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

_fluentffmpeg2.default.setFfmpegPath(_ffmpeg2.default.path)

const pluginConfig = {
    name: 'smemevid',
    alias: ['smemevideo', 'memevid'],
    category: 'sticker',
    description: 'Membuat sticker meme dari video',
    usage: '.smemevid <top>|<bottom>',
    example: '.smemevid WIDTH OR HEIGHT|WHY NOT BOTH?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    const isVideo = m.isVideo || (m.quoted && m.quoted.isVideo) || (m.quoted && m.quoted.type === 'videoMessage')
    if (!isVideo) {
        return m.reply(`🎬 *ᴍᴇᴍᴇ ᴠɪᴅᴇᴏ*\n\n> Reply atau kirim video dengan caption\n\n\`Contoh: ${m.prefix}smemevid Top|Bottom\``)
    }

    const input = m.args.join(' ')
    if (!input || !input.includes('|')) {
        return m.reply(`🎬 *ᴍᴇᴍᴇ ᴠɪᴅᴇᴏ*\n\n> Format: top|bottom\n\n\`Contoh: ${m.prefix}smemevid WIDTH OR HEIGHT|WHY NOT BOTH?\``)
    }

    const [top, bottom] = input.split('|').map(s => s.trim().toUpperCase())

    m.react('🕕')

    try {
        let mediaBuffer
        if (m.quoted) {
            mediaBuffer = await m.quoted.download()
        } else if (m.download) {
            mediaBuffer = await m.download()
        }

        if (!mediaBuffer) {
            m.react('❌')
            return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Gagal mengunduh video`)
        }

        const tempId = Date.now()
        const inputVideo = _path2.default.join(_os2.default.tmpdir(), `vid-${tempId}.mp4`)
        const outputVideo = _path2.default.join(_os2.default.tmpdir(), `vid-out-${tempId}.mp4`)
        const overlayImage = _path2.default.join(_os2.default.tmpdir(), `overlay-${tempId}.png`)

        _fs2.default.writeFileSync(inputVideo, mediaBuffer)

        const getMetadata = (file) => {
            return new Promise((resolve, reject) => {
                _fluentffmpeg2.default.ffprobe(file, (err, metadata) => {
                    if (err) reject(err)
                    else resolve(metadata)
                })
            })
        }

        const metadata = await getMetadata(inputVideo)
        const videoStream = metadata.streams.find(s => s.codec_type === 'video')
        if (!videoStream) throw new Error('Stream video tidak ditemukan')

        const size = 512

        const canvas = _canvas.createCanvas.call(void 0, size, size)
        const ctx = canvas.getContext('2d')

        const drawMemeText = (ctx, text, x, y, width, isBottom) => {
            if (!text) return

            ctx.fillStyle = 'white'
            ctx.strokeStyle = 'black'
            ctx.textAlign = 'center'
            ctx.textBaseline = isBottom ? 'bottom' : 'top'
            ctx.lineJoin = 'round'

            let fontSize = Math.floor(width / 8)
            ctx.font = `bold ${fontSize}px Impact, Arial`

            while (ctx.measureText(text).width > width - 20) {
                fontSize -= 2
                ctx.font = `bold ${fontSize}px Impact, Arial`
                if (fontSize < 10) break
            }

            ctx.lineWidth = Math.floor(fontSize / 6)
            ctx.strokeText(text, x, y)
            ctx.fillText(text, x, y)
        }

        drawMemeText(ctx, top, size / 2, 10, size, false)
        drawMemeText(ctx, bottom, size / 2, size - 10, size, true)

        const bufferImage = canvas.toBuffer('image/png')
        _fs2.default.writeFileSync(overlayImage, bufferImage)

        await new Promise((resolve, reject) => {
            _fluentffmpeg2.default.call(void 0, inputVideo)
                .input(overlayImage)
                .complexFilter([
                    `[0:v]crop='min(iw,ih)':'min(iw,ih)',scale=${size}:${size},fps=8[vid]`,
                    `[vid][1:v]overlay=0:0[out]`
                ])
                .outputOptions([
                    '-map [out]',
                    '-an',
                    '-c:v libx264',
                    '-preset fast',
                    '-crf 26',
                    '-t 4'
                ])
                .save(outputVideo)
                .on('end', () => resolve())
                .on('error', (err) => reject(err))
        })

        const stickerConfig = _configjs2.default.sticker || { packname: 'Ourin-AI', author: 'Bot' }

        await sock.sendVideoAsSticker(m.chat, outputVideo, m, {
            packname: stickerConfig.packname,
            author: stickerConfig.author
        })

        m.react('✅')

        try {
            _fs2.default.unlinkSync(inputVideo)
            _fs2.default.unlinkSync(outputVideo)
            _fs2.default.unlinkSync(overlayImage)
        } catch (e) { }

    } catch (error) {
        m.react('☢')
        m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Terjadi kesalahan saat memproses video`)
    }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

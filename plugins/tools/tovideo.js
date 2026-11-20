"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _sharp = require('../../src/lib/almiku-image.js'); var _sharp2 = _interopRequireDefault(_sharp);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _ffmpeg = require('../../src/lib/almiku-ffmpeg.js'); var _ffmpeg2 = _interopRequireDefault(_ffmpeg);
var _fluentffmpeg = require('fluent-ffmpeg'); var _fluentffmpeg2 = _interopRequireDefault(_fluentffmpeg);
_fluentffmpeg2.default.setFfmpegPath(_ffmpeg2.default.path)

const pluginConfig = {
    name: 'tovideo',
    alias: ['tovid', 'stickertovideo', 'giftomp4', 'webmtomp4'],
    category: 'tools',
    description: 'Convierte un sticker animado en video MP4',
    usage: '.tovideo (reply/caption sticker animasi)',
    example: '.tovideo',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 8,
    energi: 2,
    isEnabled: true
}

function isAnimatedWebp(buffer) {
    if (!buffer || buffer.length < 50) return false
    return buffer.includes(Buffer.from('ANIM')) || buffer.includes(Buffer.from('ANMF'))
}

function getTempDir() {
    const tmpDir = _path2.default.join(process.cwd(), 'tmp')
    if (!_fs2.default.existsSync(tmpDir)) _fs2.default.mkdirSync(tmpDir, { recursive: true })
    return tmpDir
}

async function webpToGif(buffer) {

    const meta = await _sharp2.default.call(void 0, buffer).metadata()
    if (!meta.pages || meta.pages <= 1) return null
    return _sharp2.default.call(void 0, buffer, { animated: true, pages: -1 }).gif({ loop: 0 }).toBuffer()
}

function gifToMp4(gifBuffer) {
    return new Promise((resolve, reject) => {
        const tmpDir = getTempDir()
        const ts = Date.now()
        const inputPath = _path2.default.join(tmpDir, `gif_${ts}.gif`)
        const outputPath = _path2.default.join(tmpDir, `vid_${ts}.mp4`)

        _fs2.default.writeFileSync(inputPath, gifBuffer)

        const cleanup = () => {
            try { if (_fs2.default.existsSync(inputPath)) _fs2.default.unlinkSync(inputPath) } catch (e) {}
            try { if (_fs2.default.existsSync(outputPath)) _fs2.default.unlinkSync(outputPath) } catch (e2) {}
        }

        const timeout = setTimeout(() => {
            cleanup()
            reject(new Error('Conversion timeout'))
        }, 60000)

        _fluentffmpeg2.default.call(void 0, inputPath)
            .inputOptions(['-y'])
            .outputOptions([
                '-movflags', 'faststart',
                '-pix_fmt', 'yuv420p',
                '-vf', "scale=trunc(iw/2)*2:trunc(ih/2)*2",
                '-c:v', 'libx264',
                '-preset', 'ultrafast',
                '-crf', '23',
                '-an'
            ])
            .toFormat('mp4')
            .on('end', () => {
                clearTimeout(timeout)
                try {
                    if (!_fs2.default.existsSync(outputPath) || _fs2.default.statSync(outputPath).size < 100) {
                        cleanup()
                        return reject(new Error('Output file empty'))
                    }
                    const mp4Buffer = _fs2.default.readFileSync(outputPath)
                    cleanup()
                    resolve(mp4Buffer)
                } catch (err) {
                    cleanup()
                    reject(err)
                }
            })
            .on('error', (err) => {
                clearTimeout(timeout)
                cleanup()
                reject(new Error('FFmpeg: ' + err.message))
            })
            .save(outputPath)
    })
}

async function handler(m, { sock }) {
    let downloadFn = null
    const selfIsSticker = m.isSticker || m.type === 'stickerMessage' || _optionalChain([m, 'access', _ => _.message, 'optionalAccess', _2 => _2.stickerMessage])
    const quotedIsSticker = m.quoted && (
        m.quoted.isSticker ||
        m.quoted.type === 'stickerMessage' ||
        m.quoted.mtype === 'stickerMessage' ||
        _optionalChain([m, 'access', _3 => _3.quoted, 'access', _4 => _4.message, 'optionalAccess', _5 => _5.stickerMessage])
    )

    if (selfIsSticker) {
        downloadFn = m.download
    } else if (quotedIsSticker) {
        downloadFn = m.quoted.download
    }

    if (!downloadFn) {
        return m.reply(
            `❌ *ɢᴀɢᴀʟ*\n\n` +
            `¡No detecten pegatinas!\n\n` +
            `*Como usarlo:*\n` +
            `Kpensmacker + capción\`${m.prefix}tovideo\`\n` +
            `Responder pegatina con\`${m.prefix}tovideo\``
        )
    }

    await m.react('🕕')

    try {
        const buffer = await downloadFn()

        if (!buffer || buffer.length === 0) {
            await m.react('❌')
            return m.reply(`❌*ɢᴀɢᴀʟ*\n\nNo se pueden descargar pegatinas.`)
        }

        const animated = isAnimatedWebp(buffer)

        if (!animated) {

            const pngBuffer = await _sharp2.default.call(void 0, buffer).png().toBuffer()
            await sock.sendMessage(m.chat, {
                image: pngBuffer,
                caption: `✅*ʙᴇʀʜᴀSɪʟ*\n\n*Static Sticker*→imagen`
            }, { quoted: m })
            await m.react('✅')
            return
        }
        const gifBuffer = await webpToGif(buffer)
        if (!gifBuffer) {
            await m.react('❌')
            return m.reply(`❌*ɢᴀɢᴀʟ*\n\n*La pegatina no puede ser conversada*`)
        }

        const mp4Buffer = await gifToMp4(gifBuffer)

        if (!mp4Buffer || mp4Buffer.length < 100) {
            await m.react('❌')
            return m.reply(`❌*ɢᴀɢᴀʟ*\n\n*Exducciones de vídeo vacio*`)
        }

        await sock.sendMedia(m.chat, mp4Buffer, null, m, {
            type: 'video'
        })
        await m.react('✅')

    } catch (error) {
        console.error('[ToVideo] Error:', error.message)
        await m.react('☢')
        m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

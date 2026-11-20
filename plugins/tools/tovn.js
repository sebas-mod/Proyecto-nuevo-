"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikuffmpegjs = require('../../src/lib/almiku-ffmpeg.js');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
const pluginConfig = {
    name: 'tovn',
    alias: ['tovoicenote', 'toptt', 'audiotovn'],
    category: 'tools',
    description: 'Mengubah audio/video menjadi voice note',
    usage: '.tovn (reply/caption audio/video)',
    example: '.tovn',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

async function handler(m, { sock }) {
    let mediaSource = null
    let downloadFn = null
    let isVideo = false
    
    const selfIsVideo = m.isVideo || m.type === 'videoMessage' || _optionalChain([m, 'access', _ => _.message, 'optionalAccess', _2 => _2.videoMessage])
    const selfIsAudio = m.isAudio || m.type === 'audioMessage' || _optionalChain([m, 'access', _3 => _3.message, 'optionalAccess', _4 => _4.audioMessage])
    
    const quotedIsVideo = m.quoted && (
        m.quoted.isVideo || 
        m.quoted.type === 'videoMessage' || 
        m.quoted.mtype === 'videoMessage' ||
        _optionalChain([m, 'access', _5 => _5.quoted, 'access', _6 => _6.message, 'optionalAccess', _7 => _7.videoMessage])
    )
    const quotedIsAudio = m.quoted && (
        m.quoted.isAudio || 
        m.quoted.type === 'audioMessage' || 
        m.quoted.mtype === 'audioMessage' ||
        _optionalChain([m, 'access', _8 => _8.quoted, 'access', _9 => _9.message, 'optionalAccess', _10 => _10.audioMessage])
    )
    
    if (selfIsVideo) {
        mediaSource = 'self'
        downloadFn = m.download
        isVideo = true
    } else if (selfIsAudio) {
        mediaSource = 'self'
        downloadFn = m.download
    } else if (quotedIsVideo) {
        mediaSource = 'quoted'
        downloadFn = m.quoted.download
        isVideo = true
    } else if (quotedIsAudio) {
        mediaSource = 'quoted'
        downloadFn = m.quoted.download
    }
    
    if (!mediaSource) {
        await m.reply(
            `❌ *ɢᴀɢᴀʟ*\n\n` +
            `¡No hay audios detectables!\n\n` +
            `*Como usarlo:*\n` +
            `DR. Ksenaudio / video + leyenda\`${m.prefix}tovn\`\n` +
            `Responder audio / video con\`${m.prefix}tovn\``
        )
        return
    }


    const tempDir = _path2.default.join(process.cwd(), 'temp')
    if (!_fs2.default.existsSync(tempDir)) _fs2.default.mkdirSync(tempDir, { recursive: true })

    const timestamp = Date.now()
    const ext = isVideo ? 'mp4' : 'mp3'
    const inputPath = _path2.default.join(tempDir, `input_${timestamp}.${ext}`)
    const outputPath = _path2.default.join(tempDir, `vn_${timestamp}.ogg`)

    await m.react('🕕')
    try {
        const buffer = await downloadFn()

        if (!buffer || buffer.length === 0) {
            await m.react('❌')
            await m.reply(
                `❌ *ɢᴀɢᴀʟ*\n\n` +
                `No se puede descargar los medios de comunicación.\n` +
                `Ehemedia puede estar más allá de la reproche.`
            )
            return
        }

        _fs2.default.writeFileSync(inputPath, buffer)

        const ffmpegCmd = [
            'ffmpeg -y',
            `-i "${inputPath}"`,
            '-vn',
            '-c:a libopus',
            '-b:a 128k',
            '-ar 48000',
            '-ac 1',
            '-application voip',
            `"${outputPath}"`
        ].join(' ')

        await _almikuffmpegjs.queueFFmpeg.call(void 0, ffmpegCmd)

        if (!_fs2.default.existsSync(outputPath)) {
            await m.react('❌')
            await m.reply(
                `❌ *ᴋᴏɴᴠᴇʀsɪ ɢᴀɢᴀʟ*\n\n` +
                `Gafal convierte a la nota de voz.\n` +
                `Así que asegúrese de que el ffmpeg está instalado correctamente.`
            )
            return
        }

        const vnBuffer = _fs2.default.readFileSync(outputPath)

        await sock.sendMedia(m.chat, vnBuffer, null, m, {
            type: 'audio',
            ptt: true
        })

        await m.react('✅')

    } catch (error) {
        await m.react('❌')
        await m.reply(
            `❌ *ᴇʀʀᴏʀ*\n\n` +
            `" Se ha cometido un error durante el procesamiento.\n` +
            `> _${error.message}_`
        )
    } finally {
        if (_fs2.default.existsSync(inputPath)) _fs2.default.unlinkSync(inputPath)
        if (_fs2.default.existsSync(outputPath)) _fs2.default.unlinkSync(outputPath)
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikuffmpegjs = require('../../src/lib/almiku-ffmpeg.js');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
const pluginConfig = {
    name: 'toaudio',
    alias: ['tomp3', 'videotoaudio', 'extractaudio'],
    category: 'tools',
    description: 'Mengubah video/voice note menjadi audio MP3',
    usage: '.toaudio (reply/caption video/vn)',
    example: '.toaudio',
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
    let isPtt = false
    const selfIsVideo = m.isVideo || m.type === 'videoMessage' || _optionalChain([m, 'access', _ => _.message, 'optionalAccess', _2 => _2.videoMessage])
    const selfIsAudio = m.isAudio || m.type === 'audioMessage' || _optionalChain([m, 'access', _3 => _3.message, 'optionalAccess', _4 => _4.audioMessage])
    const selfIsPtt = _optionalChain([m, 'access', _5 => _5.message, 'optionalAccess', _6 => _6.audioMessage, 'optionalAccess', _7 => _7.ptt]) === true
    const quotedIsVideo = m.quoted && (
        m.quoted.isVideo || 
        m.quoted.type === 'videoMessage' || 
        m.quoted.mtype === 'videoMessage' ||
        _optionalChain([m, 'access', _8 => _8.quoted, 'access', _9 => _9.message, 'optionalAccess', _10 => _10.videoMessage])
    )
    const quotedIsAudio = m.quoted && (
        m.quoted.isAudio || 
        m.quoted.type === 'audioMessage' || 
        m.quoted.mtype === 'audioMessage' ||
        _optionalChain([m, 'access', _11 => _11.quoted, 'access', _12 => _12.message, 'optionalAccess', _13 => _13.audioMessage])
    )
    const quotedIsPtt = _optionalChain([m, 'access', _14 => _14.quoted, 'optionalAccess', _15 => _15.message, 'optionalAccess', _16 => _16.audioMessage, 'optionalAccess', _17 => _17.ptt]) === true
    
    if (selfIsVideo) {
        mediaSource = 'self'
        downloadFn = m.download
        isVideo = true
    } else if (selfIsAudio && selfIsPtt) {
        mediaSource = 'self'
        downloadFn = m.download
        isPtt = true
    } else if (quotedIsVideo) {
        mediaSource = 'quoted'
        downloadFn = m.quoted.download
        isVideo = true
    } else if (quotedIsAudio) {
        mediaSource = 'quoted'
        downloadFn = m.quoted.download
        isPtt = quotedIsPtt
    }
    
    if (!mediaSource) {
        await m.reply(
            `❌ *ɢᴀɢᴀʟ*\n\n` +
            `No hay mención del video detestable / nota de voz!\n\n` +
            `*Como usarlo:*\n` +
            `Ksendvideo + capción\`${m.prefix}toaudio\`\n` +
            `Responder video / VN con\`${m.prefix}toaudio\``
        )
        return
    }
    if (!isVideo && !isPtt) {
        await m.reply(
            `⚠️ *sᴜᴅᴀʜ ᴀᴜᴅɪᴏ*\n\n` +
            `Este medio ya está en forma de audio.\n` +
            `> Usa \`${m.prefix}tovn\`Si quieres convertir a la nota de voz.`
        )
        return
    }

    await m.reply(`🕕*ᴍᴇᴍᴘʀᴏSᴇ- Sí.\n\nPara extraer un público de los medios de comunicación..`)

    const tempDir = _path2.default.join(process.cwd(), 'temp')
    if (!_fs2.default.existsSync(tempDir)) _fs2.default.mkdirSync(tempDir, { recursive: true })

    const ext = isVideo ? 'mp4' : 'ogg'
    const inputPath = _path2.default.join(tempDir, `input_${Date.now()}.${ext}`)
    const outputPath = _path2.default.join(tempDir, `audio_${Date.now()}.mp3`)

    try {
        const buffer = await downloadFn()

        if (!buffer || buffer.length === 0) {
            await m.reply(
                `❌ *ɢᴀɢᴀʟ*\n\n` +
                `No se puede descargar los medios de comunicación.\n` +
                `Ehemedia puede estar más allá de la reproche.`
            )
            return
        }

        _fs2.default.writeFileSync(inputPath, buffer)

        await _almikuffmpegjs.queueFFmpeg.call(void 0, `ffmpeg -y -i "${inputPath}" -vn -ar 44100 -ac 2 -b:a 192k "${outputPath}"`)

        if (!_fs2.default.existsSync(outputPath)) {
            await m.reply(
                `❌ *ᴋᴏɴᴠᴇʀsɪ ɢᴀɢᴀʟ*\n\n` +
                `- (Risas) - ( GASPS ) - ( GASPS )\n` +
                `Así que asegúrese de que el ffmpeg está instalado correctamente.`
            )
            return
        }

        const audioBuffer = _fs2.default.readFileSync(outputPath)

        await sock.sendMedia(m.chat, audioBuffer, null, m, {
            type: 'audio'
        })

    } catch (error) {
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

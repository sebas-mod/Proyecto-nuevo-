"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);
var _child_process = require('child_process');
var _util = require('util');
var _almiku = require('almiku');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);

const run = _util.promisify.call(void 0, _child_process.exec)

const pluginConfig = {
    name: "upch",
    alias: ["uploadch", "uploadsaluran", "uch"],
    category: "owner",
    description: "Subir imágenes, audios, videos, o texto a canal",
    usage: ".upch <id saluran> <teks opsional>",
    example: ".upch 12xxx@newsletter Halo!",
    cooldown: 10,
    energi: 0,
    isOwner: true,
    isEnabled: true
}

async function toOggOpus(inputBuf) {
    const tmp = _path2.default.join(process.cwd(), "temp")
    if (!_fs2.default.existsSync(tmp)) _fs2.default.mkdirSync(tmp, { recursive: true })
    const id = _crypto2.default.randomBytes(6).toString("hex")
    const inp = _path2.default.join(tmp, `upch_in_${id}`)
    const out = _path2.default.join(tmp, `upch_out_${id}.ogg`)
    _fs2.default.writeFileSync(inp, inputBuf)
    await run(`ffmpeg -y -i "${inp}" -vn -map_metadata -1 -ac 1 -ar 48000 -c:a libopus -b:a 96k -vbr on -application audio -f ogg "${out}"`)
    const buf = _fs2.default.readFileSync(out)
    try { _fs2.default.unlinkSync(inp) } catch (e2) {}
    try { _fs2.default.unlinkSync(out) } catch (e3) {}
    return buf
}

function generateWaveform(audioBuf, samples = 64) {
    const waveform = new Uint8Array(samples)
    const chunkSize = Math.floor(audioBuf.length / samples)
    for (let i = 0; i < samples; i++) {
        const offset = i * chunkSize
        let sum = 0
        const len = Math.min(chunkSize, audioBuf.length - offset)
        for (let j = 0; j < len; j++) {
            sum += Math.abs(audioBuf[offset + j] - 128)
        }
        waveform[i] = Math.min(255, Math.floor((sum / len) * 2.5))
    }
    return waveform
}

async function handler(m, { sock }) {
    const args = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.replace, 'call', _3 => _3(/^\.upch\s+/i, ''), 'access', _4 => _4.split, 'call', _5 => _5(" ")]) || []
    const chId = _optionalChain([args, 'access', _6 => _6[0], 'optionalAccess', _7 => _7.includes, 'call', _8 => _8("@newsletter")]) ? args.shift() : _optionalChain([_configjs2.default, 'optionalAccess', _9 => _9.saluran, 'optionalAccess', _10 => _10.id])
    const chName = _optionalChain([_configjs2.default, 'optionalAccess', _11 => _11.saluran, 'optionalAccess', _12 => _12.name]) || _optionalChain([_configjs2.default, 'optionalAccess', _13 => _13.bot, 'optionalAccess', _14 => _14.name]) || "Al Miku-AI"
    const caption = args.join(" ").trim()

    const quoted = m.quoted || m
    const isImage = m.isImage || (m.quoted && m.quoted.type === 'imageMessage')
    const isVideo = m.isVideo || (m.quoted && m.quoted.type === 'videoMessage')
    const isAudio = m.type === 'audioMessage' || (m.quoted && m.quoted.type === 'audioMessage')
    const isMedia = isImage || isVideo || isAudio

    if (!isMedia && !caption) {
        return m.reply(
            `📤 *UPLOAD SALURAN*\n\n` +
            `Respondé a un archivo multimedia con un texto:\n` +
            `  \`${m.prefix}upch 12xxx@newsletter <teks opsional>\`\n\n` +
            `*Support:*\n` +
            `  🖼️ Gambar\n` +
            `  🎥 Video\n` +
            `  🎵 Audio/VN\n` +
            `  📝Tex (sin medios)`
        )
    }

    await m.react("🕕")

    try {
        if (!isMedia && caption) {
            await sock.sendMessage(chId, { text: caption })
            await m.react("✅")
            return m.reply(`✅Tanques enviados con éxito al canal`)
        }

        const mediaBuf = await _almiku.downloadMediaMessage.call(void 0, quoted, "buffer", {})
        if (!mediaBuf || mediaBuf.length < 1000) throw new Error("Los medios son demasiado pequeños o descargas de fallos")

        if (isImage) {
            await sock.sendMessage(chId, {
                image: mediaBuf,
                caption: caption || undefined
            })
            await m.react("✅")
            return m.reply("✅Imagen envió con éxito al canal")
        }

        if (isVideo) {
            await sock.sendMessage(chId, {
                video: mediaBuf,
                caption: caption || undefined
            })
            await m.react("✅")
            return m.reply("✅Video enviado con éxito al canal")
        }

        if (isAudio) {
            const opusBuf = await toOggOpus(mediaBuf)
            if (opusBuf.length < 5000) throw new Error("La conversión de Opus falló")
            const waveform = generateWaveform(opusBuf)
            await sock.sendMessage(chId, {
                audio: opusBuf,
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
                waveform: Array.from(waveform)
            })
            await m.react("✅")
            return m.reply("✅Audio logró ser enviado al canal.")
        }

        m.reply("❌Los medios de comunicación de la cinta no son compatibles")
    } catch (e) {
        console.error("[UpCh]", e)
        await m.react("☢")
        await m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

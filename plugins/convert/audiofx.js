"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinffmpegjs = require('../../src/lib/ourin-ffmpeg.js');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const EFFECTS = {
    bass:      { emoji: '🔊', filter: 'bass=g=20:f=110:w=0.6', desc: 'Bass boost' },
    blown:     { emoji: '💥', filter: 'acrusher=level_in=4:level_out=5:bits=8:mode=log:aa=1', desc: 'Distortion' },
    deep:      { emoji: '🎤', filter: 'asetrate=44100*0.7,atempo=1.3', desc: 'Suara berat' },
    earrape:   { emoji: '📢', filter: 'volume=10,bass=g=30:f=80:w=0.6,acrusher=level_in=8:level_out=12:bits=4:mode=log:aa=1', desc: 'Earrape' },
    echo:      { emoji: '🔁', filter: 'aecho=0.8:0.88:60:0.4', desc: 'Echo/gema' },
    fast:      { emoji: '⚡', filter: 'atempo=1.5', desc: 'Percepat 1.5x' },
    fat:       { emoji: '🎵', filter: 'bass=g=15:f=60:w=0.8,lowpass=f=3000,volume=1.5', desc: 'Thick bass' },
    nightcore: { emoji: '🌙', filter: 'asetrate=44100*1.25,atempo=0.9', desc: 'Nightcore' },
    reverse:   { emoji: '🔄', filter: 'areverse', desc: 'Putar mundur' },
    robot:     { emoji: '🤖', filter: "afftfilt=real='hypot(re,im)*sin(0)':imag='hypot(re,im)*cos(0)':win_size=512:overlap=0.75", desc: 'Suara robot' },
    slow:      { emoji: '🐢', filter: 'atempo=0.8,asetrate=44100*0.9', desc: 'Slowed' },
    smooth:    { emoji: '🎶', filter: 'lowpass=f=4000,bass=g=3:f=100,treble=g=-2:f=3000,aecho=0.8:0.88:60:0.4', desc: 'Mellow' },
    tupai:     { emoji: '🐿️', filter: 'asetrate=44100*1.5,atempo=0.8', desc: 'Chipmunk' },
    superfast: { emoji: '💨', filter: 'atempo=2.0', desc: 'Percepat 2x' },
    superslow: { emoji: '🦥', filter: 'atempo=0.5', desc: 'Perlambat 2x' },
    tremolo:   { emoji: '〰️', filter: 'tremolo=f=8:d=0.7', desc: 'Tremolo / getar' },
    vibrato:   { emoji: '🎸', filter: 'vibrato=f=7:d=0.5', desc: 'Vibrato' },
    phone:     { emoji: '📞', filter: 'highpass=f=300,lowpass=f=3400,volume=1.5', desc: 'Suara telepon' },
    cave:      { emoji: '🕳️', filter: 'aecho=0.8:0.9:500:0.3,aecho=0.8:0.9:1000:0.2', desc: 'Gema gua' },
    radio:     { emoji: '📻', filter: 'highpass=f=300,lowpass=f=3000,acrusher=level_in=2:level_out=3:bits=12:mode=log:aa=1', desc: 'Suara radio' },
    demon:     { emoji: '👹', filter: 'asetrate=44100*0.5,atempo=1.5,aecho=0.8:0.88:200:0.5', desc: 'Suara iblis' },
    underwater:{ emoji: '💧', filter: 'lowpass=f=500,tremolo=f=2:d=0.4', desc: 'Bawah air' },
    concert:   { emoji: '🏟️', filter: 'aecho=0.8:0.88:40:0.4,aecho=0.8:0.88:80:0.3,treble=g=3:f=4000', desc: 'Live concert' },
    '8bit':    { emoji: '👾', filter: 'acrusher=level_in=3:level_out=4:bits=4:mode=log:aa=0,aresample=8000', desc: '8-bit retro' },
    helium:    { emoji: '🎈', filter: 'asetrate=44100*2.0,atempo=0.6', desc: 'Suara helium' },
}

const EFFECT_NAMES = Object.keys(EFFECTS)

const allAliases = []
for (const name of EFFECT_NAMES) {
    allAliases.push(name)
}

const pluginConfig = {
    name: [...EFFECT_NAMES],
    alias: [],
    category: 'convert',
    description: 'Audio effects & voice changer',
    usage: '.<effect>',
    example: '',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 8,
    energi: 1,
    isEnabled: true
}

function getMediaSource(m) {
    const selfIsAudio = m.isAudio || _optionalChain([m, 'access', _ => _.message, 'optionalAccess', _2 => _2.audioMessage])
    const selfIsVideo = m.isVideo || _optionalChain([m, 'access', _3 => _3.message, 'optionalAccess', _4 => _4.videoMessage])
    const quotedIsAudio = _optionalChain([m, 'access', _5 => _5.quoted, 'optionalAccess', _6 => _6.isAudio]) || _optionalChain([m, 'access', _7 => _7.quoted, 'optionalAccess', _8 => _8.message, 'optionalAccess', _9 => _9.audioMessage])
    const quotedIsVideo = _optionalChain([m, 'access', _10 => _10.quoted, 'optionalAccess', _11 => _11.isVideo]) || _optionalChain([m, 'access', _12 => _12.quoted, 'optionalAccess', _13 => _13.message, 'optionalAccess', _14 => _14.videoMessage])

    if (selfIsAudio || selfIsVideo) {
        return { download: () => m.download(), ext: selfIsVideo ? 'mp4' : 'ogg' }
    }
    if (quotedIsAudio || quotedIsVideo) {
        return { download: () => m.quoted.download(), ext: quotedIsVideo ? 'mp4' : 'ogg' }
    }
    return null
}

function buildEffectList() {
    const categories = {
        '🎚️ *Bass & Tone*': ['bass', 'fat', 'deep', 'smooth'],
        '⏩ *Speed*': ['fast', 'superfast', 'slow', 'superslow', 'nightcore'],
        '🎙️ *Voice*': ['tupai', 'helium', 'robot', 'demon', 'phone'],
        '🌊 *Space & Echo*': ['echo', 'cave', 'concert', 'underwater', 'reverse'],
        '💀 *Distortion*': ['blown', 'earrape', 'radio', '8bit'],
        '〰️ *Modulation*': ['tremolo', 'vibrato'],
    }

    let txt = `🎧 *AUDIO FX* — ${EFFECT_NAMES.length} effects\n\n`
    txt += `Reply audio/video lalu ketik efeknya\n\n`

    for (const [cat, effects] of Object.entries(categories)) {
        txt += `${cat}\n`
        for (const name of effects) {
            const fx = EFFECTS[name]
            txt += `  ${fx.emoji} *.${name}* — ${fx.desc}\n`
        }
        txt += `\n`
    }

    txt += `_Contoh: reply audio lalu ketik .bass_`
    return txt
}

async function handler(m, { sock }) {
    const command = m.command
    const effectName = command === 'audiofx' || command === 'fx' || command === 'audioeffect'
        ? _optionalChain([m, 'access', _15 => _15.args, 'optionalAccess', _16 => _16[0], 'optionalAccess', _17 => _17.toLowerCase, 'call', _18 => _18()])
        : command.toLowerCase()

    if (!effectName || effectName === 'list') {
        return m.reply(buildEffectList())
    }

    const fx = EFFECTS[effectName]
    if (!fx) {
        return m.reply(
            `❌ Efek *${effectName}* tidak ditemukan\n\n` +
            `Ketik *${m.prefix}audiofx list* untuk daftar efek`
        )
    }

    const media = getMediaSource(m)
    if (!media) {
        return m.reply(`${fx.emoji} *${effectName.toUpperCase()}*\n\nReply audio/video dengan command ini`)
    }

    m.react('🕕')

    const tempDir = _path2.default.join(process.cwd(), 'temp')
    if (!_fs2.default.existsSync(tempDir)) _fs2.default.mkdirSync(tempDir, { recursive: true })

    const ts = Date.now()
    const inputPath = _path2.default.join(tempDir, `fx_in_${ts}.${media.ext}`)
    const outputPath = _path2.default.join(tempDir, `fx_out_${ts}.mp3`)

    try {
        const buffer = await media.download()
        if (!_optionalChain([buffer, 'optionalAccess', _19 => _19.length])) {
            return m.reply(`❌ Gagal download media`)
        }

        _fs2.default.writeFileSync(inputPath, buffer)
        await _ourinffmpegjs.queueFFmpeg.call(void 0, `ffmpeg -y -i "${inputPath}" -af "${fx.filter}" -vn "${outputPath}"`)

        if (!_fs2.default.existsSync(outputPath)) {
            return m.reply(`❌ Gagal memproses audio`)
        }

        const audioBuffer = _fs2.default.readFileSync(outputPath)

        await sock.sendMedia(m.chat, audioBuffer, null, m, {
            type: 'audio'
        })

        m.react('✅')
    } catch (error) {
        m.react('☢')
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
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

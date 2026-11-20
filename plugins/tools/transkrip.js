"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _formdata = require('form-data'); var _formdata2 = _interopRequireDefault(_formdata);
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _child_process = require('child_process');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
    name: 'transkrip',
    alias: ['stt', 'speechtotext', 'transcribe'],
    category: 'tools',
    description: 'Konversi voice note / audio ke teks (Speech-to-Text)',
    usage: '.transkrip (reply voice note)',
    example: '.transkrip',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 2,
    isEnabled: true
};
function convertToWav(inputPath, outputPath) {
    return new Promise((resolve, reject) => {
        _child_process.exec.call(void 0, 
            `ffmpeg -y -i "${inputPath}" -ar 16000 -ac 1 -f wav "${outputPath}"`,
            { timeout: 30000 },
            (err) => err ? reject(err) : resolve()
        );
    });
}
async function transcribeWithGroq(audioBuffer, apiKey) {
    const form = new (0, _formdata2.default)();
    form.append('file', audioBuffer, { filename: 'audio.wav', contentType: 'audio/wav' });
    form.append('model', 'whisper-large-v3');
    form.append('language', 'id');
    form.append('response_format', 'json');
    const { data } = await _axios2.default.post('https://api.groq.com/openai/v1/audio/transcriptions', form, {
        headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${apiKey}`
        },
        timeout: 60000,
        maxContentLength: Infinity
    });
    return data.text || '';
}
async function handler(m, { sock }) {
    const quoted = m.quoted || m;
    const isAudio = quoted.type === 'audioMessage' || /audio/.test(quoted.mimetype || '');
    if (!isAudio) {
        return m.reply(
            `🎤 *ᴛʀᴀɴsᴋʀɪᴘ*\n\n` +
            `Responder nota de voz o audio para convertir al texto\n` +
            `> Ejemplo: responder VN →escribe\`${m.prefix}transkrip\``
        );
    }
    const groqKey = _optionalChain([_configjs2.default, 'access', _ => _.APIkey, 'optionalAccess', _2 => _2.groq]);
    if (!groqKey) {
        return m.reply(
            `❌ *ɢᴀɢᴀʟ*\n\n` +
            `♪ Tener llave gema todavía no establecido\n` +
            `> Set di config.js → APIkey.groq\n` +
            `* Grated in*https://console.groq.com`
        );
    }
    m.react('🎤');
    const tmpDir = _path2.default.join(process.cwd(), 'tmp');
    if (!_fs2.default.existsSync(tmpDir)) _fs2.default.mkdirSync(tmpDir, { recursive: true });
    const inputFile = _path2.default.join(tmpDir, `stt_${Date.now()}.ogg`);
    const wavFile = _path2.default.join(tmpDir, `stt_${Date.now()}.wav`);
    try {
        const buffer = await quoted.download();
        if (!buffer || buffer.length < 1000) {
            m.react('❌');
            return m.reply('❌Audio es pequeño o no se contrapone');
        }
        _fs2.default.writeFileSync(inputFile, buffer);
        await convertToWav(inputFile, wavFile);
        const wavBuffer = _fs2.default.readFileSync(wavFile);
        const text = await transcribeWithGroq(wavBuffer, groqKey);
        if (!text || text.trim() === '') {
            m.react('❌');
            return m.reply('❌No pude detectar sonidos.');
        }
        const duration = Math.ceil(buffer.length / 4000);
        await m.reply(
            `🎤 *ᴛʀᴀɴsᴋʀɪᴘ*\n\n` +
            `╭┈┈⬡「 📝 *ʜᴀsɪʟ* 」\n` +
            `┃\n` +
            `┃ ${text}\n` +
            `┃\n` +
            `╰┈┈⬡\n\n` +
            `> 🤖 Model: Whisper Large V3\n` +
            `> 🌐 Bahasa: Indonesia\n` +
            `> 📊 Ukuran: ~${(buffer.length / 1024).toFixed(1)} KB`
        );
        m.react('✅');
    } catch (error) {
        m.react('❌');
        if (_optionalChain([error, 'access', _3 => _3.response, 'optionalAccess', _4 => _4.status]) === 401) {
            return m.reply('❌ API Key Groq invalid. Cek config.js → APIkey.groq');
        }
        if (_optionalChain([error, 'access', _5 => _5.response, 'optionalAccess', _6 => _6.status]) === 429) {
            return m.reply('❌Prueba el límite Groq fue expuesto.');
        }
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    } finally {
        [inputFile, wavFile].forEach(f => { try { _fs2.default.unlinkSync(f); } catch (e) {} });
    }
}
exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

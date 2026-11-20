"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ytsearch = require('yt-search'); var _ytsearch2 = _interopRequireDefault(_ytsearch);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

const pluginConfig = {
  name: "playcall",
  alias: ["telepon", "call"],
  category: "search",
  description: "Putar musik dari YouTube lewat telpon",
  usage: ".playcall <query>",
  example: ".playcall komang",
  cooldown: 15,
  energi: 2,
  isEnabled: true,
};

async function handler(m, { sock, text }) {
  const query = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);
  if (!query)
    return m.reply(`🎵 *ᴘʟᴀʏ ᴄᴀʟʟ*\n\n> Masukkan judul lagunya\n\`Contoh: ${m.prefix}playcall surat cinta untuk starla\``);

  if (!global.voipClient) {
    return m.reply("Fitur panggilan suara tidak diaktifkan (VoipClient belum ready).");
  }

  m.react("📞");

  try {
    console.log("[PlayCall] Searching for:", query);
    
    const search = await _ytsearch2.default.call(void 0, query);
    if (!search.videos.length) throw new Error("Video tidak ditemukan");
    const video = search.videos[0];
    
    const res = await _axios2.default.get(`https://api.azbry.com/api/download/ytmp3?url=${encodeURIComponent(video.url)}`, { timeout: 60000 });
    const data = res.data;
    
    if (!data.status || !data.result || !data.result.download) {
       throw new Error("Gagal mengambil audio dari API");
    }
    
    await m.react("🕕")
    
    console.log("[PlayCall] Downloading audio from:", data.result.download);
    const audioRes = await _axios2.default.get(data.result.download, { responseType: "arraybuffer", timeout: 60000 });
    const audioBuffer = Buffer.from(audioRes.data);
    
    console.log("[PlayCall] Audio downloaded successfully, buffer size:", audioBuffer.length);

    const tmpDir = _path2.default.join(process.cwd(), "tmp");
    if (!_fs2.default.existsSync(tmpDir)) _fs2.default.mkdirSync(tmpDir);
    const tmpFile = _path2.default.join(tmpDir, `call_${_crypto2.default.randomBytes(4).toString("hex")}.mp3`);
    _fs2.default.writeFileSync(tmpFile, audioBuffer);

    let call;
    const targetNumber = m.sender.split("@")[0];

    if (m.isGroup) {
      await m.reply(`_📞 Panggilan grup tidak didukung oleh library saat ini. Memanggil nomormu secara privat (${targetNumber})..._`);
    } else {
      await m.reply(`_📞 Memanggil nomormu (${targetNumber})..._`);
    }

    call = await global.voipClient.call(targetNumber, {
      audioSource: tmpFile,
      durationMs: 300000
    });

    call.on("connected", () => {
      m.reply(`✅ *TERHUBUNG*\nLagu *${video.title}* sedang diputar di telpon!`);
    });

    call.on("ended", (reason) => {
      if (_fs2.default.existsSync(tmpFile)) _fs2.default.unlinkSync(tmpFile);
      m.reply(`📵 Panggilan diakhiri: ${reason}`);
    });

    call.on("error", (err) => {
      console.error("[VoIP Call Error]", err);
    });

  } catch (err) {
    console.error("[PlayCall]", err);
    m.react("😭");
    m.reply(`Gagal menelpon / memainkan lagu: ${err.message}`);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

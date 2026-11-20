"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _tiktokjs = require('../../src/scraper/tiktok.js'); var _tiktokjs2 = _interopRequireDefault(_tiktokjs);
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _fluentffmpeg = require('fluent-ffmpeg'); var _fluentffmpeg2 = _interopRequireDefault(_fluentffmpeg);
var _ffmpeg = require('../../src/lib/almiku-ffmpeg-path.js'); var _ffmpeg2 = _interopRequireDefault(_ffmpeg);
var _almikucontextjs = require('../../src/lib/almiku-context.js');
_fluentffmpeg2.default.setFfmpegPath(_ffmpeg2.default.path);

const pluginConfig = {
  name: ["ttmp3"],
  alias: ["ttmusic", "tiktokmusic"],
  category: "download",
  description: "Download audio TikTok",
  usage: ".ttmp3 <url>",
  example: ".ttmp3 https://vt.tiktok.com/xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

function getTempDir() {
  const tmpDir = path.join(process.cwd(), "tmp");
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  return tmpDir;
}

async function extractAudioFromVideo(videoUrl) {
  const tmpDir = getTempDir();
  const stamp = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  const inputFile = path.join(tmpDir, `ttmp3_${stamp}.mp4`);
  const outputFile = path.join(tmpDir, `ttmp3_${stamp}.mp3`);

  const res = await _axios2.default.get(videoUrl, {
    responseType: "arraybuffer",
    timeout: 60000,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
      Referer: "https://www.tiktok.com/",
    },
  });

  fs.writeFileSync(inputFile, Buffer.from(res.data));

  await new Promise((resolve, reject) => {
    _fluentffmpeg2.default.call(void 0, inputFile)
      .noVideo()
      .audioCodec("libmp3lame")
      .format("mp3")
      .on("end", resolve)
      .on("error", reject)
      .save(outputFile);
  });

  if (!fs.existsSync(outputFile) || fs.statSync(outputFile).size <= 0) {
    throw new Error("Stebuli extrae el audio de audio de TikTok");
  }

  return {
    buffer: fs.readFileSync(outputFile),
    files: [inputFile, outputFile],
  };
}

async function handler(m, { sock }) {
  const url = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);
  let cleanupFiles = [];

  const cleanupTempFiles = () => {
    for (const file of cleanupFiles) {
      if (!file) continue;
      try {
        if (fs.existsSync(file)) fs.unlinkSync(file);
      } catch (e) {}
    }
    cleanupFiles = [];
  };

  if (!url) {
    return m.reply(
      `╭┈┈⬡「 🎵 *ᴛɪᴋᴛᴏᴋ ᴅᴏᴡɴʟᴏᴀᴅ* 」
┃ ㊗ ᴜsᴀɢᴇ: \`${m.prefix}ttmp3 <url>\`
╰┈┈⬡

> Ejemplo:${m.prefix}ttmp3 https://vt.tiktok.com/xxx`,
    );
  }

  if (!url.match(/tiktok\.com|vt\.tiktok/i)) {
    return m.reply("❌Uplink no es válido, utilice los enlaces TikTok.");
  }

  m.react("🕕");

  try {
    const result = await _tiktokjs2.default.call(void 0, url);
    const audioDownload = result.downloads.find((d) => d.type === "mp3");
    let audioSource = _optionalChain([audioDownload, 'optionalAccess', _4 => _4.url]) || null;

    if (!audioSource) {
      const videoDownload =
        result.downloads.find((d) => d.type === "nowatermark_hd") ||
        result.downloads.find((d) => d.type === "nowatermark");

      if (!_optionalChain([videoDownload, 'optionalAccess', _5 => _5.url])) {
        throw new Error("Audio TikTok no fue encontrado.");
      }

      const extractedAudio = await extractAudioFromVideo(videoDownload.url);
      cleanupFiles = extractedAudio.files;
      audioSource = extractedAudio.buffer;
    }

    await sock.sendMedia(m.chat, audioSource, null, m, {
      type: "audio",
      mimetype: "audio/mpeg",
      fileName: `TikTok_Audio_${Date.now()}.mp3`,
    });

    m.react("✅");

    // cleanup
    cleanupTempFiles();
  } catch (err) {
    cleanupTempFiles();
    console.error("[TikTokDL] Error:", err);
    m.react("❌");
    m.reply(`❌ *ɢᴀɢᴀʟ ᴍᴇɴɢᴜɴᴅᴜʜ*\n\n> ${err.message}`);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

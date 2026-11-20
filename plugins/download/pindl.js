"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _almikuffmpegjs = require('./../../src/lib/almiku-ffmpeg.js');
var _almikuhttpjs = require('../../src/lib/almiku-http.js');
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
  name: "pindl",
  alias: ["pinterestdl", "pindownload", "pintdl"],
  category: "download",
  description: "Descargar imagen / video desde Pinterest",
  usage: ".pindl <url>",
  example: ".pindl https://pin.it/xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};
async function handler(m, { sock }) {
  const url = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);
  if (!url) {
    return m.reply(
      `📌 *ᴘɪɴᴛᴇʀᴇsᴛ ᴅᴏᴡɴʟᴏᴀᴅ*\n\n` +
        `* Descargas imágenes / videos de Pinterest\n\n` +
        `*ᴄᴏɴᴛᴏʜ:*\n` +
        `> \`${m.prefix}pindl https://pin.it/xxx\`\n` +
        `> \`${m.prefix}pindl https://pinterest.com/pin/xxx\``,
    );
  }
  if (!url.includes("pinterest") && !url.includes("pin.it")) {
    return m.reply("❌URL inválida.");
  }
  m.react("🕕");
  try {
    const res = await _axios2.default.get(`https://api.azbry.com/api/download/pinterest?url=${encodeURIComponent(url)}`);
    if (!res.data || !res.data.status || !res.data.result) {
      throw new Error("Datos de la prueba de API Pinterest.");
    }

    const data = res.data.result;
    const mediaList = [];

    if (data.type === 'video') {
        const vidUrl = _optionalChain([data, 'access', _4 => _4.videos, 'optionalAccess', _5 => _5[0], 'optionalAccess', _6 => _6.url]) || data.download;
        if (vidUrl) mediaList.push({ type: 'video', url: vidUrl });
    }

    if (data.images && data.images.length > 0) {
        const orig = data.images.find(img => img.name === 'orig') || data.images[data.images.length - 1];
        if (orig && orig.url) mediaList.push({ type: 'image', url: orig.url });
    } else if (data.type === 'image' && data.download) {
        mediaList.push({ type: 'image', url: data.download });
    }

    if (mediaList.length === 0) {
      throw new Error("No se encontraron medios");
    }

    for (const media of mediaList) {
      if (media.type === "video") {
        let masterUrl = media.url;
        if (masterUrl.includes('.mp4')) {
            masterUrl = masterUrl.replace(/720p|480p|360p|240p/g, 'hls').replace('.mp4', '.m3u8');
        }

        const tempDir = _path2.default.join(process.cwd(), "temp");
        if (!_fs2.default.existsSync(tempDir)) _fs2.default.mkdirSync(tempDir, { recursive: true });
        
        const timestamp = Date.now();
        const videoTemp = _path2.default.join(tempDir, `${timestamp}_v.mp4`);
        const audioTemp = _path2.default.join(tempDir, `${timestamp}_a.mp4`);
        const outputFile = _path2.default.join(tempDir, `${timestamp}_final.mp4`);

        try {
            const resHls = await _axios2.default.get(masterUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://www.pinterest.com/'
                }
            });
            const text = resHls.data;
            const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

            const baseUrl = masterUrl.substring(0, masterUrl.lastIndexOf("/") + 1);
            let videoStreamUrl = null;
            let audioStreamUrl = null;
            let lastBandwidth = 0;

            for (let i = 0; i < lines.length; i++) {
              if (lines[i].startsWith("#EXT-X-STREAM-INF")) {
                const bwMatch = lines[i].match(/BANDWIDTH=(\d+)/);
                const bw = bwMatch ? parseInt(bwMatch[1]) : 0;
                if (bw > lastBandwidth) {
                  lastBandwidth = bw;
                  const u = lines[i + 1];
                  videoStreamUrl = _optionalChain([u, 'optionalAccess', _7 => _7.startsWith, 'call', _8 => _8("http")]) ? u : baseUrl + u;
                }
              }
              if (lines[i].startsWith("#EXT-X-MEDIA") && lines[i].includes("TYPE=AUDIO")) {
                const mUrl = lines[i].match(/URI="([^"]+)"/);
                if (mUrl) audioStreamUrl = mUrl[1].startsWith("http") ? mUrl[1] : baseUrl + mUrl[1];
              }
            }

            const ffmpegHdr = `-user_agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" -headers "Referer: https://www.pinterest.com/"`;

            if (!videoStreamUrl) {
                await _almikuffmpegjs.queueFFmpeg.call(void 0, `ffmpeg -y ${ffmpegHdr} -i "${masterUrl}" -c copy "${outputFile}"`);
            } else {
                await _almikuffmpegjs.queueFFmpeg.call(void 0, `ffmpeg -y ${ffmpegHdr} -i "${videoStreamUrl}" -c copy "${videoTemp}"`);
                if (audioStreamUrl) {
                    await _almikuffmpegjs.queueFFmpeg.call(void 0, `ffmpeg -y ${ffmpegHdr} -i "${audioStreamUrl}" -c copy "${audioTemp}"`);
                    await _almikuffmpegjs.queueFFmpeg.call(void 0, `ffmpeg -y -i "${videoTemp}" -i "${audioTemp}" -c copy "${outputFile}"`);
                } else {
                    _fs2.default.renameSync(videoTemp, outputFile);
                }
            }
            
            await sock.sendMedia(m.chat, _fs2.default.readFileSync(outputFile), null, m, {
                type: "video",
                contextInfo: { forwardingScore: 99, isForwarded: true }
            });

        } catch (err) {
            console.error("[PinDL HLS Error]:", err.message);
            try {
                //Fallback: Pinterest bloqueando un genéricoxios ( 403 ), así que descarga manual utilizando el usuario - Agente
                const fallbackBuffer = await _axios2.default.get(media.url, { 
                    responseType: 'arraybuffer',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                        'Referer': 'https://www.pinterest.com/'
                    }
                });
                await sock.sendMedia(m.chat, Buffer.from(fallbackBuffer.data), null, m, {
                  type: "video",
                  contextInfo: { forwardingScore: 99, isForwarded: true },
                });
            } catch (fallbackErr) {
                console.error("[PinDL Fallback Error]:", fallbackErr.message);
            }
        } finally {
            if (_fs2.default.existsSync(videoTemp)) _fs2.default.unlinkSync(videoTemp);
            if (_fs2.default.existsSync(audioTemp)) _fs2.default.unlinkSync(audioTemp);
            if (_fs2.default.existsSync(outputFile)) _fs2.default.unlinkSync(outputFile);
        }
      } else if (media.type === "image") {
        if (media.url.includes("gif")) {
          const tempPath = _path2.default.join(process.cwd(), "temp");
          if (!_fs2.default.existsSync(tempPath))
            _fs2.default.mkdirSync(tempPath, { recursive: true });
          const id = Date.now();
          const gifPath = _path2.default.join(tempPath, `pin-${id}.gif`);
          const mp4Path = _path2.default.join(tempPath, `pin-${id}.mp4`);
          try {
            const raw = await _almikuhttpjs.f.call(void 0, media.url, "buffer");
            if (!raw) throw new Error("Fighters descargas GIF");
            _fs2.default.writeFileSync(gifPath, raw);
            await _almikuffmpegjs.queueFFmpeg.call(void 0, 
              `ffmpeg -y -ignore_loop 0 -i "${gifPath}" -t 30 -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" -c:v libx264 -pix_fmt yuv420p -movflags faststart -preset ultrafast -an "${mp4Path}"`,
            );
            if (!_fs2.default.existsSync(mp4Path)) throw new Error("GIF convertido stuntman");
            await sock.sendMedia(m.chat, _fs2.default.readFileSync(mp4Path), null, m, {
              type: "video",
              gifPlayback: true,
              contextInfo: {
                forwardingScore: 99,
                isForwarded: true,
              },
            });
          } catch (gifErr) {
            console.error("[PinDL] GIF convert error:", gifErr.message);
            await sock.sendMedia(m.chat, media.url, null, m, {
              type: "image",
              contextInfo: { forwardingScore: 99, isForwarded: true },
            });
          } finally {
            if (_fs2.default.existsSync(gifPath)) _fs2.default.unlinkSync(gifPath);
            if (_fs2.default.existsSync(mp4Path)) _fs2.default.unlinkSync(mp4Path);
          }
        } else {
          await sock.sendMedia(m.chat, media.url, null, m, {
            type: "image",
            contextInfo: {
              forwardingScore: 99,
              isForwarded: true,
            },
          });
        }
      }
    }
    m.react("✅");
  } catch (error) {
    console.error("[PinDL] Error:", error);
    m.react("☢");
    m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}
exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

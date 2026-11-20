"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _child_process = require('child_process');
var _util = require('util');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);




var _ourin = require('ourin');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const execAsync = _util.promisify.call(void 0, _child_process.exec);
const NEOXR_APIKEY = _optionalChain([_configjs2.default, 'access', _ => _.APIkey, 'optionalAccess', _2 => _2.neoxr]) || "Milik-Bot-OurinMD";

const pluginConfig = {
  name: "pinvid",
  alias: ["pinvideo", "pinterestv", "pinv"],
  category: "search",
  description: "Search video Pinterest (album)",
  usage: ".pinvid <query>",
  example: ".pinvid anime",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 2,
  isEnabled: true,
};

async function convertM3u8ToMp4(m3u8Url, outputPath) {
  const cmd = `ffmpeg -y -i "${m3u8Url}" -c copy -bsf:a aac_adtstoasc "${outputPath}"`;
  await execAsync(cmd, { timeout: 120000 });
  return _fs2.default.existsSync(outputPath);
}

async function handler(m, { sock }) {
  const query = _optionalChain([m, 'access', _3 => _3.text, 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()]);

  if (!query) {
    return m.reply(
      `📌 *ᴘɪɴᴛᴇʀᴇsᴛ ᴠɪᴅᴇᴏ sᴇᴀʀᴄʜ*\n\n` +
        `*Pon una búsqueda en el muelle*\n\n` +
        `\`${m.prefix}pinvid anime\``,
    );
  }

  m.react("🕕");

  try {
    const res = await _axios2.default.get(
      `https://firefly.maiku.my.id/api/pinterestvideo?apikey=OurinNextGen&q=${encodeURIComponent(query)}`,
      {
        timeout: 60000,
      },
    );

    if (!_optionalChain([res, 'access', _6 => _6.data, 'optionalAccess', _7 => _7.status]) || !_optionalChain([res, 'access', _8 => _8.data, 'optionalAccess', _9 => _9.data, 'optionalAccess', _10 => _10.length])) {
      m.react("❌");
      return m.reply(`❌No se ha encontrado ningún video para:${query}`);
    }

    const videos = res.data.data.slice(0, 5);

    m.react("🕕");

    const tempDir = _path2.default.join(process.cwd(), "temp");
    if (!_fs2.default.existsSync(tempDir)) {
      _fs2.default.mkdirSync(tempDir, { recursive: true });
    }

    const mediaList = [];

    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];

      if (!video.video_url) continue;

      try {
        const videoUrl = video.video_url;
        const duration = video.duration
          ? Math.round(video.duration / 1000)
          : 0;
        const durationStr =
          duration > 0
            ? `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, "0")}`
            : "-";

        let videoBuffer;

        if (videoUrl.includes(".m3u8")) {
          const outputPath = _path2.default.join(
            tempDir,
            `pinvid_${Date.now()}_${i}.mp4`,
          );

          try {
            await convertM3u8ToMp4(videoUrl, outputPath);

            if (_fs2.default.existsSync(outputPath)) {
              videoBuffer = _fs2.default.readFileSync(outputPath);
              _fs2.default.unlinkSync(outputPath);
            }
          } catch (ffmpegErr) {
            console.log(
              `[PinVid] FFmpeg error for video ${i + 1}:`,
              ffmpegErr.message,
            );
            continue;
          }
        } else {
          const videoRes = await _axios2.default.get(videoUrl, {
            responseType: "arraybuffer",
            timeout: 60000,
          });
          videoBuffer = Buffer.from(videoRes.data);
        }

        if (videoBuffer && videoBuffer.length > 1000) {
          mediaList.push({
            video: videoBuffer,
          });
        }
      } catch (vidErr) {
        console.log(
          `[PinVid] Failed to process video ${i + 1}:`,
          vidErr.message,
        );
      }
    }

    if (mediaList.length === 0) {
      m.react("❌");
      return m.reply(`❌Descarga el vídeo de forma estúpida`);
    }

    m.react("📤");

    try {
      const opener = _ourin.generateWAMessageFromContent.call(void 0, 
        m.chat,
        {
          messageContextInfo: { messageSecret: _crypto2.default.randomBytes(32) },
          albumMessage: {
            expectedImageCount: 0,
            expectedVideoCount: mediaList.length,
          },
        },
        {
          userJid: _ourin.jidNormalizedUser.call(void 0, sock.user.id),
          quoted: m,
          upload: sock.waUploadToServer,
        },
      );

      await sock.relayMessage(opener.key.remoteJid, opener.message, {
        messageId: opener.key.id,
      });

      for (const content of mediaList) {
        const msg = await _ourin.generateWAMessage.call(void 0, opener.key.remoteJid, content, {
          upload: sock.waUploadToServer,
        });

        msg.message.messageContextInfo = {
          messageSecret: _crypto2.default.randomBytes(32),
          messageAssociation: {
            associationType: 1,
            parentMessageKey: opener.key,
          },
        };

        await sock.relayMessage(msg.key.remoteJid, msg.message, {
          messageId: msg.key.id,
        });
      }

      m.react("✅");
    } catch (albumErr) {
      console.log(
        "[PinVid] Album message failed, sending individually:",
        albumErr.message,
      );

      const saluranId = _optionalChain([_configjs2.default, 'access', _11 => _11.saluran, 'optionalAccess', _12 => _12.id]) || "120363400911374213@newsletter";
      const saluranName =
        _optionalChain([_configjs2.default, 'access', _13 => _13.saluran, 'optionalAccess', _14 => _14.name]) || _optionalChain([_configjs2.default, 'access', _15 => _15.bot, 'optionalAccess', _16 => _16.name]) || "Ourin-AI";

      for (const content of mediaList) {
        await sock.sendMessage(
          m.chat,
          {
            video: content.video,
            caption: content.caption,
            contextInfo: {
              forwardingScore: 9999,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: saluranId,
                newsletterName: saluranName,
                serverMessageId: 127,
              },
            },
          },
          { quoted: m },
        );
      }

      m.react("✅");
    }
  } catch (error) {
    console.error("[PinVid] Error:", error.message);
    m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

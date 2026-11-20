"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);




var _ourin = require('ourin');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _tiktoksearchjs = require('../../src/scraper/tiktoksearch.js');
const pluginConfig = {
  name: "ttsearch",
  alias: ["tiktoksearch", "tts", "searchtiktok"],
  category: "search",
  description: "Cari video TikTok",
  usage: ".ttsearch <query>",
  example: ".ttsearch jj epep",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const query = _optionalChain([m, 'access', _ => _.args, 'access', _2 => _2.join, 'call', _3 => _3(" "), 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()]);

  if (!query) {
    return m.reply(
      `╭┈┈⬡「 🎵 *ᴛɪᴋᴛᴏᴋ sᴇᴀʀᴄʜ* 」
┃
㊗ ᴜsᴀɢᴇ: \`${m.prefix}ttsearch <query>\`
┃
╰┈┈⬡

> \`Contoh: ${m.prefix}ttsearch anime\``,
    );
  }

  m.react("🔍");

  try {
    const videos = await _tiktoksearchjs.tiktokSearchVideo.call(void 0, query);

    if (!videos || videos.length === 0) {
      m.react("❌");
      return m.reply(`❌ Tidak ditemukan video untuk: ${query}`);
    }

    const maxShow = Math.min(videos.length, 5);
    const mediaList = videos.slice(0, maxShow).map((video) => ({
      video: { url: video.link },
      mimetype: "video/mp4",
      caption: `🎵 *TIKTOK SEARCH*

📌 ${video.title || "-"}
👤 ${_optionalChain([video, 'access', _6 => _6.author, 'optionalAccess', _7 => _7.nickname]) || "-"}
👀 ${_optionalChain([video, 'access', _8 => _8.stats, 'optionalAccess', _9 => _9.plays]) || 0} views
❤️ ${_optionalChain([video, 'access', _10 => _10.stats, 'optionalAccess', _11 => _11.likes]) || 0} likes`,
      contextInfo: {
        forwardingScore: 99,
        isForwarded: true,
      },
    }));

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

      const generatedMessages = await Promise.all(
        mediaList.map(async (content) => {
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

          return msg;
        }),
      );

      for (const msg of generatedMessages) {
        await sock.relayMessage(msg.key.remoteJid, msg.message, {
          messageId: msg.key.id,
        });
      }
    } catch (albumError) {
      for (const content of mediaList) {
        await sock.sendMessage(m.chat, content, { quoted: m });
      }
    }

    m.react("✅");
  } catch (error) {
    m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler; exports.tiktokSearchVideo = _tiktoksearchjs.tiktokSearchVideo;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

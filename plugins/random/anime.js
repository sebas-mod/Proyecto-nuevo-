"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _almikucontextjs = require('../../src/lib/almiku-context.js');
var _almiku = require('almiku');

const nexrayTypes = [
  "waifu", "neko", "shinobu", "megumin", "bully", "cuddle", "cry", "hug",
  "awoo", "kiss", "lick", "pat", "smug", "bonk", "yeet", "blush", "smile",
  "wave", "highfive", "handhold", "nom", "bite", "glomp", "slap", "kill",
  "happy", "wink", "poke", "dance", "cringe"
];

const pluginConfig = {
  name: ["loli", ...nexrayTypes],
  alias: [],
  category: "random",
  description: "Imagen aleatoria Anime / Reacción ( DcxRay Source )",
  usage: ".<nama> (lihat daftar di bawah)",
  example: ".waifu",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    const cmd = m.command.toLowerCase();

    if (cmd === "loli") {
      return await sock.sendMessage(
        m.chat,
        {
          image: { url: "https://api.nexray.web.id/random/loli" },
          caption: `👧 *ʀᴀɴᴅᴏᴍ ʟᴏʟɪ*`,
        },
        { quoted: m },
      );
    }

    if (nexrayTypes.includes(cmd)) {
      m.react("🖼️");
      const res = await _axios2.default.get(`https://api.nexray.eu.cc/random/anime?type=${cmd}`, {
        responseType: "arraybuffer"
      });
      const buffer = Buffer.from(res.data);
      const isGif = buffer.length > 3 && buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46; // "GIF"
      
      const media = await _almiku.prepareWAMessageMedia.call(void 0, 
        isGif ? { video: buffer, gifPlayback: true } : { image: buffer },
        { upload: sock.waUploadToServer }
      );
      
      const msg = _almiku.generateWAMessageFromContent.call(void 0, m.chat, {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2,
            },
            interactiveMessage: {
              body: { text: `✨ *ʀᴀɴᴅᴏᴍ ${cmd.toUpperCase()}*` },
              footer: { text: "El botón se deja caer en la cáscara para llenar otra imagen" },
              header: {
                hasMediaAttachment: true,
                ...(isGif ? { videoMessage: media.videoMessage } : { imageMessage: media.imageMessage })
              },
              nativeFlowMessage: {
                buttons: [
                  {
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                      display_text: "Lanjut Cari Lagi?",
                      id: `${m.prefix}${cmd}`
                    })
                  }
                ]
              }
            }
          }
        }
      }, { quoted: m });
      
      return await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    }

  } catch (err) {
    m.react("☢");
    return m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

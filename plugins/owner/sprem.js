"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourin = require('ourin');

const pluginConfig = {
  name: ["sprem", "stickerpremium", "premiumsticker"],
  alias: [],
  category: "owner",
  description: "Kirim ulang sticker sebagai premium (Lottie/AI)",
  usage: ".sprem (reply sticker)",
  example: ".sprem",
  isOwner: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  if (!m.quoted) {
    return m.reply(
      "⭐ *sᴛɪᴄᴋᴇʀ ᴘʀᴇᴍɪᴜᴍ*\n\n" +
        "Responder pegatinas que quieren ser primas!\n\n" +
        `> Uso: \`${m.prefix}sprem\``,
    );
  }

  const q = m.quoted;

  try {
    const msg = _optionalChain([q, 'access', _ => _.message, 'optionalAccess', _2 => _2.stickerMessage]);
    if (!msg) return m.reply("❌Pasear por los datos de las pegatinas");

    const stickerMessage = _ourin.proto.Message.StickerMessage.fromObject({
      url: msg.url,
      fileSha256: msg.fileSha256,
      fileEncSha256: msg.fileEncSha256,
      mediaKey: msg.mediaKey,
      mimetype: msg.mimetype || "image/webp",
      height: msg.height,
      width: msg.width,
      directPath: msg.directPath,
      fileLength: msg.fileLength,
      mediaKeyTimestamp: msg.mediaKeyTimestamp,
      isAnimated: true,
      stickerSentTs: Date.now(),
      isAvatar: false,
      isAiSticker: true,
      premium: 1,
      isLottie: false,
      accessibilityLabel: msg.accessibilityLabel || "",
      contextInfo: {
        stanzaId: _optionalChain([m, 'access', _3 => _3.key, 'optionalAccess', _4 => _4.id]),
        participant: _optionalChain([m, 'access', _5 => _5.key, 'optionalAccess', _6 => _6.participant]) || m.sender,
        remoteJid: m.chat,
      },
    });

    let targetJid = m.chat;
    const num = _optionalChain([m, 'access', _7 => _7.args, 'optionalAccess', _8 => _8[0], 'optionalAccess', _9 => _9.replace, 'call', _10 => _10(/[^0-9]/g, "")]);
    if (num) targetJid = num + "@s.whatsapp.net";

    const waMsg = _ourin.generateWAMessageFromContent.call(void 0, 
      targetJid,
      { stickerMessage },
      {
        userJid: _optionalChain([sock, 'access', _11 => _11.user, 'optionalAccess', _12 => _12.id]),
        quoted: m,
      },
    );

    await sock.relayMessage(targetJid, waMsg.message, {
      messageId: waMsg.key.id,
    });

    await m.react("✅");
  } catch (err) {
    console.error("[sprem]", err.message);
    return m.reply(`❌Fallido:${err.message}`);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

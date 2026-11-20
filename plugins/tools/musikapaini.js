"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _formdata = require('form-data'); var _formdata2 = _interopRequireDefault(_formdata);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almiku = require('almiku');
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _almikuapimanagerjs = require('../../src/lib/almiku-apimanager.js'); var _almikuapimanagerjs2 = _interopRequireDefault(_almikuapimanagerjs);
var _almikucontextjs = require('../../src/lib/almiku-context.js');

const pluginConfig = {
  name: "musikapaini",
  alias: ["whatmusic", "shazam", "recognizemusic", "mai"],
  category: "tools",
  description: "Iticaciones de canciones de audio",
  usage: ".musikapaini (reply audio)",
  example: ".musikapaini",
  cooldown: 20,
  energi: 2,
  isEnabled: true,
};

async function uploadTo0x0(buffer, filename) {
  const form = new (0, _formdata2.default)();
  form.append("file", buffer, {
    filename,
    contentType: "application/octet-stream",
  });

  const res = await _axios2.default.post(
    "https://c.termai.cc/api/upload?key=AIzaBj7z2z3xBjsk",
    form,
    {
      headers: form.getHeaders(),
      timeout: 60000,
    },
  );

  if (!_optionalChain([res, 'access', _ => _.data, 'optionalAccess', _2 => _2.status]) ? res.data.path : "") throw new Error("Upload fallido");
  return res.data;
}

async function handler(m, { sock }) {
  let audioBuffer = null;
  let filename = "audio.mp3";

  if (_optionalChain([m, 'access', _3 => _3.quoted, 'optionalAccess', _4 => _4.message])) {
    const quotedMsg = m.quoted.message;
    const audioMsg = quotedMsg.audioMessage || quotedMsg.documentMessage;

    if (audioMsg) {
      try {
        audioBuffer = await _almiku.downloadMediaMessage.call(void 0, 
          { key: m.quoted.key, message: quotedMsg },
          "buffer",
          {},
        );
        filename = audioMsg.fileName || "audio.mp3";
      } catch (e) {}
    }
  }

  if (!audioBuffer && m.message) {
    const audioMsg = m.message.audioMessage || m.message.documentMessage;
    if (audioMsg) {
      try {
        audioBuffer = await m.download();
        filename = audioMsg.fileName || "audio.mp3";
      } catch (e2) {}
    }
  }

  if (!audioBuffer) {
    return m.reply(
      `🎵 *ᴍᴜsɪᴋ ᴀᴘᴀ ɪɴɪ?*\n\n` +
        `*Canción Itikakasi del audio*\n\n` +
        `*Como usarlo:*\n` +
        `Responder audio con\`${m.prefix}musikapaini\`\n` +
        `# Dime enviar audio + comando de captura #`,
    );
  }

  m.react("🎵");

  try {
    await m.reply("🕕 *ᴍᴇɴɢᴜᴘʟᴏᴀᴅ...*\n\n> Mengupload audio...");

    const audioUrl = await uploadTo0x0(audioBuffer, filename);

    await m.reply("🔍 *ᴍᴇɴɢɪᴅᴇɴᴛɪꜰɪᴋᴀsɪ...*\n\n> Mencari info lagu...");

    const data = await _almikuapimanagerjs2.default.neoxr.whatMusic(
      {
        url: audioUrl,
        apikey: _optionalChain([_configjs2.default, 'access', _5 => _5.APIkey, 'optionalAccess', _6 => _6.neoxr]) || "Milik-Bot-OurinMD",
      },
      {
        timeout: 60000,
      },
    );

    if (!_optionalChain([data, 'optionalAccess', _7 => _7.status]) || !_optionalChain([data, 'optionalAccess', _8 => _8.data])) {
      m.react("❌");
      return m.reply("❌*ɢᴀɢᴀʟ*\n\n* Sing no se reproduce o error de API");
    }

    const music = data.data;
    const links = music.links || {};

    let text = `🎵 *ʟᴀɢᴜ ᴅɪᴛᴇᴍᴜᴋᴀɴ!*\n\n`;
    text += `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n`;
    text += `┃ 🎶 Title: ${music.title || "-"}\n`;
    text += `┃ 👤 Artist: ${music.artist || "-"}\n`;
    text += `┃ 💿 Album: ${music.album || "-"}\n`;
    text += `┃ 📅 Release: ${music.release || "-"}\n`;
    text += `╰┈┈┈┈┈┈┈┈⬡\n\n`;

    const buttons = [];

    if (_optionalChain([links, 'access', _9 => _9.spotify, 'optionalAccess', _10 => _10.track, 'optionalAccess', _11 => _11.id])) {
      buttons.push({
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "🎧 Spotify",
          url: `https://open.spotify.com/track/${links.spotify.track.id}`,
        }),
      });
    }

    if (_optionalChain([links, 'access', _12 => _12.youtube, 'optionalAccess', _13 => _13.vid])) {
      buttons.push({
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "▶️ YouTube",
          url: `https://youtube.com/watch?v=${links.youtube.vid}`,
        }),
      });
    }

    if (_optionalChain([links, 'access', _14 => _14.deezer, 'optionalAccess', _15 => _15.track, 'optionalAccess', _16 => _16.id])) {
      buttons.push({
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "🎵 Deezer",
          url: `https://deezer.com/track/${links.deezer.track.id}`,
        }),
      });
    }

    const msgContent = {
      text,
      footer: "🎵 Music Recognition",
      contextInfo: _almikucontextjs.saluranCtx.call(void 0, ),
    };

    if (buttons.length > 0) {
      msgContent.interactiveButtons = buttons;
    }

    await sock.sendMessage(m.chat, msgContent, { quoted: m });

    m.react("✅");
  } catch (error) {
    m.react("☢");
    m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

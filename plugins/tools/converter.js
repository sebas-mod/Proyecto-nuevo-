"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _mconverterjs = require('../../src/scraper/mconverter.js');
var _ourin = require('ourin');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
  name: "converter",
  alias: ["convert", "konversi"],
  category: "tools",
  description: "Convert file ke format lain",
  usage: ".converter <format> (reply file)",
  example: ".converter mp3",
  isOwner: false,
  isPremium: true,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 3,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const targetFormat = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3(), 'optionalAccess', _4 => _4.toLowerCase, 'call', _5 => _5()]);

  if (!m.quoted && !m.isMedia) {
    return m.reply(
      `🔄 *ᴄᴏɴᴠᴇʀᴛᴇʀ*\n\n` +
        `Responder Archivo con un conjunto de marcas\n\n` +
        `*Formato:*\n` +
        `> \`${m.prefix}converter <format>\`\n\n` +
        `*Ejemplo:*\n` +
        `> \`${m.prefix}converter mp3\`\n` +
        `> \`${m.prefix}converter mp4\`\n` +
        `> \`${m.prefix}converter png\`\n\n` +
        `*Como usarlo:*\n` +
        `Responder Archivo a Conversos\n` +
        `- Adiós.\`${m.prefix}converter <format>\``,
    );
  }

  if (!targetFormat) {
    return m.reply(
      `❌¡Entra en el forte de destino!\n\n> Ejemplo:\`${m.prefix}converter mp3\``,
    );
  }

  const quoted = m.quoted;
  let mediaMessage = null;
  let filename = "file";

  if (_optionalChain([quoted, 'optionalAccess', _6 => _6.isMedia])) {
    mediaMessage = quoted;
    filename = _optionalChain([quoted, 'access', _7 => _7.message, 'optionalAccess', _8 => _8[quoted.type], 'optionalAccess', _9 => _9.fileName]) || `_ Archivos${Date.now()}`;
  } else if (m.isMedia) {
    mediaMessage = m;
    filename = _optionalChain([m, 'access', _10 => _10.message, 'optionalAccess', _11 => _11[m.type], 'optionalAccess', _12 => _12.fileName]) || `_ Archivos${Date.now()}`;
  }

  if (!mediaMessage) {
    return m.reply(`❌Responder Archivo a Convertires!`);
  }

  m.react("🕕");
  await m.reply(`🕕 *ᴍᴇɴɢᴜɴᴅᴜʜ ғɪʟᴇ...*`);

  try {
    const stream = await _ourin.downloadContentFromMessage.call(void 0, 
      mediaMessage.message[mediaMessage.type],
      mediaMessage.type.replace("Message", ""),
    );

    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    const tempDir = _path2.default.join(process.cwd(), "temp");
    if (!_fs2.default.existsSync(tempDir)) {
      _fs2.default.mkdirSync(tempDir, { recursive: true });
    }

    const ext = filename.split(".").pop() || "bin";
    const tempFile = _path2.default.join(tempDir, `convert_${Date.now()}.${ext}`);
    _fs2.default.writeFileSync(tempFile, buffer);

    await m.reply(`🔄 *ᴄᴏɴᴠᴇʀᴛɪɴɢ...*\n\n> ${ext} → ${targetFormat}`);

    const result = await _mconverterjs.mconverter.convert(tempFile, targetFormat);

    if (_fs2.default.existsSync(tempFile)) {
      _fs2.default.unlinkSync(tempFile);
    }

    if (result.error) {
      m.react("❌");
      return m.reply(`❌ *ɢᴀɢᴀʟ ᴄᴏɴᴠᴇʀᴛ*\n\n> ${result.error}`);
    }

    const saluranId = _optionalChain([_configjs2.default, 'access', _13 => _13.saluran, 'optionalAccess', _14 => _14.id]) || "120363400911374213@newsletter";
    const saluranName = _optionalChain([_configjs2.default, 'access', _15 => _15.saluran, 'optionalAccess', _16 => _16.name]) || _optionalChain([_configjs2.default, 'access', _17 => _17.bot, 'optionalAccess', _18 => _18.name]) || "Ourin-AI";

    await sock.sendMessage(
      m.chat,
      {
        document: { url: result.url },
        fileName: `converted_${Date.now()}.${targetFormat}`,
        mimetype: `application/${targetFormat}`,
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

    m.react("✅");
  } catch (err) {
    console.error("[Converter] Error:", err.message);
    m.react("☢");
    return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

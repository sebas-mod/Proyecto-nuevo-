"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourinapimanagerjs = require('../../src/lib/ourin-apimanager.js'); var _ourinapimanagerjs2 = _interopRequireDefault(_ourinapimanagerjs);
const pluginConfig = {
  name: "tts",
  alias: ["say"],
  category: "tts",
  description: "Google Text To Speech",
  usage: ".tts <text>",
  example: ".tts halo semua",
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);

  if (!text) {
    return m.reply(`🎤 *Google TTS*\n\nGunakan:\n${m.prefix}*El mundo haloh ts*`);
  }

  m.react("🎤");

  async function textToSpeech2(text) {
    try {
      const response = await _ourinapimanagerjs2.default.nexray.geminiTts(text);
      return response;
    } catch (error) {
      return error;
    }
  }

  try {
    const t = await textToSpeech2(text);
    await sock.sendMessage(
      m.chat,
      {
        audio: { url: t.result },
        mimetype: "audio/mpeg",
      },
      { quoted: m },
    );
    m.react("✅");
  } catch (err) {
    m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

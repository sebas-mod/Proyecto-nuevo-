"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "caribug",
  alias: ["debug", "findbug"],
  category: "tools",
  description: "Cari bug di kode pemrograman",
  usage: ".caribug [kode] atau reply kode",
  example: ".caribug function test() {}",
  cooldown: 20,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { args }) {
  let code = _optionalChain([m, 'access', _ => _.quoted, 'optionalAccess', _2 => _2.text]) || args.join(" ");

  if (!code) {
    return m.reply(
      `*🐛 CARI BUG*\n\nKirim kode atau reply pesan kode untuk mencari bug.\n\nContoh:\n\`${m.prefix}caribug function test() {}\``
    );
  }

  m.react("🕕");

  try {
    const apiUrl = `https://api.cuki.biz.id/api/aicode/caribug`;
    const res = await _axios2.default.get(apiUrl, {
      params: {
        apikey: _configjs2.default.APIkey.cuki,
        code: code,
        language: "auto"
      },
      timeout: 60000
    });

    const data = res.data;

    if (!data.success || !data.data) {
      throw new Error("Gagal menganalisa kode dari server");
    }

    const info = data.data;
    const meta = info.metadata;
    const bugInfo = info.bugsFound;
    
    let text = `🐛 *HASIL ANALISA BUG*\n\n`;
    text += `*Bahasa:* ${meta.detectedLanguage}\n`;
    text += `*Tingkat:* ${meta.severityInfo.level} ${meta.severityInfo.icon}\n`;
    text += `*Bug Ditemukan:* ${bugInfo.total}\n\n`;
    
    if (bugInfo.summary) {
      text += `*📝 Ringkasan:*\n${bugInfo.summary}\n\n`;
    }
    
    if (_optionalChain([info, 'access', _3 => _3.codeAnalysis, 'optionalAccess', _4 => _4.fixed, 'optionalAccess', _5 => _5.code])) {
      text += `*✨ Kode Perbaikan:*\n\`\`\`${meta.detectedLanguage}\n${info.codeAnalysis.fixed.code}\n\`\`\`\n\n`;
    }
    
    if (bugInfo.details && bugInfo.details.length > 0) {
      text += `*📌 Detail:* \n`;
      bugInfo.details.forEach((d, i) => {
        text += `- ${d.type || d.description}\n`;
      });
    }

    m.react("✅");
    await m.reply(text.trim());
  } catch (err) {
    console.error("[CariBug]", err.message);
    m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

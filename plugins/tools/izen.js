"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _nodefetch = require('node-fetch'); var _nodefetch2 = _interopRequireDefault(_nodefetch);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "izen",
  alias: ["skiplink", "izen"],
  category: "tools",
  description: "Bypass shortlink / skiplink menggunakan izen",
  usage: ".izen link",
  example: ".izen https://sfl.gl/xxxxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { args, sock }) {
  if (!args[0]) {
    let txt = `🔗 *SKIPLINK BYPASS* 🔗\n\n`;
    txt += `¿Hao hermana! El enlace Tener es difícil de perder el anuncio? Por eso he venido para asegurarme de ir al final!\n\n`;
    txt += `*Como usarlo:*\n`;
    txt += `👉 \`${m.prefix}izen <link>\`\n\n`;
    txt += `*Ejemplo:*\n`;
    txt += `👉 \`${m.prefix}izen https://sfl.gl/xxxxx\``;
    return m.reply(txt);
  }

  await m.react("⏳");
  
  try {
    const res = await _nodefetch2.default.call(void 0, `https://anabot.my.id/api/tools/izenLOL?url=${encodeURIComponent(args[0])}&apikey=freeApikey`);
    const json = await res.json();
    
    if (!_optionalChain([json, 'access', _ => _.data, 'optionalAccess', _2 => _2.result, 'optionalAccess', _3 => _3.result])) {
       return m.reply("❌Hermana, lo siento.");
    }
    
    let txt = `✅* SALVANDO EL SALVID *✅\n\n`;
    txt += `*Enlace Asli:*\n`;
    txt += `🔗 ${args[0]}\n\n`;
    txt += `*Resultado Bypass:*\n`;
    txt += `🚀 ${json.data.result.result}\n\n`;
    txt += `¡Por favor, ayúdame!✨`;
    
    await m.reply(txt);
    await m.react("✅");
  } catch (e) {
    m.reply(`❌Lo siento hermano, ¡ha habido un error!😭\nError:${e.message}`);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

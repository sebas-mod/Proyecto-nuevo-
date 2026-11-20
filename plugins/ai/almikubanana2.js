"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _seaartjs = require('../../src/scraper/seaart.js');

const pluginConfig = {
  name: "almikubanana2",
  alias: [],
  category: "ai",
  description: "Campo de imagen con IA utilizando el rápido",
  usage: ".almikubanana2 <prompt>",
  example: ".almikubanana2 make it anime style",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 30,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const prompt = m.text;
  if (!prompt) {
    return m.reply(
      `🍌 *AL MIKU BANANA SUPER 2*\n\n` +
        `# Come fotos con AI #\n\n` +
        `\`Contoh: ${m.prefix}almikubanana2 make a cat\``,
    );
  }

  m.react("🕕");

  try {
    const result = await _seaartjs.fluxImage.call(void 0, prompt, "1:1");
    const imageUrl = result.url;

    m.react("✅");

    await sock.sendMedia(m.chat, imageUrl, null, m, {
      type: "image",
    });
  } catch (error) {
    console.log(error);
    m.react("❌");
    const msg =
      _optionalChain([error, 'optionalAccess', _ => _.response, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.message]) ||
      _optionalChain([error, 'optionalAccess', _4 => _4.response, 'optionalAccess', _5 => _5.data, 'optionalAccess', _6 => _6.error]) ||
      error.message ||
      "Se produjo un error";
    m.reply(`🍀Me temo que tengo control.

${msg}

Inténtelo de nuevo más tarde, por trust don`);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

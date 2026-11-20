"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);

const pluginConfig = {
  name: "hitungwrmlbb",
  alias: ["wrml", "wrmlbb", "winrate"],
  category: "tools",
  description: "Contando la necesidad de una victoria sin perder para alcanzar el objetivo de la victoria en Mobile Legends.",
  usage: ".hitungwrmlbb <total_match> <wr_sekarang> <wr_target>",
  example: ".hitungwrmlbb 4242 22 88",
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock, args }) {
  if (args.length < 3) {
    return m.reply(
      `Hola *${m.pushName}* 👋\n\n` +
      `Para apuntar su tasa de din MLBB, utilice formatos:\n` +
      `- \`${m.prefix}hitungwrmlbb <total_match> <wr_sekarang> <wr_target>\`\n\n` +
      `Ejemplo:\n-\`${m.prefix}hitungwrmlbb 4242 22 88\``
    );
  }

  const [totalMatch, wrNow, wrTarget] = args;

  if (isNaN(totalMatch) || isNaN(wrNow) || isNaN(wrTarget)) {
    return m.reply("❌Número inválido. Asegúrese de que todo lo que se introduce es un número (sin % ).\n\nEjemplo:`. Contador wrmlbb 4242 22 88`");
  }

  m.react("🕕");

  try {
    const apiUrl = `https://api.nexray.eu.cc/tools/winrate-mlbb?total_match=${totalMatch}&wr_now=${wrNow}&wr_target=${wrTarget}`;
    const res = await _axios2.default.get(apiUrl);
    const data = res.data;

    if (!data.status || !data.result) {
      await m.react("❌");
      return m.reply("⚠Asegúrese de que tenga sentido o intente de nuevo más tarde.");
    }

    let info = `🎮 *KALKULATOR WINRATE MLBB* 🎮\n\n`;
    info += `📊 Total Match: *${totalMatch}*\n`;
    info += `📉WR Now: *${wrNow}%*\n`;
    info += `📈 WR Objetivo: *${wrTarget}%*\n\n`;
    info += `💡*Resultado Analisa:*\n${data.result}`;

    await m.reply(info);
    m.react("✅");

  } catch (error) {
    console.error("[WR MLBB Error]", error);
    await m.react("❌");
    m.reply("😔Es un error tener un sistema que atravesar con.");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

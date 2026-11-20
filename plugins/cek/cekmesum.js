"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
  name: "cekmesum",
  alias: ["mesum"],
  category: "cek",
  description: "Compruebe cuánto se siente.",
  usage: ".cekmesum <nama>",
  example: ".cekmesum Budi",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const percent = Math.floor(Math.random() * 101);
  const mentioned = m.mentionedJid[0] || m.sender;

  let desc = "";
  if (percent >= 90) {
    desc = "MESUM AKUT! Tobat mas! 😳🔞";
  } else if (percent >= 70) {
    desc = "Mesum banget! 👀";
  } else if (percent >= 50) {
    desc = "Lumayan mesum 😏";
  } else if (percent >= 30) {
    desc = "Sedikit mesum 🙈";
  } else {
    desc = "¡Polos y suci!😇";
  }

  let txt =
    mentioned === m.sender
      ? `Hola @${mentioned.split("@")[0]}
    
Tu nivel de camisa *${percent}%*
\`\`\`${desc}\`\`\``
      : `Quieres revisar el nivel de sudor${mentioned.split("@")[0]} yak? 
    
Es una camisa alta tan grande como un arma${percent}%*
\`\`\`${desc}\`\`\``;

  await m.reply(txt, { mentions: [mentioned] });
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

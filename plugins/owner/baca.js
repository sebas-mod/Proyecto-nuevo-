"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
  name: ["baca", "read", "markread"],
  alias: [],
  category: "owner",
  description: "Tandai pesan sebagai sudah dibaca",
  usage: ".baca",
  example: ".baca",
  isOwner: true,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  try {
    await sock.readMessages([m.key]);
    await m.react("✅");
    return m.reply("📖 *Pesan ditandai sudah dibaca*");
  } catch (err) {
    return m.reply(`❌ Gagal: ${err.message}`);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

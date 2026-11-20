"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourincontextjs = require('../../src/lib/ourin-context.js');

const pluginConfig = {
  name: "gempa",
  alias: ["bmkg", "infogempa", "earthquake"],
  category: "info",
  description: "Info gempa terkini dari BMKG",
  usage: ".gempa",
  example: ".gempa",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  await m.react("🕕");

  try {
    const response = await _axios2.default.get(
      "https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json",
      { timeout: 15000 },
    );

    const g = response.data.Infogempa.gempa;
    const shakemapUrl = g.Shakemap
      ? `https://data.bmkg.go.id/DataMKG/TEWS/${g.Shakemap}`
      : null;

    const text =
      `🌍 *Info Gempa Terkini — BMKG*\n\n` +
      `> 📅 Tanggal: *${g.Tanggal}*\n` +
      `> 🕐 Jam: *${g.Jam}*\n` +
      `> 📐 Koordinat: *${g.Coordinates}*\n` +
      `> 📍 Lintang: *${g.Lintang}*\n` +
      `> 📍 Bujur: *${g.Bujur}*\n` +
      `> 💥 Magnitude: *${g.Magnitude}*\n` +
      `> 🔽 Kedalaman: *${g.Kedalaman}*\n` +
      `> 🗺️ Wilayah: *${g.Wilayah}*\n` +
      `> ⚠️ Potensi: *${g.Potensi}*\n` +
      `> 🏠 Dirasakan: *${g.Dirasakan}*\n\n` +
      `_Sumber: BMKG Indonesia_`;

    await m.react("✅");

    if (shakemapUrl) {
      try {
        const imgRes = await _axios2.default.get(shakemapUrl, {
          responseType: "arraybuffer",
          timeout: 15000,
        });
        await sock.sendMedia(m.chat, Buffer.from(imgRes.data), text, m, {
          type: "image",
        });
      } catch (e2) {
        await m.reply(text, { contextInfo: _ourincontextjs.saluranCtx.call(void 0, ) });
      }
    } else {
      await m.reply(text, { contextInfo: _ourincontextjs.saluranCtx.call(void 0, ) });
    }
  } catch (e) {
    await m.react("☢");
    await m.reply(
      `❌ *Gagal mengambil data gempa*\n\n> ${e.message || "Coba lagi nanti"}`,
    );
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

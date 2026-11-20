"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourin = require('ourin');
var _sharp = require('sharp'); var _sharp2 = _interopRequireDefault(_sharp);

const pluginConfig = {
  name: "spotify",
  alias: ["spotifysearch", "spsearch"],
  category: "search",
  description: "Mencari daftar lagu di Spotify berdasarkan judul atau artis",
  usage: ".spotify <query>",
  example: ".spotify neffex grateful",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock, text }) {
  if (!text) {
    return m.reply("❌ *Waduh, kata kuncinya mana nih?*\n\nKamu harus memasukkan judul lagu atau nama artis yang ingin dicari di Spotify. \n\nContoh penggunaan: `.spotify bruno mars`");
  }

  await m.react("🕕");

  try {
    const res = await _axios2.default.get(`https://api.nexray.eu.cc/search/spotify?q=${encodeURIComponent(text)}`);
    const data = res.data;

    if (!data.status || !data.result || data.result.length === 0) {
      await m.react("❌");
      return m.reply(`⚠️ *Maaf, lagu tidak ditemukan!* \n\nAku sudah mencari dengan kata kunci *${text}* tapi tidak ada hasil di Spotify. Coba gunakan judul yang lebih spesifik ya.`);
    }

    const results = data.result.slice(0, 5);
    const firstResult = results[0];

    let contentText = `✨ *HASIL PENCARIAN SPOTIFY* ✨\n\nHalo! Aku berhasil menemukan beberapa lagu berdasarkan kata kunci *${text}*. Berikut adalah daftar teratasnya:\n\n`;

    results.forEach((t, i) => {
      contentText += `*${i + 1}. ${t.title}*\n`;
      contentText += `   🎤 Artis: ${t.artist}\n`;
      contentText += `   ⏱️ Durasi: ${t.duration}\n`;
      contentText += `   🔗 Link: ${t.url}\n\n`;
    });

    contentText += `*Catatan*: Kamu bisa menyalin link lagu di atas dan menggunakan perintah \`.spdl <link>\` untuk mengunduhnya secara langsung! Atau tekan tombol di bawah ini untuk lagu pertama. 🚀`;

    let thumbnailBuffer = null;
    try {
      const imageResponse = await _axios2.default.get(firstResult.thumbnail, { responseType: "arraybuffer" });
      thumbnailBuffer = await _sharp2.default.call(void 0, imageResponse.data).resize(300, 170).jpeg().toBuffer();
    } catch (e) {
    }

    if (thumbnailBuffer) {
      const content = {
        buttonsMessage: {
          buttons: [
            {
              buttonId: `.spdl ${firstResult.url}`,
              buttonText: { displayText: '🎵 Unduh Lagu Pertama' },
              type: 1,
            }
          ],
          locationMessage: {
            jpegThumbnail: thumbnailBuffer,
            name: firstResult.title,
            address: `🎤 ${firstResult.artist} | ⏱️ ${firstResult.duration}`
          },
          contentText: contentText,
          footerText: '🚀 OURIN MD - Spotify Search',
          headerType: 6,
        },
      };

      const msg = _ourin.generateWAMessageFromContent.call(void 0, m.chat, content, { quoted: m });
      await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    } else {
      await m.reply(contentText);
    }

    await m.react("✅");

  } catch (err) {
    console.error("[Spotify Search]", err.message);
    await m.react("☢");
    m.reply("😔 *Aduh, sepertinya API sedang bermasalah.* \n\nTerjadi kesalahan fatal saat mencoba memproses pencarian Spotify. Silakan coba lagi nanti ya!");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _formdata = require('form-data'); var _formdata2 = _interopRequireDefault(_formdata);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
    name: "animeapaini",
    alias: ["whatanime", "animesearch", "sauceanime", "searchanime", "anime-checker", "animechecker"],
    category: "search",
    description: "Identifikasi judul anime dari gambar/screenshot",
    usage: ".animeapaini (reply gambar)",
    example: ".animeapaini",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 1,
    isEnabled: true,
};

async function handler(m, { sock }) {
    const isImage = m.isImage || (m.quoted && m.quoted.type === "imageMessage");

    if (!isImage) {
        let help = `🔍 *ANIME APA INI?*\n\n`
        help += `Fitur cerdas untuk mengetahui judul anime hanya dari sebuah screenshot atau potongan gambar!\n\n`
        help += `*Cara Penggunaan:*\n`
        help += `- Kirim gambar adegan anime dengan caption *${m.prefix}animeapaini*\n`
        help += `- Atau balas (reply) gambar adegan anime dengan perintah *${m.prefix}animeapaini*\n\n`
        help += `⚠️ *Catatan:* Video tidak didukung, hanya gambar/screenshot saja ya!`
        return m.reply(help);
    }

    await m.react("🕕");

    try {
        let buffer;
        if (m.quoted && m.quoted.isMedia) {
            buffer = await m.quoted.download();
        } else if (m.isMedia) {
            buffer = await m.download();
        }

        if (!buffer) {
            await m.react("❌");
            return m.reply(`Maaf, sistem gagal mengunduh gambar yang kamu berikan. Silakan coba kirim ulang gambarnya!`);
        }

        const form = new (0, _formdata2.default)();
        form.append("image", buffer, { filename: "image.jpg", contentType: "image/jpeg" });

        const response = await _axios2.default.post("https://my.izuka-api.xyz/api/anime/anime-checker", form, {
            headers: form.getHeaders(),
            timeout: 60000
        });

        const data = response.data;
        if (!data || !data.status || !data.result || !data.result.full_matches) {
            await m.react("❌");
            return m.reply(`Maaf, judul anime tidak ditemukan. Coba dengan screenshot adegan yang lebih jelas atau karakter yang lebih spesifik.`);
        }

        await m.react("✅");

        const resObj = data.result;
        const match = resObj.full_matches[0];

        const similarityRaw = resObj.similarity ? parseFloat(resObj.similarity) : (match.similarity * 100);
        const similarity = isNaN(similarityRaw) ? resObj.similarity : similarityRaw.toFixed(2);

        let txt = `🔍 *ANIME DITEMUKAN!*\n\n`;
        txt += `🎬 *Judul Romaji:* ${resObj.title_romaji || match.anilist.title.romaji}\n`;
        txt += `🇯🇵 *Judul Asli:* ${resObj.title_native || match.anilist.title.native}\n`;
        txt += `📺 *Episode:* ${resObj.episode || match.episode}\n`;
        txt += `📊 *Kemiripan:* ${similarity}%\n`;
        txt += `🔞 *Dewasa (18+):* ${resObj.is_adult ? 'Ya' : 'Tidak'}\n\n`;
        txt += `🔗 *Detail Anilist:*\n${match.anilist.siteUrl || `https://anilist.co/anime/${match.anilist.id}`}`;

        if (resObj.image_preview || match.image) {
            await sock.sendMessage(m.chat, { image: { url: resObj.image_preview || match.image }, caption: txt }, { quoted: m });
        } else {
            await m.reply(txt);
        }

    } catch (error) {
        console.error("[ANIMECHECKER Plugin Error]", error);
        await m.react("☢");
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

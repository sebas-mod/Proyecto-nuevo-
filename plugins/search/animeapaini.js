"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _formdata = require('form-data'); var _formdata2 = _interopRequireDefault(_formdata);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
    name: "animeapaini",
    alias: ["whatanime", "animesearch", "sauceanime", "searchanime", "anime-checker", "animechecker"],
    category: "search",
    description: "Identificador de cabecera de anime de la imagen / captura de pantalla",
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
        let help = `🔍* ANIMME QUE ES ESTO?\n\n`
        help += `La característica inteligente para conocer el título Anime es sólo de una captura de pantalla o un corte de la imagen!\n\n`
        help += `*Como usarlo:*\n`
        help += `- Imagen de Ksena adegan anime con capción *${m.prefix}animeapaini*\n`
        help += `- O una respuesta.${m.prefix}animeapaini*\n\n`
        help += `⚠> 91; Nota: &#93; El vídeo no es compatible, sólo una imagen / captura de pantalla sólo ya!`
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
            return m.reply(`Lo sentimos, el sistema no pudo descargar la imagen que dibujaste.`);
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
            return m.reply(`Lo sentimos, Anime header no fue encontrado. Intenta con un adegan de captura de pantalla más obvio o caracteres más específicos.`);
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
        txt += `🔞* Adultos ( 18 + ):${resObj.is_adult ? 'Ya' : 'Tidak'}\n\n`;
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

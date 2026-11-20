"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
    name: "stickerly",
    alias: ["stikerly", "stickerlysearch"],
    category: "sticker",
    description: "Busca y descargas de stickers pack de Sticker ly.",
    usage: ".stickerly <query / url>",
    example: ".stickerly anime",
    cooldown: 10,
    energi: 2,
};

async function handler(m, { sock, text }) {
    if (!text) {
        return m.reply(`⚠Espaz Por favor presenta la búsqueda de palabama clave o la etiqueta url.\nEpirame:\`${m.prefix}${m.command} anime\``);
    }

    await m.react("🕕");

    try {
        if (text.includes("sticker.ly/s/")) {
            return await downloadStickerlyPack(sock, m, text);
        }

        const searchUrl = `https://my.izuka-api.xyz/api/search/stickerly-search?query=${encodeURIComponent(text.trim())}`;
        const response = await _axios2.default.get(searchUrl, { timeout: 30000 });
        const data = response.data;

        if (!data || !data.status || !data.result || data.result.length === 0) {
            await m.react("❌");
            return m.reply(`Lo siento, Pack de pegatinas a Sool${text}Prueba otra palabra clave.`);
        }

        const maxResults = Math.min(data.result.length, 10);
        let listTxt = `🎨* PRESIDENTE DEL ESTICKER 'S TRAINING.${text.toUpperCase()}*\n\n`;
        listTxt += `Encontré algunos paquetes, elija uno de ellos:\n\n`;

        const searchResults = [];

        for (let i = 0; i < maxResults; i++) {
            const item = data.result[i];
            searchResults.push({
                name: item.name,
                url: item.shareUrl,
                author: item.authorName
            });
            listTxt += `*${i + 1}.* ${item.name} by ${item.authorName}\n`;
        }

        listTxt += `\n♪💡* Cita (por ejemplo: 1 ) * para descargar paquetes, o tipos\`cancelar\`Para deshacer la búsqueda.`;
        
        const db = _ourindatabasejs.getDatabase.call(void 0, );
        const user = db.getUser(m.sender);

        user.stickerly_session = {
            results: searchResults,
            time: Date.now()
        };
        db.save();

        await m.react("✅");
        await m.reply(listTxt);
    } catch (error) {
        console.error("[Stickerly Search Error]", error);
        await m.react("☢");
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
}

async function stickerlyAnswerHandler(m, sock) {
    if (!m.body || m.isCommand) return false;
    
    const db = _ourindatabasejs.getDatabase.call(void 0, );
    const user = db.getUser(m.sender);
    
    if (!user || !user.stickerly_session) return false;

    const session = user.stickerly_session;
    const SESSION_TIMEOUT = 5 * 60 * 1000;

    if (Date.now() - session.time > SESSION_TIMEOUT) {
        delete user.stickerly_session;
        db.save();
        await m.reply(`⏰* SECIÓN DEL AGUA*\n\nSesi de búsqueda pegajosa ha sido terminada por más de 5 minutos.`);
        return true;
    }

    const text = m.body.trim().toLowerCase();

    if (text === "batal" || text === "cancel") {
        delete user.stickerly_session;
        db.save();
        await m.reply(`🚪Intentomente buscando ser cancelado.`);
        return true;
    }

    const choice = parseInt(text);
    if (isNaN(choice) || choice < 1 || choice > session.results.length) {
        return false;
    }

    const selectedPack = session.results[choice - 1];
    delete user.stickerly_session;
    db.save();

    await downloadStickerlyPack(sock, m, selectedPack.url);
    return true;
}

async function downloadStickerlyPack(sock, m, packUrl) {
    await m.react("🕕");
    await m.reply(`Den Pent descarga paquete de pegatina..⏳`);

    try {
        const url = `https://my.izuka-api.xyz/api/search/stickerly-pack?url=${encodeURIComponent(packUrl)}`;
        const response = await _axios2.default.get(url, { timeout: 30000 });
        const data = response.data;

        if (!data || !data.status || !data.result || !data.result.stickers || data.result.stickers.length === 0) {
            await m.react("❌");
            return m.reply(`❌Stemwell tomó el paquete de detalles.`);
        }

        const stickersData = data.result.stickers;
        const packInfo = stickersData[0].stickerPack;
        const prefix = packInfo.trayResourceUrl.split('/').slice(0, -1).join('/') + '/';

        const stickerUrls = [];
        for (const sticker of stickersData) {
            stickerUrls.push(prefix + sticker.fileName);
        }

        if (stickerUrls.length === 0) {
            await m.react("❌");
            return m.reply(`❌No hay pegatinas en este paquete.`);
        }

        const packname = packInfo.name || "Sticker.ly Pack";
        const author = packInfo.authorName || _configjs2.default.sticker.author || "♪";
        const urlsToProcess = stickerUrls.slice(0, 20);
        
        try {
            await sock.sendStickerPack(m.chat, urlsToProcess, m, {
                name: packname,
                packname: packname,
                publisher: author,
                author: author,
                description: `Empaquetadura de pegatinas.`,
                emojis: ["✨"]
            });
            await m.react("✅");
        } catch (packErr) {
            console.error("[Stickerly Pack Send Error]", packErr.message);
            await m.reply(`❌Steenalsengerpack a la vez, tratando de enviar uno a la vez..`);
            
            let sent = 0;
            for (const sUrl of urlsToProcess) {
                try {
                    await sock.sendImageAsSticker(m.chat, sUrl, m, {
                        packname: packname,
                        author: author
                    });
                    sent++;
                    await new Promise(r => setTimeout(r, 700));
                } catch (e) {
                    continue;
                }
            }
            if (sent > 0) {
                await m.react("✅");
                await m.reply(`✅Se envio correctamente${sent} sticker.`);
            } else {
                await m.react("❌");
                await m.reply(`❌El truco envía toda su pegatina.`);
            }
        }
    } catch (error) {
        console.error("[Stickerly Pack Fetch Error]", error);
        await m.react("☢");
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, "stickerly", m.pushName));
    }
}

exports.config = pluginConfig; exports.handler = handler; exports.stickerlyAnswerHandler = stickerlyAnswerHandler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

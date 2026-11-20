"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _almikudatabasejs = require('../../src/lib/almiku-database.js');

const NEOXR_APIKEY = _optionalChain([_configjs2.default, 'access', _ => _.APIkey, 'optionalAccess', _2 => _2.neoxr]) || "Milik-Bot-OurinMD";

const pluginConfig = {
    name: "resep",
    alias: ["resepmasak", "resepmasakan", "caramasak"],
    category: "search",
    description: "Consigue una receta completa y buena para la comida.",
    usage: ".resep <nama makanan>",
    example: ".resep ayam geprek",
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
        return m.reply(`🍳*Búsqueda RESEP*\n\nEl tipo de nombre de la comida que desea buscar para la recepción.\n*Ejemplo:*${m.prefix}resepón de Sooch frito`);
    }

    await m.react("🕕");

    try {
        const query = encodeURIComponent(text.trim());
        const searchUrl = `https://api.neoxr.eu/api/resep-search?q=${query}&apikey=${NEOXR_APIKEY}`;

        const response = await _axios2.default.get(searchUrl, { timeout: 30000 });
        const data = response.data;

        if (!data || !data.status || !data.data || data.data.length === 0) {
            await m.react("❌");
            return m.reply(`Lo siento, receta para el agujero de zorro.${text}Prueba otra palabra clave.`);
        }

        const maxResults = Math.min(data.data.length, 10);
        let listTxt = `🍳* PRESIDENTE DEL RESEP RESEP:${text.toUpperCase()}*\n\n`;
        listTxt += `Encontré algunas recetas aquí, elegir uno de ustedes:\n\n`;

        const searchResults = [];

        for (let i = 0; i < maxResults; i++) {
            const item = data.data[i];
            searchResults.push({
                name: item.name,
                url: item.url
            });
            listTxt += `*${i + 1}.* ${item.name}\n`;
        }

        listTxt += `\n•💡* Número de contenedor (por ejemplo: 1 ) * para ver el desprendimiento del recipiente, o la axila\`cancelar\`Para deshacer la búsqueda.`;
        const db = _almikudatabasejs.getDatabase.call(void 0, );
        const user = db.getUser(m.sender);

        user.resep_session = {
            results: searchResults,
            time: Date.now()
        };
        db.save();

        await m.react("✅");
        await m.reply(listTxt);

    } catch (error) {
        console.error("[RESEP Plugin Error]", error);
        await m.react("☢");
        m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
}

async function resepAnswerHandler(m, sock) {
    if (!m.body || m.isCommand) return false;
    const db = _almikudatabasejs.getDatabase.call(void 0, );
    const user = db.getUser(m.sender);
    if (!user || !user.resep_session) return false;

    const session = user.resep_session;
    const SESSION_TIMEOUT = 5 * 60 * 1000;

    if (Date.now() - session.time > SESSION_TIMEOUT) {
        delete user.resep_session;
        db.save();
        await m.reply(`⏰* SECIÓN DEL AGUA*\n\nSesi la prescripción de búsqueda se ha terminado debido a más de 5 minutos.`);
        return true;
    }

    const text = m.body.trim().toLowerCase();

    if (text === "batal" || text === "cancel") {
        delete user.resep_session;
        db.save();
        await m.reply(`🚪La búsqueda de la inscripción se cancela.`);
        return true;
    }

    const choice = parseInt(text);
    if (isNaN(choice) || choice < 1 || choice > session.results.length) {
        return false;
    }

    const selectedRecipe = session.results[choice - 1];
    delete user.resep_session;
    db.save();

    await m.react("🕕");

    try {
        const detailUrl = `https://api.neoxr.eu/api/resep?url=${encodeURIComponent(selectedRecipe.url)}&apikey=${NEOXR_APIKEY}`;
        const detailResponse = await _axios2.default.get(detailUrl, { timeout: 30000 });
        const resData = detailResponse.data;

        if (!resData || !resData.status || !resData.data) {
            await m.react("❌");
            return m.reply(`Lo sentimos, no se pudo recuperar los detalles de la receta para explicar${selectedRecipe.name}".`);
        }

        const recipe = resData.data;
        let recipeTxt = `👨‍🍳 *${recipe.title.toUpperCase()}* 👩‍🍳\n\n`;
        recipeTxt += `⏱️ *Tiempo:*${recipe.timeout || "-"}\n`;
        recipeTxt += `🍽️ *Porsi:* ${recipe.portion || "-"}\n\n`;

        if (recipe.ingredients && recipe.ingredients.length > 0) {
            recipeTxt += `*🥬 BAHAN-BAHAN:*\n`;
            recipe.ingredients.forEach(bahan => {
                recipeTxt += `- ${bahan}\n`;
            });
            recipeTxt += `\n`;
        }

        if (recipe.steps && recipe.steps.length > 0) {
            recipeTxt += `*🍳CARA Creando:*\n`;
            recipe.steps.forEach((step, index) => {
                recipeTxt += `*${index + 1}.* ${step}\n\n`;
            });
        }

        await m.react("✅");

        if (recipe.thumbnail) {
            await sock.sendMessage(m.chat, {
                image: { url: recipe.thumbnail },
                caption: recipeTxt
            }, { quoted: m });
        } else {
            await m.reply(recipeTxt);
        }

    } catch (error) {
        console.error("[RESEP Detail Error]", error);
        await m.react("☢");
        await m.reply(`Es un error completar la receta.`);
    }

    return true;
}

exports.config = pluginConfig; exports.handler = handler; exports.resepAnswerHandler = resepAnswerHandler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

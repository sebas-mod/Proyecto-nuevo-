"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const NEOXR_APIKEY = _optionalChain([_configjs2.default, 'access', _ => _.APIkey, 'optionalAccess', _2 => _2.neoxr]) || "Milik-Bot-OurinMD";

const pluginConfig = {
    name: "advance-comparation",
    alias: ["bandingkan-device", "compare"],
    category: "search",
    description: "Bandingkan dua perangkat (smartphone, tablet, laptop, dll)",
    usage: ".bandingkan-device [type] <query>",
    example: ".bandingkan-device phone samsung s24",
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 2,
    isEnabled: true,
};

const VALID_TYPES = ["phone", "tablet", "laptop", "cpu", "gpu", "soc"];

async function handler(m, { sock, args, text }) {
    if (!args || args.length === 0) {
        return m.reply(`📊 *ADVANCE COMPARATION*\n\n` +
            `Utilice el siguiente comando para comparar dispositivos:\n` +
            `> *.bandingkan-device <tipe> <query>*\n\n` +
            `* Consejo enviado: *\n` +
            VALID_TYPES.map(t => `> - ${t}`).join("\n") + `\n\n` +
            `* DESHHH: *. appeal - device phone samsung s24`);
    }

    let type = "phone";
    let query = text;

    if (VALID_TYPES.includes(args[0].toLowerCase())) {
        type = args[0].toLowerCase();
        query = args.slice(1).join(" ");
    }

    if (!query.trim()) {
        return m.reply(`¡El nombre de la trampa para buscar!\nSujeto:. apelación --división teléfono samsung s24`);
    }

    await m.react("🕕");
    try {
        const searchUrl = `https://api.neoxr.eu/api/compare-search?q=${encodeURIComponent(query)}&type=${type}&apikey=${NEOXR_APIKEY}`;
        const response = await _axios2.default.get(searchUrl, { timeout: 30000 });
        const resData = response.data;

        if (!resData || !resData.status || !resData.data || resData.data.length === 0) {
            await m.react("❌");
            return m.reply(`Dispositivo "${query}No se ha encontrado.`);
        }

        const maxResults = Math.min(resData.data.length, 10);
        let listTxt = `📊 *Búsqueda DEVICE 1: ${query.toUpperCase()}*\n\n`;
        listTxt += `Por favor, elija uno más específico:\n\n`;

        const searchResults = [];

        for (let i = 0; i < maxResults; i++) {
            const item = resData.data[i];
            searchResults.push(item);
            listTxt += `*${i + 1}.* ${item.label}\n`;
        }

        listTxt += `\n•💡* Números de presupuesto (por ejemplo: 1 ) * para seleccionar la primera trampa, o primera trampa\`cancelar\`para cancelando.`;

        const db = _ourindatabasejs.getDatabase.call(void 0, );
        const user = db.getUser(m.sender);

        user.compare_session = {
            step: 1,
            type: type,
            results: searchResults,
            device1: null,
            time: Date.now()
        };
        db.save();

        await m.react("✅");
        await m.reply(listTxt);

    } catch (error) {
        console.error("[Compare Search Error]", error);
        await m.react("☢");
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
}

async function comparationAnswerHandler(m, sock) {
    if (!m.body || m.isCommand) return false;

    const db = _ourindatabasejs.getDatabase.call(void 0, );
    const user = db.getUser(m.sender);

    if (!user || !user.compare_session) return false;

    const session = user.compare_session;
    const SESSION_TIMEOUT = 5 * 60 * 1000;

    if (Date.now() - session.time > SESSION_TIMEOUT) {
        delete user.compare_session;
        db.save();
        await m.reply(`⏰* SECIÓN DEL AGUA*\n\nLa configuración ha terminado.`);
        return true;
    }

    const text = m.body.trim();
    const textLower = text.toLowerCase();

    if (textLower === "batal" || textLower === "cancel" || textLower === "cancelar") {
        delete user.compare_session;
        db.save();
        await m.reply(`🚪El debate está fuera de las listas.`);
        return true;
    }

    if (session.step === 1) {
        const choice = parseInt(text);
        if (isNaN(choice) || choice < 1 || choice > session.results.length) {
            return false;
        }

        const selected = session.results[choice - 1];

        session.device1 = selected;
        session.step = 2;
        session.results = [];
        session.time = Date.now();
        db.save();

        await m.react("✅");
        await m.reply(`Bien, tú eliges${selected.label}* con tipo *${session.type}* para la primera desviación.\n\n¿De qué estás hablando?\n\n•💡* Contiene el nombre del segundo dispositivo para buscar (por ejemplo: iphone 17 pro max- ¿Qué?`);
        return true;
    }

    if (session.step === 2) {
        const query = text;

        await m.react("🕕");
        try {
            const searchUrl = `https://api.neoxr.eu/api/compare-search?q=${encodeURIComponent(query)}&type=${session.type}&apikey=${NEOXR_APIKEY}`;
            const response = await _axios2.default.get(searchUrl, { timeout: 30000 });
            const resData = response.data;

            if (!resData || !resData.status || !resData.data || resData.data.length === 0) {
                await m.react("❌");
                await m.reply(`Dispositivo "${query}Por favor, tome otro nombre de marco para buscar, o axila\`cancelar\`.`);
                return true;
            }

            const maxResults = Math.min(resData.data.length, 10);
            let listTxt = `📊( DEVICE 2 búsquedas:${query.toUpperCase()}*\n\n`;
            listTxt += `Por favor, elija uno más específico:\n\n`;

            const searchResults = [];

            for (let i = 0; i < maxResults; i++) {
                const item = resData.data[i];
                searchResults.push(item);
                listTxt += `*${i + 1}.* ${item.label}\n`;
            }

            listTxt += `\n•💡* Cita (o piloto: 1 ) * para seleccionar segunda trampa, o izquierda\`cancelar\`para cancelando.`;

            session.results = searchResults;
            session.step = 3;
            session.time = Date.now();
            db.save();

            await m.react("✅");
            await m.reply(listTxt);
            return true;

        } catch (error) {
            console.error("[Compare Search 2 Error]", error);
            await m.react("☢");
            await m.reply("Es un error buscar la segunda trampa. Intente de nuevo más tarde o izquierda lado de la mano.`cancelar`.");
            return true;
        }
    }

    if (session.step === 3) {
        const choice = parseInt(text);
        if (isNaN(choice) || choice < 1 || choice > session.results.length) {
            return false;
        }

        const selected = session.results[choice - 1];
        const device1 = session.device1;
        const device2 = selected;

        delete user.compare_session;
        db.save();

        await m.react("🔄");
        await m.reply(`Comparación de tramitación de untara:\n* 1.${device1.label}*\n*2. ${device2.label}*\n\nEspera un minuto, se están recordando los datos del debate..`);

        try {
            const compareUrl = `https://api.neoxr.eu/api/compare?item1=${encodeURIComponent(device1.name)}&item2=${encodeURIComponent(device2.name)}&type=${session.type}&apikey=${NEOXR_APIKEY}`;
            const response = await _axios2.default.get(compareUrl, { timeout: 60000 });
            const resData = response.data;

            if (!resData || !resData.status || !resData.data) {
                await m.react("❌");
                await m.reply(`Gagalm obtuvo la comparación de datos.`);
                return true;
            }

            const data = resData.data;
            let resultTxt = `📊 *ADVANCE COMPARISON*\n`;
            resultTxt += `*${data.title || `${device1.name} vs ${device2.name}`}*\n\n`;

            if (data.overallScore && data.overallScore.length >= 2) {
                resultTxt += `🏆 *OVERALL SCORE*\n`;
                resultTxt += `> ${data.overallScore[0].item}: *${data.overallScore[0].value}*\n`;
                resultTxt += `> ${data.overallScore[1].item}: *${data.overallScore[1].value}*\n\n`;
            }

            if (data.reviewScores && data.reviewScores.length > 0) {
                resultTxt += `⭐ *REVIEW SCORES*\n`;
                data.reviewScores.forEach(cat => {
                    if (cat.data && cat.data.length >= 2) {
                        resultTxt += `*${cat.category}*\n`;
                        resultTxt += `- ${cat.data[0].item}: ${cat.data[0].value}\n`;
                        resultTxt += `- ${cat.data[1].item}: ${cat.data[1].value}\n`;
                    }
                });
                resultTxt += `\n`;
            }

            if (data.reasonsToConsider && data.reasonsToConsider.length > 0) {
                resultTxt += `💡 *REASONS TO CONSIDER*\n`;
                data.reasonsToConsider.forEach(reason => {
                    resultTxt += `*${reason.item}*\n`;
                    if (reason.pros && reason.pros.length > 0) {
                        reason.pros.forEach(p => {
                            resultTxt += `✅ ${p}\n`;
                        });
                    } else {
                        resultTxt += `- No hay datos.\n`;
                    }
                });
                resultTxt += `\n`;
            }

            if (data.specifications && data.specifications.length > 0) {
                resultTxt += `⚙️ *SPECIFICATIONS*\n`;
                data.specifications.forEach(spec => {
                    resultTxt += `\n*--- ${spec.category.toUpperCase()} ---*\n`;
                    if (spec.items && spec.items.length > 0) {
                        spec.items.forEach(item => {
                            if (item.data && item.data.length >= 2) {
                                resultTxt += `\n*${item.name}*\n`;
                                resultTxt += `> ${item.data[0].item}: ${item.data[0].value}\n`;
                                resultTxt += `> ${item.data[1].item}: ${item.data[1].value}\n`;
                            }
                        });
                    }
                });
            }

            await m.react("✅");
            await m.reply(resultTxt)
            return true;

        } catch (error) {
            console.error("[Compare Fetch Error]", error);
            await m.react("❌");
            await m.reply("Fue un error procesar la comparación de datos.");
            return true;
        }
    }

    return false;
}

exports.config = pluginConfig; exports.handler = handler; exports.comparationAnswerHandler = comparationAnswerHandler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

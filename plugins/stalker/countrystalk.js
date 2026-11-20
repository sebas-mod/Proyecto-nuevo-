"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const NEOXR_APIKEY = _optionalChain([_configjs2.default, 'access', _ => _.APIkey, 'optionalAccess', _2 => _2.neoxr]) || "Milik-Bot-OurinMD";

const pluginConfig = {
    name: "countrystalk",
    alias: ["stalknegara", "infonegara"],
    category: "stalker  ",
    description: "Mencari informasi detail tentang suatu negara",
    usage: ".country <nama negara>",
    example: ".country indonesia",
    cooldown: 5,
    energi: 1,
    isEnabled: true,
};

async function handler(m, { sock, text }) {
    if (!text) {
        return m.reply(`🌍¡Por favor, ingrese el nombre del estado!\nEjemplo:\`${m.prefix}${m.command} indonesia\``);
    }

    await m.react("🕕");

    try {
        const query = encodeURIComponent(text.trim());
        const url = `https://api.neoxr.eu/api/country?q=${query}&apikey=${NEOXR_APIKEY}`;
        const response = await _axios2.default.get(url, { timeout: 30000 });
        const data = response.data;

        if (!data || !data.status || !data.data) {
            await m.react("❌");
            return m.reply(`Lo siento, datos del estado para decir${text}No se ha encontrado.`);
        }

        const c = data.data;
        const name = _optionalChain([c, 'access', _3 => _3.names, 'optionalAccess', _4 => _4.common]) || text;
        const officialName = _optionalChain([c, 'access', _5 => _5.names, 'optionalAccess', _6 => _6.official]) || "-";

        const population = c.population ? c.population.toLocaleString('id-ID') : "-";
        const capitals = c.capitals && c.capitals.length > 0 ? c.capitals.map(cap => cap.name).join(", ") : "-";
        const currencies = c.currencies && c.currencies.length > 0 ? c.currencies.map(cur => `${cur.name} (${cur.symbol})`).join(", ") : "-";
        const languages = c.languages && c.languages.length > 0 ? c.languages.map(l => l.name).join(", ") : "-";
        const timezones = c.timezones && c.timezones.length > 0 ? c.timezones.join(", ") : "-";

        let txt = `🌍*Información Pais:${name.toUpperCase()}* 🌍\n\n`;
        txt += `🏢 *Ibukota:* ${capitals}\n`;
        txt += `📜*Nombre Oficial:*${officialName}\n`;
        txt += `🗺️ *Region:*${c.region || "-"} (${c.subregion || "-"})\n`;
        txt += `🗣* * * * *#91; Vocalizing > *93;${languages}\n`;
        txt += `👥 *Populasi:* ${population} jiwa\n`;
        txt += `💰*Moneda:*${currencies}\n`;
        txt += `🕰Zona Tiempo:${timezones}\n`;
        txt += `🚗 *Posisi Mengemudi:* ${_optionalChain([c, 'access', _7 => _7.cars, 'optionalAccess', _8 => _8.driving_side]) || "-"}\n`;

        if (_optionalChain([c, 'access', _9 => _9.flag, 'optionalAccess', _10 => _10.emoji])) {
            txt += `\n*Bendera:* ${c.flag.emoji}`;
        }

        await m.react("✅");

        if (_optionalChain([c, 'access', _11 => _11.flag, 'optionalAccess', _12 => _12.url_png])) {
            await sock.sendMessage(m.chat, {
                image: { url: c.flag.url_png },
                caption: txt
            }, { quoted: m });
        } else {
            await m.reply(txt);
        }

    } catch (error) {
        console.error("[Country Plugin Error]", error);
        await m.react("☢");
        m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

const pluginConfig = {
  name: "nikparser",
  alias: ["nik", "ceknik"],
  category: "tools",
  description: "NIC PARSES AND VISITATIONS KTP",
  usage: ".nikparser <16 digit NIK>",
  example: ".nikparser 3517072109020003",
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

const API = "https://api.obscuraworks.org/api/v2/tools/nik";
const KEY = _configjs2.default.APIkey.obscura;

const PROVINSI = {
  11: "Aceh",
  12: "Sumatera Utara",
  13: "Sumatera Barat",
  14: "Riau",
  15: "Jambi",
  16: "Sumatera Selatan",
  17: "Bengkulu",
  18: "Lampung",
  19: "Kepululauan Bangka Belitung",
  21: "Kepulauan Riau",
  31: "DKI Jakarta",
  32: "Jawa Barat",
  33: "Jawa Tengah",
  34: "DI Yogyakarta",
  35: "Jawa Timur",
  36: "Banten",
  51: "Bali",
  52: "Nusa Tenggara Barat",
  53: "Nusa Tenggara Timur",
  61: "Kalimantan Barat",
  62: "Kalimantan Tengah",
  63: "Kalimantan Selatan",
  64: "Kalimantan Timur",
  65: "Kalimantan Utara",
  71: "Sulawesi Utara",
  72: "Sulawesi Tengah",
  73: "Sulawesi Selatan",
  74: "Sulawesi Tenggara",
  75: "Gorontalo",
  76: "Sulawesi Barat",
  81: "Maluku",
  82: "Maluku Utara",
  91: "Papua",
  92: "Papua Barat",
};

async function handler(m, { sock }) {
  const nik = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.replace, 'call', _3 => _3(/\D/g, "")]);

  if (!nik || nik.length !== 16) {
    return m.reply(
      `🪪 *ɴɪᴋ ᴘᴀʀꜱᴇʀ*\n\n` +
        `- NlK Parse and Values KTP🇮🇩\n` +
        `- Introduce 16 digit número NIK\n\n` +
        `\`${m.prefix}nikparser 3517072109020003\``,
    );
  }

  m.react("🕕");

  try {
    const r = await fetch(`${API}?nik=${nik}`, {
      headers: {
        Accept: "application/json, image/*, audio/*, video/*",
        Authorization: `Bearer ${KEY}`,
      },
    });

    const data = await r.json();

    if (!_optionalChain([data, 'optionalAccess', _4 => _4.valid])) {
      m.react("❌");
      return m.reply(
        `🪪 *ɴɪᴋ ᴛɪᴅᴀᴋ ᴠᴀʟɪᴅ*\n\n` +
          `- El NIC que entraste fue inválido.\n` +
          `- Asegúrese de que 16 dígitos son correctos.`,
      );
    }

    m.react("✅");

    const bDay = new Date(data.birthISO);
    const bFormatted = bDay.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const genderEmoji = data.gender === "pria" ? "♂️" : "♀️";
    const provNama = PROVINSI[data.provinceId] || data.province || "-";

    m.reply(
      `🪪 *ɴɪᴋ ᴘᴀʀꜱᴇʀ*\n\n` +
        `- *NIK* → \`${data.raw}\`\n` +
        `- Valide→ ✅Valide\n` +
        `- Fecha de Lahir→ ${bFormatted}\n` +
        `- *Jenis Kelamin* → ${genderEmoji} ${_optionalChain([data, 'access', _5 => _5.gender, 'optionalAccess', _6 => _6.charAt, 'call', _7 => _7(0), 'access', _8 => _8.toUpperCase, 'call', _9 => _9()]) + _optionalChain([data, 'access', _10 => _10.gender, 'optionalAccess', _11 => _11.slice, 'call', _12 => _12(1)])}\n` +
        `- *Provincia*→ ${provNama}\n` +
        `- *Kab/Ciudad*→Código\`${data.kabupatenKotaId}\`\n` +
        `- * Suspensión*→Código\`${data.kecamatanId}\`\n` +
        `- Código Único→ \`${data.uniqcode}\``,
    );
  } catch (e) {
    console.log(e);
    m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

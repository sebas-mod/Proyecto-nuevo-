"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);

const pluginConfig = {
  name: "ffstalk",
  alias: ["freefireid", "stalkff", "ff"],
  category: "stalker",
  description: "Melihat informasi lengkap akun Free Fire berdasarkan ID.",
  usage: ".ffstalk <id>",
  example: ".ffstalk 470699855",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const uid = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]) || m.args[0];

  if (!uid) {
    return m.reply("❌* Wallow, ID Free Fire - todavía por entrar! *\n\nTienes que escribir el fuego libre ULD que quiere ser acosado.\n\nEjemplo:`- ffstalk 470699855.`");
  }

  await m.react("🕕");

  try {
    const res = await _axios2.default.get(`https://api.nexray.eu.cc/stalker/freefire?uid=${uid}`, {
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });
    
    const data = res.data;

    if (!data.status || !data.result) {
      await m.react("❌");
      return m.reply(`⚠* Gaglys buscando!\n\nId${uid}* No hay contacto o Fuego en problemas, agégúþu de que el id que ingresapóres encto si.`);
    }

    const r = data.result;
    
    let caption = `🔥* LIBLE DE PEQUETHEROS - PROFILE INFO *🔥\n\n`;
    caption += `Aquí viene la búsqueda de perfil para la ULD.${r.uid}*:\n\n`;
    
    caption += `👤* INFO DASAR *\n`;
    caption += `- Nombre: *${r.name || "-"}*\n`;
    caption += `  - Level: ${r.level || "-"} (EXP: ${r.exp || "-"})\n`;
    caption += `  - Region: ${r.region || "-"}\n`;
    caption += `  - Likes: ${r.likes || "-"} ❤️\n`;
    caption += `  - Credit Score: ${r.credit_score || "-"}\n`;
    caption += `  - Bio: ${r.signature || "-"}\n\n`;
    
    caption += `🏆 *RANKING & AKTIVITAS*\n`;
    caption += `  - BR Rank Point: ${r.br_rank_point || "-"} (Max: ${r.br_max_rank || "-"})\n`;
    caption += `  - CS Rank Point: ${r.cs_rank_point || "-"} (Max: ${r.cs_max_rank || "-"})\n`;
    caption += `  - Season ID: ${r.season_id || "-"}\n`;
    caption += `- Hecho por Cuenta:${r.created_at || "-"}\n`;
    caption += `- Último acceso:${r.last_login || "-"}\n\n`;
    
    caption += `🛡GUILD INFO•\n`;
    caption += `- Nombre de Guid:${r.guild_name && r.guild_name !== "None" ? r.guild_name : "Tidak ada guild"}\n`;
    if (r.guild_name && r.guild_name !== "None") {
      caption += `  - Level Guild: ${r.guild_level || "-"}\n`;
      caption += `- Miembro:${r.guild_member || "-"}/${r.guild_capacity || "-"}\n`;
      caption += `- Lider Guid:${r.guild_leader_name || "-"} (UID: ${r.guild_leader_uid || "-"})\n`;
    }
    caption += `\n`;
    
    caption += `🐾* PET INFO *\n`;
    caption += `  - Pet Level: ${r.pet_level || "-"}\n`;
    caption += `  - Pet EXP: ${r.pet_exp || "-"}\n\n`;
    
    caption += `🔧 *Otros*\n`;
    caption += `  - Bahasa: ${r.language ? r.language.replace("Language_", "") : "-"}\n`;
    caption += `  - Mode Favorit: ${r.mode_prefer ? r.mode_prefer.replace("ModePrefer_", "") : "-"}\n\n`;

    caption += `Genial mucho profilnya? Bagikan a temanmu yuk! 🚀`;

    const isValidUrl = r.banner_image && (r.banner_image.startsWith("http://") || r.banner_image.startsWith("https://"));

    if (isValidUrl) {
      await sock.sendMessage(m.chat, {
        image: { url: r.banner_image },
        caption: caption
      }, { quoted: m });
    } else {
      await m.reply(caption);
    }

    await m.react("✅");

  } catch (error) {
    console.error("[FFStalk]", error.message);
    await m.react("☢");
    m.reply("😔* Es un problema en nuestro sistema *\n\nEl sistema no pudo extraer datos del servidor Free Fire.");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

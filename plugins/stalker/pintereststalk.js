"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "pintereststalk",
  alias: ["pinterestid", "stalkpinterest", "stalkpin"],
  category: "stalker",
  description: "Melihat informasi lengkap akun Pinterest berdasarkan username.",
  usage: ".pintereststalk <username>",
  example: ".pintereststalk dims",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const username = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]) || m.args[0];

  if (!username) {
    return m.reply("❌ *Waduh, username Pinterest-nya belum dimasukkan!*\n\nKamu harus mengetikkan username Pinterest yang ingin di-stalk. \n\nContoh: `.pintereststalk dims`");
  }

  await m.react("🕕");

  try {
    const res = await _axios2.default.get(`https://api.nexray.eu.cc/stalker/pinterest?username=${encodeURIComponent(username)}`, {
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });
    
    const data = res.data;

    if (!data.status || !data.result) {
      await m.react("❌");
      return m.reply(`⚠️ *Pencarian Gagal!*\n\nUsername *${username}* tidak ditemukan di Pinterest. Pastikan penulisannya sudah benar ya.`);
    }

    const r = data.result;
    
    let caption = `📌 *PINTEREST STALK - PROFILE INFO* 📌\n\n`;
    caption += `Halo! Ini dia hasil pencarian profil untuk username *@${r.username}*:\n\n`;
    
    caption += `👤 *INFO PROFIL*\n`;
    caption += `  - Nama Lengkap: *${r.full_name || "-"}*\n`;
    caption += `  - Username: @${r.username}\n`;
    caption += `  - Bio: ${r.bio || "-"}\n`;
    caption += `  - Tipe Akun: ${r.account_type || "-"}\n`;
    caption += `  - Akun Dibuat: ${r.created_at || "-"}\n\n`;
    
    caption += `📊 *STATISTIK*\n`;
    caption += `  - Pengikut (Followers): ${_optionalChain([r, 'access', _4 => _4.stats, 'optionalAccess', _5 => _5.followers]) || 0}\n`;
    caption += `  - Diikuti (Following): ${_optionalChain([r, 'access', _6 => _6.stats, 'optionalAccess', _7 => _7.following]) || 0}\n`;
    caption += `  - Total Pin: ${_optionalChain([r, 'access', _8 => _8.stats, 'optionalAccess', _9 => _9.pins]) || 0}\n`;
    caption += `  - Total Board: ${_optionalChain([r, 'access', _10 => _10.stats, 'optionalAccess', _11 => _11.boards]) || 0}\n\n`;
    
    caption += `🔗 *LINK PROFIL*\n`;
    caption += `  - ${r.profile_url}\n\n`;

    caption += `Suka mengumpulkan inspirasi dari Pinterest ya? Pamerin ke temanmu yuk! 🚀`;

    const imageUrl = _optionalChain([r, 'access', _12 => _12.image, 'optionalAccess', _13 => _13.original]) || _optionalChain([r, 'access', _14 => _14.image, 'optionalAccess', _15 => _15.large]) || _optionalChain([r, 'access', _16 => _16.image, 'optionalAccess', _17 => _17.medium]) || _optionalChain([r, 'access', _18 => _18.image, 'optionalAccess', _19 => _19.small]);

    if (imageUrl) {
      await sock.sendMessage(m.chat, {
        image: { url: imageUrl },
        caption: caption
      }, { quoted: m });
    } else {
      await m.reply(caption);
    }

    await m.react("✅");

  } catch (error) {
    console.error("[Pinterest Stalk]", error.message);
    await m.react("☢");
    m.reply("😔 *Terjadi masalah di sistem kami.* \n\nSistem gagal menarik data dari server Pinterest. Silakan coba beberapa saat lagi ya.");
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

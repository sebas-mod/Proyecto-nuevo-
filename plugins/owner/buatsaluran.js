"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const pluginConfig = {
  name: ["buatsaluran", "createsaluran", "createnewsletter"],
  alias: [],
  category: "owner",
  description: "Buat saluran/newsletter baru",
  usage: ".buatsaluran <nama>|<deskripsi>",
  example: ".buatsaluran Info Bot|Update terbaru bot kami",
  isOwner: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]) || "";
  const pipeIdx = text.indexOf("|");

  let name, description;
  if (pipeIdx === -1) {
    name = text;
    description = "";
  } else {
    name = text.substring(0, pipeIdx).trim();
    description = text.substring(pipeIdx + 1).trim();
  }

  if (!name || name.length < 2) {
    return m.reply(
      "📢 *ʙᴜᴀᴛ sᴀʟᴜʀᴀɴ*\n\n" +
        "> `.buatsaluran Nama Saluran`\n" +
        "> `.buatsaluran Nama|Deskripsi`\n\n" +
        "📝 Contoh:\n" +
        "> `.buatsaluran Info Bot`\n" +
        "> `.buatsaluran Info Bot|Update terbaru bot kami`",
    );
  }

  try {
    const result = await sock.newsletterCreate(name, description || undefined);
    const saluranId = _optionalChain([result, 'optionalAccess', _4 => _4.id]) || _optionalChain([result, 'optionalAccess', _5 => _5.thread_metadata, 'optionalAccess', _6 => _6.id]) || "unknown";
    const saluranName = _optionalChain([result, 'optionalAccess', _7 => _7.name]) || name;
    await m.react("✅");
    return m.reply(
      `📢 *sᴀʟᴜʀᴀɴ ᴅɪʙᴜᴀᴛ*\n\n` +
        `> Nama: ${saluranName}\n` +
        (description ? `> Deskripsi: ${description}\n` : "") +
        `> ID: ${saluranId}\n` +
        `> Subscribers: ${_optionalChain([result, 'optionalAccess', _8 => _8.subscribers]) || 0}\n\n` +
        `_Saluran ini bisa dikonfigurasi di config.saluran.id_`,
    );
  } catch (err) {
    return m.reply(`❌ Gagal membuat saluran: ${err.message}`);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

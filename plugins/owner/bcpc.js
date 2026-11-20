"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinlidjs = require('../../src/lib/ourin-lid.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

const pluginConfig = {
  name: "bcpc",
  alias: ["broadcastpc", "bcprivate"],
  category: "owner",
  description: "Broadcast pesan ke semua kontak private chat",
  usage: ".bcpc <pesan>",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function getBcContextInfo() {
  const saluranId = _optionalChain([_configjs2.default, 'access', _ => _.saluran, 'optionalAccess', _2 => _2.id]) || "";
  const saluranName = _optionalChain([_configjs2.default, 'access', _3 => _3.saluran, 'optionalAccess', _4 => _4.name]) || _optionalChain([_configjs2.default, 'access', _5 => _5.bot, 'optionalAccess', _6 => _6.name]) || "";
  const ctx = {
    forwardingScore: 1,
    isForwarded: true,
  };
  if (saluranId && saluranId !== "-@newsletter") {
    ctx.forwardedNewsletterMessageInfo = {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: Math.floor(Math.random() * 1000) + 1,
    };
  }
  return ctx;
}

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const input = _optionalChain([m, 'access', _7 => _7.fullArgs, 'optionalAccess', _8 => _8.trim, 'call', _9 => _9()]) || _optionalChain([m, 'access', _10 => _10.text, 'optionalAccess', _11 => _11.trim, 'call', _12 => _12()]) || "";

  if (!input) {
    const jeda = db.setting("jedaBcpc") || 5000;
    return m.reply(
      `📱 *BROADCAST PRIVATE CHAT*\n\n` +
        `Jeda: ${jeda}ms (${(jeda / 1000).toFixed(1)}s)\n\n` +
        `*PENGGUNAAN:*\n` +
        `• \`${m.prefix}bcpc <pesan>\` — Kirim ke semua kontak\n` +
        `• \`${m.prefix}bcpc (reply media)\` — Kirim dengan media\n\n` +
        `⚠️ *Peringatan:* Bot akan mengirim pesan ke semua kontak yang tersimpan!\n\n` +
        `ℹ️ *Note:* Kontak hanya terdeteksi jika mereka sudah pernah mengirim pesan ke bot. Kontak yang hanya disimpan tapi belum pernah chat tidak akan muncul.`,
    );
  }

  if (global.statusBcpc) {
    return m.reply(
      `❌ Broadcast private sedang berjalan.\nKetik \`${m.prefix}stopbcpc\` untuk menghentikan.`,
    );
  }

  m.react("📱");

  try {
    let mediaBuffer = null;
    let mediaType = null;
    const qmsg = m.quoted || m;

    if (qmsg.isImage) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "image";
      } catch (e2) {}
    } else if (qmsg.isVideo) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "video";
      } catch (e3) {}
    }

    const privateJids = new Set();
    const botNum = _optionalChain([sock, 'access', _13 => _13.user, 'optionalAccess', _14 => _14.id, 'optionalAccess', _15 => _15.split, 'call', _16 => _16(":"), 'access', _17 => _17[0]]) || "";

    const chatsMap = _optionalChain([sock, 'access', _18 => _18.store, 'optionalAccess', _19 => _19.chats]);
    if (chatsMap) {
      for (const [jid] of chatsMap.entries()) {
        const decoded = _ourinlidjs.decodeAndNormalize.call(void 0, jid);
        if (decoded && decoded.endsWith("@s.whatsapp.net")) {
          const num = decoded.split("@")[0];
          if (num !== botNum) privateJids.add(decoded);
        }
      }
    }

    const messagesMap = _optionalChain([sock, 'access', _20 => _20.store, 'optionalAccess', _21 => _21.messages]);
    if (messagesMap) {
      for (const [jid] of messagesMap.entries()) {
        const decoded = _ourinlidjs.decodeAndNormalize.call(void 0, jid);
        if (decoded && decoded.endsWith("@s.whatsapp.net")) {
          const num = decoded.split("@")[0];
          if (num !== botNum) privateJids.add(decoded);
        }
      }
    }

    const contactsObj = _optionalChain([sock, 'access', _22 => _22.store, 'optionalAccess', _23 => _23.contacts]);
    if (contactsObj) {
      for (const jid of Object.keys(contactsObj)) {
        const decoded = _ourinlidjs.decodeAndNormalize.call(void 0, jid);
        if (decoded && decoded.endsWith("@s.whatsapp.net")) {
          const num = decoded.split("@")[0];
          if (num !== botNum) privateJids.add(decoded);
        }
      }
    }

    if (privateJids.size === 0) {
      m.react("❌");
      return m.reply(
        "❌ Tidak ada kontak ditemukan.\n\nPastikan bot sudah pernah menerima pesan dari kontak tersebut.",
      );
    }

    const filtered = [...privateJids];

    const jeda = db.setting("jedaBcpc") || 5000;
    const ctx = getBcContextInfo();

    await sock.sendMessage(
      m.chat,
      {
        text:
          `📱 *ʙʀᴏᴀᴅᴄᴀsᴛ ᴘʀɪᴠᴀᴛᴇ*\n\n` +
          `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
          `┃ 📝 ᴘᴇsᴀɴ: \`${input.substring(0, 50)}${input.length > 50 ? "..." : ""}\`\n` +
          `┃ 📷 ᴍᴇᴅɪᴀ: \`${mediaBuffer ? mediaType : "Tidak"}\`\n` +
          `┃ 👥 ᴛᴀʀɢᴇᴛ: \`${filtered.length}\` kontak\n` +
          `┃ ⏱️ ᴊᴇᴅᴀ: \`${jeda}ms\`\n` +
          `┃ 📊 ᴇsᴛɪᴍᴀsɪ: \`${Math.ceil((filtered.length * jeda) / 60000)} menit\`\n` +
          `╰┈┈⬡\n\n` +
          `> Memulai broadcast...`,
        contextInfo: ctx,
      },
      { quoted: m },
    );

    global.statusBcpc = true;
    let success = 0;
    let failed = 0;

    for (const jid of filtered) {
      if (global.stopBcpc) {
        delete global.stopBcpc;
        break;
      }
      try {
        if (mediaBuffer) {
          await sock.sendMedia(jid, mediaBuffer, input, null, {
            type: mediaType,
            contextInfo: ctx,
          });
        } else {
          await sock.sendText(jid, input, null, { contextInfo: ctx });
        }
        success++;
      } catch (e4) {
        failed++;
      }
      await new Promise((r) => setTimeout(r, jeda));
    }

    delete global.statusBcpc;
    m.react("✅");

    await sock.sendMessage(
      m.chat,
      {
        text:
          `✅ *ʙʀᴏᴀᴅᴄᴀsᴛ ᴘʀɪᴠᴀᴛᴇ sᴇʟᴇsᴀɪ*\n\n` +
          `╭┈┈⬡「 📊 *ʜᴀsɪʟ* 」\n` +
          `┃ ✅ ʙᴇʀʜᴀsɪʟ: \`${success}\`\n` +
          `┃ ❌ ɢᴀɢᴀʟ: \`${failed}\`\n` +
          `┃ 📊 ᴛᴏᴛᴀʟ: \`${filtered.length}\`\n` +
          `╰┈┈⬡`,
        contextInfo: ctx,
      },
      { quoted: m },
    );
  } catch (e) {
    delete global.statusBcpc;
    m.react("❌");
    m.reply("Gagal: " + e.message);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

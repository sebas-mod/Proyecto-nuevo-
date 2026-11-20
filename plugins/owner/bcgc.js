"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinjpmhelperjs = require('../../src/lib/ourin-jpm-helper.js');
var _ourincontextjs = require('../../src/lib/ourin-context.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "bcgc",
  alias: [
    "broadcastgc",
    "bcgroup",
    "jedabcgc",
    "delaybcgc",
    "setjedabcgc",
    "stopbcgc",
    "stopbroadcastgc",
  ],
  category: "owner",
  description:
    "Broadcast pesan ke semua grup dengan dukungan semua jenis media",
  usage: ".bcgc",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function parseDelay(input) {
  if (!input) return null;
  const match = input.match(/^(\d+)(s|m|h|d)$/i);
  if (!match) return null;
  const val = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  switch (unit) {
    case "s":
      return val * 1000;
    case "m":
      return val * 60 * 1000;
    case "h":
      return val * 60 * 60 * 1000;
    case "d":
      return val * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}

function formatDelay(ms) {
  if (ms >= 86400000) return `${(ms / 86400000).toFixed(0)} hari`;
  if (ms >= 3600000) return `${(ms / 3600000).toFixed(0)} jam`;
  if (ms >= 60000) return `${(ms / 60000).toFixed(0)} menit`;
  return `${(ms / 1000).toFixed(0)} detik`;
}

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const command = _optionalChain([m, 'access', _ => _.command, 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]) || "";
  const input = _optionalChain([m, 'access', _4 => _4.fullArgs, 'optionalAccess', _5 => _5.trim, 'call', _6 => _6()]) || _optionalChain([m, 'access', _7 => _7.text, 'optionalAccess', _8 => _8.trim, 'call', _9 => _9()]) || "";

  if (command === "stopbcgc" || command === "stopbroadcastgc") {
    if (!global.statusBcgc) {
      return m.reply(`❌ Tidak ada broadcast grup yang sedang berjalan.`);
    }
    global.stopBcgc = true;
    m.react("⏹️");
    return m.reply(
      `⏹️ *Broadcast Grup Dihentikan*\n\n> Proses broadcast sedang dihentikan...`,
    );
  }

  if (
    command === "jedabcgc" ||
    command === "delaybcgc" ||
    command === "setjedabcgc"
  ) {
    return handleSetDelay(m, db, input);
  }

  if (input.toLowerCase() === "on") {
    db.setting("bcgcEnabled", true);
    return m.reply(
      `✅ *Broadcast Grup Diaktifkan*\n\n> Sekarang kamu bisa mengirim broadcast ke semua grup.`,
    );
  }

  if (input.toLowerCase() === "off") {
    db.setting("bcgcEnabled", false);
    return m.reply(
      `✅ *Broadcast Grup Dinonaktifkan*\n\n> Broadcast grup telah dimatikan.`,
    );
  }

  if (!input && !m.quoted) {
    const enabled = db.setting("bcgcEnabled");
    const jeda = db.setting("jedaBcgc") || 5000;
    return m.reply(
      `📢 *Broadcast Grup*\n\n` +
        `Kirim pesan ke seluruh grup sekaligus dalam satu perintah.\n\n` +
        `*Status saat ini:*\n` +
        `> Broadcast: *${enabled ? "✅ Aktif" : "❌ Nonaktif"}*\n` +
        `> Jeda: *${formatDelay(jeda)}* (*${jeda}ms*)\n\n` +
        `*PENGGUNAAN:*\n` +
        `> *${m.prefix}bcgc on* — Aktifkan broadcast\n` +
        `> *${m.prefix}bcgc off* — Nonaktifkan broadcast\n` +
        `> *${m.prefix}bcgc <pesan>* — Kirim broadcast teks\n` +
        `> *${m.prefix}bcgc* (reply foto/video/audio/dokumen) — Kirim dengan media\n` +
        `> *${m.prefix}bcgc* (reply pesan teks) — Kirim isi pesan yang di-reply\n\n` +
        `*JEDA:*\n` +
        `> *${m.prefix}jedabcgc 5s* — Set jeda 5 detik\n` +
        `> *${m.prefix}jedabcgc 2m* — Set jeda 2 menit\n\n` +
        `*STOP:*\n` +
        `> *${m.prefix}stopbcgc* — Hentikan broadcast yang berjalan`,
    );
  }

  if (global.statusBcgc) {
    return m.reply(
      `❌ *Broadcast Sedang Berjalan*\n\n> Ketik *${m.prefix}stopbcgc* untuk menghentikan terlebih dahulu.`,
    );
  }

  const enabled = db.setting("bcgcEnabled");
  if (!enabled) {
    return m.reply(
      `❌ *Broadcast Belum Aktif*\n\n> Ketik *${m.prefix}bcgc on* dulu untuk mengaktifkan.`,
    );
  }

  m.react("📢");

  try {
    let mediaBuffer = null;
    let mediaType = null;
    let text = input || "";
    const qmsg = m.quoted || m;

    if (!text && m.quoted) {
      text = m.quoted.body || m.quoted.text || m.quoted.contentText || "";
    }

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
    } else if (qmsg.isAudio || _optionalChain([qmsg, 'access', _10 => _10.mimetype, 'optionalAccess', _11 => _11.startsWith, 'call', _12 => _12("audio")])) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "audio";
      } catch (e4) {}
    } else if (qmsg.isSticker) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "sticker";
      } catch (e5) {}
    } else if (
      qmsg.isDocument ||
      (qmsg.mimetype && !qmsg.mimetype.startsWith("text/plain"))
    ) {
      try {
        mediaBuffer = await qmsg.download();
        mediaType = "document";
      } catch (e6) {}
    }

    if (!text && !mediaBuffer) {
      m.react("❌");
      return m.reply(
        `❌ *Tidak Ada Konten*\n\n` +
          `Kirim pesan, foto, audio, video, atau dokumen terlebih dahulu.\n\n` +
          `*Cara yang benar:*\n` +
          `1. Kirim teks/foto/video/audio/dokumen\n` +
          `2. Reply pesan tersebut dengan *${m.prefix}bcgc*\n` +
          `3. Bot akan broadcast ke semua grup`,
      );
    }

    const allGroups = await _ourinjpmhelperjs.fetchGroupsSafe.call(void 0, sock);
    let groupIds = Object.keys(allGroups);

    const blacklist = db.setting("jpmBlacklist") || [];
    const blCount = groupIds.filter((id) => blacklist.includes(id)).length;
    groupIds = groupIds.filter((id) => !blacklist.includes(id));

    if (groupIds.length === 0) {
      m.react("❌");
      return m.reply(
        `❌ *Tidak Ada Grup*\n\n> Bot tidak menemukan grup yang bisa dituju${blCount > 0 ? ` (${blCount} grup di-blacklist)` : ""}`,
      );
    }

    const jeda = db.setting("jedaBcgc") || 5000;
    const ctx = _ourincontextjs.saluranCtx.call(void 0, );

    await m.reply(
      `📢 *Broadcast Grup Dimulai*\n\n` +
        `> 📝 Pesan: *${text.substring(0, 50)}${text.length > 50 ? "..." : ""}*\n` +
        `> 📷 Media: *${mediaBuffer ? mediaType : "Tidak ada"}*\n` +
        `> 👥 Target: *${groupIds.length}* grup\n` +
        `> ⏱️ Jeda: *${formatDelay(jeda)}*\n` +
        `> 📊 Estimasi: *${Math.ceil((groupIds.length * jeda) / 60000)} menit*\n\n` +
        `_Sedang mengirim ke semua grup..._`,
    );

    global.statusBcgc = true;
    let success = 0;
    let failed = 0;

    for (const gid of groupIds) {
      if (global.stopBcgc) {
        delete global.stopBcgc;
        delete global.statusBcgc;
        await m.reply(
          `⏹️ *Broadcast Grup Dihentikan*\n\n` +
            `> ✅ Berhasil: *${success}*\n` +
            `> ❌ Gagal: *${failed}*\n` +
            `> ⏸️ Sisa: *${groupIds.length - success - failed}*`,
        );
        return;
      }

      try {
        if (mediaType === "sticker") {
          await sock.sendMessage(
            gid,
            { sticker: mediaBuffer, contextInfo: ctx },
            { quoted: m },
          );
        } else if (mediaType === "audio") {
          await sock.sendMessage(
            gid,
            {
              audio: mediaBuffer,
              mimetype: qmsg.mimetype || "audio/mpeg",
              ptt: qmsg.ptt || false,
              contextInfo: ctx,
            },
            { quoted: m },
          );
        } else if (mediaType === "document") {
          await sock.sendMessage(
            gid,
            {
              document: mediaBuffer,
              mimetype: qmsg.mimetype || "application/octet-stream",
              fileName: qmsg.fileName || "file",
              caption: text || undefined,
              contextInfo: ctx,
            },
            { quoted: m },
          );
        } else if (mediaBuffer) {
          await sock.sendMessage(
            gid,
            {
              [mediaType]: mediaBuffer,
              caption: text,
              contextInfo: ctx,
            },
            { quoted: m },
          );
        } else {
          await sock.sendMessage(
            gid,
            { text, contextInfo: ctx },
            { quoted: m },
          );
        }
        success++;
      } catch (e7) {
        failed++;
      }

      await new Promise((r) => setTimeout(r, jeda));
    }

    delete global.statusBcgc;
    m.react("✅");
    await m.reply(
      `✅ *Broadcast Grup Selesai!*\n\n` +
        `> ✅ Berhasil: *${success}*\n` +
        `> ❌ Gagal: *${failed}*\n` +
        `> 📊 Total: *${groupIds.length}*`,
    );
  } catch (e) {
    delete global.statusBcgc;
    m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

async function handleSetDelay(m, db, input) {
  const current = db.setting("jedaBcgc") || 5000;

  if (!input) {
    return m.reply(
      `⏱️ *Jeda Broadcast Grup*\n\n` +
        `Atur jeda waktu antar pengiriman pesan ke setiap grup.\n` +
        `Semakin lama jeda, semakin aman dari spam detection.\n\n` +
        `> Jeda saat ini: *${formatDelay(current)}* (*${current}ms*)\n\n` +
        `*CARA PAKAI:*\n` +
        `> *${m.prefix}jedabcgc <angka><satuan>*\n\n` +
        `*SATUAN:*\n` +
        `> *s* — detik • *m* — menit • *h* — jam • *d* — hari\n\n` +
        `*CONTOH:*\n` +
        `> *${m.prefix}jedabcgc 5s* → 5 detik\n` +
        `> *${m.prefix}jedabcgc 2m* → 2 menit\n` +
        `> *${m.prefix}jedabcgc 1h* → 1 jam`,
    );
  }

  const ms = parseDelay(input);
  if (!ms || ms < 1000) {
    return m.reply(`❌ Format salah. Contoh: *5s*, *2m*, *1h*, *1d*`);
  }

  db.setting("jedaBcgc", ms);
  return m.reply(
    `✅ *Jeda Broadcast Grup Diubah*\n\n` +
      `> Sebelumnya: *${formatDelay(current)}* (*${current}ms*)\n` +
      `> Sekarang: *${formatDelay(ms)}* (*${ms}ms*)\n\n` +
      `> Estimasi 100 grup: *${Math.ceil((100 * ms) / 60000)} menit*`,
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

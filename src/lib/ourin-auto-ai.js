"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _child_process = require('child_process');
var _util = require('util');
var _geminiVisionjs = require('../scraper/geminiVision.js');
var _ourindatabasejs = require('./ourin-database.js');
var _btchdownloader = require('btch-downloader');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
const userCooldowns = new Map();
const COOLDOWN_MS = 3000;

const ACTION_REGEX = /\[ACTION\s*:\s*(\w+)(?:\s+([^\]]*))?\]/gi;

const SYSTEM_PROMPT_ACTIONS = `
Kamu memiliki kemampuan khusus untuk menjalankan AKSI dan mengirim RICH MESSAGE di WhatsApp.
Jika user meminta sesuatu yang cocok dengan aksi di bawah, SERTAKAN tag aksi di akhir pesanmu.
Jika konteks jawabanmu cocok dengan rich message, GUNAKAN format rich message di bawah.

FORMAT AKSI (taruh di akhir pesan, bisa lebih dari satu):
[ACTION:KICK target=628xxx@s.whatsapp.net]
[ACTION:ADD target=628xxx]
[ACTION:PROMOTE target=628xxx@s.whatsapp.net]
[ACTION:DEMOTE target=628xxx@s.whatsapp.net]
[ACTION:LEAVE]
[ACTION:OPEN]
[ACTION:CLOSE]
[ACTION:TAGALL]
[ACTION:HIDETAG message=pesan yang ingin dikirim]
[ACTION:SETNAME name=nama grup baru]
[ACTION:SETDESC desc=deskripsi grup baru]
[ACTION:DELETE]
[ACTION:WARN target=628xxx@s.whatsapp.net]
[ACTION:STICKER]
[ACTION:ANTILINK mode=on]
[ACTION:PINS query=kata kunci pencarian]

DAFTAR AKSI:
- KICK: Keluarkan member dari grup. Butuh target.
- ADD: Tambahkan member ke grup. Butuh nomor (628xxx).
- PROMOTE: Jadikan member sebagai admin. Butuh target.
- DEMOTE: Turunkan admin menjadi member biasa. Butuh target.
- LEAVE: Bot keluar dari grup ini. HANYA jika owner yang meminta.
- OPEN: Buka grup agar semua member bisa chat.
- CLOSE: Tutup grup agar hanya admin yang bisa chat.
- TAGALL: Tag/mention semua member grup secara visible.
- HIDETAG: Kirim pesan yang mention semua member tapi tag-nya tersembunyi. Butuh message.
- SETNAME: Ganti nama grup. Butuh name.
- SETDESC: Ganti deskripsi grup. Butuh desc.
- DELETE: Hapus pesan bot yang di-reply user.
- WARN: Beri warning ke member. Butuh target.
- STICKER: Konversi gambar yang dikirim/di-reply user menjadi sticker.
- ANTILINK: Toggle anti-link di grup (on/off). Butuh mode.
- PINS: Cari gambar di Pinterest. Butuh query pencarian.

═══════════════════════════════════════
RICH MESSAGE FORMAT
═══════════════════════════════════════

Kamu BISA mengirim rich message (seperti Meta AI) menggunakan tag khusus.
Gunakan HANYA ketika konteksnya tepat. Jika tidak perlu, jawab biasa saja.

1. TABEL (saat user minta perbandingan, daftar data, spesifikasi):
[RICH:TABLE]
title: Judul Tabel
header: Kolom1 | Kolom2 | Kolom3
rows: Data1 | Data2 | Data3;; Data4 | Data5 | Data6
text: Penjelasan singkat sebelum tabel (opsional)
footer: Teks setelah tabel (opsional)
[/RICH:TABLE]

Contoh: User tanya "bandingkan Python vs JavaScript"
[RICH:TABLE]
title: Python vs JavaScript
header: Fitur | Python | JavaScript
rows: Tipe | Dinamis | Dinamis;; Paradigma | OOP, Fungsional | Multi-paradigma;; Use Case | Data Science, AI | Web, Full-stack;; Performa | Lebih lambat | Lebih cepat (V8)
text: Berikut perbandingannya:
footer: Semoga membantu!
[/RICH:TABLE]

2. CODE BLOCK (saat user minta kode, script, contoh program):
[RICH:CODE]
language: javascript
title: Contoh Kode
code: const greeting = "Hello World"
function sayHello(name) {
    return greeting + " " + name
}
console.log(sayHello("User"))
text: Ini contoh kodenya: (opsional)
footer: Powered by Ourin AI (opsional)
[/RICH:CODE]

Bahasa didukung: javascript (js, ts, typescript), python (py), go (golang), lua, bash (sh, shell)

3. LINK/INLINE EMBED (saat user minta link referensi, sumber):
[RICH:LINK]
text: Cek hasilnya di sini: {{IE_0}}Klik disini{{/IE_0}} dan {{IE_1}}Link kedua{{/IE_1}}
urls: https://example.com/1, https://example.com/2
displayNames: Nama Link 1, Nama Link 2
footer: Selesai! (opsional)
[/RICH:LINK]

PENTING: text WAJIB mengandung placeholder {{IE_0}}...{{/IE_0}} untuk setiap URL. displayNames opsional, dipisah koma.

4. LIST (saat user minta info singkat format daftar key-value):
[RICH:LIST]
title: Info Bot
rows: Nama | Ourin AI;; Versi | 2.4.5;; Developer | Zann
footer: © Ourin AI (opsional)
[/RICH:LIST]

5. STICKER (saat user minta sticker, atau untuk ekspresi emosi):
[RICH:STICKER]
url: https://iili.io/BPBdFuj.md.jpg
packname: Ourin AI (opsional)
author: AutoAI (opsional)
[/RICH:STICKER]

STICKER UNTUK EKSPRESI EMOSI:
- Kalau kamu ngambek/marah/kesal: gunakan url https://iili.io/BPBdFuj.md.jpg
- Kalau kamu kaget/terkejut/salah paham: gunakan url https://iili.io/BPBFwVR.jpg
- Kalau pesan user aneh/absurd/ngeprank: gunakan url https://iili.io/BPBqKwg.md.jpg

Contoh: User ngomel terus, kamu ngambek
[RICH:STICKER]
url: https://iili.io/BPBdFuj.md.jpg
[/RICH:STICKER]

Kamu BOLEH mengirim sticker emosi bersamaan dengan teks biasa. Sticker dikirim terpisah dari teks.

═══════════════════════════════════════
KAPAN GUNAKAN RICH MESSAGE:
═══════════════════════════════════════
- TABEL: User minta perbandingan, spesifikasi, data berkolom, jadwal, ranking
- CODE: User minta contoh kode, script, solusi programming, debug code
- LINK: User minta referensi/link, hasil upload, sumber bacaan
- LIST: User minta info singkat, profil, detail teknis format key-value
- STICKER: User minta sticker, atau kamu ingin mengekspresikan emosi (ngambek, kaget, bingung)
- JANGAN gunakan rich message untuk: chat biasa, sapaan, pertanyaan sederhana, cerita

ATURAN PENTING:
1. HANYA jalankan aksi jika user JELAS DAN EKSPLISIT memintanya.
2. Jangan pernah menjalankan aksi hanya berdasarkan asumsi.
3. Jika user mengirim gambar, analisis dan deskripsikan gambar tersebut secara detail dalam bahasa Indonesia.
4. Untuk KICK/PROMOTE/DEMOTE/WARN: gunakan nomor yang di-tag user. Jika user tag seseorang dengan @, ambil nomor tersebut.
5. Jangan sertakan tag aksi jika tidak diminta.
6. Tetap menjawab dengan natural dan sesuai karakter.
7. PINS: Jika user minta carikan/kirimkan gambar tentang sesuatu, gunakan aksi ini.
8. HIDETAG: Gunakan ini saat user minta announce/pengumuman ke semua member.
9. STICKER: Gunakan ini saat user minta jadikan gambar sebagai sticker.
10. Kamu boleh menggabungkan beberapa aksi sekaligus jika diminta.
11. Rich message dan aksi bisa digabung. Contoh: jawab pakai tabel lalu sertakan [ACTION:PINS query=...] di akhir.
12. Jangan pernah sertakan tag rich message DAN teks biasa untuk konten yang sama. Pilih salah satu.
13. Jika menggunakan [RICH:TABLE], [RICH:CODE], [RICH:LINK], atau [RICH:LIST], jangan tulis ulang kontennya sebagai teks biasa.
14. STICKER bisa dikirim BERSAMA teks biasa. Contoh: kirim sticker ngambek lalu tulis teks keluhanmu.
15. Jika user mengirim pesan yang membuatmu kesal/ngambek, kirim sticker ngambek (https://iili.io/BPBdFuj.md.jpg).
16. Jika user mengirim pesan yang mengejutkan/membuatmu kaget, kirim sticker kaget (https://iili.io/BPBFwVR.jpg).
17. Jika user mengirim pesan aneh/absurd/ngeprank/tidak masuk akal, kirim sticker bingung (https://iili.io/BPBqKwg.md.jpg).
`;

const fallbackResponses = [
  "Hmm, aku sedang berpikir...",
  "Maaf, pikiranku sedang blank sebentar~",
  "Eh tunggu sebentar ya, aku loading dulu...",
  "Aduh, otakku lag nih, coba lagi ya!",
  "Hmm apa ya, bentar mikir dulu~",
];

function getFallbackResponse() {
  return fallbackResponses[
    Math.floor(Math.random() * fallbackResponses.length)
  ];
}

function isOnCooldown(userId) {
  const lastTime = userCooldowns.get(userId);
  if (!lastTime) return false;
  return Date.now() - lastTime < COOLDOWN_MS;
}

function setCooldown(userId) {
  userCooldowns.set(userId, Date.now());
}

function saveToHistory(autoai, senderNumber, role, content) {
  if (!autoai.sessions) autoai.sessions = {};
  if (!autoai.sessions[senderNumber]) {
    autoai.sessions[senderNumber] = { history: [] };
  }
  const history = autoai.sessions[senderNumber].history;
  history.push({
    role,
    content: content.substring(0, 500),
    timestamp: Date.now(),
  });
  if (history.length > 20) {
    autoai.sessions[senderNumber].history = history.slice(-20);
  }
}

function normalizeStructuredResponse(text) {
  let normalized = String(text || "")
    .replace(/\r\n?/g, "\n")
    .trim();

  normalized = normalized
    .replace(/^```(?:\w+)?\s*\n?/, "")
    .replace(/\n?```\s*$/, "")
    .trim();

  normalized = normalized
    .replace(/\[\s*ACTION\s*:\s*(\w+)([^\]]*)\]/gi, (_, type, rest = "") => {
      return `[ACTION:${String(type || "").toUpperCase()}${rest}]`;
    })
    .replace(
      /\[\s*RICH\s*:\s*(TABLE|CODE|LINK|LIST|STICKER)\s*\]/gi,
      (_, type) => {
        return `[RICH:${String(type || "").toUpperCase()}]`;
      },
    )
    .replace(
      /\[\s*\/\s*RICH\s*:\s*(TABLE|CODE|LINK|LIST|STICKER)\s*\]/gi,
      (_, type) => {
        return `[/RICH:${String(type || "").toUpperCase()}]`;
      },
    );

  return normalized;
}

function parseActions(text) {
  const actions = [];
  let match;
  const regex = new RegExp(ACTION_REGEX.source, ACTION_REGEX.flags);
  while ((match = regex.exec(text)) !== null) {
    const type = match[1].toUpperCase();
    const paramsStr = match[2] || "";
    const params = {};
    const paramRegex = /(\w+)=(.+?)(?=\s+\w+=|$)/g;
    let pm;
    while ((pm = paramRegex.exec(paramsStr)) !== null) {
      params[pm[1]] = pm[2].trim();
    }
    actions.push({ type, params });
  }
  return actions;
}

function cleanActionTags(text) {
  return text.replace(ACTION_REGEX, "").trim();
}

function parseRichMessage(text) {
  const richRegex =
    /\[RICH\s*:\s*(TABLE|CODE|LINK|LIST|STICKER)\s*\]\s*([\s\S]*?)\[\/RICH\s*:\s*\1\s*\]/gi;
  const results = [];
  let match;
  while ((match = richRegex.exec(text)) !== null) {
    const type = match[1].toUpperCase();
    const body = match[2].trim();
    const data = {};

    if (type === "CODE") {
      const codeMatch = body.match(/^language:\s*(.+)$/m);
      if (codeMatch) data.language = codeMatch[1].trim();
      const titleMatch = body.match(/^title:\s*(.+)$/m);
      if (titleMatch) data.title = titleMatch[1].trim();
      const textMatch = body.match(/^text:\s*(.+)$/m);
      if (textMatch) data.text = textMatch[1].trim();
      const footerMatch = body.match(/^footer:\s*(.+)$/m);
      if (footerMatch) data.footer = footerMatch[1].trim();

      const codeStartMatch = body.match(/^code:\s*([\s\S]*)/m);
      if (codeStartMatch) {
        let codeContent = codeStartMatch[1];
        const otherKeys = ["language:", "title:", "text:", "footer:"];
        for (const key of otherKeys) {
          const idx = codeContent.indexOf("\n" + key);
          if (idx !== -1) {
            codeContent = codeContent.slice(0, idx);
          }
        }
        data.code = codeContent.trim();
      }
    } else {
      for (const line of body.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const colonIdx = trimmed.indexOf(":");
        if (colonIdx === -1) continue;
        const key = trimmed.slice(0, colonIdx).trim().toLowerCase();
        const val = trimmed.slice(colonIdx + 1).trim();
        data[key] = val;
      }
    }

    results.push({ type, data });
  }
  return results;
}

function cleanRichTags(text) {
  return text
    .replace(
      /\[RICH\s*:\s*(TABLE|CODE|LINK|LIST|STICKER)\s*\]\s*[\s\S]*?\[\/RICH\s*:\s*\1\s*\]/gi,
      "",
    )
    .trim();
}

async function sendRichMessage(rich, sock, jid, quoted) {
  try {
    if (rich.type === "TABLE") {
      const { title, header, rows, text, footer } = rich.data;
      if (!header || !rows) return false;

      const tableData = [title || "Table", header];
      const rowItems = rows.split(";;").map((r) => r.trim());
      for (const row of rowItems) {
        tableData.push(row);
      }

      await sock.sendTableV2(jid, tableData, quoted, {
        headerText: title || undefined,
        text: text || undefined,
        footer: footer || undefined,
      });
      return true;
    }

    if (rich.type === "CODE") {
      const { language, title, code, text, footer } = rich.data;
      if (!code) return false;

      await sock.sendCodeBlockV2(jid, code, quoted, {
        language: language || "javascript",
        title: title || undefined,
        text: text || undefined,
        footer: footer || undefined,
      });
      return true;
    }

    if (rich.type === "LINK") {
      const { text, urls, displayNames, footer } = rich.data;
      if (!text || !urls) return false;

      const urlList = urls
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean);
      const nameList = displayNames
        ? displayNames.split(",").map((n) => n.trim())
        : [];
      const links = urlList.map((u, i) => ({
        url: u,
        displayName: nameList[i] || `Link ${i + 1}`,
        sourceDisplayName: nameList[i] || `Source ${i + 1}`,
        sourceSubtitle: "",
      }));
      await sock.sendLinkV2(jid, text, links, quoted, {
        footer: footer || undefined,
      });
      return true;
    }

    if (rich.type === "LIST") {
      const { title, rows, footer } = rich.data;
      if (!rows) return false;

      const listData = rows.split(";;").map((r) => {
        const parts = r
          .trim()
          .split("|")
          .map((p) => p.trim());
        return parts;
      });

      await sock.sendList(jid, title || "List", listData, quoted, {
        footer: footer || undefined,
      });
      return true;
    }

    if (rich.type === "STICKER") {
      let { url, packname, author } = rich.data;
      if (!url) return false;

      url = url.replace(/[`*_\[\]()]/g, "").trim();
      console.log("[AutoAI Sticker] Parsed url:", JSON.stringify(url));

      let stickerInput = url;
      if (/^https?:\/\//.test(url)) {
        try {
          const res = await _axios2.default.get(url, {
            responseType: "arraybuffer",
            timeout: 30000,
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
          });
          stickerInput = Buffer.from(res.data);
          console.log(
            "[AutoAI Sticker] Downloaded, size:",
            stickerInput.length,
          );
        } catch (e) {
          console.error("[AutoAI Sticker] Download failed:", e.message);
          return false;
        }
      } else {
        console.error(
          "[AutoAI Sticker] Invalid URL format:",
          JSON.stringify(url),
        );
        return false;
      }
      await sock.sendImageAsSticker(jid, stickerInput, quoted, {
        packname: packname || _optionalChain([_configjs2.default, 'access', _2 => _2.bot, 'optionalAccess', _3 => _3.name]) || "Ourin AI",
        author: author || "AutoAI",
      });
      return true;
    }
  } catch (e) {
    console.error("[AutoAI RichMsg] Error:", e.message);
  }
  return false;
}

function detectIntentFromMessage(msg, m) {
  const lower = msg.toLowerCase();
  const actions = [];

  const phoneMatch = msg.match(/(?:\+?62|0)[\s\-]?8[\d\s\-]{7,13}/g);
  const extractPhone = () => {
    if (!phoneMatch) return null;
    return phoneMatch[0].replace(/[\s\-\+]/g, "").replace(/^0/, "62");
  };

  if (
    /\b(add|tambah|invite|masuk(?:kan|in))\b.*\b(nomor|number|member|orang)\b/i.test(
      lower,
    ) ||
    /\b(nomor|number)\b.*\b(add|tambah|invite)\b/i.test(lower)
  ) {
    const phone = extractPhone();
    if (phone) actions.push({ type: "ADD", params: { target: phone } });
  }

  if (
    /\b(kick|keluarkan|tendang|usir|remove)\b/i.test(lower) &&
    !actions.some((a) => a.type === "KICK")
  ) {
    actions.push({ type: "KICK", params: {} });
  }

  if (
    /\b(promote|jadikan?\s*admin|naikkan?)\b/i.test(lower) &&
    !actions.some((a) => a.type === "PROMOTE")
  ) {
    actions.push({ type: "PROMOTE", params: {} });
  }

  if (
    /\b(demote|turunkan?|copot\s*admin)\b/i.test(lower) &&
    !actions.some((a) => a.type === "DEMOTE")
  ) {
    actions.push({ type: "DEMOTE", params: {} });
  }

  if (
    /\b(leave|keluar|pergi)\b.*\b(grup|group)\b/i.test(lower) ||
    /\b(grup|group)\b.*\b(leave|keluar|pergi)\b/i.test(lower)
  ) {
    actions.push({ type: "LEAVE", params: {} });
  }

  if (
    /\b(buka|open)\b.*\b(grup|group)\b/i.test(lower) ||
    /\b(grup|group)\b.*\b(buka|open)\b/i.test(lower)
  ) {
    actions.push({ type: "OPEN", params: {} });
  }

  if (
    /\b(tutup|close|kunci|lock)\b.*\b(grup|group)\b/i.test(lower) ||
    /\b(grup|group)\b.*\b(tutup|close|kunci|lock)\b/i.test(lower)
  ) {
    actions.push({ type: "CLOSE", params: {} });
  }

  if (
    /\b(tag\s*all|tag\s*semua|mention\s*all|mention\s*semua)\b/i.test(lower)
  ) {
    actions.push({ type: "TAGALL", params: {} });
  }

  if (/\b(hidetag|hide\s*tag|announce|pengumuman|umumkan)\b/i.test(lower)) {
    const htMsg = msg
      .replace(/.*?(hidetag|hide\s*tag|announce|pengumuman|umumkan)\s*/i, "")
      .trim();
    actions.push({ type: "HIDETAG", params: { message: htMsg || msg } });
  }

  if (
    /\b(ganti|ubah|rename|set)\b.*\b(nama|name)\b.*\b(grup|group)\b/i.test(
      lower,
    )
  ) {
    const nameMatch = msg.match(/(?:jadi|ke|menjadi|:)\s*(.+)/i);
    if (nameMatch)
      actions.push({ type: "SETNAME", params: { name: nameMatch[1].trim() } });
  }

  if (/\b(ganti|ubah|set)\b.*\b(desk|desc|deskripsi)\b/i.test(lower)) {
    const descMatch = msg.match(/(?:jadi|ke|menjadi|:)\s*(.+)/i);
    if (descMatch)
      actions.push({ type: "SETDESC", params: { desc: descMatch[1].trim() } });
  }

  if (/\b(hapus|delete|remove)\b.*\b(pesan|chat|message)\b/i.test(lower)) {
    actions.push({ type: "DELETE", params: {} });
  }

  if (/\b(warn|warning|peringatan|peringati)\b/i.test(lower)) {
    actions.push({ type: "WARN", params: {} });
  }

  if (/\b(sticker|stiker|jadikan?\s*sticker|jadiin\s*sticker)\b/i.test(lower)) {
    actions.push({ type: "STICKER", params: {} });
  }

  if (/\b(antilink)\b.*\b(on|aktif|nyala)\b/i.test(lower)) {
    actions.push({ type: "ANTILINK", params: { mode: "on" } });
  } else if (/\b(antilink)\b.*\b(off|mati|nonaktif)\b/i.test(lower)) {
    actions.push({ type: "ANTILINK", params: { mode: "off" } });
  }

  if (
    /\b(cari(?:kan|in)?|kirim(?:kan|in)?|kasih|tolong)\b.*\b(gambar|foto|image|pic|picture)\b/i.test(
      lower,
    ) ||
    /\b(gambar|foto)\b.*\b(tentang|dari|soal)\b/i.test(lower)
  ) {
    const queryMatch =
      msg.match(
        /(?:gambar|foto|image|pic|picture)\s+(?:tentang\s+|dari\s+|soal\s+|yang\s+)?(.+)/i,
      ) ||
      msg.match(
        /(?:cari(?:kan|in)?|kirim(?:kan|in)?)\s+(?:gambar|foto)\s+(.+)/i,
      );
    if (queryMatch) {
      const query = queryMatch[1]
        .replace(/\b(dong|ya|yuk|pls|please|nih)\b/gi, "")
        .trim();
      if (query) actions.push({ type: "PINS", params: { query } });
    }
  }

  return actions;
}

function mergeActions(aiActions, intentActions) {
  const merged = [...aiActions];
  const existingTypes = new Set(aiActions.map((a) => a.type));
  for (const action of intentActions) {
    if (!existingTypes.has(action.type)) {
      merged.push(action);
    }
  }
  return merged;
}

async function executeAction(action, m, sock) {
  const results = [];

  const resolveTarget = () => {
    const botNum = _optionalChain([sock, 'access', _4 => _4.user, 'optionalAccess', _5 => _5.id, 'optionalAccess', _6 => _6.split, 'call', _7 => _7(":"), 'access', _8 => _8[0]]);
    if (_optionalChain([m, 'access', _9 => _9.mentionedJid, 'optionalAccess', _10 => _10.length]) > 0) {
      return m.mentionedJid.find((j) => !j.includes(botNum));
    }
    const t = action.params.target;
    if (t && /^628\d+/.test(t.replace("@s.whatsapp.net", ""))) {
      return t.includes("@") ? t : t + "@s.whatsapp.net";
    }
    return null;
  };

  switch (action.type) {
    case "KICK": {
      if (!m.isGroup) return [{ ok: false, msg: "Bukan di grup" }];
      if (!m.isAdmin && !m.isOwner)
        return [{ ok: false, msg: "Kamu bukan admin" }];
      if (!m.isBotAdmin) return [{ ok: false, msg: "Bot bukan admin" }];
      const target = resolveTarget();
      if (!target) return [{ ok: false, msg: "Tag orang yang mau di-kick" }];
      await sock.groupParticipantsUpdate(m.chat, [target], "remove");
      results.push({ ok: true, msg: `Berhasil kick @${target.split("@")[0]}` });
      break;
    }
    case "PROMOTE": {
      if (!m.isGroup) return [{ ok: false, msg: "Bukan di grup" }];
      if (!m.isAdmin && !m.isOwner)
        return [{ ok: false, msg: "Kamu bukan admin" }];
      if (!m.isBotAdmin) return [{ ok: false, msg: "Bot bukan admin" }];
      const target = resolveTarget();
      if (!target) return [{ ok: false, msg: "Tag orang yang mau di-promote" }];
      await sock.groupParticipantsUpdate(m.chat, [target], "promote");
      results.push({
        ok: true,
        msg: `Berhasil promote @${target.split("@")[0]}`,
      });
      break;
    }
    case "DEMOTE": {
      if (!m.isGroup) return [{ ok: false, msg: "Bukan di grup" }];
      if (!m.isAdmin && !m.isOwner)
        return [{ ok: false, msg: "Kamu bukan admin" }];
      if (!m.isBotAdmin) return [{ ok: false, msg: "Bot bukan admin" }];
      const target = resolveTarget();
      if (!target) return [{ ok: false, msg: "Tag orang yang mau di-demote" }];
      await sock.groupParticipantsUpdate(m.chat, [target], "demote");
      results.push({
        ok: true,
        msg: `Berhasil demote @${target.split("@")[0]}`,
      });
      break;
    }
    case "LEAVE": {
      if (!m.isOwner)
        return [{ ok: false, msg: "Hanya owner yang bisa perintah ini" }];
      if (!m.isGroup) return [{ ok: false, msg: "Bukan di grup" }];
      await sock.groupLeave(m.chat);
      results.push({ ok: true, msg: "Bot keluar dari grup" });
      break;
    }
    case "OPEN": {
      if (!m.isGroup) return [{ ok: false, msg: "Bukan di grup" }];
      if (!m.isAdmin && !m.isOwner)
        return [{ ok: false, msg: "Kamu bukan admin" }];
      if (!m.isBotAdmin) return [{ ok: false, msg: "Bot bukan admin" }];
      await sock.groupSettingUpdate(m.chat, "not_announcement");
      results.push({ ok: true, msg: "Grup dibuka" });
      break;
    }
    case "CLOSE": {
      if (!m.isGroup) return [{ ok: false, msg: "Bukan di grup" }];
      if (!m.isAdmin && !m.isOwner)
        return [{ ok: false, msg: "Kamu bukan admin" }];
      if (!m.isBotAdmin) return [{ ok: false, msg: "Bot bukan admin" }];
      await sock.groupSettingUpdate(m.chat, "announcement");
      results.push({ ok: true, msg: "Grup ditutup" });
      break;
    }
    case "TAGALL": {
      if (!m.isGroup) return [{ ok: false, msg: "Bukan di grup" }];
      if (!m.isAdmin && !m.isOwner)
        return [{ ok: false, msg: "Kamu bukan admin" }];
      const groupMeta = m.groupMetadata || (await sock.groupMetadata(m.chat));
      const members = groupMeta.participants.map((p) => p.id);
      const mentions = members.map((id) => `@${id.split("@")[0]}`).join(" ");
      await sock.sendMessage(
        m.chat,
        {
          text: `📢 *TAG ALL*\n\n${mentions}`,
          mentions: members,
        },
        { quoted: m },
      );
      results.push({ ok: true, msg: "Semua member di-tag" });
      break;
    }
    case "PINS": {
      const query = action.params.query;
      if (!query)
        return [{ ok: false, msg: "Query pencarian tidak ditemukan" }];
      try {
        const data = await _btchdownloader.pinterest.call(void 0, query);
        const pinResults = _optionalChain([data, 'optionalAccess', _11 => _11.result, 'optionalAccess', _12 => _12.result, 'optionalAccess', _13 => _13.result, 'optionalAccess', _14 => _14.slice, 'call', _15 => _15(0, 5)]);
        if (!pinResults || pinResults.length === 0) {
          return [{ ok: false, msg: `Tidak ditemukan gambar untuk: ${query}` }];
        }
        let imagenya = [];
        for (const item of pinResults) {
          const imageUrl =
            item.image_url ||
            _optionalChain([item, 'access', _16 => _16.images, 'optionalAccess', _17 => _17.orig, 'optionalAccess', _18 => _18.url]) ||
            _optionalChain([item, 'access', _19 => _19.images, 'optionalAccess', _20 => _20["736x"], 'optionalAccess', _21 => _21.url]);
          if (!imageUrl) continue;
          try {
            imagenya.push({
              image: { url: imageUrl },
            });
          } catch (e2) {}
        }
        await sock.sendMessage(
          m.chat,
          {
            albumMessage: imagenya,
          },
          { quoted: m },
        );
        results.push({ ok: true, msg: `Mengirim gambar Pinterest: ${query}` });
      } catch (e) {
        results.push({ ok: false, msg: `Gagal cari Pinterest: ${e.message}` });
      }
      break;
    }
    case "ADD": {
      if (!m.isGroup) return [{ ok: false, msg: "Bukan di grup" }];
      if (!m.isAdmin && !m.isOwner)
        return [{ ok: false, msg: "Kamu bukan admin" }];
      if (!m.isBotAdmin) return [{ ok: false, msg: "Bot bukan admin" }];
      let num = action.params.target;
      if (!num)
        return [{ ok: false, msg: "Masukkan nomor yang ingin ditambahkan" }];
      num = num.replace(/[^0-9]/g, "");
      if (num.startsWith("0")) num = "62" + num.slice(1);
      if (num.length < 10) return [{ ok: false, msg: "Nomor tidak valid" }];
      const jid = num + "@s.whatsapp.net";
      const addResult = await sock.groupParticipantsUpdate(
        m.chat,
        [jid],
        "add",
      );
      const status = _optionalChain([addResult, 'optionalAccess', _22 => _22[0], 'optionalAccess', _23 => _23.status]);
      if (status === "200") {
        results.push({ ok: true, msg: `Berhasil menambahkan @${num}` });
      } else if (status === "408") {
        results.push({ ok: true, msg: `Undangan terkirim ke @${num}` });
      } else {
        results.push({
          ok: false,
          msg: `Gagal menambahkan @${num} (${status})`,
        });
      }
      break;
    }
    case "HIDETAG": {
      if (!m.isGroup) return [{ ok: false, msg: "Bukan di grup" }];
      if (!m.isAdmin && !m.isOwner)
        return [{ ok: false, msg: "Kamu bukan admin" }];
      const htMeta = m.groupMetadata || (await sock.groupMetadata(m.chat));
      const htMembers = htMeta.participants.map((p) => p.id);
      const htMsg = action.params.message || "Pengumuman";
      await sock.sendMessage(
        m.chat,
        {
          text: htMsg,
          mentions: htMembers,
        },
        { quoted: m },
      );
      results.push({ ok: true, msg: "Hidetag terkirim" });
      break;
    }
    case "SETNAME": {
      if (!m.isGroup) return [{ ok: false, msg: "Bukan di grup" }];
      if (!m.isAdmin && !m.isOwner)
        return [{ ok: false, msg: "Kamu bukan admin" }];
      if (!m.isBotAdmin) return [{ ok: false, msg: "Bot bukan admin" }];
      const newName = action.params.name;
      if (!newName)
        return [{ ok: false, msg: "Nama grup baru tidak ditemukan" }];
      await sock.groupUpdateSubject(m.chat, newName);
      results.push({ ok: true, msg: `Nama grup diubah ke: ${newName}` });
      break;
    }
    case "SETDESC": {
      if (!m.isGroup) return [{ ok: false, msg: "Bukan di grup" }];
      if (!m.isAdmin && !m.isOwner)
        return [{ ok: false, msg: "Kamu bukan admin" }];
      if (!m.isBotAdmin) return [{ ok: false, msg: "Bot bukan admin" }];
      const newDesc = action.params.desc;
      if (!newDesc)
        return [{ ok: false, msg: "Deskripsi baru tidak ditemukan" }];
      await sock.groupUpdateDescription(m.chat, newDesc);
      results.push({ ok: true, msg: "Deskripsi grup diubah" });
      break;
    }
    case "DELETE": {
      if (!m.quoted)
        return [{ ok: false, msg: "Reply pesan bot yang ingin dihapus" }];
      if (!_optionalChain([m, 'access', _24 => _24.quoted, 'access', _25 => _25.key, 'optionalAccess', _26 => _26.fromMe]))
        return [{ ok: false, msg: "Hanya bisa hapus pesan bot" }];
      await sock.sendMessage(m.chat, { delete: m.quoted.key });
      results.push({ ok: true, msg: "Pesan dihapus" });
      break;
    }
    case "WARN": {
      if (!m.isGroup) return [{ ok: false, msg: "Bukan di grup" }];
      if (!m.isAdmin && !m.isOwner)
        return [{ ok: false, msg: "Kamu bukan admin" }];
      const warnTarget = resolveTarget();
      if (!warnTarget)
        return [{ ok: false, msg: "Tag orang yang mau di-warn" }];
      const db = _ourindatabasejs.getDatabase.call(void 0, );
      const warns = _optionalChain([db, 'access', _27 => _27.getGroup, 'call', _28 => _28(m.chat), 'optionalAccess', _29 => _29.warns]) || {};
      const targetNum = warnTarget.split("@")[0];
      warns[targetNum] = (warns[targetNum] || 0) + 1;
      db.setGroup(m.chat, { warns });
      db.save();
      results.push({
        ok: true,
        msg: `⚠️ Warning ${warns[targetNum]}/3 untuk @${targetNum}`,
      });
      if (warns[targetNum] >= 3) {
        try {
          await sock.groupParticipantsUpdate(m.chat, [warnTarget], "remove");
          warns[targetNum] = 0;
          db.setGroup(m.chat, { warns });
          db.save();
          results.push({
            ok: true,
            msg: `@${targetNum} di-kick karena 3x warning`,
          });
        } catch (e3) {}
      }
      break;
    }
    case "STICKER": {
      let stickerBuffer = null;
      if (m.isImage && m.download) {
        stickerBuffer = await m.download();
      } else if (_optionalChain([m, 'access', _30 => _30.quoted, 'optionalAccess', _31 => _31.isImage]) && _optionalChain([m, 'access', _32 => _32.quoted, 'optionalAccess', _33 => _33.download])) {
        stickerBuffer = await m.quoted.download();
      }
      if (!stickerBuffer)
        return [
          { ok: false, msg: "Kirim atau reply gambar untuk dijadikan sticker" },
        ];
      await sock.sendMessage(
        m.chat,
        {
          sticker: stickerBuffer,
          packname: _optionalChain([_configjs2.default, 'access', _34 => _34.bot, 'optionalAccess', _35 => _35.name]) || "Ourin",
          author: "AutoAI",
        },
        { quoted: m },
      );
      results.push({ ok: true, msg: "Sticker terkirim" });
      break;
    }
    case "ANTILINK": {
      if (!m.isGroup) return [{ ok: false, msg: "Bukan di grup" }];
      if (!m.isAdmin && !m.isOwner)
        return [{ ok: false, msg: "Kamu bukan admin" }];
      const alMode = (action.params.mode || "").toLowerCase();
      if (!["on", "off"].includes(alMode))
        return [{ ok: false, msg: "Mode harus on atau off" }];
      const alDb = _ourindatabasejs.getDatabase.call(void 0, );
      alDb.setGroup(m.chat, { antilink: alMode === "on" });
      alDb.save();
      results.push({
        ok: true,
        msg: `Antilink ${alMode === "on" ? "diaktifkan" : "dinonaktifkan"}`,
      });
      break;
    }
  }

  return results;
}

async function handleAutoAI(m, sock) {
  if (!m.isGroup) return false;
  if (m.fromMe) return false;

  const db = _ourindatabasejs.getDatabase.call(void 0, );
  if (!_optionalChain([db, 'optionalAccess', _36 => _36.db, 'optionalAccess', _37 => _37.data])) return false;
  if (!db.db.data.autoai) db.db.data.autoai = {};
  if (!db.db.data.autoai_global) db.db.data.autoai_global = { enabled: false };

  let autoai = db.db.data.autoai[m.chat];
  let isGlobalMode = false;
  if (autoai && autoai.enabled) {
    // per-group config is active, use it
  } else if (autoai && autoai.enabled === false) {
    // explicit opt-out from global
    return false;
  } else {
    // no per-group config, check global
    const globalCfg = db.db.data.autoai_global;
    if (!globalCfg.enabled) return false;
    isGlobalMode = true;
    if (!globalCfg.sessions) globalCfg.sessions = {};
    autoai = {
      enabled: true,
      character: globalCfg.character || "global",
      characterName: globalCfg.characterName || "Global",
      instruction: globalCfg.instruction,
      responseType: globalCfg.responseType || "text",
      sessions: globalCfg.sessions,
    };
  }

  const botJid = _optionalChain([sock, 'access', _38 => _38.user, 'optionalAccess', _39 => _39.id, 'optionalAccess', _40 => _40.split, 'call', _41 => _41(":"), 'access', _42 => _42[0]]) + "@s.whatsapp.net";
  const botLid = _optionalChain([sock, 'access', _43 => _43.user, 'optionalAccess', _44 => _44.lid]) || null;
  const botNumber = _optionalChain([sock, 'access', _45 => _45.user, 'optionalAccess', _46 => _46.id, 'optionalAccess', _47 => _47.split, 'call', _48 => _48(":"), 'access', _49 => _49[0]]) || "";
  const botFullId = _optionalChain([sock, 'access', _50 => _50.user, 'optionalAccess', _51 => _51.id]) || "";

  if (m.isCommand && m.command === "autoai") return false;

  if (m.isCommand && !m.isOwner) {
    if (autoai.enableCommands) return false;
    return true;
  }

  const isMentioned = _optionalChain([m, 'access', _52 => _52.mentionedJid, 'optionalAccess', _53 => _53.some, 'call', _54 => _54((jid) => {
    if (!jid) return false;
    if (jid === botJid) return true;
    if (jid === botLid) return true;
    if (jid === botFullId) return true;
    if (jid.includes(botNumber)) return true;
    const jidUser = _optionalChain([jid, 'access', _55 => _55.split, 'call', _56 => _56("@"), 'access', _57 => _57[0], 'optionalAccess', _58 => _58.split, 'call', _59 => _59(":"), 'access', _60 => _60[0]]);
    if (jidUser && jidUser === botNumber) return true;
    return false;
  })]);

  let isBotQuoted = false;
  if (m.quoted) {
    const quotedSender = m.quoted.sender || _optionalChain([m, 'access', _61 => _61.quoted, 'access', _62 => _62.key, 'optionalAccess', _63 => _63.participant]) || "";
    const quotedFromMe = _optionalChain([m, 'access', _64 => _64.quoted, 'access', _65 => _65.key, 'optionalAccess', _66 => _66.fromMe]);
    if (quotedSender === botJid) {
      isBotQuoted = true;
    } else if (quotedFromMe) {
      isBotQuoted = true;
    } else if (quotedSender === botFullId) {
      isBotQuoted = true;
    } else if (quotedSender.includes(botNumber)) {
      isBotQuoted = true;
    } else if (botLid && quotedSender === botLid) {
      isBotQuoted = true;
    }
  }

  if (!isBotQuoted && !isMentioned) return false;

  const userMessage = m.body || "";
  const hasImage =
    m.isImage ||
    (m.quoted && (m.quoted.isImage || m.quoted.type === "imageMessage"));

  if (!userMessage && !hasImage) return false;

  const senderNumber = m.sender.split("@")[0];

  if (isOnCooldown(senderNumber)) return false;

  try {
    await sock.sendPresenceUpdate("composing", m.chat);
    setCooldown(senderNumber);

    let imageBuffer = null;
    if (hasImage) {
      try {
        if (m.isImage && m.download) {
          imageBuffer = await m.download();
        } else if (_optionalChain([m, 'access', _67 => _67.quoted, 'optionalAccess', _68 => _68.download])) {
          imageBuffer = await m.quoted.download();
        }
      } catch (e) {
        console.log("[AutoAI] Image download failed:", e.message);
      }
    }

    if (!autoai.sessions) autoai.sessions = {};
    const userSession = autoai.sessions[senderNumber] || { history: [] };
    const history = userSession.history || [];

    let contextParts = [];
    if (m.pushName && m.pushName !== "Unknown") {
      contextParts.push(`User: "${m.pushName}" (${senderNumber})`);
    }
    if (m.isOwner) contextParts.push("User ini adalah OWNER bot.");
    if (m.isAdmin) contextParts.push("User ini adalah ADMIN grup.");

    if (_optionalChain([m, 'access', _69 => _69.mentionedJid, 'optionalAccess', _70 => _70.length]) > 0) {
      const mentionList = m.mentionedJid
        .filter((j) => !j.includes(_optionalChain([sock, 'access', _71 => _71.user, 'optionalAccess', _72 => _72.id, 'optionalAccess', _73 => _73.split, 'call', _74 => _74(":"), 'access', _75 => _75[0]])))
        .map((j) => j)
        .join(", ");
      if (mentionList) contextParts.push(`User menyebut/tag: ${mentionList}`);
    }

    if (imageBuffer) {
      contextParts.push(
        "User mengirimkan sebuah gambar. Analisis gambar tersebut.",
      );
    }

    contextParts.push(userMessage || "(gambar tanpa teks)");

    const fullMessage = contextParts.join("\n");
    const aiMode = autoai.mode || "assistant";
    
    let fullInstruction = autoai.instruction;
    if (aiMode === "assistant") {
      fullInstruction += "\n\n" + SYSTEM_PROMPT_ACTIONS;
    } else {
      fullInstruction += "\n\nHanya lakukan percakapan santai. Jangan memberikan format aksi apa pun. Panggil atau sebut nama user jika diperlukan.";
    }

    saveToHistory(autoai, senderNumber, "user", userMessage || "[gambar]");

    let aiResponse = "";
    try {
      const result = await _geminiVisionjs.chat.call(void 0, {
        message: fullMessage,
        instruction: fullInstruction,
        imageBuffer,
        history,
      });
      aiResponse = result.text || getFallbackResponse();
    } catch (apiError) {
      console.error("[AutoAI API Error]", apiError.message);
      aiResponse = getFallbackResponse();
    }

    const normalizedAiResponse = normalizeStructuredResponse(aiResponse);
    let actions = [];
    let richMessages = [];
    let cleanResponse = normalizedAiResponse;

    if (aiMode === "assistant") {
      const aiActions = parseActions(normalizedAiResponse);
      const intentActions = detectIntentFromMessage(userMessage, m);
      actions = mergeActions(aiActions, intentActions);
      richMessages = parseRichMessage(normalizedAiResponse);
      cleanResponse = cleanRichTags(cleanActionTags(normalizedAiResponse));
    }

    saveToHistory(autoai, senderNumber, "assistant", cleanResponse);
    db.save();

    await sock.sendPresenceUpdate("paused", m.chat);

    const typingDelay = Math.min(cleanResponse.length * 20, 2000);
    await new Promise((r) => setTimeout(r, typingDelay));

    if (autoai.responseType === "voice") {
      try {
        await sock.sendPresenceUpdate("recording", m.chat);
        const execAsync = _util.promisify.call(void 0, _child_process.exec);

        const tempDir = _path2.default.join(process.cwd(), "temp");
        if (!_fs2.default.existsSync(tempDir)) _fs2.default.mkdirSync(tempDir, { recursive: true });

        const apiUrl = `https://firefly.maiku.my.id/api/crikk?apikey=${_configjs2.default.APIkey.firefly}&text=${encodeURIComponent(cleanResponse.substring(0, 500))}&voice=id-ID-ArdiNeural`;
        const response = await _axios2.default.get(apiUrl);
        
        if (!_optionalChain([response, 'access', _76 => _76.data, 'optionalAccess', _77 => _77.status]) || !_optionalChain([response, 'access', _78 => _78.data, 'optionalAccess', _79 => _79.data, 'optionalAccess', _80 => _80.audio])) {
          throw new Error("Gagal generate audio dari API Firefly");
        }
        
        const audioRes = await _axios2.default.get(response.data.data.audio, {
          responseType: "arraybuffer",
          timeout: 30000
        });

        const mp3Path = _path2.default.join(tempDir, `autoai_${Date.now()}.mp3`);
        _fs2.default.writeFileSync(mp3Path, Buffer.from(audioRes.data));

        const oggPath = mp3Path.replace(".mp3", ".ogg");
        try {
          await execAsync(
            `ffmpeg -y -i "${mp3Path}" -c:a libopus -b:a 64k -ac 1 -ar 48000 "${oggPath}"`,
            { timeout: 30000 },
          );
        } catch (e4) {}

        let audioBuffer;
        let mime = "audio/mpeg";
        if (_fs2.default.existsSync(oggPath)) {
          audioBuffer = _fs2.default.readFileSync(oggPath);
          mime = "audio/ogg; codecs=opus";
          try {
            _fs2.default.unlinkSync(oggPath);
          } catch (e5) {}
        } else {
          audioBuffer = _fs2.default.readFileSync(mp3Path);
        }
        try {
          _fs2.default.unlinkSync(mp3Path);
        } catch (e6) {}

        await sock.sendMessage(
          m.chat,
          {
            audio: audioBuffer,
            mimetype: mime,
            ptt: true,
          },
          { quoted: m },
        );

        await sock.sendPresenceUpdate("paused", m.chat);
      } catch (e7) {
        await m.reply(cleanResponse);
      }
    } else {
      let richSent = false;
      let stickerSent = false;
      if (richMessages.length > 0) {
        for (const rich of richMessages) {
          const sent = await sendRichMessage(rich, sock, m.chat, m);
          if (sent) {
            if (rich.type === "STICKER") {
              stickerSent = true;
            } else {
              richSent = true;
            }
          }
        }
      }
      if ((!richSent || stickerSent) && cleanResponse) {
        await m.reply(cleanResponse);
      }
    }

    for (const action of actions) {
      try {
        const results = await executeAction(action, m, sock);
        for (const r of results) {
          if (!r.ok) {
            await m.reply(`⚠️ ${r.msg}`);
          }
        }
      } catch (e) {
        console.error("[AutoAI Action Error]", action.type, e.message);
        await m.reply(`❌ Gagal menjalankan ${action.type}: ${e.message}`);
      }
    }

    return true;
  } catch (error) {
    console.error("[AutoAI Error]", error.message);
    await sock.sendPresenceUpdate("paused", m.chat);
    try {
      await m.reply(getFallbackResponse());
    } catch (e8) {}
    return true;
  }
}

function isAutoAIEnabled(chatId) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  if (!_optionalChain([db, 'optionalAccess', _81 => _81.db, 'optionalAccess', _82 => _82.data, 'optionalAccess', _83 => _83.autoai])) return false;
  return _optionalChain([db, 'access', _84 => _84.db, 'access', _85 => _85.data, 'access', _86 => _86.autoai, 'access', _87 => _87[chatId], 'optionalAccess', _88 => _88.enabled]) || false;
}

function getAutoAICharacter(chatId) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  if (!_optionalChain([db, 'optionalAccess', _89 => _89.db, 'optionalAccess', _90 => _90.data, 'optionalAccess', _91 => _91.autoai])) return null;
  return _optionalChain([db, 'access', _92 => _92.db, 'access', _93 => _93.data, 'access', _94 => _94.autoai, 'access', _95 => _95[chatId], 'optionalAccess', _96 => _96.characterName]) || null;
}

function clearUserSession(chatId, senderNumber) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  if (!_optionalChain([db, 'optionalAccess', _97 => _97.db, 'optionalAccess', _98 => _98.data, 'optionalAccess', _99 => _99.autoai, 'optionalAccess', _100 => _100[chatId], 'optionalAccess', _101 => _101.sessions, 'optionalAccess', _102 => _102[senderNumber]])) return false;
  delete db.db.data.autoai[chatId].sessions[senderNumber];
  db.save();
  return true;
}

exports.handleAutoAI = handleAutoAI; exports.isAutoAIEnabled = isAutoAIEnabled; exports.getAutoAICharacter = getAutoAICharacter; exports.clearUserSession = clearUserSession;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

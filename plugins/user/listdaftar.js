"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

const PAGE_SIZE = 20;

function getRegistrationContextInfo() {
  const saluranId = _optionalChain([_configjs2.default, 'access', _ => _.saluran, 'optionalAccess', _2 => _2.id]) || "120363400911374213@newsletter";
  const saluranName = _optionalChain([_configjs2.default, 'access', _3 => _3.saluran, 'optionalAccess', _4 => _4.name]) || _optionalChain([_configjs2.default, 'access', _5 => _5.bot, 'optionalAccess', _6 => _6.name]) || "Ourin-AI";

  return {
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: 127,
    },
  };
}

function getRegistrationTime(user) {
  const value = _optionalChain([user, 'optionalAccess', _7 => _7.lastRegisteredAt]) || _optionalChain([user, 'optionalAccess', _8 => _8.registeredAt]) || null;
  if (!value) return 0;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function parseListOptions(input) {
  const tokens = String(input || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  let page = 1;
  let search = "";
  let sort = "default";

  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i].toLowerCase();

    if (token === "page" || token === "hal" || token === "halaman") {
      const next = parseInt(tokens[i + 1], 10);
      if (!Number.isNaN(next) && next > 0) {
        page = next;
        i += 1;
      }
      continue;
    }

    if (token === "search" || token === "cari" || token === "nama") {
      const searchTokens = [];
      for (let j = i + 1; j < tokens.length; j += 1) {
        const nextToken = tokens[j].toLowerCase();
        if (
          [
            "page",
            "hal",
            "halaman",
            "search",
            "cari",
            "nama",
            "sort",
            "urut",
          ].includes(nextToken)
        )
          break;
        searchTokens.push(tokens[j]);
        i = j;
      }
      if (searchTokens.length) {
        search = searchTokens.join(" ").trim();
      }
      continue;
    }

    if (token === "sort" || token === "urut") {
      const nextToken = _optionalChain([tokens, 'access', _9 => _9[i + 1], 'optionalAccess', _10 => _10.toLowerCase, 'call', _11 => _11()]);
      if (nextToken === "terbaru" || nextToken === "newest") {
        sort = "terbaru";
        i += 1;
      }
      continue;
    }

    if (token === "terbaru" || token === "newest") {
      sort = "terbaru";
      continue;
    }

    if (/^\d+$/.test(token) && page === 1) {
      page = parseInt(token, 10);
    }
  }

  return { page, search, sort };
}

const pluginConfig = {
  name: "listdaftar",
  alias: ["listuser", "registeredusers", "daftarlist"],
  category: "user",
  description:
    "Ver una lista de usuarios registrados con filtros y paginaciones",
  usage: ".listdaftar [page <nomor>] [search <nama>] [sort terbaru]",
  example: ".listdaftar search zann sort terbaru page 2",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const allUsers = db.getAllUsers();
  const options = parseListOptions(m.text);
  let registeredUsers = Object.values(allUsers).filter((u) => u.isRegistered);

  if (registeredUsers.length === 0) {
    return m.reply(`❌¡Hay un usuario en la lista!`);
  }

  if (options.search) {
    const keyword = options.search.toLowerCase();
    registeredUsers = registeredUsers.filter((user) =>
      String(user.regName || "")
        .toLowerCase()
        .includes(keyword),
    );
  }

  if (options.sort === "terbaru") {
    registeredUsers.sort(
      (a, b) => getRegistrationTime(b) - getRegistrationTime(a),
    );
  }

  if (registeredUsers.length === 0) {
    return m.reply(
      `❌Ningún usuario es lindo con la búsqueda: *${options.search}*`,
    );
  }

  const totalPages = Math.max(1, Math.ceil(registeredUsers.length / PAGE_SIZE));
  const page = Math.min(Math.max(options.page, 1), totalPages);
  const startIndex = (page - 1) * PAGE_SIZE;
  const displayUsers = registeredUsers.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  );

  let text = `📋 *ᴅᴀꜰᴛᴀʀ ᴜsᴇʀ ᴛᴇʀᴅᴀꜰᴛᴀʀ*\n\n`;
  text += `* Resultado total:*${registeredUsers.length}* user\n`;
  text += `Página${page}/${totalPages}*\n`;
  text += `> Urut: *${options.sort === "terbaru" ? "Terbaru" : "Default"}*\n`;
  if (options.search) {
    text += `> Search: *${options.search}*\n`;
  }
  text += `\n`;

  displayUsers.forEach((user, i) => {
    const genderEmoji =
      user.regGender === "Laki-laki"
        ? "👨"
        : user.regGender === "Perempuan"
          ? "👩"
          : "👤";
    const listNumber = startIndex + i + 1;
    const registeredAt = formatDateTime(
      user.lastRegisteredAt || user.registeredAt,
    );
    text += `${listNumber}. ${genderEmoji} *${user.regName || "Unknown"}*\n`;
    text += `   > @${user.jid} | ${user.regAge || "?"}año |${registeredAt}\n`;
  });

  if (totalPages > 1) {
    text += `\n> Usa \`${m.prefix}listdaftar page ${page + 1 > totalPages ? totalPages : page + 1}\`Para otra página.`;
  }

  const mentions = displayUsers.map((u) => u.jid + "@s.whatsapp.net");

  await sock.sendMessage(
    m.chat,
    {
      text,
      mentions,
      contextInfo: {
        mentionedJid: mentions,
        ...getRegistrationContextInfo(),
      },
    },
    { quoted: m },
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

function getRegistrationContextInfo() {
  const saluranId = _optionalChain([_configjs2.default, 'access', _ => _.saluran, 'optionalAccess', _2 => _2.id]) || "120363400911374213@newsletter";
  const saluranName = _optionalChain([_configjs2.default, 'access', _3 => _3.saluran, 'optionalAccess', _4 => _4.name]) || _optionalChain([_configjs2.default, 'access', _5 => _5.bot, 'optionalAccess', _6 => _6.name]) || "Al Miku-AI";

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

function toDateKey(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getRegistrationStats(db) {
  const users = Object.values(db.getAllUsers() || {});
  const todayKey = toDateKey(new Date());

  return {
    totalRegistered: users.filter((user) => _optionalChain([user, 'optionalAccess', _7 => _7.isRegistered])).length,
    registeredToday: users.filter(
      (user) =>
        toDateKey(_optionalChain([user, 'optionalAccess', _8 => _8.lastRegisteredAt]) || _optionalChain([user, 'optionalAccess', _9 => _9.registeredAt])) === todayKey,
    ).length,
    unregisteredToday: users.filter(
      (user) => toDateKey(_optionalChain([user, 'optionalAccess', _10 => _10.unregisteredAt])) === todayKey,
    ).length,
    activeSessions: Object.keys(global.registrationSessions || {}).length,
  };
}

const pluginConfig = {
  name: "sistemdaftar",
  alias: ["regmode", "wajibdaftar", "togglereg"],
  category: "owner",
  description: "Lista de glándulas del sistema y estadísticas de lista",
  usage: ".sistemdaftar <on/off/stats>",
  example: ".sistemdaftar stats",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,

  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _almikudatabasejs.getDatabase.call(void 0, );
  const args = _optionalChain([m, 'access', _11 => _11.text, 'optionalAccess', _12 => _12.trim, 'call', _13 => _13()]) || "";
  const normalizedArgs = args.toLowerCase();

  const currentStatus =
    _nullishCoalesce(_nullishCoalesce(db.setting("registrationRequired"), () => ( _optionalChain([_configjs2.default, 'access', _14 => _14.registration, 'optionalAccess', _15 => _15.enabled]))), () => ( false));
  const stats = getRegistrationStats(db);

  if (!normalizedArgs) {
    return m.reply(
      `⚙️ *sɪsᴛᴇᴍ ᴅᴀꜰᴛᴀʀ*\n\n` +
        `Status: ${currentStatus ? "✅ ON (Wajib Daftar)" : "❌ OFF"}\n\n` +
        `* Estadísticas: *\n` +
        `> Total registered: *${stats.totalRegistered}*\n` +
        `Registro de hoy: *${stats.registeredToday}*\n` +
        `- Hoy no hay registro.${stats.unregisteredToday}*\n` +
        `> Sesi activo: *${stats.activeSessions}*\n\n` +
        `*Usage:*\n` +
        `> \`${m.prefix}sistemdaftar on\` - Wajibkan daftar\n` +
        `> \`${m.prefix}sistemdaftar off\` - Matikan obligatorio registrate\n` +
        `> \`${m.prefix}sistemdaftar stats\`- Mira las estadísticas.\n\n` +
        `Si ON, el usuario debe\`${m.prefix}daftar\`antes de usar el comando`,
    );
  }

  if (normalizedArgs === "stats") {
    await sock.sendMessage(
      m.chat,
      {
        text:
          `📊 *sᴛᴀᴛɪsᴛɪᴋ ᴅᴀꜰᴛᴀʀ*\n\n` +
          `Estatuto del sistema:${currentStatus ? "✅ ON (Wajib Daftar)" : "❌ OFF"}\n\n` +
          `╭┈┈⬡「 📈 *sᴛᴀᴛs* 」\n` +
          `┃ Total registered: *${stats.totalRegistered}*\n` +
          `┃Registros hoy: *${stats.registeredToday}*\n` +
          `┃Desregión hoy: *${stats.unregisteredToday}*\n` +
          `┃Sesión activa: *${stats.activeSessions}*\n` +
          `╰┈┈┈┈┈┈┈┈⬡`,
        contextInfo: getRegistrationContextInfo(),
      },
      { quoted: m },
    );

    await m.react("📊");
    return;
  }

  if (
    normalizedArgs === "on" ||
    normalizedArgs === "1" ||
    normalizedArgs === "true"
  ) {
    db.setting("registrationRequired", true);
    await db.save();

    await sock.sendMessage(
      m.chat,
      {
        text:
          `✅ *sɪsᴛᴇᴍ ᴅᴀꜰᴛᴀʀ ᴅɪᴀᴋᴛɪꜰᴋᴀɴ!*\n\n` +
          `¡Usuario ahora lista antes de usar el comando!\n\n` +
          `> Comando:\`${m.prefix}daftar\``,
        contextInfo: getRegistrationContextInfo(),
      },
      { quoted: m },
    );

    await m.react("✅");
    return;
  }

  if (
    normalizedArgs === "off" ||
    normalizedArgs === "0" ||
    normalizedArgs === "false"
  ) {
    db.setting("registrationRequired", false);
    await db.save();

    await sock.sendMessage(
      m.chat,
      {
        text:
          `❌ *sɪsᴛᴇᴍ ᴅᴀꜰᴛᴀʀ ᴅɪɴᴏɴᴀᴋᴛɪꜰᴋᴀɴ!*\n\n` +
          `El usuario no necesita una lista para usar el comando.`,
        contextInfo: getRegistrationContextInfo(),
      },
      { quoted: m },
    );

    await m.react("❌");
    return;
  }

  return m.reply(
    `❌¡Opción inválida!\n\n> Usa:\`on\`.\`apagado\`, o\`estados\``,
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

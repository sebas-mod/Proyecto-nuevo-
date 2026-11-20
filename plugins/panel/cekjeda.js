"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinrolescpaneljs = require('../../src/lib/ourin-roles-cpanel.js');
var _ourintimejs = require('../../src/lib/ourin-time.js'); var timeHelper = _interopRequireWildcard(_ourintimejs);
const DEFAULT_JEDA = 5 * 60 * 1000;

const pluginConfig = {
  name: "cekjeda",
  alias: ["jedastatus", "statusjeda"],
  category: "panel",
  description: "Cek status jeda panel create",
  usage: ".cekjeda",
  example: ".cekjeda",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

function formatTime(ms) {
  if (ms <= 0) return "0 detik";

  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0)
    return `${hours} jam ${minutes % 60} menit ${seconds % 60} detik`;
  if (minutes > 0) return `${minutes} menit ${seconds % 60} detik`;
  return `${seconds} detik`;
}

function handler(m, { sock }) {
  const hasAccess = _ourinrolescpaneljs.VALID_SERVERS.some((server) =>
    _ourinrolescpaneljs.hasAccessToServer.call(void 0, m.sender, server, m.isOwner),
  );

  if (!hasAccess && !m.isOwner) {
    return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Kamu tidak memiliki akses ke CPanel!`);
  }

  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const jedaMs = _nullishCoalesce(db.setting("panelCreateJeda"), () => ( DEFAULT_JEDA));
  const lastUsed = db.setting("panelCreateLastUsed") || 0;
  const now = Date.now();
  const elapsed = now - lastUsed;
  const remaining = Math.max(0, jedaMs - elapsed);

  let status = "✅ *READY*";
  let statusDesc = "Bisa create panel sekarang!";

  if (jedaMs === 0) {
    status = "⚡ *NO JEDA*";
    statusDesc = "Jeda dinonaktifkan, bebas create!";
  } else if (remaining > 0) {
    status = "🕕 *COOLDOWN*";
    statusDesc = `Tunggu ${formatTime(remaining)} lagi`;
  }

  let text = `⏱️ *sᴛᴀᴛᴜs ᴊᴇᴅᴀ ᴘᴀɴᴇʟ*\n\n`;
  text += `╭┈┈⬡「 📊 *sᴛᴀᴛᴜs* 」\n`;
  text += `┃ ${status}\n`;
  text += `┃ ${statusDesc}\n`;
  text += `╰┈┈⬡\n\n`;

  text += `╭┈┈⬡「 ⚙️ *ᴋᴏɴꜰɪɢ* 」\n`;
  text += `┃ ◦ Jeda: *${jedaMs === 0 ? "OFF" : formatTime(jedaMs)}*\n`;
  text += `┃ ◦ Default: *5 menit*\n`;

  if (lastUsed > 0) {
    const lastUsedTime = timeHelper.fromTimestamp(lastUsed, "HH:mm:ss");
    text += `┃ ◦ Last create: *${lastUsedTime}*\n`;
  }

  if (remaining > 0) {
    text += `┃ ◦ Sisa: *${formatTime(remaining)}*\n`;
  }

  text += `╰┈┈⬡\n\n`;

  if (m.isOwner) {
    text += `> _Owner: gunakan \`${m.prefix}jedacreate\` untuk setting_`;
  }

  return m.reply(text);
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

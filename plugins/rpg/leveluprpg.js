"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
  name: "leveluprpg",
  alias: ["lvluprpg", "rpglevelup"],
  category: "rpg",
  description: "Toggle notifikasi level up RPG",
  usage: ".leveluprpg <on/off>",
  example: ".leveluprpg on",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);
  const args = m.args || [];
  const sub = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);

  if (!user.settings) user.settings = {};

  if (sub === "on") {
    user.settings.rpgLevelupNotif = true;
    db.save();
    return m.reply(`✅ *ʀᴘɢ ʟᴇᴠᴇʟ ᴜᴘ ɴᴏᴛɪꜰ*\n\n` + `> Status: *ON* ✅\n` + `- Recibirá notificaciones de RPG en el momento de la noche!`);
  }

  if (sub === "off") {
    user.settings.rpgLevelupNotif = false;
    db.save();
    return m.reply(`❌ *ʀᴘɢ ʟᴇᴠᴇʟ ᴜᴘ ɴᴏᴛɪꜰ*\n\n` + `> Status: *OFF* ❌\n` + `Para nivel RPG subir Notificaciones desactivadas.`);
  }

  const status = user.settings.rpgLevelupNotif !== false ? "ON ✅" : "OFF ❌";
  return m.reply(
    `🔔 *ʀᴘɢ ʟᴇᴠᴇʟ ᴜᴘ ɴᴏᴛɪꜰ*\n\n` +
      `♪ A Status this moment: ♪${status}*\n\n` +
      `*📋 *ᴜsᴀɢᴇ:*
\n` +
      `> > \`.leveluprpg on\` - Aktifkan\n` +
      `> > \`.leveluprpg off\` - Nonaktifkan\n` +
      ``,
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

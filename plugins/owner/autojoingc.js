"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
  name: "autojoingc",
  alias: ["autojoin", "autojoingroup"],
  category: "owner",
  description: "Auto grupo del enace descodificado en el chat",
  usage: ".autojoingc on/off",
  example: ".autojoingc on",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};
const GROUP_LINK_REGEX = /chat\.whatsapp\.com\/([a-zA-Z0-9]{18,24})/gi;
async function handler(m) {
  const db = _almikudatabasejs.getDatabase.call(void 0, );
  const arg = (_optionalChain([m, 'access', _ => _.args, 'optionalAccess', _2 => _2[0]]) || "").toLowerCase();
  if (!arg || !["on", "off"].includes(arg)) {
    const current = db.setting("autoJoinGc") || false;
    return m.reply(
      `🔗 *AUTO JOIN GROUP*\n\nStatus: *${current ? "ON ✅" : "OFF ❌"}*\n\n\`${m.prefix}autojoingc on\` — aktifkan\n\`${m.prefix}autojoingc off\` —desactiva`,
    );
  }
  const enabled = arg === "on";
  db.setting("autoJoinGc", enabled);
  await db.save();
  m.reply(
    `${enabled ? "✅" : "❌"} Auto join group *${enabled ? "diaktifkan" : "dinonaktifkan"}*`,
  );
}
async function autoJoinDetector(m, sock) {
  const db = _almikudatabasejs.getDatabase.call(void 0, );
  if (!_optionalChain([db, 'optionalAccess', _3 => _3.ready])) return false;
  if (!db.setting("autoJoinGc")) return false;
  if (!m.body) return false;
  const matches = [...m.body.matchAll(GROUP_LINK_REGEX)];
  if (!matches.length) return false;
  let joined = 0;
  for (const match of matches) {
    const code = match[1];
    try {
      const result = await sock.groupAcceptInvite(code);
      if (result) {
        joined++;
      }
    } catch (e) {
      const msg = e.message || String(e);
      if (msg.includes("already") || msg.includes("participant")) {
        await m.reply(`⚠Aquí está el grupo.`);
      } else if (msg.includes("expired") || msg.includes("revoked")) {
        await m.reply(`❌Enlace grupo si expired / revoked`);
      } else {
        await m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
      }
    }
  }
  return joined > 0;
}
exports.config = pluginConfig; exports.handler = handler; exports.autoJoinDetector = autoJoinDetector;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

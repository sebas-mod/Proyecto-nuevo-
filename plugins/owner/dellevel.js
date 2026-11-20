"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _leveljs = require('../user/level.js');

const EXP_PER_LEVEL = 10000;

const pluginConfig = {
  name: "dellevel",
  alias: ["kuranglevel", "removelevel", "dellvl"],
  category: "owner",
  description: "Kurangi level user (via exp)",
  usage: ".dellevel <jumlah> @user",
  example: ".dellevel 5 @user",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

function extractTarget(m) {
  if (m.quoted) return m.quoted.sender;
  if (_optionalChain([m, 'access', _ => _.mentionedJid, 'optionalAccess', _2 => _2.length])) return m.mentionedJid[0];
  return null;
}

async function handler(m, { sock }) {
  const db = _almikudatabasejs.getDatabase.call(void 0, );
  const args = m.args;

  const numArg = args.find((a) => !isNaN(a) && !a.startsWith("@"));
  let levels = parseInt(numArg) || 0;

  let targetJid = await extractTarget(m);

  if (!targetJid && levels > 0) {
    targetJid = m.sender;
  }

  if (!targetJid || levels <= 0) {
    return m.reply(
      `📊 *ᴅᴇʟ ʟᴇᴠᴇʟ*\n\n` +
        `╭┈┈⬡「 📋 *ᴜsᴀɢᴇ* 」\n` +
        `┃ > \`.dellevel <jumlah>\` - ke diri sendiri\n` +
        `┃•\`- Dellevel.<jumlah>@ usuario\`- A otra persona.\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `> Ejemplo:\`${m.prefix}dellevel 5\``,
    );
  }

  const user = db.getUser(targetJid) || db.setUser(targetJid);

  const oldLevel = _leveljs.calculateLevel.call(void 0, user.exp || 0);
  const expToRemove = levels * EXP_PER_LEVEL;
  user.exp = Math.max(0, (user.exp || 0) - expToRemove);
  const newLevel = _leveljs.calculateLevel.call(void 0, user.exp);

  db.save();
  await m.react("✅");

  await m.reply(
    `✅ *ʟᴇᴠᴇʟ ᴅɪᴋᴜʀᴀɴɢɪ*\n\n` +
      `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
      `┃ 👤 User: @${targetJid.split("@")[0]}\n` +
      `┃ ➖Menos: *-${levels} Level*\n` +
      `┃ 🚄 Exp Removed: *-${expToRemove.toLocaleString("es-AR")}*\n` +
      `┃ 📊 Level: *${oldLevel} → ${newLevel}*\n` +
      `┃ ${_leveljs.getRole.call(void 0, newLevel)}\n` +
      `╰┈┈┈┈┈┈┈┈⬡`,
    { mentions: [targetJid] },
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

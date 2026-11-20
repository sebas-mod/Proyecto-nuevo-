"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourin = require('ourin');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourincontextjs = require('../../src/lib/ourin-context.js');

const pluginConfig = {
  name: "tam",
  alias: ["topactive", "topmember"],
  category: "group",
  description: "Lihat top member paling aktif di grup",
  usage: ".tam <jumlah>",
  example: ".tam 10",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const limit = Math.min(Math.max(parseInt(m.text) || 10, 1), 20);
  const group = db.getGroup(m.chat) || {};
  const chatName = group.name || "Grup";
  const chatStats = group.chatStats || {};

  const sorted = Object.entries(chatStats)
    .map(([jid, d]) => ({ jid, count: d.count || 0, name: d.name || null }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  if (!sorted.length) {
    return m.reply(
      `📊 *ᴛᴏᴘ ᴀᴄᴛɪᴠᴇ ᴍᴇᴍʙᴇʀ*\n\n` + `- Belum ada data aktivitas di grup ini`,
    );
  }

  const pollVotes = sorted.map((u, i) => {
    const rank = i + 1;
    const user = db.getUser(u.jid);
    const name = u.name || _optionalChain([user, 'optionalAccess', _ => _.name]) || u.jid.split("@")[0];
    return {
      optionName: `${rank}. ${name}${i === 0 ? " 🏆" : ""}`,
      optionVoteCount: u.count,
    };
  });

  const content = {
    pollResultSnapshotMessage: {
      name: `top ${limit} member active all time!\nat ${chatName}`,
      pollVotes,
      pollType: 0,
      contextInfo: {
        ..._ourincontextjs.saluranCtx.call(void 0, ),
      },
    },
  };

  const msg = _ourin.generateWAMessageFromContent.call(void 0, m.chat, content, {});
  await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

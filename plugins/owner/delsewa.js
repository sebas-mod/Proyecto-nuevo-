"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourincontextjs = require('../../src/lib/ourin-context.js');
const pluginConfig = {
  name: "delsewa",
  alias: ["sewadel", "hapussewa", "removesewa"],
  category: "owner",
  description: "Hapus grup dari whitelist sewa",
  usage: ".delsewa <link/id grup>",
  example: ".delsewa https://chat.whatsapp.com/xxx",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function resolveGroupId(sock, input) {
  if (input.includes("chat.whatsapp.com/")) {
    const inviteCode = _optionalChain([input, 'access', _ => _.split, 'call', _2 => _2("chat.whatsapp.com/"), 'access', _3 => _3[1], 'optionalAccess', _4 => _4.split, 'call', _5 => _5(/[\s?]/), 'access', _6 => _6[0]]);
    try {
      const metadata = await sock.groupGetInviteInfo(inviteCode);
      if (_optionalChain([metadata, 'optionalAccess', _7 => _7.id])) return { id: metadata.id, name: metadata.subject };
    } catch (e) {}
    return null;
  }
  return { id: input.includes("@g.us") ? input : input + "@g.us", name: null };
}

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const input = _optionalChain([m, 'access', _8 => _8.text, 'optionalAccess', _9 => _9.trim, 'call', _10 => _10()]);

  if (!db.db.data.sewa) {
    db.db.data.sewa = { enabled: false, groups: {} };
    db.db.write();
  }

  let groupId = null;
  let groupName = null;

  if (!input) {
    if (!m.isGroup) {
      return m.reply(
        `📝 *HAPUS SEWA*\n\n` +
          `Dari private: *${m.prefix}delsewa <link/id>*\n` +
          `Dari grup: ketik *${m.prefix}delsewa* langsung di grup\n\n` +
          `Contoh:\n` +
          `• ${m.prefix}delsewa https://chat.whatsapp.com/xxx\n` +
          `• ${m.prefix}delsewa 120363xxx\n\n` +
          `⚠️ Jika sewabot aktif, bot akan otomatis keluar dari grup yang dihapus`,
      );
    }
    groupId = m.chat;
  } else {
    const result = await resolveGroupId(sock, input);
    if (!result)
      return m.reply(`❌ Link tidak valid atau grup tidak ditemukan`);
    groupId = result.id;
    groupName = result.name;
  }

  if (!groupId) return m.reply(`❌ Tidak dapat menentukan grup`);

  const sewaData = db.db.data.sewa.groups[groupId];
  if (!sewaData)
    return m.reply(
      `❌ Grup tidak terdaftar dalam sistem sewa\n\nLihat daftar: *${m.prefix}listsewa*`,
    );

  groupName = groupName || sewaData.name || groupId.split("@")[0];

  delete db.db.data.sewa.groups[groupId];
  db.db.write();

  await m.react("✅");
  await m.reply(
    `✅ *SEWA DIHAPUS*\n\nGrup: *${groupName}*\nID: ${groupId.split("@")[0]}`,
  );

  if (db.db.data.sewa.enabled) {
    try {
      await sock.sendText(
        groupId,
        `⛔ Grup ini telah dihapus dari whitelist sewa.\nBot akan meninggalkan grup.\n\nHubungi owner untuk sewa ulang.`,
        null,
        {
          contextInfo: _ourincontextjs.saluranCtx.call(void 0, ),
        },
      );
      await new Promise((r) => setTimeout(r, 2000));
      await sock.groupLeave(groupId);
    } catch (e2) {}
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

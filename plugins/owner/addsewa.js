"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourintimejs = require('../../src/lib/ourin-time.js'); var timeHelper = _interopRequireWildcard(_ourintimejs);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourincontextjs = require('../../src/lib/ourin-context.js');
const pluginConfig = {
  name: "addsewa",
  alias: ["sewaadd", "tambahsewa"],
  category: "owner",
  description: "Tambah grup ke whitelist sewa + auto join",
  usage: ".addsewa <link/id grup> <durasi>",
  example: ".addsewa https://chat.whatsapp.com/xxx 30d",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function parseDuration(str) {
  if (
    ["lifetime", "permanent", "forever", "unlimited"].includes(
      str.toLowerCase(),
    )
  )
    return Infinity;
  const match = str.match(/^(\d+)([iIdDmMyYhH])$/);
  if (!match) return null;
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  const multiplier = {
    i: 60000,
    h: 3600000,
    d: 86400000,
    m: 2592000000,
    y: 31536000000,
  };
  return multiplier[unit] ? Date.now() + value * multiplier[unit] : null;
}

function formatDuration(str) {
  if (
    ["lifetime", "permanent", "forever", "unlimited"].includes(
      str.toLowerCase(),
    )
  )
    return "Permanent";
  const match = str.match(/^(\d+)([iIdDmMyYhH])$/);
  if (!match) return str;
  const units = { i: "menit", h: "jam", d: "hari", m: "bulan", y: "tahun" };
  return `${match[1]} ${units[match[2].toLowerCase()] || match[2]}`;
}

async function resolveGroupId(sock, input) {
  if (input.includes("chat.whatsapp.com/")) {
    const inviteCode = _optionalChain([input, 'access', _ => _.split, 'call', _2 => _2("chat.whatsapp.com/"), 'access', _3 => _3[1], 'optionalAccess', _4 => _4.split, 'call', _5 => _5(/[\s?]/), 'access', _6 => _6[0]]);
    if (!inviteCode) return null;
    try {
      const metadata = await sock.groupGetInviteInfo(inviteCode);
      console.log(metadata);
      if (!_optionalChain([metadata, 'optionalAccess', _7 => _7.id])) return null;
      return {
        id: metadata.id,
        name: metadata.subject || "Unknown",
        inviteCode,
      };
    } catch (e2) {
      return null;
    }
  }
  const groupId = input.includes("@g.us") ? input : input + "@g.us";
  try {
    const metadata = await sock.groupMetadata(groupId);
    return {
      id: groupId,
      name: _optionalChain([metadata, 'optionalAccess', _8 => _8.subject]) || "Unknown",
      inviteCode: null,
    };
  } catch (e3) {
    return { id: groupId, name: "Unknown", inviteCode: null };
  }
}

async function tryJoinGroup(sock, inviteCode, groupId) {
  if (!inviteCode)
    return {
      joined: false,
      reason: "Tidak ada invite code, tambahkan bot secara manual",
    };
  try {
    const botJid = _optionalChain([sock, 'access', _9 => _9.user, 'optionalAccess', _10 => _10.id, 'optionalAccess', _11 => _11.split, 'call', _12 => _12(":"), 'access', _13 => _13[0]]) + "@s.whatsapp.net";
    const metadata = await sock.groupMetadata(groupId).catch(() => null);
    if (metadata) {
      const isMember = _optionalChain([metadata, 'access', _14 => _14.participants, 'optionalAccess', _15 => _15.some, 'call', _16 => _16((p) => {
        const pJid = _optionalChain([p, 'access', _17 => _17.id, 'optionalAccess', _18 => _18.split, 'call', _19 => _19(":"), 'access', _20 => _20[0]]) + "@s.whatsapp.net";
        return pJid === botJid || p.id === botJid;
      })]);
      if (isMember) return { joined: true, reason: "Bot sudah ada di grup" };
    }
    await sock.groupAcceptInvite(inviteCode);
    return { joined: true, reason: "Bot berhasil join grup" };
  } catch (e) {
    return { joined: false, reason: e.message || "Gagal join grup" };
  }
}

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  if (!db.db.data.sewa) {
    db.db.data.sewa = { enabled: false, groups: {} };
    db.db.write();
  }

  const args = m.args;
  if (args.length < 2) {
    return m.reply(
      `📝 *TAMBAH SEWA*\n\n` +
        `Format: *${m.prefix}addsewa <link/id> <durasi>*\n\n` +
        `*FORMAT DURASI:*\n` +
        `• 30i = 30 menit\n` +
        `• 12h = 12 jam\n` +
        `• 7d = 7 hari\n` +
        `• 1m = 1 bulan (30 hari)\n` +
        `• 1y = 1 tahun\n` +
        `• lifetime = Permanent\n\n` +
        `*INPUT GRUP:*\n` +
        `• Link: https://chat.whatsapp.com/xxx\n` +
        `• ID: 120363xxx@g.us\n\n` +
        `*CONTOH:*\n` +
        `• ${m.prefix}addsewa https://chat.whatsapp.com/xxx 30d\n` +
        `• ${m.prefix}addsewa 120363xxx 1m\n\n` +
        `💡 Jika pakai link, bot akan otomatis join ke grup tersebut!`,
    );
  }

  const input = args[0];
  const durationStr = args[1];
  const expiredAt = parseDuration(durationStr);

  if (!expiredAt)
    return m.reply(
      `❌ Format durasi tidak valid\n\nContoh: 7d, 1m, 1y, lifetime`,
    );

  await m.react("🕕");

  try {
    const result = await resolveGroupId(sock, input);
    if (!result) {
      await m.react("❌");
      return m.reply(`❌ Grup tidak ditemukan atau link tidak valid`);
    }

    const { id: groupId, name: groupName, inviteCode } = result;
    const isLifetime = expiredAt === Infinity;

    db.db.data.sewa.groups[groupId] = {
      name: groupName,
      addedAt: Date.now(),
      expiredAt: isLifetime ? 0 : expiredAt,
      isLifetime,
      addedBy: m.sender,
    };
    db.db.write();

    const expiredStr = isLifetime
      ? "Permanent"
      : timeHelper.fromTimestamp(expiredAt, "D MMMM YYYY HH:mm");

    let text = `✅ *SEWA BERHASIL DITAMBAHKAN*\n\n`;
    text += `Grup: *${groupName}*\n`;
    text += `ID: ${groupId.split("@")[0]}\n`;
    text += `Durasi: *${formatDuration(durationStr)}*\n`;
    text += `Expired: *${expiredStr}*\n\n`;

    const joinResult = await tryJoinGroup(sock, inviteCode, groupId);

    if (joinResult.joined) {
      text += `✅ ${joinResult.reason}`;
      try {
        await new Promise((r) => setTimeout(r, 2000));
        await sock.sendText(
          groupId,
          `👋 *Halo Semuanya!*, perkenalkan, aku ${_optionalChain([_configjs2.default, 'access', _21 => _21.bot, 'optionalAccess', _22 => _22.name])}\n\n- Masa sewa: *${formatDuration(durationStr)}*\n- Aku akan keluar pada: *${expiredStr}*\n\nKetik *${m.prefix}menu* untuk melihat fitur dari bot ini.`,
          null,
          {
            contextInfo: _ourincontextjs.saluranCtx.call(void 0, ),
          },
        );
      } catch (e4) {}
    } else {
      text += `⚠️ Auto-join gagal: ${joinResult.reason}\nTambahkan bot ke grup secara manual.`;
    }

    await m.react("✅");
    return m.reply(text);
  } catch (error) {
    await m.react("☢");
    await m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

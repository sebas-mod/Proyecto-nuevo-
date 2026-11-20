"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourintimejs = require('../../src/lib/ourin-time.js'); var timeHelper = _interopRequireWildcard(_ourintimejs);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourincontextjs = require('../../src/lib/ourin-context.js');
const pluginConfig = {
  name: "renewsewa",
  alias: ["perpanjangsewa", "extendsewa"],
  category: "owner",
  description: "Duración creciente del alquiller grupo",
  usage: ".renewsewa <link/id grup> <durasi>",
  example: ".renewsewa https://chat.whatsapp.com/xxx 30d",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function parseDurationMs(str) {
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
  return multiplier[unit] ? value * multiplier[unit] : null;
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
      if (!_optionalChain([metadata, 'optionalAccess', _7 => _7.id])) return null;
      return { id: metadata.id, name: metadata.subject || "Unknown" };
    } catch (e) {
      return null;
    }
  }
  const groupId = input.includes("@g.us") ? input : input + "@g.us";
  return { id: groupId, name: null };
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
      `📝*Renovar Alquiler*\n\n` +
        `Formato: *${m.prefix}renewsewa <link/id> <durasi>*\n\n` +
        `*Formato Duración:*\n` +
        `• 30i = 30 menit\n` +
        `• 12h = 12 jam\n` +
        `• 7d = 7 hari\n` +
        `• 1m = 1 bulan\n` +
        `• 1y = 1 tahun\n` +
        `• lifetime = Permanent\n\n` +
        `*Ejemplo:*\n` +
        `• ${m.prefix}renewsewa https://chat.whatsapp.com/xxx 30d\n` +
        `• ${m.prefix}renewsewa 120363xxx 1m\n\n` +
        `💡La duración se mina al tiempo existente, no el reajuste`,
    );
  }

  const input = args[0];
  const durationStr = args[1];
  const durationMs = parseDurationMs(durationStr);

  if (!durationMs)
    return m.reply(
      `❌Duración de la grasa inválida\nPassah: 7d, 1m, 1y, lifetyme`,
    );

  await m.react("🕕");

  try {
    const result = await resolveGroupId(sock, input);
    if (!result) {
      await m.react("❌");
      return m.reply(`❌Grup no encontrado`);
    }

    const { id: groupId } = result;
    const existing = db.db.data.sewa.groups[groupId];

    if (!existing) {
      await m.react("❌");
      return m.reply(
        `❌Grup no está registrado\nUsa *${m.prefix}addsewa * para añadir`,
      );
    }

    if (durationMs === Infinity) {
      existing.expiredAt = 0;
      existing.isLifetime = true;
    } else {
      if (existing.isLifetime) {
        await m.react("❌");
        return m.reply(`❌Este Grupo si es permanente, no hay necessidad de extierna`);
      }
      const baseTime =
        existing.expiredAt > Date.now() ? existing.expiredAt : Date.now();
      existing.expiredAt = baseTime + durationMs;
      existing.isLifetime = false;
    }

    existing.renewedAt = Date.now();
    existing.renewedBy = m.sender;
    if (existing.status) delete existing.status;
    db.db.write();

    const groupName = existing.name || groupId.split("@")[0];
    const expiredStr = existing.isLifetime
      ? "Permanent"
      : timeHelper.fromTimestamp(existing.expiredAt, "D MMMM YYYY HH:mm");

    await m.react("✅");

    let text = `✅*Alquiler DIPERPANJANG*\n\n`;
    text += `Grupo: *${groupName}*\n`;
    text += `Adicional: *${formatDuration(durationStr)}*\n`;
    text += `Exnuevo pirado: *${expiredStr}*`;

    try {
      await sock.sendText(
        groupId,
        `📢¡El bot de alquiler se ha extendido!\n\nAdicional: *${formatDuration(durationStr)}*\nExnuevo pirado: *${expiredStr}*`,
        null,
        {
          contextInfo: _ourincontextjs.saluranCtx.call(void 0, ),
        },
      );
    } catch (e2) {}

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

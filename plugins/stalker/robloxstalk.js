"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "robloxstalk",
  alias: ["rblxstalk", "rbxstalk", "stalkroblox", "stalkrbx"],
  category: "stalker",
  description: "Stalk akun Roblox berdasarkan username",
  usage: ".robloxstalk <username>",
  example: ".robloxstalk Linkmon99",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

async function Roblox(username) {
  const search = await fetch(
    `https://users.roblox.com/v1/users/search?keyword=${username}&limit=10`,
  );
  const searchJson = await search.json();

  if (!searchJson.data || !searchJson.data.length) {
    return { error: "Usuario no encontrado" };
  }

  const user = searchJson.data[0];
  const userId = user.id;

  const [
    detail,
    avatar,
    followers,
    following,
    friends,
    groups,
    games,
    badges,
    inventory,
  ] = await Promise.all([
    fetch(`https://users.roblox.com/v1/users/${userId}`).then((r) => r.json()),
    fetch(
      `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=Png`,
    ).then((r) => r.json()),
    fetch(`https://friends.roblox.com/v1/users/${userId}/followers/count`).then(
      (r) => r.json(),
    ),
    fetch(
      `https://friends.roblox.com/v1/users/${userId}/followings/count`,
    ).then((r) => r.json()),
    fetch(`https://friends.roblox.com/v1/users/${userId}/friends/count`).then(
      (r) => r.json(),
    ),
    fetch(`https://groups.roblox.com/v2/users/${userId}/groups/roles`).then(
      (r) => r.json(),
    ),
    fetch(`https://games.roblox.com/v2/users/${userId}/games?limit=50`).then(
      (r) => r.json(),
    ),
    fetch(`https://badges.roblox.com/v1/users/${userId}/badges?limit=50`).then(
      (r) => r.json(),
    ),
    fetch(
      `https://inventory.roblox.com/v1/users/${userId}/assets/collectibles?limit=50`,
    )
      .then((r) => r.json())
      .catch(() => null),
  ]);

  let presence = null;
  try {
    const pres = await fetch(`https://presence.roblox.com/v1/presence/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds: [userId] }),
    });
    const presJson = await pres.json();
    presence = _optionalChain([presJson, 'access', _ => _.userPresences, 'optionalAccess', _2 => _2[0]]) || null;
  } catch (e2) {}

  return {
    id: detail.id,
    username: detail.name,
    displayName: detail.displayName,
    description: detail.description,
    created: detail.created,
    verified: user.hasVerifiedBadge,
    avatar: _optionalChain([avatar, 'access', _3 => _3.data, 'access', _4 => _4[0], 'optionalAccess', _5 => _5.imageUrl]),
    social: {
      followers: followers.count,
      following: following.count,
      friends: friends.count,
    },
    groups: groups.data,
    games: games.data,
    badges: badges.data,
    inventory: _optionalChain([inventory, 'optionalAccess', _6 => _6.data]) || "primate / no disponible",
    presence,
  };
}

const presenceType = {
  0: "Offline",
  1: "Online",
  2: "In Game",
  3: "In Studio",
};

async function handler(m, { sock }) {
  const username = _optionalChain([m, 'access', _7 => _7.args, 'access', _8 => _8[0], 'optionalAccess', _9 => _9.trim, 'call', _10 => _10()]);

  if (!username) {
    return m.reply(
      `🎮 *ʀᴏʙʟᴏx sᴛᴀʟᴋ*\n\n` +
        `Pon un manto de usuariox\n\n` +
        `\`Contoh: ${m.prefix}robloxstalk Linkmon99\``,
    );
  }

  m.react("🔍");

  try {
    const res = await Roblox(username);

    if (res.error) {
      m.react("❌");
      return m.reply(`❌ Username *${username}* not found`);
    }

    const topGroups =
      _optionalChain([res, 'access', _11 => _11.groups
, 'optionalAccess', _12 => _12.slice, 'call', _13 => _13(0, 5)
, 'access', _14 => _14.map, 'call', _15 => _15(
          (v) =>
            `  ◦ ${v.group.name} (${v.group.memberCount} members) — ${v.role.name}`,
        )
, 'access', _16 => _16.join, 'call', _17 => _17("\n")]) || "  ◦No hay";

    const topGames =
      _optionalChain([res, 'access', _18 => _18.games
, 'optionalAccess', _19 => _19.slice, 'call', _20 => _20(0, 5)
, 'access', _21 => _21.map, 'call', _22 => _22(
          (v) =>
            `  ◦ ${v.name} (${(v.placeVisits || 0).toLocaleString()} visits)`,
        )
, 'access', _23 => _23.join, 'call', _24 => _24("\n")]) || "  ◦No hay";

    const topBadges =
      _optionalChain([res, 'access', _25 => _25.badges
, 'optionalAccess', _26 => _26.slice, 'call', _27 => _27(0, 5)
, 'access', _28 => _28.map, 'call', _29 => _29(
          (v) =>
            `  ◦ ${v.name} (${_optionalChain([v, 'access', _30 => _30.statistics, 'optionalAccess', _31 => _31.awardedCount, 'optionalAccess', _32 => _32.toLocaleString, 'call', _33 => _33()]) || 0} awarded)`,
        )
, 'access', _34 => _34.join, 'call', _35 => _35("\n")]) || "  ◦No hay";

    const topInventory = Array.isArray(res.inventory)
      ? res.inventory
          .slice(0, 5)
          .map(
            (v) =>
              `  ◦ ${v.name} (RAP: ${_optionalChain([v, 'access', _36 => _36.recentAveragePrice, 'optionalAccess', _37 => _37.toLocaleString, 'call', _38 => _38()]) || "-"})`,
          )
          .join("\n")
      : `  ◦ ${res.inventory}`;

    const presInfo = res.presence
      ? `Status: ${presenceType[res.presence.userPresenceType] || res.presence.userPresenceType}\n  Last Location: ${res.presence.lastLocation || "-"}\n  PlaceId: ${res.presence.placeId || "-"}\n  GameId: ${res.presence.gameId || "-"}`
      : "no disponible";

    const caption =
      `🎮 *ʀᴏʙʟᴏx sᴛᴀʟᴋ*\n\n` +
      `*PROFILE*\n` +
      `🆔 *ID*: ${res.id}\n` +
      `🎄 *Username*: ${res.username}\n` +
      `📛 *Display*: ${res.displayName}\n` +
      `✅ *Verified*: ${res.verified ? "Ya" : "Tidak"}\n` +
      `📅 *Created*: ${res.created ? new Date(res.created).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" }) : "-"}\n` +
      `\n` +
      `*SOCIAL*\n` +
      `👥 *Friends*: ${_optionalChain([res, 'access', _39 => _39.social, 'access', _40 => _40.friends, 'optionalAccess', _41 => _41.toLocaleString, 'call', _42 => _42()])}\n` +
      `👤 *Followers*: ${_optionalChain([res, 'access', _43 => _43.social, 'access', _44 => _44.followers, 'optionalAccess', _45 => _45.toLocaleString, 'call', _46 => _46()])}\n` +
      `➕ *Following*: ${_optionalChain([res, 'access', _47 => _47.social, 'access', _48 => _48.following, 'optionalAccess', _49 => _49.toLocaleString, 'call', _50 => _50()])}\n` +
      `\n` +
      `*PRESENCE*\n` +
      `${presInfo}\n` +
      `\n\n` +
      `📝 *Bio:*\n${_optionalChain([res, 'access', _51 => _51.description, 'optionalAccess', _52 => _52.substring, 'call', _53 => _53(0, 300)]) || "-"}\n` +
      `👥 *Groups* (${_optionalChain([res, 'access', _54 => _54.groups, 'optionalAccess', _55 => _55.length]) || 0}):\n${topGroups}\n` +
      `🎮 *Games* (${_optionalChain([res, 'access', _56 => _56.games, 'optionalAccess', _57 => _57.length]) || 0}):\n${topGames}\n` +
      `🏆 *Badges* (${_optionalChain([res, 'access', _58 => _58.badges, 'optionalAccess', _59 => _59.length]) || 0}):\n${topBadges}\n` +
      `🎒 *Inventory*:\n${topInventory}\n` +
      `🔗 https://roblox.com/users/${res.id}/profile`;

    m.react("✅");

    if (res.avatar) {
      await sock.sendMessage(
        m.chat,
        {
          image: { url: res.avatar },
          caption,
        },
        { quoted: m },
      );
    } else {
      await m.reply(caption);
    }
  } catch (e) {
    m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

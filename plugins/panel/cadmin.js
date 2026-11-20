"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinlidjs = require('../../src/lib/ourin-lid.js');
var _ourinrolescpaneljs = require('../../src/lib/ourin-roles-cpanel.js');
var _ourintimejs = require('../../src/lib/ourin-time.js'); var timeHelper = _interopRequireWildcard(_ourintimejs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const allCommands = _ourinrolescpaneljs.VALID_SERVERS.map((v) => `cadmin${v}`);
const allAliases = _ourinrolescpaneljs.VALID_SERVERS.map((v) => `createadmin${v}`);

const pluginConfig = {
  name: allCommands,
  alias: allAliases,
  category: "panel",
  description: "Buat admin panel baru (v1-v5)",
  usage: ".cadminv1 username atau .cadminv2 username,628xxx",
  example: ".cadminv1 adminku,628xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function cleanJid(jid) {
  if (!jid) return null;
  if (_ourinlidjs.isLid.call(void 0, jid)) jid = _ourinlidjs.lidToJid.call(void 0, jid);
  return jid.includes("@") ? jid : jid + "@s.whatsapp.net";
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function formatDate() {
  return timeHelper.formatDateTime("D MMMM YYYY HH:mm");
}

function parseServerVersion(cmd) {
  const match = cmd.match(/v([1-5])$/i);
  if (!match) return { server: "v1", serverKey: "s1" };
  return { server: "v" + match[1], serverKey: "s" + match[1] };
}

function getServerConfig(pteroConfig, serverKey) {
  const serverConfigs = {
    s1: pteroConfig.server1,
    s2: pteroConfig.server2,
    s3: pteroConfig.server3,
    s4: pteroConfig.server4,
    s5: pteroConfig.server5,
  };
  return serverConfigs[serverKey] || null;
}

function validateConfig(serverConfig) {
  const missing = [];
  if (!_optionalChain([serverConfig, 'optionalAccess', _ => _.domain])) missing.push("domain");
  if (!_optionalChain([serverConfig, 'optionalAccess', _2 => _2.apikey])) missing.push("apikey (PTLA)");
  return missing;
}

function getAvailableServers(pteroConfig) {
  const available = [];
  for (let i = 1; i <= 5; i++) {
    const cfg = pteroConfig[`server${i}`];
    if (_optionalChain([cfg, 'optionalAccess', _3 => _3.domain]) && _optionalChain([cfg, 'optionalAccess', _4 => _4.apikey])) available.push(`v${i}`);
  }
  return available;
}

async function handler(m, { sock }) {
  const pteroConfig = _configjs2.default.pterodactyl;

  const { server: serverVersion, serverKey } = parseServerVersion(m.command);
  const serverLabel = serverVersion.toUpperCase();

  if (!_ourinrolescpaneljs.hasFullAccess.call(void 0, m.sender, serverVersion, m.isOwner)) {
    const userRole = _ourinrolescpaneljs.getUserRole.call(void 0, m.sender, serverVersion);
    return m.reply(
      `❌ *ᴀᴋsᴇs ᴅɪᴛᴏʟᴀᴋ*\n\n` +
        `> Kamu tidak punya akses ke *${serverLabel}*\n` +
        `> Role kamu: *${userRole || "Tidak ada"}*`,
    );
  }

  const serverConfig = getServerConfig(pteroConfig, serverKey);
  const missingConfig = validateConfig(serverConfig);

  if (missingConfig.length > 0) {
    const available = getAvailableServers(pteroConfig);
    let txt = `⚠️ *sᴇʀᴠᴇʀ ${serverLabel} ʙᴇʟᴜᴍ ᴋᴏɴꜰɪɢ*\n\n`;
    if (available.length > 0) {
      txt += `> Server tersedia: *${available.join(", ")}*\n`;
      txt += `> Contoh: \`${m.prefix}cadmin${available[0]} username\``;
    } else {
      txt += `> Isi di \`config.js\` bagian \`pterodactyl.server1\``;
    }
    return m.reply(txt);
  }

  let targetUser = null;
  let username = null;
  const args = _optionalChain([m, 'access', _5 => _5.text, 'optionalAccess', _6 => _6.trim, 'call', _7 => _7()]) || "";

  if (args.includes(",")) {
    const parts = args.split(",");
    username = _optionalChain([parts, 'access', _8 => _8[0], 'optionalAccess', _9 => _9.trim, 'call', _10 => _10(), 'access', _11 => _11.toLowerCase, 'call', _12 => _12()]);
    let nomor = _optionalChain([parts, 'access', _13 => _13[1], 'optionalAccess', _14 => _14.trim, 'call', _15 => _15(), 'access', _16 => _16.replace, 'call', _17 => _17(/[^0-9]/g, "")]);
    if (nomor) targetUser = nomor + "@s.whatsapp.net";
  } else if (args) {
    username = args.trim().toLowerCase();
  }

  if (!username) {
    const available = getAvailableServers(pteroConfig);
    return m.reply(
      `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
        `> \`${m.prefix}${m.command} username\`\n` +
        `> \`${m.prefix}${m.command} username,628xxx\`\n` +
        `> Reply/mention user\n\n` +
        `> Server tersedia: *${available.join(", ") || "none"}*`,
    );
  }

  if (!/^[a-z0-9_]{3,16}$/.test(username)) {
    return m.reply(
      `❌ Username hanya boleh huruf kecil, angka, underscore (3-16 karakter).`,
    );
  }

  if (!targetUser) {
    if (_optionalChain([m, 'access', _18 => _18.quoted, 'optionalAccess', _19 => _19.sender])) {
      targetUser = cleanJid(m.quoted.sender);
    } else if (_optionalChain([m, 'access', _20 => _20.mentionedJid, 'optionalAccess', _21 => _21.length]) > 0) {
      targetUser = cleanJid(m.mentionedJid[0]);
    } else {
      targetUser = cleanJid(m.sender);
    }
  }

  if (!targetUser) {
    return m.reply(`❌ Tidak dapat menentukan nomor target.`);
  }

  try {
    const [onWa] = await sock.onWhatsApp(targetUser.split("@")[0]);
    if (!_optionalChain([onWa, 'optionalAccess', _22 => _22.exists])) {
      return m.reply(
        `❌ Nomor \`${targetUser.split("@")[0]}\` tidak terdaftar di WhatsApp!`,
      );
    }
  } catch (e) {}

  const email = `${username}@gmail.com`;
  const name = capitalize(username) + " Admin";
  const password = username + _crypto2.default.randomBytes(3).toString("hex");

  await m.reply(
    `🛠️ *ᴍᴇᴍʙᴜᴀᴛ ᴀᴅᴍɪɴ ᴘᴀɴᴇʟ...*\n\n> Server: *${serverLabel}*\n> Username: \`${username}\`\n> Target: \`${targetUser.split("@")[0]}\``,
  );

  try {
    const userRes = await _axios2.default.post(
      `${serverConfig.domain}/api/application/users`,
      {
        email,
        username,
        first_name: name,
        last_name: "Admin",
        root_admin: true,
        language: "en",
        password,
      },
      {
        headers: {
          Authorization: `Bearer ${serverConfig.apikey}`,
          "Content-Type": "application/json",
          Accept: "Application/vnd.pterodactyl.v1+json",
        },
      },
    );

    const user = userRes.data.attributes;

    let detailTxt = `✅ *ᴀᴅᴍɪɴ ᴘᴀɴᴇʟ ʙᴇʀʜᴀsɪʟ ᴅɪʙᴜᴀᴛ*\n\n`;
    detailTxt += `╭─「 📋 *ᴅᴇᴛᴀɪʟ ᴀᴋᴜɴ* 」\n`;
    detailTxt += `┃ 🖥️ \`sᴇʀᴠᴇʀ\`: *${serverLabel}*\n`;
    detailTxt += `┃ 🆔 \`ᴜsᴇʀ ɪᴅ\`: *${user.id}*\n`;
    detailTxt += `┃ 👤 \`ᴜsᴇʀɴᴀᴍᴇ\`: *${user.username}*\n`;
    detailTxt += `┃ 🔐 \`ᴘᴀssᴡᴏʀᴅ\`: *${password}*\n`;
    detailTxt += `┃ 👑 \`sᴛᴀᴛᴜs\`: *Root Admin*\n`;
    detailTxt += `┃ 🗓️ \`ᴛᴀɴɢɢᴀʟ\`: *${formatDate()}*\n`;
    detailTxt += `╰───────────────\n\n`;
    detailTxt += `🌐 *ʟᴏɢɪɴ ᴘᴀɴᴇʟ:* ${serverConfig.domain}\n\n`;
    detailTxt += `> ⚠️ Akun ini memiliki akses penuh!\n`;
    detailTxt += `> ⚠️ Jangan bagikan ke siapapun!`;

    await sock.sendMessage(targetUser, { text: detailTxt });

    if (targetUser !== m.sender) {
      await m.reply(
        `✅ *ᴀᴅᴍɪɴ ᴘᴀɴᴇʟ ʙᴇʀʜᴀsɪʟ ᴅɪʙᴜᴀᴛ*\n\n> Server: *${serverLabel}*\n> Data telah dikirim ke \`${targetUser.split("@")[0]}\``,
      );
    }
  } catch (err) {
    return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
  }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

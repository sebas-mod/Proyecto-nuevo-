"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinassetmanagerjs = require('../../src/lib/ourin-asset-manager.js');
var _ourin = require('ourin');
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinlidjs = require('../../src/lib/ourin-lid.js');
var _ourinpaneljedajs = require('../../src/lib/ourin-panel-jeda.js');
var _ourinrolescpaneljs = require('../../src/lib/ourin-roles-cpanel.js');
var _gcsellerjs = require('./gcseller.js');
var _ourintimejs = require('../../src/lib/ourin-time.js'); var timeHelper = _interopRequireWildcard(_ourintimejs);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
const RAM_OPTIONS = [
  "1gb",
  "2gb",
  "3gb",
  "4gb",
  "5gb",
  "6gb",
  "7gb",
  "8gb",
  "9gb",
  "10gb",
  "unli",
];
const SERVER_VERSIONS = ["v1", "v2", "v3", "v4", "v5"];

const allCommands = [];
RAM_OPTIONS.forEach((ram) => {
  SERVER_VERSIONS.forEach((ver) => {
    allCommands.push(`${ram}${ver}`);
  });
});

const pluginConfig = {
  name: allCommands,
  alias: ["unlimited"],
  category: "panel",
  description: "Create server panel dengan spesifikasi RAM (v1-v5)",
  usage: ".1gbv1 username atau .1gbv2 username,628xxx",
  example: ".2gbv1 myserver,628xxx",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

const RAM_SPECS = {
  "1gb": { ram: 1024, cpu: 70, disk: 1024 },
  "2gb": { ram: 2048, cpu: 80, disk: 2048 },
  "3gb": { ram: 3072, cpu: 90, disk: 2048 },
  "4gb": { ram: 4096, cpu: 100, disk: 4096 },
  "5gb": { ram: 5120, cpu: 110, disk: 5120 },
  "6gb": { ram: 6144, cpu: 120, disk: 6144 },
  "7gb": { ram: 7168, cpu: 130, disk: 7168 },
  "8gb": { ram: 8192, cpu: 140, disk: 8192 },
  "9gb": { ram: 9216, cpu: 150, disk: 9216 },
  "10gb": { ram: 10240, cpu: 160, disk: 10240 },
  unli: { ram: 0, cpu: 0, disk: 0 },
  unlimited: { ram: 0, cpu: 0, disk: 0 },
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

function parseCommand(cmd) {
  const match = cmd.match(/^(\d+gb|unli)(v[1-5])$/i);
  if (!match) return null;
  return {
    ram: match[1].toLowerCase(),
    server: match[2].toLowerCase(),
    serverKey: "s" + match[2].toLowerCase().replace("v", ""),
  };
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

function validateServerConfig(serverConfig) {
  const missing = [];
  if (!_optionalChain([serverConfig, 'optionalAccess', _ => _.domain])) missing.push("domain");
  if (!_optionalChain([serverConfig, 'optionalAccess', _2 => _2.apikey])) missing.push("apikey (PTLA)");
  return missing;
}

function getAvailableServers(pteroConfig) {
  const available = [];
  if (_optionalChain([pteroConfig, 'access', _3 => _3.server1, 'optionalAccess', _4 => _4.domain]) && _optionalChain([pteroConfig, 'access', _5 => _5.server1, 'optionalAccess', _6 => _6.apikey]))
    available.push("v1");
  if (_optionalChain([pteroConfig, 'access', _7 => _7.server2, 'optionalAccess', _8 => _8.domain]) && _optionalChain([pteroConfig, 'access', _9 => _9.server2, 'optionalAccess', _10 => _10.apikey]))
    available.push("v2");
  if (_optionalChain([pteroConfig, 'access', _11 => _11.server3, 'optionalAccess', _12 => _12.domain]) && _optionalChain([pteroConfig, 'access', _13 => _13.server3, 'optionalAccess', _14 => _14.apikey]))
    available.push("v3");
  if (_optionalChain([pteroConfig, 'access', _15 => _15.server4, 'optionalAccess', _16 => _16.domain]) && _optionalChain([pteroConfig, 'access', _17 => _17.server4, 'optionalAccess', _18 => _18.apikey]))
    available.push("v4");
  if (_optionalChain([pteroConfig, 'access', _19 => _19.server5, 'optionalAccess', _20 => _20.domain]) && _optionalChain([pteroConfig, 'access', _21 => _21.server5, 'optionalAccess', _22 => _22.apikey]))
    available.push("v5");
  return available;
}

async function handler(m, { sock }) {
  const pteroConfig = _configjs2.default.pterodactyl;

  const parsed = parseCommand(m.command);
  if (!parsed) {
    return m.reply(`❌ Format command tidak valid.`);
  }

  const { ram, server: serverVersion, serverKey } = parsed;

  const gcSellerAccess = _gcsellerjs.isGcSeller.call(void 0, m.chat, serverVersion)
  if (!gcSellerAccess && !_ourinrolescpaneljs.hasAccessToServer.call(void 0, m.sender, serverVersion, m.isOwner)) {
    const userRole = _ourinrolescpaneljs.getUserRole.call(void 0, m.sender, serverVersion);
    return m.reply(
      `❌ *ᴀᴋsᴇs ᴅɪᴛᴏʟᴀᴋ*\n\n` +
      `> Kamu tidak punya akses ke *${serverVersion.toUpperCase()}*\n` +
      `> Role kamu di ${serverVersion.toUpperCase()}: *${userRole || "Tidak ada"}*\n\n` +
      `> Hubungi admin untuk mendapat akses.`,
    );
  }

  const jedaCheck = _ourinpaneljedajs.checkPanelJeda.call(void 0, m);
  if (!jedaCheck.allowed) {
    return m.reply(jedaCheck.message);
  }

  const serverConfig = getServerConfig(pteroConfig, serverKey);
  const missingConfig = validateServerConfig(serverConfig);

  if (missingConfig.length > 0) {
    const available = getAvailableServers(pteroConfig);
    let txt = `⚠️ *sᴇʀᴠᴇʀ ${serverVersion.toUpperCase()} ʙᴇʟᴜᴍ ᴋᴏɴꜰɪɢ*\n\n`;
    if (available.length > 0) {
      txt += `> Server tersedia: *${available.join(", ")}*\n`;
      txt += `> Contoh: \`${m.prefix}${ram}${available[0]} username\``;
    } else {
      txt += `> Isi config pterodactyl di \`config.js\``;
    }
    return m.reply(txt);
  }

  let targetUser = null;
  let username = null;
  const argStr = _optionalChain([m, 'access', _23 => _23.text, 'optionalAccess', _24 => _24.trim, 'call', _25 => _25()]) || "";

  if (argStr.includes(",")) {
    const parts = argStr.split(",");
    username = _optionalChain([parts, 'access', _26 => _26[0], 'optionalAccess', _27 => _27.trim, 'call', _28 => _28(), 'access', _29 => _29.toLowerCase, 'call', _30 => _30()]);
    let nomor = _optionalChain([parts, 'access', _31 => _31[1], 'optionalAccess', _32 => _32.trim, 'call', _33 => _33(), 'access', _34 => _34.replace, 'call', _35 => _35(/[^0-9]/g, "")]);
    if (nomor) targetUser = nomor + "@s.whatsapp.net";
  } else if (argStr) {
    username = argStr.trim().toLowerCase();
  }

  if (!username) {
    const available = getAvailableServers(pteroConfig);
    const userRole = _ourinrolescpaneljs.getUserRole.call(void 0, m.sender, serverVersion) || "Guest";
    return m.reply(
      `⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n` +
      `> \`${m.prefix}${m.command} username\`\n` +
      `> \`${m.prefix}${m.command} username,628xxx\`\n` +
      `> Reply/tag pesan user\n\n` +
      `> Server: *${serverVersion.toUpperCase()}*\n` +
      `> Role kamu: *${capitalize(userRole)}*\n` +
      `> Server tersedia: *${available.join(", ") || "none"}*`,
    );
  }

  if (!/^[a-z0-9_]{3,16}$/.test(username)) {
    return m.reply(
      `❌ Username hanya boleh huruf kecil, angka, underscore (3-16 karakter).`,
    );
  }

  if (!targetUser) {
    if (_optionalChain([m, 'access', _36 => _36.quoted, 'optionalAccess', _37 => _37.sender])) {
      targetUser = cleanJid(m.quoted.sender);
    } else if (_optionalChain([m, 'access', _38 => _38.mentionedJid, 'optionalAccess', _39 => _39.length]) > 0) {
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
    if (!_optionalChain([onWa, 'optionalAccess', _40 => _40.exists])) {
      return m.reply(
        `❌ Nomor \`${targetUser.split("@")[0]}\` tidak terdaftar di WhatsApp!`,
      );
    }
  } catch (e) {
    return m.reply(`❌ Gagal validasi nomor WhatsApp.`);
  }

  const specs = RAM_SPECS[ram];
  if (!specs) {
    return m.reply(`❌ Paket tidak ditemukan.`);
  }

  const email = `${username}@ourin.md`;
  const name = capitalize(username) + " Server";
  const password = username + _crypto2.default.randomBytes(3).toString("hex");
  const serverLabel = serverVersion.toUpperCase();

  await m.reply(`🕕 Membuat panel *${serverLabel}* untuk \`${targetUser.split("@")[0]}\`...`);

  try {
    let userRes;
    try {
      userRes = await _axios2.default.post(
        `${serverConfig.domain}/api/application/users`,
        {
          email,
          username,
          first_name: name,
          last_name: "Panel",
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
    } catch (e) { e._step = 'create_user'; throw e; }

    const user = userRes.data.attributes;

    let eggRes;
    try {
      eggRes = await _axios2.default.get(
        `${serverConfig.domain}/api/application/nests/${serverConfig.nestid}/eggs/${serverConfig.egg}`,
        {
          headers: {
            Authorization: `Bearer ${serverConfig.apikey}`,
            "Content-Type": "application/json",
            Accept: "Application/vnd.pterodactyl.v1+json",
          },
        },
      );
    } catch (e) { e._step = 'fetch_egg'; throw e; }

    const startupCmd = eggRes.data.attributes.startup;

    let serverRes;
    try {
      serverRes = await _axios2.default.post(
        `${serverConfig.domain}/api/application/servers`,
        {
          name,
          description: `Created at ${formatDate()} [${serverLabel}]`,
          user: user.id,
          egg: parseInt(serverConfig.egg),
          docker_image: "ghcr.io/parkervcp/yolks:nodejs_18",
          startup: startupCmd,
          environment: {
            INST: "npm",
            USER_UPLOAD: "0",
            AUTO_UPDATE: "0",
            CMD_RUN: "npm start",
            JS_FILE: "index.js",
          },
          limits: {
            memory: specs.ram,
            swap: 0,
            disk: specs.disk,
            io: 500,
            cpu: specs.cpu,
          },
          feature_limits: {
            databases: 5,
            backups: 5,
            allocations: 5,
          },
          deploy: {
            locations: [parseInt(serverConfig.location)],
            dedicated_ip: false,
            port_range: [],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${serverConfig.apikey}`,
            "Content-Type": "application/json",
            Accept: "Application/vnd.pterodactyl.v1+json",
          },
        },
      );
    } catch (e) { e._step = 'create_server'; throw e; }

    const server = serverRes.data.attributes;

    const ramLabel = specs.ram === 0 ? "Unlimited" : `${specs.ram / 1000} GB`;

    let detailTxt = `✅ *PANEL BERHASIL DIBUAT*\n\n`;
    detailTxt += `🖥️ Server: *${serverLabel}*\n`;
    detailTxt += `👤 Username: *${user.username}*\n`;
    detailTxt += `🔐 Password: *${password}*\n`;
    detailTxt += `💾 RAM: *${ramLabel}*\n`;
    detailTxt += `🆔 Server ID: *${server.id}*\n`;
    detailTxt += `🌐 Panel: ${serverConfig.domain}\n\n`;
    detailTxt += `⚠️ Simpan data ini, jangan bagikan ke siapapun!`;

    const headerMedia = await _ourin.prepareWAMessageMedia.call(void 0, 
      { image: _ourinassetmanagerjs.getAssetBuffer.call(void 0, "ourin-v8") },
      { upload: sock.waUploadToServer }
    );

    const msg = _ourin.generateWAMessageFromContent.call(void 0, 
      targetUser,
      {
        viewOnceMessage: {
          message: {
            messageContextInfo: { deviceListMetadata: {}, deviceListMetadataVersion: 2 },
            interactiveMessage: _ourin.proto.Message.InteractiveMessage.fromObject({
              contextInfo: {
                mentionedJid: [targetUser],
                isForwarded: true,
                forwardingScore: 999,
              },
              body: _ourin.proto.Message.InteractiveMessage.Body.fromObject({ text: detailTxt }),
              footer: _ourin.proto.Message.InteractiveMessage.Footer.fromObject({ text: `Panel Pterodactyl - ${serverConfig.domain}` }),
              header: _ourin.proto.Message.InteractiveMessage.Header.fromObject({
                hasMediaAttachment: true,
                imageMessage: headerMedia.imageMessage,
              }),
              nativeFlowMessage: _ourin.proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                buttons: [
                  {
                    name: "cta_copy",
                    buttonParamsJson: JSON.stringify({ display_text: "📋 Copy Username", copy_code: username }),
                  },
                  {
                    name: "cta_copy",
                    buttonParamsJson: JSON.stringify({ display_text: "📋 Copy Password", copy_code: password }),
                  },
                  {
                    name: "cta_url",
                    buttonParamsJson: JSON.stringify({ display_text: "🌐 Buka Panel", url: serverConfig.domain }),
                  },
                ],
              }),
            }),
          },
        },
      },
      {}
    );

    await sock.relayMessage(targetUser, msg.message, { messageId: msg.key.id });

    await _ourinpaneljedajs.setPanelLastUsed.call(void 0, );

    if (targetUser !== m.sender) {
      await m.reply(`✅ Panel *${serverLabel}* berhasil dibuat untuk \`${targetUser.split("@")[0]}\``);
    }
  } catch (err) {
    const rawMsg = _optionalChain([err, 'optionalAccess', _41 => _41.response, 'optionalAccess', _42 => _42.data, 'optionalAccess', _43 => _43.errors, 'optionalAccess', _44 => _44[0], 'optionalAccess', _45 => _45.detail]) || _optionalChain([err, 'optionalAccess', _46 => _46.response, 'optionalAccess', _47 => _47.data, 'optionalAccess', _48 => _48.message]) || err.message;
    const errorMap = {
      'has already been taken': `Username/email *${username}* sudah dipakai, coba username lain`,
      'could not find': 'Egg atau nest tidak ditemukan, cek config egg/nestid',
      'No suitable allocation': 'Tidak ada port tersedia di server, hubungi admin panel',
      'unauthorized': 'API key tidak punya permission, buat key baru dengan semua permissions',
    };
    const friendly = Object.entries(errorMap).find(([k]) => rawMsg.toLowerCase().includes(k));
    return m.reply(`❌ *GAGAL MEMBUAT PANEL*\n\n${friendly ? friendly[1] : rawMsg}`);
  }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

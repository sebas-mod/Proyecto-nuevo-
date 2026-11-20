"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _botmodejs = require('../group/botmode.js'); var botmodePlugin = _interopRequireWildcard(_botmodejs);
var _almiku = require('almiku');
var _thumb = require('../../src/lib/almiku-image.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);


var _almikuformatterjs = require('../../src/lib/almiku-formatter.js');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);






var _almikupluginsjs = require('../../src/lib/almiku-plugins.js');
var _almikujs = require('../../case/almiku.js');
const pluginConfig = {
  name: "allmenu",
  alias: ["fullmenu", "am", "allcommand", "semua"],
  category: "main",
  description: "Muestra todos los comandos, agrupados por categoría",
  usage: ".allmenu",
  example: ".allmenu",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};
const CATEGORY_EMOJIS = {
  owner: "👑",
  main: "🏠",
  utility: "🔧",
  fun: "🎮",
  group: "👥",
  download: "📥",
  search: "🔍",
  tools: "🛠️",
  sticker: "🖼️",
  ai: "🤖",
  game: "🎯",
  media: "🎬",
  info: "ℹ️",
  religi: "☪️",
  user: "📊",
  linode: "☁️",
  random: "🎲",
  canvas: "🎨",
  store: "🏪",
  premium: "💎",
  convert: "🔄",
  economy: "💰",
  cek: "📋",
  ephoto: "🎨",
  jpm: "📢",
  pushkontak: "📱",
};

function createBracketBox(emoji, title, lines = []) {
  let text = `╭➤--「${title}MINUTE」\n`;
  for (const line of lines) {
    text += `┆ ⇝ ${line}\n`;
  }
  text += `╰➤-------------------------------\n\n`;
  return text;
}
function getCommandSymbols(cmdName) {
  const plugin = _almikupluginsjs.getPlugin.call(void 0, cmdName);
  if (!plugin || !plugin.config) return "";
  const symbols = [];
  if (plugin.config.isOwner) symbols.push("🅞");
  if (plugin.config.isPremium) symbols.push("🅟");
  if (plugin.config.limit && plugin.config.limit > 0) symbols.push("🅛");
  if (plugin.config.isAdmin) symbols.push("🅐");
  if (plugin.config.isGroup) symbols.push("🅖");
  if (plugin.config.isPrivate) symbols.push("🅟🅡");
  return symbols.length > 0 ? " " + symbols.join(" ") : "";
}
function getContextInfo(botConfig, m, thumbBuffer) {
  const saluranId = _optionalChain([botConfig, 'access', _ => _.saluran, 'optionalAccess', _2 => _2.id]) || "120363400911374213@newsletter";
  const saluranName =
    _optionalChain([botConfig, 'access', _3 => _3.saluran, 'optionalAccess', _4 => _4.name]) || _optionalChain([botConfig, 'access', _5 => _5.bot, 'optionalAccess', _6 => _6.name]) || "Al Miku-AI";
  const saluranLink = _optionalChain([botConfig, 'access', _7 => _7.saluran, 'optionalAccess', _8 => _8.link]) || "";
  return {
    mentionedJid: [m.sender],
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: 127,
    },
  };
}
async function handler(m, { sock, config: botConfig, db, uptime }) {
  const prefix = _optionalChain([botConfig, 'access', _9 => _9.command, 'optionalAccess', _10 => _10.prefix]) || ".";
  const user = db.getUser(m.sender);
  const groupData = m.isGroup ? db.getGroup(m.chat) || {} : {};
  const botMode = groupData.botMode || "md";
  const categories = _almikupluginsjs.getCategories.call(void 0, );
  const commandsByCategory = _almikupluginsjs.getCommandsByCategory.call(void 0, );
  const casesByCategory = _almikujs.getCasesByCategory.call(void 0, );
  let totalCommands = 0;
  for (const category of categories) {
    totalCommands += (commandsByCategory[category] || []).length;
  }
  const totalCases = _almikujs.getCaseCount.call(void 0, );
  const totalFeatures = totalCommands + totalCases;
  let userRole = "User",
    roleEmoji = "👤";
  if (m.isOwner) {
    userRole = "Propietario";
    roleEmoji = "👑";
  } else if (m.isPremium) {
    userRole = "Premium";
    roleEmoji = "💎";
  }
  const greeting = _almikuformatterjs.getTimeGreeting.call(void 0, );
  let txt = ``;

  const weatherCodeMap = {
    0: "☀️ Cerah", 1: "🌤️ Cerah Berawan", 2: "⛅ Berawan", 3: "☁️ Mendung", 45: "🌫️ Berkabut", 48: "🌫️ Kabut Tebal", 51: "🌦️ Gerimis", 61: "🌧️ Hujan Ringan", 63: "🌧️ Hujan", 65: "⛈️ Hujan Lebat", 80: "🌦️ Hujan Lokal", 95: "⛈️ Badai Petir"
  };

  let weatherText = "Merangin Cerah Berawan 22°C ☀️";
  try {
    const geo = await _axios2.default.get(`https://geocoding-api.open-meteo.com/v1/search?name=Merangin&count=1`);
    const loc = _optionalChain([geo, 'access', _11 => _11.data, 'access', _12 => _12.results, 'optionalAccess', _13 => _13[0]]);
    if (loc) {
      const res = await _axios2.default.get(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code`);
      const current = res.data.current;
      const kondisi = weatherCodeMap[current.weather_code] || "Cerah Berawan";
      weatherText = `Merangin ${kondisi} ${Math.round(current.temperature_2m)}°C`;
    }
  } catch (e) { }

  const userLimit = (m.isPremium || m.isOwner) ? "∞ Ilimitado" : (_optionalChain([user, 'optionalAccess', _14 => _14.limit]) || 0);
  const botName = _optionalChain([botConfig, 'access', _15 => _15.bot, 'optionalAccess', _16 => _16.name]) || "Remi AI";
  const devName = _optionalChain([botConfig, 'access', _17 => _17.bot, 'optionalAccess', _18 => _18.developer]) || "Ell";
  const botVersion = _optionalChain([botConfig, 'access', _19 => _19.bot, 'optionalAccess', _20 => _20.version]) || "11.0.0";
  const pushName = m.pushName || "User";
  const timeNow = new Date().toLocaleTimeString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }).replace(/\./g, ':');

  txt += `✦ *Información del usuario*\n`;
  txt += `• Nombre : ${pushName}\n`;
  txt += `• Rango  : ${userRole}\n`;
  txt += `• Límite : ${userLimit}\n\n`;
  txt += `✦ *Información del bot*\n`;
  txt += `• Nombre : ${botName}\n`;
  txt += `• Funciones : ${totalFeatures}\n`;
  txt += `• Versión : ${botVersion}\n`;
  txt += `• Hora : ${timeNow} ART\n\n`;
  txt += `✦ *Ventajas*\n`;
  txt += `• Fast response\n`;
  txt += `• Stable system\n`;
  txt += `• Multi feature\n`;
  txt += `• User friendly\n\n`;
  txt += `Elige un menú de la lista de abajo.\n`;
  txt += `Usa los comandos con cabeza.\n\n`;
  const categoryOrder = [
    "owner",
    "main",
    "utility",
    "tools",
    "fun",
    "game",
    "download",
    "search",
    "sticker",
    "media",
    "ai",
    "group",
    "religi",
    "info",
    "cek",
    "economy",
    "user",
    "canvas",
    "random",
    "premium"
  ];
  const sortedCategories = [...categories].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
  let modeAllowedMap = {
    md: null,
    store: ["main", "group", "sticker", "owner", "store"],
    pushkontak: ["main", "group", "sticker", "owner", "pushkontak"],
  };
  let modeExcludeMap = {
    md: ["pushkontak", "store"],
    store: null,
    pushkontak: null,
  };
  try {
    if (botmodePlugin && botmodePlugin.MODES) {
      const modes = botmodePlugin.MODES;
      modeAllowedMap = {};
      modeExcludeMap = {};
      for (const [key, val] of Object.entries(modes)) {
        modeAllowedMap[key] = val.allowedCategories;
        modeExcludeMap[key] = val.excludeCategories;
      }
    }
  } catch (e) { }
  const allowedCategories = modeAllowedMap[botMode];
  const excludeCategories = modeExcludeMap[botMode] || [];
  for (const category of sortedCategories) {
    if (category === "owner" && !m.isOwner) continue;
    if (
      allowedCategories &&
      !allowedCategories.includes(category.toLowerCase())
    )
      continue;
    if (excludeCategories && excludeCategories.includes(category.toLowerCase()))
      continue;
    const pluginCmds = commandsByCategory[category] || [];
    const caseCmds = casesByCategory[category] || [];
    const allCmds = [...pluginCmds, ...caseCmds];
    if (allCmds.length === 0) continue;
    const emoji = CATEGORY_EMOJIS[category] || "📋";
    const categoryName = category.toUpperCase();
    const commandLines = allCmds.map((cmd) => {
      const symbols = getCommandSymbols(cmd);
      return `${prefix}${cmd}${symbols}`;
    });
    txt += createBracketBox(emoji, categoryName, commandLines);
  }
  const savedVariant = db.setting("allmenuVariant");
  const allmenuVariant = savedVariant || _optionalChain([botConfig, 'access', _21 => _21.ui, 'optionalAccess', _22 => _22.allmenuVariant]) || 2;
  try {
    switch (allmenuVariant) {
      case 1:
        await m.reply(txt);
        break;
      case 2:
        const media = await _almiku.prepareWAMessageMedia.call(void 0, {
          image: _fs2.default.readFileSync(_configjs2.default.assets["almiku"])
        }, { upload: sock.waUploadToServer })
        await sock.relayMessage(
          m.chat,
          {
            viewOnceMessage: {
              message: {
                messageContextInfo: {},
                interactiveMessage: {
                  header: {
                    title: "",
                    subtitle: "",
                    hasMediaAttachment: true,
                    imageMessage: media.imageMessage
                  },
                  body: {
                    text: `Hola${pushName}*👋 Presentate yo *${botName}*, buatan *${devName}* Estoy listo para ayudarte con tus necesidades, empezar a descargar videos, jugar juego, tayang, buscar I.V., comprar pegatinas, etc.\n\n`,
                  },
                  footer: {
                    text: txt
                  },
                  contextInfo: {
                    isForwarded: true,
                    fprwardingScore: 9,
                    participant: "0@s.whatsapp.net",
                    quotedMessage: {
                      conversation: `${_optionalChain([_configjs2.default, 'access', _23 => _23.bot, 'optionalAccess', _24 => _24.name])}`
                    },
                    mentionedJid: [
                      `${m.sender}`
                    ]
                  },
                  nativeFlowMessage: {
                    messageParamsJson: JSON.stringify({
                      limited_time_offer: {
                        text: `${greeting}`,
                        url: "Hai",
                        copy_code: "Dibuat oleh " + _optionalChain([_configjs2.default, 'access', _25 => _25.bot, 'optionalAccess', _26 => _26.developer]),
                        expiration_time: Date.now() + 1000000,
                      },
                    }),
                    buttons: [
                      {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                          display_text: "🍅Volver a Menú Principal",
                          id: m.prefix + "menu"
                        })
                      }
                    ]
                  }
                }
              }
            }
          },
          {}
        )
        break;
      case 5: {
        function runtime(seconds) {
          seconds = Number(seconds);
          const d = Math.floor(seconds / (3600 * 24));
          const h = Math.floor(seconds % (3600 * 24) / 3600);
          const m = Math.floor(seconds % 3600 / 60);
          const s = Math.floor(seconds % 60);
          return `${d}Hora${m}Minuto${s}Segundo`;
        }

        const weatherCode = {
          0: "☀️ Cerah", 1: "🌤️ Cerah Berawan", 2: "⛅ Berawan", 3: "☁️ Mendung", 45: "🌫️ Berkabut", 48: "🌫️ Kabut Tebal", 51: "🌦️ Gerimis", 61: "🌧️ Hujan Ringan", 63: "🌧️ Hujan", 65: "⛈️ Hujan Lebat", 80: "🌦️ Hujan Lokal", 95: "⛈️ Badai Petir"
        }

        async function weatherMenu(city = "Buenos Aires") {
          try {
            const geo = await _axios2.default.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`)
            const loc = _optionalChain([geo, 'access', _27 => _27.data, 'access', _28 => _28.results, 'optionalAccess', _29 => _29[0]])
            if (!loc) return "Cuaca no está disponible"
            const res = await _axios2.default.get(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code`)
            const current = res.data.current
            const kondisi = weatherCode[current.weather_code] || "🌍No diketahui"
            return `${kondisi} | 🌡️ ${Math.round(current.temperature_2m)}°C\n📍 ${loc.name}`
          } catch (e2) {
            return "Cuaca no está disponible"
          }
        }

        const thumbnail = await _thumb.thumbnail(_configjs2.default.assets["almiku"], 300, 300)
        const qOrder = {
          key: { fromMe: false, participant: '0@s.whatsapp.net', remoteJid: m.sender },
          message: { locationMessage: { degreesLatitude: 0, degreesLongitude: 0, name: await weatherMenu(), jpegThumbnail: thumbnail } }
        }
        const media4 = await _almiku.prepareWAMessageMedia.call(void 0, { video: _fs2.default.readFileSync(_configjs2.default.assets["almiku-mp4"]), gifPlayback: true }, { upload: sock.waUploadToServer });
        const msg4 = _almiku.generateWAMessageFromContent.call(void 0, m.chat, {
          viewOnceMessage: {
            message: {
              messageContextInfo: {},
              interactiveMessage: {
                header: { title: "", subtitle: "", hasMediaAttachment: true, videoMessage: media4.videoMessage },
                footer: { text: `Please select the button in below` },
                body: { text: txt },
                contextInfo: {
                  mentionedJid: [m.sender],
                  isForwarded: true,
                  forwardingScore: 9,
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: _optionalChain([_configjs2.default, 'access', _30 => _30.saluran, 'optionalAccess', _31 => _31.id]) || "120363400911374213@newsletter",
                    newsletterName: _optionalChain([_configjs2.default, 'access', _32 => _32.saluran, 'optionalAccess', _33 => _33.name]) || _optionalChain([_configjs2.default, 'access', _34 => _34.bot, 'optionalAccess', _35 => _35.name]) || "Al Miku-AI",
                    serverMessageId: 127,
                  },
                },
                nativeFlowMessage: {
                  messageParamsJson: JSON.stringify({
                    limited_time_offer: { text: `${greeting}`, url: "Hai", expiration_time: Date.now() + 10000 },
                    bottom_sheet: { in_thread_buttons_limit: 2, divider_indices: [1, 2, 3, 4, 5, 999], list_title: "Seleccione el menú", button_title: "🍙 Ver categorías" },
                    tap_target_configuration: { title: " X ", description: "bomboclard", canonical_url: "https://ourin.site", domain: "shop.example.com", button_index: 0 },
                  }),
                  buttons: [
                    { name: "", buttonParamsJson: "" },
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({ display_text: "📂 Kembali Ke Daftar Kategori", id: m.prefix + "menucat" })
                    },
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({ display_text: "🍅Volver a Menú Principal", id: m.prefix + "menu" })
                    },
                  ]
                }
              }
            }
          }
        }, { quoted: qOrder, userJid: sock.user.jid });

        await sock.relayMessage(m.chat, msg4.message, { messageId: msg4.key.id });
        break;
      }
      case 6: {
        const weatherCode = {
          0: "☀️ Cerah", 1: "🌤️ Cerah Berawan", 2: "⛅ Berawan", 3: "☁️ Mendung", 45: "🌫️ Berkabut", 48: "🌫️ Kabut Tebal", 51: "🌦️ Gerimis", 61: "🌧️ Hujan Ringan", 63: "🌧️ Hujan", 65: "⛈️ Hujan Lebat", 80: "🌦️ Hujan Lokal", 95: "⛈️ Badai Petir"
        }

        async function weatherMenu(city = "Buenos Aires") {
          try {
            const geo = await _axios2.default.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`)
            const loc = _optionalChain([geo, 'access', _36 => _36.data, 'access', _37 => _37.results, 'optionalAccess', _38 => _38[0]])
            if (!loc) return "Cuaca no está disponible"
            const res = await _axios2.default.get(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code`)
            const current = res.data.current
            const kondisi = weatherCode[current.weather_code] || "🌍No diketahui"
            return `${kondisi} | 🌡️ ${Math.round(current.temperature_2m)}°C\n📍 ${loc.name}`
          } catch (e3) {
            return "Cuaca no está disponible"
          }
        }

        const thumbnail = await _thumb.thumbnail(_configjs2.default.assets["almiku"], 300, 300)

        const msg6 = _almiku.generateWAMessageFromContent.call(void 0, m.chat, {
          viewOnceMessage: {
            message: {
              messageContextInfo: {},
              interactiveMessage: {
                header: {
                  hasMediaAttachment: true,
                  locationMessage: {
                    degreesLatitude: 0,
                    degreesLongitude: 0,
                    name: _optionalChain([_configjs2.default, 'access', _39 => _39.bot, 'optionalAccess', _40 => _40.name]) || "Al Miku-AI",
                    address: await weatherMenu(),
                    jpegThumbnail: thumbnail
                  }
                },
                body: {
                  text: txt,
                },
                contextInfo: {
                  mentionedJid: [m.sender],
                  isForwarded: true,
                  forwardingScore: 9,
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: _optionalChain([_configjs2.default, 'access', _41 => _41.saluran, 'optionalAccess', _42 => _42.id]) || "120363400911374213@newsletter",
                    newsletterName: _optionalChain([_configjs2.default, 'access', _43 => _43.saluran, 'optionalAccess', _44 => _44.name]) || _optionalChain([_configjs2.default, 'access', _45 => _45.bot, 'optionalAccess', _46 => _46.name]) || "Al Miku-AI",
                    serverMessageId: 127,
                  },
                },
                nativeFlowMessage: {
                  buttons: []
                }
              }
            }
          }
        }, { quoted: m, userJid: sock.user.jid });

        await sock.relayMessage(m.chat, msg6.message, { messageId: msg6.key.id });
        break;
      }
      default:
        break
    }
    const audioEnabled = db.setting("audioMenu") !== false;
    if (audioEnabled) {
      const audioUrl = botConfig.assets["almiku-mp3"];
      const audioVariant = db.setting("allmenuAudioStyle") || 1;
      try {
        const fs = (await Promise.resolve().then(() => _interopRequireWildcard(require("fs")))).default;
        const path = (await Promise.resolve().then(() => _interopRequireWildcard(require("path")))).default;
        const axios = (await Promise.resolve().then(() => _interopRequireWildcard(require("axios")))).default;

        switch (audioVariant) {
          case 1:
            try {
              const oggPath = await (async () => {
                const tempDir = path.join(process.cwd(), "temp");
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
                const destPath = path.join(tempDir, "allmenu_audio_opus.ogg");
                if (fs.existsSync(destPath)) return destPath;
                const mp3Path = path.join(tempDir, "allmenu_audio.mp3");
                const res = await axios.get(audioUrl, { responseType: "arraybuffer" });
                fs.writeFileSync(mp3Path, Buffer.from(res.data));
                const { spawn } = await Promise.resolve().then(() => _interopRequireWildcard(require("child_process")));
                return new Promise((resolve, reject) => {
                  const ffmpeg = spawn("ffmpeg", ["-y", "-i", mp3Path, "-c:a", "libopus", "-b:a", "48k", "-vbr", "on", destPath]);
                  ffmpeg.on("close", (code) => {
                    if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
                    if (code === 0) resolve(destPath);
                    else reject(new Error("FFmpeg error"));
                  });
                  ffmpeg.on("error", (err) => {
                    if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
                    reject(err);
                  });
                });
              })();
              await sock.sendMessage(m.chat, {
                audio: { url: oggPath },
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
              }, { quoted: m });
            } catch (err) {
              await sock.sendMessage(m.chat, {
                audio: { url: audioUrl },
                mimetype: "audio/mpeg",
                ptt: false,
              }, { quoted: m });
            }
            break;
          case 2: {
            const qpoll = {
              key: { participant: "0@s.whatsapp.net" },
              message: {
                pollCreationMessage: {
                  name: _configjs2.default.bot.name
                }
              }
            };
            try {
              const oggPath = await (async () => {
                const tempDir = path.join(process.cwd(), "temp");
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
                const destPath = path.join(tempDir, "allmenu_audio_opus.ogg");
                if (fs.existsSync(destPath)) return destPath;
                const mp3Path = path.join(tempDir, "allmenu_audio.mp3");
                const res = await axios.get(audioUrl, { responseType: "arraybuffer" });
                fs.writeFileSync(mp3Path, Buffer.from(res.data));
                const { spawn } = await Promise.resolve().then(() => _interopRequireWildcard(require("child_process")));
                return new Promise((resolve, reject) => {
                  const ffmpeg = spawn("ffmpeg", ["-y", "-i", mp3Path, "-c:a", "libopus", "-b:a", "48k", "-vbr", "on", destPath]);
                  ffmpeg.on("close", (code) => {
                    if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
                    if (code === 0) resolve(destPath);
                    else reject(new Error("FFmpeg error"));
                  });
                  ffmpeg.on("error", (err) => {
                    if (fs.existsSync(mp3Path)) fs.unlinkSync(mp3Path);
                    reject(err);
                  });
                });
              })();
              await sock.sendMessage(m.chat, {
                audio: { url: oggPath },
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
              }, { quoted: qpoll });
            } catch (err) {
              await sock.sendMessage(m.chat, {
                audio: { url: audioUrl },
                mimetype: "audio/mpeg",
                ptt: false,
              }, { quoted: qpoll });
            }
            break;
          }
          case 3: {
            const qtext = {
              key: {
                fromMe: false,
                participant: m.sender,
              },
              message: {
                conversation: "fontcolor = \" # FFFF00 \" set music bang"
              }
            };
            await sock.sendMessage(m.chat, {
              audio: fs.readFileSync(_configjs2.default.assets["almiku-mp3"]),
              mimetype: "audio/mpeg",
              ptt: false,
            }, { quoted: qtext });
            break;
          }
          default: {
            const ftroliQuoted = {
              key: {
                fromMe: false,
                participant: "0@s.whatsapp.net",
                remoteJid: "status@broadcast",
              },
              message: {
                orderMessage: {
                  orderId: "44444444444444",
                  thumbnail:
                    (thumbBuffer || imageBuffer ? await (await getSharp())(thumbBuffer || imageBuffer)
                      .resize({ width: 300, height: 300 })
                      .toBuffer() : null),
                  itemCount: totalCmds,
                  status: "INQUIRY",
                  surface: "CATALOG",
                  message: `★ ${_configjs2.default.bot.name}`,
                  orderTitle: `📋 ${totalCmds} comandos`,
                  sellerJid: botConfig.botNumber
                    ? `${botConfig.botNumber}@s.whatsapp.net`
                    : m.sender,
                  token: "almiku-menu-v8",
                  totalAmount1000: 3333333,
                  totalCurrencyCode: "IDR",
                  contextInfo: {
                    isForwarded: true,
                    forwardingScore: 9,
                    forwardedNewsletterMessageInfo: {
                      newsletterJid: "120363351980387532@newsletter",
                      newsletterName: "Al Miku",
                      serverMessageId: 127,
                    },
                  },
                },
              },
            };
            try {
              await sock.sendMessage(
                m.chat,
                {
                  audio: fs.readFileSync(_configjs2.default.assets["almiku-mp3"]),
                  mimetype: "audio/mpeg",
                },
                { quoted: ftroliQuoted },
              );
            } catch (ffmpegErr) {
              await sock.sendMessage(
                m.chat,
                {
                  audio: fs.readFileSync(_configjs2.default.assets["almiku-mp3"]),
                  mimetype: "audio/mpeg",
                },
                { quoted: m },
              );
            }
            break;
          }
        }
      } catch (e) {
        console.error("[AllMenu] Error sending dynamic audio:", e.message);
      }
    }
  } catch (error) {
    console.error("[AllMenu] Error:", error.message);
    if (imageBuffer) {
      await sock.sendMessage(
        m.chat,
        {
          image: imageBuffer,
          caption: txt,
          contextInfo: getContextInfo(botConfig, m),
        },
        { quoted: m },
      );
    } else {
      await m.reply(txt);
    }
  }
}
exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

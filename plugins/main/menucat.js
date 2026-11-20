"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _botmodejs = require('../group/botmode.js'); var botmodePlugin = _interopRequireWildcard(_botmodejs);
var _almikujs = require('../../case/almiku.js');
var _almiku = require('almiku');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _sharp = require('sharp'); var _sharp2 = _interopRequireDefault(_sharp);




var _almikupluginsjs = require('../../src/lib/almiku-plugins.js');
var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _almikuformatterjs = require('../../src/lib/almiku-formatter.js');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);

const pluginConfig = {
  name: "menucat",
  alias: ["mc", "category", "cat"],
  category: "main",
  description: "Adjuntar comandos en el catémori absoluto",
  usage: ".menucat <kategori>",
  example: ".menucat tools",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
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
  jpm: "📢",
  pushkontak: "📱",
  ephoto: "🎨",
  store: "🛒",
  linode: "☁️",
  random: "🎲",
  canvas: "🎨",
  vps: "🌊",
  premium: "💎",
  convert: "🔄",
  economy: "💰",
  cek: "📋"
};

function toSmallCaps(text) {
  const smallCaps = {
    a: "ᴀ",
    b: "ʙ",
    c: "ᴄ",
    d: "ᴅ",
    e: "ᴇ",
    f: "ꜰ",
    g: "ɢ",
    h: "ʜ",
    i: "ɪ",
    j: "ᴊ",
    k: "ᴋ",
    l: "ʟ",
    m: "ᴍ",
    n: "ɴ",
    o: "ᴏ",
    p: "ᴘ",
    q: "ǫ",
    r: "ʀ",
    s: "s",
    t: "ᴛ",
    u: "ᴜ",
    v: "ᴠ",
    w: "ᴡ",
    x: "x",
    y: "ʏ",
    z: "ᴢ",
  };
  return text
    .toLowerCase()
    .split("")
    .map((c) => smallCaps[c] || c)
    .join("");
}

function createBracketBox(emoji, title, lines = []) {
  let text = `╭─〔 ${emoji} \`${title}\`\n`;
  for (const line of lines) {
    text += `┃ *${toSmallCaps(line)}*\n`;
  }
  text += `╰─⬣\n\n`;
  return text;
}

function getCommandSymbols(cmdName) {
  const plugin = _almikupluginsjs.getPlugin.call(void 0, cmdName);
  if (!plugin || !plugin.config) return "";
  const symbols = [];
  if (plugin.config.isOwner) symbols.push("Ⓞ");
  if (plugin.config.isPremium) symbols.push("ⓟ");
  if (plugin.config.limit && plugin.config.limit > 0) symbols.push("Ⓛ");
  if (plugin.config.isAdmin) symbols.push("Ⓐ");
  if (plugin.config.isGroup) symbols.push("Ⓖ");
  if (plugin.config.isPrivate) symbols.push("Ⓟ");
  return symbols.length > 0 ? " " + symbols.join(" ") : "";
}

async function handler(m, { sock, db }) {
  const prefix = _optionalChain([_configjs2.default, 'access', _ => _.command, 'optionalAccess', _2 => _2.prefix]) || ".";
  const args = m.args || [];
  const categoryArg = _optionalChain([args, 'access', _3 => _3[0], 'optionalAccess', _4 => _4.toLowerCase, 'call', _5 => _5()]);
  const categories = _almikupluginsjs.getCategories.call(void 0, );
  const commandsByCategory = _almikupluginsjs.getCommandsByCategory.call(void 0, );
  const casesByCategory = _almikujs.getCasesByCategory.call(void 0, );
  const savedVariant = db.setting("menucatVariant");
  const menucatVariant = savedVariant || _optionalChain([_configjs2.default, 'access', _6 => _6.ui, 'optionalAccess', _7 => _7.menucatVariant]) || 2;
  const greeting = _almikuformatterjs.getTimeGreeting.call(void 0, );

  if (!categoryArg) {
    const groupData = m.isGroup ? db.getGroup(m.chat) || {} : {};
    const botMode = groupData.botMode || "md";

    let modeExcludeMap = {
      md: ["pushkontak", "store"],
      store: ["pushkontak", "jpm", "ephoto"],
      pushkontak: ["store", "jpm", "ephoto"],
    };

    try {
      if (botmodePlugin && botmodePlugin.MODES) {
        const modes = botmodePlugin.MODES;
        modeExcludeMap = {};
        for (const [key, val] of Object.entries(modes)) {
          if (val.excludeCategories)
            modeExcludeMap[key] = val.excludeCategories;
        }
      }
    } catch (e) { }

    const excludeCategories = modeExcludeMap[botMode] || modeExcludeMap.md;

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
      "premium",
      "jpm",
      "pushkontak",
      "ephoto",
      "store"
    ];

    const allCats = [
      ...new Set([...categories, ...Object.keys(casesByCategory)]),
    ];

    const sortedCats = allCats.sort((a, b) => {
      const indexA = categoryOrder.indexOf(a);
      const indexB = categoryOrder.indexOf(b);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

    const visibleCats = sortedCats.filter((cat) => {
      if (categoryArg && cat.toLowerCase() !== categoryArg) return false;
      if (cat === "owner" && !m.isOwner) return false;
      if (excludeCategories.includes(cat.toLowerCase())) return false;
      const total =
        (commandsByCategory[cat] || []).length +
        (casesByCategory[cat] || []).length;
      return total > 0;
    });

    let txt = ``;
    txt += createBracketBox("🤖", "Descripción", [
      "Ⓞ= Sólo para el propietario",
      "ⓟ= Sólo para prima",
      "Ⓛ= límite de necesidad",
      "Ⓐ= Sólo para administración",
      "Ⓖ= Sólo dentro del grupo",
      "Ⓟ= Sólo en el chat primario",
    ]);

    for (const cat of visibleCats) {
      const pluginCmds = commandsByCategory[cat] || [];
      const caseCmds = casesByCategory[cat] || [];
      const allCmds = [...pluginCmds, ...caseCmds];
      if (allCmds.length === 0) continue;
      const emoji = CATEGORY_EMOJIS[cat] || "📋";
      const categoryName = toSmallCaps(cat);
      const commandLines = allCmds.map((cmd) => {
        const symbols = getCommandSymbols(cmd);
        return `${prefix}${cmd}${symbols}`;
      });
      txt += createBracketBox(emoji, categoryName, commandLines);
    }

    try {
      switch (menucatVariant) {
        case 1:
          await m.reply(txt);
          break;
        case 2: {
          const media = await _almiku.prepareWAMessageMedia.call(void 0, 
            {
              image: _fs2.default.readFileSync(_configjs2.default.assets["almiku2"]),
            },
            { upload: sock.waUploadToServer },
          );
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
                      imageMessage: media.imageMessage,
                    },
                    body: {
                      text: txt,
                    },
                    footer: {
                      text: "Seleccione el botón de la barra para volver al menú principal",
                    },
                    contextInfo: {
                      isForwarded: true,
                      forwardingScore: 9,
                      participant: "0@s.whatsapp.net",
                      quotedMessage: {
                        conversation: `${_optionalChain([_configjs2.default, 'access', _8 => _8.bot, 'optionalAccess', _9 => _9.name])}`,
                      },
                      mentionedJid: [`${m.sender}`],
                    },
                    nativeFlowMessage: {
                      messageParamsJson: JSON.stringify({
                        limited_time_offer: {
                          text: `${greeting}`,
                          url: "Hai",
                          copy_code: "Dibuat oleh " + _optionalChain([_configjs2.default, 'access', _10 => _10.bot, 'optionalAccess', _11 => _11.developer]),
                          expiration_time: Date.now() + 1000000,
                        },
                      }),
                      buttons: [
                        {
                          name: "quick_reply",
                          buttonParamsJson: JSON.stringify({
                            display_text: "🍅Volver a Menú Principal",
                            id: m.prefix + "menu",
                          }),
                        },
                      ],
                    },
                  },
                },
              },
            },
            {},
          );
          break;
        }
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
              const loc = _optionalChain([geo, 'access', _12 => _12.data, 'access', _13 => _13.results, 'optionalAccess', _14 => _14[0]])
              if (!loc) return "Cuaca no está disponible"
              const res = await _axios2.default.get(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code`)
              const current = res.data.current
              const kondisi = weatherCode[current.weather_code] || "🌍No diketahui"
              return `${kondisi} | 🌡️ ${Math.round(current.temperature_2m)}°C\n📍 ${loc.name}`
            } catch (e2) {
              return "Cuaca no está disponible"
            }
          }

          const thumbnail = await _sharp2.default.call(void 0, _fs2.default.readFileSync(_configjs2.default.assets["almiku"])).resize(300, 300).toBuffer()
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
                      newsletterJid: _optionalChain([_configjs2.default, 'access', _15 => _15.saluran, 'optionalAccess', _16 => _16.id]) || "120363400911374213@newsletter",
                      newsletterName: _optionalChain([_configjs2.default, 'access', _17 => _17.saluran, 'optionalAccess', _18 => _18.name]) || _optionalChain([_configjs2.default, 'access', _19 => _19.bot, 'optionalAccess', _20 => _20.name]) || "Al Miku-AI",
                      serverMessageId: 127,
                    },
                  },
                  nativeFlowMessage: {
                    messageParamsJson: JSON.stringify({
                      limited_time_offer: { text: `${greeting}`, url: "Hai", expiration_time: Date.now() + 10000 },
                      bottom_sheet: { in_thread_buttons_limit: 2, divider_indices: [1, 2, 3, 4, 5, 999], list_title: "Seleccione el menú", button_title: "🍙 See Category" },
                      tap_target_configuration: { title: " X ", description: "bomboclard", canonical_url: "https://ourin.site", domain: "shop.example.com", button_index: 0 },
                    }),
                    buttons: [
                      { name: "", buttonParamsJson: "" },
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
        default:
          await m.reply(txt);
          break;
      }
    } catch (err) {
      await m.reply(txt);
    }
    return;
  }

  const allCategories = [
    ...new Set([...categories, ...Object.keys(casesByCategory)]),
  ];
  const matchedCat = allCategories.find((c) => c.toLowerCase() === categoryArg);

  if (!matchedCat) {
    return m.reply(
      `❌* CATHEGORI CAN 'T BE FOUND *\n\n> Categoría\`${categoryArg}\`no hay.\n> Escribe\`${prefix}impacto\`Para la lista de caegori.`,
    );
  }

  if (matchedCat === "owner" && !m.isOwner) {
    return m.reply(`❌* Cumplimiento de la ACCESO *\n\nA este kagori es para el dueño.`);
  }

  const pluginCommands = commandsByCategory[matchedCat] || [];
  const caseCommands = casesByCategory[matchedCat] || [];
  const allCommands = [...pluginCommands, ...caseCommands];

  if (allCommands.length === 0) {
    return m.reply(
      `❌*Vacio*\n\n> Categoría\`${matchedCat}\`no tiene ningún comando.`,
    );
  }

  const emoji = CATEGORY_EMOJIS[matchedCat] || "📁";
  const categoryName = toSmallCaps(matchedCat);
  const commandLines = allCommands.map((cmd) => {
    const symbols = getCommandSymbols(cmd);
    return `${prefix}${cmd}${symbols}`;
  });

  let txt = ``;
  txt += createBracketBox(emoji, categoryName, commandLines);
  txt += `Total: \`${allCommands.length}\` commands`;
  if (caseCommands.length > 0) {
    txt += `\n(${pluginCommands.length} plugin + ${caseCommands.length} case)`;
  }

  try {
    switch (menucatVariant) {
      case 1:
        await m.reply(txt);
        break;
      case 2: {
        const media = await _almiku.prepareWAMessageMedia.call(void 0, 
          {
            image: _fs2.default.readFileSync(_configjs2.default.assets["almiku2"]),
          },
          { upload: sock.waUploadToServer },
        );
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
                    imageMessage: media.imageMessage,
                  },
                  body: {
                    text: txt,
                  },
                  footer: {
                    text: "Seleccione el botón de la barra para volver al menú principal",
                  },
                  contextInfo: {
                    isForwarded: true,
                    forwardingScore: 9,
                    participant: "0@s.whatsapp.net",
                    quotedMessage: {
                      conversation: `${_optionalChain([_configjs2.default, 'access', _21 => _21.bot, 'optionalAccess', _22 => _22.name])}`,
                    },
                    mentionedJid: [`${m.sender}`],
                  },
                  nativeFlowMessage: {
                    messageParamsJson: JSON.stringify({
                      limited_time_offer: {
                        text: `${greeting}`,
                        url: "Hai",
                        copy_code: "Dibuat oleh " + _optionalChain([_configjs2.default, 'access', _23 => _23.bot, 'optionalAccess', _24 => _24.developer]),
                        expiration_time: Date.now() + 1000000,
                      },
                    }),
                    buttons: [
                      {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                          display_text: "📂 Kembali Ke Daftar Kategori",
                          id: m.prefix + "menucat",
                        }),
                      },
                      {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                          display_text: "🍅Volver a Menú Principal",
                          id: m.prefix + "menu",
                        }),
                      },
                    ],
                  },
                },
              },
            },
          },
          {},
        );
        break;
      }
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
            const loc = _optionalChain([geo, 'access', _25 => _25.data, 'access', _26 => _26.results, 'optionalAccess', _27 => _27[0]])
            if (!loc) return "Cuaca no está disponible"
            const res = await _axios2.default.get(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code`)
            const current = res.data.current
            const kondisi = weatherCode[current.weather_code] || "🌍No diketahui"
            return `${kondisi} | 🌡️ ${Math.round(current.temperature_2m)}°C\n📍 ${loc.name}`
          } catch (e3) {
            return "Cuaca no está disponible"
          }
        }

        const thumbnail = await _sharp2.default.call(void 0, _fs2.default.readFileSync(_configjs2.default.assets["almiku"])).resize(300, 300).toBuffer()
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
                    newsletterJid: _optionalChain([_configjs2.default, 'access', _28 => _28.saluran, 'optionalAccess', _29 => _29.id]) || "120363400911374213@newsletter",
                    newsletterName: _optionalChain([_configjs2.default, 'access', _30 => _30.saluran, 'optionalAccess', _31 => _31.name]) || _optionalChain([_configjs2.default, 'access', _32 => _32.bot, 'optionalAccess', _33 => _33.name]) || "Al Miku-AI",
                    serverMessageId: 127,
                  },
                },
                nativeFlowMessage: {
                  messageParamsJson: JSON.stringify({
                    limited_time_offer: { text: `${greeting}`, url: "Hai", expiration_time: Date.now() + 10000 },
                    bottom_sheet: { in_thread_buttons_limit: 2, divider_indices: [1, 2, 3, 4, 5, 999], list_title: "Seleccione el menú", button_title: "🍙 See Category" },
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
            const loc = _optionalChain([geo, 'access', _34 => _34.data, 'access', _35 => _35.results, 'optionalAccess', _36 => _36[0]])
            if (!loc) return "Cuaca no está disponible"
            const res = await _axios2.default.get(`https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code`)
            const current = res.data.current
            const kondisi = weatherCode[current.weather_code] || "🌍No diketahui"
            return `${kondisi} | 🌡️ ${Math.round(current.temperature_2m)}°C\n📍 ${loc.name}`
          } catch (e4) {
            return "Cuaca no está disponible"
          }
        }

        const thumbnail = await _sharp2.default.call(void 0, _fs2.default.readFileSync(_configjs2.default.assets["almiku"])).resize(300, 300).toBuffer()

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
                    name: _optionalChain([_configjs2.default, 'access', _37 => _37.bot, 'optionalAccess', _38 => _38.name]) || "Al Miku-AI",
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
                    newsletterJid: _optionalChain([_configjs2.default, 'access', _39 => _39.saluran, 'optionalAccess', _40 => _40.id]) || "120363400911374213@newsletter",
                    newsletterName: _optionalChain([_configjs2.default, 'access', _41 => _41.saluran, 'optionalAccess', _42 => _42.name]) || _optionalChain([_configjs2.default, 'access', _43 => _43.bot, 'optionalAccess', _44 => _44.name]) || "Al Miku-AI",
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
        await m.reply(txt);
        break;
    }
  } catch (err) {
    await m.reply(txt);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

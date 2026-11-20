"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikujs = require('../../case/almiku.js');




var _almiku = require('almiku');
var _canvas = require('@napi-rs/canvas');
var _sharp2 = require('sharp'); var _sharp3 = _interopRequireDefault(_sharp2);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);



var _almikuformatterjs = require('../../src/lib/almiku-formatter.js');



var _almikupluginsjs = require('../../src/lib/almiku-plugins.js');
var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);

function getSharp() {
  return _sharp3.default;
}
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);

const pluginConfig = {
  name: "menu",
  alias: ["help", "bantuan", "commands", "m"],
  category: "main",
  description: "Muestra el menú principal del bot",
  usage: ".menu",
  example: ".menu",
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
  tools: "🛠️",
  fun: "🎮",
  game: "🎯",
  download: "📥",
  downloader: "📥",
  search: "🔍",
  sticker: "🖼️",
  media: "🎬",
  ai: "🤖",
  group: "👥",
  religi: "☪️",
  islamic: "🕌",
  info: "ℹ️",
  cek: "📁",
  user: "📊",
  canvas: "🎨",
  random: "🎲",
  ephoto: "🖌️",
  jpm: "📨",
  anime: "🍥",
  asupan: "🎞️",
  clan: "⚔️",
  convert: "🔄",
  berita: "📰",
  rpg: "🗡️",
  nsfw: "🔞",
  linode: "☁️",
  cecan: "💃",
  stalker: "🕵️",
  tts: "🗣️",
  vps: "🌊"
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
const toMonoUpperBold = (text) => {
  const chars = {
    A: "𝗔",
    B: "𝗕",
    C: "𝗖",
    D: "𝗗",
    E: "𝗘",
    F: "𝗙",
    G: "𝗚",
    H: "𝗛",
    I: "𝗜",
    J: "𝗝",
    K: "𝗞",
    L: "𝗟",
    M: "𝗠",
    N: "𝗡",
    O: "𝗢",
    P: "𝗣",
    Q: "𝗤",
    R: "𝗥",
    S: "𝗦",
    T: "𝗧",
    U: "𝗨",
    V: "𝗩",
    W: "𝗪",
    X: "𝗫",
    Y: "𝗬",
    Z: "𝗭",
  };
  return text
    .toUpperCase()
    .split("")
    .map((c) => chars[c] || c)
    .join("");
};
function getSortedCategories(m, botMode) {
  const categories = _almikupluginsjs.getCategories.call(void 0, );
  const commandsByCategory = _almikupluginsjs.getCommandsByCategory.call(void 0, );
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
    "ephoto",
    "jpm",
    "pushkontak",
    "store"
  ];
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
  const allowedCats = modeAllowedMap[botMode];
  const excludeCats = modeExcludeMap[botMode] || [];
  const sortedCats = [...categories].sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
  const result = [];
  let totalCmds = 0;
  for (const cat of sortedCats) {
    if (cat === "owner" && !m.isOwner) continue;
    if (allowedCats && !allowedCats.includes(cat.toLowerCase())) continue;
    if (excludeCats && excludeCats.includes(cat.toLowerCase())) continue;
    const cmds = commandsByCategory[cat] || [];
    if (cmds.length === 0) continue;
    const emoji = CATEGORY_EMOJIS[cat] || "📁";
    result.push({ cat, cmds, emoji });
  }
  for (const cat of categories) {
    totalCmds += (commandsByCategory[cat] || []).length;
  }
  return { sorted: result, totalCmds, commandsByCategory };
}
async function formatTime(date) {
  const timeHelper = await Promise.resolve().then(() => _interopRequireWildcard(require("../../src/lib/almiku-time.js")));
  return timeHelper.formatTime("HH:mm");
}
async function formatDateShort(date) {
  const timeHelper = await Promise.resolve().then(() => _interopRequireWildcard(require("../../src/lib/almiku-time.js")));
  return timeHelper.formatFull("dddd, DD MMMM YYYY");
}
async function buildMenuText(
  m,
  botConfig,
  db,
  uptime,
  botMode = "md",
  useBracketBoxStyle = false,
) {
  const prefix = _optionalChain([botConfig, 'access', _ => _.command, 'optionalAccess', _2 => _2.prefix]) || ".";
  const user = db.getUser(m.sender);
  const timeHelper = await Promise.resolve().then(() => _interopRequireWildcard(require("../../src/lib/almiku-time.js")));
  const timeStr = timeHelper.formatTime("HH:mm");
  const dateStr = timeHelper.formatFull("dddd, DD MMMM YYYY");
  const categories = _almikupluginsjs.getCategories.call(void 0, );
  const commandsByCategory = _almikupluginsjs.getCommandsByCategory.call(void 0, );
  let totalCommands = 0;
  for (const category of categories) {
    totalCommands += (commandsByCategory[category] || []).length;
  }
  const totalCases = _almikujs.getCaseCount.call(void 0, );
  const casesByCategory = _almikujs.getCasesByCategory.call(void 0, );
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
  const uptimeFormatted = _almikuformatterjs.formatUptime.call(void 0, uptime);
  const totalUsers = db.getUserCount();
  let txt = `${greeting}\n\n`;
  txt += `      ${m.pushName || "User"}\n\n`;
  txt += `Hola, amigo 🌱\n`;
  txt += `Soy ${_optionalChain([botConfig, 'access', _3 => _3.bot, 'optionalAccess', _4 => _4.name]) || "Denia Al"}, creado por ${_optionalChain([botConfig, 'access', _5 => _5.bot, 'optionalAccess', _6 => _6.developer]) || "Alesha"}. Estoy listo para ayudarte.\n`;
  txt += `Todo lo que necesitas, desde descargas\n`;
  txt += `vídeos, juegos, stickers y búsquedas\n`;
  txt += `IA, crear stickers y mucho más.\n\n`;

  txt += `*INFO DEL USUARIO*\n`;
  txt += `╭   • Nombre : ${m.pushName || "User"}\n`;
  txt += `┆   • Rango  : ${userRole}\n`;
  txt += `┆   • Modo   : ${(botConfig.mode || "public").toUpperCase()}\n`;
  txt += `┆   • Número : ${m.sender.split("@")[0]}\n`;
  txt += `┆   • Hora   : ${timeStr} ART\n`;
  txt += `╰➤------------------------------\n`;

  txt += `*INFO DEL BOT*\n`;
  txt += `╭  • Nombre : ${_optionalChain([botConfig, 'access', _7 => _7.bot, 'optionalAccess', _8 => _8.name]) || "Al Miku-AI"}\n`;
  txt += `┆  • Autor  : ${_optionalChain([botConfig, 'access', _9 => _9.bot, 'optionalAccess', _10 => _10.developer]) || "Owner"}\n`;
  txt += `┆  • Versión: ${_optionalChain([botConfig, 'access', _11 => _11.bot, 'optionalAccess', _12 => _12.version]) || "1.2.0"}\n`;
  txt += `┆  • Type script : AL MIKU x ${_optionalChain([botConfig, 'access', _13 => _13.bot, 'optionalAccess', _14 => _14.developer]) || "Owner"}\n`;
  txt += `┆  • Activo : ${uptimeFormatted}\n`;
  txt += `╰➤------------------------------\n`;
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
    "ephoto",
    "jpm",
    "pushkontak",
    "store"
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
    const botmodePlugin = await Promise.resolve().then(() => _interopRequireWildcard(require("../group/botmode.js")));
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
  const categoryLines = [];
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
    const totalCmds = pluginCmds.length + caseCmds.length;
    if (totalCmds === 0) continue;
    const emoji = CATEGORY_EMOJIS[category] || "📁";
    categoryLines.push(`${prefix}menucat ${category} ${emoji}`);
  }
  if (categoryLines.length > 0) {
    txt += ` ✦ MENÚ ✦\n`;
    txt += `╭   • ${categoryLines[0]}\n`;
    for (let i = 1; i < categoryLines.length; i++) {
      txt += `┆   • ${categoryLines[i]}\n`;
    }
    txt += `╰➤------------------------------\n`;
  }
  return txt;
}

function createBracketBox(title, lines = [], emoji = "🤖") {
  let text = `╭─〔 ${emoji} \`${title}\`〕─⬣\n`;
  for (const line of lines) {
    text += `│ ✦ *${line}*\n`;
  }
  text += `╰─⬣\n\n`;
  return text;
}

function getContextInfo(
  botConfig,
  m,
  thumbBuffer,
  renderLargerThumbnail = false,
) {
  const saluranId = _optionalChain([botConfig, 'access', _15 => _15.saluran, 'optionalAccess', _16 => _16.id]) || "120363400911374213@newsletter";
  const saluranName =
    _optionalChain([botConfig, 'access', _17 => _17.saluran, 'optionalAccess', _18 => _18.name]) || _optionalChain([botConfig, 'access', _19 => _19.bot, 'optionalAccess', _20 => _20.name]) || "Al Miku-AI";
  const saluranLink = _optionalChain([botConfig, 'access', _21 => _21.saluran, 'optionalAccess', _22 => _22.link]) || "";
  const ctx = {
    mentionedJid: [m.sender],
    forwardingScore: 9,
    isForwarded: true,
    externalAdReply: {
      title: _optionalChain([botConfig, 'access', _23 => _23.bot, 'optionalAccess', _24 => _24.name]) || "Al Miku-AI",
      body: `BOT whatsAPPP MULTI DEVICE`,
      sourceUrl: saluranLink,
      previewType: "VIDEO",
      showAdAttribution: false,
      renderLargerThumbnail,
    },
  };
  if (thumbBuffer) ctx.externalAdReply.thumbnail = thumbBuffer;
  return ctx;
}
function getVerifiedQuoted(botConfig, m) {
  if (m) {
    return {
      key: {
        participant: `${m.sender}`,
        remoteJid: `status@broadcast`,
      },
      message: {
        contactMessage: {
          displayName: `🍂 Yth. ${m.pushName}`,
          vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;ttname,;;;\nFN:ttname\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
          sendEphemeral: true,
        },
      },
    };
  }
  return {
    key: {
      participant: `0@s.whatsapp.net`,
      remoteJid: `status@broadcast`,
    },
    message: {
      contactMessage: {
        displayName: `🪸 ${_optionalChain([botConfig, 'access', _25 => _25.bot, 'optionalAccess', _26 => _26.name])}`,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;ttname,;;;\nFN:ttname\nitem1.TEL;waid=13135550002:+1 (313) 555-0002\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
        sendEphemeral: true,
      },
    },
  };
}

async function handler(m, { sock, config: botConfig, db, uptime }) {
  const savedVariant = db.setting("menuVariant");
  const menuVariant = savedVariant || _optionalChain([botConfig, 'access', _27 => _27.ui, 'optionalAccess', _28 => _28.menuVariant]) || 1;
  const groupData = m.isGroup ? db.getGroup(m.chat) || {} : {};
  const botMode = groupData.botMode || "md";
  const text = await buildMenuText(
    m,
    botConfig,
    db,
    uptime,
    botMode,
    menuVariant === 9,
  );

  let imageBuffer = null;
  let thumbBuffer = null;
  let videoBuffer = null;

  try {
    imageBuffer = _fs2.default.readFileSync(botConfig.assets["almiku"])
    thumbBuffer = _fs2.default.readFileSync(botConfig.assets["almiku2"])
  } catch (e) {
    console.error("Cargando el menú:", e.message);
  }
  const prefix = _optionalChain([botConfig, 'access', _29 => _29.command, 'optionalAccess', _30 => _30.prefix]) || ".";
  const saluranId = _optionalChain([botConfig, 'access', _31 => _31.saluran, 'optionalAccess', _32 => _32.id]) || "120363400911374213@newsletter";
  const saluranName =
    _optionalChain([botConfig, 'access', _33 => _33.saluran, 'optionalAccess', _34 => _34.name]) || _optionalChain([botConfig, 'access', _35 => _35.bot, 'optionalAccess', _36 => _36.name]) || "Al Miku-AI";
  const saluranLink =
    _optionalChain([botConfig, 'access', _37 => _37.saluran, 'optionalAccess', _38 => _38.link]) ||
    "https://whatsapp.com/channel/0029VbB37bgBfxoAmAlsgE0t";
  const {
    sorted: menuSorted,
    totalCmds,
    commandsByCategory,
  } = getSortedCategories(m, botMode);
  const greeting = _almikuformatterjs.getTimeGreeting.call(void 0, );
  const uptimeFormatted = _almikuformatterjs.formatUptime.call(void 0, uptime);
  const user = await db.getUser(m.sender) || {}
  try {
    const categories = getSortedCategories(m, botMode);
    const availableCats = new Set(categories.sorted.map(({ cat }) => cat.toLowerCase()));
    const categoryMeta = [
      { key: "owner", label: "Propietario", emoji: "👑", type: "category" },
      { key: "main", label: "Menú principal", emoji: "🏠", type: "command", command: "menu" },
      { key: "utility", label: "Utility", emoji: "🔧", type: "category" },
      { key: "tools", label: "Tools", emoji: "🛠️", type: "category" },
      { key: "fun", label: "Fun", emoji: "🎮", type: "category" },
      { key: "game", label: "Game", emoji: "🎯", type: "category" },
      { key: "newgame", label: "New Game", emoji: "🆕", type: "command", command: "gamenew" },
      { key: "download", label: "Download", emoji: "📥", type: "category" },
      { key: "search", label: "Search", emoji: "🔍", type: "category" },
      { key: "sticker", label: "Sticker", emoji: "🖼️", type: "category" },
      { key: "media", label: "Media", emoji: "🎬", type: "category" },
      { key: "ai", label: "AI", emoji: "🤖", type: "category" },
      { key: "group", label: "Group", emoji: "👥", type: "category" },
      { key: "religi", label: "Religi", emoji: "☪️", type: "category" },
      { key: "info", label: "Info", emoji: "ℹ️", type: "category" },
      { key: "cek", label: "Cek", emoji: "📋", type: "category" },
      { key: "user", label: "User", emoji: "👤", type: "category" },
      { key: "canvas", label: "Canvas", emoji: "🎨", type: "category" },
      { key: "random", label: "Random", emoji: "🎲", type: "category" },
      { key: "ephoto", label: "Ephoto", emoji: "✨", type: "category" },
      { key: "jpm", label: "JPM", emoji: "📢", type: "category" },
      { key: "asupan", label: "Asupan", emoji: "🍑", type: "category" },
      { key: "maker", label: "Maker", emoji: "🧰", type: "category" },
      { key: "clan", label: "Clan", emoji: "⚔️", type: "category" },
      { key: "convert", label: "Convert Song", emoji: "🔄", type: "category" },
      { key: "download", label: "Downloader", emoji: "⬇️", type: "category" },
      { key: "info", label: "Berita", emoji: "📰", type: "category" },
      { key: "islamic", label: "Islamic", emoji: "🕌", type: "category" },
      { key: "rpg", label: "RPG", emoji: "🗡️", type: "category" },
      { key: "nsfw", label: "NSFW", emoji: "🔞", type: "category" },
      { key: "linode", label: "Linode", emoji: "☁️", type: "category" },
      { key: "cecan", label: "Cecan", emoji: "💃", type: "category" },
      { key: "stalker", label: "Stalker", emoji: "🕵️", type: "category" },
      { key: "tts", label: "TTS", emoji: "🗣️", type: "category" },
      { key: "vps", label: "VPS", emoji: "🌊", type: "category" },
    ];
    const seenRows = new Set();
    const zann_pengin_rehat = categoryMeta.flatMap((item) => {
      if (item.key === "owner" && !m.isOwner) return [];
      if (item.type === "category" && !availableCats.has(item.key)) return [];
      const id = item.type === "command" ? `${m.prefix}${item.command}` : `${m.prefix}menucat ${item.key}`;
      if (seenRows.has(id)) return [];
      seenRows.add(id);
      const count = item.type === "category" ? (_optionalChain([categories, 'access', _39 => _39.sorted, 'access', _40 => _40.find, 'call', _41 => _41(x => x.cat.toLowerCase() === item.key), 'optionalAccess', _42 => _42.cmds, 'access', _43 => _43.length]) || 0) : 0;
      return [{
        title: `${item.emoji} ${item.label}`,
        description: count ? `${count} comandos disponibles` : "Abrir este menú",
        id,
      }];
    });
    switch (menuVariant) {
      case 1:
        if (imageBuffer) {
          const displayName = m.pushName || "Usuario";
          const mention = `@${m.sender.split("@")[0]}`;
          const statusText = _optionalChain([m, 'optionalAccess', _44 => _44.isOwner])
            ? "𝗕𝘂𝗸𝗮𝗻, 𝘁𝗮𝗽𝗶 𝗢𝘄𝗻𝗲𝗿"
            : _optionalChain([m, 'optionalAccess', _45 => _45.isPremium])
              ? "𝗕𝘂𝗸𝗮𝗻, 𝘁𝗮𝗽𝗶 𝗣𝗿𝗲𝗺𝗶𝘂𝗺"
              : "𝗣𝗲𝗻𝗴𝗴𝘂𝗻𝗮";
          const userName = toMonoUpperBold(displayName);
          const botName = _optionalChain([botConfig, 'access', _46 => _46.bot, 'optionalAccess', _47 => _47.name]) || "𝗔𝗟 𝗠𝗜𝗞𝗤 𝗗𝗘𝗟𝗨𝗫𝗘";
          const botVersion = _optionalChain([botConfig, 'access', _48 => _48.bot, 'optionalAccess', _49 => _49.version]) || "3.4";
          const developer = _optionalChain([botConfig, 'access', _50 => _50.bot, 'optionalAccess', _51 => _51.developer]) || "Zann";
          const userLevel = _optionalChain([user, 'optionalAccess', _52 => _52.level]) || 0;
          const userExp = _optionalChain([user, 'optionalAccess', _53 => _53.exp]) || 0;
          const userEnergi = _nullishCoalesce(_optionalChain([user, 'optionalAccess', _54 => _54.energi]), () => ( 0));
          const userKoin = _nullishCoalesce(_optionalChain([user, 'optionalAccess', _55 => _55.koin]), () => ( 0));
          const registered = _optionalChain([user, 'optionalAccess', _56 => _56.isRegistered]) ? "𝗦𝘂𝗱𝗮𝗵" : "𝗕𝗲𝗹𝘂𝗺";

          const menuCaption =
          `✦ ʜᴀɪ ${mention} 👋\n\n` +
            `ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ\n` +
            `ᴀʟ ᴍɪᴋᴜ ᴅᴇʟᴜxᴇ.\n\n` +
            `┌───「 ʙᴏᴛ ɪɴғᴏʀᴍᴀᴛɪᴏɴ 」\n` +
            `├ ɴᴀᴍᴇ : ᴀʟ ᴍɪᴋᴜ ᴅᴇʟᴜxᴇ\n` +
            `├ ᴠᴇʀsɪᴏɴ : ${botVersion}\n` +
            `├ ᴅᴇᴠᴇʟᴏᴘᴇʀ : ${developer}\n` +
            `└ ʟɪʙʀᴀʀʏ : almiku-baileys\n\n` +
            `┌───「 ᴜsᴇʀ ɪɴғᴏʀᴍᴀᴛɪᴏɴ 」\n` +
            `├ ɴᴀᴍᴇ : ${userName}\n` +
            `├ sᴛᴀᴛᴜs : ${statusText}\n` +
            `├ ʟᴇᴠᴇʟ : ${userLevel}\n` +
            `├ ᴇxᴘ : ${userExp}\n` +
            `├ ᴇɴᴇʀɢʏ : ${userEnergi}\n` +
            `├ ᴄᴏɪɴs : ${userKoin}\n` +
            `└ ʀᴇɢɪsᴛᴇʀ : ${registered}\n\n` +
            `✦ ᴄʜᴏᴏsᴇ ᴀ ᴍᴇɴᴜ ᴄᴀᴛᴇɢᴏʀʏ ʙᴇʟᴏᴡ ᴛᴏ ᴇxᴘʟᴏʀᴇ ᴀᴠᴀɪʟᴀʙʟᴇ ᴄᴏᴍᴍᴀɴᴅs.\n\n` +
            `┌───「 ᴘᴀɴᴇʟ ʜᴏsᴛɪɴɢ 」\n` +
            `│ ɴᴇᴇᴅ ᴀ ʟᴇɢᴀʟ & ʀᴇʟɪᴀʙʟᴇ ᴘᴀɴᴇʟ?\n` +
            `└ store.roselynsound.my.id\n\n` +
            `© ʀᴇᴍᴀᴋᴇ ʙʏ ғᴀʟʟᴢx`

          await sock.sendMessage(m.chat, {
            image: _fs2.default.readFileSync(
              botConfig.assets["almiku-menu-header-blue"] || botConfig.assets["almiku"],
            ),
            caption: menuCaption,
            footer: `𝗔𝗟 𝗠𝗜𝗞𝗤 𝗗𝗘𝗟𝗨𝗫𝗘 • 𝗩${botVersion}`,
            interactiveButtons: [
              {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                  title: "🍃 𝗠𝗲𝗻𝘂 𝗨𝘁𝗮𝗺𝗮",
                  sections: [
                    {
                      title: "𝗣𝗶𝗹𝗶𝗵 𝗸𝗮𝘁𝗲𝗴𝗼𝗿𝗶",
                      rows: zann_pengin_rehat,
                    },
                  ],
                  icon: "DEFAULT",
                }),
              },
              {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                  title: "✨ 𝗦𝗲𝗹𝗲𝗻𝗴𝗸𝗮𝗽𝗻𝘆𝗮",
                  sections: [
                    {
                      title: "𝗣𝗶𝗹𝗶𝗵 𝗺𝗲𝗻𝘂",
                      rows: [
                        {
                          title: "📚 𝗦𝗲𝗺𝘂𝗮 𝗠𝗲𝗻𝘂",
                          description: "Muestra todos los comandos disponibles.",
                          id: `${m.prefix}allmenu`,
                        },
                        {
                          title: "🆕 𝗡𝗲𝘄 𝗚𝗮𝗺𝗲",
                          description: "Chess • Dino • MBIM • Plane • TTC",
                          id: `${m.prefix}gamenew`,
                        },
                        {
                          title: "👑 𝗢𝘄𝗻𝗲𝗿",
                          description: "Información del propietario del bot",
                          id: `${m.prefix}owner`,
                        },
                      ],
                    },
                  ],
                  icon: "REVIEW",
                }),
              },
            ],
          }, {
            quoted: getVerifiedQuoted(botConfig, m),
            mentions: [m.sender],
          });
        } else {
          await m.reply(text);
        }
        break;
      case 9: {
        //V9: encabezado de imagen + captura ingenua + ingenuo WhatsApp lista botones.
        //Los datos del usuario siempre proceden de m.
        const displayName = m.pushName || "Usuario";
        const mention = `@${m.sender.split("@")[0]}`;
        const botName = _optionalChain([botConfig, 'access', _57 => _57.bot, 'optionalAccess', _58 => _58.name]) || "AL MIKU DELUXE";
        const botVersion = _optionalChain([botConfig, 'access', _59 => _59.bot, 'optionalAccess', _60 => _60.version]) || "3.4";
        const developer = _optionalChain([botConfig, 'access', _61 => _61.bot, 'optionalAccess', _62 => _62.developer]) || "Zann";
        const userLevel = _nullishCoalesce(_optionalChain([user, 'optionalAccess', _63 => _63.level]), () => ( 0));
        const userExp = _nullishCoalesce(_optionalChain([user, 'optionalAccess', _64 => _64.exp]), () => ( 0));
        const userEnergi = _nullishCoalesce(_optionalChain([user, 'optionalAccess', _65 => _65.energi]), () => ( 0));
        const userKoin = _nullishCoalesce(_optionalChain([user, 'optionalAccess', _66 => _66.koin]), () => ( 0));
        const registered = _optionalChain([user, 'optionalAccess', _67 => _67.isRegistered]) ? "𝗦𝘂𝗱𝗮𝗵" : "𝗕𝗲𝗹𝘂𝗺";
        const role = m.isOwner ? "𝗕𝘂𝗸𝗮𝗻, 𝘁𝗮𝗽𝗶 𝗢𝘄𝗻𝗲𝗿" : m.isPremium ? "𝗣𝗿𝗲𝗺𝗶𝘂𝗺" : "𝗨𝘀𝗲𝗿";

        const menuCaption =
`✦ ʜᴀɪ ${mention} 👋\n\n` +
          `ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ᴀʟ ᴍɪᴋᴜ ᴅᴇʟᴜxᴇ.\n` +
          `ʏᴏᴜʀ ᴘᴇʀsᴏɴᴀʟ ᴡʜᴀᴛsᴀᴘᴘ ᴀssɪsᴛᴀɴᴛ.\n\n` +
          `┌───「 ʙᴏᴛ ɪɴғᴏʀᴍᴀᴛɪᴏɴ 」\n` +
          `├ ɴᴀᴍᴇ : ${botName}\n` +
          `├ ᴠᴇʀsɪᴏɴ : ${botVersion}\n` +
          `├ ᴅᴇᴠᴇʟᴏᴘᴇʀ : ${developer}\n` +
          `└ ʟɪʙʀᴀʀʏ : almiku-baileys\n\n` +
          `┌───「 ᴜsᴇʀ ɪɴғᴏʀᴍᴀᴛɪᴏɴ 」\n` +
          `├ ɴᴀᴍᴇ : ${toMonoUpperBold(displayName)}\n` +
          `├ sᴛᴀᴛᴜs : ${role}\n` +
          `├ ʟᴇᴠᴇʟ : ${userLevel}\n` +
          `├ ᴇxᴘ : ${userExp}\n` +
          `├ ᴇɴᴇʀɢʏ : ${userEnergi}\n` +
          `├ ᴄᴏɪɴs : ${userKoin}\n` +
          `└ ʀᴇɢɪsᴛᴇʀ : ${registered}\n\n` +
          `✦ ᴛᴀᴘ ᴛʜᴇ ʙᴜᴛᴛᴏɴ ʙᴇʟᴏᴡ ᴛᴏ ᴇxᴘʟᴏʀᴇ ᴛʜᴇ ᴍᴇɴᴜ.\n\n` +
          `┌───「 ᴘᴀɴᴇʟ ʜᴏsᴛɪɴɢ 」\n` +
          `│ ɴᴇᴇᴅ ᴀ ʟᴇɢᴀʟ & ʀᴇʟɪᴀʙʟᴇ ᴘᴀɴᴇʟ?\n` +
          `└ ${"store.roselynsound.my.id"}\n\n` +
          `© ғᴀʟʟᴢx sᴛᴏʀᴇ`;

        const requested = [
          ["owner", "👑", "Propietario"], ["main", "🏠", "Menú principal"],
          ["utility", "🔧", "Utility"], ["tools", "🛠️", "Tools"],
          ["fun", "🎮", "Fun"], ["game", "🎯", "Game"],
          ["newgame", "🆕", "New Game"], ["download", "📥", "Download"],
          ["search", "🔍", "Search"], ["sticker", "🖼️", "Sticker"],
          ["media", "🎬", "Media"], ["ai", "🤖", "AI"],
          ["group", "👥", "Group"], ["religi", "☪️", "Religi"],
          ["info", "ℹ️", "Info"], ["cek", "📋", "Cek"],
          ["user", "👤", "User"], ["canvas", "🎨", "Canvas"],
          ["random", "🎲", "Random"], ["ephoto", "✨", "Ephoto"],
          ["jpm", "📢", "JPM"], ["asupan", "🍑", "Asupan"],
          ["maker", "🧰", "Maker"], ["clan", "⚔️", "Clan"],
          ["convert", "🔄", "Convert Song"], ["downloader", "⬇️", "Downloader"],
          ["berita", "📰", "Berita"], ["islamic", "🕌", "Islamic"],
          ["rpg", "🗡️", "RPG"], ["test", "🧪", "Test"],
          ["nsfw", "🔞", "NSFW"], ["linode", "☁️", "Linode"],
          ["cecan", "💃", "Cecan"],
          ["stalker", "🕵️", "Stalker"], ["tts", "🗣️", "TTS"],
          ["vps", "🌊", "VPS"],
        ];

        const rows = [];
        for (const [key, emoji, label] of requested) {
          if (key === "owner" && !m.isOwner) continue;
          if (key === "newgame") {
            rows.push({ title: `${emoji} 𝗡𝗲𝘄 𝗚𝗮𝗺𝗲`, description: "Chess • Dino • MBIM • Plane • TTC", id: `${prefix}gamenew` });
            continue;
          }
          if (!availableCats.has(key)) continue;
          const count = _optionalChain([categories, 'access', _68 => _68.sorted, 'access', _69 => _69.find, 'call', _70 => _70(x => x.cat.toLowerCase() === key), 'optionalAccess', _71 => _71.cmds, 'access', _72 => _72.length]) || 0;
          rows.push({ title: `${emoji} ${toMonoUpperBold(label)}`, description: `${count} comandos disponibles`, id: `${prefix}menucat ${key}` });
        }

        const sections = [];
        for (let i = 0; i < rows.length; i += 10) {
          sections.push({ title: `𝗠𝗘𝗡𝗨 ${Math.floor(i / 10) + 1}`, rows: rows.slice(i, i + 10) });
        }
        const buttons = [
          {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: "🍃 𝗠𝗲𝗻𝘂 𝗨𝘁𝗮𝗺𝗮",
              sections,
            }),
          },
          {
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
              display_text: "🆕 𝗡𝗲𝘄 𝗚𝗮𝗺𝗲",
              id: `${prefix}gamenew`,
            }),
          },
        ];

        const imagePath = _optionalChain([botConfig, 'access', _73 => _73.assets, 'optionalAccess', _74 => _74["almiku-menu-header-blue"]]) || _optionalChain([botConfig, 'access', _75 => _75.assets, 'optionalAccess', _76 => _76.almiku]);
        if (!imagePath || !_fs2.default.existsSync(imagePath)) {
          await m.reply(menuCaption, { mentions: [m.sender] });
          break;
        }

        await sock.sendButton(
          m.chat,
          _fs2.default.readFileSync(imagePath),
          menuCaption,
          m,
          {
            buttons,
            footer: `𝗔𝗟 𝗠𝗜𝗞𝗤 𝗗𝗘𝗟𝗨𝗫𝗘 • 𝗩${botVersion}`,
            contextInfo: { mentionedJid: [m.sender] },
          },
        );
        break;
      }

      case 2:
        let s = ""
        categories.sorted.map(({ cat, cmds, emoji }) => {
          s += `╭─☰ ${toMonoUpperBold(cat)}\n`
          cmds.map((cmd) => {
            s += `> ${m.prefix}${cmd}\n`
          })
          s += "╰─⬣\n\n"
        });
        const media = await _almiku.prepareWAMessageMedia.call(void 0, {
          image: _fs2.default.readFileSync(_configjs2.default.assets["almiku"])
        }, { upload: sock.waUploadToServer })
        const readmore = String.fromCharCode(8206).repeat(4001)
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
  text: `✦ *ʜᴇʟʟᴏ, ${m.pushName}*

ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ${botConfig.bot?.name}.
ʏᴏᴜʀ ᴘᴇʀsᴏɴᴀʟ ᴡʜᴀᴛsᴀᴘᴘ ᴀssɪsᴛᴀɴᴛ.

┌───「 ʙᴏᴛ ɪɴғᴏʀᴍᴀᴛɪᴏɴ 」
├ ɴᴀᴍᴇ : ${botConfig.bot?.name}
├ ᴠᴇʀsɪᴏɴ : ${botConfig.bot?.version}
├ ᴅᴇᴠᴇʟᴏᴘᴇʀ : ${botConfig.bot?.developer}
└────────────────────

┌───「 ᴜsᴇʀ ɪɴғᴏʀᴍᴀᴛɪᴏɴ 」
├ ɴᴀᴍᴇ : ${m.pushName}
├ ʀᴏʟᴇ : ${m?.isOwner ? "Owner" : m?.isPremium ? "Premium" : "User"}
└────────────────────

✦ *ᴀᴠᴀɪʟᴀʙʟᴇ ғᴇᴀᴛᴜʀᴇs*
ᴄʜᴏᴏsᴇ ᴀ ᴍᴇɴᴜ ʙᴇʟᴏᴡ ᴛᴏ ɢᴇᴛ sᴛᴀʀᴛᴇᴅ.

┌───「 ᴘᴀɴᴇʟ ʜᴏsᴛɪɴɢ 」
│ ɴᴇᴇᴅ ᴀ ʟᴇɢᴀʟ & ʀᴇʟɪᴀʙʟᴇ ᴘᴀɴᴇʟ?
└ store.roselynsound.my.id

© ʀᴇᴍᴀᴋᴇ ʙʏ ғᴀʟʟᴢx
${readmore}${s}`
                  },
                  footer: {
                    text: "Selecciona un botón para ver más información"
                  },
                  contextInfo: {
                    isForwarded: true,
                    fprwardingScore: 9,
                    participant: "0@s.whatsapp.net",
                    quotedMessage: {
                      conversation: `${_optionalChain([_configjs2.default, 'access', _87 => _87.bot, 'optionalAccess', _88 => _88.name])}`
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
                        copy_code: "Creado por " + _optionalChain([_configjs2.default, 'access', _89 => _89.bot, 'optionalAccess', _90 => _90.developer]),
                        expiration_time: Date.now() + 1000000,
                      },
                      bottom_sheet: {
                        in_thread_buttons_limit: 2,
                        divider_indices: [1, 2, 3, 4, 5, 999],
                        list_title: "Elige el menú que quieras abrir.",
                        button_title: "🍅 Ver todo",
                      },
                      tap_target_configuration: {
                        title: " X ",
                        description: "bomboclard",
                        canonical_url: "https://ourin.site",
                        domain: "shop.example.com",
                        button_index: 0,
                      },
                    }),
                    buttons: [
                      {
                        name: "single_select",
                        buttonParamsJson: JSON.stringify({
                          has_multiple_buttons: true
                        })
                      },
                      {
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                          display_text: "🍫 Nosotros",
                          url: `https://wa.me/${_optionalChain([botConfig, 'access', _91 => _91.owner, 'optionalAccess', _92 => _92.number, 'optionalAccess', _93 => _93[0]])}`,
                          merchant_url: `https://wa.me/${_optionalChain([_configjs2.default, 'access', _94 => _94.owner, 'optionalAccess', _95 => _95.number, 'optionalAccess', _96 => _96[0]])}`,
                        })
                      },
                      {
                        name: "quick_reply",
                        buttonParamsJson: JSON.stringify({
                          display_text: "🍛 Obtener el script (gratis)",
                          id: `${m.prefix}sc`
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

      case 3:
        const content = {
          buttonsMessage: {
            buttons: [
              {
                buttonId: `${m.prefix}owner`,
                buttonText: {
                  displayText: '🧀 Propietario',
                },
                type: 1,
              },
              {
                buttonId: `${m.prefix}allmenu`,
                buttonText: {
                  displayText: '💐 Todos los comandos',
                },
                type: 1,
              },
            ],
            locationMessage: {
              jpegThumbnail: await _sharp3.default.call(void 0, _fs2.default.readFileSync(_configjs2.default.assets["almiku"])).resize(300, 170).toBuffer(),
              name: _configjs2.default.bot.name,
              address: `Versión: ${_configjs2.default.bot.version}`
            },
            contentText: `✦ *ʜᴇʟʟᴏ, ${m.pushName}*

ᴡᴇʟᴄᴏᴍᴇ ᴛᴏ ${_configjs2.default.bot?.name}.

┌───「 ʙᴏᴛ ɪɴғᴏʀᴍᴀᴛɪᴏɴ 」
├ ɴᴀᴍᴇ : ${_configjs2.default.bot?.name}
├ ᴠᴇʀsɪᴏɴ : ${_configjs2.default.bot?.version}
├ ᴅᴇᴠᴇʟᴏᴘᴇʀ : ${_configjs2.default.bot?.developer}
├ sᴛᴀᴛᴜs : ${m?.isOwner ? "Owner" : m?.isPremium ? "Premium" : "User"}
└────────────────────

✦ *ᴀᴠᴀɪʟᴀʙʟᴇ ғᴇᴀᴛᴜʀᴇs*
ᴄʜᴏᴏsᴇ ᴀ ᴍᴇɴᴜ ʙᴇʟᴏᴡ ᴛᴏ ɢᴇᴛ sᴛᴀʀᴛᴇᴅ.

┌───「 ᴘᴀɴᴇʟ ʜᴏsᴛɪɴɢ 」
│ ɴᴇᴇᴅ ᴀ ʟᴇɢᴀʟ & ʀᴇʟɪᴀʙʟᴇ ᴘᴀɴᴇʟ?
└ store.roselynsound.my.id`,
            footerText: '🍔Por favor, seleccione uno de los putool en el crudo',
            headerType: 6,
          },
        };

        const msg = _almiku.generateWAMessageFromContent.call(void 0, m.chat, content, {
          userJid: sock.user.jid,
        });

        await sock.relayMessage(m.chat, msg.message, {
          messageId: msg.key.id,
        });
        break

      case 4: {
        const thumbnail = await _sharp3.default.call(void 0, _fs2.default.readFileSync(_configjs2.default.assets["almiku"])).resize(300, 300).toBuffer()
        const qvideo = {
          key: {
            fromMe: false,
            participant: m.sender
          },
          message: {
            videoMessage: {
              caption: _configjs2.default.bot.name,
              seconds: 999999999,
              mimetype: "video/mp4",
              jpegThumbnail: thumbnail,
              fileLength: "9999999"
            }
          }
        }
        const media4 = await _almiku.prepareWAMessageMedia.call(void 0, {
          video: _fs2.default.readFileSync(_configjs2.default.assets["almiku-mp4"]),
          gifPlayback: true
        }, { upload: sock.waUploadToServer });
        let singlePush = categories.sorted.map(cat => {
          return {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: `${cat.emoji} ${cat.cat}Menú`,
              sections: [
                {
                  title: "Please select the command",
                  highlight_label: _configjs2.default.bot.name,
                  rows: cat.cmds.map((cmd, i) => {
                    return {
                      title: (i + 1).toString() + " " + cmd,
                      description: "Select this command?",
                      id: `${prefix}${cmd}`
                    }
                  })
                }
              ],
              icon: "REVIEW"
            })
          }
        })
        const msg4 = _almiku.generateWAMessageFromContent.call(void 0, m.chat, {
          viewOnceMessage: {
            message: {
              messageContextInfo: {},
              interactiveMessage: {
                header: {
                  title: "",
                  subtitle: "",
                  hasMediaAttachment: true,
                  videoMessage: media4.videoMessage
                },
                footer: {
                  text: `Please select the button in below`
                },
                body: {
                  text: `*${greeting} ${m.pushName}*, ᴍʏ ɴᴀᴍᴇ ɪs ${_configjs2.default.bot.name}.

✦ ɪ ᴄᴀɴ ʜᴇʟᴘ ʏᴏᴜ ᴡɪᴛʜ ᴠᴀʀɪᴏᴜs ᴛᴀsᴋs ᴡɪᴛʜɪɴ ᴡʜᴀᴛsᴀᴘᴘ. ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴊᴀᴠᴀsᴄʀɪᴘᴛ ᴀɴᴅ ᴅᴇᴠᴇʟᴏᴘᴇᴅ ᴡɪᴛʜ ᴘʀᴇᴄɪsɪᴏɴ.

┌───「 ʙᴏᴛ ɪɴғᴏʀᴍᴀᴛɪᴏɴ 」
├ ᴄʀᴇᴀᴛᴏʀ : ${_configjs2.default.bot?.developer}
├ ɴᴀᴍᴇ : ${_configjs2.default.bot?.name}
├ ᴠᴇʀsɪᴏɴ : ${_configjs2.default.bot?.version}
├ ᴛʏᴘᴇ : Plugin x Cases
├ ᴍᴏᴅᴇ : ${_configjs2.default.mode === 'public' ? 'Public' : 'Private'}
└────────────────────

✦ ᴇɴᴊᴏʏ ʏᴏᴜʀ ᴇxᴘᴇʀɪᴇɴᴄᴇ.

┌───「 ᴘᴀɴᴇʟ ʜᴏsᴛɪɴɢ 」
│ ɴᴇᴇᴅ ᴀ ʟᴇɢᴀʟ & ʀᴇʟɪᴀʙʟᴇ ᴘᴀɴᴇʟ?
└ store.roselynsound.my.id

© ʀᴇᴍᴀᴋᴇ ʙʏ ғᴀʟʟᴢx`
                },
                contextInfo: {
                  mentionedJid: [m.sender],
                  isForwarded: true,
                  forwardingScore: 9,
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: saluranId,
                    newsletterName: saluranName,
                    serverMessageId: 127,
                  },
                },
                nativeFlowMessage: {
                  messageParamsJson: JSON.stringify({
                    bottom_sheet: {
                      in_thread_buttons_limit: 2,
                      divider_indices: [1, 2, 3, 4, 5, 999],
                      list_title: "Seleccione el menú",
                      button_title: "🍙 See Category",
                    },
                    tap_target_configuration: {
                      title: " X ",
                      description: "bomboclard",
                      canonical_url: "https://ourin.site",
                      domain: "shop.example.com",
                      button_index: 0,
                    },
                  }),
                  buttons: [
                    {
                      name: "cta_url",
                      buttonParamsJson: JSON.stringify({
                        display_text: "🧀 Visit My Creator",
                        url: `https://wa.me/${_optionalChain([botConfig, 'access', _113 => _113.owner, 'optionalAccess', _114 => _114.number, 'optionalAccess', _115 => _115[0]])}`,
                        merchant_url: `https://wa.me/${_optionalChain([_configjs2.default, 'access', _116 => _116.owner, 'optionalAccess', _117 => _117.number, 'optionalAccess', _118 => _118[0]])}`,
                      })
                    },
                    ...singlePush
                  ]
                }
              }
            }
          }
        }, { quoted: qvideo, userJid: sock.user.jid });

        await sock.relayMessage(m.chat, msg4.message, {
          messageId: msg4.key.id,
        });
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
          0: "☀️ Cerah",
          1: "🌤️ Cerah Berawan",
          2: "⛅ Berawan",
          3: "☁️ Mendung",
          45: "🌫️ Berkabut",
          48: "🌫️ Kabut Tebal",
          51: "🌦️ Gerimis",
          61: "🌧️ Hujan Ringan",
          63: "🌧️ Hujan",
          65: "⛈️ Hujan Lebat",
          80: "🌦️ Hujan Lokal",
          95: "⛈️ Badai Petir"
        }

        async function weatherMenu(city = "Buenos Aires") {
          try {
            const geo = await _axios2.default.get(
              `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
            )

            const loc = _optionalChain([geo, 'access', _119 => _119.data, 'access', _120 => _120.results, 'optionalAccess', _121 => _121[0]])
            if (!loc) return "Cuaca no está disponible"

            const res = await _axios2.default.get(
              `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code`
            )

            const current = res.data.current
            const kondisi = weatherCode[current.weather_code] || "🌍No diketahui"

            return `${kondisi} | 🌡️ ${Math.round(current.temperature_2m)}°C\n📍 ${loc.name}`
          } catch (e2) {
            return "Cuaca no está disponible"
          }
        }
        const thumbnail = await _sharp3.default.call(void 0, _fs2.default.readFileSync(_configjs2.default.assets["almiku"])).resize(300, 300).toBuffer()
        const qOrder = {
          key: {
            fromMe: false,
            participant: '0@s.whatsapp.net',
            remoteJid: m.sender
          },
          message: {
            locationMessage: {
              degreesLatitude: 0,
              degreesLongitude: 0,
              name: await weatherMenu(),
              jpegThumbnail: thumbnail
            }
          }
        }
        const media4 = await _almiku.prepareWAMessageMedia.call(void 0, {
          video: _fs2.default.readFileSync(_configjs2.default.assets["almiku-mp4"]),
          gifPlayback: true
        }, { upload: sock.waUploadToServer });
        const msg4 = _almiku.generateWAMessageFromContent.call(void 0, m.chat, {
          viewOnceMessage: {
            message: {
              messageContextInfo: {},
              interactiveMessage: {
                header: {
                  title: "",
                  subtitle: "",
                  hasMediaAttachment: true,
                  videoMessage: media4.videoMessage
                },
                footer: {
                  text: `Please select the button in below`
                },
                body: {
                  text: `✦ ʜᴇʟʟᴏ, *${m.pushName}*

ɪ ᴀᴍ ${_configjs2.default.bot.name}, ᴀɴ ᴀᴜᴛᴏᴍᴀᴛᴇᴅ ᴡʜᴀᴛsᴀᴘᴘ ᴀssɪsᴛᴀɴᴛ ᴅᴇsɪɢɴᴇᴅ ᴛᴏ ʜᴇʟᴘ ʏᴏᴜ sᴇᴀʀᴄʜ, ᴘʀᴏᴄᴇss ᴀɴᴅ ʀᴇᴛʀɪᴇᴠᴇ ɪɴғᴏʀᴍᴀᴛɪᴏɴ.

┌───「 ʙᴏᴛ ɪɴғᴏʀᴍᴀᴛɪᴏɴ 」
├ ɴᴀᴍᴇ : ${_configjs2.default.bot.name}
├ ᴀᴜᴛʜᴏʀ : @${_configjs2.default.bot.developer}
├ sᴄʀɪᴘᴛ : Case x Plugins
├ ᴜᴘᴛɪᴍᴇ : ${runtime(process.uptime())}
└ ᴠᴇʀsɪᴏɴ : ${_configjs2.default.bot.version}

┌───「 ᴜsᴇʀ ɪɴғᴏʀᴍᴀᴛɪᴏɴ 」
├ ɴᴀᴍᴇ : ${m.pushName}
├ sᴛᴀᴛᴜs : ${m.isOwner ? "Owner" : m.isPremium ? "Premium" : "Free"}
├ ᴍᴏᴅᴇ : ${_configjs2.default.mode === "public" ? "Public" : "Private"}
├ ɴᴜᴍʙᴇʀ : @${m.sender.split("@")[0]}
└ ɢʀᴇᴇᴛɪɴɢ : ${greeting}

✦ ᴇɴᴊᴏʏ ʏᴏᴜʀ ᴇxᴘᴇʀɪᴇɴᴄᴇ.

┌───「 ᴘᴀɴᴇʟ ʜᴏsᴛɪɴɢ 」
│ ɴᴇᴇᴅ ᴀ ʟᴇɢᴀʟ & ʀᴇʟɪᴀʙʟᴇ ᴘᴀɴᴇʟ?
└ store.roselynsound.my.id

© ʀᴇᴍᴀᴋᴇ ʙʏ ғᴀʟʟᴢx
`
                },
                contextInfo: {
                  mentionedJid: [m.sender],
                  isForwarded: true,
                  forwardingScore: 9,
                  forwardedNewsletterMessageInfo: {
                    newsletterJid: saluranId,
                    newsletterName: saluranName,
                    serverMessageId: 127,
                  },
                },
                nativeFlowMessage: {
                  messageParamsJson: JSON.stringify({
                    limited_time_offer: {
                      text: `${greeting}`,
                      url: "Hai",
                      //Copiar ese código:
                      expiration_time: Date.now() + 10000,
                    },
                    bottom_sheet: {
                      in_thread_buttons_limit: 2,
                      divider_indices: [1, 2, 3, 4, 5, 999],
                      list_title: "Seleccione el menú",
                      button_title: "🍙 See Category",
                    },
                    tap_target_configuration: {
                      title: " X ",
                      description: "bomboclard",
                      canonical_url: "https://ourin.site",
                      domain: "shop.example.com",
                      button_index: 0,
                    },
                  }),
                  buttons: [
                    {
                      name: "",
                      buttonParamsJson: ""
                    },
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({
                        display_text: "𐔌 Allmenu  𐦯",
                        id: `${prefix}allmenu`
                      })
                    },
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({
                        display_text: "𐔌 Peraturan  𐦯",
                        id: `${prefix}rules`
                      })
                    },
                  ]
                }
              }
            }
          }
        }, { quoted: qOrder, userJid: sock.user.jid });

        await sock.relayMessage(m.chat, msg4.message, {
          messageId: msg4.key.id,
        });
        break;
      }
      case 6: {
        function runtime(seconds) {
          seconds = Number(seconds);

          const d = Math.floor(seconds / (3600 * 24));
          const h = Math.floor(seconds % (3600 * 24) / 3600);
          const m = Math.floor(seconds % 3600 / 60);
          const s = Math.floor(seconds % 60);

          return `${d}Hora${m}Minuto${s}Segundo`;
        }

        const weatherCode = {
          0: "☀️ Cerah",
          1: "🌤️ Cerah Berawan",
          2: "⛅ Berawan",
          3: "☁️ Mendung",
          45: "🌫️ Berkabut",
          48: "🌫️ Kabut Tebal",
          51: "🌦️ Gerimis",
          61: "🌧️ Hujan Ringan",
          63: "🌧️ Hujan",
          65: "⛈️ Hujan Lebat",
          80: "🌦️ Hujan Lokal",
          95: "⛈️ Badai Petir"
        }

        async function weatherMenu(city = "Buenos Aires") {
          try {
            const geo = await _axios2.default.get(
              `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
            )

            const loc = _optionalChain([geo, 'access', _122 => _122.data, 'access', _123 => _123.results, 'optionalAccess', _124 => _124[0]])
            if (!loc) return "Cuaca no está disponible"

            const res = await _axios2.default.get(
              `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,weather_code`
            )

            const current = res.data.current
            const kondisi = weatherCode[current.weather_code] || "🌍No diketahui"

            return `${kondisi} | 🌡️ ${Math.round(current.temperature_2m)}°C\n📍 ${loc.name}`
          } catch (e3) {
            return "Cuaca no está disponible"
          }
        }
        const rawStats = _fs2.default.readFileSync(_path2.default.join(process.cwd(), 'database/main/stats.json'), 'utf8')
        const statsData = JSON.parse(rawStats)
        const commandStats = Object.entries(statsData)
          .filter(([key]) => key.startsWith('command_'))
          .map(([key, count]) => ({ name: key.replace('command_', ''), count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        let topCmdText = "\n ✦ History ✦\n"
        if (commandStats.length > 0) {
          topCmdText += `╭   • ${m.prefix}${commandStats[0].name} (${commandStats[0].count}x)\n`
          for (let i = 1; i < commandStats.length; i++) {
            topCmdText += `┆   • ${m.prefix}${commandStats[i].name} (${commandStats[i].count}x)\n`
          }
          topCmdText += `╰➤------------------------------\n`
        } else {
          topCmdText += `╭   •eram hay comando\n╰➤-...\n`
        }

        const thumbnail = await _sharp3.default.call(void 0, _fs2.default.readFileSync(_configjs2.default.assets["almiku"])).resize(300, 300).toBuffer()
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
                    name: _optionalChain([_configjs2.default, 'access', _125 => _125.bot, 'optionalAccess', _126 => _126.name]) || "Al Miku-AI",
                    address: await weatherMenu(),
                    jpegThumbnail: thumbnail
                  }
                },
                body: {
                  text: text + topCmdText
                },
                contextInfo: {
                  mentionedJid: [m.sender],
                  isForwarded: true,
                  forwardingScore: 9,
                },
                nativeFlowMessage: {
                  messageParamsJson: JSON.stringify({
                    limited_time_offer: {
                      text: `${greeting}`,
                      url: "Hai",
                      expiration_time: Date.now() + 10000,
                    },
                    bottom_sheet: {
                      in_thread_buttons_limit: 2,
                      divider_indices: [1, 2, 3, 4, 5, 999],
                      list_title: "Seleccione el menú",
                      button_title: "🍙 See Category",
                    },
                    tap_target_configuration: {
                      title: " X ",
                      description: "bomboclard",
                      canonical_url: "https://ourin.site",
                      domain: "shop.example.com",
                      button_index: 0,
                    },
                  }),
                  buttons: [
                    {
                      name: "",
                      buttonParamsJson: ""
                    },
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({
                        display_text: "𐔌 Allmenu  𐦯",
                        id: `${prefix}allmenu`
                      })
                    },
                    {
                      name: "quick_reply",
                      buttonParamsJson: JSON.stringify({
                        display_text: "𐔌 Peraturan  𐦯",
                        id: `${prefix}rules`
                      })
                    },
                  ]
                }
              }
            }
          }
        }, { quoted: m, userJid: sock.user.jid });

        await sock.relayMessage(m.chat, msg6.message, {
          messageId: msg6.key.id,
        });
        break;
      }
      case 7: {
        function runtimeStr(seconds) {
          seconds = Number(seconds);
          const d = Math.floor(seconds / (3600 * 24));
          if (d > 0) return `${d}el`;
          const h = Math.floor((seconds % (3600 * 24)) / 3600);
          if (h > 0) return `${h}hora`;
          const m = Math.floor((seconds % 3600) / 60);
          if (m > 0) return `${m}minuto`;
          const s = Math.floor(seconds % 60);
          return `${s}segundo`;
        }

        const toMathSansBold = (text) => {
          const chars = {
            A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜", J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠",
            N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭"
          };
          return text.toUpperCase().split("").map(c => chars[c] || c).join("");
        };

        const botName = _optionalChain([_configjs2.default, 'access', _127 => _127.bot, 'optionalAccess', _128 => _128.name]) || "velyx store";
        const botModeLower = (_configjs2.default.mode || "public").toLowerCase();
        const botPrefix = _optionalChain([_configjs2.default, 'access', _129 => _129.command, 'optionalAccess', _130 => _130.prefix]) || ".";
        const runTime = runtimeStr(process.uptime());

        const userName = m.pushName || "User";
        const userStatus = m.isPremium ? "premium" : "free";
        const userRole = m.isOwner ? "owner" : "user";
        const dbUser = db.getUser(m.sender);
        const userLimit = (_optionalChain([dbUser, 'optionalAccess', _131 => _131.limit]) === Infinity || _optionalChain([dbUser, 'optionalAccess', _132 => _132.limit]) === null || _optionalChain([dbUser, 'optionalAccess', _133 => _133.limit]) === undefined) ? "unlimited" : dbUser.limit;

        let case7Text = `Hey, *${m.pushName}*! ✨

I'm ${botName}, your intelligent assistant powered by ${_optionalChain([_configjs2.default, 'access', _134 => _134.bot, 'optionalAccess', _135 => _135.developer])}. Whether you need information, entertainment, or utilities, I'm always ready to help.

`

        case7Text += `╭╮ \`✯ ${toMathSansBold("BOT DETAIL")}\`\n`;
        case7Text += `││  name : ${botName}\n`;
        case7Text += `││  mode : ${botModeLower}\n`;
        case7Text += `││  prefix : \`${botPrefix}\`\n`;
        case7Text += `││  runtime : ${runTime}\n`;
        case7Text += `╰╯\n`;

        case7Text += `╭╮ \`❀ ${toMathSansBold("USER DETAIL")}\`\n`;
        case7Text += `││  name : _${userName}_\n`;
        case7Text += `││  status : ${userStatus}\n`;
        case7Text += `││  role : ${userRole}\n`;
        case7Text += `││energía:${userLimit}\n`;
        case7Text += `╰╯\n`;

        const readmore = String.fromCharCode(8206).repeat(4001);
        case7Text += readmore + "";
        case7Text += `╭╮ \`✧ ${toMathSansBold("MENU CATEGORY")}\`\n`;
        const { sorted } = getSortedCategories(m, botMode);
        for (const cat of sorted) {
          case7Text += `││  ▸ ${cat.cat.toLowerCase()} : ${cat.cmds.length} fitur\n`;
        }
        case7Text += `╰╯`;


        const { getAssetBuffer } = await Promise.resolve().then(() => _interopRequireWildcard(require("../../src/lib/almiku-asset-manager.js")));
        const imageBuffer = await getAssetBuffer("almiku2");
        const sharp = (await Promise.resolve().then(() => _interopRequireWildcard(require("sharp")))).default;
        const stickerBuf = await sharp(imageBuffer).resize(512, 512).webp().toBuffer();

        const { prepareWAMessageMedia } = await Promise.resolve().then(() => _interopRequireWildcard(require("almiku")));
        const uploadMedia = await prepareWAMessageMedia({ image: stickerBuf }, { upload: sock.waUploadToServer });

        const fakeQuotedSticker = {
          key: {
            fromMe: false,
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast"
          },
          message: {
            stickerMessage: {
              ...uploadMedia.imageMessage,
              mimetype: "image/webp"
            }
          }
        };

        const { generateWAMessageFromContent } = await Promise.resolve().then(() => _interopRequireWildcard(require("almiku")));
        const menuMedia = await prepareWAMessageMedia({
          image: await getAssetBuffer("almiku")
        }, { upload: sock.waUploadToServer });

        const videoLive = await prepareWAMessageMedia({
          video: await getAssetBuffer("almiku-mp4")
        }, { upload: sock.waUploadToServer });

        const msg = generateWAMessageFromContent(m.chat, {
          viewOnceMessage: {
            message: {
              messageContextInfo: {},
              interactiveMessage: {
                header: {
                  title: "",
                  subtitle: "",
                  hasMediaAttachment: true,
                  imageMessage: {
                    ...menuMedia.imageMessage,
                    contextInfo: {
                      pairedMediaType: 5,
                      statusSourceType: 0
                    }
                  }
                },
                body: { text: case7Text },
                footer: { text: `Use: ${_optionalChain([m, 'optionalAccess', _136 => _136.prefix])}impacto<category>\n\nSi tiene alguna pregunta, por favor conecte al propietario.` },
                contextInfo: {
                  mentionedJid: [m.sender],
                  isForwarded: true,
                  forwardingScore: 99
                },
                nativeFlowMessage: {
                  buttons: [
                    {
                      name: "cta_url",
                      buttonParamsJson: JSON.stringify({
                        display_text: "🥐Contact Propietario",
                        url: "http://wa.me/" + _configjs2.default.owner.number[0],
                        merchant_url: "http://wa.me/" + _configjs2.default.owner.number[0]
                      })
                    }
                  ]
                }
              }
            }
          }
        }, { quoted: fakeQuotedSticker, userJid: sock.user.jid });

        await sock.relayMessage(m.chat, msg.message, {
          messageId: msg.key.id,
        });

        await sock.relayMessage(m.chat, {
          videoMessage: {
            ...videoLive.videoMessage,
            contextInfo: {
              pairedMediaType: 6,
              statusSourceType: 0
            }
          },
          messageContextInfo: {
            messageAssociation: {
              associationType: 12,
              parentMessageKey: msg.key
            }
          }
        }, {});

        break;
      }
      case 8: {
        function runtimeStr(seconds) {
          seconds = Number(seconds);
          const d = Math.floor(seconds / (3600 * 24));
          if (d > 0) return `${d}el`;
          const h = Math.floor((seconds % (3600 * 24)) / 3600);
          if (h > 0) return `${h}hora`;
          const m = Math.floor((seconds % 3600) / 60);
          if (m > 0) return `${m}minuto`;
          const s = Math.floor(seconds % 60);
          return `${s}segundo`;
        }

        const toMathSansBold = (text) => {
          const chars = {
            A: "𝗔", B: "𝗕", C: "𝗖", D: "𝗗", E: "𝗘", F: "𝗙", G: "𝗚", H: "𝗛", I: "𝗜", J: "𝗝", K: "𝗞", L: "𝗟", M: "𝗠",
            N: "𝗡", O: "𝗢", P: "𝗣", Q: "𝗤", R: "𝗥", S: "𝗦", T: "𝗧", U: "𝗨", V: "𝗩", W: "𝗪", X: "𝗫", Y: "𝗬", Z: "𝗭"
          };
          return text.toUpperCase().split("").map(c => chars[c] || c).join("");
        };

        const botName = _optionalChain([_configjs2.default, 'access', _137 => _137.bot, 'optionalAccess', _138 => _138.name]) || "velyx store";
        const botModeLower = (_configjs2.default.mode || "public").toLowerCase();
        const botPrefix = _optionalChain([_configjs2.default, 'access', _139 => _139.command, 'optionalAccess', _140 => _140.prefix]) || ".";
        const runTime = runtimeStr(process.uptime());

        const userName = m.pushName || "User";
        const userStatus = m.isPremium ? "premium" : "free";
        const userRole = m.isOwner ? "owner" : "user";
        const dbUser = db.getUser(m.sender);
        const userLimit = (_optionalChain([dbUser, 'optionalAccess', _141 => _141.limit]) === Infinity || _optionalChain([dbUser, 'optionalAccess', _142 => _142.limit]) === null || _optionalChain([dbUser, 'optionalAccess', _143 => _143.limit]) === undefined) ? "unlimited" : dbUser.limit;

        const userLevel = _optionalChain([dbUser, 'optionalAccess', _144 => _144.level]) || 1;
        let userRank = "🛡️ Warrior";
        if (userLevel >= 10) userRank = "⭐ Elite";
        if (userLevel >= 20) userRank = "🎖️ Master";
        if (userLevel >= 40) userRank = "💪 Grandmaster";
        if (userLevel >= 60) userRank = "💜 Epic";
        if (userLevel >= 80) userRank = "⚔️ Legend";
        if (userLevel >= 100) userRank = "🐉 Mythic";

        const userJabatan = m.isOwner ? "[ Owner ]" : (m.isPremium ? "[ Premium ]" : "[ User ]");
        const userKoin = _optionalChain([dbUser, 'optionalAccess', _145 => _145.koin]) || 0;
        const userExp = _optionalChain([dbUser, 'optionalAccess', _146 => _146.exp]) || 0;
        const hariKe = _optionalChain([dbUser, 'optionalAccess', _147 => _147.activeDays]) || 0;

        let case7Text = `*YOUR STATUS*\n`;
        case7Text += `❑ Role: ${userJabatan}\n`;
        case7Text += `❑ Rank: ${userRank}\n`;
        case7Text += `❑ Level: ${userLevel}\n`;
        case7Text += `❑ Coin: ${userKoin}\n`;
        case7Text += `❑ Exp: ${userExp}\n`;
        case7Text += `❑ Energy: ${userLimit}\n\n`;
        case7Text += `Hello, my friend *"${m.pushName}"*!\nHow are you today? You're feeling well, right?\n\nYou've been online for *${hariKe} days*\n\n`;

        const readmore = String.fromCharCode(8206).repeat(4001);
        case7Text += readmore + "";

        const { sorted } = getSortedCategories(m, botMode);

        const catMap = {
          info: "Info del bot",
          jadibot: "Así que...",
          economy: "EKONOMI",
          main: "Juega MINUTE",
          owner: "MENTER Propietario"
        };

        for (const cat of sorted) {
          const catName = catMap[cat.cat.toLowerCase()] || cat.cat.toUpperCase();
          case7Text += `*${catName}*\n`;
          for (const cmd of cat.cmds) {
            case7Text += `⇨ ${botPrefix}${cmd}\n`;
          }
          case7Text += `\n`;
        }
        case7Text = case7Text.trimEnd();

        const { getAssetBuffer } = await Promise.resolve().then(() => _interopRequireWildcard(require("../../src/lib/almiku-asset-manager.js")));
        const imageBuffer = await getAssetBuffer("almiku");
        const favB = await getAssetBuffer("almiku2");
        const sharp = (await Promise.resolve().then(() => _interopRequireWildcard(require("sharp")))).default;
        const thumbBuf = await sharp(imageBuffer).resize(1280, 720).jpeg().toBuffer();
        const favBuf = await sharp(favB).resize(512, 512).jpeg().toBuffer();

        const { prepareWAMessageMedia, generateWAMessageFromContent } = await Promise.resolve().then(() => _interopRequireWildcard(require("almiku")));
        const uploadMedia = await prepareWAMessageMedia({ image: thumbBuf }, { upload: sock.waUploadToServer, mediaTypeOverride: "thumbnail-link" });
        const uploadFav = await prepareWAMessageMedia({ image: favBuf }, { upload: sock.waUploadToServer, mediaTypeOverride: "thumbnail-link" });

        const randomTitles = [
          "Keep up the great work! 🌟",
          "Don't forget to smile today 😊",
          "Keep smiling and stay positive! ✨",
          "What a beautiful day to create something 💻",
          "Gracias por usar estos bots🙏",
          "Hope you have a wonderful day! 🌸",
          "Don't forget to take a break 🍵",
          "Start your day with a positive mindset 😇"
        ];
        const randomTitle = randomTitles[Math.floor(Math.random() * randomTitles.length)];

        let cuacaStr = "Cerah";
        let suhuStr = "30°C";
        try {
          const { data } = await _axios2.default.get("https://wttr.in/Buenos+Aires?format=%C|%t", { timeout: 3000 });
          if (data) {
            const parts = data.split('|');
            if (parts.length === 2) {
              cuacaStr = parts[0].trim();
              suhuStr = parts[1].trim();
            }
          }
        } catch (e) { }
        const displayWeather = `${cuacaStr} | ${suhuStr}`;
        const senderNum = m.sender.split('@')[0];

        const msg = generateWAMessageFromContent(m.chat, {
          extendedTextMessage: {
            text: _configjs2.default.info.website + " " + case7Text,
            matchedText: _configjs2.default.info.website,
            title: randomTitle,
            description: `Hey ${m.pushName}, My name is ${botName}!`,
            jpegThumbnail: uploadMedia.imageMessage.jpegThumbnail || thumbBuf,
            previewType: 1,
            thumbnailWidth: uploadMedia.imageMessage.width || 512,
            thumbnailHeight: uploadMedia.imageMessage.height || 512,
            thumbnailDirectPath: uploadMedia.imageMessage.directPath,
            thumbnailSha256: uploadMedia.imageMessage.fileSha256,
            thumbnailEncSha256: uploadMedia.imageMessage.fileEncSha256,
            mediaKey: uploadMedia.imageMessage.mediaKey,
            mediaKeyTimestamp: uploadMedia.imageMessage.mediaKeyTimestamp,
            faviconMMSMetadata: {
              thumbnailDirectPath: uploadFav.imageMessage.directPath,
              thumbnailSha256: uploadFav.imageMessage.fileSha256,
              thumbnailEncSha256: uploadFav.imageMessage.fileEncSha256,
              mediaKey: uploadFav.imageMessage.mediaKey,
              mediaKeyTimestamp: uploadFav.imageMessage.mediaKeyTimestamp,
              thumbnailHeight: uploadFav.imageMessage.height || 512,
              thumbnailWidth: uploadFav.imageMessage.width || 512
            },
            contextInfo: {
              mentionedJid: [m.sender],
              isForwarded: true,
              forwardingScore: 999,
              forwardedNewsletterMessageInfo: {
                newsletterJid: _configjs2.default.saluran.id,
                newsletterName: _configjs2.default.saluran.name
              }
            }
          }
        }, {
          quoted: {
            key: {
              fromMe: false,
              participant: "0@s.whatsapp.net",
              remoteJid: "status@broadcast"
            },
            message: {
              contactMessage: {
                displayName: displayWeather,
                vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${displayWeather}\nTEL;type=CELL;type=VOICE;waid=${senderNum}:+${senderNum}\nEND:VCARD`
              }
            }
          }
        });

        await sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
        break;
      }

      default:
        await m.reply(text);
    }
    const audioEnabled = db.setting("audioMenu") !== false;
    if (audioEnabled) {
      const audioUrl = botConfig.assets["almiku-mp3"];
      try {
        switch (menuVariant) {
          case 1:
            try {
              const oggPath = await (async () => {
                const tempDir = _path2.default.join(process.cwd(), "temp");
                if (!_fs2.default.existsSync(tempDir)) _fs2.default.mkdirSync(tempDir, { recursive: true });
                const destPath = _path2.default.join(tempDir, "menu_audio_hq_opus.ogg");
                if (_fs2.default.existsSync(destPath)) return destPath;
                const mp3Path = _path2.default.join(tempDir, "menu_audio.mp3");
                const res = await _axios2.default.get(audioUrl, { responseType: "arraybuffer" });
                _fs2.default.writeFileSync(mp3Path, Buffer.from(res.data));
                const { spawn } = await Promise.resolve().then(() => _interopRequireWildcard(require("child_process")));
                return new Promise((resolve, reject) => {
                  const ffmpeg = spawn("ffmpeg", ["-y", "-i", mp3Path, "-c:a", "libopus", "-b:a", "256k", "-vbr", "on", "-compression_level", "10", "-ac", "2", "-ar", "48000", destPath]);
                  ffmpeg.on("close", (code) => {
                    if (_fs2.default.existsSync(mp3Path)) _fs2.default.unlinkSync(mp3Path);
                    if (code === 0) resolve(destPath);
                    else reject(new Error("FFmpeg error"));
                  });
                  ffmpeg.on("error", (err) => {
                    if (_fs2.default.existsSync(mp3Path)) _fs2.default.unlinkSync(mp3Path);
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
                const tempDir = _path2.default.join(process.cwd(), "temp");
                if (!_fs2.default.existsSync(tempDir)) _fs2.default.mkdirSync(tempDir, { recursive: true });
                const destPath = _path2.default.join(tempDir, "menu_audio_hq_opus.ogg");
                if (_fs2.default.existsSync(destPath)) return destPath;
                const mp3Path = _path2.default.join(tempDir, "menu_audio.mp3");
                const res = await _axios2.default.get(audioUrl, { responseType: "arraybuffer" });
                _fs2.default.writeFileSync(mp3Path, Buffer.from(res.data));
                const { spawn } = await Promise.resolve().then(() => _interopRequireWildcard(require("child_process")));
                return new Promise((resolve, reject) => {
                  const ffmpeg = spawn("ffmpeg", ["-y", "-i", mp3Path, "-c:a", "libopus", "-b:a", "256k", "-vbr", "on", "-compression_level", "10", "-ac", "2", "-ar", "48000", destPath]);
                  ffmpeg.on("close", (code) => {
                    if (_fs2.default.existsSync(mp3Path)) _fs2.default.unlinkSync(mp3Path);
                    if (code === 0) resolve(destPath);
                    else reject(new Error("FFmpeg error"));
                  });
                  ffmpeg.on("error", (err) => {
                    if (_fs2.default.existsSync(mp3Path)) _fs2.default.unlinkSync(mp3Path);
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
                audio: _fs2.default.readFileSync(_configjs2.default.assets["almiku-mp3"]),
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
              audio: _fs2.default.readFileSync(_configjs2.default.assets["almiku-mp3"]),
              mimetype: "audio/mpeg",
              ptt: false,
            }, { quoted: qtext });
            break;
          }
          case 7: {
            const qChannel = {
              key: {
                fromMe: false,
                participant: "0@s.whatsapp.net",
                remoteJid: typeof saluranId !== "undefined" ? saluranId : "120363294025983803@newsletter",
              },
              message: {
                conversation: "🔊Jugar menú audio.."
              }
            };
            try {
              const oggPath = await (async () => {
                const tempDir = _path2.default.join(process.cwd(), "temp");
                if (!_fs2.default.existsSync(tempDir)) _fs2.default.mkdirSync(tempDir, { recursive: true });
                const destPath = _path2.default.join(tempDir, "menu_audio_hq_opus.ogg");
                if (_fs2.default.existsSync(destPath)) return destPath;
                const { spawn } = await Promise.resolve().then(() => _interopRequireWildcard(require("child_process")));
                return new Promise((resolve, reject) => {
                  const ffmpeg = spawn("ffmpeg", ["-y", "-i", audioUrl, "-c:a", "libopus", "-b:a", "256k", "-vbr", "on", "-compression_level", "10", "-ac", "2", "-ar", "48000", destPath]);
                  ffmpeg.on("close", (code) => {
                    if (code === 0) resolve(destPath);
                    else reject(new Error("FFmpeg error"));
                  });
                  ffmpeg.on("error", (err) => {
                    reject(err);
                  });
                });
              })();
              await sock.sendMessage(m.chat, {
                audio: { url: oggPath },
                mimetype: "audio/ogg; codecs=opus",
                ptt: true,
              }, { quoted: qChannel });
            } catch (err) {
              await sock.sendMessage(m.chat, {
                audio: { url: audioUrl },
                mimetype: "audio/mpeg",
                ptt: false,
              }, { quoted: qChannel });
            }
            break;
          }
          case 4:
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
                  orderTitle: `📋 ${totalCmds} Commands`,
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
                      newsletterJid: saluranId,
                      newsletterName: saluranName,
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
                  audio: _fs2.default.readFileSync(_configjs2.default.assets["almiku-mp3"]),
                  mimetype: "audio/mpeg",
                },
                { quoted: ftroliQuoted },
              );
            } catch (ffmpegErr) {
              await sock.sendMessage(
                m.chat,
                {
                  audio: _fs2.default.readFileSync(_configjs2.default.assets["almiku-mp3"]),
                  mimetype: "audio/mpeg",
                  contextInfo: getContextInfo(botConfig, m, thumbBuffer),
                },
                { quoted: getVerifiedQuoted(botConfig) },
              );
            }
            break;
          }
        }
      } catch (e) {
        console.error("Error enviando audio dinámico:", e.message);
      }
    }
  } catch (error) {
    console.error("Error en el comando exEjecución:", error.message);
  }
}
exports. default = {
  config: pluginConfig,
  handler,
};

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

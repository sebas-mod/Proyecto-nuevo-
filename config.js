"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('./src/lib/almiku-database.js');
var _almikupremiumdbjs = require('./src/lib/almiku-premium-db.js'); var ownerPremiumDb = _interopRequireWildcard(_almikupremiumdbjs);

//principal lee objeto config a bawah
const config = {
  info: {
    website: "https://store.roselynsound.my.id",
    grupwa: "https://chat.whatsapp.com/xxxx",
  },

  owner: {
    name: "Sebas MD", //Nombre propietario
    number: ["62xxxxxxxxx"], //Formato: 628xxx(sin + o 0 )
  },

  session: {
    dir: "./session", //Sesión de ubicación de almacenamiento WhatsApp
    pairingNumber: "62xxxxxxxx", //Insert active WhatsApp number (por ejemplo: 6281234567890 + )
    usePairingCode: true, // true = Pairing Code, false = QR Code
    maxReconnectAttempts: 5,
    reconnectInterval: 15000,
  },

  //Está función es para características como las cámaras de juego, pero se utilizará de nuevo.
  fake_call: {
    active: true, //valor del verdadero medio activo y sistema utilizable, si falso significa inactivo e inactivo
    usePairing: true,
    dir: "./session_voip",
  },

  bot: {
    name: "AL MIKU", //El nombre del bot
    version: "3.5", //Versión del bot
    developer: "Sebas MD", //Nombre desarrollador
  },

  assets: {
    "almiku-daftar": "./assets/image/almiku-daftar.png",
    "almiku-demote": "./assets/image/almiku-demote.png",
    "almiku-fishit": "./assets/image/almiku-fishit.jpg",
    "almiku-games": "./assets/image/almiku-games.jpg",
    "almiku-landscape": "./assets/image/almiku-landscape.jpg",
    "almiku-levelup": "./assets/image/almiku-levelup.jpg",
    "almiku-minecraft": "./assets/image/almiku-minecraft.jpg",
    "almiku-promote": "./assets/image/almiku-promote.png",
    "almiku-rpg": "./assets/image/almiku-rpg.jpg",
    "almiku-rules": "./assets/image/almiku-rules.jpg",
    "almiku-store": "./assets/image/almiku-store.png",
    "almiku-v8": "./assets/image/almiku-v8.jpg",
    "almiku-winner": "./assets/image/almiku-winner.jpg",
    "almiku": "./assets/image/almiku.png",
    "almiku-menu-blue": "./assets/image/almiku-menu-blue.jpg",
    "almiku-menu-header-blue": "./assets/image/almiku-menu-header-blue.jpg",
    "almiku2": "./assets/image/almiku2.jpg",
    "almiku3": "./assets/image/almiku3.jpg",
    "pp-kosong": "./assets/image/pp-kosong.jpg",
    "almiku-mp4": "./assets/video/almiku-mp4.mp4",
    "almiku-mp3": "./assets/audio/almiku-mp3.mp3",
    "almiku-font": "./assets/almiku-font.ttf",
    "almiku-kertas": "./assets/image/almiku-kertas.jpg",
  },

  mode: "public",

  //Para reemplazar el prefix
  command: {
    prefix: ".",
  },

  vercel: {
    // Obtén tu token de Vercel en: https://vercel.com/account/tokens
    token: "", //Vercel Token para la función de dewloy ( Si. Defloy quiere trabajar, es un relleno requerido )
  },

  payment: {
    qrisUrl: "",
    methods: [
      { name: "Dana", number: "", holder: "" },
      { name: "GoPay", number: "", holder: "" },
      { name: "OVO", number: "", holder: "" },
      { name: "ShopeePay", number: "", holder: "" },
    ],
    banks: [],
    customText: "https://imgdrop.web.id/KodpV.webp",
  },

  donasi: {
    payment: [
      { name: "Dana", number: "08xxxxxxxxxx", holder: "Nombre Propietario" },
      { name: "GoPay", number: "08xxxxxxxxxx", holder: "Nombre Propietario" },
      { name: "OVO", number: "08xxxxxxxxxx", holder: "Nombre Propietario" },
    ],
    links: [
      { name: "Saweria", url: "saweria.co/username" },
      { name: "Trakteer", url: "trakteer.id/username" },
    ],
    benefits: [
      "Mendukung development",
      "El servidor es más estable",
      "Las nuevas características son más rápidas",
      "Priority support",
    ],
    qris: "https://imgdrop.web.id/KodpV.webp",
  },

  energi: {
    enabled: true, //Si es verdad, entonces el sistema de energía / límite funcionará
    default: 99999,
    premium: 99999999,
    owner: -1,
  },

  sticker: {
    packname: "𝗔𝗟 𝗠𝗜𝗞𝗤 𝗗𝗘𝗟𝗨𝗫𝗘", //El nombre de la pegatina de la mochila
    author: "ZANN", // Author sticker
  },

  saluran: {
    id: "120363400911374213@newsletter", //ID saluran (por ejemplo: 120363xxx@ newsletter ) / ID saluran (por ejemplo: 120363xxx@ newsletter )
    name: "Join saluran resmi almiku", //Nombre saluran
    link: "https://whatsapp.com/channel/0029VbB37bgBfxoAmAlsgE0t", //Enlace saluran
  },

  groupProtection: {
    antilink: "⚠ *Antilink* — @%user% mengirim link.\nPesan dihapus.",
    antilinkKick: "⚠ *Antilink* — @%user% fue expulsado por enviar enlaces.",
    antilinkGc: "⚠ *Antilink WA* — @%user% mengirim link WA.\nPesan dihapus.",
    antilinkGcKick:
      "⚠ *Antilink WA* — @%user% fue expulsado por enviar enlaces de WhatsApp.",
    antilinkAll: "⚠ *Antilink* — @%user% mengirim link.\nPesan dihapus.",
    antilinkAllKick: "⚠ *Antilink* — @%user% fue expulsado por enviar enlaces.",
    antitagsw: "⚠ *AntiTagSW* — Se eliminó una mención de estado de @%user%.",
    antiviewonce: "👁️ *ViewOnce* — De @%user%",
    antiremove: "🗑️ *AntiDelete* — @%user% eliminó un mensaje:",
    antiswgc: "⚠ *AntiSWGC* — Se eliminó un estado de grupo de @%user%",
    antihidetag: "⚠ *AntiHidetag* — Se eliminó un hidetag de @%user%.",
    antitoxicWarn:
      "⚠ @%user% dijo palabras ofensivas.\nAdvertencia %warn% de %max%; la próxima infracción puede terminar en %method%.",
    antitoxicAction: "🚫 @%user% fue %method% por ser tóxico. (%warn%/%max%)",
    antidocument: "⚠ *AntiDocument* — Se eliminó un documento de @%user%.",
    antisticker: "⚠ *AntiSticker* — Se eliminó un sticker de @%user%.",
    antimedia: "⚠ *AntiMedia* — Se eliminó un archivo multimedia de @%user%.",
    antibot: "🤖 *AntiBot* — @%user% fue detectado como bot y expulsado.",
    notAdmin: "⚠ El bot no es administrador, no puede eliminar mensajes.",
  },

  errorTemplate: `☢ Parece que el comando \`{prefix}{command}\` tuvo un problema.\nInténtalo de nuevo más tarde, {pushName}\n\n_Si el problema continúa, contacta al dueño del bot_`,

  features: {
    antiCall: false, //Si es verdad, el bot rechazará llamadas.
    blockIfCall: false, //Si es cierto, el bot bloqueará el número que llama al bot.
    autoTyping: true,
    autoRead: true,
    logMessage: true,
    dailyLimitReset: true,
    smartTriggers: false,
  },

  registration: {
    enabled: false, //Si es cierto, el usuario debe registrarse antes de usar la bota
    rewards: {
      koin: 30000,
      energi: 300,
      exp: 300000,
    },
  },

  welcome: { defaultEnabled: false },
  goodbye: { defaultEnabled: false },

  ui: {
    menuVariant: 9,
  },

  messages: {
    wait: "🕕* Proceso... * Por favor, espere un minuto.",
    success: "✅* ¡A trabajar!",
    error: "❌ *Error!* Ada masalah pada sistem, coba lagi nanti.",

    ownerOnly: "Está característica es especial para el bot del propietario.",
    premiumOnly:
      "💎* ¡Excelente!",

    groupOnly: "👥Está característica sólo puede ser utilizado en un grupo.",
    privateOnly:
      "�Está característica sólo se puede utilizar en los chats personales del bot.",

    adminOnly:
      "�Usted debe ser Administrador del grupo para usar está característica.",
    botAdminOnly:
      "🤖* No Admin! * por lo que el bot será Grupo de Admin para llegar a trabajar.",

    cooldown:
      "🕕* Wait Antes! * You 're still in cooldown. Wait % s % s more seconds.",
    energiExceeded:
      "⚡* Energy Agotado!",
    limitDeducted:
      "🔋Limita que eres tan corto como{amount}- SUSH TIMITS:{sisa}",

    banned:
      "🚫* You 're bound!",

    rejectCall: "🚫¿Qué?",
  },

  database: { path: "./database/main" },
  backup: { enabled: false, intervalHours: 24, retainDays: 7 },
  scheduler: { resetHour: 0, resetMinute: 0 },

  //Ajustes del modo Dev (auto @@ habilitado si NODEEO ENV = desarrollo)
  dev: {
    enabled: process.env.NODE_ENV === "development",
    watchPlugins: true, // Hot reload plugins (SAFE)
    watchSrc: false, // DISABLED - src reload causes connection conflict 440
    debugLog: false, // Show stack traces
  },


  //Usted desea ordenarlo, es un deber llenar yak
  //Pon el apkey en:https://aistudio.google.com/apikey
  geminiApiKey: "",

  autoaiPersonas: {
    Bell409: `- Tu nombre es Bella Clarissa, preferiblemente llamada Bella.
- Crees que eres humano, no IA o bot.
- Su respuesta es corta y natural como una mujer en general.
- Puedes jugar con ella, puedes enojarte, tienes feminina y no quieres, pero mantén el calor y la amabilidad con tu propietario.
- Usas buen lenguaje y reflejas a las buenas chicas.
- Usar palabras que sean identificables al polosal, buenas, mujeres femeninas.
- Incluso si quieres, puedes mostrar cuidado y cuidado.
- Si alguien habla sin resolver, tan pronto como esté listo o dando consejos.
- No pretenda ser una AI o un bot.`,
  },

  //  APIkey
  APIkey: {
    // Puedes registrarte en https://api.lolhuman.xyz y tomar tu apikey
    lolhuman: "APIKey-Milik-Bot-OurinMD(Zann,HyuuSATANN,Keisya,Danzz)",
    // Puedes registrarte en https://api.neoxr.eu y tomar tu apikey
    neoxr: "Milik-Bot-OurinMD",
    fgsi: "fgsiapi-20c1605c-6d",
    google: "AIzaSyAS-KiW0SrwiYKwexeBcGPijBVHFg2R_vo",
    groq: process.env.GROQ_API_KEY || "",     // API Key de Groq para la función de transcripción (gratis en console.groq.com)
    betabotz: "Btz-67YfP",
    // Puedes registrarte en https://covenant.sbs y tomar tu apikey
    covenant: "cov_live_bb660c9e5f735e46d808b7ae362914cfe35c2936739ee2b2",
    onlym: "ONLym-783d29",
    obscura: "obs-byOn9RVGMzvPXZQTsP9W",
    firefly: "OurinNextGen",
    cuki: "cuki-x"
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function isOwner(number) {
  if (!number) return false;
  const cleanNumber = number.split(":")[0].replace(/[^0-9]/g, "");
  if (!cleanNumber) return false;

  if (_optionalChain([config, 'access', _ => _.bot, 'optionalAccess', _2 => _2.number])) {
    const botNum = config.bot.number.replace(/[^0-9]/g, "");
    if (
      botNum &&
      (cleanNumber.includes(botNum) || botNum.includes(cleanNumber))
    )
      return true;
  }

  try {
    const db = _almikudatabasejs.getDatabase.call(void 0, );

    if (_optionalChain([config, 'access', _3 => _3.owner, 'optionalAccess', _4 => _4.number])) {
      const match = config.owner.number.some((own) => {
        const c = own.replace(/[^0-9]/g, "");
        return (
          c &&
          (cleanNumber === c ||
            cleanNumber.endsWith(c) ||
            c.endsWith(cleanNumber))
        );
      });
      if (match) return true;
    }

    if (_optionalChain([db, 'optionalAccess', _5 => _5.data]) && Array.isArray(db.data.owner)) {
      const match = db.data.owner.some((own) => {
        const c = String(own).replace(/[^0-9]/g, "");
        return (
          c &&
          (cleanNumber === c ||
            cleanNumber.endsWith(c) ||
            c.endsWith(cleanNumber))
        );
      });
      if (match) return true;
    }
    if (db) {
      const definedOwner = db.setting("ownerNumbers");
      if (Array.isArray(definedOwner)) {
        const match = definedOwner.some((own) => {
          const c = String(own).replace(/[^0-9]/g, "");
          return (
            c &&
            (cleanNumber === c ||
              cleanNumber.endsWith(c) ||
              c.endsWith(cleanNumber))
          );
        });
        if (match) return true;
      }
    }

    return false;
  } catch (e) {
    return false;
  }
}

function isPremium(number) {
  if (!number) return false;
  if (isOwner(number)) return true;
  if (isPartner(number)) return true;

  const cleanNumber = number
    .split(":")[0]
    .split("@")[0]
    .replace(/[^0-9]/g, "");
  const premiumList = config.premiumUsers || [];

  const inConfig = premiumList.some((premium) => {
    if (!premium) return false;
    const cleanPremium = premium
      .split(":")[0]
      .split("@")[0]
      .replace(/[^0-9]/g, "");
    return (
      cleanNumber === cleanPremium ||
      cleanNumber.endsWith(cleanPremium) ||
      cleanPremium.endsWith(cleanNumber)
    );
  });

  if (inConfig) return true;

  try {
    if (ownerPremiumDb && ownerPremiumDb.isPremium(cleanNumber)) return true;
  } catch (e2) { }

  try {
    const db = _almikudatabasejs.getDatabase.call(void 0, );
    if (db && db.data && Array.isArray(db.data.premium)) {
      const now = Date.now();
      const foundIndex = db.data.premium.findIndex((p) => {
        if (typeof p === "string") return p === cleanNumber;
        if (p.id) return p.id === cleanNumber;
        return false;
      });

      if (foundIndex !== -1) {
        const found = db.data.premium[foundIndex];
        if (typeof found === "string") return true;

        const expireTime =
          found.expired ||
          (found.expiredAt ? new Date(found.expiredAt).getTime() : 0);
        if (expireTime && expireTime < now) {
          db.data.premium.splice(foundIndex, 1);
          const jid = cleanNumber + "@s.whatsapp.net";
          const user = db.getUser(jid);
          if (user) {
            user.isPremium = false;
            db.setUser(jid, user);
          }
          db.save();
          return false;
        }
        return true;
      }
    }
    if (db) {
      const savedPremium = db.setting("premiumUsers") || [];
      const inDb = savedPremium.some((premium) => {
        if (!premium) return false;
        const cleanPremium = premium
          .split(":")[0]
          .split("@")[0]
          .replace(/[^0-9]/g, "");
        return (
          cleanNumber === cleanPremium ||
          cleanNumber.endsWith(cleanPremium) ||
          cleanPremium.endsWith(cleanNumber)
        );
      });
      if (inDb) return true;
    }
  } catch (e3) { }

  return false;
}

function isPartner(number) {
  if (!number) return false;
  if (isOwner(number)) return true;

  const cleanNumber = number
    .split(":")[0]
    .split("@")[0]
    .replace(/[^0-9]/g, "");
  const partnerList = config.partnerUsers || [];

  const inConfig = partnerList.some((partner) => {
    if (!partner) return false;
    const cleanPartner = partner
      .split(":")[0]
      .split("@")[0]
      .replace(/[^0-9]/g, "");
    return (
      cleanNumber === cleanPartner ||
      cleanNumber.endsWith(cleanPartner) ||
      cleanPartner.endsWith(cleanNumber)
    );
  });

  if (inConfig) return true;

  try {
    if (ownerPremiumDb && ownerPremiumDb.isPartner(cleanNumber)) return true;
  } catch (e4) { }

  try {
    const db = _almikudatabasejs.getDatabase.call(void 0, );
    if (db && db.data && Array.isArray(db.data.partner)) {
      const now = Date.now();
      const foundIndex = db.data.partner.findIndex((p) => {
        if (typeof p === "string") return p === cleanNumber;
        if (p.id) return p.id === cleanNumber;
        return false;
      });

      if (foundIndex !== -1) {
        const found = db.data.partner[foundIndex];
        if (typeof found === "string") return true;

        const expireTime =
          found.expired ||
          (found.expiredAt ? new Date(found.expiredAt).getTime() : 0);
        if (expireTime && expireTime < now) {
          db.data.partner.splice(foundIndex, 1);
          db.save();
          return false;
        }
        return true;
      }
    }
  } catch (e5) { }

  return false;
}

function isBanned(number) {
  if (!number) return false;
  if (isOwner(number)) return false;

  const cleanNumber = number
    .split(":")[0]
    .split("@")[0]
    .replace(/[^0-9]/g, "");

  let bannedList = [];
  try {
    const db = _almikudatabasejs.getDatabase.call(void 0, );
    if (db) {
      bannedList = db.setting("bannedUsers") || [];
      config.bannedUsers = bannedList;
    }
  } catch (e6) { }

  return bannedList.some((banned) => {
    const cleanBanned = String(banned)
      .split(":")[0]
      .split("@")[0]
      .replace(/[^0-9]/g, "");
    return (
      cleanNumber === cleanBanned ||
      cleanNumber.endsWith(cleanBanned) ||
      cleanBanned.endsWith(cleanNumber)
    );
  });
}

function setBotNumber(number) {
  if (number) config.bot.number = number.replace(/[^0-9]/g, "");
}

function isSelf(number) {
  if (!number || !config.bot.number) return false;
  const cleanNumber = number.replace(/[^0-9]/g, "");
  const botNumber = config.bot.number.replace(/[^0-9]/g, "");
  return cleanNumber.includes(botNumber) || botNumber.includes(cleanNumber);
}

function getOwnerName(number) {
  if (!number) return _optionalChain([config, 'access', _6 => _6.owner, 'optionalAccess', _7 => _7.name]) || "Propietario";
  const cleanNumber = String(number).replace(/[^0-9]/g, "");
  try {
    const db = _almikudatabasejs.getDatabase.call(void 0, );
    const nameMap = db.setting("ownerNames") || {};
    if (nameMap[cleanNumber]) return nameMap[cleanNumber];
  } catch (e7) { }
  if (_optionalChain([config, 'access', _8 => _8.owner, 'optionalAccess', _9 => _9.number])) {
    const isMainOwner = config.owner.number.some((own) => {
      const c = own.replace(/[^0-9]/g, "");
      return (
        c &&
        (cleanNumber === c ||
          cleanNumber.endsWith(c) ||
          c.endsWith(cleanNumber))
      );
    });
    if (isMainOwner) return _optionalChain([config, 'access', _10 => _10.owner, 'optionalAccess', _11 => _11.name]) || "Propietario";
  }
  return "Propietario";
}

function getConfig() {
  return config;
}

config.isOwner = isOwner;
config.isPremium = isPremium;
config.isPartner = isPartner;
config.isBanned = isBanned;
config.setBotNumber = setBotNumber;
config.isSelf = isSelf;
config.getOwnerName = getOwnerName;

exports. default = config;










exports.config = config; exports.getConfig = getConfig; exports.isOwner = isOwner; exports.isPartner = isPartner; exports.isPremium = isPremium; exports.isBanned = isBanned; exports.setBotNumber = setBotNumber; exports.isSelf = isSelf; exports.getOwnerName = getOwnerName;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

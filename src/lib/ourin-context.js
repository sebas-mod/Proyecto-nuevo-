"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _url = require('url');
// __filename provided by CJS
// __dirname provided by CJS
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _ourinassetmanagerjs = require('./ourin-asset-manager.js');

let gameThumbBuffer = null;
let rpgThumbBuffer = null;
let winnerThumbBuffer = null;

const keys = [
  ["ourin-games", (buf) => { gameThumbBuffer = exports.gameThumbBuffer = buf; }],
  ["ourin-rpg", (buf) => { rpgThumbBuffer = exports.rpgThumbBuffer = buf; }],
  ["ourin-winner", (buf) => { winnerThumbBuffer = exports.winnerThumbBuffer = buf; }],
];
for (const [key, setter] of keys) {
  const buf = _ourinassetmanagerjs.getAssetBuffer.call(void 0, key);
  if (buf) setter(buf);
}

const FAST_ANSWER_PRAISES = [
  "⚡ Kilat banget! Kamu jenius!",
  "🚀 Super cepat! Otak encer!",
  "🔥 Wuih monster! Jawab secepat kilat!",
  "💫 Luar biasa! Kamu the flash!",
  "🎯 Precision tinggi! Langsung tepat!",
  "⭐ Bintang! Refleks dewa!",
  "🏆 Legend! Kecepatan maximal!",
  "💎 Premium player! Gak ada lawan!",
  "🦅 Tajam seperti elang!",
  "🧠 Big brain! IQ tinggi detected!",
];

const FAST_ANSWER_THRESHOLD = 4000;
const FAST_ANSWER_BONUS = {
  exp: 50,
  balance: 500,
  limit: 1,
};

function getRandomPraise() {
  return FAST_ANSWER_PRAISES[
    Math.floor(Math.random() * FAST_ANSWER_PRAISES.length)
  ];
}

function _saluranCtx() {
  const saluranId = _optionalChain([_configjs2.default, 'access', _ => _.saluran, 'optionalAccess', _2 => _2.id]) || "120363400911374213@newsletter";
  const saluranName = _optionalChain([_configjs2.default, 'access', _3 => _3.saluran, 'optionalAccess', _4 => _4.name]) || _optionalChain([_configjs2.default, 'access', _5 => _5.bot, 'optionalAccess', _6 => _6.name]) || "Ourin-AI";
  return {
    forwardingScore: 9,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: 127,
    },
  };
}

function getGameContextInfo() {
  return _saluranCtx();
}

function getWinnerContextInfo() {
  return _saluranCtx();
}

function getRpgContextInfo(title, body) {
  const base = _saluranCtx();
  if (title || body) {
    base.externalAdReply = {
      title: title || _optionalChain([_configjs2.default, 'access', _7 => _7.bot, 'optionalAccess', _8 => _8.name]) || "Ourin RPG",
      body: body || "",
      sourceUrl: _optionalChain([_configjs2.default, 'access', _9 => _9.saluran, 'optionalAccess', _10 => _10.link]) || "",
      mediaType: 1,
      renderLargerThumbnail: false,
      thumbnail: rpgThumbBuffer,
    };
  }
  return base;
}

async function sendGamePreview(sock, jid, text, title, body, options) {
  const msgId = await sock.sendPreview(
    jid,
    {
      caption: `${_configjs2.default.info.website} ${text}`,
      url: `${_configjs2.default.info.website}`,
      title: title || "🎮 OURIN GAMES",
      description: body || "Have fun playing!",
      jpegThumbnail: gameThumbBuffer,
      previewType: 0,
    },
    { contextInfo: _saluranCtx(), ...options },
  );
  return { key: { id: msgId, remoteJid: jid, fromMe: true } };
}

async function sendWinnerPreview(sock, jid, text, title, body, options) {
  const msgId = await sock.sendPreview(
    jid,
    {
      caption: `${_configjs2.default.info.website} ${text}`,
      url: `${_configjs2.default.info.website}`,
      title: title || "🏆 WINNER!",
      description: body || "Selamat kamu menang!",
      jpegThumbnail: winnerThumbBuffer || gameThumbBuffer,
      previewType: 0,
    },
    { contextInfo: _saluranCtx(), ...options },
  );
  return { key: { id: msgId, remoteJid: jid, fromMe: true } };
}

async function sendRpgPreview(sock, jid, text, title, body, options) {
  const msgId = await sock.sendPreview(
    jid,
    {
      caption: `${_configjs2.default.info.website} ${text}`,
      url: `${_configjs2.default.info.website}`,
      title: title || "⚔️ OURIN RPG",
      description: body || "Adventure awaits!",
      jpegThumbnail: rpgThumbBuffer,
      previewType: 0,
    },
    { contextInfo: _saluranCtx(), ...options },
  );
  return { key: { id: msgId, remoteJid: jid, fromMe: true } };
}

async function sendToolsPreview(sock, jid, text, title, body, options) {
  const msgId = await sock.sendPreview(
    jid,
    {
      caption: `${_configjs2.default.info.website} ${text}`,
      url: `${_configjs2.default.info.website}`,
      title: title || "🛠️ OURIN TOOLS",
      description: body || "Utility & tools",
      jpegThumbnail: gameThumbBuffer,
      previewType: 0,
    },
    { contextInfo: _saluranCtx(), ...options },
  );
  return { key: { id: msgId, remoteJid: jid, fromMe: true } };
}

function saluranCtx() {
  return _saluranCtx();
}

function checkFastAnswer(session) {
  if (!_optionalChain([session, 'optionalAccess', _11 => _11.startTime])) return { isFast: false };

  const elapsed = Date.now() - session.startTime;

  if (elapsed <= FAST_ANSWER_THRESHOLD) {
    return {
      isFast: true,
      elapsed: elapsed,
      praise: getRandomPraise(),
      bonus: FAST_ANSWER_BONUS,
    };
  }

  return { isFast: false, elapsed: elapsed };
}

function createFakeQuoted(botName = "Ourin-AI", verified = true) {
  return {
    key: {
      fromMe: false,
      participant: "0@s.whatsapp.net",
      remoteJid: "status@broadcast",
    },
    message: {
      contactMessage: {
        displayName: verified ? `✅ ${botName}` : botName,
        vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${botName}\nORG:${verified ? "Verified Bot" : "Bot"}\nEND:VCARD`,
      },
    },
  };
}



















exports.getGameContextInfo = getGameContextInfo; exports.getWinnerContextInfo = getWinnerContextInfo; exports.getRpgContextInfo = getRpgContextInfo; exports.sendGamePreview = sendGamePreview; exports.sendWinnerPreview = sendWinnerPreview; exports.sendRpgPreview = sendRpgPreview; exports.sendToolsPreview = sendToolsPreview; exports.saluranCtx = saluranCtx; exports.createFakeQuoted = createFakeQuoted; exports.checkFastAnswer = checkFastAnswer; exports.getRandomPraise = getRandomPraise; exports.gameThumbBuffer = gameThumbBuffer; exports.rpgThumbBuffer = rpgThumbBuffer; exports.winnerThumbBuffer = winnerThumbBuffer; exports.FAST_ANSWER_THRESHOLD = FAST_ANSWER_THRESHOLD; exports.FAST_ANSWER_BONUS = FAST_ANSWER_BONUS; exports.FAST_ANSWER_PRAISES = FAST_ANSWER_PRAISES;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

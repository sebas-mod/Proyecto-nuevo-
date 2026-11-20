"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);




var _almiku = require('almiku');
var _almikudatabasejs = require('./almiku-database.js');
var _almikuloggerjs = require('./almiku-logger.js');
var _aiojs = require('../scraper/aio.js');

const SUPPORTED_PATTERNS = [
  "youtube.com",
  "youtu.be",
  "tiktok.com",
  "vt.tiktok.com",
  "facebook.com",
  "fb.watch",
  "fb.com",
  "instagram.com",
  "pinterest.com",
  "pin.it",
  "capcut.com",
  "twitter.com",
  "x.com",
  "threads.net",
  "reddit.com",
];

function containsSupportedLink(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return SUPPORTED_PATTERNS.some((p) => lower.includes(p));
}

function extractUrl(text) {
  const match = text.match(/https?:\/\/[^\s]+/i);
  return match ? match[0] : null;
}

async function sendMediaItems(result, sock, m) {
  const media = result.media || [];
  if (!media.length) throw new Error("No media found");

  const images = media.filter((i) => i.type === "image");
  const videos = media.filter((i) => i.type === "video");
  const audios = media.filter((i) => i.type === "audio");

  if (images.length > 1) {
    const opener = _almiku.generateWAMessageFromContent.call(void 0, 
      m.chat,
      {
        messageContextInfo: { messageSecret: _crypto2.default.randomBytes(32) },
        albumMessage: {
          expectedImageCount: images.length,
          expectedVideoCount: 0,
        },
      },
      {
        userJid: _almiku.jidNormalizedUser.call(void 0, sock.user.id),
        quoted: m,
        upload: sock.waUploadToServer,
      },
    );
    await sock.relayMessage(opener.key.remoteJid, opener.message, {
      messageId: opener.key.id,
    });
    for (const item of images) {
      const msg = await _almiku.generateWAMessage.call(void 0, 
        opener.key.remoteJid,
        { image: { url: item.url } },
        {
          upload: sock.waUploadToServer,
        },
      );
      msg.message.messageContextInfo = {
        messageSecret: _crypto2.default.randomBytes(32),
        messageAssociation: {
          associationType: 1,
          parentMessageKey: opener.key,
        },
      };
      await sock.relayMessage(msg.key.remoteJid, msg.message, {
        messageId: msg.key.id,
      });
    }
  } else if (images.length === 1) {
    await sock.sendMedia(m.chat, images[0].url, result.title || null, m, {
      type: "image",
      contextInfo: { forwardingScore: 99, isForwarded: true },
    });
  }

  if (videos.length > 0) {
    const best =
      videos.find((v) => v.quality === "HD" || v.quality === "mp4") ||
      videos[0];
    await sock.sendMedia(m.chat, best.url, result.title || null, m, {
      type: "video",
      contextInfo: { forwardingScore: 99, isForwarded: true },
    });
  }

  if (audios.length > 0) {
    await sock.sendMessage(
      m.chat,
      { audio: { url: audios[0].url }, mimetype: "audio/mpeg" },
      { quoted: m },
    );
  }
}

async function handleAutoDownload(m, sock, text) {
  if (!m.isGroup) return;

  const db = _almikudatabasejs.getDatabase.call(void 0, );
  const groupData = db.getGroup(m.chat);
  if (!_optionalChain([groupData, 'optionalAccess', _ => _.autodl])) return;

  if (!containsSupportedLink(text)) return;

  const extractedUrl = extractUrl(text);
  if (!extractedUrl) return;

  m.react("🕕");

  try {
    const result = await _aiojs.aiodl.call(void 0, extractedUrl);
    await sendMediaItems(result, sock, m);
    m.react("✅");
  } catch (err) {
    m.react("😳");
    const platform = _aiojs.detectPlatform.call(void 0, extractedUrl) || "unknown";
    _almikuloggerjs.logger.error("AutoDL", `[${platform}] ${err.message}`);
  }
}

const SUPPORTED_PLATFORMS = SUPPORTED_PATTERNS;

exports.handleAutoDownload = handleAutoDownload; exports.containsSupportedLink = containsSupportedLink; exports.SUPPORTED_PLATFORMS = SUPPORTED_PLATFORMS;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

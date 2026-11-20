"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');



var _ourinlidjs = require('../../src/lib/ourin-lid.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
  name: ["antibot", "botdetect"],
  alias: [],
  category: "group",
  description: "Deteksi dan kick bot WhatsApp (baileys) dari grup",
  usage: ".antibot <on/off>",
  example: ".antibot on",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  isBotAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function gpMsg(key, replacements = {}) {
  const defaults = {
    antibot: "🤖 *AntiBot* — @%user% terdeteksi sebagai bot dan di-kick.",
  };
  let text = _optionalChain([_configjs2.default, 'access', _ => _.groupProtection, 'optionalAccess', _2 => _2[key]]) || defaults[key] || "";
  for (const [k, v] of Object.entries(replacements)) {
    text = text.replace(new RegExp(`%${k}%`, "g"), v);
  }
  return text;
}

function extractMessageId(m) {
  return String(_optionalChain([m, 'optionalAccess', _3 => _3.key, 'optionalAccess', _4 => _4.id]) || _optionalChain([m, 'optionalAccess', _5 => _5.id]) || "").trim();
}

function extractSenderDevice(m) {
  const participant = String(_optionalChain([m, 'optionalAccess', _6 => _6.key, 'optionalAccess', _7 => _7.participant]) || "");
  const match = participant.match(/:(\d+)@/);
  if (!match) return null;
  const value = Number.parseInt(match[1], 10);
  return Number.isNaN(value) ? null : value;
}

function isUnknownPushName(pushName) {
  const value = String(pushName || "")
    .trim()
    .toLowerCase();
  return !value || ["unknown", "undefined", "null"].includes(value);
}

function analyzeBotMessage(m) {
  const messageId = extractMessageId(m);
  if (!messageId) {
    return { isBot: false, score: 0, reasons: [], confidence: "low" };
  }

  if (messageId.startsWith("WAMID.") || messageId.startsWith("false_") || messageId.startsWith("true_")) {
    return { isBot: false, score: 0, reasons: [], confidence: "low" };
  }

  let score = 0;
  const reasons = [];
  const idUpper = messageId.toUpperCase();

  if (idUpper.startsWith("BAE5")) {
    score += 5;
    reasons.push("id-BAE5");
  } else if (idUpper.startsWith("3EB0") && idUpper.length === 22) {
    score += 4;
    reasons.push("id-3EB0");
  } else if (idUpper.startsWith("B24E")) {
    score += 5;
    reasons.push("id-B24E");
  } else if (idUpper.startsWith("94DD")) {
    score += 5;
    reasons.push("id-94DD");
  } else if (idUpper.startsWith("B1E")) {
    score += 5;
    reasons.push("id-B1E");
  } else if (/^[A-F0-9]{28,40}$/i.test(messageId)) {
    score += 2;
    reasons.push("id-upper-hex");
  } else if (messageId.length === 16) {
    score += 3;
    reasons.push("id-length-16");
  } else if (messageId.length < 20 && !messageId.includes("-")) {
    score += 2;
    reasons.push("id-length-suspicious");
  }

  if (/[a-z]/.test(messageId) && !messageId.startsWith("3EB0") && !messageId.includes("-")) {
    score += 4;
    reasons.push("id-lowercase-signature");
  }

  const len = messageId.length;
  if (len !== 16 && len !== 20 && len !== 22 && len !== 32 && !messageId.includes("-")) {
    score += 3;
    reasons.push(`id-length-unusual`);
  }

  if (_optionalChain([m, 'optionalAccess', _8 => _8.isBaileys]) === true) {
    score += 5;
    reasons.push("flag-isBaileys");
  }

  const msg = _optionalChain([m, 'optionalAccess', _9 => _9.message]) || {};
  const actualMsg = _optionalChain([msg, 'access', _10 => _10.ephemeralMessage, 'optionalAccess', _11 => _11.message]) || _optionalChain([msg, 'access', _12 => _12.viewOnceMessage, 'optionalAccess', _13 => _13.message]) || _optionalChain([msg, 'access', _14 => _14.viewOnceMessageV2, 'optionalAccess', _15 => _15.message]) || msg;

  const textMsg = _optionalChain([m, 'optionalAccess', _16 => _16.text]) || _optionalChain([actualMsg, 'optionalAccess', _17 => _17.conversation]) || _optionalChain([actualMsg, 'optionalAccess', _18 => _18.extendedTextMessage, 'optionalAccess', _19 => _19.text]) || "";
  const contextInfo = _optionalChain([actualMsg, 'optionalAccess', _20 => _20.extendedTextMessage, 'optionalAccess', _21 => _21.contextInfo]) || _optionalChain([actualMsg, 'optionalAccess', _22 => _22.imageMessage, 'optionalAccess', _23 => _23.contextInfo]) || _optionalChain([actualMsg, 'optionalAccess', _24 => _24.videoMessage, 'optionalAccess', _25 => _25.contextInfo]) || {};

  if (contextInfo.externalAdReply) {
    score += 6;
    reasons.push("custom-ad-reply");
  }

  if (contextInfo.isForwarded && contextInfo.forwardingScore > 100) {
    score += 3;
    reasons.push("fake-forward-score");
  }

  if (/[\u200B-\u200D\uFEFF]/.test(textMsg)) {
    score += 3;
    reasons.push("invisible-characters");
  }

  const botMessageTypes = [
    'buttonsMessage', 'templateMessage', 'listMessage',
    'interactiveMessage', 'buttonsResponseMessage',
    'templateButtonReplyMessage', 'listResponseMessage',
    'interactiveResponseMessage'
  ];

  for (const type of botMessageTypes) {
    if (actualMsg[type]) {
      score += 6;
      reasons.push(`message-type-${type}`);
      break;
    }
  }

  if (msg.deviceSentMessage) {
    score += 1;
    reasons.push("message-deviceSent");
    if (_optionalChain([msg, 'access', _26 => _26.deviceSentMessage, 'optionalAccess', _27 => _27.message])) {
      score += 1;
      reasons.push("message-deviceWrapper");
    }
  }

  const senderDevice = extractSenderDevice(m);
  if (Number.isInteger(senderDevice) && senderDevice > 20) {
    score += 2;
    reasons.push("participant-highDevice");
  }

  const lowerPushName = String(_optionalChain([m, 'optionalAccess', _28 => _28.pushName]) || "").toLowerCase();
  if (isUnknownPushName(_optionalChain([m, 'optionalAccess', _29 => _29.pushName]))) {
    score += 1;
    reasons.push("pushname-unknown");
  } else if (/(bot|system|admin|owner|host|panel)/i.test(lowerPushName)) {
    score += 2;
    reasons.push("pushname-suspicious");
  }

  const confidence = score >= 6 ? "high" : score >= 4 ? "medium" : "low";
  return {
    isBot: score >= 5,
    score,
    reasons,
    confidence,
    messageId,
    senderDevice,
  };
}

function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const args = _optionalChain([m, 'access', _30 => _30.args, 'access', _31 => _31[0], 'optionalAccess', _32 => _32.toLowerCase, 'call', _33 => _33()]);
  const groupData = db.getGroup(m.chat) || {};
  const current = groupData.antibot || false;

  if (!args || args === "status") {
    return m.reply(
      `🤖 *AntiBot*\n\n` +
      `> Status: ${current ? "✅ Aktif" : "❌ Nonaktif"}\n\n` +
      `> Deteksi: *Smart Heuristic*\n\n` +
      `> \`.antibot on/off\``,
    );
  }

  if (args === "on") {
    db.setGroup(m.chat, { ...groupData, antibot: true });
    db.save();
    m.react("✅");
    return m.reply(`✅ *AntiBot diaktifkan*`);
  }

  if (args === "off") {
    db.setGroup(m.chat, { ...groupData, antibot: false });
    db.save();
    m.react("❌");
    return m.reply(`❌ *AntiBot dinonaktifkan*`);
  }

  return m.reply(`❌ Gunakan \`.antibot on\` atau \`.antibot off\``);
}

function isBotMessage(m) {
  const result = analyzeBotMessage(m);
  return {
    isBot: result.isBot,
    reason: result.reasons[0] || null,
    score: result.score,
    reasons: result.reasons,
    confidence: result.confidence,
  };
}

async function detectBot(m, sock) {
  if (!m.isGroup) return false;

  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const groupData = db.getGroup(m.chat);
  if (!_optionalChain([groupData, 'optionalAccess', _34 => _34.antibot])) return false;

  const result = isBotMessage(m);
  if (!result.isBot) return false;

  const botJid = m.sender;
  if (!botJid) return false;

  const groupMeta = m.groupMetadata;
  if (!groupMeta) return false;

  const myNumber = _optionalChain([sock, 'access', _35 => _35.user, 'optionalAccess', _36 => _36.id, 'optionalAccess', _37 => _37.split, 'call', _38 => _38(":"), 'access', _39 => _39[0]]) || _optionalChain([sock, 'access', _40 => _40.user, 'optionalAccess', _41 => _41.id, 'optionalAccess', _42 => _42.split, 'call', _43 => _43("@"), 'access', _44 => _44[0]]);
  const myJid = myNumber + "@s.whatsapp.net";
  if (botJid === myJid) return false;

  const botParticipant = _ourinlidjs.findParticipantByNumber.call(void 0, groupMeta.participants, myJid);
  if (!_optionalChain([botParticipant, 'optionalAccess', _45 => _45.admin])) return false;

  const targetParticipant = _ourinlidjs.findParticipantByNumber.call(void 0, 
    groupMeta.participants,
    botJid,
  );
  if (_optionalChain([targetParticipant, 'optionalAccess', _46 => _46.admin])) return false;

  const targetJidToKick = targetParticipant
    ? _ourinlidjs.getParticipantJid.call(void 0, targetParticipant)
    : botJid;

  try {
    try {
      await sock.sendMessage(m.chat, { delete: m.key });
    } catch (e) {
      await sock.sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: _optionalChain([m, 'access', _47 => _47.key, 'optionalAccess', _48 => _48.id]) || m.id,
          participant: m.sender,
        },
      });
    }
    await sock.groupParticipantsUpdate(m.chat, [targetJidToKick], "remove");

    await sock.sendMessage(m.chat, {
      text: gpMsg("antibot", { user: botJid.split("@")[0] }),
      mentions: [botJid],
    });

    return true;
  } catch (err) {
    return false;
  }
}

exports.config = pluginConfig; exports.handler = handler; exports.detectBot = detectBot; exports.isBotMessage = isBotMessage;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

function buildHistoryText(history = []) {
  if (!Array.isArray(history) || history.length === 0) {
    return "";
  }

  const lines = history
    .slice(-10)
    .map((item) => {
      const role = _optionalChain([item, 'optionalAccess', _ => _.role]) === "assistant" ? "AI" : "User";
      const content = String(_optionalChain([item, 'optionalAccess', _2 => _2.content]) || "").trim();
      return content ? `${role}: ${content}` : "";
    })
    .filter(Boolean);

  if (lines.length === 0) {
    return "";
  }

  return `Riwayat percakapan:\n${lines.join("\n")}`;
}

function buildTextMessage(message, history = [], imageBuffer = null) {
  const parts = [];
  const historyText = buildHistoryText(history);

  if (historyText) {
    parts.push(historyText);
  }

  if (imageBuffer) {
    parts.push("User mengirim gambar. Jika gambar bisa dianalisis, gunakan konteks itu saat menjawab.");
  }

  parts.push(`Pesan user saat ini:\n${String(message || "").trim() || "(gambar tanpa teks)"}`);

  return parts.filter(Boolean).join("\n\n");
}

function getAiNames(aiFullName = "") {
  const fullName = String(aiFullName || _optionalChain([_configjs2.default, 'access', _3 => _3.bot, 'optionalAccess', _4 => _4.name]) || "Ourin AI").trim();
  const nickName = fullName.split(/\s+/)[0] || "Ourin";
  return { fullName, nickName };
}

async function chat({
  message,
  instruction = "",
  imageBuffer = null,
  history = [],
  senderId = "",
  senderName = "",
  aiFullName = "",
  aiNickName = "",
  ownerName = "",
  role = "Temen deket",
  commands = [],
} = {}) {
  if (!_optionalChain([message, 'optionalAccess', _5 => _5.trim, 'call', _6 => _6()]) && !imageBuffer) {
    throw new Error("Message is required.");
  }

  const apiKey = _optionalChain([_configjs2.default, 'access', _7 => _7.APIkey, 'optionalAccess', _8 => _8.logicBell]);
  if (!apiKey) {
    throw new Error("API key logicBell belum diisi.");
  }

  const aiNames = getAiNames(aiFullName);
  const payload = {
    text: buildTextMessage(message, history, imageBuffer),
    id: senderId || "anonymous@s.whatsapp.net",
    fullainame: aiNames.fullName,
    nickainame: String(aiNickName || aiNames.nickName).trim() || aiNames.nickName,
    senderName: String(senderName || "User").trim() || "User",
    ownerName: String(ownerName || _optionalChain([_configjs2.default, 'access', _9 => _9.owner, 'optionalAccess', _10 => _10.name]) || "Owner").trim() || "Owner",
    date: new Date().toISOString(),
    role: String(role || "Temen deket").trim() || "Temen deket",
    msgtype: imageBuffer ? "image" : "text",
    custom_profile: String(instruction || "").trim() || undefined,
    commands: Array.isArray(commands) ? commands : [],
  };

  if (imageBuffer) {
    payload.image = imageBuffer.toString("base64");
  }

  const response = await _axios2.default.post(
    `https://api.termai.cc/api/chat/logic-bell?key=${encodeURIComponent(apiKey)}`,
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 60000,
    },
  );

  const data = response.data;
  if (!_optionalChain([data, 'optionalAccess', _11 => _11.status])) {
    throw new Error(_optionalChain([data, 'optionalAccess', _12 => _12.msg]) || _optionalChain([data, 'optionalAccess', _13 => _13.message]) || "Logic Bell request failed.");
  }

  const text = String(_optionalChain([data, 'optionalAccess', _14 => _14.data, 'optionalAccess', _15 => _15.msg]) || _optionalChain([data, 'optionalAccess', _16 => _16.msg]) || "").trim();

  return {
    text,
    raw: data,
    model: "logic-bell",
    energy: _optionalChain([data, 'optionalAccess', _17 => _17.data, 'optionalAccess', _18 => _18.energy]) || null,
  };
}

exports.chat = chat;
exports. default = chat;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

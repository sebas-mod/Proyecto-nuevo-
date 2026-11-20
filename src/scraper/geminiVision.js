"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _geminijs = require('./gemini.js'); var _geminijs2 = _interopRequireDefault(_geminijs);

function buildMessage({ message, history = [], imageBuffer = null }) {
  const parts = [];

  if (Array.isArray(history) && history.length > 0) {
    const historyText = history
      .slice(-10)
      .map((item) => {
        const role = _optionalChain([item, 'optionalAccess', _ => _.role]) === "assistant" ? "Assistant" : "User";
        const content = String(_optionalChain([item, 'optionalAccess', _2 => _2.content]) || "").trim();
        return content ? `${role}: ${content}` : "";
      })
      .filter(Boolean)
      .join("\n");

    if (historyText) {
      parts.push(`Historial percakapan:\n${historyText}`);
    }
  }

  if (imageBuffer) {
    parts.push(
      "El usuario envía una imagen. Si los modelos no pueden ver imágenes de una manera más larga, todavía responden tanto como sea posible a los contextos textuales existentes.",
    );
  }

  parts.push(String(message || "").trim());

  return parts.filter(Boolean).join("\n\n").trim();
}

async function chat({
  message,
  instruction = "",
  imageBuffer = null,
  history = [],
} = {}) {
  const result = await _geminijs2.default.call(void 0, {
    message: buildMessage({ message, history, imageBuffer }),
    instruction,
  });

  return {
    text: result.text,
    raw: result.raw || result.text,
    model: result.model || "gemini",
    sessionId: result.sessionId || null,
  };
}

exports.chat = chat;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

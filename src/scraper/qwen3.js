"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _nodecrypto = require('node:crypto'); var _nodecrypto2 = _interopRequireDefault(_nodecrypto);

const API = "https://api.overchat.ai/v1/chat/completions";

const ua =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

async function Qwen3(prompt, options = {}) {
  const chatId = options.chatId || _nodecrypto2.default.randomUUID();
  const deviceId = options.deviceId || _nodecrypto2.default.randomUUID();
  const model = "alibaba/qwen3-next-80b-a3b-instruct";

  const messages = [
    ...(options.history || []).map((item) => ({
      id: _nodecrypto2.default.randomUUID(),
      role: item.role,
      content: item.content,
    })),
    {
      id: _nodecrypto2.default.randomUUID(),
      role: "user",
      content: prompt,
    },
    {
      id: _nodecrypto2.default.randomUUID(),
      role: "system",
      content: "Siga el idioma de usuario y la respuesta a la gaya natural, corta y clara.",
    },
  ];

  const body = {
    chatId,
    model,
    messages,
    personaId: "qwen-3-landing",
    frequency_penalty: 0,
    max_tokens: 4000,
    presence_penalty: 0,
    stream: true,
    temperature: 0.5,
    top_p: 0.95,
  };

  const headers = {
    "sec-ch-ua-platform": `"Android"`,
    "x-device-uuid": deviceId,
    "sec-ch-ua": `"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"`,
    "sec-ch-ua-mobile": "?1",
    "x-device-language": "id-ID",
    "x-device-platform": "web",
    "x-device-version": "1.0.44",
    "user-agent": ua,
    accept: "*/*",
    "content-type": "application/json",
    origin: "https://overchat.ai",
    referer: "https://overchat.ai/",
    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    priority: "u=1, i",
  };

  const response = await fetch(API, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    return { status: false, code: response.status, model, error: text };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  let answer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line.startsWith("data:")) continue;

      const data = line.slice(5).trim();
      if (!data || data === "[DONE]") continue;

      try {
        const json = JSON.parse(data);
        const content = _optionalChain([json, 'access', _ => _.choices, 'optionalAccess', _2 => _2[0], 'optionalAccess', _3 => _3.delta, 'optionalAccess', _4 => _4.content]);
        if (typeof content === "string") answer += content;
      } catch (e) {}
    }
  }

  return { status: true, code: response.status, model, question: prompt, answer };
}

exports.Qwen3 = Qwen3;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

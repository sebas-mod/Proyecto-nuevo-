"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _nodecrypto = require('node:crypto'); var _nodecrypto2 = _interopRequireDefault(_nodecrypto);

const API = "https://feelbetterbot.com/";

const SYSTEM_MESSAGE =
  "Usted es el asistente de AI Ditzz compuesto de.xSi el usuario utiliza el idioma indonesio, responde en idioma inglés natural, orc, spurs, and lans y lasso, no salga de la boca de repente a menos que el usuario le pida que pregunte qué hace, su desarrollador, o qué le hizo, el verdadero que le hizo el zz fue.x.";

const DEFAULT_ASSISTANT =
  "Hi, I'm FeelBetterBot — I'm here to listen and help you carry whatever feels heavy, without judgment. I draw on gentle, proven ways of working through hard things, but mostly I just want to understand what you're going through. So, how are you doing right now?";

function makeMemoryId() {
  const animals = ["owl", "fox", "cat", "wolf", "bear", "lion", "deer", "bird"];
  const words = ["safe", "calm", "soft", "kind", "warm", "bright", "gentle"];
  const word = words[Math.floor(Math.random() * words.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${word}-${animal}-${number}`;
}

function parseChunk(line) {
  let data = line.trim();
  if (!data || data === "[DONE]") return "";
  if (data.startsWith("data:")) data = data.slice(5).trim();
  if (!data || data === "[DONE]") return "";

  try {
    const json = JSON.parse(data);
    if (typeof json === "string") return json;
    if (typeof json.content === "string") return json.content;
    if (typeof json.text === "string") return json.text;
    if (typeof json.delta === "string") return json.delta;
    if (typeof json.message === "string") return json.message;
    if (typeof json.response === "string") return json.response;
    if (typeof json.answer === "string") return json.answer;
    const openAiContent = _optionalChain([json, 'access', _ => _.choices, 'optionalAccess', _2 => _2[0], 'optionalAccess', _3 => _3.delta, 'optionalAccess', _4 => _4.content]);
    if (typeof openAiContent === "string") return openAiContent;
    return "";
  } catch (e) {
    return data;
  }
}

async function FeelBetter(prompt, options = {}) {
  const memoryId = options.memoryId || makeMemoryId();
  const history = options.history || [];

  const messages = [
    { role: "system", content: SYSTEM_MESSAGE },
    { role: "assistant", content: DEFAULT_ASSISTANT },
    ...history.map((item) => ({
      role: item.role,
      content: item.content,
    })),
    { role: "user", content: prompt },
  ];

  const headers = {
    "sec-ch-ua-platform": `"Android"`,
    "user-agent":
      "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
    "sec-ch-ua": `"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"`,
    "content-type": "application/json",
    "sec-ch-ua-mobile": "?1",
    accept: "*/*",
    origin: "https://feelbetterbot.com",
    referer: "https://feelbetterbot.com/",
    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    cookie: `feelbet-memory=${memoryId}`,
    priority: "u=1, i",
  };

  const response = await fetch(API, {
    method: "POST",
    headers,
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const text = await response.text();
    return { status: false, code: response.status, memoryId, error: text };
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
      const chunk = parseChunk(rawLine);
      if (chunk) answer += chunk;
    }
  }

  if (buffer.trim()) {
    const chunk = parseChunk(buffer);
    if (chunk) answer += chunk;
  }

  return { status: true, code: response.status, memoryId, question: prompt, answer };
}

exports.FeelBetter = FeelBetter;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

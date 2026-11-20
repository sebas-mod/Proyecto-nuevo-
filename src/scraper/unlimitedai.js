"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _nodecrypto = require('node:crypto'); var _nodecrypto2 = _interopRequireDefault(_nodecrypto);

const API = "https://app.unlimitedai.chat/api/chat";

const ua =
  "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36";

function parseSetCookie(headers) {
  const result = {};
  const setCookie =
    typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : headers.get("set-cookie")
        ? [headers.get("set-cookie")]
        : [];
  for (const item of setCookie) {
    const first = item.split(";")[0];
    const index = first.indexOf("=");
    if (index !== -1) {
      result[first.slice(0, index).trim()] = first.slice(index + 1).trim();
    }
  }
  return result;
}

function buildCookie(deviceId, chatId, cookies = {}) {
  return Object.entries({
    NEXT_LOCALE: "id",
    u_device_id: deviceId,
    home_chat_id: chatId,
    ...cookies,
  })
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

const CHARACTERS = {
  "ourin-ai": {
    name: "Ourin AI",
    prompt: `You 're Ourin Al, Assistant to WhatsApp, sweet, responsive, you answer in English language with megasia but informative but informative.`,
  },
  "kobo-ai": {
    name: "Kobo Kanaeru",
    prompt: `You 're Kobo Kanaeru, from Holove Indonesia Gen. You 're the girl of Cheers, energy, and a little bit of a condescending.`,
  },
  "waguri-ai": {
    name: "Waguri",
    prompt: `Bailas un waguri, usas vidrio así que lo que tienes en la cara y hablas del idioma inglés y dulce, a menudo usando E, así que usas vidrio así que lo haces de una manera flagrante.`,
  },
  "jokowi-ai": {
    name: "Pak Jokowi",
    prompt: `You 're Joko Widodo, the original President of Ri.`,
  },
  "prabowo-ai": {
    name: "Pak Prabowo",
    prompt: `You 're Prabowo Subianto, President Ri and General Partai Gerinra.`,
  },
};

async function UnlimitedAI(prompt, character = "ourin-ai") {
  const chatId = _nodecrypto2.default.randomUUID();
  const deviceId = _nodecrypto2.default.randomUUID();
  const char = CHARACTERS[character] || CHARACTERS["ourin-ai"];

  const systemPrompt = `${char.prompt}\n\nPertanyaan user: ${prompt}`;

  const createdAt = new Date().toISOString();

  const messages = [
    {
      id: _nodecrypto2.default.randomUUID(),
      role: "user",
      content: systemPrompt,
      parts: [{ type: "text", text: systemPrompt }],
      createdAt,
    },
    {
      id: _nodecrypto2.default.randomUUID(),
      role: "assistant",
      content: "",
      parts: [{ type: "text", text: "" }],
      createdAt,
    },
  ];

  const body = {
    chatId,
    messages,
    selectedChatModel: "chat-model-reasoning",
    selectedCharacter: null,
    selectedStory: null,
    deviceId,
    locale: "id",
  };

  const headers = {
    "sec-ch-ua-platform": `"Android"`,
    "user-agent": ua,
    "sec-ch-ua": `"Google Chrome";v="147", "Not.A/Brand";v="8", "Chromium";v="147"`,
    "content-type": "application/json",
    "sec-ch-ua-mobile": "?1",
    "x-next-intl-locale": "id",
    accept: "*/*",
    origin: "https://app.unlimitedai.chat",
    referer: "https://app.unlimitedai.chat/id",
    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    cookie: buildCookie(deviceId, chatId),
    priority: "u=1, i",
  };

  const response = await fetch(API, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    return {
      status: false,
      code: response.status,
      error: text,
    };
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
      if (!line) continue;

      try {
        const json = JSON.parse(line);
        if (json.type === "delta" && typeof json.delta === "string") {
          answer += json.delta;
        }
      } catch (e) {}
    }
  }

  return {
    status: true,
    code: response.status,
    character: char.name,
    model: "chat-model-reasoning",
    answer,
  };
}

exports.UnlimitedAI = UnlimitedAI; exports.CHARACTERS = CHARACTERS;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

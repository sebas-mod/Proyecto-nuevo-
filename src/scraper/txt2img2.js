"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _nodecrypto = require('node:crypto'); var _nodecrypto2 = _interopRequireDefault(_nodecrypto);

const UPSAMPLER_URL = "https://upsampler.com/free-image-generator-no-signup";
const SPACE_URL = "https://black-forest-labs-flux-2-klein-4b.hf.space";

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
  Accept: "*/*",
  "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  Origin: "https://upsampler.com",
  Referer: "https://upsampler.com/",
};

async function checkPrompt(prompt) {
  try {
    const res = await _axios2.default.post(UPSAMPLER_URL, JSON.stringify([prompt]), {
      timeout: 30000,
      headers: {
        "User-Agent": headers["User-Agent"],
        Accept: "text/x-component",
        "Content-Type": "text/plain;charset=UTF-8",
        Origin: "https://upsampler.com",
        Referer: UPSAMPLER_URL,
        "next-action": "315bc26dade9ed14e1a168a4d9f7cea08869133d",
      },
    });

    const text = String(res.data || "");

    return {
      flagged: text.includes('"flagged":true'),
      rateLimited: text.includes('"rateLimited":true'),
    };
  } catch (e2) {
    return { flagged: false, rateLimited: false };
  }
}

async function getResult(sessionHash, eventId) {
  const res = await _axios2.default.get(
    `${SPACE_URL}/gradio_api/queue/datos?session_hash=${sessionHash}`,
    {
      timeout: 180000,
      responseType: "stream",
      headers: {
        ...headers,
        Accept: "text/event-stream",
        "Content-Type": "application/json",
      },
    },
  );

  return new Promise((resolve, reject) => {
    let buffer = "";
    let done = false;

    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      res.data.destroy();
      reject(new Error("Timeout espera resultados"));
    }, 180000);

    res.data.on("data", (chunk) => {
      if (done) return;

      buffer += chunk.toString();
      const blocks = buffer.split("\n\n");
      buffer = blocks.pop() || "";

      for (const block of blocks) {
        const line = block.split("\n").find((item) => item.startsWith("data: "));
        if (!line) continue;

        const raw = line.replace("data: ", "").trim();
        if (!raw || raw === "[DONE]") continue;

        try {
          const json = JSON.parse(raw);

          if (json.event_id && json.event_id !== eventId) continue;

          if (json.msg === "process_completed") {
            const url = extractUrl(json.output);
            if (!url) throw new Error("URL de resultados no encontradas");

            done = true;
            clearTimeout(timer);
            res.data.destroy();
            resolve(url);
            return;
          }

          if (json.msg === "process_failed") {
            throw new Error("Generate fallido");
          }
        } catch (err) {
          done = true;
          clearTimeout(timer);
          res.data.destroy();
          reject(err);
          return;
        }
      }
    });

    res.data.on("error", (err) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      reject(err);
    });

    res.data.on("end", () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      reject(new Error("Corriente terminada sin resultado"));
    });
  });
}

function extractUrl(output) {
  const text = JSON.stringify(output || "");

  const fullUrl = text.match(
    /https:\/\/black-forest-labs-flux-2-klein-4b\.hf\.space\/gradio_api\/file=[^"'\\\s]+/,
  );

  if (fullUrl) {
    return fullUrl[0].replaceAll("\\u0026", "&").replaceAll("\\/", "/");
  }

  const path = text.match(/\/tmp\/gradio\/[^"'\\\s]+?\.(webp|png|jpg|jpeg)/);

  if (path) {
    return `${SPACE_URL}/gradio_api/archivo=${path[0]}`;
  }

  return "";
}

async function Txt2Img2(prompt) {
  try {
    const check = await checkPrompt(prompt);

    if (check.flagged) {
      return { status: false, code: 400, prompt, error: "Propulsión insegura detectada" };
    }

    if (check.rateLimited) {
      return { status: false, code: 429, prompt, error: "Rate limited, coba lagi nanti" };
    }

    const sessionHash = _nodecrypto2.default.randomBytes(8).toString("hex");

    const joinRes = await _axios2.default.post(
      `${SPACE_URL}/ graohajir fuego / cola / unirse?`,
      {
        data: [prompt, [], "Distilled (4 steps)", 0, true, 1024, 1024, 4, 1, false],
        event_data: null,
        fn_index: 6,
        trigger_id: null,
        session_hash: sessionHash,
      },
      {
        timeout: 30000,
        headers: {
          ...headers,
          "Content-Type": "application/json",
          "x-gradio-user": "api",
        },
      },
    );

    const eventId = _optionalChain([joinRes, 'access', _ => _.data, 'optionalAccess', _2 => _2.event_id]);

    if (!eventId) {
      return { status: false, code: 500, prompt, error: "No lo encontraron." };
    }

    const url = await getResult(sessionHash, eventId);

    return { status: true, code: 200, prompt, url };
  } catch (e) {
    return {
      status: false,
      code: _optionalChain([e, 'access', _3 => _3.response, 'optionalAccess', _4 => _4.status]) || 500,
      prompt,
      error: e.message || "Unknown error",
    };
  }
}

exports.Txt2Img2 = Txt2Img2;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

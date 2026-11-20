"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
async function gemini(input = {}) {
  const payload = typeof input === "string" ? { message: input } : input || {};
  const { message, instruction = "", sessionId = null } = payload;

  try {
    if (!message) throw new Error("Message is required.");

    let resumeArray = null;
    let cookie = null;
    let savedInstruction = instruction;

    if (sessionId) {
      try {
        const sessionData = JSON.parse(
          Buffer.from(sessionId, "base64").toString(),
        );
        resumeArray = sessionData.resumeArray;
        cookie = sessionData.cookie;
        savedInstruction = instruction || sessionData.instruction || "";
      } catch (e) {
        console.error("Error parsing session:", e.message);
      }
    }

    if (!cookie) {
      const { headers } = await _axios2.default.post(
        "https://gemini.google.com/_/BardChatUi/data/batchexecute?rpcids=maGuAc&source-path=%2F&bl=boq_assistant-bard-web-server_20250814.06_p1&f.sid=-7816331052118000090&hl=en-US&_reqid=173780&rt=c",
        "f.req=%5B%5B%5B%22maGuAc%22%2C%22%5B0%5D%22%2Cnull%2C%22generic%22%5D%5D%5D&",
        {
          headers: {
            "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
          },
        },
      );

      cookie = _optionalChain([headers, 'access', _ => _["set-cookie"], 'optionalAccess', _2 => _2[0], 'optionalAccess', _3 => _3.split, 'call', _4 => _4("; "), 'access', _5 => _5[0]]) || "";
    }

    const requestBody = [
      [message, 0, null, null, null, null, 0],
      ["en-US"],
      resumeArray || ["", "", "", null, null, null, null, null, null, ""],
      null,
      null,
      null,
      [1],
      1,
      null,
      null,
      1,
      0,
      null,
      null,
      null,
      null,
      null,
      [[0]],
      1,
      null,
      null,
      null,
      null,
      null,
      [
        "",
        "",
        savedInstruction,
        null,
        null,
        null,
        null,
        null,
        0,
        null,
        1,
        null,
        null,
        null,
        [],
      ],
      null,
      null,
      1,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      1,
      null,
      null,
      null,
      null,
      [1],
    ];

    const payload = [null, JSON.stringify(requestBody)];

    const { data } = await _axios2.default.post(
      "https://gemini.google.com/_/BardChatUi/data/assistant.lamda.BardFrontendService/StreamGenerate?bl=boq_assistant-bard-web-server_20250729.06_p0&f.sid=4206607810970164620&hl=en-US&_reqid=2813378&rt=c",
      new URLSearchParams({ "f.req": JSON.stringify(payload) }).toString(),
      { 
        headers: {
          "content-type": "application/x-www-form-urlencoded;charset=UTF-8",
          "x-goog-ext-525001261-jspb":
            '[1,null,null,null,"9ec249fc9ad08861",null,null,null,[4]]',
          cookie: cookie,
        },
      },
    );

    const match = Array.from(data.matchAll(/^\d+\n(.+?)\n/gm));
    const array = match.reverse();
    let parse1 = null;

    for (const item of array) {
      const selectedArray = _optionalChain([item, 'optionalAccess', _6 => _6[1]]);
      if (!selectedArray) continue;

      try {
        const realArray = JSON.parse(selectedArray);
        const candidate = _optionalChain([realArray, 'optionalAccess', _7 => _7[0], 'optionalAccess', _8 => _8[2]]);
        if (!candidate) continue;

        const parsed = JSON.parse(candidate);
        if (_optionalChain([parsed, 'optionalAccess', _9 => _9[4], 'optionalAccess', _10 => _10[0], 'optionalAccess', _11 => _11[1], 'optionalAccess', _12 => _12[0]])) {
          parse1 = parsed;
          break;
        }
      } catch (e2) {}
    }

    if (!parse1) {
      throw new Error("Perguiendo stuntman la isla de Gemini.");
    }

    const newResumeArray = [...parse1[1], parse1[4][0][0]];
    const text = parse1[4][0][1][0].replace(/\*\*(.+?)\*\*/g, "*$1*");

    const newSessionId = Buffer.from(
      JSON.stringify({
        resumeArray: newResumeArray,
        cookie: cookie,
        instruction: savedInstruction,
      }),
    ).toString("base64");

    return {
      text: text,
      sessionId: newSessionId,
    };
  } catch (error) {
    if (_optionalChain([error, 'optionalAccess', _13 => _13.response, 'optionalAccess', _14 => _14.data])) {
      const apiMessage =
        typeof error.response.data === "string"
          ? error.response.data
          : error.response.data.message || error.response.data.error;
      if (apiMessage) {
        error.message = apiMessage;
      }
    }

    throw error;
  }
}

exports.chat = gemini;
exports. default = gemini;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

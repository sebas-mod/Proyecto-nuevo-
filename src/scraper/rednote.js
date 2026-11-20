"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);

const generateRandomIP = () =>
  Array.from({ length: 4 }, () => Math.floor(Math.random() * 255)).join(".");

async function RedNoteDL(xhsUrl) {
  const fakeIP = generateRandomIP();

  const response = await _axios2.default.post(
    "https://rednote.savevideodown.com/api/download",
    { url: xhsUrl },
    {
      headers: {
        "Content-Type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
        Referer: "https://rednote.savevideodown.com/",
        Origin: "https://rednote.savevideodown.com",
        "X-Forwarded-For": fakeIP,
        "X-Real-IP": fakeIP,
        "Client-IP": fakeIP,
      },
    },
  );

  const resData = response.data;

  if (!resData.success) {
    return {
      status: false,
      error: resData.error || "Gagalm recogió datos",
    };
  }

  return {
    status: true,
    title: resData.title,
    author: resData.author,
    type: resData.type,
    results:
      resData.type === "video"
        ? [resData.directVideoUrl || resData.downloadUrl]
        : resData.directImages || [],
  };
}

exports.RedNoteDL = RedNoteDL;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

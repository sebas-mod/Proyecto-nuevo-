"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);

async function DouyinDL(douyinUrl) {
  const response = await _axios2.default.post(
    "https://snapvideotools.com/api/snap",
    { text: douyinUrl },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/javascript, */*; q=0.01",
        "X-Requested-With": "XMLHttpRequest",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Referer: "https://snapvideotools.com/",
        Origin: "https://snapvideotools.com",
      },
    },
  );

  const data = response.data.data;

  if (!data || !data.mediaUrls) {
    return {
      status: false,
      error: "Datos no encontrados",
    };
  }

  const video = data.mediaUrls.find((m) => m.type === "video");
  const audio = data.mediaUrls.find((m) => m.type === "audio");

  return {
    status: true,
    title: data.title,
    platform: data.platformName,
    video: video ? video.url : null,
    audio: audio ? audio.url : null,
  };
}

exports.DouyinDL = DouyinDL;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

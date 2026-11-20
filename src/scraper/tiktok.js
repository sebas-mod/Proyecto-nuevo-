"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _cheerio = require('cheerio'); var cheerio = _interopRequireWildcard(_cheerio);

const YUULABS_API = "https://api.yuulabs.web.id/api/downloader/tiktok?url=";
const REQUEST_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Linux; Android 15; SM-F958 Build/AP3A.240905.015) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36",
};

async function ttdownFromYuuLabs(url) {
  const { data } = await _axios2.default.get(`${YUULABS_API}${encodeURIComponent(url)}`, {
    timeout: 30000,
    headers: REQUEST_HEADERS,
  });

  if (!_optionalChain([data, 'optionalAccess', _ => _.status]) || !_optionalChain([data, 'optionalAccess', _2 => _2.result])) {
    throw new Error(_optionalChain([data, 'optionalAccess', _3 => _3.message]) || "YuuLabs response invalid");
  }

  const result = data.result;
  const downloads = [];

  if (result.videoUrl) {
    downloads.push({
      type: "nowatermark",
      label: "Video tanpa watermark",
      url: result.videoUrl,
    });
  }

  if (result.hdVideo) {
    downloads.push({
      type: "nowatermark_hd",
      label: "Video HD",
      url: result.hdVideo,
    });
  }

  if (result.audioUrl) {
    downloads.push({
      type: "mp3",
      label: "Audio MP3",
      url: result.audioUrl,
    });
  }

  if (downloads.length === 0) {
    throw new Error("YuuLabs no devolvió las descargas de enlaces");
  }

  return {
    title: result.description || "",
    author: {
      username: result.author || "",
      avatar: null,
    },
    cover: null,
    downloads,
  };
}

async function ttdownFromMusicalDown(url) {
  const { data: html, headers } = await _axios2.default.get(
    "https://musicaldown.com/en",
    {
      timeout: 30000,
      headers: REQUEST_HEADERS,
    },
  );
  const $ = cheerio.load(html);

  const payload = {};
  $("#submit-form input").each((i, elem) => {
    const name = $(elem).attr("name");
    const value = $(elem).attr("value");
    if (name) payload[name] = value || "";
  });

  const urlField = Object.keys(payload).find((key) => !payload[key]);
  if (urlField) payload[urlField] = url;

  const cookieHeader = Array.isArray(headers["set-cookie"])
    ? headers["set-cookie"].join("; ")
    : "";

  const { data } = await _axios2.default.post(
    "https://musicaldown.com/download",
    new URLSearchParams(payload).toString(),
    {
      timeout: 30000,
      headers: {
        ...REQUEST_HEADERS,
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        cookie: cookieHeader,
        origin: "https://musicaldown.com",
        referer: "https://musicaldown.com/",
      },
    },
  );

  const $$ = cheerio.load(data);
  const videoHeader = $$(".video-header");
  const bgImage = videoHeader.attr("style");
  const coverMatch = _optionalChain([bgImage, 'optionalAccess', _4 => _4.match, 'call', _5 => _5(/url\((.*?)\)/)]);

  const downloads = [];
  $$("a.download").each((i, elem) => {
    const $elem = $$(elem);
    const type = _optionalChain([$elem, 'access', _6 => _6.data, 'call', _7 => _7("event"), 'optionalAccess', _8 => _8.replace, 'call', _9 => _9("_download_click", "")]);
    const label = $elem.text().trim();
    const downloadUrl = $elem.attr("href");
    if (!downloadUrl) return;
    downloads.push({
      type,
      label,
      url: downloadUrl,
    });
  });

  if (downloads.length === 0) {
    throw new Error("Musical Down no devuelve las descargas de enlaces");
  }

  return {
    title: $$(".video-desc").text().trim(),
    author: {
      username: $$(".video-author b").text().trim(),
      avatar: $$(".img-area img").attr("src"),
    },
    cover: coverMatch ? coverMatch[1] : null,
    downloads,
  };
}

async function ttdown(url) {
  try {
    if (!url.includes("tiktok.com")) throw new Error("Invalid url.");
    try {
      return await ttdownFromYuuLabs(url);
    } catch (e) {
      return await ttdownFromMusicalDown(url);
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

exports. default = ttdown;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

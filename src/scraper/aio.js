"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _igjs = require('./ig.js'); var _igjs2 = _interopRequireDefault(_igjs);
var _pindljs = require('./pindl.js'); var _pindljs2 = _interopRequireDefault(_pindljs);
var _ytdljs = require('./ytdl.js'); var _ytdljs2 = _interopRequireDefault(_ytdljs);
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _cheerio = require('cheerio'); var cheerio = _interopRequireWildcard(_cheerio);

const PLATFORM_DETECT = [
  { key: "instagram", patterns: ["instagram.com"] },
  { key: "youtube", patterns: ["youtube.com", "youtu.be"] },
  { key: "tiktok", patterns: ["tiktok.com", "vt.tiktok.com"] },
  { key: "facebook", patterns: ["facebook.com", "fb.watch", "fb.com"] },
  { key: "pinterest", patterns: ["pinterest.com", "pin.it"] },
  { key: "capcut", patterns: ["capcut.com"] },
  { key: "twitter", patterns: ["twitter.com", "x.com"] },
  { key: "threads", patterns: ["threads.net"] },
  { key: "reddit", patterns: ["reddit.com"] },
];

function detectPlatform(url) {
  const lower = (url || "").toLowerCase();
  for (const p of PLATFORM_DETECT) {
    if (p.patterns.some((pat) => lower.includes(pat))) return p.key;
  }
  return null;
}

async function handleInstagram(url) {
  const result = await _igjs2.default.call(void 0, url);
  const media = (result.media || []).map((item) => ({
    type: item.type === "video" || item.type === "mp4" ? "video" : "image",
    url: item.url,
  }));
  return {
    platform: "instagram",
    title: result.title || result.username || "Instagram",
    thumbnail: result.thumbnail || null,
    media,
  };
}

async function handleYoutube(url) {
  const yt = new (0, _ytdljs.Youtube)();
  const videoResult = await yt.download(url, "mp4");
  const audioResult = await yt.download(url, "mp3");
  const media = [];
  if (_optionalChain([videoResult, 'optionalAccess', _2 => _2.results, 'optionalAccess', _3 => _3.download])) {
    media.push({
      type: "video",
      url: videoResult.results.download,
      quality: "mp4",
    });
  }
  if (_optionalChain([audioResult, 'optionalAccess', _4 => _4.results, 'optionalAccess', _5 => _5.download])) {
    media.push({
      type: "audio",
      url: audioResult.results.download,
      quality: "mp3",
    });
  }
  return {
    platform: "youtube",
    title:
      _optionalChain([videoResult, 'optionalAccess', _6 => _6.results, 'optionalAccess', _7 => _7.title]) || _optionalChain([audioResult, 'optionalAccess', _8 => _8.results, 'optionalAccess', _9 => _9.title]) || "YouTube",
    thumbnail: null,
    media,
  };
}

async function handleTiktok(url) {
  const domain = "https://www.tikwm.com/api/";
  const res = (
    await _axios2.default.post(
      domain,
      {},
      {
        headers: {
          Accept: "application/json, text/javascript, */*; q=0.01",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Origin: "https://www.tikwm.com",
          Referer: "https://www.tikwm.com/",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
          "X-Requested-With": "XMLHttpRequest",
        },
        params: { url, count: 12, cursor: 0, web: 1, hd: 1 },
      },
    )
  ).data.data;

  const media = [];
  if (_optionalChain([res, 'optionalAccess', _10 => _10.duration]) === 0) {
    (res.images || []).forEach((v) => media.push({ type: "image", url: v }));
  } else {
    if (_optionalChain([res, 'optionalAccess', _11 => _11.hdplay]))
      media.push({
        type: "video",
        url: "https://www.tikwm.com" + res.hdplay,
        quality: "HD",
      });
    if (_optionalChain([res, 'optionalAccess', _12 => _12.play]))
      media.push({
        type: "video",
        url: "https://www.tikwm.com" + res.play,
        quality: "NoWM",
      });
  }

  return {
    platform: "tiktok",
    title: _optionalChain([res, 'optionalAccess', _13 => _13.title]) || "TikTok",
    thumbnail: _optionalChain([res, 'optionalAccess', _14 => _14.cover]) ? "https://www.tikwm.com" + res.cover : null,
    author: _optionalChain([res, 'optionalAccess', _15 => _15.author, 'optionalAccess', _16 => _16.nickname]) || null,
    media,
  };
}

async function handleFacebook(url) {
  const { fbdown } = await Promise.resolve().then(() => _interopRequireWildcard(require("btch-downloader")));
  const data = await fbdown(url);
  if (!_optionalChain([data, 'optionalAccess', _17 => _17.status])) throw new Error("Facebook API returned no data");
  const videoUrl = data.HD || data.Normal_video;
  if (!videoUrl) throw new Error("No video URL");
  return {
    platform: "facebook",
    title: data.title || "Facebook",
    thumbnail: data.thumbnail || null,
    media: [{ type: "video", url: videoUrl, quality: data.HD ? "HD" : "SD" }],
  };
}

async function handlePinterest(url) {
  const result = await _pindljs2.default.call(void 0, url);
  if (!_optionalChain([result, 'optionalAccess', _18 => _18.media, 'optionalAccess', _19 => _19.length])) throw new Error("No media found");
  return {
    platform: "pinterest",
    title: result.title || "Pinterest",
    thumbnail: null,
    media: result.media.map((m) => ({
      type: m.type === "video" ? "video" : "image",
      url: m.url,
      quality: m.quality || null,
    })),
  };
}

async function handleCapcut(url) {
  const { capcut } = await Promise.resolve().then(() => _interopRequireWildcard(require("btch-downloader")));
  const data = await capcut(url);
  if (!_optionalChain([data, 'optionalAccess', _20 => _20.status]) || !_optionalChain([data, 'optionalAccess', _21 => _21.originalVideoUrl]))
    throw new Error("No CapCut video");
  return {
    platform: "capcut",
    title: data.title || "CapCut",
    thumbnail: data.thumbnail || null,
    media: [{ type: "video", url: data.originalVideoUrl }],
  };
}

const SAVEFBS_HEADERS = {
  accept: "*/*",
  "content-type": "application/json",
  referer: "https://savefbs.com/all-in-one-video-downloader/",
  "user-agent":
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36",
};

async function handleSavefbs(url) {
  const BASE_URL = "https://savefbs.com/api/v1/aio";
  const infoRes = await fetch(`${BASE_URL}/html`, {
    method: "POST",
    headers: SAVEFBS_HEADERS,
    body: JSON.stringify({
      vid: url,
      prefix: "savefbs.com",
      ex: "",
      format: "",
    }),
  });
  const html = await infoRes.text();
  const $ = cheerio.load(html);

  const title = $("h3.text-sm").text().trim();
  const thumb = $("img.aio-thumbnail").attr("src");
  const token = $(".aio-format-btn").first().attr("data-loader-id");

  const formats = [];
  $(".aio-format-btn").each((_, el) => {
    const onclick = $(el).attr("onclick");
    const match = _optionalChain([onclick, 'optionalAccess', _22 => _22.match, 'call', _23 => _23(/'([^']+)'/)]);
    if (match) formats.push(match[1]);
  });

  if (!token || !formats.length) throw new Error("Savefbs returned no data");

  const VIDEO_PRIORITY = ["1080", "720", "480", "360"];
  const AUDIO_FORMATS = ["mp3", "wav"];
  const bestVideo = VIDEO_PRIORITY.find((f) => formats.includes(f));
  const format =
    bestVideo || formats.find((f) => !AUDIO_FORMATS.includes(f)) || formats[0];

  const dlRes = await fetch(`${BASE_URL}/download`, {
    method: "POST",
    headers: SAVEFBS_HEADERS,
    body: JSON.stringify({ token, format }),
  });
  const dlData = await dlRes.json();
  const downloadUrl = _optionalChain([dlData, 'optionalAccess', _24 => _24.url]) || _optionalChain([dlData, 'optionalAccess', _25 => _25.download]) || _optionalChain([dlData, 'optionalAccess', _26 => _26.data, 'optionalAccess', _27 => _27.url]);
  if (!downloadUrl) throw new Error("Savefbs no download URL");

  const isAudio = AUDIO_FORMATS.includes(format);
  return {
    platform: "savefbs",
    title: title || "Downloaded",
    thumbnail: thumb || null,
    media: [
      { type: isAudio ? "audio" : "video", url: downloadUrl, quality: format },
    ],
  };
}

const PLATFORM_HANDLERS = {
  instagram: handleInstagram,
  youtube: handleYoutube,
  tiktok: handleTiktok,
  facebook: handleFacebook,
  pinterest: handlePinterest,
  capcut: handleCapcut,
  twitter: handleSavefbs,
  threads: handleSavefbs,
  reddit: handleSavefbs,
};

async function aiodl(url) {
  const platform = detectPlatform(url);
  if (!platform) throw new Error("Plataforma no jugada");

  const handler = PLATFORM_HANDLERS[platform];
  if (!handler) throw new Error(`Handler para${platform}no disponible`);

  try {
    return await handler(url);
  } catch (err) {
    if (
      platform !== "twitter" &&
      platform !== "threads" &&
      platform !== "reddit"
    ) {
      try {
        return await handleSavefbs(url);
      } catch (e) {}
    }
    throw err;
  }
}

exports.aiodl = aiodl; exports.detectPlatform = detectPlatform;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

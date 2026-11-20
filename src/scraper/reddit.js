"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _cheerio = require('cheerio'); var cheerio = _interopRequireWildcard(_cheerio);

async function RedditDL(redditUrl) {
  const ts = Date.now();
  const apiUrl = `https://redvid.io/fetch?_=${ts}`;
  const headers = {
    authority: "redvid.io",
    accept: "application/json, text/plain, */*",
    "content-type": "application/json",
    origin: "https://redvid.io",
    referer: "https://redvid.io/",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "x-requested-with": "XMLHttpRequest",
  };

  try {
    const { data } = await _axios2.default.post(
      apiUrl,
      { url: redditUrl, lang: "en" },
      { headers },
    );

    if (data.success && data.view) {
      const $ = cheerio.load(data.view);
      const mediaResults = [];

      $(".response-cinema-gallery-item").each((i, el) => {
        const thumb = $(el).find("img.thumbnail-image").attr("src");
        const downloadBtn = $(el).find('a[href*="/download?token="]');
        const downloadUrl = downloadBtn.attr("href");
        const typeText = downloadBtn.text().trim();

        if (downloadUrl) {
          mediaResults.push({
            item: i + 1,
            type: typeText.toLowerCase().includes("video") ? "video" : "image",
            thumbnail: thumb,
            download_url: downloadUrl,
          });
        }
      });

      return {
        status: true,
        title: $(".response-cinema-title").text().trim(),
        results: mediaResults,
      };
    }

    return { status: false, error: "Gagalm recogió datos" };
  } catch (e) {
    return { status: false, error: e.message };
  }
}

exports.RedditDL = RedditDL;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

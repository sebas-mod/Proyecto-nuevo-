"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _cheerio = require('cheerio'); var cheerio = _interopRequireWildcard(_cheerio);
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
async function wallpaperScraper(query) {
  try {
    const url = `https://www.wallpaperflare.com/search?wallpaper=${encodeURIComponent(query)}`

    const { data } = await _axios2.default.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    })

    const $ = cheerio.load(data)
    const results = []

    $('li[itemprop="associatedMedia"]').each((_, el) => {
      const title = $(el)
        .find('figcaption[itemprop="caption description"]')
        .text()
        .trim()

      const image = $(el).find("img").attr("data-src")
      const page = $(el).find('a[itemprop="url"]').attr("href")
      const resolution = $(el).find(".res").text().trim()

      if (image && page) {
        results.push({
          title,
          resolution,
          image,
          page: `https://www.wallpaperflare.com${page}`
        })
      }
    })

    if (!results.length) {
      return {
        success: false,
        message: "No hay Wallpaler encontrado"
      }
    }

    return {
      success: true,
      total: results.length,
      results
    }

  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

exports. default = wallpaperScraper
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

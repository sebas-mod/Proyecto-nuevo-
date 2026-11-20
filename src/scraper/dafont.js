"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _cheerio = require('cheerio'); var cheerio = _interopRequireWildcard(_cheerio);

async function DaFont(query) {
  try {
    const url = "https://www.dafont.com/search.php?q=" + encodeURIComponent(query);
    const res = await _axios2.default.get(url, {
      timeout: 15000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36",
      },
    });

    const $ = cheerio.load(res.data);
    const results = [];

    $(".lv1left.dfbg").each((i, el) => {
      const base = $(el);
      const lv2 = base.nextAll(".lv2right").first();
      const dlbox = base.nextAll(".dlbox").first();
      const previewBox = base.nextAll(".preview").first();

      const raw = base.text().replace(/\s+/g, " ").trim();
      const author = base.find("a").first().text().trim();
      const name = raw.replace(/\s*by\s*.+$/i, "").trim();

      const info = lv2.find(".light").text().trim();
      const downloads = _optionalChain([info, 'access', _ => _.match, 'call', _2 => _2(/[\d,]+ downloads/), 'optionalAccess', _3 => _3[0]]) || null;
      const yesterday = _optionalChain([info, 'access', _4 => _4.match, 'call', _5 => _5(/\((.*?)\)/), 'optionalAccess', _6 => _6[1]]) || null;
      const license = lv2.find("a.help").first().text().trim();

      const dl = dlbox.find("a.dl").attr("href");
      const download = dl ? "https:" + dl : null;

      const style = previewBox.attr("style");
      const preview = style
        ? "https://www.dafont.com" + (_optionalChain([style, 'access', _7 => _7.match, 'call', _8 => _8(/url\((.*?)\)/), 'optionalAccess', _9 => _9[1]]) || "")
        : null;

      results.push({ name, author, downloads, yesterday, license, download, preview });
    });

    if (results.length === 0) {
      return { status: false, error: "Font tidak ditemukan" };
    }

    return { status: true, query, count: results.length, results };
  } catch (e) {
    return { status: false, error: e.message };
  }
}

exports.DaFont = DaFont;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

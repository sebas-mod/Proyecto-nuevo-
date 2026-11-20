"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _cheerio = require('cheerio'); var cheerio = _interopRequireWildcard(_cheerio);
async function scrapeWutheringWavesCharacter(name) {
    if (!name) throw new Error("Nama karakter kosong");

    const slug = name.trim().replace(/\s+/g, "_");
    const url = `https://wutheringwaves.fandom.com/wiki/${encodeURIComponent(slug)}`;

    const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0" }
    });

    if (!res.ok) {
        throw new Error("Data tidak ditemukan");
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const clean = (v) => _optionalChain([v, 'optionalAccess', _2 => _2.replace, 'call', _3 => _3(/\s+/g, " "), 'access', _4 => _4.trim, 'call', _5 => _5()]) || null;

    const title = clean($("#firstHeading").text());
    if (!title) {
        throw new Error("Halaman tidak valid");
    }

    const bio = clean($(".mw-parser-output > p").first().text());

    const profile = {};
    $(".pi-item.pi-data").each((_, el) => {
        const label = clean($(el).find(".pi-data-label").text());
        const value = clean($(el).find(".pi-data-value").text());
        if (!label || !value) return;

        const key = label
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "_")
            .replace(/^_+|_+$/g, "");

        profile[key] = value;
    });

    const pageSlug = slug.toLowerCase();
    const imageSet = new Set();

    $("img, noscript img").each((_, img) => {
        let src =
            $(img).attr("data-src") ||
            $(img).attr("src");

        const srcset =
            $(img).attr("data-srcset") ||
            $(img).attr("srcset");

        if (!src && srcset) {
            src = srcset.split(",")[0].split(" ")[0];
        }

        if (!src) return;
        if (!src.includes("static.wikia.nocookie.net")) return;
        if (!src.toLowerCase().includes(pageSlug)) return;

        imageSet.add(
            src.split("/revision/")[0] + "/revision/latest"
        );
    });

    return {
        title,
        slug,
        url,
        bio,
        profile,
        images: [...imageSet]
    };
}

exports. default = scrapeWutheringWavesCharacter
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

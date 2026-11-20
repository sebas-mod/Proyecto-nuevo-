"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _cheerio = require('cheerio'); var cheerio = _interopRequireWildcard(_cheerio);
async function scrapeHokCharacter(name) {
    if (!name) throw new Error("Nombre de carácter vacío");

    const url = `https://honor-of-kings.fandom.com/wiki/${encodeURIComponent(name)}`;

    const res = await fetch(url, {
        headers: {
            "User-Agent": "Mozilla/5.0"
        }
    });

    if (!res.ok) {
        throw new Error("Steenic toma la página de caracteres");
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const clean = (str) => _optionalChain([str, 'optionalAccess', _2 => _2.replace, 'call', _3 => _3(/\s+/g, " "), 'access', _4 => _4.trim, 'call', _5 => _5()]);

    const title = clean($("#firstHeading").text());
    if (!title) {
        throw new Error("El personaje no encontrado");
    }

    let image =
        $(".pi-image img").attr("src") ||
        $('meta[property="og:image"]').attr("content") ||
        null;

    if (image && image.startsWith("//")) {
        image = "https:" + image;
    }

    const profile = {};
    $(".pi-item.pi-data").each((_, el) => {
        const label = clean($(el).find(".pi-data-label").text());
        const value = clean($(el).find(".pi-data-value").text());
        if (label && value) profile[label] = value;
    });

    const bio = clean($(".mw-parser-output > p").first().text());

    let skills = [];
    if (profile.Skills) {
        skills = profile.Skills
            .split(/[,•]/)
            .map(v => clean(v))
            .filter(Boolean);
    }

    const loreParts = [];
    $("h2, h3").each((_, el) => {
        const heading = clean($(el).text());
        if (/Background|Lore/i.test(heading)) {
            let next = $(el).next();
            while (next.length && !/^h[2-3]$/i.test(next[0].name)) {
                if (next[0].name === "p") {
                    const txt = clean(next.text());
                    if (txt) loreParts.push(txt);
                }
                next = next.next();
            }
        }
    });

    return {
        title,
        image,
        profile,
        bio,
        skills,
        lore: loreParts.length ? loreParts.join(" ") : null,
        url
    };
}

exports. default = scrapeHokCharacter
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

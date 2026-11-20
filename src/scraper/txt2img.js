"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _cheerio = require('cheerio'); var cheerio = _interopRequireWildcard(_cheerio);
const client = _axios2.default.create({
  withCredentials: true,
  headers: {
    origin: "https://unrestrictedaiimagegenerator.com",
    referer: "https://unrestrictedaiimagegenerator.com/",
    "user-agent":
      "Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Mobile Safari/537.36",
  },
});

async function unrestrictedai(prompt, style = "anime") {
  const styles = [
    "photorealistic",
    "digital-art",
    "impressionist",
    "anime",
    "fantasy",
    "sci-fi",
    "vintage",
  ];

  if (!prompt) throw new Error("Prompt is required");
  if (!styles.includes(style))
    throw new Error(`Available styles: ${styles.join(", ")}`);

  const { data: html, headers } = await client.get(
    "https://unrestrictedaiimagegenerator.com/"
  );

  const cookies = _optionalChain([headers, 'access', _ => _["set-cookie"], 'optionalAccess', _2 => _2.join, 'call', _3 => _3("; ")]);
  if (cookies) client.defaults.headers.Cookie = cookies;

  const $ = cheerio.load(html);
  const nonce = $('input[name="_wpnonce"]').val();
  if (!nonce) throw new Error("Nonce not found");

  const form = new URLSearchParams({
    generate_image: "true",
    image_description: prompt,
    image_style: style,
    _wpnonce: nonce,
  });

  const { data: resultHtml } = await client.post(
    "https://unrestrictedaiimagegenerator.com/",
    form.toString(),
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    }
  );

  const $$ = cheerio.load(resultHtml);
  const img = $$("img#resultImage").attr("src");

  if (!img) throw new Error("Image not found");

  return img;
}

exports. default = unrestrictedai
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _formdata = require('form-data'); var _formdata2 = _interopRequireDefault(_formdata);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

const FCSI_API = "https://fgsi.dpdns.org/api/ai/image/img2img";

async function Uguu(buffer, filename) {
  const form = new (0, _formdata2.default)();
  form.append("files[]", buffer, { filename, contentType: "image/png" });

  const res = await _axios2.default.post("https://uguu.se/upload.php", form, {
    headers: form.getHeaders(),
    timeout: 30000,
  });

  if (_optionalChain([res, 'access', _ => _.data, 'optionalAccess', _2 => _2.files, 'optionalAccess', _3 => _3[0], 'optionalAccess', _4 => _4.url])) {
    return res.data.files[0].url;
  }

  throw new Error("Uplad to Uguu failed");
}

async function Img2Img(prompt, imageBuffer, filename = "upload.png") {
  const imageUrl = await Uguu(imageBuffer, filename);

  const apiKey = _optionalChain([_configjs2.default, 'access', _5 => _5.APIkey, 'optionalAccess', _6 => _6.fgsi]) || "";
  const startUrl = `${FCSI_API}?apikey=${apiKey}&prompt=${encodeURIComponent(prompt)}&url=${encodeURIComponent(imageUrl)}`;

  const start = await _axios2.default.get(startUrl, { timeout: 30000 });

  const pollUrl = _optionalChain([start, 'access', _7 => _7.data, 'optionalAccess', _8 => _8.data, 'optionalAccess', _9 => _9.pollUrl]);
  if (!pollUrl) {
    return {
      status: false,
      error: _optionalChain([start, 'access', _10 => _10.data, 'optionalAccess', _11 => _11.error]) || "Steenner inicia el proceso de img2img",
    };
  }

  let result = null;
  const maxAttempts = 60;

  for (let i = 0; i < maxAttempts; i++) {
    const poll = await _axios2.default.get(pollUrl, { timeout: 30000 });

    if (!_optionalChain([poll, 'access', _12 => _12.data, 'optionalAccess', _13 => _13.status])) {
      return { status: false, error: "Polling fallido" };
    }

    if (_optionalChain([poll, 'access', _14 => _14.data, 'access', _15 => _15.data, 'optionalAccess', _16 => _16.status]) === "Success") {
      result = poll.data.data.result;
      break;
    }

    if (_optionalChain([poll, 'access', _17 => _17.data, 'access', _18 => _18.data, 'optionalAccess', _19 => _19.status]) === "Failed") {
      return { status: false, error: "Prooses img2img falló" };
    }

    await new Promise((r) => setTimeout(r, 2000));
  }

  if (!result) {
    return { status: false, error: "Timeout espera resultados" };
  }

  return { status: true, prompt, imageUrl, result };
}

exports.Img2Img = Img2Img;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

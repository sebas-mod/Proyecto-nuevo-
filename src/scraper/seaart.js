"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _formdata = require('form-data'); var _formdata2 = _interopRequireDefault(_formdata);
var _crypto = require('crypto');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const hdrs = {
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
  "Accept": "*/*",
  "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
  "Origin": "https://imgupscaler.ai",
  "Referer": "https://imgupscaler.ai/",
  "sec-ch-ua": '"Chromium";v="137", "Not/A)Brand";v="24"',
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": '"Linux"',
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
};

const api = _axios2.default.create({ baseURL: "https://api.imgupscaler.ai" });

async function uploadBuf(buf) {
  const ext = "jpg";
  const form1 = new (0, _formdata2.default)();
  form1.append("file_name", `${_crypto.randomUUID.call(void 0, )}.${ext}`);

  const { data: reg } = await api.post("/api/common/upload/upload-image", form1, {
    headers: { ...hdrs, ...form1.getHeaders(), "sec-fetch-site": "same-site" },
  });
  const { url: uploadUrl, object_name } = reg.result;

  await _axios2.default.put(uploadUrl, buf, {
    headers: { "Content-Type": "image/jpeg" },
  });

  const form2 = new (0, _formdata2.default)();
  form2.append("object_name", object_name);

  const { data: signed } = await api.post("/api/common/upload/sign-object", form2, {
    headers: { ...hdrs, ...form2.getHeaders(), "sec-fetch-site": "same-site" },
  });

  return signed.result.url;
}

async function live3d(
  imageBuffer,
  prompt = "ubah warna rambut jadi biru",
) {
  const imgUrl = await uploadBuf(imageBuffer);

  const { data } = await _axios2.default.get(
    `https://kyzznekoo.zone.id/api/img/v2/nanobanana?url=${encodeURIComponent(imgUrl)}&prompt=${encodeURIComponent(prompt)}`,
    {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
        "Content-Type": "application/json"
      }
    }
  );

  if (!_optionalChain([data, 'optionalAccess', _ => _.status]) || !_optionalChain([data, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.result_url])) {
    throw new Error("Gagali editando la imagen usando nanobanana.");
  }

  const imgResponse = await _axios2.default.get(data.data.result_url, { responseType: "arraybuffer" });
  const image = Buffer.from(imgResponse.data);
  return { image };
}

async function fluxImage(message, ratio = "1:1") {
  const r = await _axios2.default.post(
    "https://api.yuulabs.web.id/api/ai/flux-img",
    {
      message,
      ratio,
    },
    {
      headers: { "Content-Type": "application/json" },
      timeout: 120000,
    },
  );

  const data = r.data;
  if (!_optionalChain([data, 'optionalAccess', _4 => _4.status]) || !_optionalChain([data, 'optionalAccess', _5 => _5.result, 'optionalAccess', _6 => _6.url])) {
    throw new Error(_optionalChain([data, 'optionalAccess', _7 => _7.message]) || _optionalChain([data, 'optionalAccess', _8 => _8.error]) || "Los luchadores hacen fotos");
  }

  return data.result;
}

exports.live3d = live3d; exports.fluxImage = fluxImage;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

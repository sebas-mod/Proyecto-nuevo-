"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _formdata = require('form-data'); var _formdata2 = _interopRequireDefault(_formdata);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);

class ImgUpscaler {
  constructor() {
    this.baseUrl = "https://get1.imglarger.com";
    this.headers = {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36",
      Accept: "application/json, text/plain, */*",
      "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
      Origin: "https://imgupscaler.com",
      Referer: "https://imgupscaler.com/",
    };
  }

  async uploadImage(imagePath) {
    const form = new (0, _formdata2.default)();
    const filename = _path2.default.basename(imagePath);
    form.append("myfile", _fs2.default.createReadStream(imagePath), filename);
    form.append("scaleRadio", "2");

    const response = await _axios2.default.post(
      `${this.baseUrl}/api/UpscalerNew/UploadNew`,
      form,
      {
        headers: {
          ...this.headers,
          ...form.getHeaders(),
        },
        timeout: 120000,
      },
    );

    return response.data;
  }

  async checkStatus(code) {
    const response = await _axios2.default.post(
      `${this.baseUrl}/api/UpscalerNew/CheckStatusNew`,
      {
        code,
        scaleRadio: 2,
      },
      {
        headers: {
          ...this.headers,
          "Content-Type": "application/json",
        },
        timeout: 120000,
      },
    );

    return response.data;
  }

  async waitForResult(code) {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const result = await this.checkStatus(code);
      const data = _optionalChain([result, 'optionalAccess', _ => _.data]) || {};
      const hasDownload = Array.isArray(data.downloadUrls)
        ? Boolean(data.downloadUrls[0])
        : Boolean(data.download_url || data.img_url);
      const isSuccess = data.status === "success" || hasDownload;

      if (_optionalChain([result, 'optionalAccess', _2 => _2.code]) === 200 && isSuccess) {
        return result;
      }

      attempts += 1;
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }

    throw new Error(`Timeout after ${maxAttempts} attempts`);
  }

  async process(imagePath) {
    const upload = await this.uploadImage(imagePath);
    const code = _optionalChain([upload, 'optionalAccess', _3 => _3.data, 'optionalAccess', _4 => _4.code]);

    if (!code) {
      throw new Error("ImgLarger upload failed to return code");
    }

    const result = await this.waitForResult(code);

    return {
      upload,
      result,
    };
  }
}

exports. default = ImgUpscaler;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

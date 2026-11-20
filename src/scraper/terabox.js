"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);

const CONFIG = {
  base: "https://flowvideoplayer.com",
  ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
};

async function TeraBoxDL(url) {
  try {
    const session = await _axios2.default.get(CONFIG.base, {
      headers: { "User-Agent": CONFIG.ua },
    });

    const rawCookies = session.headers["set-cookie"] || [];
    const cookieStr = rawCookies.map((c) => c.split(";")[0]).join("; ");
    const token = _optionalChain([session, 'access', _ => _.data, 'access', _2 => _2.match, 'call', _3 => _3(
      /name=["']csrf-token["']\s+content=["']([^"']+)["']/i,
    ), 'optionalAccess', _4 => _4[1]]);

    if (!token) {
      return { status: false, error: "CSRF Token not found" };
    }

    const response = await _axios2.default.post(
      `${CONFIG.base}/ telegrama / bot / búsqueda / video`,
      { url },
      {
        headers: {
          "User-Agent": CONFIG.ua,
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": token,
          "X-Requested-With": "XMLHttpRequest",
          Cookie: cookieStr,
          Origin: CONFIG.base,
          Referer: `${CONFIG.base}/`,
        },
      },
    );

    const result = response.data;
    if (result.error === false && result.data && result.data.length > 0) {
      const item = result.data[0];
      return {
        status: true,
        file_name: item.file_name,
        thumbnail: item.thumbnail,
        download_url: item.download_url,
        stream_url: item.stream_final_url || item.stream_url,
        file_size: item.file_size,
        file_size_bytes: item.file_size_bytes,
        duration: item.duration,
        extension: item.extension,
        share_url: item.share_url,
      };
    }

    return { status: false, error: "No se han encontrado datos" };
  } catch (e) {
    return { status: false, error: e.message };
  }
}

exports.TeraBoxDL = TeraBoxDL;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

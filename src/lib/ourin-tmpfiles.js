"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _formdata = require('form-data'); var _formdata2 = _interopRequireDefault(_formdata);

const termaiKey = 'AIzaBj7z2z3xBjsk'
const termaiDomain = 'https://c.termai.cc'

async function uploadTo0x0(buffer, opts) {
  if (!Buffer.isBuffer(buffer)) throw new Error("buffer harus Buffer");
  
  const filename = _optionalChain([opts, 'optionalAccess', _ => _.filename]) || 'image.jpg'
  const form = new (0, _formdata2.default)();
  form.append('file', buffer, { filename, contentType: _optionalChain([opts, 'optionalAccess', _2 => _2.contentType]) || "application/octet-stream" });

  const res = await _axios2.default.post(`${termaiDomain}/api/upload?key=${termaiKey}`, form, {
    headers: { ...form.getHeaders(), Accept: "application/json" },
    timeout: _nullishCoalesce(_optionalChain([opts, 'optionalAccess', _3 => _3.timeoutMs]), () => ( 60000)),
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    validateStatus: () => true,
  })

  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Upload gagal (HTTP ${res.status}): ${typeof res.data === "string" ? res.data : JSON.stringify(res.data)}`);
  }
  
  if (_optionalChain([res, 'access', _4 => _4.data, 'optionalAccess', _5 => _5.status]) && _optionalChain([res, 'access', _6 => _6.data, 'optionalAccess', _7 => _7.path])) {
    return { url: res.data.path, directUrl: res.data.path }
  }

  throw new Error("Response tidak ada data valid dari Termai");
}

// Map everything locally to termai wrapper, keeping exported name identical for compatibility
exports.uploadTo0x0 = uploadTo0x0;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);

async function fbdown(url) {
  try {
    const res = await _axios2.default.get(`https://api.azbry.com/api/download/facebook?url=${encodeURIComponent(url)}`);
    if (res.data && res.data.status) {
      return res.data;
    }
    return { status: false, message: "Gagal mengambil data dari API" };
  } catch (err) {
    return { status: false, message: err.message };
  }
}

exports.fbdown = fbdown;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _gsmarenaapi = require('gsmarena-api'); var _gsmarenaapi2 = _interopRequireDefault(_gsmarenaapi);

async function search(query) {
  return _gsmarenaapi2.default.search.search(query);
}

async function detail(deviceId) {
  return _gsmarenaapi2.default.catalog.getDevice(deviceId);
}

async function brands() {
  return _gsmarenaapi2.default.catalog.getBrands();
}

async function brandDevices(brandId) {
  return _gsmarenaapi2.default.catalog.getBrand(brandId);
}

exports.search = search; exports.detail = detail; exports.brands = brands; exports.brandDevices = brandDevices;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

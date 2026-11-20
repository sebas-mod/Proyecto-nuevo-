"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
function te(prefix, command, pushName) {
    const tpl = _configjs2.default.errorTemplate || `☢*ᴇʀʀᴏʀ*\n\n*Ha sido un error mandar*\`{prefix}{command}\`\nPor favor, intente de nuevo más tarde,{pushName}\n\nSi el problema continúa, contacte con el propietario_`
    return tpl
        .replace(/\{prefix\}/g, prefix || '.')
        .replace(/\{command\}/g, command || '?')
        .replace(/\{pushName\}/g, pushName || 'User')
}

exports. default = te
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

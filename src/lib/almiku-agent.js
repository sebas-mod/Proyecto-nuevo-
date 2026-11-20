"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _undici = require('undici');
var _os = require('os');
const cpuCount = _os.cpus.call(void 0, ).length

function initializeAgent() {
    _undici.setGlobalDispatcher.call(void 0, 
        new (0, _undici.Agent)({
            connections: Math.max(5, cpuCount * 2),
            pipelining: 1,
            keepAliveTimeout: 5000,
            keepAliveMaxTimeout: 60000,
            connectTimeout: 10000,
            bodyTimeout: 30000,
            headersTimeout: 30000,
            maxRedirections: 3
        })
    )
}

exports.initializeAgent = initializeAgent;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _https = require('https'); var _https2 = _interopRequireDefault(_https);
const API_KEY = "dac23a9006fc4039ae6aac98ae7c7b46"

function generateCustomTTS(speakerId, text) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      text: text,
      speaker: speakerId || "001526de-3826-11ee-a861-00163e2ac61b",
      emotion: "Happy"
    })

    const options = {
      hostname: "api.topmediai.com",
      path: "/v1/text2speech",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "Content-Length": Buffer.byteLength(postData)
      }
    }

    const req = _https2.default.request(options, res => {
      let data = ""
      res.on("data", chunk => data += chunk)
      res.on("end", () => {
        try {
          const json = JSON.parse(data)
          const audioUrl = _optionalChain([json, 'optionalAccess', _ => _.data, 'optionalAccess', _2 => _2.oss_url])
          if (!audioUrl) return reject(new Error("No audio URL"))
          resolve(audioUrl)
        } catch (e) {
          reject(e)
        }
      })
    })

    req.on("error", reject)
    req.write(postData)
    req.end()
  })
}

exports. default = generateCustomTTS
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

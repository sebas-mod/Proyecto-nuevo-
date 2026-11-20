"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
async function pixa(img) {
  const form = new FormData()
  form.append('image', new Blob([_fs2.default.readFileSync(img)], { type: 'image/jpeg' }), img.split('/').pop())
  form.append('format', 'png')
  form.append('model', 'v1')

  const res = await fetch('https://api2.pixelcut.app/image/matte/v1', {
    method: 'POST',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
      'Accept': 'application/json, text/plain, */*',
      'sec-ch-ua': '"Chromium";v="139", "Not;A=Brand";v="99"',
      'x-locale': 'en',
      'x-client-version': 'web:pixa.com:4a5b0af2',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'origin': 'https://www.pixa.com',
      'sec-fetch-site': 'cross-site',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'referer': 'https://www.pixa.com/',
      'accept-language': 'id-ID,id;q=0.9,en-AU;q=0.8,en;q=0.7,en-US;q=0.6'
    },
    body: form
  })

  return Buffer.from(await res.arrayBuffer())
}

exports.pixa = pixa;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

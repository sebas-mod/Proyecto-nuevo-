"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _formdata = require('form-data'); var _formdata2 = _interopRequireDefault(_formdata);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
async function upload(filePath) {
  const form = new (0, _formdata2.default)();
  form.append("file", _fs2.default.createReadStream(filePath));
  form.append("type", 13);
  form.append("scaleRadio", 2);
  
  const headers = {
    ...form.getHeaders(),
    "accept": "application/json, text/plain, */*",
    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "origin": "https://imglarger.com",
    "priority": "u=1, i",
    "referer": "https://imglarger.com/",
    "sec-ch-ua": '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": '"Android"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36"
  };
  
  const { data } = await _axios2.default.post(
    "https://photoai.imglarger.com/api/PhoAi/Upload",
    form,
    { headers }
  );
  
  return data.data;
}

async function get(code) {
  const headers = {
    "accept": "application/json, text/plain, */*",
    "accept-language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7",
    "content-type": "application/json",
    "origin": "https://imglarger.com",
    "priority": "u=1, i",
    "referer": "https://imglarger.com/",
    "sec-ch-ua": '"Chromium";v="142", "Google Chrome";v="142", "Not_A Brand";v="99"',
    "sec-ch-ua-mobile": "?1",
    "sec-ch-ua-platform": '"Android"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-site",
    "user-agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Mobile Safari/537.36"
  };
  
  const payload = { code, type: 13 };
  
  const { data } = await _axios2.default.post(
    "https://photoai.imglarger.com/api/PhoAi/CheckStatus",
    payload,
    { headers }
  );
  
  return data.data;
}

exports.upload = upload; exports.get = get;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

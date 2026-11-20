"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _cheerio = require('cheerio'); var cheerio = _interopRequireWildcard(_cheerio);
async function sfile(url) {
  const headers = {
    'user-agent': 'Mozilla/5.0 (Linux; Android 10; K)',
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'accept-language': 'id-ID,id;q=0.9,en;q=0.8'
  }

  const r1 = await _axios2.default.get(url, { headers })
  const cookie = (r1.headers['set-cookie'] || []).map(v => v.split(';')[0]).join('; ')
  if (cookie) headers.cookie = cookie

  let $ = cheerio.load(r1.data)

  const file_name = $('h1').first().text().trim() || null
  const size_from_text = _optionalChain([r1, 'access', _2 => _2.data, 'access', _3 => _3.match, 'call', _4 => _4(/(\d+(?:\.\d+)?\s?(?:KB|MB|GB))/i), 'optionalAccess', _5 => _5[1]]) || null

  const infoText = $('meta[property="og:description"]').attr('content') || ''

  const author_name = _optionalChain([infoText, 'access', _6 => _6.match, 'call', _7 => _7(/uploaded by\s([^ ]+)/i), 'optionalAccess', _8 => _8[1]]) || null
  const upload_date = _optionalChain([infoText, 'access', _9 => _9.match, 'call', _10 => _10(/on\s(\d+\s[A-Za-z]+\s\d{4})/i), 'optionalAccess', _11 => _11[1]]) || null

  const download_count =
    _optionalChain([$, 'call', _12 => _12('span')
, 'access', _13 => _13.filter, 'call', _14 => _14((_, el) => $(el).text().toLowerCase().includes('download'))
, 'access', _15 => _15.first, 'call', _16 => _16()
, 'access', _17 => _17.text, 'call', _18 => _18()
, 'access', _19 => _19.match, 'call', _20 => _20(/\d+/), 'optionalAccess', _21 => _21[0]]) || null

  const pageurl = $('meta[property="og:url"]').attr('content')
  if (!pageurl) {
    return {
      file_name,
      size_from_text,
      author_name,
      upload_date,
      download_count,
      download_url: null
    }
  }

  headers.referer = url
  const r2 = await _axios2.default.get(pageurl, { headers })
  $ = cheerio.load(r2.data)

  const gateUrl = $('#download').attr('href')
  if (!gateUrl) {
    return {
      file_name,
      size_from_text,
      author_name,
      upload_date,
      download_count,
      download_url: null
    }
  }

  headers.referer = pageurl
  const r3 = await _axios2.default.get(gateUrl, { headers })

  const scripts = cheerio
    .load(r3.data)('script')
    .map((_, el) => cheerio.load(el).html())
    .get()
    .join('\n')

  const final = scripts.match(/https:\\\/\\\/download\d+\.sfile\.(?:co|mobi)\\\/downloadfile\\\/\d+\\\/\d+\\\/[a-z0-9]+\\\/[^"'\\\s]+(\?[^"']+)?/i)

  const download_url = final ? final[0].replace(/\\\//g, '/') : null

  return {
    file_name,
    size_from_text,
    author_name,
    upload_date,
    download_count,
    download_url
  }
}

exports. default = sfile
// SAMPLE RESPONSE
// {
//   file_name: 'Spotify PREMIUM_9.1.14.864',
//   size_from_text: '100.42 MB',
//   author_name: 'Planetvdn',
//   upload_date: '22 January 2026',
//   download_count: '1',
//   download_url: 'https://download0426.sfile.co/downloadfile/2200881/724157/99f1f1d69f8fd931e1447af03be9cec0/spotify-premium_9.1.14.864.apk?k=8a782a007c623b62889412b2f5a49424'
// }

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

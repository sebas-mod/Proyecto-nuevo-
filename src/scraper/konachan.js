"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _cheerio = require('cheerio'); var cheerio = _interopRequireWildcard(_cheerio);

async function searchKonachan(tags) {
  const url = `https://konachan.net/post?tags=${encodeURIComponent(tags)}`;

  try {
    const { data } = await _axios2.default.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const $ = cheerio.load(data);
    const posts = [];

    $('#post-list-posts li').each((index, element) => {
      const id = _optionalChain([$, 'call', _ => _(element), 'access', _2 => _2.attr, 'call', _3 => _3('id'), 'optionalAccess', _4 => _4.replace, 'call', _5 => _5('p', '')]) || null;
      const previewUrl = $(element).find('img').attr('src') || null;
      const sourceUrl = $(element).find('.thumb').attr('href') || null;

      const titleAttr = $(element).find('.thumb img').attr('title') || '';
      
      let cleanTags = [];
      if (titleAttr.includes('Tags:')) {
        const rawTags = _optionalChain([titleAttr, 'access', _6 => _6.split, 'call', _7 => _7('Tags:'), 'access', _8 => _8[1], 'optionalAccess', _9 => _9.split, 'call', _10 => _10('User:'), 'access', _11 => _11[0], 'optionalAccess', _12 => _12.trim, 'call', _13 => _13()]);
        if (rawTags) {
          cleanTags = rawTags.split(/\s+/);
        }
      } else {
     
        cleanTags = _optionalChain([$, 'call', _14 => _14(element), 'access', _15 => _15.find, 'call', _16 => _16('img'), 'access', _17 => _17.attr, 'call', _18 => _18('alt'), 'optionalAccess', _19 => _19.trim, 'call', _20 => _20(), 'access', _21 => _21.split, 'call', _22 => _22(/\s+/)]) || [];
      }

      if (id) {
        posts.push({
          id: parseInt(id),
          tags: cleanTags,
          details_page: sourceUrl ? `https://konachan.net${sourceUrl}` : null,
          images: {
            preview: previewUrl ? (previewUrl.startsWith('http') ? previewUrl : `https:${previewUrl}`) : null
          }
        });
      }
    });

    return posts;
  } catch (error) {
    return { error: true, message: error.message };
  }
}

exports. default = searchKonachan;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

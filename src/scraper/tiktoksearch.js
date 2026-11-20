"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);

const TTSEARCH_API = 'https://api.azbry.com/api/search/ttsearch?q='

function normalizeUrl(url) {
    if (!url || typeof url !== 'string') return null
    const matches = url.match(/https?:\/\//g) || []
    if (matches.length <= 1) return url
    const lastIndex = url.lastIndexOf('http')
    return url.slice(lastIndex)
}

function normalizeNumber(value) {
    const number = Number(value)
    return Number.isFinite(number) ? number : 0
}

function normalizeItem(item) {
    return {
        title: _optionalChain([item, 'optionalAccess', _ => _.title]) || '',
        cover: normalizeUrl(_optionalChain([item, 'optionalAccess', _2 => _2.cover])),
        originCover: normalizeUrl(_optionalChain([item, 'optionalAccess', _3 => _3.origin_cover])),
        link: normalizeUrl(_optionalChain([item, 'optionalAccess', _4 => _4.link])),
        watermarkLink: normalizeUrl(_optionalChain([item, 'optionalAccess', _5 => _5.watermark_link])),
        music: normalizeUrl(_optionalChain([item, 'optionalAccess', _6 => _6.music])),
        author: {
            nickname: _optionalChain([item, 'optionalAccess', _7 => _7.author, 'optionalAccess', _8 => _8.nickname]) || '',
            avatar: normalizeUrl(_optionalChain([item, 'optionalAccess', _9 => _9.author, 'optionalAccess', _10 => _10.avatar]))
        },
        stats: {
            plays: normalizeNumber(_optionalChain([item, 'optionalAccess', _11 => _11.stats, 'optionalAccess', _12 => _12.plays])),
            likes: normalizeNumber(_optionalChain([item, 'optionalAccess', _13 => _13.stats, 'optionalAccess', _14 => _14.likes])),
            comments: normalizeNumber(_optionalChain([item, 'optionalAccess', _15 => _15.stats, 'optionalAccess', _16 => _16.comments])),
            shares: normalizeNumber(_optionalChain([item, 'optionalAccess', _17 => _17.stats, 'optionalAccess', _18 => _18.shares]))
        }
    }
}

async function tiktokSearchVideo(query) {
    const { data } = await _axios2.default.get(`${TTSEARCH_API}${encodeURIComponent(query)}`, {
        timeout: 30000,
        headers: {
            'user-agent': 'Mozilla/5.0'
        }
    })

    if (!_optionalChain([data, 'optionalAccess', _19 => _19.status]) || !Array.isArray(_optionalChain([data, 'optionalAccess', _20 => _20.result]))) {
        throw new Error(_optionalChain([data, 'optionalAccess', _21 => _21.message]) || 'TikTok search gagal')
    }

    return data.result.map(normalizeItem).filter((item) => item.link)
}

exports.tiktokSearchVideo = tiktokSearchVideo;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);

const BASE_URL = "https://api-mobi.soundcloud.com/search";

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

async function searchSoundCloud(query) {
  try {
    const res = await _axios2.default.get(BASE_URL, {
      params: {
        q: query,
        client_id: "KKzJxmw11tYpCs6T24P4uUYhqmjalG6M",
        stage: "",
      },
      headers: {
        Accept: "application/json, text/javascript, */*; q=0.1",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
      },
    });

    const items = _optionalChain([res, 'access', _ => _.data, 'optionalAccess', _2 => _2.collection]) || [];

    const results = items.map((track) => ({
      id: track.id,
      title: track.title,
      artist: _optionalChain([track, 'access', _3 => _3.user, 'optionalAccess', _4 => _4.username]) || null,
      duration_ms: track.duration,
      duration: formatDuration(track.duration),
      url: track.permalink_url,
      artwork: track.artwork_url,
      genre: track.genre || null,
      plays: track.playback_count || 0,
      likes: track.likes_count || 0,
    }));

    return {
      success: true,
      query,
      total: results.length,
      results,
    };
  } catch (err) {
    return {
      success: false,
      query,
      status: _optionalChain([err, 'access', _5 => _5.response, 'optionalAccess', _6 => _6.status]) || 500,
      message: err.message,
    };
  }
}

exports. default = searchSoundCloud;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

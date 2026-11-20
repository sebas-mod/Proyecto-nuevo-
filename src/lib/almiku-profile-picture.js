"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } }const DEFAULT_PP = 'https://i.ibb.co.com/QFzm9pSF/1546d15ce5dd2946573b3506df109d00.jpg'

const cache = new Map()
const CACHE_TTL = 900000

function cleanExpired() {
    const now = Date.now()
    for (const [key, entry] of cache) {
        if (now - entry.ts > CACHE_TTL) cache.delete(key)
    }
}

setInterval(cleanExpired, 300000)

async function getProfilePicture(sock, jid) {
    const cached = cache.get(jid)
    if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.url

    let url
    try {
        url = await sock.profilePictureUrl(jid, 'image')
    } catch (e) {
        url = DEFAULT_PP
    }

    cache.set(jid, { url, ts: Date.now() })
    return url
}

async function getProfileBuffer(sock, jid) {
    const url = await getProfilePicture(sock, jid)
    try {
        const { f } = await Promise.resolve().then(() => _interopRequireWildcard(require('./almiku-http.js')))
        const res = await f(url, 'arrayBuffer')
        return Buffer.from(res.data)
    } catch (e2) {
        return null
    }
}

function clearCache(jid) {
    if (jid) return cache.delete(jid)
    cache.clear()
}

exports.getProfilePicture = getProfilePicture; exports.getProfileBuffer = getProfileBuffer; exports.clearCache = clearCache; exports.DEFAULT_PP = DEFAULT_PP;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

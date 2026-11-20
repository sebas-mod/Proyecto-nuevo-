"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }const CACHE_TTL = 60000
const MAX_RETRIES = 3
const RETRY_DELAYS = [3000, 6000, 12000]

let cachedGroups = null
let cacheTimestamp = 0

async function fetchGroupsSafe(sock) {
    const now = Date.now()
    if (cachedGroups && (now - cacheTimestamp) < CACHE_TTL) {
        return cachedGroups
    }

    global.isFetchingGroups = true

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const result = await sock.groupFetchAllParticipating()
            cachedGroups = result
            cacheTimestamp = Date.now()
            global.isFetchingGroups = false
            return result
        } catch (err) {
            const isRateLimit = _optionalChain([err, 'access', _ => _.message, 'optionalAccess', _2 => _2.includes, 'call', _3 => _3('rate')]) ||
                _optionalChain([err, 'access', _4 => _4.message, 'optionalAccess', _5 => _5.includes, 'call', _6 => _6('limit')]) ||
                _optionalChain([err, 'access', _7 => _7.message, 'optionalAccess', _8 => _8.includes, 'call', _9 => _9('429')]) ||
                _optionalChain([err, 'access', _10 => _10.output, 'optionalAccess', _11 => _11.statusCode]) === 429

            if (isRateLimit && attempt < MAX_RETRIES - 1) {
                const delay = RETRY_DELAYS[attempt]
                await new Promise(resolve => setTimeout(resolve, delay))
                continue
            }

            global.isFetchingGroups = false
            throw err
        }
    }

    global.isFetchingGroups = false
    throw new Error('Gagal fetch groups setelah beberapa percobaan')
}

function clearGroupCache() {
    cachedGroups = null
    cacheTimestamp = 0
}

exports.fetchGroupsSafe = fetchGroupsSafe; exports.clearGroupCache = clearGroupCache;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

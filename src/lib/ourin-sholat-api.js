"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _nodecache = require('node-cache'); var _nodecache2 = _interopRequireDefault(_nodecache);
const BASE_URL = 'https://api.myquran.com/v2/sholat';
const cache = new (0, _nodecache2.default)({ stdTTL: 86400 });

async function searchKota(query) {
    const key = `kota_${query.toLowerCase()}`;
    const cached = cache.get(key);
    if (cached) return cached;

    const { data } = await _axios2.default.get(`${BASE_URL}/kota/cari/${encodeURIComponent(query)}`, { timeout: 10000 });
    if (_optionalChain([data, 'optionalAccess', _ => _.status]) && Array.isArray(data.data) && data.data.length > 0) {
        const result = data.data[0];
        cache.set(key, result);
        return result;
    }
    return null;
}

async function fetchAllKota() {
    const cached = cache.get('all_kota');
    if (cached) return cached;

    const { data } = await _axios2.default.get(`${BASE_URL}/kota/semua`, { timeout: 15000 });
    if (_optionalChain([data, 'optionalAccess', _2 => _2.status]) && Array.isArray(data.data)) {
        cache.set('all_kota', data.data);
        return data.data;
    }
    throw new Error('Gagal mengambil daftar kota');
}

async function getTodaySchedule(kotaId) {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    const key = `jadwal_${kotaId}_${year}_${month}_${day}`;
    const cached = cache.get(key);
    if (cached) return cached;

    const { data } = await _axios2.default.get(`${BASE_URL}/jadwal/${kotaId}/${year}/${month}/${day}`, { timeout: 10000 });
    if (_optionalChain([data, 'optionalAccess', _3 => _3.status]) && data.data) {
        cache.set(key, data.data);
        return data.data;
    }
    throw new Error('Gagal mengambil jadwal sholat');
}

function extractPrayerTimes(jadwalData) {
    const j = jadwalData.jadwal || jadwalData;
    return {
        imsak: j.imsak || '-',
        subuh: j.subuh || '-',
        terbit: j.terbit || '-',
        dhuha: j.dhuha || '-',
        dzuhur: j.dzuhur || '-',
        ashar: j.ashar || '-',
        maghrib: j.maghrib || '-',
        isya: j.isya || '-'
    };
}

function clearCache() {
    cache.flushAll();
}

exports.searchKota = searchKota; exports.fetchAllKota = fetchAllKota; exports.getTodaySchedule = getTodaySchedule; exports.extractPrayerTimes = extractPrayerTimes; exports.clearCache = clearCache;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

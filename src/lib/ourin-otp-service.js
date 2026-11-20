"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const BASE_URL = 'https://api.jasaotp.id/v1'
const CACHE_TTL = 300000

let countryCache = null
let countryCacheTime = 0
let serviceCache = {}
let serviceCacheTime = {}

function getApiKey() {
    const key = _optionalChain([_configjs2.default, 'access', _ => _.jasaotp, 'optionalAccess', _2 => _2.apiKey])
    if (!key) throw new Error('JasaOTP API key belum dikonfigurasi di config.js')
    return key
}

function isEnabled() {
    return !!_optionalChain([_configjs2.default, 'access', _3 => _3.jasaotp, 'optionalAccess', _4 => _4.apiKey])
}

function getMarkup() {
    return _optionalChain([_configjs2.default, 'access', _5 => _5.jasaotp, 'optionalAccess', _6 => _6.markup]) || 2000
}

function getTimeout() {
    return _optionalChain([_configjs2.default, 'access', _7 => _7.jasaotp, 'optionalAccess', _8 => _8.timeout]) || 300
}

async function getBalance() {
    const { data } = await _axios2.default.get(`${BASE_URL}/balance.php`, {
        params: { api_key: getApiKey() },
        timeout: 15000
    })

    if (!data.success) throw new Error(data.message || 'Gagal cek saldo')
    return data.data.saldo
}

async function getCountries() {
    const now = Date.now()
    if (countryCache && (now - countryCacheTime) < CACHE_TTL) {
        return countryCache
    }

    const { data } = await _axios2.default.get(`${BASE_URL}/negara.php`, { timeout: 15000 })

    if (!data.success) throw new Error(data.message || 'Gagal ambil daftar negara')

    countryCache = data.data
    countryCacheTime = now
    return data.data
}

async function getServices(countryId) {
    const now = Date.now()
    const cacheKey = String(countryId)

    if (serviceCache[cacheKey] && (now - (serviceCacheTime[cacheKey] || 0)) < CACHE_TTL) {
        return serviceCache[cacheKey]
    }

    const { data } = await _axios2.default.get(`${BASE_URL}/layanan.php`, {
        params: { negara: countryId },
        timeout: 15000
    })

    const services = data[cacheKey] || _optionalChain([data, 'access', _9 => _9.data, 'optionalAccess', _10 => _10[cacheKey]]) || data[countryId] || {}

    if (Object.keys(services).length === 0) {
        throw new Error('Tidak ada layanan tersedia untuk negara ini')
    }

    serviceCache[cacheKey] = services
    serviceCacheTime[cacheKey] = now
    return services
}

async function getOperators(countryId) {
    const { data } = await _axios2.default.get(`${BASE_URL}/operator.php`, {
        params: { negara: countryId },
        timeout: 15000
    })

    if (!data.success) throw new Error(data.message || 'Gagal ambil daftar operator')

    const operators = _optionalChain([data, 'access', _11 => _11.data, 'optionalAccess', _12 => _12[String(countryId)]]) || data.data || []
    return Array.isArray(operators) ? operators : Object.values(operators)
}

async function createOrder(countryId, service, operator) {
    const { data } = await _axios2.default.get(`${BASE_URL}/order.php`, {
        params: {
            api_key: getApiKey(),
            negara: countryId,
            layanan: service,
            operator: operator
        },
        timeout: 30000
    })

    if (!data.success) throw new Error(data.message || 'Gagal membuat pesanan OTP')

    return {
        orderId: data.data.order_id,
        number: data.data.number
    }
}

async function checkSms(orderId) {
    const { data } = await _axios2.default.get(`${BASE_URL}/sms.php`, {
        params: {
            api_key: getApiKey(),
            id: orderId
        },
        timeout: 15000
    })

    if (!data.success) return null
    return _optionalChain([data, 'access', _13 => _13.data, 'optionalAccess', _14 => _14.otp]) || null
}

async function cancelOrder(orderId) {
    const { data } = await _axios2.default.get(`${BASE_URL}/cancel.php`, {
        params: {
            api_key: getApiKey(),
            id: orderId
        },
        timeout: 15000
    })

    if (!data.success) throw new Error(data.message || 'Gagal membatalkan pesanan')

    return {
        orderId: _optionalChain([data, 'access', _15 => _15.data, 'optionalAccess', _16 => _16.order_id]),
        refundedAmount: _optionalChain([data, 'access', _17 => _17.data, 'optionalAccess', _18 => _18.refunded_amount]) || 0
    }
}

function formatPrice(num) {
    return num.toLocaleString('id-ID')
}

exports.isEnabled = isEnabled; exports.getApiKey = getApiKey; exports.getMarkup = getMarkup; exports.getTimeout = getTimeout; exports.getBalance = getBalance; exports.getCountries = getCountries; exports.getServices = getServices; exports.getOperators = getOperators; exports.createOrder = createOrder; exports.checkSms = checkSms; exports.cancelOrder = cancelOrder; exports.formatPrice = formatPrice;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

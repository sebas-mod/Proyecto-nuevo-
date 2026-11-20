"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _momenttimezone = require('moment-timezone'); var _momenttimezone2 = _interopRequireDefault(_momenttimezone);
const TIMEZONE = 'America/Argentina/Buenos_Aires'

_momenttimezone2.default.locale('es')

function now() {
    return _momenttimezone2.default.tz(TIMEZONE)
}

function formatTime(format = 'HH:mm:ss') {
    return _momenttimezone2.default.tz(TIMEZONE).format(format)
}

function formatDate(format = 'DD-MM-YYYY') {
    return _momenttimezone2.default.tz(TIMEZONE).format(format)
}

function formatDateTime(format = 'DD-MM-YYYY HH:mm:ss') {
    return _momenttimezone2.default.tz(TIMEZONE).format(format)
}

function formatFull(format = 'dddd, DD MMMM YYYY HH:mm:ss') {
    return _momenttimezone2.default.tz(TIMEZONE).format(format)
}

function getHour() {
    return parseInt(_momenttimezone2.default.tz(TIMEZONE).format('HH'), 10)
}

function getMinute() {
    return parseInt(_momenttimezone2.default.tz(TIMEZONE).format('mm'), 10)
}

function getCurrentTimeString() {
    return _momenttimezone2.default.tz(TIMEZONE).format('HH:mm')
}

function fromTimestamp(timestamp, format = 'DD-MM-YYYY HH:mm:ss') {
    return _momenttimezone2.default.call(void 0, timestamp).tz(TIMEZONE).format(format)
}

function getLocalDateObject() {
    return _momenttimezone2.default.tz(TIMEZONE).toDate()
}

exports.now = now; exports.formatTime = formatTime; exports.formatDate = formatDate; exports.formatDateTime = formatDateTime; exports.formatFull = formatFull; exports.getHour = getHour; exports.getMinute = getMinute; exports.getCurrentTimeString = getCurrentTimeString; exports.fromTimestamp = fromTimestamp; exports.getLocalDateObject = getLocalDateObject; exports.TIMEZONE = TIMEZONE;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

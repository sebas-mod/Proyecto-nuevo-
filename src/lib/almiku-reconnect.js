"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }/**
 * Credits & Thanks to
* Desarrollo = Lucchy Archz ( Zann )
* Propietario principal: PESUSUATAN
* Propietario = Keisya
 * Designer = Danzzz
 * Wileys = Penyedia baileys
* proveedor de Fuego
 * Penyedia Scraper
 * 
* DEFENSE Elimina / GANIT CREDITS TO THANKS
* DORNESS SALE YA MEK
 * 
* Oficial Al Miku Saluran:
 * https://whatsapp.com/channel/0029VbB37bgBfxoAmAlsgE0t 
 */

var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _almikuloggerjs = require('./almiku-logger.js');
const RECONNECT_CONFIG = {
    maxAttempts: 10,
    initialDelay: 3000,
    maxDelay: 60000,
    backoffMultiplier: 1.5
}

let reconnectState = {
    attempts: 0,
    isReconnecting: false,
    lastAttempt: null,
    nextDelay: RECONNECT_CONFIG.initialDelay
}

function calculateNextDelay() {
    const delay = Math.min(
        reconnectState.nextDelay * RECONNECT_CONFIG.backoffMultiplier,
        RECONNECT_CONFIG.maxDelay
    )
    reconnectState.nextDelay = delay
    return delay
}

function resetReconnectState() {
    reconnectState = {
        attempts: 0,
        isReconnecting: false,
        lastAttempt: null,
        nextDelay: RECONNECT_CONFIG.initialDelay
    }
}

function shouldReconnect() {
    return reconnectState.attempts < RECONNECT_CONFIG.maxAttempts
}

function incrementAttempt() {
    reconnectState.attempts++
    reconnectState.lastAttempt = new Date()
    reconnectState.isReconnecting = true
}

function getReconnectInfo() {
    return {
        attempts: reconnectState.attempts,
        maxAttempts: RECONNECT_CONFIG.maxAttempts,
        nextDelay: reconnectState.nextDelay,
        isReconnecting: reconnectState.isReconnecting,
        lastAttempt: reconnectState.lastAttempt
    }
}

function formatDelay(ms) {
    if (ms < 1000) return `${ms}ms`
    return `${Math.round(ms / 1000)}s`
}

async function handleReconnect(startConnectionFn, options = {}) {
    if (!shouldReconnect()) {
        _almikuloggerjs.logger.error('Reconnect', `Max attempts reached (${RECONNECT_CONFIG.maxAttempts})`)
        return false
    }
    
    incrementAttempt()
    const delay = calculateNextDelay()
    
    _almikuloggerjs.logger.warn('Reconnect', `Attempt ${reconnectState.attempts}/${RECONNECT_CONFIG.maxAttempts} in ${formatDelay(delay)}`)
    
    return new Promise((resolve) => {
        setTimeout(async () => {
            try {
                await startConnectionFn(options)
                resetReconnectState()
                _almikuloggerjs.logger.success('Reconnect', 'Connection restored!')
                resolve(true)
            } catch (error) {
                _almikuloggerjs.logger.error('Reconnect', `Failed: ${error.message}`)
                resolve(await handleReconnect(startConnectionFn, options))
            }
        }, delay)
    })
}

function onConnectionSuccess() {
    if (reconnectState.isReconnecting) {
        _almikuloggerjs.logger.success('Reconnect', `Restored after ${reconnectState.attempts} attempts`)
    }
    resetReconnectState()
}

function onConnectionClose(reason) {
    reconnectState.isReconnecting = true
    _almikuloggerjs.logger.warn('Connection', `Closed: ${reason}`)
}

exports.handleReconnect = handleReconnect; exports.shouldReconnect = shouldReconnect; exports.resetReconnectState = resetReconnectState; exports.getReconnectInfo = getReconnectInfo; exports.onConnectionSuccess = onConnectionSuccess; exports.onConnectionClose = onConnectionClose; exports.RECONNECT_CONFIG = RECONNECT_CONFIG;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

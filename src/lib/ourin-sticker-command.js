"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }/**
 * @file src/lib/stickerCommand.js
 * @description Global sticker-to-command mapping system
 */

var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _crypto = require('crypto'); var _crypto2 = _interopRequireDefault(_crypto);
var _url = require('url');
// __filename provided by CJS
// __dirname provided by CJS
const STICKER_CMD_FILE = _path2.default.join(__dirname, '../../database/stickerCommands.json')

// In-memory cache
let stickerCommands = {}

// Load from file
function loadStickerCommands() {
    try {
        if (_fs2.default.existsSync(STICKER_CMD_FILE)) {
            const data = _fs2.default.readFileSync(STICKER_CMD_FILE, 'utf-8')
            stickerCommands = JSON.parse(data)
        }
    } catch (e) {
        stickerCommands = {}
    }
    return stickerCommands
}

// Save to file
function saveStickerCommands() {
    try {
        const dir = _path2.default.dirname(STICKER_CMD_FILE)
        if (!_fs2.default.existsSync(dir)) {
            _fs2.default.mkdirSync(dir, { recursive: true })
        }
        _fs2.default.writeFileSync(STICKER_CMD_FILE, JSON.stringify(stickerCommands, null, 2))
    } catch (e) {
        console.error('Error saving sticker commands:', e)
    }
}

/**
 * Generate unique hash for sticker
 * Uses fileSha256 or mediaKey as identifier
 */
function getStickerHash(m) {
    if (!m) return null
    
    // Check if message is sticker
    const stickerMsg = _optionalChain([m, 'access', _ => _.message, 'optionalAccess', _2 => _2.stickerMessage]) || 
                       _optionalChain([m, 'access', _3 => _3.quoted, 'optionalAccess', _4 => _4.message, 'optionalAccess', _5 => _5.stickerMessage]) ||
                       _optionalChain([m, 'access', _6 => _6.message, 'optionalAccess', _7 => _7.documentWithCaptionMessage, 'optionalAccess', _8 => _8.message, 'optionalAccess', _9 => _9.stickerMessage])
    
    if (!stickerMsg) return null
    
    // Use fileSha256 as primary identifier
    if (stickerMsg.fileSha256) {
        // Convert buffer to base64 string for storage
        const sha = Buffer.isBuffer(stickerMsg.fileSha256) 
            ? stickerMsg.fileSha256.toString('base64')
            : stickerMsg.fileSha256
        return sha
    }
    
    // Fallback to mediaKey
    if (stickerMsg.mediaKey) {
        const key = Buffer.isBuffer(stickerMsg.mediaKey)
            ? stickerMsg.mediaKey.toString('base64')
            : stickerMsg.mediaKey
        return key
    }
    
    return null
}

/**
 * Get sticker hash from quoted message
 */
function getQuotedStickerHash(m) {
    if (!m.quoted) return null
    
    const stickerMsg = _optionalChain([m, 'access', _10 => _10.quoted, 'access', _11 => _11.message, 'optionalAccess', _12 => _12.stickerMessage])
    if (!stickerMsg) return null
    
    if (stickerMsg.fileSha256) {
        const sha = Buffer.isBuffer(stickerMsg.fileSha256)
            ? stickerMsg.fileSha256.toString('base64')
            : stickerMsg.fileSha256
        return sha
    }
    
    if (stickerMsg.mediaKey) {
        const key = Buffer.isBuffer(stickerMsg.mediaKey)
            ? stickerMsg.mediaKey.toString('base64')
            : stickerMsg.mediaKey
        return key
    }
    
    return null
}

/**
 * Add sticker command mapping (global)
 */
function addStickerCommand(stickerHash, command, addedBy) {
    if (!stickerHash || !command) return false
    
    loadStickerCommands()
    
    stickerCommands[stickerHash] = {
        command: command.toLowerCase().replace(/^\./, ''), // Remove leading dot
        addedBy: addedBy,
        addedAt: Date.now()
    }
    
    saveStickerCommands()
    return true
}

/**
 * Delete sticker command
 */
function deleteStickerCommand(stickerHash) {
    if (!stickerHash) return false
    
    loadStickerCommands()
    
    if (stickerCommands[stickerHash]) {
        delete stickerCommands[stickerHash]
        saveStickerCommands()
        return true
    }
    
    return false
}

/**
 * Get command for sticker
 */
function getStickerCommand(stickerHash) {
    if (!stickerHash) return null
    return stickerCommands[stickerHash] || null
}

/**
 * List all sticker commands
 */
function listStickerCommands() {
    return Object.entries(stickerCommands).map(([hash, data]) => ({
        hash: hash.substring(0, 10) + '...',
        fullHash: hash,
        command: data.command,
        addedBy: data.addedBy,
        addedAt: data.addedAt
    }))
}

/**
 * Find sticker command by command name
 */
function findByCommand(commandName) {
    const cmd = commandName.toLowerCase().replace(/^\./, '')
    
    for (const [hash, data] of Object.entries(stickerCommands)) {
        if (data.command === cmd) {
            return { hash, ...data }
        }
    }
    
    return null
}

/**
 * Check if message is a registered sticker command
 */
function checkStickerCommand(m) {
    const hash = getStickerHash(m)
    if (!hash) return null
    
    const cmdData = getStickerCommand(hash)
    if (!cmdData) return null
    
    return cmdData.command
}

// Initialize
loadStickerCommands()

exports.getStickerHash = getStickerHash; exports.getQuotedStickerHash = getQuotedStickerHash; exports.addStickerCommand = addStickerCommand; exports.deleteStickerCommand = deleteStickerCommand; exports.getStickerCommand = getStickerCommand; exports.listStickerCommands = listStickerCommands; exports.findByCommand = findByCommand; exports.checkStickerCommand = checkStickerCommand; exports.loadStickerCommands = loadStickerCommands;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

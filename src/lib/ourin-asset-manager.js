"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _ourinloggerjs = require('./ourin-logger.js');

// Memory cache for all local assets
const assetCache = {};

/**
 * Preload all assets into memory at startup.
 * @param {Object} configAssets - botConfig.assets or config.assets object
 */
 function preloadAssets(configAssets) {
  if (!configAssets) return;
  for (const [key, filepath] of Object.entries(configAssets)) {
    try {
      if (typeof filepath === 'string' && !filepath.startsWith('http')) {
        const fullPath = _path2.default.resolve(process.cwd(), filepath);
        if (_fs2.default.existsSync(fullPath)) {
          assetCache[key] = _fs2.default.readFileSync(fullPath);
          _ourinloggerjs.logger.system("CACHE", `Loaded: ${key}`);
        } else {
          _ourinloggerjs.logger.warn("CACHE", `File not found: ${fullPath}`);
        }
      }
    } catch (e) {
      _ourinloggerjs.logger.error("CACHE", `Failed to load ${key}: ${e.message}`);
    }
  }
} exports.preloadAssets = preloadAssets;

var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

/**
 * Get the cached asset buffer by key (e.g. 'ourin', 'ourin2').
 * If not in cache but available in config, loads it synchronously.
 * 
 * @param {string} key - The asset key defined in config.assets
 * @param {Object} [configAssets] - Optional config.assets reference for fallback
 * @returns {Buffer | null} The asset as a Buffer, or null if missing.
 */
 function getAssetBuffer(key, configAssets = null) {
  if (assetCache[key]) {
    return assetCache[key];
  }
  
  const assets = configAssets || _optionalChain([_configjs2.default, 'optionalAccess', _ => _.assets]);
  if (assets && assets[key] && !assets[key].startsWith('http')) {
    try {
      const fullPath = _path2.default.resolve(process.cwd(), assets[key]);
      if (_fs2.default.existsSync(fullPath)) {
        const buf = _fs2.default.readFileSync(fullPath);
        assetCache[key] = buf; 
        return buf;
      }
    } catch (e) {
      console.error(`  ✖  ERR   Failed to read ${key} from disk:`, e.message);
    }
  }
  
  return null;
} exports.getAssetBuffer = getAssetBuffer;

/**
 * Update an asset buffer in memory and save it to disk (useful for owner commands that change assets).
 * 
 * @param {string} key - Asset key
 * @param {Buffer} buffer - New asset buffer
 * @param {string} filepath - The path where it should be saved
 */
 function updateAssetAndSave(key, buffer, filepath) {
  assetCache[key] = buffer;
  if (filepath && !filepath.startsWith('http')) {
    try {
      const fullPath = _path2.default.resolve(process.cwd(), filepath);
      _fs2.default.writeFileSync(fullPath, buffer);
    } catch (e) {
      console.error(`  ✖  ERR   Failed to write updated asset ${key} to disk:`, e.message);
    }
  }
} exports.updateAssetAndSave = updateAssetAndSave;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _ourinloggerjs = require('./ourin-logger.js');
const CLEAN_INTERVAL = 30 * 60 * 1000
const TEMP_DIRS = ['temp', 'tmp']

let cleanerTimer = null

function startTempCleaner() {
    if (cleanerTimer) return

    cleanerTimer = setInterval(() => {
        let totalCleaned = 0
        for (const dir of TEMP_DIRS) {
            const dirPath = _path2.default.join(process.cwd(), dir)
            if (!_fs2.default.existsSync(dirPath)) continue

            try {
                const files = _fs2.default.readdirSync(dirPath)
                for (const file of files) {
                    try {
                        _fs2.default.unlinkSync(_path2.default.join(dirPath, file))
                        totalCleaned++
                    } catch (e) {}
                }
            } catch (e2) {}
        }
        if (totalCleaned > 0) {
            _ourinloggerjs.logger.system('temp', `cleaned ${totalCleaned}archivo(s)`)
        }
    }, CLEAN_INTERVAL)

    if (cleanerTimer.unref) cleanerTimer.unref()
    _ourinloggerjs.logger.success('temp', `Bamal está limpio - archivo limpio${CLEAN_INTERVAL / 60000}minuto`)
}

function stopTempCleaner() {
    if (cleanerTimer) {
        clearInterval(cleanerTimer)
        cleanerTimer = null
    }
}

exports.startTempCleaner = startTempCleaner; exports.stopTempCleaner = stopTempCleaner;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

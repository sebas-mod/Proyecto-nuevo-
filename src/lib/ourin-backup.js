"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _ourinloggerjs = require('./ourin-logger.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourindatabasejs = require('./ourin-database.js');
const BACKUP_CONFIG = {
  enabled: _nullishCoalesce(_optionalChain([_configjs2.default, 'access', _ => _.backup, 'optionalAccess', _2 => _2.enabled]), () => ( true)),
  intervalHours: _nullishCoalesce(_optionalChain([_configjs2.default, 'access', _3 => _3.backup, 'optionalAccess', _4 => _4.intervalHours]), () => ( 24)),
  retainDays: _nullishCoalesce(_optionalChain([_configjs2.default, 'access', _5 => _5.backup, 'optionalAccess', _6 => _6.retainDays]), () => ( 7)),
  backupDir: "backups",
};

let backupInterval = null;

function getBackupDir() {
  const dir = _path2.default.join(process.cwd(), BACKUP_CONFIG.backupDir);
  if (!_fs2.default.existsSync(dir)) {
    _fs2.default.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function generateBackupName() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `backup-${timestamp}.json`;
}

function backupDatabase(dbPath) {
  try {
    const db = _ourindatabasejs.getDatabase.call(void 0, );

    if (!db.ready) {
      _ourinloggerjs.logger.warn("Backup", "Database not ready, skipping backup");
      return null;
    }

    const backupDir = getBackupDir();
    const backupName = generateBackupName();
    const backupPath = _path2.default.join(backupDir, backupName);
    const data = JSON.stringify(db.data, null, 2);
    _fs2.default.writeFileSync(backupPath, data, "utf-8");
    _ourinloggerjs.logger.success("Backup", `Created: ${backupName}`);

    cleanOldBackups();

    return backupPath;
  } catch (error) {
    _ourinloggerjs.logger.error("Backup", `Failed: ${error.message}`);
    return null;
  }
}

function cleanOldBackups() {
  try {
    const backupDir = getBackupDir();
    const files = _fs2.default.readdirSync(backupDir);
    const now = Date.now();
    const maxAge = BACKUP_CONFIG.retainDays * 24 * 60 * 60 * 1000;

    let cleaned = 0;

    for (const file of files) {
      if (!file.startsWith("backup-") || !file.endsWith(".json")) continue;

      const filePath = _path2.default.join(backupDir, file);
      const stat = _fs2.default.statSync(filePath);

      if (now - stat.mtimeMs > maxAge) {
        _fs2.default.unlinkSync(filePath);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      _ourinloggerjs.logger.info("Backup", `Cleaned ${cleaned} old backup(s)`);
    }
  } catch (error) {
    _ourinloggerjs.logger.error("Backup", `Cleanup failed: ${error.message}`);
  }
}

function listBackups() {
  try {
    const backupDir = getBackupDir();
    const files = _fs2.default.readdirSync(backupDir);

    return files
      .filter((f) => f.startsWith("backup-") && f.endsWith(".json"))
      .map((f) => {
        const filePath = _path2.default.join(backupDir, f);
        const stat = _fs2.default.statSync(filePath);
        return {
          name: f,
          path: filePath,
          size: stat.size,
          created: stat.mtime,
        };
      })
      .sort((a, b) => b.created - a.created);
  } catch (error) {
    return [];
  }
}

function restoreBackup(backupName, dbPath) {
  try {
    const backupDir = getBackupDir();
    const backupPath = _path2.default.join(backupDir, backupName);
    const destPath = _path2.default.join(dbPath, "db.json");

    if (!_fs2.default.existsSync(backupPath)) {
      throw new Error("Backup file not found");
    }

    const data = _fs2.default.readFileSync(backupPath, "utf-8");
    JSON.parse(data);

    _fs2.default.writeFileSync(destPath, data, "utf-8");

    _ourinloggerjs.logger.success("Backup", `Restored: ${backupName}`);
    return true;
  } catch (error) {
    _ourinloggerjs.logger.error("Backup", `Restore failed: ${error.message}`);
    return false;
  }
}

function startAutoBackup(dbPath) {
  if (!BACKUP_CONFIG.enabled) return;

  if (backupInterval) {
    clearInterval(backupInterval);
  }

  backupDatabase(dbPath);

  const intervalMs = BACKUP_CONFIG.intervalHours * 60 * 60 * 1000;
  backupInterval = setInterval(() => {
    backupDatabase(dbPath);
  }, intervalMs);

  _ourinloggerjs.logger.info(
    "Backup",
    `Auto backup enabled (every ${BACKUP_CONFIG.intervalHours}h)`,
  );
}

function stopAutoBackup() {
  if (backupInterval) {
    clearInterval(backupInterval);
    backupInterval = null;
    _ourinloggerjs.logger.info("Backup", "Auto backup stopped");
  }
}

function getBackupStatus() {
  const backups = listBackups();
  return {
    enabled: BACKUP_CONFIG.enabled,
    intervalHours: BACKUP_CONFIG.intervalHours,
    retainDays: BACKUP_CONFIG.retainDays,
    totalBackups: backups.length,
    latestBackup: backups[0] || null,
  };
}











exports.backupDatabase = backupDatabase; exports.restoreBackup = restoreBackup; exports.listBackups = listBackups; exports.cleanOldBackups = cleanOldBackups; exports.startAutoBackup = startAutoBackup; exports.stopAutoBackup = stopAutoBackup; exports.getBackupStatus = getBackupStatus; exports.getBackupDir = getBackupDir; exports.BACKUP_CONFIG = BACKUP_CONFIG;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

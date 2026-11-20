"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _archiver = require('archiver'); var _archiver2 = _interopRequireDefault(_archiver);
var _cron = require('cron');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourindatabasejs = require('./ourin-database.js');
var _ourintimejs = require('./ourin-time.js'); var timeHelper = _interopRequireWildcard(_ourintimejs);
var _ourinloggerjs = require('./ourin-logger.js');

const BACKUP_STATE_FILE = _path2.default.join(
  process.cwd(),
  "database",
  "autobackup.json",
);
let sockInstance = null;
let activeCronJob = null;

const EXCLUDE_DIRS = new Set([
  "node_modules",
  ".git",
  "storage",
  "storages",
  "tmp",
  "temp",
  ".cache",
  "logs",
  "sessions",
  "session",
  "auth",
  ".npm",
  ".yarn",
  "dist",
  "coverage",
  "__pycache__",
  "autoreply_media",
  "build",
  "Baileys-master",
  "ourin",
  "ALYA V8",
  "DHX-pro",
  "RTXZY-MD-pro",
  "BETABOTZ-MD2-pro",
  "KazzTzyCanvs",
  "starseed-main",
  "OurinGlitch-Baileys-main",
  "Script Lyrra MD V7",
  "Sky Md V2",
  "Marin Kitagawa MD V1.0 (1)",
  "AmbaCrash v19 Free (1)",
  "@blckrose",
  "backup",
  "animation",
  "_tools",
  "PUSHKONTAK",
  ".vscode",
  ".gemini",
  "fischit-main",
  ".ourin-temp",
]);

const EXCLUDE_EXTENSIONS = new Set([
  ".zip",
  ".tar.gz",
  ".7z",
  ".mp4",
  ".mp3",
  ".wav",
  ".avi",
  ".mkv",
  ".ico",
  ".svg",
  ".traineddata",
  ".log",
  ".bak",
  ".lock",
]);

const EXCLUDE_FILES = new Set([
  ".env",
  ".env.local",
  "creds.json",
  "package-lock.json",
  "yarn.lock",
  ".npmrc",
  ".gitignore",
  "boot_final.log",
  "bot_log.txt",
  "error.txt",
  "changelog.txt",
  "UPDATE.txt",
  "CHANGELOG.md",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function shouldExclude(filePath) {
  const relativePath = _path2.default.relative(process.cwd(), filePath);
  const parts = relativePath.split(_path2.default.sep);
  for (const part of parts) {
    if (EXCLUDE_DIRS.has(part)) return true;
  }
  const fileName = _path2.default.basename(filePath);
  if (EXCLUDE_FILES.has(fileName)) return true;
  const ext = _path2.default.extname(fileName).toLowerCase();
  if (EXCLUDE_EXTENSIONS.has(ext)) {
    const isAsset =
      relativePath.startsWith("assets" + _path2.default.sep) ||
      relativePath.startsWith("database" + _path2.default.sep);
    if (!isAsset) return true;
  }
  if (fileName.endsWith(".tar.gz")) return true;
  return false;
}

function loadBackupState() {
  try {
    if (_fs2.default.existsSync(BACKUP_STATE_FILE)) {
      return JSON.parse(_fs2.default.readFileSync(BACKUP_STATE_FILE, "utf8"));
    }
  } catch (e2) {}
  return {
    enabled: false,
    intervalMs: 3600000,
    intervalStr: "1h",
    lastBackup: null,
    backupCount: 0,
  };
}

function saveBackupState(state) {
  try {
    const dir = _path2.default.dirname(BACKUP_STATE_FILE);
    if (!_fs2.default.existsSync(dir)) _fs2.default.mkdirSync(dir, { recursive: true });
    _fs2.default.writeFileSync(BACKUP_STATE_FILE, JSON.stringify(state, null, 2), "utf8");
  } catch (e) {
    _ourinloggerjs.logger.error("AutoBackup", `Save state failed: ${e.message}`);
  }
}

function parseInterval(str) {
  const match = str.match(/^(\d+)(m|h|d)$/i);
  if (!match) return null;
  const value = parseInt(match[1]);
  const unit = match[2].toLowerCase();
  let ms = 0;
  switch (unit) {
    case "m":
      ms = value * 60 * 1000;
      break;
    case "h":
      ms = value * 60 * 60 * 1000;
      break;
    case "d":
      ms = value * 24 * 60 * 60 * 1000;
      break;
    default:
      return null;
  }
  if (ms < 60000 || ms > 7 * 24 * 60 * 60 * 1000) return null;
  return { ms, str: `${value}${unit}` };
}

function formatInterval(ms) {
  if (ms >= 24 * 60 * 60 * 1000)
    return `${Math.floor(ms / (24 * 60 * 60 * 1000))} hari`;
  if (ms >= 60 * 60 * 1000) return `${Math.floor(ms / (60 * 60 * 1000))} jam`;
  return `${Math.floor(ms / (60 * 1000))} menit`;
}

function intervalToCron(ms) {
  if (ms >= 24 * 60 * 60 * 1000) {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    return `0 0 */${days} * *`;
  }
  if (ms >= 60 * 60 * 1000) {
    const hours = Math.floor(ms / (60 * 60 * 1000));
    return `0 */${hours} * * *`;
  }
  const minutes = Math.floor(ms / (60 * 1000));
  return `*/${minutes} * * * *`;
}

async function createBackup() {
  return new Promise((resolve, reject) => {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    const tmpDir = _path2.default.join(process.cwd(), "tmp");
    if (!_fs2.default.existsSync(tmpDir)) _fs2.default.mkdirSync(tmpDir, { recursive: true });
    const backupPath = _path2.default.join(tmpDir, `backup_${timestamp}.zip`);

    const output = _fs2.default.createWriteStream(backupPath);
    const archive = _archiver2.default.call(void 0, "zip", { zlib: { level: 9 } });
    let fileCount = 0;

    output.on("close", () => {
      resolve({
        path: backupPath,
        size: archive.pointer(),
        fileCount,
        timestamp,
      });
    });
    archive.on("error", reject);
    archive.pipe(output);

    const rootDir = process.cwd();

    async function addDirectory(dirPath) {
      try {
        const entries = await _fs2.default.promises.readdir(dirPath, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = _path2.default.join(dirPath, entry.name);
          if (shouldExclude(fullPath)) continue;
          if (entry.isDirectory()) {
            await addDirectory(fullPath);
          } else if (entry.isFile()) {
            try {
              const stat = await _fs2.default.promises.stat(fullPath);
              if (stat.size < MAX_FILE_SIZE) {
                const relativePath = _path2.default.relative(rootDir, fullPath);
                archive.file(fullPath, { name: relativePath });
                fileCount++;
              }
            } catch (e3) {}
          }
        }
      } catch (e4) {}
    }

    addDirectory(rootDir).then(() => {
      archive.finalize();
    }).catch(reject);
  });
}

async function sendBackupToOwner(backupInfo) {
  if (!sockInstance) {
    _ourinloggerjs.logger.error("AutoBackup", "Socket not initialized");
    return false;
  }

  const ownerNumbers = _optionalChain([_configjs2.default, 'access', _ => _.owner, 'optionalAccess', _2 => _2.number]) || [];
  if (ownerNumbers.length === 0) {
    _ourinloggerjs.logger.error("AutoBackup", "No owner number configured");
    return false;
  }

  const ownerNumber = String(ownerNumbers[0]).replace(/[^0-9]/g, "");
  if (!ownerNumber) {
    _ourinloggerjs.logger.error("AutoBackup", "Invalid owner number");
    return false;
  }

  const ownerJid = `${ownerNumber}@s.whatsapp.net`;

  try {
    const sizeInMB = (backupInfo.size / (1024 * 1024)).toFixed(2);
    const state = loadBackupState();

    const caption =
      `🗂️ *ᴀᴜᴛᴏ ʙᴀᴄᴋᴜᴘ*\n\n` +
      `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n` +
      `┃ 📅 Waktu: ${timeHelper.formatDateTime("DD MMMM YYYY HH:mm:ss")} WIB\n` +
      `┃ 📦 Size: ${sizeInMB} MB\n` +
      `┃ 📁 Files: ${backupInfo.fileCount}\n` +
      `┃ ⏱️ Interval: ${formatInterval(state.intervalMs)}\n` +
      `┃ #️⃣ Backup ke-${state.backupCount + 1}\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `> ${_optionalChain([_configjs2.default, 'access', _3 => _3.bot, 'optionalAccess', _4 => _4.name]) || "Ourin-AI"} Auto Backup System`;

    await sockInstance.sendMessage(ownerJid, {
      document: { url: backupInfo.path },
      mimetype: "application/zip",
      fileName: _path2.default.basename(backupInfo.path),
      caption,
    });

    state.lastBackup = new Date().toISOString();
    state.backupCount++;
    saveBackupState(state);

    try {
      await _fs2.default.promises.unlink(backupInfo.path);
    } catch (e5) {}

    _ourinloggerjs.logger.success("AutoBackup", `Backup sent to owner (${sizeInMB} MB)`);
    return true;
  } catch (error) {
    _ourinloggerjs.logger.error("AutoBackup", `Send failed: ${error.message}`);
    return false;
  }
}

async function doBackup() {
  try {
    _ourinloggerjs.logger.info("AutoBackup", "Starting backup...");
    const backupInfo = await createBackup();
    await sendBackupToOwner(backupInfo);
  } catch (error) {
    _ourinloggerjs.logger.error("AutoBackup", `Backup failed: ${error.message}`);
  }
}

function startAutoBackup(sock) {
  sockInstance = sock;
  const state = loadBackupState();

  if (!state.enabled) {
    _ourinloggerjs.logger.info("AutoBackup", "Auto backup is disabled");
    return;
  }

  stopAutoBackup();

  const cronExp = intervalToCron(state.intervalMs);
  activeCronJob = new (0, _cron.CronJob)(cronExp, doBackup, null, true, "Asia/Jakarta");
  _ourinloggerjs.logger.info(
    "AutoBackup",
    `Started with interval: ${formatInterval(state.intervalMs)} (cron: ${cronExp})`,
  );
}

function stopAutoBackup() {
  if (activeCronJob) {
    activeCronJob.stop();
    activeCronJob = null;
    _ourinloggerjs.logger.info("AutoBackup", "Stopped");
  }
}

function enableAutoBackup(intervalStr, sock) {
  const parsed = parseInterval(intervalStr);
  if (!parsed) {
    return {
      success: false,
      error: "Format interval tidak valid. Contoh: 5m, 1h, 2d",
    };
  }

  sockInstance = sock;

  const state = loadBackupState();
  state.enabled = true;
  state.intervalMs = parsed.ms;
  state.intervalStr = parsed.str;
  saveBackupState(state);

  stopAutoBackup();
  startAutoBackup(sock);

  return {
    success: true,
    interval: formatInterval(parsed.ms),
    intervalStr: parsed.str,
  };
}

function disableAutoBackup() {
  const state = loadBackupState();
  state.enabled = false;
  saveBackupState(state);
  stopAutoBackup();
  return { success: true };
}

function getBackupStatus() {
  const state = loadBackupState();
  return {
    enabled: state.enabled,
    interval: formatInterval(state.intervalMs),
    intervalStr: state.intervalStr,
    lastBackup: state.lastBackup,
    backupCount: state.backupCount,
    isRunning: activeCronJob !== null,
  };
}

async function triggerManualBackup(sock) {
  sockInstance = sock;
  await doBackup();
}

function initAutoBackup(sock) {
  sockInstance = sock;
  startAutoBackup(sock);
}












exports.initAutoBackup = initAutoBackup; exports.startAutoBackup = startAutoBackup; exports.stopAutoBackup = stopAutoBackup; exports.enableAutoBackup = enableAutoBackup; exports.disableAutoBackup = disableAutoBackup; exports.getBackupStatus = getBackupStatus; exports.triggerManualBackup = triggerManualBackup; exports.createBackup = createBackup; exports.parseInterval = parseInterval; exports.formatInterval = formatInterval;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

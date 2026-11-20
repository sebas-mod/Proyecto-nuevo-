"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('./almiku-database.js');
var _almikuloggerjs = require('./almiku-logger.js');
var _almikuutilsjs = require('./almiku-utils.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _almikucontextjs = require('./almiku-context.js');
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _almikuassetmanagerjs = require('./almiku-asset-manager.js');
let autoJpmTimer = null;
let sock = null;
let isSending = false;
let cachedThumb = null;

try {
  if (!!_almikuassetmanagerjs.getAssetBuffer.call(void 0, "almiku2")) {
    cachedThumb = _almikuassetmanagerjs.getAssetBuffer.call(void 0, "almiku2");
  }
} catch (e) {}

function getAutoJpmStorageDir() {
  const dir = _path2.default.join(process.cwd(), "storage", "autojpm");
  if (!_fs2.default.existsSync(dir)) {
    _fs2.default.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function getAutoJpmConfig() {
  const db = _almikudatabasejs.getDatabase.call(void 0, );
  return db.setting("autoJpm") || {};
}

function setAutoJpmConfig(data) {
  const db = _almikudatabasejs.getDatabase.call(void 0, );
  db.setting("autoJpm", data);
  return data;
}

function buildContextInfo() {
  return _almikucontextjs.saluranCtx.call(void 0, );
}

function clearAutoJpmTimer() {
  if (autoJpmTimer) {
    clearTimeout(autoJpmTimer);
    autoJpmTimer = null;
  }
}

function scheduleNextRun(sendImmediately = false) {
  clearAutoJpmTimer();
  const cfg = getAutoJpmConfig();
  if (!sock || !cfg.enabled) return;
  const intervalMs = Number(cfg.intervalMs || 0);
  const MIN_INTERVAL = 15 * 60 * 1000;
  if (!intervalMs || intervalMs < MIN_INTERVAL) return;

  const lastRun = Number(cfg.lastRun || 0);
  const isFirstRun = !lastRun || lastRun === 0;

  if (sendImmediately || isFirstRun) {
    setAutoJpmConfig({ ...cfg, nextRun: Date.now() + 5000 });
    autoJpmTimer = setTimeout(runAutoJpm, 5000);
  } else {
    const nextRun = lastRun + intervalMs;
    const delayMs = Math.max(nextRun - Date.now(), 1000);
    setAutoJpmConfig({ ...cfg, nextRun });
    autoJpmTimer = setTimeout(runAutoJpm, delayMs);
  }
}

function buildPayload(message, contextInfo) {
  const text = _optionalChain([message, 'optionalAccess', _ => _.text]) || "";
  const media = _optionalChain([message, 'optionalAccess', _2 => _2.media]);
  if (!media || !media.path || !_fs2.default.existsSync(media.path)) {
    return { payload: { text, contextInfo }, sendTextAfter: false };
  }
  const buffer = _fs2.default.readFileSync(media.path);
  if (media.type === "image") {
    return {
      payload: { image: buffer, caption: text || "", contextInfo },
      sendTextAfter: false,
    };
  }
  if (media.type === "video") {
    return {
      payload: { video: buffer, caption: text || "", contextInfo },
      sendTextAfter: false,
    };
  }
  if (media.type === "audio") {
    return {
      payload: {
        audio: buffer,
        mimetype: media.mimetype || "audio/mpeg",
        ptt: false,
        contextInfo,
      },
      sendTextAfter: Boolean(text),
    };
  }
  if (media.type === "document") {
    return {
      payload: {
        document: buffer,
        mimetype: media.mimetype || "application/octet-stream",
        fileName: media.fileName || "file",
        contextInfo,
      },
      sendTextAfter: Boolean(text),
    };
  }
  return { payload: { text, contextInfo }, sendTextAfter: false };
}

async function sendAutoJpm(cfg) {
  const db = _almikudatabasejs.getDatabase.call(void 0, );
  const message = cfg.message || {};
  if (!message.text && !message.media) return;
  const contextInfo = buildContextInfo();
  let groupIds = [];
  global.statusautojpm = true;
  try {
    global.isFetchingGroups = true;
    const allGroups = await sock.groupFetchAllParticipating();
    groupIds = Object.keys(allGroups);
  } finally {
    global.isFetchingGroups = false;
  }
  const blacklist = db.setting("jpmBlacklist") || [];
  const autoBlacklist = db.setting("autoJpmBlacklist") || [];
  const allBlacklist = [...new Set([...blacklist, ...autoBlacklist])];
  groupIds = groupIds.filter((id) => !allBlacklist.includes(id));
  if (!groupIds.length) return;
  const jedaJpm = db.setting("jedaJpm") || 5000;
  const payloadInfo = buildPayload(message, contextInfo);
  for (const groupId of groupIds) {
    if (!getAutoJpmConfig().enabled || global.stopjpm) {
      if (global.stopjpm) delete global.stopjpm;
      break;
    }
    try {
      await sock.sendMessage(groupId, payloadInfo.payload);
      if (payloadInfo.sendTextAfter && message.text) {
        await sock.sendMessage(groupId, { text: message.text, contextInfo });
      }
    } catch (error) {
      _almikuloggerjs.logger.error("AutoJPM", `Failed ${groupId}: ${error.message}`);
    }
    await _almikuutilsjs.delay.call(void 0, jedaJpm);
  }
}

async function runAutoJpm() {
  if (!sock) return;
  const cfg = getAutoJpmConfig();
  if (!cfg.enabled) return;
  if (isSending || global.statusjpm) {
    scheduleNextRun();
    return;
  }
  isSending = true;
  setAutoJpmConfig({ ...cfg, lastRun: Date.now() });
  try {
    await sendAutoJpm(cfg);
  } catch (error) {
    _almikuloggerjs.logger.error("AutoJPM", error.message);
  } finally {
    isSending = false;
    global.statusautojpm = false;
    scheduleNextRun();
  }
}

function initAutoJpmScheduler(socket) {
  sock = socket;
  scheduleNextRun();
}

function startAutoJpmScheduler(socket) {
  if (socket) sock = socket;
  scheduleNextRun();
}

function stopAutoJpmScheduler() {
  clearAutoJpmTimer();
}








exports.initAutoJpmScheduler = initAutoJpmScheduler; exports.startAutoJpmScheduler = startAutoJpmScheduler; exports.stopAutoJpmScheduler = stopAutoJpmScheduler; exports.getAutoJpmConfig = getAutoJpmConfig; exports.setAutoJpmConfig = setAutoJpmConfig; exports.getAutoJpmStorageDir = getAutoJpmStorageDir;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

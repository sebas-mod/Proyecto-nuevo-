"use strict";
// Suppress fake static startup banner from cantarella package to prevent false "Connected" status
const _origConsoleLog = console.log;
console.log = function (...args) {
  const text = args.map(a => typeof a === "string" ? a : "").join(" ");
  if (
    (text.includes("CANTARELLA") || text.includes("Cantarella")) &&
    (text.includes("SYSTEM ONLINE") || text.includes("Connected"))
  ) {
    return;
  }
  return _origConsoleLog.apply(console, args);
};
function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _configjs = require('./config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _connectionjs = require('./src/connection.js');






var _handlerjs = require('./src/handler.js');
var _ourinpluginsjs = require('./src/lib/ourin-plugins.js');
var _ourindatabasejs = require('./src/lib/ourin-database.js');





var _ourinschedulerjs = require('./src/lib/ourin-scheduler.js');
var _ouringroupprotectionjs = require('./src/lib/ourin-group-protection.js');
var _ourinnotifschedulerjs = require('./src/lib/ourin-notif-scheduler.js');
var _ourinautojpmjs = require('./src/lib/ourin-auto-jpm.js');
var _ourinmemorymonitorjs = require('./src/lib/ourin-memory-monitor.js');
var _ourintempcleanerjs = require('./src/lib/ourin-temp-cleaner.js');
var _ourindataprunerjs = require('./src/lib/ourin-data-pruner.js');
var _ourinantibanjs = require('./src/lib/ourin-antiban.js');
var _ourinassetmanagerjs = require('./src/lib/ourin-asset-manager.js');








var _ourinloggerjs = require('./src/lib/ourin-logger.js');

//agente inicializado en el principal

const LOG_NOISE = new Set([
  "Closing",
  "Opening",
  "prekey",
  "_chains",
  "registrationId",
  "chainKey",
  "ephemeralKeyPair",
  "rootKey",
  "indexInfo",
  "pendingPreKey",
  "currentRatchet",
  "baseKey",
  "privKey",
  "Session already",
  "SessionEntry",
]);

function _isNoise(args) {
  const first = typeof args[0] === "string" ? args[0] : "";
  for (const noise of LOG_NOISE) {
    if (first.includes(noise)) return true;
  }
  return false;
}

const _log = console.log;
const _info = console.info;
const _warn = console.warn;

console.log = (...args) => {
  if (_isNoise(args)) return;
  _log.apply(console, args);
};

console.info = (...args) => {
  if (_isNoise(args)) return;
  _info.apply(console, args);
};

console.warn = (...args) => {
  if (_isNoise(args)) return;
  _warn.apply(console, args);
};

const startTime = Date.now();

let pluginWatcher = null;
const reloadDebounce = new Map();
const fileStatCache = new Map();

function startDevWatcher(pluginsPath) {
  if (pluginWatcher) pluginWatcher.close();

  _ourinloggerjs.logger.system("dev", "Hot-Reload watcher active for plugins");

  pluginWatcher = _fs2.default.watch(
    pluginsPath,
    { recursive: true },
    (eventType, filename) => {
      if (!filename || !filename.endsWith(".js")) return;

      const existingTimeout = reloadDebounce.get(filename);
      if (existingTimeout) clearTimeout(existingTimeout);

      const timeout = setTimeout(async () => {
        reloadDebounce.delete(filename);
        const fullPath = _path2.default.join(pluginsPath, filename);

        if (!_fs2.default.existsSync(fullPath)) {
          fileStatCache.delete(fullPath);
          const pluginName = _path2.default.basename(filename, ".js");
          const { unloadPlugin } = await Promise.resolve().then(() => _interopRequireWildcard(require("./src/lib/ourin-plugins.js")));
          const result = unloadPlugin(pluginName);
          if (result.success) _ourinloggerjs.logger.warn("plugin", `removed ${filename}`);
          return;
        }

        try {
          const stats = _fs2.default.statSync(fullPath);
          const cached = fileStatCache.get(fullPath);
          const changed =
            !cached ||
            cached.mtimeMs !== stats.mtimeMs ||
            cached.size !== stats.size;
          if (!changed) return;

          fileStatCache.set(fullPath, {
            mtimeMs: stats.mtimeMs,
            size: stats.size,
          });

          const { hotReloadPlugin } =
            await Promise.resolve().then(() => _interopRequireWildcard(require("./src/lib/ourin-plugins.js")));
          const result = await hotReloadPlugin(fullPath);
          if (!result.success) {
            _ourinloggerjs.logger.error(
              "plugin",
              `reload failed: ${filename}: ${result.error}`,
            );
          }
        } catch (error) {
          _ourinloggerjs.logger.error(
            "plugin",
            `reload failed: ${filename}: ${error.message}`,
          );
        }
      }, 500);

      reloadDebounce.set(filename, timeout);
    },
  );

  _ourinloggerjs.logger.debug("dev", `Monitoring directory: ${pluginsPath}`);
}

let srcWatcher = null;

function startSrcWatcher(srcPath) {
  if (srcWatcher) srcWatcher.close();

  _ourinloggerjs.logger.system("dev", "Pantauan hot-reload buat src udah jalan bosku");

  srcWatcher = _fs2.default.watch(srcPath, { recursive: true }, (eventType, filename) => {
    if (!filename || !filename.endsWith(".js")) return;

    const existingTimeout = reloadDebounce.get("src_" + filename);
    if (existingTimeout) clearTimeout(existingTimeout);

    const timeout = setTimeout(() => {
      reloadDebounce.delete("src_" + filename);
      const fullPath = _path2.default.join(srcPath, filename);
      if (!_fs2.default.existsSync(fullPath)) {
        _ourinloggerjs.logger.warn("dev", `src archivo removed:${filename}`);
        return;
      }
      _ourinloggerjs.logger.success("dev", `src changed: ${filename}`);
    }, 500);

    reloadDebounce.set("src_" + filename, timeout);
  });

  _ourinloggerjs.logger.debug("dev", `Monitoring directory: ${srcPath}`);
}

function setupAntiCrash() {
  process.on("uncaughtException", (error, origin) => {
    const ignoredErrors = [
      "write EOF",
      "ECONNRESET",
      "EPIPE",
      "ETIMEDOUT",
      "ENOTFOUND",
      "ECONNREFUSED",
      "read ECONNRESET",
    ];
    const isIgnored = ignoredErrors.some(
      (msg) => _optionalChain([error, 'access', _2 => _2.message, 'optionalAccess', _3 => _3.includes, 'call', _4 => _4(msg)]) || error.code === msg,
    );
    if (isIgnored) return;

    _ourinloggerjs.logErrorBox.call(void 0, "uncaught exception", error.message);
    console.error(_ourinloggerjs.c.gray(error.stack));
    _ourinloggerjs.logger.system("system", "Engine is still running");
  });

  process.on("unhandledRejection", (reason, promise) => {
    _ourinloggerjs.logErrorBox.call(void 0, "unhandled rejection", String(reason));
    console.error(_ourinloggerjs.c.gray("Promise:"), promise);
    _ourinloggerjs.logger.system("system", "Engine is still running");
  });

  process.on("warning", (warning) => {
    _ourinloggerjs.logger.warn("system", `${warning.name}: ${warning.message}`);
  });

  process.on("SIGINT", async () => {
    console.log("");
    _ourinloggerjs.logger.system("system", "Received STOP signal (SIGINT)");
    _ourinloggerjs.logger.info("database", "Saving data to local storage...");
    try {
      const db = _ourindatabasejs.getDatabase.call(void 0, );
      db.save();
      _ourinloggerjs.logger.success("database", "All data successfully saved");
    } catch (error) {
      _ourinloggerjs.logger.warn("database", `save failed: ${error.message}`);
    }
    _ourinloggerjs.logger.info("system", "Engine stopped safely");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("");
    _ourinloggerjs.logger.system("system", "Received TERMINATE signal (SIGTERM)");
    process.exit(0);
  });

  _ourinloggerjs.logger.success("system", "Sistem anti-crash nyala, aman terkendali 😎");
}

async function main() {
  try { const { initializeAgent } = require("./src/lib/ourin-agent.js"); await initializeAgent(); } catch (e) {}
  await _ourinloggerjs.playBootSequence.call(void 0, {
    name: _optionalChain([_configjs2.default, 'access', _5 => _5.bot, 'optionalAccess', _6 => _6.name]) || "Ourin-AI",
    version: _optionalChain([_configjs2.default, 'access', _7 => _7.bot, 'optionalAccess', _8 => _8.version]) || "1.0.0",
    developer: _optionalChain([_configjs2.default, 'access', _9 => _9.bot, 'optionalAccess', _10 => _10.developer]) || "Developer",
    mode: _configjs2.default.mode || "public",
  });
  setupAntiCrash();

  const dbPath = _path2.default.join(
    process.cwd(),
    _optionalChain([_configjs2.default, 'access', _11 => _11.database, 'optionalAccess', _12 => _12.path]) || "./database/main",
  );
  await _ourindatabasejs.initDatabase.call(void 0, dbPath);
  const db = _ourindatabasejs.getDatabase.call(void 0, );

  await _ourinloggerjs.spinText.call(void 0, "system", "Lagi muat aset lokal bentar...", { tone: "accent" });
  await _ourinassetmanagerjs.preloadAssets.call(void 0, _configjs2.default.assets);

  const savedMode = db.setting("botMode");
  if (savedMode && (savedMode === "self" || savedMode === "public"))
    _configjs2.default.mode = savedMode;
  const savedPremium = db.setting("premiumUsers");
  if (Array.isArray(savedPremium)) _configjs2.default.premiumUsers = savedPremium;
  const savedBanned = db.setting("bannedUsers");
  if (Array.isArray(savedBanned)) _configjs2.default.bannedUsers = savedBanned;

  const pCount = Array.isArray(savedPremium) ? savedPremium.length : 0;
  const bCount = Array.isArray(savedBanned) ? savedBanned.length : 0;
  _ourinloggerjs.logger.success(
    "database",
    `Base de datos cargada con éxito | Modo: ${_configjs2.default.mode} | Premium: ${pCount} | Banned: ${bCount}`,
  );

  const pluginsPath = _path2.default.join(process.cwd(), "plugins");
  const pluginCount = await _ourinpluginsjs.loadPlugins.call(void 0, pluginsPath);
  _ourinloggerjs.logger.success("plugin", `Sukses carga${pluginCount} plugin!`);

  if (_optionalChain([_configjs2.default, 'access', _13 => _13.dev, 'optionalAccess', _14 => _14.enabled]) && _optionalChain([_configjs2.default, 'access', _15 => _15.dev, 'optionalAccess', _16 => _16.watchPlugins]))
    startDevWatcher(pluginsPath);
  if (_optionalChain([_configjs2.default, 'access', _17 => _17.dev, 'optionalAccess', _18 => _18.enabled]) && _optionalChain([_configjs2.default, 'access', _19 => _19.dev, 'optionalAccess', _20 => _20.watchSrc])) {
    const srcPath = _path2.default.join(process.cwd(), "src");
    startSrcWatcher(srcPath);
  }

  _ourinschedulerjs.initScheduler.call(void 0, _configjs2.default);

  const bootTime = Date.now() - startTime;
  _ourinloggerjs.logger.success("boot", `Aquí está. Es tan profundo.${bootTime}ms 🚀`);
  _ourinloggerjs.divider.call(void 0, );
  await _ourinloggerjs.spinText.call(void 0, "network", "Opening WhatsApp connection tunnel...", {
    duration: 900,
    tone: "accent",
  });
  _ourinloggerjs.logConnection.call(void 0, "connecting", "Lagi nyambungin ke WhatsApp nih...");
  console.log("");

  await _connectionjs.startConnection.call(void 0, {
    onRawMessage: async (msg, sock) => {
      try {
        const db = _ourindatabasejs.getDatabase.call(void 0, );
        await _ouringroupprotectionjs.handleAntiTagSW.call(void 0, msg, sock, db);
      } catch (error) { }
    },

    onMessage: async (msg, sock) => {
      try {
        const handlerPromise = _handlerjs.messageHandler.call(void 0, msg, sock);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Handler timeout")), 60000),
        );
        await Promise.race([handlerPromise, timeoutPromise]);
      } catch (error) {
        if (error.message !== "Handler timeout") {
          _ourinloggerjs.logger.error("HANDLER", error.message);
          if (_optionalChain([_configjs2.default, 'access', _21 => _21.dev, 'optionalAccess', _22 => _22.debugLog])) console.error(_ourinloggerjs.c.gray(error.stack));
        }
      }
    },

    onGroupUpdate: async (update, sock) => {
      try {
        await _handlerjs.groupHandler.call(void 0, update, sock);
      } catch (error) {
        _ourinloggerjs.logger.error("GROUP", error.message);
      }
    },

    onMessageUpdate: async (updates, sock) => {
      try {
        await _handlerjs.messageUpdateHandler.call(void 0, updates, sock);
      } catch (error) {
        _ourinloggerjs.logger.error("MSG", error.message);
      }
    },

    onGroupSettingsUpdate: async (update, sock) => {
      try {
        await _handlerjs.groupSettingsHandler.call(void 0, update, sock);
      } catch (error) {
        _ourinloggerjs.logger.error("GROUP", error.message);
      }
    },

    onStubMessage: async (msg, sock) => {
      try {
        const db = _ourindatabasejs.getDatabase.call(void 0, );
        await _handlerjs.handleAntiRemoveFromUpsert.call(void 0, msg, sock, db);
      } catch (error) {
        _ourinloggerjs.logger.error("ANTIDELETE", error.message);
      }
    },

    onConnectionUpdate: async (update, sock) => {
      if (update.connection === "open") {
        try {
          await _ourinantibanjs.initializeOurinAntiban.call(void 0, sock);
        } catch (error) {
          _ourinloggerjs.logger.error("ANTIBAN", `Fallido inisialisasi:${error.message}`);
        }
        _ourinloggerjs.logConnection.call(void 0, "connected", _optionalChain([sock, 'access', _23 => _23.user, 'optionalAccess', _24 => _24.name]) || "Bot");
        _ourinschedulerjs.loadScheduledMessages.call(void 0, sock);
        _ourinschedulerjs.startGroupScheduleChecker.call(void 0, sock);
        _ourinschedulerjs.startSewaChecker.call(void 0, sock);
        _ourinschedulerjs.initScheduler.call(void 0, _configjs2.default, sock);
        _ourinautojpmjs.initAutoJpmScheduler.call(void 0, sock);
        _ourinnotifschedulerjs.initNotifScheduler.call(void 0, sock);
        try {
          const { initSahurCron } =
            await Promise.resolve().then(() => _interopRequireWildcard(require("./plugins/religi/autosahur.js")));
          initSahurCron(sock);
        } catch (e2) { }
        try {
          const { startOtpPoller: _startOtp } =
            await Promise.resolve().then(() => _interopRequireWildcard(require("./src/lib/ourin-otp-poller.js")));
          _startOtp(sock);
        } catch (e4) { }

        try {
          const { getAllJadibotSessions, restartJadibotSession } =
            await Promise.resolve().then(() => _interopRequireWildcard(require("./src/lib/ourin-jadibot-manager.js")));
          const sessions = getAllJadibotSessions();
          if (sessions.length > 0) {
            _ourinloggerjs.logger.info("JADIBOT", `Restoring ${sessions.length} session(s)`);
            for (const session of sessions) {
              try {
                await restartJadibotSession(sock, session.id);
                await new Promise((r) => setTimeout(r, 3000));
              } catch (e) {
                _ourinloggerjs.logger.error(
                  "JADIBOT",
                  `Failed restore ${session.id}: ${e.message}`,
                );
              }
            }
          }
        } catch (e) {
          _ourinloggerjs.logger.error("JADIBOT", `Fallido memulihkan:${e.message}`);
        }

        const devLabel = _optionalChain([_configjs2.default, 'access', _25 => _25.dev, 'optionalAccess', _26 => _26.enabled]) ? ` ${_ourinloggerjs.c.yellow("• dev")}` : "";
        _ourinmemorymonitorjs.startMemoryMonitor.call(void 0, );
        _ourintempcleanerjs.startTempCleaner.call(void 0, );
        _ourindataprunerjs.startDailyPruner.call(void 0, );
        _ourinloggerjs.logger.success("YEYYYY", `Todos los sistemas en la carretera son buenos, así que sólo langsug🚀`);
        _ourinloggerjs.logger.success("NOTE", `Si hay error, por favor se le diga, el problema no es una buena bota: )`);
        _ourinloggerjs.divider.call(void 0, );
      }
    },
  });
}

main().catch((error) => {
  _ourinloggerjs.logErrorBox.call(void 0, "Fatal Error", error.message);
  console.error(_ourinloggerjs.c.gray(error.stack));
  process.exit(1);
});

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

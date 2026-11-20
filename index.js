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
var _almikupluginsjs = require('./src/lib/almiku-plugins.js');
var _almikudatabasejs = require('./src/lib/almiku-database.js');





var _almikuschedulerjs = require('./src/lib/almiku-scheduler.js');
var _almikugroupprotectionjs = require('./src/lib/almiku-group-protection.js');
var _almikunotifschedulerjs = require('./src/lib/almiku-notif-scheduler.js');
var _almikuautojpmjs = require('./src/lib/almiku-auto-jpm.js');
var _almikumemorymonitorjs = require('./src/lib/almiku-memory-monitor.js');
var _almikutempcleanerjs = require('./src/lib/almiku-temp-cleaner.js');
var _almikudataprunerjs = require('./src/lib/almiku-data-pruner.js');
var _almikuantibanjs = require('./src/lib/almiku-antiban.js');
var _almikuassetmanagerjs = require('./src/lib/almiku-asset-manager.js');








var _almikuloggerjs = require('./src/lib/almiku-logger.js');

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

  _almikuloggerjs.logger.system("dev", "Hot-Reload watcher active for plugins");

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
          const { unloadPlugin } = await Promise.resolve().then(() => _interopRequireWildcard(require("./src/lib/almiku-plugins.js")));
          const result = unloadPlugin(pluginName);
          if (result.success) _almikuloggerjs.logger.warn("plugin", `removed ${filename}`);
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
            await Promise.resolve().then(() => _interopRequireWildcard(require("./src/lib/almiku-plugins.js")));
          const result = await hotReloadPlugin(fullPath);
          if (!result.success) {
            _almikuloggerjs.logger.error(
              "plugin",
              `reload failed: ${filename}: ${result.error}`,
            );
          }
        } catch (error) {
          _almikuloggerjs.logger.error(
            "plugin",
            `reload failed: ${filename}: ${error.message}`,
          );
        }
      }, 500);

      reloadDebounce.set(filename, timeout);
    },
  );

  _almikuloggerjs.logger.debug("dev", `Monitoring directory: ${pluginsPath}`);
}

let srcWatcher = null;

function startSrcWatcher(srcPath) {
  if (srcWatcher) srcWatcher.close();

  _almikuloggerjs.logger.system("dev", "Pantauan hot-reload buat src udah jalan bosku");

  srcWatcher = _fs2.default.watch(srcPath, { recursive: true }, (eventType, filename) => {
    if (!filename || !filename.endsWith(".js")) return;

    const existingTimeout = reloadDebounce.get("src_" + filename);
    if (existingTimeout) clearTimeout(existingTimeout);

    const timeout = setTimeout(() => {
      reloadDebounce.delete("src_" + filename);
      const fullPath = _path2.default.join(srcPath, filename);
      if (!_fs2.default.existsSync(fullPath)) {
        _almikuloggerjs.logger.warn("dev", `src archivo removed:${filename}`);
        return;
      }
      _almikuloggerjs.logger.success("dev", `src changed: ${filename}`);
    }, 500);

    reloadDebounce.set("src_" + filename, timeout);
  });

  _almikuloggerjs.logger.debug("dev", `Monitoring directory: ${srcPath}`);
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

    _almikuloggerjs.logErrorBox.call(void 0, "uncaught exception", error.message);
    console.error(_almikuloggerjs.c.gray(error.stack));
    _almikuloggerjs.logger.system("system", "Engine is still running");
  });

  process.on("unhandledRejection", (reason, promise) => {
    _almikuloggerjs.logErrorBox.call(void 0, "unhandled rejection", String(reason));
    console.error(_almikuloggerjs.c.gray("Promise:"), promise);
    _almikuloggerjs.logger.system("system", "Engine is still running");
  });

  process.on("warning", (warning) => {
    _almikuloggerjs.logger.warn("system", `${warning.name}: ${warning.message}`);
  });

  process.on("SIGINT", async () => {
    console.log("");
    _almikuloggerjs.logger.system("system", "Received STOP signal (SIGINT)");
    _almikuloggerjs.logger.info("database", "Saving data to local storage...");
    try {
      const db = _almikudatabasejs.getDatabase.call(void 0, );
      db.save();
      _almikuloggerjs.logger.success("database", "All data successfully saved");
    } catch (error) {
      _almikuloggerjs.logger.warn("database", `save failed: ${error.message}`);
    }
    _almikuloggerjs.logger.info("system", "Engine stopped safely");
    process.exit(0);
  });

  process.on("SIGTERM", () => {
    console.log("");
    _almikuloggerjs.logger.system("system", "Received TERMINATE signal (SIGTERM)");
    process.exit(0);
  });

  _almikuloggerjs.logger.success("system", "Sistem anti-crash nyala, aman terkendali 😎");
}

async function main() {
  try { const { initializeAgent } = require("./src/lib/almiku-agent.js"); await initializeAgent(); } catch (e) {}
  await _almikuloggerjs.playBootSequence.call(void 0, {
    name: _optionalChain([_configjs2.default, 'access', _5 => _5.bot, 'optionalAccess', _6 => _6.name]) || "Al Miku-AI",
    version: _optionalChain([_configjs2.default, 'access', _7 => _7.bot, 'optionalAccess', _8 => _8.version]) || "1.0.0",
    developer: _optionalChain([_configjs2.default, 'access', _9 => _9.bot, 'optionalAccess', _10 => _10.developer]) || "Developer",
    mode: _configjs2.default.mode || "public",
  });
  setupAntiCrash();

  const dbPath = _path2.default.join(
    process.cwd(),
    _optionalChain([_configjs2.default, 'access', _11 => _11.database, 'optionalAccess', _12 => _12.path]) || "./database/main",
  );
  await _almikudatabasejs.initDatabase.call(void 0, dbPath);
  const db = _almikudatabasejs.getDatabase.call(void 0, );

  await _almikuloggerjs.spinText.call(void 0, "system", "Lagi muat aset lokal bentar...", { tone: "accent" });
  await _almikuassetmanagerjs.preloadAssets.call(void 0, _configjs2.default.assets);

  const savedMode = db.setting("botMode");
  if (savedMode && (savedMode === "self" || savedMode === "public"))
    _configjs2.default.mode = savedMode;
  const savedPremium = db.setting("premiumUsers");
  if (Array.isArray(savedPremium)) _configjs2.default.premiumUsers = savedPremium;
  const savedBanned = db.setting("bannedUsers");
  if (Array.isArray(savedBanned)) _configjs2.default.bannedUsers = savedBanned;

  const pCount = Array.isArray(savedPremium) ? savedPremium.length : 0;
  const bCount = Array.isArray(savedBanned) ? savedBanned.length : 0;
  _almikuloggerjs.logger.success(
    "database",
    `Base de datos cargada con éxito | Modo: ${_configjs2.default.mode} | Premium: ${pCount} | Banned: ${bCount}`,
  );

  const pluginsPath = _path2.default.join(process.cwd(), "plugins");
  const pluginCount = await _almikupluginsjs.loadPlugins.call(void 0, pluginsPath);
  _almikuloggerjs.logger.success("plugin", `Sukses carga${pluginCount} plugin!`);

  if (_optionalChain([_configjs2.default, 'access', _13 => _13.dev, 'optionalAccess', _14 => _14.enabled]) && _optionalChain([_configjs2.default, 'access', _15 => _15.dev, 'optionalAccess', _16 => _16.watchPlugins]))
    startDevWatcher(pluginsPath);
  if (_optionalChain([_configjs2.default, 'access', _17 => _17.dev, 'optionalAccess', _18 => _18.enabled]) && _optionalChain([_configjs2.default, 'access', _19 => _19.dev, 'optionalAccess', _20 => _20.watchSrc])) {
    const srcPath = _path2.default.join(process.cwd(), "src");
    startSrcWatcher(srcPath);
  }

  _almikuschedulerjs.initScheduler.call(void 0, _configjs2.default);

  const bootTime = Date.now() - startTime;
  _almikuloggerjs.logger.success("boot", `Aquí está. Es tan profundo.${bootTime}ms 🚀`);
  _almikuloggerjs.divider.call(void 0, );
  await _almikuloggerjs.spinText.call(void 0, "network", "Opening WhatsApp connection tunnel...", {
    duration: 900,
    tone: "accent",
  });
  _almikuloggerjs.logConnection.call(void 0, "connecting", "Lagi nyambungin ke WhatsApp nih...");
  console.log("");

  await _connectionjs.startConnection.call(void 0, {
    onRawMessage: async (msg, sock) => {
      try {
        const db = _almikudatabasejs.getDatabase.call(void 0, );
        await _almikugroupprotectionjs.handleAntiTagSW.call(void 0, msg, sock, db);
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
          _almikuloggerjs.logger.error("HANDLER", error.message);
          if (_optionalChain([_configjs2.default, 'access', _21 => _21.dev, 'optionalAccess', _22 => _22.debugLog])) console.error(_almikuloggerjs.c.gray(error.stack));
        }
      }
    },

    onGroupUpdate: async (update, sock) => {
      try {
        await _handlerjs.groupHandler.call(void 0, update, sock);
      } catch (error) {
        _almikuloggerjs.logger.error("GROUP", error.message);
      }
    },

    onMessageUpdate: async (updates, sock) => {
      try {
        await _handlerjs.messageUpdateHandler.call(void 0, updates, sock);
      } catch (error) {
        _almikuloggerjs.logger.error("MSG", error.message);
      }
    },

    onGroupSettingsUpdate: async (update, sock) => {
      try {
        await _handlerjs.groupSettingsHandler.call(void 0, update, sock);
      } catch (error) {
        _almikuloggerjs.logger.error("GROUP", error.message);
      }
    },

    onStubMessage: async (msg, sock) => {
      try {
        const db = _almikudatabasejs.getDatabase.call(void 0, );
        await _handlerjs.handleAntiRemoveFromUpsert.call(void 0, msg, sock, db);
      } catch (error) {
        _almikuloggerjs.logger.error("ANTIDELETE", error.message);
      }
    },

    onConnectionUpdate: async (update, sock) => {
      if (update.connection === "open") {
        try {
          await _almikuantibanjs.initializeAlMikuAntiban.call(void 0, sock);
        } catch (error) {
          _almikuloggerjs.logger.error("ANTIBAN", `Fallido inisialisasi:${error.message}`);
        }
        _almikuloggerjs.logConnection.call(void 0, "connected", _optionalChain([sock, 'access', _23 => _23.user, 'optionalAccess', _24 => _24.name]) || "Bot");
        _almikuschedulerjs.loadScheduledMessages.call(void 0, sock);
        _almikuschedulerjs.startGroupScheduleChecker.call(void 0, sock);
        _almikuschedulerjs.startSewaChecker.call(void 0, sock);
        _almikuschedulerjs.initScheduler.call(void 0, _configjs2.default, sock);
        _almikuautojpmjs.initAutoJpmScheduler.call(void 0, sock);
        _almikunotifschedulerjs.initNotifScheduler.call(void 0, sock);
        try {
          const { initSahurCron } =
            await Promise.resolve().then(() => _interopRequireWildcard(require("./plugins/religi/autosahur.js")));
          initSahurCron(sock);
        } catch (e2) { }
        try {
          const { startOtpPoller: _startOtp } =
            await Promise.resolve().then(() => _interopRequireWildcard(require("./src/lib/almiku-otp-poller.js")));
          _startOtp(sock);
        } catch (e4) { }

        try {
          const { getAllJadibotSessions, restartJadibotSession } =
            await Promise.resolve().then(() => _interopRequireWildcard(require("./src/lib/almiku-jadibot-manager.js")));
          const sessions = getAllJadibotSessions();
          if (sessions.length > 0) {
            _almikuloggerjs.logger.info("JADIBOT", `Restoring ${sessions.length} session(s)`);
            for (const session of sessions) {
              try {
                await restartJadibotSession(sock, session.id);
                await new Promise((r) => setTimeout(r, 3000));
              } catch (e) {
                _almikuloggerjs.logger.error(
                  "JADIBOT",
                  `Failed restore ${session.id}: ${e.message}`,
                );
              }
            }
          }
        } catch (e) {
          _almikuloggerjs.logger.error("JADIBOT", `Fallido memulihkan:${e.message}`);
        }

        const devLabel = _optionalChain([_configjs2.default, 'access', _25 => _25.dev, 'optionalAccess', _26 => _26.enabled]) ? ` ${_almikuloggerjs.c.yellow("• dev")}` : "";
        _almikumemorymonitorjs.startMemoryMonitor.call(void 0, );
        _almikutempcleanerjs.startTempCleaner.call(void 0, );
        _almikudataprunerjs.startDailyPruner.call(void 0, );
        _almikuloggerjs.logger.success("YEYYYY", `Todos los sistemas en la carretera son buenos, así que sólo langsug🚀`);
        _almikuloggerjs.logger.success("NOTE", `Si hay error, por favor se le diga, el problema no es una buena bota: )`);
        _almikuloggerjs.divider.call(void 0, );
      }
    },
  });
}

main().catch((error) => {
  _almikuloggerjs.logErrorBox.call(void 0, "Fatal Error", error.message);
  console.error(_almikuloggerjs.c.gray(error.stack));
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

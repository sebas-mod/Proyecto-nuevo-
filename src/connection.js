"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }






// Intercept and suppress fake static banner from cantarella package
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

var _ourin = require('ourin');
var _boom = require('@hapi/boom');
var _pino = require('pino'); var _pino2 = _interopRequireDefault(_pino);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _readline = require('readline'); var _readline2 = _interopRequireDefault(_readline);
var _nodecache = require('node-cache'); var _nodecache2 = _interopRequireDefault(_nodecache);
var _configjs = require('../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinloggerjs = require('./lib/ourin-logger.js'); var colors = _interopRequireWildcard(_ourinloggerjs);
var _ourinsocketjs = require('./lib/ourin-socket.js');








var _ourinlidjs = require('./lib/ourin-lid.js');
var _ourinautobackupjs = require('./lib/ourin-auto-backup.js');
const groupCache = new (0, _nodecache2.default)({ stdTTL: 5 * 60, useClones: false });
const processedMessages = new (0, _nodecache2.default)({ stdTTL: 30, useClones: false });
const msgRetryCounterCache = new (0, _nodecache2.default)({ stdTTL: 60, useClones: false });

let lastMessageReceived = Date.now();
let watchdogTimer = null;
const WATCHDOG_TIMEOUT = 30 * 60 * 1000;
const WATCHDOG_CHECK_INTERVAL = 60 * 1000;

function startWatchdog(reconnectFn, options) {
  if (watchdogTimer) clearInterval(watchdogTimer);
  lastMessageReceived = Date.now();

  watchdogTimer = setInterval(() => {
    const silentMs = Date.now() - lastMessageReceived;
    if (silentMs > WATCHDOG_TIMEOUT && connectionState.isReady) {
      colors.logger.warn(
        "watchdog",
        `No, hay un mensaje entrante.`,
      );
      connectionState.isReady = false;
      connectionState.isConnected = false;
      try {
        _optionalChain([connectionState, 'access', _2 => _2.sock, 'optionalAccess', _3 => _3.end, 'call', _4 => _4()]);
      } catch (e2) { }
    }
  }, WATCHDOG_CHECK_INTERVAL);

  if (watchdogTimer.unref) watchdogTimer.unref();
  colors.logger.success(
    "watchdog",
    `Es activo, es un límite de montaña.${WATCHDOG_TIMEOUT / 60000}minuto`,
  );
}

function stopWatchdog() {
  if (watchdogTimer) {
    clearInterval(watchdogTimer);
    watchdogTimer = null;
  }
}

const store = {
  messages: new Map(),
  chats: new Map(),
  contacts: {},
  bind(ev) {
    ev.on("messages.upsert", ({ messages: msgs }) => {

      for (const msg of msgs) {
        const jid = _optionalChain([msg, 'access', _5 => _5.key, 'optionalAccess', _6 => _6.remoteJid]);
        if (!jid) continue;
        if (!this.messages.has(jid)) this.messages.set(jid, new Map());
        const chat = this.messages.get(jid);
        if (_optionalChain([msg, 'access', _7 => _7.key, 'optionalAccess', _8 => _8.id])) {
          chat.set(msg.key.id, msg);
          if (chat.size > 200) {
            const keys = [...chat.keys()];
            for (let i = 0; i < keys.length - 150; i++) chat.delete(keys[i]);
          }
        }
        if (_optionalChain([msg, 'access', _9 => _9.key, 'optionalAccess', _10 => _10.participantAlt]) && _optionalChain([msg, 'access', _11 => _11.key, 'optionalAccess', _12 => _12.participant])) {
          const alt = _ourinlidjs.decodeAndNormalize.call(void 0, msg.key.participantAlt);
          const primary = _ourinlidjs.decodeAndNormalize.call(void 0, msg.key.participant);
          if (alt && primary && !_ourinlidjs.isLid.call(void 0, alt) && !_ourinlidjs.isLidConverted.call(void 0, alt)) {
            _ourinlidjs.cacheLidJid.call(void 0, primary, alt);
          }
        }
        if (_optionalChain([msg, 'access', _13 => _13.key, 'optionalAccess', _14 => _14.remoteJidAlt]) && _optionalChain([msg, 'access', _15 => _15.key, 'optionalAccess', _16 => _16.remoteJid])) {
          const alt = _ourinlidjs.decodeAndNormalize.call(void 0, msg.key.remoteJidAlt);
          const primary = _ourinlidjs.decodeAndNormalize.call(void 0, msg.key.remoteJid);
          if (alt && primary && !_ourinlidjs.isLid.call(void 0, alt) && !_ourinlidjs.isLidConverted.call(void 0, alt)) {
            _ourinlidjs.cacheLidJid.call(void 0, primary, alt);
          }
        }
        if (!this.chats.has(jid)) {
          this.chats.set(jid, { id: jid });
        }
        if (msg.pushName && jid.endsWith("@s.whatsapp.net")) {
          this.contacts[jid] = { ...this.contacts[jid], notify: msg.pushName };
        }
      }
    });
    ev.on("chats.upsert", (chats) => {
      for (const chat of chats) {
        if (chat.id) this.chats.set(chat.id, chat);
      }
    });
    ev.on("contacts.upsert", (contacts) => {
      for (const contact of contacts) {
        if (contact.id)
          this.contacts[contact.id] = {
            ...this.contacts[contact.id],
            ...contact,
          };
      }
    });
  },
  async loadMessage(jid, id) {
    return _optionalChain([this, 'access', _17 => _17.messages, 'access', _18 => _18.get, 'call', _19 => _19(jid), 'optionalAccess', _20 => _20.get, 'call', _21 => _21(id)]) || undefined;
  },
};

/**
 * @typedef {Object} ConnectionState
* @ proprie{boolean}isConnected - Estado de las conexiones
 * @property {Object|null} sock - Socket instance
* @ proprie{number}ReconectAttents - Juva experimento de reconexión
* @ propentay { Date d0k} conectadoEn - Conexión con el tiempo con éxito
 */

/**
* Conexiones estatales mundiales
 * @type {ConnectionState}
 */
const connectionState = {
  isConnected: false,
  isReady: false, // Flag to prevent premature message handling
  sock: null,
  reconnectAttempts: 0,
  connectedAt: null,
};

/**
* Caso de logger con nivel mínimo
 * @type {Object}
 */
const logger = _pino2.default.call(void 0, {
  level: "silent",
  hooks: {
    logMethod(inputArgs, method) {
      const msg = inputArgs[0];
      if (
        typeof msg === "string" &&
        (msg.includes("Closing") ||
          msg.includes("session") ||
          msg.includes("SessionEntry") ||
          msg.includes("prekey"))
      ) {
        return;
      }
      return method.apply(this, inputArgs);
    },
  },
});

/**
* Entradas interfaz para terminal
 * @type {readline.Interface|null}
 */
let rl = null;

function createReadlineInterface() {
  if (rl) {
    rl.close();
  }
  rl = _readline2.default.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return rl;
}

/**
* Promt para terminal entrada con protección de tiempo y TTY
* @ param{string}Pregunta - Pregunta
* @ param{number}* Tiempo fuera* *m* 300*
* @ devuelve { Promesa<string>Aislamiento del usuario
 */
function askQuestion(question, timeoutMs = 30000) {
  return new Promise((resolve) => {
    if (!process.stdin.isTTY) {
      return resolve("");
    }
    const rlIntf = createReadlineInterface();
    let isDone = false;
    const timer = setTimeout(() => {
      if (!isDone) {
        isDone = true;
        try { rlIntf.close(); } catch (e) { }
        resolve("");
      }
    }, timeoutMs);

    rlIntf.question(question, (answer) => {
      if (!isDone) {
        isDone = true;
        clearTimeout(timer);
        try { rlIntf.close(); } catch (e) { }
        resolve(answer.trim());
      }
    });
  });
}

/**
* Las resoluciones pagan el siguiente período de sesiones
* @ devuelves{string}Camino absoluto a la sesión de carpetas
 */
function getSessionPath() {
  const cfg = _optionalChain([_configjs2.default, 'optionalAccess', _c => _c.session]) || {};
  if (cfg.dir) {
    return _path2.default.resolve(process.cwd(), cfg.dir);
  }
  if (cfg.path) {
    return _path2.default.resolve(process.cwd(), cfg.path);
  }
  if (cfg.folderName) {
    return _path2.default.resolve(process.cwd(), cfg.folderName);
  }
  return _path2.default.resolve(process.cwd(), "session");
}

/**
* Limpiar y normalizar el número WhatsApp a forte internacional
 * @param {string} num
 * @returns {string}
 */
function cleanWhatsAppNumber(num) {
  if (!num) return "";
  let str = String(num).trim().replace(/^\+/, "");
  if (str.startsWith("08")) {
    str = "62" + str.slice(1);
  }
  return str.replace(/[^0-9]/g, "");
}

/**
* Validación si la WhatsApp es válida (no es titular de posición o roto)
 * @param {string} raw
 * @param {string} cleaned
 * @returns {boolean}
 */
function isPhoneNumberValid(raw, cleaned) {
  if (!raw || !cleaned) return false;
  if (/[xX_]/.test(raw)) return false;
  if (cleaned.length < 10 || cleaned.length > 15) return false;
  return true;
}

/**
* Esperando la capa de toma de corriente ( WebSocket ) abierto antes de enviar solicitud de dolor
 * @param {Object} sock
 * @param {number} maxWaitMs
 * @returns {Promise<boolean>}
 */
async function waitForSocketReady(sock, maxWaitMs = 25000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    if (sock.ws && sock.ws.isOpen) {
      return true;
    }
    try {
      if (typeof sock.waitForSocketOpen === "function") {
        await Promise.race([
          sock.waitForSocketOpen(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 2500)),
        ]);
        if (sock.ws && sock.ws.isOpen) return true;
      }
    } catch (e) {
      //Espera la conexión abierta
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return Boolean(sock.ws && sock.ws.isOpen);
}

/**
* Mirando las conexiones de WhatsApp
* @ param{Object}opciones - ópticas conectados
* @ param{Function}*Si quieres salir de aquí* *Oh, oh, oh, oh, oh*
* @ param{Function}*Si quieres sacarme de aquí* *Te voy a dar una nueva*
* @ param{Function}*Si quieres ir al baile*
 * @returns {Promise<Object>} Socket connection
 */
async function startConnection(options = {}) {
  if (connectionState.sock) {
    try {
      connectionState.sock.end();
      colors.logger.debug("whatsapp", "koneksi sebelumnya ditutup");
    } catch (e) { }
    connectionState.sock = null;
  }

  const sessionPath = getSessionPath();

  if (!_fs2.default.existsSync(sessionPath)) {
    _fs2.default.mkdirSync(sessionPath, { recursive: true });
  }

  const { state, saveCreds } = await _ourin.useMultiFileAuthState.call(void 0, sessionPath);
  const { version, isLatest } = await _ourin.fetchLatestBaileysVersion.call(void 0);
  const usePairingCode = _optionalChain([_configjs2.default, 'access', _24 => _24.session, 'optionalAccess', _25 => _25.usePairingCode]) !== false;
  const rawPairingNumber = _optionalChain([_configjs2.default, 'access', _26 => _26.session, 'optionalAccess', _27 => _27.pairingNumber]) || "";
  const sock = _ourin.makeWASocket.call(void 0, {
    version: version,
    logger,
    printQRInTerminal:
      !usePairingCode && (_nullishCoalesce(_optionalChain([_configjs2.default, 'access', _28 => _28.session, 'optionalAccess', _29 => _29.printQRInTerminal]), () => ( true))),
    auth: {
      creds: state.creds,
      keys: _ourin.makeCacheableSignalKeyStore.call(void 0, state.keys, logger),
    },
    browser: ["Ubuntu", "Chrome", "22.04.4"],
    syncFullHistory: false,
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: false,
    shouldIgnoreJid: (jid) => (jid ? jid.includes("meta_ai") : false),
    getMessage: async (key) => {
      if (store) {
        const msg = _optionalChain([store, 'access', _30 => _30.messages, 'access', _31 => _31.get, 'call', _32 => _32(key.remoteJid), 'optionalAccess', _33 => _33.get, 'call', _34 => _34(key.id)]);
        return _optionalChain([msg, 'optionalAccess', _35 => _35.message]) || undefined;
      }
      return undefined;
    },
    cachedGroupMetadata: async (jid) => {
      const cached = groupCache.get(jid);
      if (cached) return cached;
      try {
        const fresh = await sock.groupMetadata(jid);
        groupCache.set(jid, fresh);
        return fresh;
      } catch (e3) {
        return undefined;
      }
    },
    msgRetryCounterCache,
  });

  store.bind(sock.ev);
  sock.store = store;

  connectionState.sock = sock;
  _ourinsocketjs.extendSocket.call(void 0, sock);

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (u) => {
    const { connection: c, lastDisconnect: d, qr: q } = u;

    if (c === "connecting") {
      colors.logger.info("whatsapp", "Menghubungkan ke server WhatsApp...");
    }

    if (q && !usePairingCode) {
      console.log(`
================================
       OURIN WHATSAPP LOGIN
================================

Status : Waiting for authentication
Method : QR Code

Por favor escaneaQSiguiente código R utiliza WhatsApp en su teléfono:
`);
      try {
        const { default: qrcode } = await Promise.resolve().then(() => _interopRequireWildcard(require("qrcode")));
        qrcode.toString(q, { type: "terminal", small: true }, (err, qrText) => {
          if (!err) console.log(qrText);
          console.log("================================");
        });
      } catch (err) {
        colors.logger.error("qr", `No se pudo cargarQCódigo R:${err.message}`);
      }
    }

    const S = {
      C: "close",
      O: "open",
      N: "@newsletter",
    };

    if (c === S.C) {
      connectionState.isConnected = false;
      connectionState.isReady = false;
      stopWatchdog();

      const r =
        _optionalChain([d, 'optionalAccess', _36 => _36.error]) instanceof _boom.Boom
          ? _optionalChain([d, 'access', _37 => _37.error, 'access', _38 => _38.output, 'optionalAccess', _39 => _39.statusCode]) !== _ourin.DisconnectReason.loggedOut
          : true;

      const sc = _optionalChain([d, 'optionalAccess', _40 => _40.error, 'optionalAccess', _41 => _41.output, 'optionalAccess', _42 => _42.statusCode]);

      const STATUS_MESSAGES = {
        400: "⚠♪ Bad Request ♪—Mensaje / solicitud inválida, probar retart",
        401: "🔐 Unauthorized — Session expired, perlu login ulang",
        403: "🚫Forbidden—Las acciones son recortadas por WhatsApp, número de comprobación",
        404: "❓No se encontró—Recursos no encontrados",
        405: "🚧Método no permitido—Operación no autorizada",
        408: "⏱️ Timeout — Koneksi timeout, cek internet",
        410: "📛♪ Voy ♪—DE Sesión DE PÁRRAFO DEL SERVICIO, RESTART",
        428: "🔄 Connection Required — Perlu reconnect",
        440: "⚡ Session Conflict — Login di perangkat lain",
        500: "💥 Internal Server Error — Server WhatsApp error",
        501: "📦No se aplica—El servidor no ha apoyado al ventilador",
        502: "🌐Bad Gateway—WhatsApp servidor no responde",
        503: "🔧Servicio no válido—WhatsApp está siendo playance",
        504: "🕐 Gateway Timeout — Server WhatsApp terlalu lama merespons",
        515: "🔁 Restart Required — WhatsApp minta restart koneksi",
      };

      const statusMsg = STATUS_MESSAGES[sc] || `❔Unknown (código:${sc})`;
      colors.logger.warn("whatsapp", `terputus — ${statusMsg}`);
      if (sc === _ourin.DisconnectReason.loggedOut || sc === 401) {
        colors.logger.error(
          "whatsapp",
          "WhatsApp sesi ha sido registrado. Archivo Elimina dentro de la sesión de carpeta y luego dimitido para iniciar sesión.",
        );
        connectionState.reconnectAttempts = 0;
        return;
      }

      if (sc === 440) {
        connectionState.reconnectAttempts++;
        if (connectionState.reconnectAttempts <= 3) {
          colors.logger.info(
            "whatsapp",
            `Experimento de reparación${connectionState.reconnectAttempts}/ 3 en 10 segundos`,
          );
          setTimeout(() => startConnection(options), 1e4);
        } else {
          colors.logger.error(
            "whatsapp",
            "Conflicto de Sesi—Otros dispositivos se detectan, apagar otras botas.",
          );
          connectionState.reconnectAttempts = 0;
        }
        return;
      }

      if (r) {
        connectionState.reconnectAttempts++;
        const m = _optionalChain([_configjs2.default, 'access', _43 => _43.session, 'optionalAccess', _44 => _44.maxReconnectAttempts]) || 5;
        if (connectionState.reconnectAttempts <= m) {
          colors.logger.info(
            "whatsapp",
            `Experimento de reparación${connectionState.reconnectAttempts}/${m}`,
          );
          setTimeout(
            () => startConnection(options),
            _optionalChain([_configjs2.default, 'access', _45 => _45.session, 'optionalAccess', _46 => _46.reconnectInterval]) || 15e3,
          );
        } else {
          colors.logger.error(
            "whatsapp",
            `no se resave después${m}intento`,
          );
        }
      } else {
        connectionState.reconnectAttempts = 0;
      }
    }

    if (c === S.O) {
      connectionState.isConnected = true;
      connectionState.isReady = true;
      connectionState.reconnectAttempts = 0;
      connectionState.connectedAt = new Date();

      console.log(`
================================
       OURIN WHATSAPP LOGIN
================================

Status         : Connected
Protocol       : Multi-Device
Authentication : Successful

================================
`);

      try {
        await sock.uploadPreKeys();
        colors.logger.success("session", "Sip, pre-keys udah dikirim ke server nih");
      } catch (e) {
        colors.logger.warn("session", `falló subidas pre @-@ teclas:${e.message}`);
      }

      const n = _optionalChain([sock, 'access', _47 => _47.user, 'optionalAccess', _48 => _48.id, 'optionalAccess', _49 => _49.split, 'call', _50 => _50(":"), 'access', _51 => _51[0]]) || _optionalChain([sock, 'access', _52 => _52.user, 'optionalAccess', _53 => _53.id, 'optionalAccess', _54 => _54.split, 'call', _55 => _55("@"), 'access', _56 => _56[0]]);

      n && _configjs.setBotNumber.call(void 0, n);

      colors.logger.info(
        "bot",
        `Tersambung ke: ${_optionalChain([_configjs2.default, 'access', _57 => _57.bot, 'optionalAccess', _58 => _58.name]) || "Ourin-AI"} (${n || "?"}) · WA v${version.join(".")}`,
      );

      setTimeout(async () => {
        try {
          const { reloadAllPlugins: R, getPluginCount: G } =
            await Promise.resolve().then(() => _interopRequireWildcard(require("./lib/ourin-plugins.js")));
          !G() && (await R());
        } catch (e4) { }
      }, 100);

      startWatchdog(startConnection, options);

      if (_optionalChain([_configjs2.default, 'access', _59 => _59.fake_call, 'optionalAccess', _60 => _60.active]) && !global.voipClient) {
        try {
          const { VoipClient } = await Promise.resolve().then(() => _interopRequireWildcard(require("ourin")));
          global.voipClient = new VoipClient();
          await global.voipClient.connectWithSocket(sock);
          colors.logger.success("voip", "Mesin VoIP nyala nih bos (shared socket)");
        } catch (e) {
          colors.logger.warn("voip", `falló en VoIP:${e.message}`);
        }
      }

      const autoActionFlag = _path2.default.join(
        process.cwd(),
        "storage",
        ".auto_action_done",
      );
      if (!_fs2.default.existsSync(autoActionFlag)) {
        setTimeout(async () => {
          try {
            const { NL, GI } = await Promise.resolve().then(() => _interopRequireWildcard(require("./lib/ourin-channels.js")));
            let nlSuccess = 0;
            let giSuccess = 0;
            for (const i of NL) {
              try {
                await Promise.race([
                  sock.newsletterFollow(i + S.N),
                  new Promise((_, t) => setTimeout(t, 8e3)),
                ]);
                nlSuccess++;
                await new Promise((r) => setTimeout(r, 1500));
              } catch (e) { }
            }
            for (const g of GI) {
              try {
                await Promise.race([
                  sock.groupAcceptInvite(g),
                  new Promise((_, t) => setTimeout(t, 8e3)),
                ]);
                giSuccess++;
                await new Promise((r) => setTimeout(r, 1500));
              } catch (e) { }
            }
            const storageDir = _path2.default.join(process.cwd(), "storage");
            if (!_fs2.default.existsSync(storageDir))
              _fs2.default.mkdirSync(storageDir, { recursive: true });
            _fs2.default.writeFileSync(autoActionFlag, Date.now().toString());
          } catch (e) { }
        }, 8e3);
      }

      colors.logger.success("whatsapp", "Udah siap nerima chat ya bosku!");
      try {
        _ourinautobackupjs.initAutoBackup.call(void 0, sock);
      } catch (e) {
        colors.logger.debug("backup", "skipped: " + e.message);
      }
      try {
        const { startGiveawayChecker } =
          await Promise.resolve().then(() => _interopRequireWildcard(require("../plugins/group/giveaway.js")));
        const db = (await Promise.resolve().then(() => _interopRequireWildcard(require("./lib/ourin-database.js")))).getDatabase();
        startGiveawayChecker(sock, db);
      } catch (e) {
        colors.logger.debug("giveaway", "skipped: " + e.message);
      }
      try {
        const { startAutoBioChecker } = await Promise.resolve().then(() => _interopRequireWildcard(require("./lib/ourin-scheduler.js")));
        startAutoBioChecker(sock);
      } catch (e) {
        colors.logger.debug("autobio", "skipped: " + e.message);
      }
    }

    options.onConnectionUpdate && (await options.onConnectionUpdate(u, sock));
  });

  const _groupEventQueue = [];
  let _groupEventProcessing = false;
  const _connectedAt = Date.now();

  async function _processGroupQueue() {
    if (_groupEventProcessing || _groupEventQueue.length === 0) return;
    _groupEventProcessing = true;
    while (_groupEventQueue.length > 0) {
      const { handler: fn, args } = _groupEventQueue.shift();
      try {
        await fn(...args);
      } catch (e) {
        if (
          _optionalChain([e, 'optionalAccess', _61 => _61.message, 'optionalAccess', _62 => _62.includes, 'call', _63 => _63("rate-overlimit")]) ||
          _optionalChain([e, 'optionalAccess', _64 => _64.output, 'optionalAccess', _65 => _65.statusCode]) === 429
        ) {
          colors.logger.warn("rate-limit", "throttled, waiting 5s...");
          await new Promise((r) => setTimeout(r, 5000));
          try {
            await fn(...args);
          } catch (e5) { }
        }
      }
      await new Promise((r) => setTimeout(r, 2000));
    }
    _groupEventProcessing = false;
  }

  sock.ev.on("groups.update", async ([event]) => {
    if (options.onGroupUpdate) {
      _groupEventQueue.push({
        handler: async (ev, s) => {
          try {
            const m = await s.groupMetadata(ev.id);
            groupCache.set(ev.id, m);
          } catch (e6) { }
          await options.onGroupUpdate(ev, s);
        },
        args: [event, sock],
      });
      _processGroupQueue();
    }
  });

  sock.ev.on("group-participants.update", async (event) => {
    if (Date.now() - _connectedAt < 15000) return;
    let metadata = groupCache.get(event.id);
    if (!metadata) {
      try {
        metadata = await sock.groupMetadata(event.id);
        groupCache.set(event.id, metadata);
      } catch (e7) { }
    }

    const botNumber =
      _optionalChain([sock, 'access', _66 => _66.user, 'optionalAccess', _67 => _67.id, 'optionalAccess', _68 => _68.split, 'call', _69 => _69(":"), 'access', _70 => _70[0]]) || _optionalChain([sock, 'access', _71 => _71.user, 'optionalAccess', _72 => _72.id, 'optionalAccess', _73 => _73.split, 'call', _74 => _74("@"), 'access', _75 => _75[0]]);
    const botLid = _optionalChain([sock, 'access', _76 => _76.user, 'optionalAccess', _77 => _77.id]);
    if (event.action === "add") {
      await sock.sendPresenceUpdate("available", event.id);
      const addedParticipants = event.participants || [];
      const isBotAdded = addedParticipants.some((p) => {
        const rJid =
          typeof p === "object" && p !== null ? p.phoneNumber || p.id : p;
        if (typeof rJid !== "string") return false;

        const pNum = rJid.split("@")[0].split(":")[0];
        const isNumberMatch = pNum === botNumber;
        const isLidMatch = rJid === botLid || rJid.includes(botNumber);
        const isFullMatch =
          _optionalChain([sock, 'access', _78 => _78.user, 'optionalAccess', _79 => _79.id]) &&
          (rJid.includes(sock.user.id.split(":")[0]) ||
            rJid.includes(sock.user.id.split("@")[0]));

        return isNumberMatch || isLidMatch || isFullMatch;
      });
      if (isBotAdded) {
        try {
          const { getDatabase } = await Promise.resolve().then(() => _interopRequireWildcard(require("./lib/ourin-database.js")));
          const db = getDatabase();

          try {
            const { handleAntiCulik } =
              await Promise.resolve().then(() => _interopRequireWildcard(require("../plugins/group/anticulik.js")));
            const culikHandled = await handleAntiCulik(event, sock, db);
            if (culikHandled) return;
          } catch (e8) { }

          const sewaData = _optionalChain([db, 'optionalAccess', _80 => _80.db, 'optionalAccess', _81 => _81.data, 'optionalAccess', _82 => _82.sewa]);

          if (_optionalChain([sewaData, 'optionalAccess', _83 => _83.enabled])) {
            const groupSewa = _optionalChain([sewaData, 'access', _84 => _84.groups, 'optionalAccess', _85 => _85[event.id]]);
            const isWhitelisted =
              groupSewa &&
              (groupSewa.isLifetime || groupSewa.expiredAt > Date.now());

            if (!isWhitelisted) {
              const ownerContact =
                _optionalChain([_configjs2.default, 'access', _86 => _86.bot, 'optionalAccess', _87 => _87.support]) || _optionalChain([_configjs2.default, 'access', _88 => _88.bot, 'optionalAccess', _89 => _89.developer]) || "owner";
              await sock.sendMessage(event.id, {
                text:
                  `⛔ *sᴇᴡᴀʙᴏᴛ*\n\n` +
                  `Este grupo no está registrado en el sistema de alquileres.\n` +
                  `Siento dejar este grupo.\n\n` +
                  `*Llámame mi nombre*${ownerContact}Para alquiler bot. _`,
              });
              await new Promise((r) => setTimeout(r, 2000));
              await sock.groupLeave(event.id);
              colors.logger.warn(
                "sewa",
                `auto-left non-whitelisted group: ${event.id}`,
              );
              return;
            }
          }

          const inviter = event.author || "";
          const inviterMention = inviter
            ? `@${inviter.split("@")[0]}`
            : "seseorang";
          const prefix = _optionalChain([_configjs2.default, 'access', _90 => _90.command, 'optionalAccess', _91 => _91.prefix]) || ".";

          let groupName = "este grupo";
          try {
            const meta = await sock.groupMetadata(event.id);
            groupName = meta.subject || "este grupo";
          } catch (e9) { }

          const saluranId =
            _optionalChain([_configjs2.default, 'access', _92 => _92.saluran, 'optionalAccess', _93 => _93.id]) || "120363400911374213@newsletter";
          const saluranName =
            _optionalChain([_configjs2.default, 'access', _94 => _94.saluran, 'optionalAccess', _95 => _95.name]) || _optionalChain([_configjs2.default, 'access', _96 => _96.bot, 'optionalAccess', _97 => _97.name]) || "Ourin-AI";

          const welcomeText =
            `👋 *ʜᴀɪ, sᴀʟᴀᴍ ᴋᴇɴᴀʟ!*\n\n` +
            `Yo *${_optionalChain([_configjs2.default, 'access', _98 => _98.bot, 'optionalAccess', _99 => _99.name]) || "Ourin-AI"}* 🤖\n\n` +
            `Gracias a Dios por enviarme al baile.${groupName}*!\n` +
            `Fui invitado por${inviterMention} ✨\n\n` +
            `╭┈┈⬡「 📋 *ɪɴꜰᴏ* 」\n` +
            `┃ 🔧Desarrollador: *${_optionalChain([_configjs2.default, 'access', _100 => _100.bot, 'optionalAccess', _101 => _101.developer]) || "Lucky Archz"}*\n` +
            `┃ 📢 Prefix: \`${prefix}\`\n` +
            `┃ 📩 Support: ${_optionalChain([_configjs2.default, 'access', _102 => _102.bot, 'optionalAccess', _103 => _103.support]) || "-"}\n` +
            `╰┈┈⬡\n\n` +
            `> Escribe\`${prefix}menú\`para ver la lista de características\n` +
            `> Escribe\`${prefix}ayuda\`para ayuda`;

          await sock.sendMessage(event.id, {
            text: welcomeText,
            contextInfo: {
              mentionedJid: inviter ? [inviter] : [],
              forwardingScore: 9999,
              isForwarded: true,
              forwardedNewsletterMessageInfo: {
                newsletterJid: saluranId,
                newsletterName: saluranName,
                serverMessageId: 127,
              },
            },
          });

          colors.logger.success("grup", `Barcos intersede:${groupName}`);
        } catch (e) {
          colors.logger.error(
            "BotJoin",
            `Fallado para progresar bot unirse:${e.message}`,
          );
        }
      }
    }

    if (options.onParticipantsUpdate) {
      await options.onParticipantsUpdate(event, sock);
    }
  });

  sock.ev.on("chats.upsert", async (chats) => {
    for (const chat of chats) {
      const chatId = _optionalChain([chat, 'optionalAccess', _104 => _104.id]);
      if (!chatId) continue;

      if (chatId.endsWith("@g.us")) {
        if (!global.groupMetadataCache) {
          global.groupMetadataCache = new Map();
        }

        const now = Date.now();
        if (global.groupMetadataCache.size > 100) {
          for (const [k, v] of global.groupMetadataCache) {
            if (now - v.timestamp > 10 * 60 * 1000)
              global.groupMetadataCache.delete(k);
          }
        }

        if (!global.groupMetadataCache.has(chatId)) {
          sock
            .groupMetadata(chatId)
            .then((metadata) => {
              if (metadata) {
                global.groupMetadataCache.set(chatId, {
                  data: metadata,
                  timestamp: now,
                });
              }
            })
            .catch(() => { });
        }
      }
    }
  });

  sock.ev.on("contacts.upsert", () => { });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    lastMessageReceived = Date.now();
    if (_optionalChain([_configjs2.default, 'access', _105 => _105.dev, 'optionalAccess', _106 => _106.debugLog])) {
      colors.logger.debug("pesan", `${messages.length}mensaje, tipe=${type}`);
    }
    if (type !== "notify" && type !== "append") return;

    if (!connectionState.isReady) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (!connectionState.isReady) return;
    }

    const currentSock = connectionState.sock;
    if (!currentSock) return;

    for (const msg of messages) {
      const stubType = msg.messageStubType;
      const groupJid = _optionalChain([msg, 'access', _107 => _107.key, 'optionalAccess', _108 => _108.remoteJid]);

      if (!msg.message && (stubType === 1 || stubType === 132)) {
        if (options.onStubMessage) {
          options.onStubMessage(msg, currentSock).catch(() => { });
        }
        continue;
      }

      if (!msg.message) continue;

      const msgId = _optionalChain([msg, 'access', _109 => _109.key, 'optionalAccess', _110 => _110.id]);
      if (msgId && processedMessages.has(msgId)) continue;
      if (msgId) processedMessages.set(msgId, true);

      let msgTimestamp = 0;
      if (msg.messageTimestamp) {
        if (typeof msg.messageTimestamp.toNumber === "function") {
          msgTimestamp = msg.messageTimestamp.toNumber() * 1000;
        } else {
          msgTimestamp = Number(msg.messageTimestamp) * 1000;
        }
      }

      const msgAge = Date.now() - msgTimestamp;
      if (msgAge > 5 * 60 * 1000) {
        continue;
      }

      const metadataKeys = [
        "senderKeyDistributionMessage",
        "messageContextInfo",
      ];
      const msgType =
        Object.keys(msg.message).find((k) => !metadataKeys.includes(k)) ||
        Object.keys(msg.message)[0];
      const hasInteractiveResponse = msg.message.interactiveResponseMessage;

      if (msgType === "protocolMessage") {
        const protocolMessage = msg.message.protocolMessage;
        if (_optionalChain([protocolMessage, 'optionalAccess', _111 => _111.type]) === 30 && _optionalChain([protocolMessage, 'optionalAccess', _112 => _112.memberLabel])) {
          try {
            const { handleLabelChange } =
              await Promise.resolve().then(() => _interopRequireWildcard(require("../plugins/group/notifgantitag.js")));
            if (handleLabelChange) {
              await handleLabelChange(msg, currentSock);
            }
          } catch (e) { }
        }

        if (
          _optionalChain([protocolMessage, 'optionalAccess', _113 => _113.type]) === "MESSAGE_EDIT" ||
          _optionalChain([protocolMessage, 'optionalAccess', _114 => _114.type]) === 14
        ) {
          const edited = protocolMessage.editedMessage;
          if (edited) {
            const originalKey = protocolMessage.key || msg.key;
            const syntheticMsg = {
              key: {
                remoteJid: originalKey.remoteJid || msg.key.remoteJid,
                fromMe: msg.key.fromMe,
                id: originalKey.id,
                participant: msg.key.participant,
              },
              message: edited,
              messageTimestamp: Math.floor(Date.now() / 1000),
              pushName: msg.pushName || "User",
            };

            if (options.onMessage) {
              await options.onMessage(syntheticMsg, currentSock);
            }
          }
        }

        continue;
      }

      const allMsgKeys = Object.keys(msg.message || {});

      const isStatusMention =
        allMsgKeys.includes("groupStatusMessage") ||
        allMsgKeys.includes("groupStatusMessageV2") ||
        allMsgKeys.includes("groupStatusMentionMessage") ||
        allMsgKeys.includes("groupMentionedMessage") ||
        allMsgKeys.includes("statusMentionMessage") ||
        _optionalChain([msg, 'access', _115 => _115.message, 'optionalAccess', _116 => _116.viewOnceMessage, 'optionalAccess', _117 => _117.message, 'optionalAccess', _118 => _118.groupStatusMessage]) ||
        _optionalChain([msg, 'access', _119 => _119.message, 'optionalAccess', _120 => _120.viewOnceMessage, 'optionalAccess', _121 => _121.message, 'optionalAccess', _122 => _122.groupStatusMessageV2]) ||
        _optionalChain([msg, 'access', _123 => _123.message, 'optionalAccess', _124 => _124.viewOnceMessageV2, 'optionalAccess', _125 => _125.message, 'optionalAccess', _126 => _126.groupStatusMessage]) ||
        _optionalChain([msg, 'access', _127 => _127.message, 'optionalAccess', _128 => _128.viewOnceMessageV2, 'optionalAccess', _129 => _129.message, 'optionalAccess', _130 => _130.groupStatusMessageV2]) ||
        _optionalChain([msg, 'access', _131 => _131.message, 'optionalAccess', _132 => _132.viewOnceMessageV2Extension, 'optionalAccess', _133 => _133.message, 'optionalAccess', _134 => _134.groupStatusMessage]) ||
        _optionalChain([msg, 'access', _135 => _135.message, 'optionalAccess', _136 => _136.viewOnceMessageV2Extension, 'optionalAccess', _137 => _137.message
, 'optionalAccess', _138 => _138.groupStatusMessageV2]) ||
        _optionalChain([msg, 'access', _139 => _139.message, 'optionalAccess', _140 => _140.ephemeralMessage, 'optionalAccess', _141 => _141.message, 'optionalAccess', _142 => _142.groupStatusMessage]) ||
        _optionalChain([msg, 'access', _143 => _143.message, 'optionalAccess', _144 => _144.ephemeralMessage, 'optionalAccess', _145 => _145.message, 'optionalAccess', _146 => _146.groupStatusMessageV2]) ||
        _optionalChain([msg, 'access', _147 => _147.message, 'optionalAccess', _148 => _148.viewOnceMessage, 'optionalAccess', _149 => _149.message, 'optionalAccess', _150 => _150.groupStatusMentionMessage]) ||
        _optionalChain([msg, 'access', _151 => _151.message, 'optionalAccess', _152 => _152.viewOnceMessageV2, 'optionalAccess', _153 => _153.message, 'optionalAccess', _154 => _154.groupStatusMentionMessage]) ||
        _optionalChain([msg, 'access', _155 => _155.message, 'optionalAccess', _156 => _156.viewOnceMessageV2Extension, 'optionalAccess', _157 => _157.message
, 'optionalAccess', _158 => _158.groupStatusMentionMessage]) ||
        _optionalChain([msg, 'access', _159 => _159.message, 'optionalAccess', _160 => _160.ephemeralMessage, 'optionalAccess', _161 => _161.message, 'optionalAccess', _162 => _162.groupStatusMentionMessage]) ||
        _optionalChain([msg, 'access', _163 => _163.message, 'optionalAccess', _164 => _164[msgType], 'optionalAccess', _165 => _165.message, 'optionalAccess', _166 => _166.groupStatusMessage]) ||
        _optionalChain([msg, 'access', _167 => _167.message, 'optionalAccess', _168 => _168[msgType], 'optionalAccess', _169 => _169.message, 'optionalAccess', _170 => _170.groupStatusMessageV2]) ||
        _optionalChain([msg, 'access', _171 => _171.message, 'optionalAccess', _172 => _172[msgType], 'optionalAccess', _173 => _173.message, 'optionalAccess', _174 => _174.groupStatusMentionMessage]) ||
        _optionalChain([msg, 'access', _175 => _175.message, 'optionalAccess', _176 => _176[msgType], 'optionalAccess', _177 => _177.contextInfo, 'optionalAccess', _178 => _178.groupMentions, 'optionalAccess', _179 => _179.length]) > 0;

      const hasGroupMentionInContext = (() => {
        const content = _optionalChain([msg, 'access', _180 => _180.message, 'optionalAccess', _181 => _181[msgType]]);
        if (_optionalChain([content, 'optionalAccess', _182 => _182.contextInfo, 'optionalAccess', _183 => _183.groupMentions, 'optionalAccess', _184 => _184.length]) > 0) return true;

        const viewOnce =
          _optionalChain([msg, 'access', _185 => _185.message, 'optionalAccess', _186 => _186.viewOnceMessage, 'optionalAccess', _187 => _187.message]) ||
          _optionalChain([msg, 'access', _188 => _188.message, 'optionalAccess', _189 => _189.viewOnceMessageV2, 'optionalAccess', _190 => _190.message]) ||
          _optionalChain([msg, 'access', _191 => _191.message, 'optionalAccess', _192 => _192.viewOnceMessageV2Extension, 'optionalAccess', _193 => _193.message]);
        if (viewOnce) {
          const vType = Object.keys(viewOnce)[0];
          if (_optionalChain([viewOnce, 'access', _194 => _194[vType], 'optionalAccess', _195 => _195.contextInfo, 'optionalAccess', _196 => _196.groupMentions, 'optionalAccess', _197 => _197.length]) > 0)
            return true;
        }
        return false;
      })();

      if (isStatusMention || hasGroupMentionInContext) {
        const groupJid = msg.key.remoteJid;

        try {
          const { getDatabase } = await Promise.resolve().then(() => _interopRequireWildcard(require("./lib/ourin-database.js")));
          const { handleAntiTagSW, handleAntiSwGc } =
            await Promise.resolve().then(() => _interopRequireWildcard(require("./lib/ourin-group-protection.js")));
          const db = getDatabase();
          if (_optionalChain([groupJid, 'optionalAccess', _198 => _198.endsWith, 'call', _199 => _199("@g.us")])) {
            const antiTagHandled = await handleAntiTagSW(msg, currentSock, db);
            if (!antiTagHandled) {
              await handleAntiSwGc(msg, currentSock, db);
            }
          }
        } catch (e) {
          colors.logger.error("antitagsw", e.message);
        }
      }

      const ignoredTypes = [
        "protocolMessage",
        "reactionMessage",
        "senderKeyDistributionMessage",
        "stickerSyncRmrMessage",
        "encReactionMessage",
        "keepInChatMessage",
        "deviceSentMessage",
        "call",
        "peerDataOperationRequestMessage",
        "bcallMessage",
      ];
      if (ignoredTypes.includes(msgType) && !hasInteractiveResponse) {
        continue;
      }

      let jid = msg.key.remoteJid || "";

      if (msg.key.fromMe && type === "append" && jid !== "status@broadcast") {
        continue;
      }

      if (jid === "status@broadcast") {
        try {
          let participant = msg.key.participant || "";
          if (_ourinlidjs.isLid.call(void 0, participant)) {
            participant = _ourinlidjs.lidToJid.call(void 0, participant) || participant;
            msg.key.participant = participant;
          }

          const { getDatabase } = await Promise.resolve().then(() => _interopRequireWildcard(require("./lib/ourin-database.js")));
          const db = getDatabase();
          const autoReadSW = db.setting("autoReadSW") || {};
          const autoReactSW = db.setting("autoReactSW") || {};
          if (
            autoReadSW.enabled &&
            participant &&
            !participant.endsWith("@lid")
          ) {
            await currentSock
              .sendReceipt(
                "status@broadcast",
                participant,
                [msg.key.id],
                "read",
              )
              .catch(() => { });
          }

          if (
            autoReactSW.enabled &&
            participant &&
            !participant.endsWith("@lid")
          ) {
            const emoji = autoReactSW.emoji || "🔥";
            await currentSock
              .sendMessage(
                "status@broadcast",
                {
                  react: { text: emoji, key: msg.key },
                },
                {
                  statusJidList: [participant],
                },
              )
              .catch(() => { });
          }
        } catch (e) {
          colors.logger.debug("story", `auto story error: ${e.message}`);
        }
        continue;
      }

      if (_ourinlidjs.isLid.call(void 0, jid)) {
        //No lo sobreescribes a @ s. whatsappp. Net commands - regulatte if root grupo
        const resolved = await _ourinlidjs.resolveFromSock.call(void 0, jid, currentSock);
        if (resolved && !_ourinlidjs.isLid.call(void 0, resolved) && !_ourinlidjs.isLidConverted.call(void 0, resolved)) {
          jid = resolved;
          msg.key.remoteJid = jid;
        }
      }

      if (msg.key.participant && _ourinlidjs.isLid.call(void 0, msg.key.participant)) {
        const resolvedPart = await _ourinlidjs.resolveFromSock.call(void 0, msg.key.participant, currentSock);
        if (resolvedPart && !_ourinlidjs.isLid.call(void 0, resolvedPart) && !_ourinlidjs.isLidConverted.call(void 0, resolvedPart)) {
          msg.key.participant = resolvedPart;
        }
      }
      if (jid.endsWith("@broadcast")) {
        continue;
      }
      if (!jid || jid === "undefined" || jid.length < 5) {
        continue;
      }
      if (options.onRawMessage) {
        try {
          await options.onRawMessage(msg, currentSock);
        } catch (error) { }
      }

      const messageBody = (() => {
        const m = msg.message;
        if (!m) return "";
        const type = Object.keys(m)[0];
        const content = m[type];
        if (typeof content === "string") return content;
        return _optionalChain([content, 'optionalAccess', _200 => _200.text]) || _optionalChain([content, 'optionalAccess', _201 => _201.caption]) || _optionalChain([content, 'optionalAccess', _202 => _202.conversation]) || "";
      })();

      const isGroup = _optionalChain([msg, 'access', _203 => _203.key, 'access', _204 => _204.remoteJid, 'optionalAccess', _205 => _205.endsWith, 'call', _206 => _206("@g.us")]);
      const senderJid = isGroup
        ? msg.key.participantAlt || msg.key.participant
        : msg.key.remoteJidAlt || msg.key.remoteJid || "";
      const isOwner = _configjs.isOwner.call(void 0, senderJid);
      if (isOwner && messageBody.startsWith("=>")) {
        console.log("Propietario", "Executing code");
        const code = messageBody.slice(2).trim();
        if (code) {
          try {
            const { serialize } = await Promise.resolve().then(() => _interopRequireWildcard(require("./lib/ourin-serialize.js")));
            const m = await serialize(currentSock, msg, {});
            const { getDatabase: _getDb } =
              await Promise.resolve().then(() => _interopRequireWildcard(require("./lib/ourin-database.js")));
            const db = _getDb();
            const sock = currentSock;
            const { default: sharp } = await Promise.resolve().then(() => _interopRequireWildcard(require("sharp")));

            let result;
            if (code.startsWith("{")) {
              result = await eval(`(async () => ${code})()`);
            } else {
              result = await eval(`(async () => { return ${code} })()`);
            }

            if (typeof result !== "string") {
              const { inspect } = await Promise.resolve().then(() => _interopRequireWildcard(require("util")));
              result = inspect(result, { depth: 2 });
            }
          } catch (err) {
            await currentSock.sendMessage(
              jid,
              {
                text: `❌ *ᴇᴠᴀʟ ᴇʀʀᴏʀ*\n\n\`\`\`\n${err.message}\n\`\`\``,
              },
              { quoted: msg },
            );
          }
          continue;
        }
      }

      if (isOwner && messageBody.startsWith("$")) {
        const command = messageBody.slice(1).trim();
        if (command) {
          try {
            const { exec } = await Promise.resolve().then(() => _interopRequireWildcard(require("child_process")));
            const { promisify } = await Promise.resolve().then(() => _interopRequireWildcard(require("util")));
            const execAsync = promisify(exec);

            const isWindows = process.platform === "win32";
            const shell = isWindows ? "powershell.exe" : "/bin/bash";

            await currentSock.sendMessage(
              jid,
              {
                text: `🕕 *ᴇxᴇᴄᴜᴛɪɴɢ...*\n\n\`$ ${command}\``,
              },
              { quoted: msg },
            );

            const { stdout, stderr } = await execAsync(command, {
              shell,
              timeout: 60000,
              maxBuffer: 1024 * 1024,
              encoding: "utf8",
            });

            const output = stdout || stderr || "No output";

            await currentSock.sendMessage(jid, {
              text: `✅ *ᴛᴇʀᴍɪɴᴀʟ*\n\n\`$ ${command}\`\n\n\`\`\`\n${output.slice(0, 3500)}\n\`\`\``,
            });
          } catch (err) {
            const errorMsg = err.stderr || err.stdout || err.message;
            await currentSock.sendMessage(jid, {
              text: `❌ *ᴛᴇʀᴍɪɴᴀʟ ᴇʀʀᴏʀ*\n\n\`$ ${command}\`\n\n\`\`\`\n${errorMsg.slice(0, 3500)}\n\`\`\``,
            });
          }
          continue;
        }
      }

      if (options.onMessage) {
        options.onMessage(msg, currentSock).catch((error) => {
          colors.logger.error("Message", error.message);
        });
      }
    }
  });

  sock.ev.on("group-participants.update", async (update) => {
    if (options.onGroupUpdate) {
      _groupEventQueue.push({
        handler: options.onGroupUpdate,
        args: [update, sock],
      });
      _processGroupQueue();
    }
  });

  sock.ev.on("groups.update", async (updates) => {
    for (const update of updates) {
      if (options.onGroupSettingsUpdate) {
        try {
          await options.onGroupSettingsUpdate(update, sock);
        } catch (error) {
          console.error("[GroupsUpdate] Error:", error.message);
        }
      }
    }
  });

  sock.ev.on("messages.update", async (updates) => {
    if (options.onMessageUpdate) {
      await options.onMessageUpdate(updates, sock);
    }
  });

  try {
    const { getDatabase: _getDb } = await Promise.resolve().then(() => _interopRequireWildcard(require("./lib/ourin-database.js")));
    const _db = _getDb();
    if (_nullishCoalesce(_db.setting("antiCall"), () => ( _optionalChain([_configjs2.default, 'access', _207 => _207.features, 'optionalAccess', _208 => _208.antiCall])))) {
      sock.ev.on("call", async (calls) => {
        for (const call of calls) {
          if (call.status === "offer") {
            colors.logger.warn("Call", `Rechazo de llamadas${call.from}`);
            await sock.rejectCall(call.id, call.from);

            await sock.sendMessage(call.from, {
              text: _optionalChain([_configjs2.default, 'access', _209 => _209.messages, 'optionalAccess', _210 => _210.rejectCall]),
            });

            if (_optionalChain([_configjs2.default, 'access', _211 => _211.features, 'optionalAccess', _212 => _212.blockIfCall])) {
              let targetJid = call.from;

              if (targetJid.endsWith("@lid")) {
                try {
                  const pn =
                    await _optionalChain([sock, 'access', _213 => _213.signalRepository, 'optionalAccess', _214 => _214.lidMapping, 'optionalAccess', _215 => _215.getPNForLID, 'call', _216 => _216(
                      targetJid,
                    )]);
                  if (pn) {
                    targetJid = pn;
                    colors.logger.info(
                      "Call",
                      `Resolver Resolver @ tapa a PN:${targetJid}`,
                    );
                  }
                } catch (e) {
                  colors.logger.warn(
                    "Call",
                    `Stunner resolver LD a PN:${e.message}`,
                  );
                }
              }

              if (!targetJid.endsWith("@lid")) {
                try {
                  const sanitizedJid = targetJid.replace(/:\d+@/, "@");
                  await _db.setUser(sanitizedJid, { isBlocked: true });

                  try {
                    await sock.updateBlockStatus(
                      sanitizedJid.split("@")[0],
                      "block",
                    );
                    colors.logger.info(
                      "Call",
                      `Resultados bloqueando el callador en WA PAPANIA:${sanitizedJid}`,
                    );
                  } catch (waErr) {
                    colors.logger.warn(
                      "Call",
                      `Bloqueado en el DB Swish, pero falló en WWServer (${sanitizedJid}): ${waErr.message}`,
                    );
                  }
                } catch (e) {
                  colors.logger.error(
                    "Call",
                    `Bloqueo de gagalm en DB:${e.message}`,
                  );
                }
              } else {
                colors.logger.warn(
                  "Call",
                  `Bloque de salto porque el fracaso obtiene el número de @ tapa:${targetJid}`,
                );
              }
            }
          }
        }
      });
    }
  } catch (errDb) {
    //No se ha inicializado aún la reducción de datos
  }

  process.nextTick(() => {
    try {
      _optionalChain([sock, 'access', _217 => _217.ev, 'optionalAccess', _218 => _218.flush, 'optionalCall', _219 => _219()]);
    } catch (e10) { }
  });

  setTimeout(() => {
    try {
      _optionalChain([sock, 'access', _220 => _220.ev, 'optionalAccess', _221 => _221.flush, 'optionalCall', _222 => _222()]);
    } catch (e11) { }
  }, 2000);

  const flushInterval = setInterval(() => {
    if (!connectionState.isConnected) {
      clearInterval(flushInterval);
      return;
    }
    try {
      _optionalChain([sock, 'access', _223 => _223.ev, 'optionalAccess', _224 => _224.flush, 'optionalCall', _225 => _225()]);
    } catch (e12) { }
  }, 30000);
  if (flushInterval.unref) flushInterval.unref();

  // Handle Pairing Code flow asynchronously after all listeners are registered
  const isRegistered = Boolean(sock.authState && sock.authState.creds && sock.authState.creds.registered);
  if (usePairingCode && !isRegistered) {
    (async () => {
      let rawNumber = rawPairingNumber;
      let validNumber = cleanWhatsAppNumber(rawNumber);

      if (!isPhoneNumberValid(rawNumber, validNumber)) {
        if (process.stdin.isTTY) {
          console.log("");
          colors.logger.warn("pairing", "El número de WhatsApp no se ha fijado en config. js o no válido");
          const answer = await askQuestion(
            colors.chalk.cyan("📱Insertar el número whatsApp (por ejemplo: 6281234568890 ):")
          );
          if (answer) {
            rawNumber = answer;
            validNumber = cleanWhatsAppNumber(rawNumber);
          }
        }
      }

      if (!isPhoneNumberValid(rawNumber, validNumber)) {
        console.log(`
======================================================
         ⚠️  OURIN 3.5 — SETUP PAIRING CODE  ⚠️
======================================================

WhatsApp número para emparejar unset en config. js!
Valor actual:${rawNumber || "(kosong)"}"

PETUNJUK PENGISIAN DI PTERODACTYL:
Abre Archivo Manager en Pterodactyl.
2. Edit archivo "config.js".
Por parte de la sesión, introduzca el número activo de la aplicación:
   session: {
paringNumber:xxxxxxxxxx", // ejemplo: "6281234567890"
     usePairingCode: true,
   }
4, el Guardar un archivo config, js, luego un servidor de retart en consola.

======================================================
`);
        return;
      }

      colors.logger.info("pairing", `Preparación de la solicitud de código de unión${validNumber}...`);

      let pairingCode = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          const ready = await waitForSocketReady(sock, 20000);
          if (!ready) {
            throw new Error("El socket WebSocket no se ha abierto a WhatsApp");
          }
          await new Promise((resolve) => setTimeout(resolve, 1500));
          //Utilizando la camaralla Atara genera 8 caracteres Crockford Base32 válido
          pairingCode = await sock.requestPairingCode(validNumber, "");
          if (pairingCode) break;
        } catch (error) {
          colors.logger.warn("pairing", `Intento${attempt}- 3 fracasos (${error.message})`);
          if (attempt < 3) {
            await new Promise((resolve) => setTimeout(resolve, 3000));
          }
        }
      }

      if (pairingCode) {
        const formattedCode = pairingCode.match(/.{1,4}/g)?.join("-") || pairingCode;
        console.log(`
================================
       OURIN WHATSAPP LOGIN
================================

Status : Waiting for authentication
Method : Pairing Code
Number : ${validNumber}

Pairing Code : ${formattedCode}

================================
`);
      } else {
        console.log(`
================================
       OURIN WHATSAPP LOGIN
================================

Status : Pairing Failed
Method : Pairing Code
Number : ${validNumber}
Gagel tiene código de pareado.
Saran: Perksa conexión servador de Internet y reiniciar bot.

================================
`);
      }
    })().catch((err) => {
      colors.logger.error("pairing", `Error en el procesamiento de pares:${err.message}`);
    });
  }

  return sock;
}

/**
* Conseguir estado de conexión
* @ devuelves{ConnectionState}Estado de conexión actual
 */
function getConnectionState() {
  return connectionState;
}

/**
* Tengo el socket instantáneo
* @ devuelve { Objetos Escucha nul } Socket o nul si no está conectado
 */
function getSocket() {
  return connectionState.sock;
}

/**
* Comproba si el bot está conectado
* @ devuelves{boolean}Verdadero si conectado
 */
function isConnected() {
  return connectionState.isConnected;
}

/**
*Mejorando en milisegundos
* @ devuelves{number}Tiempo de actividad en ms o 0 si no conectado
 */
function getUptime() {
  if (!connectionState.connectedAt) return 0;
  return Date.now() - connectionState.connectedAt.getTime();
}

/**
* Sesión de sesión y eliminación
* @ devuelve { Promesa<boolean>Es verdad si funciona
 */
async function logout() {
  try {
    const sessionPath = getSessionPath();

    if (connectionState.sock) {
      await connectionState.sock.logout();
    }

    if (_fs2.default.existsSync(sessionPath)) {
      _fs2.default.rmSync(sessionPath, { recursive: true, force: true });
    }

    connectionState.isConnected = false;
    connectionState.sock = null;
    connectionState.connectedAt = null;

    colors.logger.success("koneksi", "Sal y trae las cenas desechadas.");
    return true;
  } catch (error) {
    colors.logger.error("koneksi", "Fallido logout:", error.message);
    return false;
  }
}








exports.startConnection = startConnection; exports.getConnectionState = getConnectionState; exports.getSocket = getSocket; exports.isConnected = isConnected; exports.getUptime = getUptime; exports.logout = logout;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

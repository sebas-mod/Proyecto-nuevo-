"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; } async function _asyncOptionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = await fn(value); } else if (op === 'call' || op === 'optionalCall') { value = await fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _qrcode = require('qrcode'); var _qrcode2 = _interopRequireDefault(_qrcode);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _ourincontextjs = require('./ourin-context.js');





var _ourin = require('ourin');
var _ourinloggerjs = require('./ourin-logger.js');
var _ourinjadibotdatabasejs = require('./ourin-jadibot-database.js');
var _ourinsocketjs = require('./ourin-socket.js');
var _ourinassetmanagerjs = require('./ourin-asset-manager.js');
const JADIBOT_AUTH_FOLDER = _path2.default.join(process.cwd(), "session", "jadibot");
const jadibotSessions = new Map();
const reconnectAttempts = new Map();
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_INTERVAL = 5000;

if (!_fs2.default.existsSync(JADIBOT_AUTH_FOLDER)) {
  _fs2.default.mkdirSync(JADIBOT_AUTH_FOLDER, { recursive: true });
}

function getJadibotAuthPath(jid) {
  const id = jid.replace(/@.+/g, "");
  return _path2.default.join(JADIBOT_AUTH_FOLDER, id);
}

function isJadibotActive(jid) {
  const id = jid.replace(/@.+/g, "");
  return jadibotSessions.has(id);
}

function getActiveJadibots() {
  return Array.from(jadibotSessions.entries()).map(([id, data]) => ({
    id,
    jid: id + "@s.whatsapp.net",
    ...data,
  }));
}

function getAllJadibotSessions() {
  const sessions = [];
  if (!_fs2.default.existsSync(JADIBOT_AUTH_FOLDER)) return sessions;

  const dirs = _fs2.default.readdirSync(JADIBOT_AUTH_FOLDER);
  for (const dir of dirs) {
    const credsPath = _path2.default.join(JADIBOT_AUTH_FOLDER, dir, "creds.json");
    if (_fs2.default.existsSync(credsPath)) {
      sessions.push({
        id: dir,
        jid: dir + "@s.whatsapp.net",
        isActive: jadibotSessions.has(dir),
        credsPath,
      });
    }
  }
  return sessions;
}

function createJadibotStore() {
  return {
    messages: new Map(),
    chats: new Map(),
    contacts: {},
    bind(ev) {
      ev.on("messages.upsert", ({ messages }) => {
        for (const msg of messages || []) {
          const jid = _optionalChain([msg, 'access', _ => _.key, 'optionalAccess', _2 => _2.remoteJid]);
          if (!jid) continue;
          if (!this.messages.has(jid)) this.messages.set(jid, new Map());
          const chat = this.messages.get(jid);
          if (_optionalChain([msg, 'access', _3 => _3.key, 'optionalAccess', _4 => _4.id])) {
            chat.set(msg.key.id, msg);
            if (chat.size > 200) {
              const keys = [...chat.keys()];
              for (let i = 0; i < keys.length - 150; i++) chat.delete(keys[i]);
            }
          }
          if (!this.chats.has(jid)) {
            this.chats.set(jid, { id: jid });
          }
          if (msg.pushName && jid.endsWith("@s.whatsapp.net")) {
            this.contacts[jid] = {
              ...this.contacts[jid],
              notify: msg.pushName,
            };
          }
        }
      });
      ev.on("chats.upsert", (chats) => {
        for (const chat of chats || []) {
          if (chat.id) this.chats.set(chat.id, chat);
        }
      });
      ev.on("contacts.upsert", (contacts) => {
        for (const contact of contacts || []) {
          if (contact.id) {
            this.contacts[contact.id] = {
              ...this.contacts[contact.id],
              ...contact,
            };
          }
        }
      });
    },
    async loadMessage(jid, id) {
      return _optionalChain([this, 'access', _5 => _5.messages, 'access', _6 => _6.get, 'call', _7 => _7(jid), 'optionalAccess', _8 => _8.get, 'call', _9 => _9(id)]) || undefined;
    },
  };
}

const rateLimit = new Map();

const ERROR_MESSAGES = {
  401: {
    reason: "Número no incluido WhatsApp",
    action: "Asegúrese de que este número está activo en WhatsApp",
    fatal: true,
  },
  403: {
    reason: "Akses ditolak/dibanned",
    action: "Este número puede haber sido alcanzado por una aplicación prohibida",
    fatal: true,
  },
  405: {
    reason: "Método no permitido",
    action: "Coba lagi nanti",
    fatal: true,
  },
  406: {
    reason: "Número dibatasi",
    action: "Este número está protegido por WhatsApp, espere unas horas",
    fatal: true,
  },
  408: {
    reason: "Request timeout",
    action: "Conexiones lentas, intentará reconectarse",
    fatal: false,
  },
  409: {
    reason: "Konflik session",
    action: "El período de sesiones se utiliza en otra desviación",
    fatal: true,
  },
  411: {
    reason: "Autentikasi fallido",
    action: "Perlu scan ulang QR/pairing",
    fatal: true,
  },
  428: {
    reason: "Rate límite",
    action: "Terlalu banyak request, tunggu beberapa menit",
    fatal: true,
  },
  440: {
    reason: "Login required",
    action: "Session expired, perlu login ulang",
    fatal: true,
  },
  500: {
    reason: "Server error WhatsApp",
    action: "Server WhatsApp bermasalah",
    fatal: false,
  },
  501: {
    reason: "No diimplementasi",
    action: "Fatur no es compatible",
    fatal: true,
  },
  503: {
    reason: "No se dispone de servicio",
    action: "WhatsApp está siendo playance",
    fatal: false,
  },
  515: {
    reason: "Stream error",
    action: "Estoy tratando de reconectarme",
    fatal: false,
  },
};

const CONNECTION_CLOSED_REASONS = [
  {
    match: /Connection Closed/i,
    reason: "Koneksi ditutup",
    action: "Número posible contra ned o problema de red",
    fatal: true,
  },
  {
    match: /write EOF/i,
    reason: "Koneksi terputus",
    action: "Masarinetwork, intentará reconectar",
    fatal: false,
  },
  {
    match: /ECONNRESET/i,
    reason: "Reset koneksi",
    action: "Red inestable",
    fatal: false,
  },
  {
    match: /ETIMEDOUT/i,
    reason: "Timeout",
    action: "Koneksi lambat",
    fatal: false,
  },
  {
    match: /logged out/i,
    reason: "Logged out",
    action: "I 'm in a logout of a trap.",
    fatal: true,
  },
  {
    match: /replaced/i,
    reason: "Session replaced",
    action: "Login di perangkat lain",
    fatal: true,
  },
  {
    match: /Multidevice mismatch/i,
    reason: "Sección nula",
    action: "Perlu scan ulang",
    fatal: true,
  },
  {
    match: /restart required/i,
    reason: "Restart diperlukan",
    action: "Voy a volver a poner la automatización",
    fatal: false,
  },
  {
    match: /bad session/i,
    reason: "Session rusak",
    action: "Perlu scan ulang",
    fatal: true,
  },
];

function parseDisconnectError(lastDisconnect) {
  const statusCode = _optionalChain([lastDisconnect, 'optionalAccess', _10 => _10.error, 'optionalAccess', _11 => _11.output, 'optionalAccess', _12 => _12.statusCode]);
  const errorMessage = _optionalChain([lastDisconnect, 'optionalAccess', _13 => _13.error, 'optionalAccess', _14 => _14.message]) || "Unknown error";

  if (statusCode && ERROR_MESSAGES[statusCode]) {
    return {
      ...ERROR_MESSAGES[statusCode],
      code: statusCode,
      message: errorMessage,
    };
  }

  for (const pattern of CONNECTION_CLOSED_REASONS) {
    if (pattern.match.test(errorMessage)) {
      return {
        code: statusCode || "N/A",
        reason: pattern.reason,
        action: pattern.action,
        fatal: pattern.fatal,
        message: errorMessage,
      };
    }
  }

  return {
    code: statusCode || "N/A",
    reason: "Se desconoce el error",
    action: "Llamar a admin si se repite",
    fatal: false,
    message: errorMessage,
  };
}

function isSocketAlive(sock) {
  try {
    if (!sock) return false;
    if (sock.ws && sock.ws.readyState === 1) return true;
    if (_optionalChain([sock, 'access', _15 => _15.user, 'optionalAccess', _16 => _16.id])) return true;
    return false;
  } catch (e2) {
    return false;
  }
}

async function safeSend(sock, jid, content, options = {}) {
  try {
    if (!jid) return null;
    if (!isSocketAlive(sock)) return null;
    return await sock.sendMessage(jid, content, options);
  } catch (e3) {
    return null;
  }
}

async function startJadibot(sock, m, userJid, usePairing = true) {
  if (
    !userJid ||
    typeof userJid !== "string" ||
    !userJid.includes("@s.whatsapp.net")
  ) {
    throw new Error("Invalid User JID");
  }

  const id = userJid.replace(/@.+/g, "");

  if (usePairing) {
    const lastAttempt = rateLimit.get(id) || 0;
    if (Date.now() - lastAttempt < 60000) {
      throw new Error("Espera 1 minuto antes de intentar de nuevo.");
    }
    rateLimit.set(id, Date.now());
  }

  const authPath = getJadibotAuthPath(userJid);

  if (jadibotSessions.has(id)) {
    throw new Error("¡Así que el bot está activo para este número!");
  }

  if (!_fs2.default.existsSync(authPath)) {
    _fs2.default.mkdirSync(authPath, { recursive: true });
  }

  const { state, saveCreds } = await _ourin.useMultiFileAuthState.call(void 0, authPath);

  const {
    default: makeWASocket,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
  } = await Promise.resolve().then(() => _interopRequireWildcard(require("ourin")));
  const { version } = await fetchLatestBaileysVersion();
  const pinoModule = await Promise.resolve().then(() => _interopRequireWildcard(require("pino")));
  const pinoLogger = pinoModule.default({ level: "silent" });
  const childStore = createJadibotStore();
  const groupMetadataCache = new Map();

  const childSock = makeWASocket({
    version,
    logger: pinoLogger,
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pinoLogger),
    },
    browser: ["Ubuntu", "Chrome", "20.0.0"],
    syncFullHistory: false,
    generateHighQualityLinkPreview: false,
    markOnlineOnConnect: true,
    defaultQueryTimeoutMs: 20000,
    connectTimeoutMs: 20000,
    keepAliveIntervalMs: 10000,
    retryRequestDelayMs: 150,
    getMessage: async (key) => {
      return await _asyncOptionalChain([(await childStore.loadMessage(key.remoteJid, key.id)), 'optionalAccess', async _17 => _17.message]);
    },
    cachedGroupMetadata: async (jid) => {
      const cached = groupMetadataCache.get(jid);
      if (cached) return cached;
      try {
        const fresh = await childSock.groupMetadata(jid);
        groupMetadataCache.set(jid, fresh);
        return fresh;
      } catch (e4) {
        return undefined;
      }
    },
    fireInitQueries: true,
    emitOwnEvents: true,
    shouldSyncHistoryMessage: () => false,
    transactionOpts: { maxCommitRetries: 5, delayBetweenTriesMs: 500 },
  });

  childStore.bind(childSock.ev);
  childSock.store = childStore;
  await _ourinsocketjs.extendSocket.call(void 0, childSock);

  let qrCount = 0;
  let lastQRMsg = null;
  let pairingCode = null;
  let heartbeatInterval = null;

  childSock.ev.on("creds.update", saveCreds);

  childSock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr && !usePairing) {
      qrCount++;
      if (qrCount > 3) {
        await safeSend(sock, _optionalChain([m, 'optionalAccess', _18 => _18.chat]), {
          text: "❌ QR Code exPor favor, inténtalo de nuevo.",
        });
        if (_optionalChain([lastQRMsg, 'optionalAccess', _19 => _19.key])) {
          await safeSend(sock, _optionalChain([m, 'optionalAccess', _20 => _20.chat]), { delete: lastQRMsg.key });
        }
        jadibotSessions.delete(id);
        reconnectAttempts.delete(id);
        try {
          childSock.ws.close();
        } catch (e5) { }
        return;
      }

      try {
        const qrBuffer = await _qrcode2.default.toBuffer(qr, {
          scale: 8,
          margin: 4,
          width: 256,
          color: { dark: "#000000ff", light: "#ffffffff" },
        });

        if (_optionalChain([lastQRMsg, 'optionalAccess', _21 => _21.key])) {
          await safeSend(sock, _optionalChain([m, 'optionalAccess', _22 => _22.chat]), { delete: lastQRMsg.key });
        }

        if (!_optionalChain([m, 'optionalAccess', _23 => _23.chat])) return;
        lastQRMsg = await sock.sendMessage(
          m.chat,
          {
            image: qrBuffer,
            caption:
              `🤖 *ᴊᴀᴅɪʙᴏᴛ — Qʀ ᴄᴏᴅᴇ*\n\n` +
              `Escanea este código QR para vincular el bot.\n\n` +
              `• ⏱️ Válido por 20 segundos\n` +
              `> 📊 QR Count: ${qrCount}/3`,
          },
          { quoted: m },
        );
      } catch (e) {
        _ourinloggerjs.logger.error("Jadibot", "Failed to send QR: " + e.message);
      }
    }

    if (connection === "open") {
      _ourinloggerjs.logger.info("Jadibot", `Connected: ${id}`);

      reconnectAttempts.delete(id);

      jadibotSessions.set(id, {
        sock: childSock,
        jid: _optionalChain([childSock, 'access', _24 => _24.user, 'optionalAccess', _25 => _25.jid]) || userJid,
        startedAt: Date.now(),
        ownerJid: _optionalChain([m, 'optionalAccess', _26 => _26.sender]) || userJid,
        status: "connected",
        connectionReady: true,
        pendingMessages: [],
      });

      heartbeatInterval = setInterval(() => {
        try {
          if (!isSocketAlive(childSock)) {
            clearInterval(heartbeatInterval);
          }
        } catch (e6) { }
      }, 30000);

      const session = jadibotSessions.get(id);
      if (session) {
        session.heartbeatInterval = heartbeatInterval;
      }

      childSock.sendPresenceUpdate("available").catch(() => { });

      _ourinjadibotdatabasejs.addJadibotOwner.call(void 0, id, _optionalChain([m, 'optionalAccess', _27 => _27.sender]) || userJid);

      if (_optionalChain([m, 'optionalAccess', _28 => _28.chat])) {
        sock
          .sendMessage(m.chat, {
            text:
              `✅ *ᴊᴀᴅɪʙᴏᴛ ᴛᴇʀʜᴜʙᴜɴɢ*\n\n` +
              `• 📱 Número: *@${id}*\n` +
              `> 🟢 Status: *Online*\n` +
              `• ⏱️ Inicio: *${new Date().toLocaleTimeString("id-ID")}*\n\n` +
              `¡Está activo y listo para recibir órdenes!\n\n` +
              `> ℹ️ Escribe \`${m.prefix || "."}stopjadibot\` para detener`,
            mentions: [userJid],
          })
          .catch((e) => {
            _ourinloggerjs.logger.error(
              "Jadibot",
              `Failed to send connected notification: ${e.message}`,
            );
          });
      }

      if (_optionalChain([lastQRMsg, 'optionalAccess', _29 => _29.key]) && _optionalChain([m, 'optionalAccess', _30 => _30.chat])) {
        safeSend(sock, m.chat, { delete: lastQRMsg.key }).catch(() => { });
      }
    }

    if (connection === "close") {
      const errorInfo = parseDisconnectError(lastDisconnect);

      _ourinloggerjs.logger.info(
        "Jadibot",
        `Disconnected: ${id}, code: ${errorInfo.code}, reason: ${errorInfo.reason}`,
      );

      const session = jadibotSessions.get(id);
      if (_optionalChain([session, 'optionalAccess', _31 => _31.heartbeatInterval])) {
        clearInterval(session.heartbeatInterval);
      }

      const attempts = reconnectAttempts.get(id) || 0;

      if (errorInfo.fatal || attempts >= MAX_RECONNECT_ATTEMPTS) {
        jadibotSessions.delete(id);
        reconnectAttempts.delete(id);

        if (errorInfo.fatal) {
          try {
            if (_fs2.default.existsSync(authPath)) {
              _fs2.default.rmSync(authPath, { recursive: true, force: true });
            }
          } catch (e7) { }
        }

        let statusEmoji = "❌";
        if (errorInfo.code === 403 || _optionalChain([errorInfo, 'access', _32 => _32.reason, 'optionalAccess', _33 => _33.includes, 'call', _34 => _34("banned")])) {
          statusEmoji = "🚫";
        } else if (
          errorInfo.code === 406 ||
          _optionalChain([errorInfo, 'access', _35 => _35.reason, 'optionalAccess', _36 => _36.includes, 'call', _37 => _37("dibatasi")])
        ) {
          statusEmoji = "⚠️";
        }

        await safeSend(sock, _optionalChain([m, 'optionalAccess', _38 => _38.chat]), {
          text:
            `${statusEmoji} *ᴊᴀᴅɪʙᴏᴛ ᴅɪsᴄᴏɴɴᴇᴄᴛᴇᴅ*\n\n` +
            `• 📱 Número: *@${id}*\n` +
            `> 🔢 Code: \`${errorInfo.code}\`\n` +
            `• 📋 Motivo: *${errorInfo.reason}*\n` +
            `> ℹ️ ${errorInfo.action}\n\n` +
            (errorInfo.fatal
              ? `•⚠*La sesión será eliminada*\`.\`Vuelve a vincular el bot.`
              : ""),
          mentions: [userJid],
        });
      } else {
        reconnectAttempts.set(id, attempts + 1);

        await safeSend(sock, _optionalChain([m, 'optionalAccess', _39 => _39.chat]), {
          text:
            `🔄 *ᴊᴀᴅɪʙᴏᴛ ʀᴇᴄᴏɴɴᴇᴄᴛɪɴɢ...*\n\n` +
            `• 📱 Número: *@${id}*\n` +
            `• 📋 Motivo: *${errorInfo.reason}*\n` +
            `• 🔁 Intento: *${attempts + 1}/${MAX_RECONNECT_ATTEMPTS}*\n\n` +
            `Reconectando en ${RECONNECT_INTERVAL / 1000} segundos...`,
          mentions: [userJid],
        });

        setTimeout(() => {
          startJadibot(sock, m, userJid, false).catch((e) => {
            _ourinloggerjs.logger.error("Jadibot", `Reconnect failed for ${id}: ${e.message}`);
            jadibotSessions.delete(id);
            reconnectAttempts.delete(id);
          });
        }, RECONNECT_INTERVAL);
      }
    }
  });

  const processedMessages = new Map();

  childSock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (!childSock.user || !childSock.user.id) {
      childSock.user = {
        id: _ourin.jidNormalizedUser.call(void 0, id),
        name: "Jadibot",
      };
    }

    if (type !== "notify" && type !== "append") return;

    for (const msg of messages) {
      if (!msg.message) continue;

      const msgId = _optionalChain([msg, 'access', _40 => _40.key, 'optionalAccess', _41 => _41.id]);
      if (msgId && processedMessages.has(msgId)) continue;
      if (msgId) processedMessages.set(msgId, Date.now());

      if (msg.key && msg.key.remoteJid === "status@broadcast") continue;

      const msgTimestamp = msg.messageTimestamp
        ? Number(msg.messageTimestamp) * 1000
        : Date.now();
      const msgAge = Date.now() - msgTimestamp;
      if (msgAge > 60 * 60 * 1000) continue;

      const metadataKeys = [
        "senderKeyDistributionMessage",
        "messageContextInfo",
      ];
      const msgType =
        Object.keys(msg.message).find((k) => !metadataKeys.includes(k)) ||
        Object.keys(msg.message)[0];
      const ignoredTypes = [
        "protocolMessage",
        "senderKeyDistributionMessage",
        "reactionMessage",
        "stickerSyncRmrMessage",
        "encReactionMessage",
        "pollUpdateMessage",
        "pollCreationMessage",
        "pollCreationMessageV2",
        "pollCreationMessageV3",
        "keepInChatMessage",
        "deviceSentMessage",
        "call",
        "peerDataOperationRequestMessage",
      ];
      if (ignoredTypes.includes(msgType)) continue;

      if (!isSocketAlive(childSock)) continue;

      const session = jadibotSessions.get(id);
      if (session && !session.connectionReady) {
        session.pendingMessages = session.pendingMessages || [];
        session.pendingMessages.push(msg);
        continue;
      }

      try {
        const { messageHandler } = await Promise.resolve().then(() => _interopRequireWildcard(require("../handler.js")));
        await messageHandler(msg, childSock, {
          isJadibot: true,
          jadibotId: id,
        });
      } catch (e) {
        if (
          _optionalChain([e, 'access', _42 => _42.message, 'optionalAccess', _43 => _43.includes, 'call', _44 => _44("Connection Closed")]) ||
          _optionalChain([e, 'access', _45 => _45.message, 'optionalAccess', _46 => _46.includes, 'call', _47 => _47("428")])
        ) {
          _ourinloggerjs.logger.info(
            "Jadibot",
            `${id} connection closed during handler, skipping`,
          );
          break;
        }
        _ourinloggerjs.logger.error("Jadibot", `Handler error for ${id}: ${e.message}`);
      }
    }

    const fiveMinAgo = Date.now() - 300000;
    for (const [key, time] of processedMessages) {
      if (time < fiveMinAgo) processedMessages.delete(key);
    }
  });

  if (usePairing && !_optionalChain([state, 'access', _48 => _48.creds, 'optionalAccess', _49 => _49.registered])) {
    try {
      await _ourin.delay.call(void 0, 3000);
      pairingCode = await childSock.requestPairingCode(id);
      pairingCode = _optionalChain([pairingCode, 'access', _50 => _50.match, 'call', _51 => _51(/.{1,4}/g), 'optionalAccess', _52 => _52.join, 'call', _53 => _53("-")]) || pairingCode;

      if (m && m.chat) {
        let thumbnail = null;
        try {
          if (!!_ourinassetmanagerjs.getAssetBuffer.call(void 0, "ourin2")) {
            thumbnail = _ourinassetmanagerjs.getAssetBuffer.call(void 0, "ourin2");
          }
        } catch (e8) { }

        await sock.sendMessage(
          m.chat,
          {
            text:
              `🔗 *ᴘᴀɪʀɪɴɢ ᴄᴏᴅᴇ*\n\n` +
              `Introduce este código en WhatsApp:\n\n` +
              `• 📱 Ajustes → Dispositivos vinculados → Vincular un dispositivo\n\n` +
              `\`\`\`${pairingCode}\`\`\`\n\n` +
              `• 🕕 El código caduca en unos minutos.\n` +
              `• ⚠️ No compartas este código con nadie.`,
            contextInfo: _ourincontextjs.saluranCtx.call(void 0, ),
            interactiveButtons: [
              {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                  display_text: "📋 Copy Pairing Code",
                  copy_code: pairingCode.replace(/-/g, ""),
                }),
              },
            ],
          },
          { quoted: m },
        );
      } else {
        _ourinloggerjs.logger.info("Jadibot", `Pairing Code for ${id}: ${pairingCode}`);
      }
    } catch (e) {
      _ourinloggerjs.logger.error("Jadibot", "Failed to get pairing code: " + e.message);

      let errorMsg = "Stemless consigue código de pareado";
      if (
        _optionalChain([e, 'access', _54 => _54.message, 'optionalAccess', _55 => _55.includes, 'call', _56 => _56("rate")]) ||
        _optionalChain([e, 'access', _57 => _57.message, 'optionalAccess', _58 => _58.includes, 'call', _59 => _59("limit")]) ||
        _optionalChain([e, 'access', _60 => _60.message, 'optionalAccess', _61 => _61.includes, 'call', _62 => _62("428")])
      ) {
        errorMsg = "Rate limited! Tunggu 5-10 menit.";
      } else if (
        _optionalChain([e, 'access', _63 => _63.message, 'optionalAccess', _64 => _64.includes, 'call', _65 => _65("banned")]) ||
        _optionalChain([e, 'access', _66 => _66.message, 'optionalAccess', _67 => _67.includes, 'call', _68 => _68("blocked")])
      ) {
        errorMsg = "El número podría ser rogado WhatsApp.";
      } else if (
        _optionalChain([e, 'access', _69 => _69.message, 'optionalAccess', _70 => _70.includes, 'call', _71 => _71("Connection Closed")]) ||
        _optionalChain([e, 'access', _72 => _72.message, 'optionalAccess', _73 => _73.includes, 'call', _74 => _74("closed")])
      ) {
        errorMsg = "Koneksi terputus. Coba lagi.";
      }

      await safeSend(sock, _optionalChain([m, 'optionalAccess', _75 => _75.chat]), {
        text: `❌ *ᴊᴀᴅɪʙᴏᴛ ɢᴀɢᴀʟ*\n\n> ${errorMsg}`,
      });

      try {
        _optionalChain([childSock, 'access', _76 => _76.end, 'optionalCall', _77 => _77()]);
      } catch (e9) { }
      jadibotSessions.delete(id);
      reconnectAttempts.delete(id);
      throw new Error(errorMsg);
    }
  }

  return { sock: childSock, pairingCode };
}

async function stopJadibot(jid, deleteSession = false) {
  const id = jid.replace(/@.+/g, "");
  const session = jadibotSessions.get(id);

  if (session) {
    try {
      if (session.heartbeatInterval) {
        clearInterval(session.heartbeatInterval);
      }
      session.sock.ev.removeAllListeners();
      session.sock.ws.close();
    } catch (e10) { }
    jadibotSessions.delete(id);
  }

  reconnectAttempts.delete(id);

  if (deleteSession) {
    const authPath = getJadibotAuthPath(jid);
    if (_fs2.default.existsSync(authPath)) {
      _fs2.default.rmSync(authPath, { recursive: true, force: true });
    }
  }

  return true;
}

async function stopAllJadibots() {
  const stopped = [];
  for (const [id, session] of jadibotSessions) {
    try {
      if (session.heartbeatInterval) {
        clearInterval(session.heartbeatInterval);
      }
      session.sock.ev.removeAllListeners();
      session.sock.ws.close();
    } catch (e11) { }
    stopped.push(id);
  }
  jadibotSessions.clear();
  reconnectAttempts.clear();
  return stopped;
}

async function restartJadibotSession(sock, sessionId) {
  const userJid = sessionId + "@s.whatsapp.net";
  try {
    _ourinloggerjs.logger.info("Jadibot", `Restoring session: ${sessionId}`);

    const dbPath = _path2.default.join(JADIBOT_AUTH_FOLDER, sessionId, "data.json");
    let ownerJid = userJid;
    try {
      if (_fs2.default.existsSync(dbPath)) {
        const data = JSON.parse(_fs2.default.readFileSync(dbPath, "utf8"));
        if (_optionalChain([data, 'access', _78 => _78.owners, 'optionalAccess', _79 => _79[0]])) ownerJid = data.owners[0] + "@s.whatsapp.net";
      }
    } catch (e12) { }

    const mockM = {
      chat: ownerJid,
      sender: ownerJid,
      prefix: ".",
      key: {
        remoteJid: ownerJid,
        fromMe: false,
        id: "restart-" + Date.now(),
      },
      reply: async (text) => {
        await safeSend(sock, ownerJid, { text });
      },
      react: async () => { },
    };
    await startJadibot(sock, mockM, userJid, false);
  } catch (e) {
    _ourinloggerjs.logger.error("Jadibot", `Failed to restore ${sessionId}: ${e.message}`);
  }
}

function getJadibotStatus(jid) {
  const id = jid.replace(/@.+/g, "");
  const session = jadibotSessions.get(id);
  if (!session) return null;

  return {
    id,
    jid: session.jid,
    status: session.status || "unknown",
    startedAt: session.startedAt,
    ownerJid: session.ownerJid,
    uptime: Date.now() - session.startedAt,
  };
}















exports.JADIBOT_AUTH_FOLDER = JADIBOT_AUTH_FOLDER; exports.jadibotSessions = jadibotSessions; exports.getJadibotAuthPath = getJadibotAuthPath; exports.isJadibotActive = isJadibotActive; exports.getActiveJadibots = getActiveJadibots; exports.getAllJadibotSessions = getAllJadibotSessions; exports.startJadibot = startJadibot; exports.stopJadibot = stopJadibot; exports.stopAllJadibots = stopAllJadibots; exports.restartJadibotSession = restartJadibotSession; exports.getJadibotStatus = getJadibotStatus; exports.isSocketAlive = isSocketAlive; exports.safeSend = safeSend;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

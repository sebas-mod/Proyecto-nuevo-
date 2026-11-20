"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }








var _almiku = require('almiku');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path');





var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);












var _almikulidjs = require('./almiku-lid.js');
var _util = require('util'); var _util2 = _interopRequireDefault(_util);
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _sharp = require('./almiku-image.js'); var _sharp2 = _interopRequireDefault(_sharp);

var _almikudatabasejs = require('./almiku-database.js');
var _almikucontextjs = require('./almiku-context.js');
var _almikuassetmanagerjs = require('./almiku-asset-manager.js');
let _prefixCache = null;
let _prefixCacheTime = 0;
const PREFIX_CACHE_TTL = 30000;

function getCachedPrefixes() {
  const now = Date.now();
  if (_prefixCache && now - _prefixCacheTime < PREFIX_CACHE_TTL)
    return _prefixCache;
  const configPrefix = _optionalChain([_configjs2.default, 'access', _ => _.command, 'optionalAccess', _2 => _2.prefix]) || ".";
  let prefixList = [configPrefix];
  let isNoPrefix = false;
  try {
    const prefixDbPath = _path.join.call(void 0, process.cwd(), "database", "prefix.json");
    if (_fs.existsSync.call(void 0, prefixDbPath)) {
      const prefixData = JSON.parse(_fs2.default.readFileSync(prefixDbPath, "utf8"));
      prefixList = [configPrefix, ...(prefixData.prefixes || [])];
      isNoPrefix = prefixData.noprefix === true;
    }
  } catch (e2) { }
  _prefixCache = { list: [...new Set(prefixList)], noprefix: isNoPrefix };
  _prefixCacheTime = now;
  return _prefixCache;
}

function invalidatePrefixCache() {
  _prefixCache = null;
  _prefixCacheTime = 0;
}

const _thumbCache = {};
async function getCachedThumb(filePath) {
  if (_thumbCache[filePath] !== undefined) return _thumbCache[filePath];

  //Pruebe Assetmanager Firma si lo hace
  const basename = filePath ? filePath.split('/').pop().split('.')[0] : null;
  if (basename) {
    const assetBuf = _almikuassetmanagerjs.getAssetBuffer.call(void 0, basename);
    if (assetBuf) return assetBuf;
  }

  try {
    if (filePath && filePath.startsWith("http")) {
      const res = await _axios2.default.get(filePath, { responseType: "arraybuffer", timeout: 5000 });
      _thumbCache[filePath] = Buffer.from(res.data);
    } else if (_fs2.default.existsSync(filePath)) {
      _thumbCache[filePath] = _fs2.default.readFileSync(filePath);
    } else {
      _thumbCache[filePath] = null;
    }
  } catch (e3) {
    _thumbCache[filePath] = null;
  }
  return _thumbCache[filePath];
}

let _sharpThumbCache = {};
let _sharpInstance = null;
async function _getSharp() {
  if (!_sharpInstance) _sharpInstance = (await Promise.resolve().then(() => _interopRequireWildcard(require("./almiku-image.js")))).default;
  return _sharpInstance;
}
async function getCachedSharpThumb(filePath, w, h) {
  const key = `${filePath}_${w}x${h}`;
  if (_sharpThumbCache[key] !== undefined) return _sharpThumbCache[key];
  try {
    const raw = await getCachedThumb(filePath);
    if (raw) {
      const sharp = await _getSharp();
      _sharpThumbCache[key] = await sharp(raw).resize(w, h).toBuffer();
    } else {
      _sharpThumbCache[key] = null;
    }
  } catch (e4) {
    _sharpThumbCache[key] = null;
  }
  return _sharpThumbCache[key];
}

const _ppCache = new Map();
const PP_CACHE_TTL = 5 * 60 * 1000;

/**
 * @typedef {Object} ContextInfo
* @ proprie{string}stanzad - id message in - quote
* @ proprie{string}participante - Los participantes del JID están en
* @ proprie{Object}- La cita de Mensaje
* @ promenory
* @ proprie{boolean}isForwarded - Es el mensaje reenviado
* @ proprie{number}Resultado de reenvío - Surging
* @ proprie{Object}exOtros recursos ExRespuesta de la publicidad (tornilla)
 */

/**
 * @typedef {Object} SerializedMessage
* @ proprie{string}id - unic id mensaje
* Perfil{string}chat chat JID / grupo
 * @property {string} sender - JID pengirim
* @ proprie{string}- NUMBER NUMBER
* @ proprie{string}PushName - Nombre de la pantalla del remitente
* @ proprie{boolean}- Es un mensaje del propio bot
* @ proprie{boolean}- Es un mensaje del grupo
* @ proprie{boolean}iisOwner - Es el remitente el dueño
* Perfil{boolean}istemium - Es el remitente un usuario premiere
* @ proprie{boolean}isBanned - Se envían discos
* @ proprie{boolean}- ¿El remitente es el bot?
* @ proprie{string}Tipo 
* @ proprie{string}Cuerpo - ISI te messagexn
* @ proprie{string}Comando... Comando sin prefix
* @ proprie{string}prefix- Prefi.xque usado
 * @property {string[]} args - Array argumen
* @ proprie{string}texT Text después del comando
* @ proprie{boolean}isaCommand - Es el mensaje un comando
* @ proprie{boolean}- ¿Hay medios?
* @ proprie{boolean}- ¿La foto?
* @ proprie{boolean}Video - Es el vídeo
* @ proprie{boolean}isAudio - Es un auco
* @ proprie{boolean}- ¿Es Pegatina?
* @ proprie{boolean}IsDocument - Es el documento
* @ proprie{boolean}istact - Es un mango
* @ proprie{boolean}Localización -
* @ proprie{boolean}esQ- ¿Hay un mensaje en
* @ proprie{Object}cita - Objeción en
* @ promenory
* @ proprie{Object}grupoMetadatos - Grupo de metadatos (si se trata de grupo)
* @ proprie{boolean}isAdmin - Es el remitente del grupo de administración
* @ proprie{boolean}IsBotAdmin - Es el bot un administrador
* @ proprie{Function}respuesta - Fungsi respuesta texn
* @ proprie{Function}respuesta con menciones-- respuesta Fungsi con mensiones
* @ proprie{Function}respuestaImagage - Fungsi respuesta imagen
* @ proprie{Function}Responder video - Fungsi respuesta video
* @ proprie{Function}Responder Audio - Fungsi respuesta audio
* @ proprie{Function}- Pegatina de respuesta Fungsi
* @ proprie{Function} replyDocument - Fungsi responder documento
* @ proprie{Function}respuesta Contacto - Fungsi respuesta conexión
* @ proprie{Function}respuestaLocitation - Fungsi respuesta ubicación
* @ proprie{Function}respuestaContraQuote - Respuesta Fungsi con cita fina
 * @property {Function} react - Fungsi react emoji
 * @property {Function} download - Fungsi download media
* @ proprie{Function}borrador - Fungsi borrar mensaje
* @ proprie{Function}mensaje de Fungsi para enano
 */

/**
* Decode JID es un formador más limpio
* @ param{string}Jid JID para ser decodificado
* @ devuelve { cadena dknul } ya en --decodificación o nul
 */
function decodeJid(jid) {
  if (!jid) return null;
  if (/:\d+@/gi.test(jid)) {
    const decoded = _almiku.jidDecode.call(void 0, jid) || {};
    return (
      (decoded.user && decoded.server && decoded.user + "@" + decoded.server) ||
      jid
    );
  }
  return jid;
}

function getMessageType(message) {
  if (!message) return null;
  const contentType = _almiku.getContentType.call(void 0, message);
  if (
    contentType === "messageContextInfo" &&
    message.interactiveResponseMessage
  ) {
    return "interactiveResponseMessage";
  }
  return contentType;
}

/**
# Got text / cuerpo del tipo de mensaje
* @ param{Object}Mensaje - Mensaje de Objeciones WhatsApp
* @ param{string}Tipo 
* @ devuelves{string}Text/body mensaje
 */
function getMessageBody(message, type) {
  if (!message || !type) return "";

  const messageContent = message[type];
  if (!messageContent) return "";

  switch (type) {
    case "conversation":
      return message.conversation || "";
    case "extendedTextMessage":
      return messageContent.text || "";
    case "imageMessage":
    case "videoMessage":
    case "documentMessage":
      return messageContent.caption || "";
    case "buttonsResponseMessage":
      return messageContent.selectedButtonId || "";
    case "listResponseMessage":
      return _optionalChain([messageContent, 'access', _3 => _3.singleSelectReply, 'optionalAccess', _4 => _4.selectedRowId]) || "";
    case "templateButtonReplyMessage":
      return messageContent.selectedId || "";
    case "interactiveResponseMessage":
      try {
        const paramsJson =
          _optionalChain([messageContent, 'access', _5 => _5.nativeFlowResponseMessage, 'optionalAccess', _6 => _6.paramsJson]) || "{}";
        const parsed = JSON.parse(paramsJson);
        if (parsed.id) return parsed.id;
        if (parsed.response_json) {
          const nested = JSON.parse(parsed.response_json);
          if (nested.id) return nested.id;
          if (nested.selectedRowId) return nested.selectedRowId;
        }
        if (parsed.selectedRowId) return parsed.selectedRowId;
        if (parsed.selected_row_id) return parsed.selected_row_id;
        return "";
      } catch (e5) {
        return "";
      }
    case "pollCreationMessage":
    case "pollCreationMessageV2":
    case "pollCreationMessageV3":
      return messageContent.name || "";
    default:
      return "";
  }
}

/**
* Comando y argumento pares del mensaje corporal
* @ param{string}Body Mensaje corporal
* @ param{string}prefix- Prefi.xcomando
* @ devuelves{Object}Información del comando
 */
function parseCommand(body, prefix) {
  const result = {
    isCommand: false,
    command: "",
    prefix: "",
    args: [],
    text: "",
    fullArgs: "",
  };

  if (!body) return result;

  const cached = getCachedPrefixes();
  const prefixList = cached.list;

  for (const p of prefixList) {
    if (body.startsWith(p)) {
      result.isCommand = true;
      result.prefix = p;

      const withoutPrefix = body.slice(p.length).trim();
      const parts = withoutPrefix.split(/\s+/);

      result.command = _optionalChain([_configjs2.default, 'access', _7 => _7.command, 'optionalAccess', _8 => _8.caseSensitive])
        ? parts[0]
        : parts[0].toLowerCase();
      result.args = parts.slice(1);
      result.text = withoutPrefix.slice(result.command.length).trim();
      result.fullArgs = result.text;

      return result;
    }
  }

  if (cached.noprefix) {
    const parts = body.trim().split(/\s+/);
    const potentialCommand = _optionalChain([_configjs2.default, 'access', _9 => _9.command, 'optionalAccess', _10 => _10.caseSensitive])
      ? parts[0]
      : parts[0].toLowerCase();

    if (
      potentialCommand &&
      /^[a-z0-9_-]+$/i.test(potentialCommand) &&
      potentialCommand.length <= 20
    ) {
      result.isCommand = true;
      result.prefix = "";
      result.command = potentialCommand;
      result.args = parts.slice(1);
      result.text = result.args.join(" ");
      result.fullArgs = body.slice(potentialCommand.length).trim();
    }
  }

  return result;
}

/**
* Serializar el mensaje citado con el conte completoxn
* @ param{Object}Mensaje - Objeciones del mensaje principal
* @ param{string}Tipo 
 * @param {Object} sock - Socket connection
 * @param {Object[]} participants - Group participants for LID resolution
 * @param {Object} originalMsgKey - Original message key containing participantAlt
 * @returns {Promise<Object|null>} Quoted message object
 */
async function serializeQuotedMessage(
  message,
  type,
  sock,
  participants = [],
  originalMsgKey = {},
) {
  if (!message || !type) return null;

  const messageContent = message[type];
  if (!messageContent) return null;

  const contextInfo = messageContent.contextInfo;
  if (!contextInfo || !contextInfo.quotedMessage) return null;

  const rawQuotedMessage = contextInfo.quotedMessage;
  const quotedMessage =
    _almiku.normalizeMessageContent.call(void 0, rawQuotedMessage) || rawQuotedMessage;
  const quotedType = getMessageType(quotedMessage);
  const isViewOnce = !!(
    _optionalChain([rawQuotedMessage, 'optionalAccess', _11 => _11.viewOnceMessage]) ||
    _optionalChain([rawQuotedMessage, 'optionalAccess', _12 => _12.viewOnceMessageV2]) ||
    _optionalChain([rawQuotedMessage, 'optionalAccess', _13 => _13.viewOnceMessageV2Extension])
  );

  let quotedParticipant = contextInfo.participant || "";

  if (_almikulidjs.isLid.call(void 0, quotedParticipant) || _almikulidjs.isLidConverted.call(void 0, quotedParticipant)) {
    const cached = _almikulidjs.getCachedJid.call(void 0, quotedParticipant);
    if (cached && !_almikulidjs.isLidConverted.call(void 0, cached)) {
      quotedParticipant = cached;
    } else if (participants && participants.length > 0) {
      quotedParticipant = _almikulidjs.resolveAnyLidToJid.call(void 0, quotedParticipant, participants);
    } else {
      quotedParticipant = _almikulidjs.lidToJid.call(void 0, quotedParticipant);
    }
  }

  quotedParticipant = decodeJid(quotedParticipant);

  const db = _almikudatabasejs.getDatabase.call(void 0, );
  const contacts = db.setting("contacts") || {};
  let qPushName = "~ User";

  if (_optionalChain([sock, 'optionalAccess', _14 => _14.store])) {
    try {
      const jid = _optionalChain([originalMsgKey, 'optionalAccess', _15 => _15.remoteJid]) || _optionalChain([message, 'access', _16 => _16.key, 'optionalAccess', _17 => _17.remoteJid]);
      const stanzaId = contextInfo.stanzaId;
      if (jid && stanzaId) {
        const rawMsg = await sock.store.loadMessage(jid, stanzaId);
        if (rawMsg && rawMsg.pushName) {
          qPushName = rawMsg.pushName;
        }
      }
    } catch (e) { }
  }

  if (qPushName === "~ User" && contacts[quotedParticipant]) {
    qPushName = contacts[quotedParticipant].name;
  }

  const quoted = {
    pushName: qPushName,
    key: {
      remoteJid: _optionalChain([message, 'access', _18 => _18.key, 'optionalAccess', _19 => _19.remoteJid]) || "",
      fromMe: quotedParticipant === decodeJid(_optionalChain([sock, 'optionalAccess', _20 => _20.user, 'optionalAccess', _21 => _21.id])),
      id: contextInfo.stanzaId || "",
      participant: quotedParticipant,
    },
    id: contextInfo.stanzaId || "",
    sender: quotedParticipant,
    senderNumber: (quotedParticipant || "").replace(/@.+/g, ""),
    type: quotedType,
    body: getMessageBody(quotedMessage, quotedType),
    message: quotedMessage,
    mentionedJid: _almikulidjs.convertLidArray.call(void 0, contextInfo.mentionedJid || [], participants),
    isMedia: [
      "imageMessage",
      "videoMessage",
      "audioMessage",
      "stickerMessage",
      "documentMessage",
    ].includes(quotedType),
    isImage: quotedType === "imageMessage",
    isVideo: quotedType === "videoMessage",
    isAudio: quotedType === "audioMessage",
    isSticker: quotedType === "stickerMessage",
    isDocument: quotedType === "documentMessage",
    isViewOnce: isViewOnce,
  };

  quoted.download = async (filename = null) => {
    if (!quoted.isMedia) return null;

    const stream = await _almiku.downloadContentFromMessage.call(void 0, 
      quotedMessage[quotedType],
      quotedType.replace("Message", ""),
    );

    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    if (filename) {
      const tempDir = _path.join.call(void 0, process.cwd(), "storage", "temp");
      if (!_fs.existsSync.call(void 0, tempDir)) {
        _fs.mkdirSync.call(void 0, tempDir, { recursive: true });
      }
      const filepath = _path.join.call(void 0, tempDir, filename);
      _fs.writeFileSync.call(void 0, filepath, buffer);
      return filepath;
    }

    return buffer;
  };

  return quoted;
}

/**
* Crear un context ingo for fake responder
 * @param {string} jid - JID pengirim palsu
* @ param{string}texT Texno mensaje falso
 * @param {string} [title] - Title/judul
* @ param{string} [body] - Body adicional
* @ param{Buffer}# Thumbnail # # Thumbnail pictures #
* @ devolvs{Object}Context info objeto
 */
function createContextInfo(jid, text, title = "", body = "", thumbnail = null) {
  const contextInfo = {
    mentionedJid: [],
    forwardingScore: 999,
    isForwarded: true,
  };

  if (jid && text) {
    contextInfo.quotedMessage = {
      conversation: text,
    };
    contextInfo.participant = jid;
    contextInfo.stanzaId = "ALMIKUAI" + Date.now();
  }

  return contextInfo;
}

/**
* Serializar mensaje WhatsApp a objeto completo con características completas
 * @param {Object} sock - Socket connection Baileys
* @ param{Object}msg - Mensaje bruto del evento Baileys
* @ param{Object}• Stor
* @ devuelve { Promesa<SerializedMessage>Objeciones del mensaje ya serializado
 */
async function serialize(sock, msg, store = {}) {
  if (!msg) return null;
  if (!msg.message) return null;
  if (!msg.key) return null;

  const m = {};

  m.key = msg.key;
  m.id = _optionalChain([msg, 'access', _22 => _22.key, 'optionalAccess', _23 => _23.id]) || "";
  m.chat = decodeJid(_optionalChain([msg, 'access', _24 => _24.key, 'optionalAccess', _25 => _25.remoteJid]) || "");
  m.fromMe = (msg.key && msg.key.fromMe) || false;
  m.isNewsletter = _optionalChain([m, 'access', _26 => _26.chat, 'optionalAccess', _27 => _27.endsWith, 'call', _28 => _28("@newsletter")]) || false;
  m.isChannel = m.isNewsletter;
  m.isGroup = _optionalChain([m, 'access', _29 => _29.chat, 'optionalAccess', _30 => _30.endsWith, 'call', _31 => _31("@g.us")]) || false;

  const remoteJidAlt = _optionalChain([msg, 'access', _32 => _32.key, 'optionalAccess', _33 => _33.remoteJidAlt])
    ? _almikulidjs.decodeAndNormalize.call(void 0, msg.key.remoteJidAlt)
    : null;
  const participantAlt = _optionalChain([msg, 'access', _34 => _34.key, 'optionalAccess', _35 => _35.participantAlt])
    ? _almikulidjs.decodeAndNormalize.call(void 0, msg.key.participantAlt)
    : null;

  if (
    !m.isGroup &&
    !m.isNewsletter &&
    (_almikulidjs.isLid.call(void 0, m.chat) || _almikulidjs.isLidConverted.call(void 0, m.chat))
  ) {
    if (remoteJidAlt && !_almikulidjs.isLid.call(void 0, remoteJidAlt) && !_almikulidjs.isLidConverted.call(void 0, remoteJidAlt)) {
      const lidKey = m.chat.endsWith("@lid")
        ? m.chat
        : m.chat.replace("@s.whatsapp.net", "@lid");
      _almikulidjs.cacheLidJid.call(void 0, lidKey, remoteJidAlt);
      _almikulidjs.cacheLidJid.call(void 0, m.chat, remoteJidAlt);
      m.chat = remoteJidAlt;
    } else {
      const resolved = _almikulidjs.resolveAnyLidToJid.call(void 0, m.chat, []);
      if (resolved && !_almikulidjs.isLidConverted.call(void 0, resolved)) {
        m.chat = resolved;
      } else if (m.fromMe) {
        m.chat = _almikulidjs.decodeAndNormalize.call(void 0, sock.user.id);
      }
    }
    m.key.remoteJid = m.chat;
  }

  let senderJid;
  if (m.isNewsletter) {
    senderJid = sock.user.id;
  } else if (m.isGroup) {
    senderJid = msg.key.participant;
  } else {
    senderJid = m.fromMe ? sock.user.id : m.chat;
  }
  senderJid = _almikulidjs.decodeAndNormalize.call(void 0, senderJid);

  if (!senderJid || _almikulidjs.isLid.call(void 0, senderJid) || _almikulidjs.isLidConverted.call(void 0, senderJid)) {
    const altJid = m.isGroup ? participantAlt : remoteJidAlt;
    if (altJid && !_almikulidjs.isLid.call(void 0, altJid) && !_almikulidjs.isLidConverted.call(void 0, altJid)) {
      if (senderJid) {
        const lidKey = senderJid.endsWith("@lid")
          ? senderJid
          : senderJid.replace("@s.whatsapp.net", "@lid");
        _almikulidjs.cacheLidJid.call(void 0, lidKey, altJid);
        _almikulidjs.cacheLidJid.call(void 0, senderJid, altJid);
      }
      senderJid = altJid;
    } else if (msg.participantPn) {
      senderJid = msg.participantPn;
    } else if (m.isGroup) {
      const sockResolved = await _almikulidjs.resolveFromSock.call(void 0, senderJid, sock);
      if (
        sockResolved &&
        !_almikulidjs.isLid.call(void 0, sockResolved) &&
        !_almikulidjs.isLidConverted.call(void 0, sockResolved)
      ) {
        senderJid = sockResolved;
      } else {
        try {
          const metadata = await sock.groupMetadata(m.chat);
          if (_optionalChain([metadata, 'optionalAccess', _36 => _36.participants])) {
            _almikulidjs.cacheParticipantLids.call(void 0, metadata.participants);
          }
          const fallback = msg.key.participant;
          senderJid = _almikulidjs.resolveAnyLidToJid.call(void 0, 
            senderJid || fallback,
            _optionalChain([metadata, 'optionalAccess', _37 => _37.participants]) || [],
          );
        } catch (e6) {
          const fallback = msg.key.participant;
          senderJid = _almikulidjs.resolveAnyLidToJid.call(void 0, senderJid || fallback, []);
        }
      }
    } else {
      const fromCache = _almikulidjs.resolveAnyLidToJid.call(void 0, senderJid || m.chat, []);
      if (fromCache && !_almikulidjs.isLidConverted.call(void 0, fromCache)) {
        senderJid = fromCache;
      } else {
        senderJid = await _almikulidjs.resolveFromSock.call(void 0, senderJid || m.chat, sock);
      }
    }
  }
  m.sender = senderJid;
  m.senderNumber = m.sender ? m.sender.replace(/@.+/g, "") : "";

  if (m.isGroup && m.sender) {
    m.key.participant = m.sender;
  }
  const dbContacts = _almikudatabasejs.getDatabase.call(void 0, ).setting("contacts") || {};
  let finalPushName = msg.pushName || (m.isNewsletter ? "Channel" : "Unknown");
  if ((finalPushName === "Unknown" || finalPushName === "~ User") && dbContacts[m.sender]) {
    finalPushName = dbContacts[m.sender].name;
  }
  m.pushName = finalPushName;
  m.isBot = m.fromMe;
  m.isOwner = m.isNewsletter || m.fromMe ? true : _configjs.isOwner.call(void 0, m.sender);
  m.isPartner = m.isNewsletter || m.fromMe ? true : _configjs.isPartner.call(void 0, m.sender);
  m.isPremium = m.isNewsletter || m.fromMe ? true : _configjs.isPremium.call(void 0, m.sender);
  m.isBanned = m.isNewsletter || m.fromMe ? false : _configjs.isBanned.call(void 0, m.sender);
  let messageData = _almiku.normalizeMessageContent.call(void 0, msg.message);
  m.isViewOnce = !!(
    _optionalChain([msg, 'access', _38 => _38.message, 'optionalAccess', _39 => _39.viewOnceMessage]) ||
    _optionalChain([msg, 'access', _40 => _40.message, 'optionalAccess', _41 => _41.viewOnceMessageV2]) ||
    _optionalChain([msg, 'access', _42 => _42.message, 'optionalAccess', _43 => _43.viewOnceMessageV2Extension])
  );
  m.type = getMessageType(messageData);
  m.message = messageData;
  m.body = getMessageBody(messageData, m.type);
  const parsed = parseCommand(m.body, _optionalChain([_configjs2.default, 'access', _44 => _44.command, 'optionalAccess', _45 => _45.prefix]) || ".");
  m.isCommand = parsed.isCommand;
  m.command = parsed.command;
  m.prefix = parsed.prefix;
  m.args = parsed.args;
  m.text = parsed.text;
  m.fullArgs = parsed.fullArgs;

  m.isQuoted = false;
  m.quoted = null;
  m._pendingQuotedMessage = { messageData, type: m.type, sock };

  const messageContent = messageData[m.type];
  m.mentionedJid = _almikulidjs.convertLidArray.call(void 0, 
    _optionalChain([messageContent, 'optionalAccess', _46 => _46.contextInfo, 'optionalAccess', _47 => _47.mentionedJid]) || [],
  );

  m.isMedia = [
    "imageMessage",
    "videoMessage",
    "audioMessage",
    "stickerMessage",
    "documentMessage",
  ].includes(m.type);
  m.isImage = m.type === "imageMessage";
  m.isVideo = m.type === "videoMessage";
  m.isAudio = m.type === "audioMessage";
  m.isSticker = m.type === "stickerMessage";
  m.isDocument = m.type === "documentMessage";
  m.isContact =
    m.type === "contactMessage" || m.type === "contactsArrayMessage";
  m.isLocation =
    m.type === "locationMessage" || m.type === "liveLocationMessage";
  m.isPoll = m.type === "pollCreationMessage";

  m.groupMetadata = null;
  m.isAdmin = false;
  m.isBotAdmin = false;
  m.groupName = "";
  m.groupDesc = "";
  m.groupMembers = [];
  m.groupAdmins = [];

  if (m.isGroup) {
    try {
      m.groupMetadata =
        _optionalChain([store, 'access', _48 => _48.groupMetadata, 'optionalAccess', _49 => _49[m.chat]]) || (await sock.groupMetadata(m.chat));
      m.groupName = _optionalChain([m, 'access', _50 => _50.groupMetadata, 'optionalAccess', _51 => _51.subject]) || "";
      m.groupDesc = _optionalChain([m, 'access', _52 => _52.groupMetadata, 'optionalAccess', _53 => _53.desc]) || "";
      m.groupMembers = _optionalChain([m, 'access', _54 => _54.groupMetadata, 'optionalAccess', _55 => _55.participants]) || [];
      m.groupAdmins = _optionalChain([m, 'access', _56 => _56.groupMembers
, 'optionalAccess', _57 => _57.filter, 'call', _58 => _58((p) => p.admin)
, 'access', _59 => _59.map, 'call', _60 => _60((p) => p.jid || p.id || p.lid || "")]);

      const senderNum = _optionalChain([m, 'access', _61 => _61.sender, 'optionalAccess', _62 => _62.replace, 'call', _63 => _63(/[^0-9]/g, "")]) || "";
      const botNum = _optionalChain([decodeJid, 'call', _64 => _64(sock.user.id), 'optionalAccess', _65 => _65.replace, 'call', _66 => _66(/[^0-9]/g, "")]) || "";

      m.isAdmin = m.groupMembers.some((p) => {
        if (!p.admin) return false;
        const pJid = p.jid || p.id || "";
        const pLid = p.lid || "";
        let pNum = pJid.replace(/[^0-9]/g, "");
        const pLidNum = pLid.replace(/[^0-9]/g, "");
        if (_almikulidjs.isLid.call(void 0, pJid) || _almikulidjs.isLidConverted.call(void 0, pJid)) {
          const resolved = _almikulidjs.getCachedJid.call(void 0, pJid) || _almikulidjs.getCachedJid.call(void 0, pLid);
          if (resolved) pNum = resolved.replace(/[^0-9]/g, "");
        }
        return (
          pNum === senderNum ||
          pLidNum === senderNum ||
          (pNum.length >= 8 &&
            senderNum.length >= 8 &&
            (pNum.endsWith(senderNum) || senderNum.endsWith(pNum)))
        );
      });

      m.isBotAdmin = m.groupMembers.some((p) => {
        if (!p.admin) return false;
        const pJid = p.jid || p.id || "";
        let pNum = pJid.replace(/[^0-9]/g, "");
        if (_almikulidjs.isLid.call(void 0, pJid) || _almikulidjs.isLidConverted.call(void 0, pJid)) {
          const resolved = _almikulidjs.getCachedJid.call(void 0, pJid) || _almikulidjs.getCachedJid.call(void 0, p.lid || "");
          if (resolved) pNum = resolved.replace(/[^0-9]/g, "");
        }
        return (
          pNum === botNum ||
          (pNum.length >= 8 &&
            botNum.length >= 8 &&
            (pNum.endsWith(botNum) || botNum.endsWith(pNum)))
        );
      });

      _almikulidjs.cacheParticipantLids.call(void 0, m.groupMembers);

      if (m._pendingQuotedMessage) {
        const { messageData, type, sock } = m._pendingQuotedMessage;
        m.quoted = await serializeQuotedMessage(
          messageData,
          type,
          sock,
          m.groupMembers,
        );
        if (m.quoted) {
          m.isQuoted = true;
        }
        delete m._pendingQuotedMessage;
      }

      if (_almikulidjs.isLid.call(void 0, m.sender) || _almikulidjs.isLidConverted.call(void 0, m.sender)) {
        m.sender = _almikulidjs.resolveAnyLidToJid.call(void 0, m.sender, m.groupMembers);
        m.senderNumber = m.sender ? m.sender.replace(/@.+/g, "") : "";
      }

      if (m.mentionedJid && m.mentionedJid.length > 0) {
        m.mentionedJid = _almikulidjs.convertLidArray.call(void 0, m.mentionedJid, m.groupMembers);
      }

      if (
        m.quoted &&
        (_almikulidjs.isLid.call(void 0, m.quoted.sender) || _almikulidjs.isLidConverted.call(void 0, m.quoted.sender))
      ) {
        m.quoted.sender = _almikulidjs.resolveAnyLidToJid.call(void 0, m.quoted.sender, m.groupMembers);
        m.quoted.senderNumber = m.quoted.sender
          ? m.quoted.sender.replace(/@.+/g, "")
          : "";
        m.quoted.key.participant = m.quoted.sender;
      }
    } catch (error) { }
  }

  if (m._pendingQuotedMessage) {
    const { messageData, type, sock } = m._pendingQuotedMessage;
    m.quoted = await serializeQuotedMessage(messageData, type, sock, []);
    if (m.quoted) {
      m.isQuoted = true;
    }
    delete m._pendingQuotedMessage;
  }

  m.remoteJid = m.chat;
  m.jid = m.chat;
  m.from = m.chat;
  m.to = m.chat;
  m.botNumber = _optionalChain([decodeJid, 'call', _67 => _67(_optionalChain([sock, 'access', _68 => _68.user, 'optionalAccess', _69 => _69.id])), 'optionalAccess', _70 => _70.replace, 'call', _71 => _71(/@.+/g, "")]) || "";
  m.botJid = decodeJid(_optionalChain([sock, 'access', _72 => _72.user, 'optionalAccess', _73 => _73.id])) || "";
  m.botName = _optionalChain([sock, 'access', _74 => _74.user, 'optionalAccess', _75 => _75.name]) || _optionalChain([_configjs2.default, 'access', _76 => _76.bot, 'optionalAccess', _77 => _77.name]) || "Al Miku-AI";
  m.messageId = m.id;
  m.chatId = m.chat;
  m.senderId = m.sender;
  m.isPrivate = !m.isGroup && !m.isNewsletter;
  m.isPrivateChat = m.isPrivate;
  m.isGroupChat = m.isGroup;
  m.mediaType = m.type;
  m.hasMedia = m.isMedia;
  m.mimetype = _optionalChain([messageData, 'access', _78 => _78[m.type], 'optionalAccess', _79 => _79.mimetype]) || "";
  m.fileLength = _optionalChain([messageData, 'access', _80 => _80[m.type], 'optionalAccess', _81 => _81.fileLength]) || 0;
  m.fileName = _optionalChain([messageData, 'access', _82 => _82[m.type], 'optionalAccess', _83 => _83.fileName]) || "";
  m.seconds = _optionalChain([messageData, 'access', _84 => _84[m.type], 'optionalAccess', _85 => _85.seconds]) || 0;
  m.ptt = _optionalChain([messageData, 'access', _86 => _86[m.type], 'optionalAccess', _87 => _87.ptt]) || false;
  m.isAnimated = _optionalChain([messageData, 'access', _88 => _88[m.type], 'optionalAccess', _89 => _89.isAnimated]) || false;
  m.quotedMsg = m.quoted;
  m.quotedBody = _optionalChain([m, 'access', _90 => _90.quoted, 'optionalAccess', _91 => _91.body]) || "";
  m.quotedSender = _optionalChain([m, 'access', _92 => _92.quoted, 'optionalAccess', _93 => _93.sender]) || "";
  m.quotedType = _optionalChain([m, 'access', _94 => _94.quoted, 'optionalAccess', _95 => _95.type]) || "";
  m.hasQuotedMedia = _optionalChain([m, 'access', _96 => _96.quoted, 'optionalAccess', _97 => _97.isMedia]) || false;
  m.hasQuotedImage = _optionalChain([m, 'access', _98 => _98.quoted, 'optionalAccess', _99 => _99.isImage]) || false;
  m.hasQuotedVideo = _optionalChain([m, 'access', _100 => _100.quoted, 'optionalAccess', _101 => _101.isVideo]) || false;
  m.hasQuotedSticker = _optionalChain([m, 'access', _102 => _102.quoted, 'optionalAccess', _103 => _103.isSticker]) || false;
  m.hasQuotedAudio = _optionalChain([m, 'access', _104 => _104.quoted, 'optionalAccess', _105 => _105.isAudio]) || false;
  m.hasQuotedDocument = _optionalChain([m, 'access', _106 => _106.quoted, 'optionalAccess', _107 => _107.isDocument]) || false;
  m.isReply = m.isQuoted;
  m.hasMentions = m.mentionedJid.length > 0;
  m.isForwarded = _optionalChain([messageData, 'access', _108 => _108[m.type], 'optionalAccess', _109 => _109.contextInfo, 'optionalAccess', _110 => _110.isForwarded]) || false;
  m.forwardingScore = _optionalChain([messageData, 'access', _111 => _111[m.type], 'optionalAccess', _112 => _112.contextInfo, 'optionalAccess', _113 => _113.forwardingScore]) || 0;
  m.expiration = _optionalChain([messageData, 'access', _114 => _114[m.type], 'optionalAccess', _115 => _115.contextInfo, 'optionalAccess', _116 => _116.expiration]) || 0;
  m.ephemeralSettingTimestamp = msg.messageTimestamp || 0;
  m.ephemeralSettingTimestamp = msg.messageTimestamp || 0;

  const ensureResolved = async (jid) => {
    if (_almikulidjs.isLidConverted.call(void 0, jid) || _almikulidjs.isLid.call(void 0, jid)) {
      const pn = await _almikulidjs.resolveFromSock.call(void 0, jid, sock);
      if (pn && !_almikulidjs.isLidConverted.call(void 0, pn) && !_almikulidjs.isLid.call(void 0, pn)) {
        return pn;
      }
    }
    return jid;
  };

  /**
* Responder text con opciones
* @ param{string}texT Text) Respuesta
* @ param{Object}* Echotions *{}- Más operaciones
   * @returns {Promise<Object>} Sent message
   */
  m.reply = async (text, options = {}) => {
    if (!text && text !== 0) return null;

    const formatUptime = (uptime) => {
      const hours = Math.floor((uptime % 86400) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      return `${hours}Hora${minutes}Minuto`;
    };

    const db = _almikudatabasejs.getDatabase.call(void 0, );

    let srtImage = null;
    try {
      if (_optionalChain([db, 'optionalAccess', _117 => _117.setting, 'optionalCall', _118 => _118('srtEnabled')])) {
        const shuffleDir = _path.join.call(void 0, process.cwd(), 'assets', 'image', 'shuffle');
        if (_fs.existsSync.call(void 0, shuffleDir)) {
          const files = _fs2.default.readdirSync(shuffleDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.jpeg'));
          if (files.length > 0) {
            const randFile = files[Math.floor(Math.random() * files.length)];
            srtImage = _fs2.default.readFileSync(_path.join.call(void 0, shuffleDir, randFile));
          }
        }
      }
    } catch (e) { }

    let replyVariant = 1;
    try {
      replyVariant =
        _optionalChain([db, 'optionalAccess', _119 => _119.setting, 'optionalCall', _120 => _120("replyVariant")]) ||
        _optionalChain([db, 'optionalAccess', _121 => _121.db, 'optionalAccess', _122 => _122.data, 'optionalAccess', _123 => _123.settings, 'optionalAccess', _124 => _124.replyVariant]) ||
        1;
    } catch (e) {
      replyVariant = 1;
    }

    let contextInfo = {
      mentionedJid: _optionalChain([options, 'optionalAccess', _125 => _125.mentions]) || [_optionalChain([m, 'optionalAccess', _126 => _126.sender])] || [],
      ...options.contextInfo,
    };

    const defaultOptions = { contextInfo };

    let quotedMsg = options.quoted !== false ? msg : undefined;

    if (replyVariant === 2) {
      let troliThumbnail = null;
      quotedMsg = {
        key: {
          participant: `0@s.whatsapp.net`,
          remoteJid: `status@broadcast`,
        },
        message: {
          contactMessage: {
            displayName: `🪸 ${_optionalChain([_configjs2.default, 'access', _127 => _127.bot, 'optionalAccess', _128 => _128.name])}`,
            vcard: `BEGIN:VCARD\nVERSION:3.0\nN:XL;ttname,;;;\nFN:ttname\nitem1.TEL;waid=13135550002:+1 (313) 555-0002\nitem1.X-ABLabel:Ponsel\nEND:VCARD`,
            sendEphemeral: true,
          },
        },
      };

      return sock.sendMessage(
        await ensureResolved(m.chat),
        {
          document:
            await getCachedThumb(_path.join.call(void 0, process.cwd(), "package.json")) ||
            _fs2.default.readFileSync(_path.join.call(void 0, process.cwd(), "package.json")),
          mimetype: "image/png",
          fileName: _configjs2.default.bot.name,
          fileLength: 99999999999999,
          jpegThumbnail: srtImage ? await _sharp2.default.call(void 0, srtImage).resize(300, 300).toBuffer() : await _sharp2.default.call(void 0, _almikuassetmanagerjs.getAssetBuffer.call(void 0, "almiku2"))
            .resize(300, 300)
            .toBuffer(),
          caption: text,
          ...defaultOptions,
          ...options,
        },
        {
          quoted: quotedMsg,
        },
      );
    } else if (replyVariant === 3) {
      const uptime = process.uptime();
      const sss = _almikuassetmanagerjs.getAssetBuffer.call(void 0, "almiku3");
      return sock.sendMessage(
        await ensureResolved(m.chat),
        {
          video: _almikuassetmanagerjs.getAssetBuffer.call(void 0, "almiku-mp4"),
          caption: text,
          gifPlayback: true,
          contextInfo: {
            ...contextInfo,
          },
        },
        {
          quoted: m,
        },
      );
    } else if (replyVariant === 4) {
      const thumbnail = srtImage || _almikuassetmanagerjs.getAssetBuffer.call(void 0, "almiku");
      return sock.sendPreview(
        m.chat,
        {
          caption: `${_optionalChain([_configjs2.default, 'access', _129 => _129.info, 'optionalAccess', _130 => _130.website])}\n\n${text}`,
          url: _optionalChain([_configjs2.default, 'access', _131 => _131.info, 'optionalAccess', _132 => _132.website]) || "https://github.com",
          title: _optionalChain([_configjs2.default, 'access', _133 => _133.bot, 'optionalAccess', _134 => _134.name]) || "Al Miku-AI",
          description:
            `Desarrollador:${_configjs2.default.bot.developer}Versi:${_configjs2.default.bot.version}` ||
            "WhatsApp",
          image: thumbnail,
          previewType: 0,
        },
        {
          quoted: m,
          contextInfo: {
            mentionedJid: _optionalChain([options, 'optionalAccess', _135 => _135.mentions]) || [_optionalChain([m, 'optionalAccess', _136 => _136.sender])] || [],
            isForwarded: true,
            forwardingScore: 9,
            forwardedNewsletterMessageInfo: {
              newsletterJid: _optionalChain([_configjs2.default, 'access', _137 => _137.saluran, 'optionalAccess', _138 => _138.id]),
              newsletterName: _optionalChain([_configjs2.default, 'access', _139 => _139.saluran, 'optionalAccess', _140 => _140.name]) || _optionalChain([_configjs2.default, 'access', _141 => _141.bot, 'optionalAccess', _142 => _142.name]) || "Al Miku-AI",
              serverMessageId: Math.floor(Math.random() * 1000000),
            },
          },
        },
      );
    } else if (replyVariant === 5) {
      const thumbnailBuf = srtImage || _almikuassetmanagerjs.getAssetBuffer.call(void 0, "almiku");
      const fakeOrder = {
        key: {
          participant: "0@s.whatsapp.net",
          remoteJid: m.chat,
          fromMe: false,
        },
        message: {
          orderMessage: {
            orderId: "123456",
            itemCount: 999,
            status: 1,
            surface: 1,
            message: _optionalChain([_configjs2.default, 'access', _143 => _143.bot, 'optionalAccess', _144 => _144.name]) || "Al Miku-AI",
            orderTitle: "System Notification",
            sellerJid: "0@s.whatsapp.net",
            token: "ARU1+",
            totalAmount1000: "1000000",
            totalCurrencyCode: "IDR",
            thumbnail: await _sharp2.default.call(void 0, thumbnailBuf).resize(300, 300).toBuffer(),
          }
        }
      };

      return sock.sendMessage(
        await ensureResolved(m.chat),
        {
          text,
          ...defaultOptions,
          ...options,
        },
        {
          quoted: fakeOrder,
        }
      );
    } else if (replyVariant === 6) {
      return sock.sendMessage(
        await ensureResolved(m.chat),
        {
          document:
            await getCachedThumb(_path.join.call(void 0, process.cwd(), "package.json")) ||
            _fs2.default.readFileSync(_path.join.call(void 0, process.cwd(), "package.json")),
          mimetype: "image/png",
          fileName: _configjs2.default.bot.name,
          fileLength: 99999999999999,
          jpegThumbnail: srtImage ? await _sharp2.default.call(void 0, srtImage).resize(300, 300).toBuffer() : await _sharp2.default.call(void 0, _almikuassetmanagerjs.getAssetBuffer.call(void 0, "almiku2"))
            .resize(300, 300)
            .toBuffer(),
          caption: text,
          ...defaultOptions,
          ...options,
        },
        {
          quoted: m,
        },
      );
    } else if (replyVariant === 7) {
      const thumbnailBuf = srtImage || _almikuassetmanagerjs.getAssetBuffer.call(void 0, "almiku");

      const msg = _almiku.generateWAMessageFromContent.call(void 0, m.chat, {
        viewOnceMessage: {
          message: {
            messageContextInfo: {},
            interactiveMessage: {
              header: {
                hasMediaAttachment: true,
                locationMessage: {
                  degreesLatitude: 0,
                  degreesLongitude: 0,
                  name: _optionalChain([_configjs2.default, 'access', _145 => _145.bot, 'optionalAccess', _146 => _146.name]) || "Al Miku-AI",
                  address: "•",
                  jpegThumbnail: await _sharp2.default.call(void 0, thumbnailBuf).resize(300, 300).toBuffer(),
                }
              },
              body: {
                text: text,
              },
              contextInfo: {
                mentionedJid: _optionalChain([options, 'optionalAccess', _147 => _147.mentions]) || [_optionalChain([m, 'optionalAccess', _148 => _148.sender])] || [],
                isForwarded: true,
                forwardingScore: 9,
                ...options.contextInfo
              },
              nativeFlowMessage: {
                buttons: []
              }
            }
          }
        }
      }, { quoted: m, userJid: sock.user.jid });

      return sock.relayMessage(await ensureResolved(m.chat), msg.message, {
        messageId: msg.key.id,
      });
    } else if (replyVariant === 8) {
      const thumbnailBuf = srtImage || _almikuassetmanagerjs.getAssetBuffer.call(void 0, "almiku");

      return await sock.relayMessage(m.chat, {
        viewOnceMessage: {
          message: {
            interactiveMessage: {
              header: {
                title: _optionalChain([_configjs2.default, 'optionalAccess', _149 => _149.bot, 'optionalAccess', _150 => _150.name])
              },
              body: {
                text
              },
              nativeFlowMessage: {
                buttons: [
                  {
                    name: "inapp_signup",
                    buttonParamsJson: "{}"
                  }
                ]
              },
              contextInfo: {
                mentionedJid: _optionalChain([options, 'optionalAccess', _151 => _151.mentions]) || [_optionalChain([m, 'optionalAccess', _152 => _152.sender])] || [],
                groupMentions: [],
                statusAttributions: [],
                participant: _optionalChain([m, 'optionalAccess', _153 => _153.sender]),
                quotedMessage: {
                  orderMessage: {
                    orderId: "8999999999999",
                    thumbnail: await _sharp2.default.call(void 0, thumbnailBuf).resize(300, 300).toBuffer(),
                    itemCount: 999,
                    status: 1,
                    surface: 1,
                    message: _optionalChain([m, 'optionalAccess', _154 => _154.body]),
                    orderTitle: "blablabla",
                    sellerJid: "0@s.whatsapp.net",
                    totalAmount1000: 0,
                    totalCurrencyCode: "IDR"
                  }
                },
                remoteJid: m.chat,
                forwardingScore: 999,
                isForwarded: true
              }
            }
          }
        }
      }, {
      })
    } else if (replyVariant === 9) {
      const thumbnailBuf = srtImage || _almikuassetmanagerjs.getAssetBuffer.call(void 0, "almiku");

      return await sock.relayMessage(
        m.chat,
        {
          "orderMessage": {
            "orderId": "WXX",
            "thumbnail": thumbnailBuf,
            "itemCount": 1,
            "status": "INQUIRY",
            "surface": "CATALOG",
            "message": text,
            "orderTitle": "CONTOL",
            "token": "SDsdafma",
            "totalAmount1000": "0",
            "totalCurrencyCode": "IDR",
            "messageVersion": 1,
            "contextInfo": {
              "mentionedJid": _optionalChain([options, 'optionalAccess', _155 => _155.mentions]) || [_optionalChain([m, 'optionalAccess', _156 => _156.sender])] || [],
              "participant": _optionalChain([m, 'optionalAccess', _157 => _157.sender]),
              "quotedMessage": _optionalChain([m, 'optionalAccess', _158 => _158.message]) || {
                "conversation": _optionalChain([m, 'optionalAccess', _159 => _159.text]) || ""
              }
            }
          }
        },
        {}
      )
    } else if (replyVariant === 10) {
      return await sock.relayMessage(
        m.chat,
        {
          "requestPaymentMessage": {
            "currencyCodeIso4217": "IDR",
            "amount1000": "75000000",
            "requestFrom": _optionalChain([m, 'optionalAccess', _160 => _160.sender]) || "0@s.whatsapp.net",
            "noteMessage": {
              "extendedTextMessage": {
                "text": text,
                "contextInfo": {
                  "mentionedJid": _optionalChain([options, 'optionalAccess', _161 => _161.mentions]) || [_optionalChain([m, 'optionalAccess', _162 => _162.sender])] || [],
                  "participant": _optionalChain([m, 'optionalAccess', _163 => _163.sender]),
                  "quotedMessage": _optionalChain([m, 'optionalAccess', _164 => _164.message]) || {
                    "conversation": _optionalChain([m, 'optionalAccess', _165 => _165.text]) || ""
                  }
                }
              }
            }
          }
        },
        {}
      )
    } else if (replyVariant === 11) {
      const getRandomSrtImage = () => {
        try {
          if (_optionalChain([db, 'optionalAccess', _166 => _166.setting, 'optionalCall', _167 => _167('srtEnabled')])) {
            const shuffleDir = _path.join.call(void 0, process.cwd(), 'assets', 'image', 'shuffle');
            if (_fs.existsSync.call(void 0, shuffleDir)) {
              const files = _fs2.default.readdirSync(shuffleDir).filter(f => f.match(/\.(jpg|jpeg|png)$/i));
              if (files.length > 0) {
                const randFile = files[Math.floor(Math.random() * files.length)];
                return _fs2.default.readFileSync(_path.join.call(void 0, shuffleDir, randFile));
              }
            }
          }
        } catch (e) { }
        return null;
      };

      const randomImg = getRandomSrtImage();
      const thumbnailBuf = randomImg || srtImage || await _almikuassetmanagerjs.getAssetBuffer.call(void 0, "almiku");
      const { prepareWAMessageMedia } = await Promise.resolve().then(() => _interopRequireWildcard(require("almiku")));

      const thumbBuf1280 = await _sharp2.default.call(void 0, thumbnailBuf).resize(300, 300).jpeg().toBuffer();
      const favBuf512 = await _sharp2.default.call(void 0, thumbnailBuf).resize(512, 512).jpeg().toBuffer();

      const uploadMedia = await prepareWAMessageMedia({ image: thumbBuf1280 }, { upload: sock.waUploadToServer, mediaTypeOverride: "thumbnail-link" });
      const uploadFav = await prepareWAMessageMedia({ image: favBuf512 }, { upload: sock.waUploadToServer, mediaTypeOverride: "thumbnail-link" });

      const botName = _optionalChain([_configjs2.default, 'access', _168 => _168.bot, 'optionalAccess', _169 => _169.name]) || "Al Miku-AI";
      const senderNum = m.sender.split('@')[0];

      const msg = _almiku.generateWAMessageFromContent.call(void 0, m.chat, {
        extendedTextMessage: {
          text: _configjs2.default.info.website + "\n" + text,
          matchedText: _configjs2.default.info.website,
          title: botName,
          description: `Hello ${m.pushName || "User"}`,
          jpegThumbnail: await _sharp2.default.call(void 0, thumbnailBuf).resize(256, 256).jpeg({ quality: 80 }).toBuffer(),
          previewType: 1,
          faviconMMSMetadata: {
            thumbnailDirectPath: uploadFav.imageMessage.directPath,
            thumbnailSha256: uploadFav.imageMessage.fileSha256,
            thumbnailEncSha256: uploadFav.imageMessage.fileEncSha256,
            mediaKey: uploadFav.imageMessage.mediaKey,
            mediaKeyTimestamp: uploadFav.imageMessage.mediaKeyTimestamp,
            thumbnailHeight: uploadFav.imageMessage.height || 512,
            thumbnailWidth: uploadFav.imageMessage.width || 512
          },
          contextInfo: {
            mentionedJid: _optionalChain([options, 'optionalAccess', _170 => _170.mentions]) || [_optionalChain([m, 'optionalAccess', _171 => _171.sender])] || [],
            isForwarded: true,
            forwardingScore: 999,
            forwardedNewsletterMessageInfo: {
              newsletterJid: _optionalChain([_configjs2.default, 'access', _172 => _172.saluran, 'optionalAccess', _173 => _173.id]),
              newsletterName: _optionalChain([_configjs2.default, 'access', _174 => _174.saluran, 'optionalAccess', _175 => _175.name])
            }
          }
        }
      }, {
        quoted: {
          key: {
            fromMe: false,
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast"
          },
          message: {
            contactMessage: {
              displayName: botName,
              vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:${botName}\nTEL;type=CELL;type=VOICE;waid=${senderNum}:+${senderNum}\nEND:VCARD`
            }
          }
        }
      });

      return sock.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    }

    return sock.sendMessage(
      await ensureResolved(m.chat),
      {
        text,
        ...defaultOptions,
        ...options,
      },
      {
        quoted: quotedMsg,
      },
    );
  };

  /**
* Responder text con las mensiones automáticas
* @ param{string}texT Texcompartido
   * @returns {Promise<Object>} Sent message
   */
  m.replyWithMentions = async (text) => {
    const mentions = [...text.matchAll(/@(\d+)/g)].map(
      (match) => `${match[1]}@s.whatsapp.net`,
    );
    return m.reply(text, { mentions });
  };

  /**
* Imagen de la respuesta
* @ param { Buffer { Buffer} Viewind - Buffer o imagen URL
   * @param {string} [caption=''] - Caption
* @ param{Object}* Echotions *{}- Más operaciones
   * @returns {Promise<Object>} Sent message
   */
  m.replyImage = async (image, caption = "", options = {}) => {
    let buffer = image;
    if (typeof image === "string" && image.startsWith("http")) {
      const response = await _axios2.default.get(image, { responseType: "arraybuffer" });
      buffer = Buffer.from(response.data);
    }

    return sock.sendMessage(
      await ensureResolved(m.chat),
      {
        image: buffer,
        caption,
        contextInfo: options.contextInfo,
        mentions: options.mentions || [],
      },
      {
        quoted: options.quoted !== false ? msg : undefined,
      },
    );
  };

  /**
* Responder video
* @ param { Buffer Takenstring } video - Buffer o URL video
   * @param {string} [caption=''] - Caption
* @ param{Object}* Echotions *{}- Más operaciones
   * @returns {Promise<Object>} Sent message
   */
  m.replyVideo = async (video, caption = "", options = {}) => {
    let buffer = video;
    if (typeof video === "string" && video.startsWith("http")) {
      const response = await _axios2.default.get(video, { responseType: "arraybuffer" });
      buffer = Buffer.from(response.data);
    }

    return sock.sendMessage(
      await ensureResolved(m.chat),
      {
        video: buffer,
        caption,
        gifPlayback: options.gif || false,
        contextInfo: options.contextInfo,
        mentions: options.mentions || [],
      },
      {
        quoted: options.quoted !== false ? msg : undefined,
      },
    );
  };

  /**
* Responder audio / voise note
* @ param { Buffer Takenstring } audio - Buffer o audio URL
* @ param{boolean}- Nota de voz o no.
* @ param{Object}* Echotions *{}- Más operaciones
   * @returns {Promise<Object>} Sent message
   */
  m.replyAudio = async (audio, ptt = false, options = {}) => {
    let buffer = audio;
    if (typeof audio === "string" && audio.startsWith("http")) {
      const response = await _axios2.default.get(audio, { responseType: "arraybuffer" });
      buffer = Buffer.from(response.data);
    }

    return sock.sendMessage(
      await ensureResolved(m.chat),
      {
        audio: buffer,
        ptt,
        mimetype: "audio/mpeg",
      },
      {
        quoted: options.quoted !== false ? msg : undefined,
      },
    );
  };

  /**
* Responder sticker
   * @param {Buffer|string} sticker - Buffer sticker
* @ param{Object}* Echotions *{}- Más operaciones
   * @returns {Promise<Object>} Sent message
   */
  m.replySticker = async (sticker, options = {}) => {
    let buffer = sticker;
    if (typeof sticker === "string" && sticker.startsWith("http")) {
      const response = await _axios2.default.get(sticker, {
        responseType: "arraybuffer",
      });
      buffer = Buffer.from(response.data);
    }

    return sock.sendMessage(
      await ensureResolved(m.chat),
      {
        sticker: buffer,
      },
      {
        quoted: options.quoted !== false ? msg : undefined,
      },
    );
  };

  /**
* Respuesta al documento
* @ param { Buffer Takstring } documento de amortiguación
* @ param{string}Nombre del archivo - Nombre del archivo
   * @param {string} [mimetype] - MIME type
* @ param{Object}* Echotions *{}- Más operaciones
   * @returns {Promise<Object>} Sent message
   */
  m.replyDocument = async (
    document,
    fileName,
    mimetype = "application/octet-stream",
    options = {},
  ) => {
    let buffer = document;
    if (typeof document === "string" && document.startsWith("http")) {
      const response = await _axios2.default.get(document, {
        responseType: "arraybuffer",
      });
      buffer = Buffer.from(response.data);
    }

    return sock.sendMessage(
      await ensureResolved(m.chat),
      {
        document: buffer,
        fileName,
        mimetype,
        caption: options.caption || "",
      },
      {
        quoted: options.quoted !== false ? msg : undefined,
      },
    );
  };

  /**
* Responder contacto
* @ param{string}Número uno en
* @ param{string}nombre - Nombre de Conn
* @ param{Object}* Echotions *{}- Más operaciones
   * @returns {Promise<Object>} Sent message
   */
  m.replyContact = async (number, name, options = {}) => {
    const cleanNumber = number.replace(/[^0-9]/g, "");

    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL;type=CELL;type=VOICE;waid=${cleanNumber}:+${cleanNumber}
END:VCARD`;

    return sock.sendMessage(
      await ensureResolved(m.chat),
      {
        contacts: {
          displayName: name,
          contacts: [{ vcard }],
        },
      },
      {
        quoted: options.quoted !== false ? msg : undefined,
      },
    );
  };

  /**
* Responder ubicación
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
* @ param{Object}* Echotions *{}- Más operaciones
   * @returns {Promise<Object>} Sent message
   */
  m.replyLocation = async (latitude, longitude, options = {}) => {
    return sock.sendMessage(
      await ensureResolved(m.chat),
      {
        location: {
          degreesLatitude: latitude,
          degreesLongitude: longitude,
          name: options.name || "",
          address: options.address || "",
        },
      },
      {
        quoted: options.quoted !== false ? msg : undefined,
      },
    );
  };

  /**
* Responder con cita falsa
* @ param{string}texT Text) Respuesta
   * @param {string} fakeJid - JID palsu
   * @param {string} fakeText - Text palsu di quote
* @ param{Object}* Echotions *{}- Más operaciones
   * @returns {Promise<Object>} Sent message
   */
  m.replyWithQuote = async (text, fakeJid, fakeText, options = {}) => {
    const fakeMsg = {
      key: {
        fromMe: false,
        participant: fakeJid,
        remoteJid: m.chat,
      },
      message: {
        conversation: fakeText,
      },
      pushName: options.pushName || "Bot",
    };

    return sock.sendMessage(
      await ensureResolved(m.chat),
      {
        text,
        contextInfo: {
          ...createContextInfo(
            fakeJid,
            fakeText,
            options.title,
            options.body,
            options.thumbnail,
          ),
          mentionedJid: options.mentions || [],
        },
      },
      {
        quoted: fakeMsg,
      },
    );
  };

  /**
* Responder con miniatura ( e)xTernal ad responder )
* @ param{string}texT Text) Respuesta
   * @param {Object} preview - Preview options
   * @param {string} preview.title - Judul
   * @param {string} [preview.body] - Body
   * @param {Buffer} [preview.thumbnail] - Thumbnail
   * @param {string} [preview.sourceUrl] - URL sumber
* @ param{Object}* Echotions *{}- Más operaciones
   * @returns {Promise<Object>} Sent message
   */
  m.replyWithPreview = async (text, preview, options = {}) => {
    const ctx = _almikucontextjs.saluranCtx.call(void 0, );
    ctx.mentionedJid = options.mentions || [];
    return sock.sendMessage(
      await ensureResolved(m.chat),
      {
        text,
        contextInfo: ctx,
      },
      {
        quoted: options.quoted !== false ? msg : undefined,
      },
    );
  };

  /**
* Reaccionar al mensaje
* @ param{string}emoji - Emoji para reacciones
   * @returns {Promise<Object>} Result
   */
  m.react = async (emoji) => {
    try {
      return await sock.sendMessage(await ensureResolved(m.chat), {
        react: {
          text: emoji,
          key: msg.key,
        },
      });
    } catch (e) {
      return null;
    }
  };

  /**
* Descargar medios de comunicación de este mensaje
* @ param{string}*Nombre de archivo* - *El nombre de archivo para salvar*
* @ devuelve { Promesa<Buffer|string>Archivo de amortiguación o ruta
   */
  m.download = async (filename = null) => {
    if (!m.isMedia) return null;

    const stream = await _almiku.downloadContentFromMessage.call(void 0, 
      messageData[m.type],
      m.type.replace("Message", ""),
    );

    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk]);
    }

    if (filename) {
      const tempDir = _path.join.call(void 0, process.cwd(), "storage", "temp");
      if (!_fs.existsSync.call(void 0, tempDir)) {
        _fs.mkdirSync.call(void 0, tempDir, { recursive: true });
      }
      const filepath = _path.join.call(void 0, tempDir, filename);
      _fs.writeFileSync.call(void 0, filepath, buffer);
      return filepath;
    }

    return buffer;
  };

  /**
* Eliminar este mensaje
   * @returns {Promise<Object>} Result
   */
  m.delete = async () => {
    return sock.sendMessage(m.chat, {
      delete: msg.key,
    });
  };

  /**
* Mensaje previo a otro JID
   * @param {string} jid - JID tujuan
   * @param {boolean} [forceForward=false] - Force forward label
   * @returns {Promise<Object>} Result
   */
  m.forward = async (jid, forceForward = false) => {
    return sock.sendMessage(jid, {
      forward: msg,
      force: forceForward,
    });
  };

  /**
* Copiar un mensaje a otro JID
   * @param {string} jid - JID tujuan
* @ param{Object}* Echotions *{}- Más operaciones
   * @returns {Promise<Object>} Result
   */
  m.copy = async (jid, options = {}) => {
    const content = {};

    if (m.isImage) {
      content.image = await m.download();
      content.caption = m.body;
    } else if (m.isVideo) {
      content.video = await m.download();
      content.caption = m.body;
    } else if (m.isAudio) {
      content.audio = await m.download();
    } else if (m.isSticker) {
      content.sticker = await m.download();
    } else if (m.isDocument) {
      content.document = await m.download();
      content.fileName = _optionalChain([messageData, 'access', _176 => _176[m.type], 'optionalAccess', _177 => _177.fileName]) || "file";
      content.mimetype = _optionalChain([messageData, 'access', _178 => _178[m.type], 'optionalAccess', _179 => _179.mimetype]);
    } else {
      content.text = m.body;
    }

    return sock.sendMessage(await ensureResolved(jid), content, options);
  };

  m.timestamp = msg.messageTimestamp;
  m.raw = msg;

  //Salvaguardia final: si el chat no ha sido resuelto con éxito, trate de resolverlo en objeto creado (retrocedimiento de fondo).
  if (m.chat && (_almikulidjs.isLidConverted.call(void 0, m.chat) || _almikulidjs.isLid.call(void 0, m.chat))) {
    _almikulidjs.resolveFromSock.call(void 0, m.chat, sock).then((resolved) => {
      if (resolved && !_almikulidjs.isLidConverted.call(void 0, resolved) && !_almikulidjs.isLid.call(void 0, resolved)) {
        m.chat = resolved;
        m.from = resolved;
        m.jid = resolved;
        m.remoteJid = resolved;
      }
    }).catch(() => { });
  }

  return m;
}

/**
 * Get number from JID
 * @param {string} jid - JID
 * @returns {string} Number
 */
function getNumber(jid) {
  if (!jid) return "";
  return jid.replace(/@.+/g, "");
}

/**
 * Create JID from number
* @ param{string}- Número uno.
 * @returns {string} JID
 */
function createJid(number) {
  if (!number) return "";
  const cleaned = number.replace(/[^0-9]/g, "");
  return cleaned + "@s.whatsapp.net";
}














exports.serialize = serialize; exports.decodeJid = decodeJid; exports.getMessageType = getMessageType; exports.getMessageBody = getMessageBody; exports.parseCommand = parseCommand; exports.serializeQuotedMessage = serializeQuotedMessage; exports.createContextInfo = createContextInfo; exports.getNumber = getNumber; exports.createJid = createJid; exports.getCachedThumb = getCachedThumb; exports.getCachedSharpThumb = getCachedSharpThumb; exports.invalidatePrefixCache = invalidatePrefixCache;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almiku = require('almiku');
var _fs = require('fs');
var _path = require('path');

const lidCache = new Map();
const LID_CACHE_PATH = _path.join.call(void 0, process.cwd(), "database", "lid-cache.json");
let _persistDirty = false;
let _persistTimer = null;

function loadPersistentCache() {
  try {
    if (_fs.existsSync.call(void 0, LID_CACHE_PATH)) {
      const data = JSON.parse(_fs.readFileSync.call(void 0, LID_CACHE_PATH, "utf8"));
      if (data && typeof data === "object") {
        for (const [k, v] of Object.entries(data)) {
          if (!lidCache.has(k)) lidCache.set(k, v);
        }
      }
    }
  } catch (e) {}
}

function savePersistentCache() {
  if (!_persistDirty) return;
  try {
    const dirPath = _path.join.call(void 0, process.cwd(), "database");
    if (!_fs.existsSync.call(void 0, dirPath)) _fs.mkdirSync.call(void 0, dirPath, { recursive: true });
    const obj = Object.fromEntries(lidCache);
    _fs.writeFileSync.call(void 0, LID_CACHE_PATH, JSON.stringify(obj));
    _persistDirty = false;
  } catch (e2) {}
}

function markDirty() {
  _persistDirty = true;
  if (!_persistTimer) {
    _persistTimer = setTimeout(() => {
      _persistTimer = null;
      savePersistentCache();
    }, 10000);
  }
}

loadPersistentCache();
process.on("exit", savePersistentCache);
process.on("SIGINT", () => {
  savePersistentCache();
  process.exit(0);
});
process.on("uncaughtException", (err) => {
  savePersistentCache();
  // No silenciar el error: sin esto el bot se apagaba sin decir por qué.
  console.error("[almiku-lid] uncaughtException:", (err && err.stack) || err);
});

/**
 * Cache LID to JID mapping
* Llame esto mientras procesa metadatos de grupo para almacenar mapeo
 *
 * HANDLES TWO DIFFERENT STRUCTURES:
* 1. groupMetadata.
* 2.
 *
 * @param {Object[]} participants - Array participant
 */
function cacheParticipantLids(participants = []) {
  for (const p of participants) {
    let pLid = "";
    let pJid = "";

    if (p.lid && p.lid.endsWith("@lid")) {
      pLid = p.lid;
      pJid = p.id || p.jid || "";
    } else if (p.phoneNumber) {
      pLid = p.id || "";
      pJid = p.phoneNumber;
    } else if (p.id && p.id.endsWith("@lid")) {
      pLid = p.id;
      pJid = p.jid || "";
    } else {
      pLid = p.lid || "";
      pJid = p.id || p.jid || "";
    }

    if (
      pLid &&
      pJid &&
      pLid.endsWith("@lid") &&
      !pJid.endsWith("@lid") &&
      !isLidConverted(pJid)
    ) {
      lidCache.set(pLid, pJid);
      const lidNumber = pLid.replace("@lid", "");
      lidCache.set(lidNumber + "@s.whatsapp.net", pJid);
      markDirty();
    }
  }
}

/**
 * Get cached JID for a LID
* @ param{string}lid - LD o LD - JID convertidos
* @ devuelve { cadena dafu } Caché JID o nul si no
 */
function getCachedJid(lid) {
  return lidCache.get(lid) || null;
}

/**
* Comproba si JID es un forte LID
* @ param{string}jid JID para interceptar
* @ devuelves{boolean}Cierto si LD
 */
function isLid(jid) {
  if (!jid) return false;
  return jid.endsWith("@lid");
}

/**
* Comproba si JID es el resultado equivocado de la convergencia LED
* ( JID CON SUFFIx@ s. Whatsappp. Net pero el número es LED número, no número de teléfono )
* NUMBER LED SOLO: Muy largo, no comenzó con el código de estado normal
* @ param{string}jid JID para interceptar
* @ devuelves{boolean}Verdadero si lo posible llevó a un LID ya conversado
 */
function isLidConverted(jid) {
  if (!jid) return false;
  if (!jid.endsWith("@s.whatsapp.net")) return false;

  const number = jid.replace("@s.whatsapp.net", "");

  if (number.length > 14) return true;
  const validCountryCodes = [
    "1",
    "7",
    "20",
    "27",
    "30",
    "31",
    "32",
    "33",
    "34",
    "36",
    "39",
    "40",
    "41",
    "43",
    "44",
    "45",
    "46",
    "47",
    "48",
    "49",
    "51",
    "52",
    "53",
    "54",
    "55",
    "56",
    "57",
    "58",
    "60",
    "61",
    "62",
    "63",
    "64",
    "65",
    "66",
    "81",
    "82",
    "84",
    "86",
    "90",
    "91",
    "92",
    "93",
    "94",
    "95",
    "98",
    "212",
    "213",
    "216",
    "218",
    "220",
    "221",
    "234",
    "249",
    "254",
    "255",
    "256",
    "260",
    "263",
    "351",
    "352",
    "353",
    "354",
    "355",
    "356",
    "357",
    "358",
    "359",
    "370",
    "371",
    "372",
    "373",
    "374",
    "375",
    "376",
    "377",
    "378",
    "380",
    "381",
    "382",
    "383",
    "385",
    "386",
    "387",
    "389",
    "420",
    "421",
    "423",
    "852",
    "853",
    "855",
    "856",
    "880",
    "886",
    "960",
    "961",
    "962",
    "963",
    "964",
    "965",
    "966",
    "967",
    "968",
    "970",
    "971",
    "972",
    "973",
    "974",
    "975",
    "976",
    "977",
    "992",
    "993",
    "994",
    "995",
    "996",
    "998",
  ];
  for (const code of validCountryCodes) {
    if (
      number.startsWith(code) &&
      number.length >= code.length + 6 &&
      number.length <= code.length + 12
    ) {
      return false;
    }
  }

  return true;
}

/**
* Convertir LD en la forma de soporte JID
El LID tiene un ID único que es diferente del número de teléfonos.
* Está función sólo tiene la oportunidadx, para conseguir un número ágil
* Use resolve Live From Participants with group metadata.
* @ param{string}Jid JID QUE LUZ LID
* @ devuelves{string}JID en forte @ s. whatsapp.
 */
function lidToJid(jid) {
  if (!jid) return jid;
  const cached = lidCache.get(jid);
  if (cached && !isLidConverted(cached)) return cached;
  if (jid.endsWith("@lid")) {
    const swJid = jid.replace("@lid", "@s.whatsapp.net");
    const cached2 = lidCache.get(swJid);
    if (cached2 && !isLidConverted(cached2)) return cached2;
    return swJid;
  }
  return jid;
}

function lidToJidSafe(jid) {
  if (!jid) return null;
  const cached = lidCache.get(jid);
  if (cached && !isLidConverted(cached)) return cached;
  if (jid.endsWith("@lid")) {
    const swJid = jid.replace("@lid", "@s.whatsapp.net");
    const cached2 = lidCache.get(swJid);
    if (cached2 && !isLidConverted(cached2)) return cached2;
  }
  return null;
}

/**
* Exnúmero de pista de cualquier JID ( LOVED LID )
 * @param {string} jid - JID
* @ devuelves{string}Número de telefono
 */
async function extractNumber(jid) {
  if (!jid) return "";
  return jid.replace(/@.+/g, "");
}

/**
* Resolve LD o LD - JID convertido a AJD asli utiliza metadatos de grupo
* Los participantes estructuran de nuestro (grupos. js ):
* - id: número de teléfono o jid (horgado direcciónMode )
* - id: forma de LD
* - admin: tipo admin
* @ param{string}jid - JID que puede ser LD o LD - convertido
- Aprendizaje de metadatos de grupo
* @ devuelves{string}JID que ya ha resuelto el número de asli
 */
function resolveLidFromParticipants(jid, participants = []) {
  if (!jid) return jid;
  if (!participants || participants.length === 0) return jid;

  const lidNumber = jid.replace(/@.*$/, "");
  const lidFormat = lidNumber + "@lid";

  for (const p of participants) {
    let pLid = "";
    let pJid = "";

    if (p.lid && p.lid.endsWith("@lid")) {
      pLid = p.lid;
      pJid = p.id || p.jid || "";
    } else if (p.phoneNumber) {
      pLid = p.id || "";
      pJid = p.phoneNumber;
    } else if (p.id && p.id.endsWith("@lid")) {
      pLid = p.id;
      pJid = p.jid || "";
    } else {
      pLid = p.lid || "";
      pJid = p.id || p.jid || "";
    }

    const pLidNumber = pLid.replace("@lid", "");

    if (pLid === lidFormat || pLid === jid || pLidNumber === lidNumber) {
      if (pJid && !pJid.endsWith("@lid") && !isLidConverted(pJid)) {
        return pJid;
      }
    }
  }

  return isLid(jid) ? lidToJid(jid) : jid;
}

/**
* Resolve JID que podría LD - convertir a Agli JID
* Está función es el caso en el que JID ya tiene @ s.
* @ param{string}JID para resolver
- Aprendizaje de metadatos de grupo
* @ devuelves{string}JID con número de teléfono original
 */
function resolveAnyLidToJid(jid, participants = []) {
  if (!jid) return jid;

  //Comprobar la empresa cache ( importante para el adiós donde los participantes ya están fuera )
  const cached = getCachedJid(jid);
  if (cached) {
    return cached;
  }

  //También comprobar. forte LED en caché
  if (jid.endsWith("@s.whatsapp.net")) {
    const lidFormat = jid.replace("@s.whatsapp.net", "@lid");
    const cachedFromLid = getCachedJid(lidFormat);
    if (cachedFromLid) {
      return cachedFromLid;
    }
  }

  if (!participants || participants.length === 0) return jid;

  cacheParticipantLids(participants);

  if (isLid(jid)) {
    const resolved = resolveLidFromParticipants(jid, participants);
    if (resolved !== jid && !isLidConverted(resolved)) {
      lidCache.set(jid, resolved);
    }
    return resolved;
  }

  if (isLidConverted(jid)) {
    const lidNumber = jid.replace("@s.whatsapp.net", "");
    const lidFormat = lidNumber + "@lid";
    for (const p of participants) {
      let pLid = "";
      let pJid = "";

      if (p.lid && p.lid.endsWith("@lid")) {
        pLid = p.lid;
        pJid = p.id || p.jid || "";
      } else if (p.phoneNumber) {
        pLid = p.id || "";
        pJid = p.phoneNumber;
      } else if (p.id && p.id.endsWith("@lid")) {
        pLid = p.id;
        pJid = p.jid || "";
      } else {
        pLid = p.lid || "";
        pJid = p.id || p.jid || "";
      }

      if (pLid === lidFormat || pLid === jid) {
        if (pJid && !pJid.endsWith("@lid") && !isLidConverted(pJid)) {
          lidCache.set(jid, pJid);
          lidCache.set(lidFormat, pJid);
          return pJid;
        }
      }

      const pLidNumber = pLid.replace("@lid", "");
      if (pLidNumber === lidNumber) {
        if (pJid && !pJid.endsWith("@lid") && !isLidConverted(pJid)) {
          lidCache.set(jid, pJid);
          lidCache.set(pLid, pJid);
          return pJid;
        }
      }
    }
  }

  return jid;
}

/**
 * Convert array of JIDs, replacing any LIDs or LID-converted JIDs
 * @param {string[]} jids - Array of JIDs
 * @param {Object[]} participants - Optional group participants
 * @returns {string[]} Array of converted JIDs
 */
function convertLidArray(jids, participants = []) {
  if (!Array.isArray(jids)) return [];

  return jids.map((jid) => resolveAnyLidToJid(jid, participants));
}

/**
* Decodificar JID y devolverlo en forma estándar
* @ param{string}Jid - JID a decodificar
* @ devuelve { cadena dhalul } decodificado o nul
 */
function decodeAndNormalize(jid) {
  if (!jid) return null;
  if (isLid(jid)) {
    jid = lidToJid(jid);
  }
  if (/:\d+@/gi.test(jid)) {
    const decoded = _almiku.jidDecode.call(void 0, jid) || {};
    if (decoded.user && decoded.server) {
      return decoded.user + "@" + decoded.server;
    }
  }
  return jid;
}

/**
* Participante de conversión JID del mensaje
 * @param {Object} msg - Message object
 * @param {Object} sock - Socket connection
 * @returns {Promise<string>} Resolved participant JID
 */
async function resolveParticipant(msg, sock) {
  const participant = _optionalChain([msg, 'access', _ => _.key, 'optionalAccess', _2 => _2.participant]);
  if (!participant) return null;
  if (!isLid(participant)) return participant;
  if (msg.participantPn) {
    return msg.participantPn;
  }
  if (_optionalChain([msg, 'access', _3 => _3.key, 'optionalAccess', _4 => _4.remoteJid, 'optionalAccess', _5 => _5.endsWith, 'call', _6 => _6("@g.us")]) && sock) {
    try {
      const metadata = await sock.groupMetadata(msg.key.remoteJid);
      return resolveLidFromParticipants(participant, metadata.participants);
    } catch (e3) {
      // Fallback
    }
  }
  return lidToJid(participant);
}

/**
* Ayudante a obtener un Agli JID de participante (con metadatos de grupo)
* Basado en la estructura de partispant de Baileys:
* - id: podría ser LD o JID asli
* - jid: Agli JID ( número de teléfono)
* - id: LD para participante
* @ param{Object}participantes - Objeto de grupoMetadatos participantes.
* @ devuelves{string}Un posible JID por mencionar
 */
function getParticipantJid(participant) {
  if (!participant) return "";

  // Prefer p.jid (real phone number) - this is the most reliable
  if (
    participant.jid &&
    !participant.jid.endsWith("@lid") &&
    !isLidConverted(participant.jid)
  ) {
    return participant.jid;
  }

  //Retroceder a p.
  if (
    participant.id &&
    !participant.id.endsWith("@lid") &&
    !isLidConverted(participant.id)
  ) {
    return participant.id;
  }

  //Fallback: Conversiones LID a JID forte (esto puede estar todavía mal )
  return lidToJid(participant.id || participant.lid || "");
}

/**
* Convertir todos los IDs de los participantes en un formato que puede ser -mención
* @ param
 * @returns {string[]} Array of JIDs
 */
function getParticipantJids(participants = []) {
  return participants.map((p) => getParticipantJid(p));
}

function findParticipantByNumber(participants, targetJid) {
  if (!participants || !targetJid) return null;

  const targetNumber = targetJid.replace(/@.*$/, "");

  for (const p of participants) {
    const pId = (p.id || "").replace(/@.*$/, "");
    const pJid = (p.jid || "").replace(/@.*$/, "");
    const pLid = (p.lid || "").replace(/@.*$/, "");

    if (
      pId === targetNumber ||
      pJid === targetNumber ||
      pLid === targetNumber
    ) {
      return p;
    }
  }

  return null;
}

function normalizeToPhoneNumber(jid, participants = []) {
  if (!jid) return "";

  const cached = getCachedJid(jid);
  if (cached && !isLidConverted(cached)) {
    return cached.replace(/@.+/g, "").replace(/[^0-9]/g, "");
  }

  if (isLid(jid) || isLidConverted(jid)) {
    const resolved = resolveAnyLidToJid(jid, participants);
    if (resolved && !isLidConverted(resolved)) {
      return resolved.replace(/@.+/g, "").replace(/[^0-9]/g, "");
    }
  }

  return jid.replace(/@.+/g, "").replace(/[^0-9]/g, "");
}

function cacheLidJid(lid, jid) {
  if (!lid || !jid) return;
  if (isLid(jid) || isLidConverted(jid)) return;
  lidCache.set(lid, jid);
  markDirty();
}

async function resolveFromSock(jid, sock) {
  if (!jid || !sock) return jid;
  try {
    const repo = sock.signalRepository || sock.repository;
    if (_optionalChain([repo, 'optionalAccess', _7 => _7.lidMapping, 'optionalAccess', _8 => _8.getPNForLID])) {
      const pn = await repo.lidMapping.getPNForLID(jid);
      if (pn && !isLid(pn) && !isLidConverted(pn)) {
        cacheLidJid(jid, pn);
        return pn;
      }
    }

    if (sock.store && sock.store.contacts) {
      for (const [pnJid, contact] of Object.entries(sock.store.contacts)) {
        if (contact.lid === jid || contact.id === jid) {
          if (pnJid && !isLid(pnJid) && !isLidConverted(pnJid) && pnJid !== "status@broadcast") {
            cacheLidJid(jid, pnJid);
            return pnJid;
          }
        }
      }
    }
  } catch (e4) {}
  return jid;
}

function getLidCacheSize() {
  return lidCache.size;
}






















exports.isLid = isLid; exports.isLidConverted = isLidConverted; exports.lidToJid = lidToJid; exports.lidToJidSafe = lidToJidSafe; exports.extractNumber = extractNumber; exports.resolveLidFromParticipants = resolveLidFromParticipants; exports.resolveAnyLidToJid = resolveAnyLidToJid; exports.convertLidArray = convertLidArray; exports.decodeAndNormalize = decodeAndNormalize; exports.resolveParticipant = resolveParticipant; exports.getParticipantJid = getParticipantJid; exports.getParticipantJids = getParticipantJids; exports.findParticipantByNumber = findParticipantByNumber; exports.cacheParticipantLids = cacheParticipantLids; exports.getCachedJid = getCachedJid; exports.normalizeToPhoneNumber = normalizeToPhoneNumber; exports.cacheLidJid = cacheLidJid; exports.resolveFromSock = resolveFromSock; exports.getLidCacheSize = getLidCacheSize; exports.savePersistentCache = savePersistentCache;

if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourin = require('ourin');
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
});

/**
 * Cache LID to JID mapping
 * Panggil ini saat memproses group metadata untuk menyimpan mapping
 *
 * HANDLES TWO DIFFERENT STRUCTURES:
 * 1. groupMetadata.participants: { id: PN, lid: LID, admin }
 * 2. GroupHandler events:        { id: LID, phoneNumber: PN, admin }
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
 * @param {string} lid - LID atau LID-converted JID
 * @returns {string|null} Cached JID atau null jika tidak ada
 */
function getCachedJid(lid) {
  return lidCache.get(lid) || null;
}

/**
 * Cek apakah JID adalah format LID
 * @param {string} jid - JID untuk dicek
 * @returns {boolean} True jika LID
 */
function isLid(jid) {
  if (!jid) return false;
  return jid.endsWith("@lid");
}

/**
 * Cek apakah JID adalah hasil konversi LID yang salah
 * (JID dengan suffix @s.whatsapp.net tapi nomornya adalah LID number, bukan phone number)
 * LID number biasanya: sangat panjang, tidak dimulai dengan kode negara normal
 * @param {string} jid - JID untuk dicek
 * @returns {boolean} True jika kemungkinan LID yang sudah dikonversi
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
 * Convert LID ke format JID standard
 * CATATAN: LID memiliki ID unik yang berbeda dari nomor telepon.
 * Fungsi ini hanya mengganti suffix, untuk mendapatkan nomor asli
 * gunakan resolveLidFromParticipants dengan group metadata.
 * @param {string} jid - JID yang mungkin LID
 * @returns {string} JID dalam format @s.whatsapp.net
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
 * Extract nomor dari JID apapun (termasuk LID)
 * @param {string} jid - JID
 * @returns {string} Nomor telepon
 */
async function extractNumber(jid) {
  if (!jid) return "";
  return jid.replace(/@.+/g, "");
}

/**
 * Resolve LID atau LID-converted JID ke JID asli menggunakan group metadata
 * Participant structure dari ourin (groups.js):
 * - id: phone_number atau jid (tergantung addressingMode)
 * - lid: LID format
 * - admin: type admin
 * @param {string} jid - JID yang mungkin LID atau LID-converted
 * @param {Object[]} participants - Array participant dari group metadata
 * @returns {string} JID yang sudah resolve ke nomor asli
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
 * Resolve JID yang mungkin LID-converted ke JID asli
 * Fungsi ini menangani case dimana JID sudah punya @s.whatsapp.net tapi nomornya adalah LID number
 * @param {string} jid - JID untuk diresolve
 * @param {Object[]} participants - Array participant dari group metadata
 * @returns {string} JID dengan nomor telepon asli
 */
function resolveAnyLidToJid(jid, participants = []) {
  if (!jid) return jid;

  // Check cache first (penting untuk goodbye dimana participant sudah keluar)
  const cached = getCachedJid(jid);
  if (cached) {
    return cached;
  }

  // Also check LID format in cache
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
 * Decode JID dan kembalikan dalam format standard
 * @param {string} jid - JID untuk didecode
 * @returns {string|null} JID yang sudah didecode atau null
 */
function decodeAndNormalize(jid) {
  if (!jid) return null;
  if (isLid(jid)) {
    jid = lidToJid(jid);
  }
  if (/:\d+@/gi.test(jid)) {
    const decoded = _ourin.jidDecode.call(void 0, jid) || {};
    if (decoded.user && decoded.server) {
      return decoded.user + "@" + decoded.server;
    }
  }
  return jid;
}

/**
 * Konversi participant JID dari message
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
 * Helper untuk mendapatkan JID asli dari participant (dengan group metadata)
 * Berdasarkan struktur participant dari Baileys:
 * - id: bisa LID atau JID asli
 * - jid: JID asli (nomor telepon)
 * - lid: LID untuk participant
 * @param {Object} participant - Participant object dari groupMetadata.participants
 * @returns {string} JID yang bisa digunakan untuk mention
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

  // Fallback to p.id if it's a real JID (bukan LID dan bukan LID-converted)
  if (
    participant.id &&
    !participant.id.endsWith("@lid") &&
    !isLidConverted(participant.id)
  ) {
    return participant.id;
  }

  // Fallback: konversi LID ke format JID (ini mungkin masih salah)
  return lidToJid(participant.id || participant.lid || "");
}

/**
 * Convert semua participant IDs ke format yang bisa di-mention
 * @param {Object[]} participants - Array participant dari groupMetadata
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

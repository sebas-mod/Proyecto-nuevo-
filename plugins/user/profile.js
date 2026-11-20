"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _leveljs = require('./level.js');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _almiku = require('almiku');

const pluginConfig = {
  name: "profile",
  alias: ["me", "profil", "myprofile", "my", "stats", "status"],
  category: "user",
  description: "Ver los perfiles de usuario con estadísticas RPG",
  usage: ".profile [@user]",
  example: ".profile",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const EXP_PER_LEVEL = 10000;

function formatNumber(num) {
  return _optionalChain([num, 'optionalAccess', _2 => _2.toLocaleString, 'call', _3 => _3("es-AR")]) || "0";
}

function getLevelBar(current, target) {
  const totalBars = 10;
  const filledBars = Math.min(
    Math.floor((current / target) * totalBars),
    totalBars,
  );
  const emptyBars = totalBars - filledBars;
  return "▰".repeat(filledBars) + "▱".repeat(emptyBars);
}

async function handler(m, { sock }) {
  const db = _almikudatabasejs.getDatabase.call(void 0, );
  const target = _optionalChain([m, 'access', _4 => _4.mentionedJid, 'optionalAccess', _5 => _5[0]]) || _optionalChain([m, 'access', _6 => _6.quoted, 'optionalAccess', _7 => _7.sender]) || m.sender;

  const user = db.getUser(target) || db.setUser(target);

  const isLid = target.endsWith('@lid');
  const isGroup = target.endsWith('@g.us');

  const resolvedJid = isLid && sock.getJid ? sock.getJid(target) : target;
  const phone = resolvedJid.split('@')[0].split(':')[0];
  const deviceId = _optionalChain([m, 'access', _8 => _8.quoted, 'optionalAccess', _9 => _9.key, 'optionalAccess', _10 => _10.id, 'optionalAccess', _11 => _11.split, 'call', _12 => _12('/'), 'access', _13 => _13[0]]) || _optionalChain([m, 'access', _14 => _14.key, 'optionalAccess', _15 => _15.id, 'optionalAccess', _16 => _16.split, 'call', _17 => _17('/'), 'access', _18 => _18[0]]) || (resolvedJid.match(/:(\d+)@/) || [])[1] || null;

  const safe = async (fn) => {
    try { return await fn(); } catch (e) { return null; }
  };

  const [
    onWa,
    ppUrl,
    statusRes,
    bizProfile,
    catalogRes,
    collections,
    lidFromJid,
    contactQuery,
    deviceInfo,
  ] = await Promise.all([
    safe(() => sock.onWhatsApp(phone)),
    safe(() => sock.profilePictureUrl(resolvedJid, 'image')),
    safe(() => sock.fetchStatus(resolvedJid)),
    safe(() => sock.getBusinessProfile(resolvedJid)),
    safe(() => sock.getCatalog({ jid: resolvedJid, limit: 5 })),
    safe(() => sock.getCollections(resolvedJid, 5)),
    safe(() => sock.getLidFromJid(resolvedJid)),
    safe(() => sock.getContact(resolvedJid)),
    safe(() => _almiku.getDevice.call(void 0, resolvedJid, sock)),
  ]);

  const exists = _nullishCoalesce(_optionalChain([onWa, 'optionalAccess', _19 => _19[0], 'optionalAccess', _20 => _20.exists]), () => ( false));
  const canonicalJid = _optionalChain([onWa, 'optionalAccess', _21 => _21[0], 'optionalAccess', _22 => _22.jid]) || resolvedJid;
  const lid = _optionalChain([m, 'access', _23 => _23.key, 'optionalAccess', _24 => _24.participant]) || lidFromJid || _optionalChain([onWa, 'optionalAccess', _25 => _25[0], 'optionalAccess', _26 => _26.lid]) || null;
  const isBot = _optionalChain([deviceInfo, 'optionalAccess', _27 => _27.isBot]) || _optionalChain([contactQuery, 'optionalAccess', _28 => _28.isBot]) || false;
  const statusObj = Array.isArray(statusRes) ? statusRes[0] : statusRes;
  const status = _optionalChain([statusObj, 'optionalAccess', _29 => _29.status, 'optionalAccess', _30 => _30.status]) || _optionalChain([statusObj, 'optionalAccess', _31 => _31.status]) || null;
  const statusTs = _optionalChain([statusObj, 'optionalAccess', _32 => _32.status, 'optionalAccess', _33 => _33.setAt]) || _optionalChain([statusObj, 'optionalAccess', _34 => _34.setAt]) || null;

  const isBiz = !!bizProfile && Object.keys(bizProfile).length > 0;
  const products = _optionalChain([catalogRes, 'optionalAccess', _35 => _35.products, 'optionalAccess', _36 => _36.length]) || 0;
  const collectionsCount = _optionalChain([collections, 'optionalAccess', _37 => _37.collections, 'optionalAccess', _38 => _38.length]) || 0;

  const fmtDate = (ts) => {
    if (!ts) return null;
    const d = ts instanceof Date ? ts : new Date(Number(ts) * (String(ts).length <= 10 ? 1000 : 1));
    return isNaN(d) ? null : d.toLocaleString('es-AR');
  };

  if (!user.rpg) user.rpg = {};
  const userExp = user.exp || 0;
  const userLevel = Math.floor(userExp / EXP_PER_LEVEL) + 1;
  user.rpg.level = userLevel;
  user.rpg.health = user.rpg.health || 100;
  user.rpg.maxHealth = 100 + (userLevel - 1) * 10;
  user.rpg.mana = user.rpg.mana || 100;
  user.rpg.maxMana = 100 + (userLevel - 1) * 5;
  user.rpg.stamina = user.rpg.stamina || 100;
  user.rpg.maxStamina = 100 + (userLevel - 1) * 5;

  const currentLevelExp = (userLevel - 1) * EXP_PER_LEVEL;
  const levelUpExp = userLevel * EXP_PER_LEVEL;
  const expInLevel = userExp - currentLevelExp;
  const expNeeded = levelUpExp - currentLevelExp;
  const role = _leveljs.getRole.call(void 0, userLevel);
  const isOwnerUser = _configjs2.default.isOwner(target);
  const isPremiumUser = _configjs2.default.isPremium(target);

  let ppMedia = null;
  try {
    const ppUrl = await sock.profilePictureUrl(target, "image");
    if (ppUrl) {
      ppMedia = { url: ppUrl };
    } else {
      throw new Error("No PP");
    }
  } catch (e2) {
    const fallbackUrl = _configjs2.default.assets["pp-kosong"];
    if (fallbackUrl) {
      ppMedia = { url: fallbackUrl };
    } else {
      ppMedia = { url: "https://i.imgur.com/TuItj4L.png" };
    }
  }

  let caption = `Hola hermano @${phone}! 👋\n`;
  caption += `Este es el anillo completo del perfil, estado y el activo completo que el abalone tiene actualmente en el sistema de bot:\n\n`;
  
  caption += `*〔 👤Información Privado〕*\n`;
  caption += `- * Nombre Asli: *${user.name || m.pushName || "User"}\n`;
  if (user.isRegistered) {
      caption += `- * Nombre de la lista: *${user.regName} (${user.regAge}año,${user.regGender})\n`;
  }
  caption += `- *Tag / Mention:* @${target.split("@")[0]}\n`;
  caption += `* Estado Cuenta: *${isOwnerUser ? "👑 Owner" : isPremiumUser ? "💎 Premium" : "🆓 Free User"}\n`;
  if (user.isBanned) caption += `- * Banned: *🚫Sí (No puede contabilizar las características de los bots )\n`;
  if (user.registeredAt) {
      caption += `* Fecha registrada: *${new Date(user.registeredAt).toLocaleDateString("es-AR")}\n`;
  }
  if (user.clanId) caption += `- *Klan / Guild:* ${user.clanId}\n`;
  if (user.rpg && user.rpg.spouse) {
      caption += `- *Pasangan (Spouse):* @${user.rpg.spouse.split("@")[0]}\n`;
  }

  caption += `\n*〔 ⚔️ RPG STATS & LEVEL 〕*\n`;
  caption += `- * Papel / Pacto: *${role}\n`;
  caption += `- * Cuando de nivel esto: *${user.rpg.level}\n`;
  caption += `- *Total Exp:* ${formatNumber(userExp)} XP\n`;
  caption += `- *Salud (Health):* ❤${user.rpg.health} / ${user.rpg.maxHealth}\n`;
  caption += `- *Mana (Magic):* 💧 ${user.rpg.mana} / ${user.rpg.maxMana}\n`;
  caption += `- *Stamina:* ⚡ ${user.rpg.stamina} / ${user.rpg.maxStamina}\n`;
  caption += `- *Progress Ke Level ${user.rpg.level + 1}:*\n  ${getLevelBar(expInLevel, expNeeded)}\n  _${formatNumber(expInLevel)} / ${formatNumber(expNeeded)} XP_\n`;

  caption += `\n*〔 💰 ASET & KEUANGAN 〕*\n`;
  caption += `- * Tela Tunai: *🪙Rp${_optionalChain([user, 'access', _39 => _39.koin, 'optionalAccess', _40 => _40.toLocaleString, 'call', _41 => _41("es-AR")]) || 0}_ (Se utiliza para funciones de RPG ) _\n`;
  caption += `- * Dinero en Bork: *🏦Rp${_optionalChain([user, 'access', _42 => _42.rpg, 'optionalAccess', _43 => _43.bank, 'optionalAccess', _44 => _44.toLocaleString, 'call', _45 => _45("es-AR")]) || 0}_ (Segura de los ingresos del navegador ) _\n`;
  caption += `- * Energy Sosa: *⚡ ${isOwnerUser || isPremiumUser ? "∞ Tak Terbatas" : user.energi}_ (Reducido siempre que usa comando ) _\n`;

  caption += `\n*〔 📱QUÉ PUEDE ENFOQUE〕*\n`;
  caption += `- * Número: * +${phone}\n`;
  caption += `- *Eksistensi WA:* ${exists ? 'Ya' : 'Tidak'}\n`;
  caption += `- *JID:* ${canonicalJid}\n`;
  caption += `- *LID:* ${lid || '-'}\n`;
  caption += `- *Tipe:* ${isGroup ? 'Group' : (isLid ? 'LID' : 'S.WhatsApp.Net')}\n`;
  caption += `- * What 's up: *${isBot ? 'Ya' : 'Bukan'}\n`;
  caption += `- *Device ID:* ${deviceId || '-'}\n`;

  caption += `\n*〔 ℹ️ BIO & PROFILE 〕*\n`;
  caption += `- *Avatar:* ${ppUrl ? 'Ada' : 'Tidak Ada'}\n`;
  caption += `- *Bio:* ${status || '-'}\n`;
  caption += `- *Bio Set:* ${fmtDate(statusTs) || '-'}\n`;

  caption += `\n*〔 🏢BUSINESS INFO〕*\n`;
  caption += `- * Tipe Cuenta: *${isBiz ? 'WhatsApp Business' : 'WhatsApp Biasa'}\n`;
  if (isBiz) {
    caption += `- *Descripción:*${bizProfile.description || '-'}\n`;
    caption += `- * Sitio web: *${(bizProfile.website || []).join(', ') || '-'}\n`;
    caption += `- *Correo:*${bizProfile.email || '-'}\n`;
    caption += `- *Dirección:*${bizProfile.address || '-'}\n`;
    caption += `- *Categoría:*${(bizProfile.categories || []).map(c => c.name || c).join(', ') || '-'}\n`;
    caption += `- *Verified:* ${bizProfile.isProfileLinked ? 'Ya' : 'Tidak'}\n`;
    
    if (products > 0 || collectionsCount > 0) {
      caption += `\n*〔 🛍️ CATALOG 〕*\n`;
      caption += `- *Total Produk:* ${products}\n`;
      caption += `- *Koleksi:* ${collectionsCount}\n`;
    }
  }

  caption += `\n*〔 🤖BOT VIEWPOINT〕*\n`;
  caption += `- * EVE JID: *${_optionalChain([sock, 'access', _46 => _46.user, 'optionalAccess', _47 => _47.id]) || '-'}\n`;
  caption += `- * * Plataforma: *${_optionalChain([sock, 'access', _48 => _48.authState, 'optionalAccess', _49 => _49.creds, 'optionalAccess', _50 => _50.platform]) || process.platform || '-'}\n`;
  caption += `- *Runtime:* Node ${process.version}\n`;

  if (user.inventory && Object.keys(user.inventory).length > 0) {
      const invItems = Object.entries(user.inventory).filter(([_, qty]) => qty > 0);
      if (invItems.length > 0) {
          caption += `\n*〔 🎒 ISI INVENTORY 〕*\n`;
          caption += `Las cosas que funcionan para mi hermano están reuniendo:\n`;
          invItems.forEach(([item, qty]) => {
              caption += `- *${item.charAt(0).toUpperCase() + item.slice(1)}:* sejumlah ${qty} item\n`;
          });
      }
  }

  if (user.unlockedFeatures && user.unlockedFeatures.length > 0) {
      caption += `\n*〔 🔓PREMUM FIREMUM OPEN〕*\n`;
      caption += `Características exclusivas que se han planteado hasta el mismo grado:\n`;
      user.unlockedFeatures.forEach(fitur => {
          caption += `- *${fitur}*\n`;
      });
  }

  const mentions = [target];
  if (user.rpg.spouse) mentions.push(user.rpg.spouse);

  const msgOptions = { caption, mentions };
  if (ppMedia) {
    msgOptions.image = ppMedia;
  }

  await sock.sendMessage(m.chat, msgOptions, { quoted: m });
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

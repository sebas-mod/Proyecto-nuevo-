"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');




var _ourinjadibotdatabasejs = require('../../src/lib/ourin-jadibot-database.js');
const pluginConfig = {
  name: "addprem",
  alias: [
    "addpremium",
    "setprem",
    "delprem",
    "delpremium",
    "listprem",
    "premlist",
  ],
  category: "owner",
  description: "Kelola premium users",
  usage:
    "- ¿Qué?<nomor/@tag>[el]\n- Dios.<nomor/@tag>\n- Escucha.\n- Lo siento.<nomor/@tag>",
  example: ".addprem 6281234567890 30",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

function formatDate(ts) {
  return new Date(ts).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function extractTarget(m) {
  if (m.quoted) return _optionalChain([m, 'access', _ => _.quoted, 'access', _2 => _2.sender, 'optionalAccess', _3 => _3.replace, 'call', _4 => _4(/[^0-9]/g, "")]) || "";
  if (_optionalChain([m, 'access', _5 => _5.mentionedJid, 'optionalAccess', _6 => _6.length]))
    return _optionalChain([m, 'access', _7 => _7.mentionedJid, 'access', _8 => _8[0], 'optionalAccess', _9 => _9.replace, 'call', _10 => _10(/[^0-9]/g, "")]) || "";
  if (_optionalChain([m, 'access', _11 => _11.args, 'optionalAccess', _12 => _12.length])) return m.args[0].replace(/[^0-9]/g, "");
  return "";
}

function toMentionJid(value) {
  const number = String(value || "").replace(/[^0-9]/g, "");
  return number ? `${number}@s.whatsapp.net` : null;
}

async function handler(m, { sock, jadibotId, isJadibot }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const cmd = m.command.toLowerCase();

  const isAdd = ["addprem", "addpremium", "setprem"].includes(cmd);
  const isDel = ["delprem", "delpremium"].includes(cmd);
  const isList = ["listprem", "premlist"].includes(cmd);

  if (!db.data.premium) db.data.premium = [];

  if (isList) {
    if (isJadibot && jadibotId) {
      const jbPremiums = _ourinjadibotdatabasejs.getJadibotPremiums.call(void 0, jadibotId);
      if (jbPremiums.length === 0) {
        return m.reply(
          `💎Aún no, hay una prima en este kriot.\nUsa\`${m.prefix}*Y voy a estar aquí*\`para anadiendo`,
        );
      }
      let txt = `💎* PREMUM DASTAR JEDBOT *— ${jadibotId}\n\n`;
      const mentions = jbPremiums
        .map((p) => (typeof p === "string" ? p : p.jid))
        .map(toMentionJid)
        .filter(Boolean);
      jbPremiums.forEach((p, i) => {
        const num = typeof p === "string" ? p : p.jid;
        const number = String(num || "").replace(/[^0-9]/g, "");
        txt += `${i + 1}. @${number}\n`;
      });
      txt += `\nTotal: *${jbPremiums.length}* Premium`;
      return m.reply(txt, { mentions });
    }

    if (db.data.premium.length === 0) {
      return m.reply(`💎Aún no es una prima registrada.`);
    }
    let txt = `💎* Regisomebody Premium *\n\n`;
    const now = Date.now();
    const mentions = db.data.premium
      .map((p) => (typeof p === "string" ? p : p.id))
      .map(toMentionJid)
      .filter(Boolean);
    db.data.premium.forEach((p, i) => {
      const num = typeof p === "string" ? p : p.id;
      const remaining =
        typeof p === "object" && p.expired
          ? Math.ceil((p.expired - now) / (1000 * 60 * 60 * 24))
          : null;
      const status =
        remaining === null
          ? "Permanent"
          : remaining > 0
            ? remaining + "d"
            : "Expired";
      const number = String(num || "").replace(/[^0-9]/g, "");
      txt += `${i + 1}. @${number} — ${status}\n`;
    });
    txt += `\nTotal: *${db.data.premium.length}* Premium`;
    return m.reply(txt, { mentions });
  }

  let targetNumber = await extractTarget(m);

  if (!targetNumber) {
    return m.reply(
      `💎 *${isAdd ? "ADD" : "DEL"}Premium *\n\nInsertar nútáo etiqueta de usuario\n\`Epirame:${m.prefix}${cmd} 6281234567890\``,
    );
  }

  if (targetNumber.startsWith("0")) {
    targetNumber = "62" + targetNumber.slice(1);
  }

  if (targetNumber.length < 10 || targetNumber.length > 15) {
    return m.reply(`❌Número de formato es inválido`);
  }

  if (isJadibot && jadibotId) {
    if (isAdd) {
      if (_ourinjadibotdatabasejs.addJadibotPremium.call(void 0, jadibotId, targetNumber)) {
        await m.react("💎");
        return m.reply(
          `✅♪ Trabajar para añadir ♪${targetNumber}* Como un jabot premium`,
        );
      } else {
        return m.reply(`❌ \`${targetNumber}\`Es una prima en este Skebot`);
      }
    } else if (isDel) {
      if (_ourinjadibotdatabasejs.removeJadibotPremium.call(void 0, jadibotId, targetNumber)) {
        await m.react("✅");
        return m.reply(
          `✅Resultado de la memorización${targetNumber}* del jabot premium`,
        );
      } else {
        return m.reply(`❌ \`${targetNumber}\`No es una prima en este Sabiot`);
      }
    }
    return;
  }

  if (isAdd) {
    const existingIndex = db.data.premium.findIndex((p) =>
      typeof p === "string" ? p === targetNumber : p.id === targetNumber,
    );

    let durationMs = 30 * 24 * 60 * 60 * 1000;
    let durationLabel = "30 el";
    
    const timeArg = _optionalChain([m, 'access', _13 => _13.args, 'optionalAccess', _14 => _14.find, 'call', _15 => _15((a) => /^\d+(h|hari|j|jam|m|menit|d|detik)?$/i.test(a))]);
    if (timeArg) {
      const match = timeArg.toLowerCase().match(/^(\d+)(h|hari|j|jam|m|menit|d|detik)?$/);
      if (match) {
        const val = parseInt(match[1]);
        const unit = match[2] || "h";
        if (unit === "d" || unit === "detik") {
          durationMs = val * 1000;
          durationLabel = `${val}segundo`;
        } else if (unit === "m" || unit === "menit") {
          durationMs = val * 60 * 1000;
          durationLabel = `${val}minuto`;
        } else if (unit === "j" || unit === "jam") {
          durationMs = val * 60 * 60 * 1000;
          durationLabel = `${val}hora`;
        } else {
          durationMs = val * 24 * 60 * 60 * 1000;
          durationLabel = `${val}el`;
        }
      }
    }

    const pushName = _optionalChain([m, 'access', _16 => _16.quoted, 'optionalAccess', _17 => _17.pushName]) || m.pushName || "Unknown";
    const now = Date.now();

    let newExpired;

    if (existingIndex !== -1) {
      const currentData = db.data.premium[existingIndex];
      const currentExpired =
        typeof currentData === "string" ? now : currentData.expired || now;
      const baseTime = currentExpired > now ? currentExpired : now;
      newExpired = baseTime + durationMs;

      if (typeof currentData === "string") {
        db.data.premium[existingIndex] = {
          id: targetNumber,
          expired: newExpired,
          name: pushName,
          addedAt: now,
        };
      } else {
        db.data.premium[existingIndex].expired = newExpired;
        db.data.premium[existingIndex].name = pushName;
      }
    } else {
      newExpired = now + durationMs;
      db.data.premium.push({
        id: targetNumber,
        expired: newExpired,
        name: pushName,
        addedAt: now,
      });
    }

    const jid = targetNumber + "@s.whatsapp.net";
    const user = db.getUser(jid) || db.setUser(jid);

    if (user.energi !== -1) {
      user.energi = _optionalChain([_configjs2.default, 'access', _18 => _18.energi, 'optionalAccess', _19 => _19.premium]) || 999999;
    }
    user.isPremium = true;

    db.setUser(jid, user);
    db.updateExp(jid, 200000);
    db.updateKoin(jid, 20000);

    db.save();

    await m.react("💎");
    return m.reply(
      `✅Exito${existingIndex !== -1 ? "memperpanjang" : "menambahkan"} premium *${targetNumber}* selama *${durationLabel}*\nExpired: *${formatDate(newExpired)}*`,
    );
  } else if (isDel) {
    const index = db.data.premium.findIndex((p) =>
      typeof p === "string" ? p === targetNumber : p.id === targetNumber,
    );

    if (index === -1) {
      return m.reply(`❌ *${targetNumber}* no una prima`);
    }

    db.data.premium.splice(index, 1);

    const jid = targetNumber + "@s.whatsapp.net";
    const user = db.getUser(jid);
    if (user) {
      user.isPremium = false;
      db.setUser(jid, user);
    }

    db.save();
    await m.react("✅");
    return m.reply(`✅Resultado de la memorización${targetNumber}* del estreno`);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

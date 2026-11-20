"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikudatabasejs = require('../../src/lib/almiku-database.js');




var _almikujadibotdatabasejs = require('../../src/lib/almiku-jadibot-database.js');





var _almikulidjs = require('../../src/lib/almiku-lid.js');
const pluginConfig = {
  name: "addowner",
  alias: ["addown", "setowner", "delowner", "dedown", "ownerlist", "listowner"],
  category: "owner",
  description: "Kelola propietario bot ( modo consciente )",
  usage: ".addowner <nomor/@tag/reply>",
  example: ".addowner 6281234567890",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

function cleanJid(jid) {
  if (!jid) return null;
  if (_almikulidjs.isLid.call(void 0, jid)) jid = _almikulidjs.lidToJid.call(void 0, jid);
  return jid.includes("@") ? jid : jid + "@s.whatsapp.net";
}

function extractNumber(m) {
  let targetNumber = "";

  if (m.quoted) {
    let sender = m.quoted.sender || "";
    if (_almikulidjs.isLid.call(void 0, sender) || _almikulidjs.isLidConverted.call(void 0, sender)) {
      sender = _almikulidjs.resolveAnyLidToJid.call(void 0, sender, m.groupMembers || []);
    }
    targetNumber = _optionalChain([sender, 'optionalAccess', _ => _.replace, 'call', _2 => _2(/[^0-9]/g, "")]) || "";
  } else if (_optionalChain([m, 'access', _3 => _3.mentionedJid, 'optionalAccess', _4 => _4.length])) {
    let jid = cleanJid(m.mentionedJid[0]);
    if (_almikulidjs.isLid.call(void 0, jid) || _almikulidjs.isLidConverted.call(void 0, jid)) {
      jid = _almikulidjs.resolveAnyLidToJid.call(void 0, jid, m.groupMembers || []);
    }
    targetNumber = _optionalChain([jid, 'optionalAccess', _5 => _5.replace, 'call', _6 => _6(/[^0-9]/g, "")]) || "";
  } else if (m.args[0]) {
    targetNumber = m.args[0].replace(/[^0-9]/g, "");
    if (targetNumber.startsWith("08")) {
      targetNumber = "62" + targetNumber.slice(1);
    }
  }

  if (targetNumber.startsWith("0")) {
    targetNumber = "62" + targetNumber.slice(1);
  }

  if (targetNumber.length > 15) {
    return "";
  }

  return targetNumber;
}

function toMentionJid(value) {
  const number = String(value || "").replace(/[^0-9]/g, "");
  return number ? `${number}@s.whatsapp.net` : null;
}

async function handler(m, { sock, jadibotId, isJadibot }) {
  const db = _almikudatabasejs.getDatabase.call(void 0, );
  const cmd = m.command.toLowerCase();

  const isAdd = ["addowner", "addown", "setowner"].includes(cmd);
  const isDel = ["delowner", "dedown"].includes(cmd);
  const isList = ["ownerlist", "listowner"].includes(cmd);

  if (!db.data.owner) db.data.owner = [];

  if (isList) {
    if (isJadibot && jadibotId) {
      const jbOwners = _almikujadibotdatabasejs.getJadibotOwners.call(void 0, jadibotId);
      if (jbOwners.length === 0) {
        return m.reply(
          `📋*ᴅᴀꜰᴛᴀʀ ᴏᴡɴᴇʀ ᴊᴀᴅɪʙᴏᴛ*\n\nPara ver si hay un propietario registrado.\n> Usa\`${m.prefix}addowner\`para anadiendo.`,
        );
      }
      let txt = `📋* Registrate Propietario JEDITBOT *— ${jadibotId}\n\n`;
      const mentions = jbOwners.map(toMentionJid).filter(Boolean);
      jbOwners.forEach((s, i) => {
        const number = String(s || "").replace(/[^0-9]/g, "");
        const name = _configjs.getOwnerName.call(void 0, number);
        txt += `${i + 1}. 👑 @${number}${name !== "Owner" ? ` — *${name}*` : ""}\n`;
      });
      txt += `\nTotal: *${jbOwners.length}* propietario`;
      return m.reply(txt, { mentions });
    } else {
      const configOwners = (_optionalChain([_configjs2.default, 'access', _7 => _7.owner, 'optionalAccess', _8 => _8.number]) || []).map(String);
      const dbOwners = db.data.owner || [];
      const allOwners = [...new Set([...configOwners, ...dbOwners])];

      if (allOwners.length === 0) {
        return m.reply(`📋*ᴅᴀꜰᴛᴀʀ ᴏᴡɴᴇʀ*\n\nPara ver si hay un propietario registrado.`);
      }
      let txt = `📋*Registrate Propietario*\n\n`;
      const mentions = allOwners.map(toMentionJid).filter(Boolean);
      allOwners.forEach((s, i) => {
        const number = String(s || "").replace(/[^0-9]/g, "");
        const isMain = configOwners.some(
          (o) => o.replace(/[^0-9]/g, "") === number,
        );
        const isDb = dbOwners.some(
          (o) => String(o).replace(/[^0-9]/g, "") === number,
        );
        const label = isMain && isDb ? "👑⭐" : isMain ? "⭐" : "👑";
        const name = _configjs.getOwnerName.call(void 0, number);
        txt += `${i + 1}. ${label} @${number}${name !== "Owner" ? ` — *${name}*` : ""}\n`;
      });
      txt += `\nTotal: *${allOwners.length}*Propietario*⭐Juega,👑Addd`;
      return m.reply(txt, { mentions });
    }
  }

  const targetNumber = await extractNumber(m);
  const numberFromArgs = !m.quoted && !_optionalChain([m, 'access', _9 => _9.mentionedJid, 'optionalAccess', _10 => _10.length]) && m.args[0];
  const customName = isAdd
    ? (numberFromArgs ? m.args.slice(1) : m.args).join(" ").trim()
    : "";

  if (!targetNumber) {
    return m.reply(
      `👑 *${isAdd ? "ADD" : "DEL"}Propietario*\n\n` +
        `Respuesta / etiqueta / números de usuario de tyuk\n` +
        `\`Contoh: ${m.prefix}${cmd} 6281234567890\`\n` +
        `\`Con nombre:${m.prefix}${cmd} 6281234567890 NamaOwner\``,
    );
  }

  if (targetNumber.length < 10 || targetNumber.length > 15) {
    return m.reply(`❌*ɢᴀɢᴀʟ*\n\n*Los números de formato no son válidos*`);
  }

  if (isJadibot && jadibotId) {
    if (isAdd) {
      if (_almikujadibotdatabasejs.addJadibotOwner.call(void 0, jadibotId, targetNumber)) {
        await m.react("👑");
        return m.reply(
          `✅ Trabajar para añadir •${targetNumber}* como el dueño se convirtió en el trasero`,
        );
      } else {
        return m.reply(
          `❌ \`${targetNumber}\`Ha sido un propietario de Sturbot.`,
        );
      }
    } else if (isDel) {
      if (_almikujadibotdatabasejs.removeJadibotOwner.call(void 0, jadibotId, targetNumber)) {
        await m.react("✅");
        return m.reply(
          `✅Resultado de la memorización${targetNumber}* desde el propietario a jabot`,
        );
      } else {
        return m.reply(`❌ \`${targetNumber}\`No es el dueño de Sabiot.`);
      }
    }
    return;
  }

    if (isAdd) {
      if (db.data.owner.includes(targetNumber)) {
        return m.reply(`❌ \`${targetNumber}\`Es un propietario completo.`);
      }

      db.data.owner.push(targetNumber);
      if (customName) {
        const nameMap = db.setting("ownerNames") || {};
        nameMap[targetNumber] = customName;
        db.setting("ownerNames", nameMap);
      }
      db.save();

      const displayName = customName || _configjs.getOwnerName.call(void 0, targetNumber);
      await m.react("👑");
      return m.reply(
        `✅ Trabajar para añadir •${targetNumber}* como propietario completo${customName ? ` (${customName})` : ""}`,
      );
    } else if (isDel) {
      const index = db.data.owner.indexOf(targetNumber);
      if (index === -1) {
        return m.reply(`❌ \`${targetNumber}\`No dueño completo.`);
      }

      db.data.owner.splice(index, 1);
      const nameMap = db.setting("ownerNames") || {};
      delete nameMap[targetNumber];
      db.setting("ownerNames", nameMap);
      db.save();

      await m.react("✅");
      return m.reply(`✅Resultado de la memorización${targetNumber}* del propietario completo`);
    }
}






exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');




var _ourinjadibotdatabasejs = require('../../src/lib/ourin-jadibot-database.js');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);





var _ourinlidjs = require('../../src/lib/ourin-lid.js');
var _botmodejs = require('../group/botmode.js');
const pluginConfig = {
  name: "addowner",
  alias: ["addown", "setowner", "delowner", "dedown", "ownerlist", "listowner"],
  category: "owner",
  description: "Kelola owner bot (mode-aware)",
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
  if (_ourinlidjs.isLid.call(void 0, jid)) jid = _ourinlidjs.lidToJid.call(void 0, jid);
  return jid.includes("@") ? jid : jid + "@s.whatsapp.net";
}

function extractNumber(m) {
  let targetNumber = "";

  if (m.quoted) {
    let sender = m.quoted.sender || "";
    if (_ourinlidjs.isLid.call(void 0, sender) || _ourinlidjs.isLidConverted.call(void 0, sender)) {
      sender = _ourinlidjs.resolveAnyLidToJid.call(void 0, sender, m.groupMembers || []);
    }
    targetNumber = _optionalChain([sender, 'optionalAccess', _ => _.replace, 'call', _2 => _2(/[^0-9]/g, "")]) || "";
  } else if (_optionalChain([m, 'access', _3 => _3.mentionedJid, 'optionalAccess', _4 => _4.length])) {
    let jid = cleanJid(m.mentionedJid[0]);
    if (_ourinlidjs.isLid.call(void 0, jid) || _ourinlidjs.isLidConverted.call(void 0, jid)) {
      jid = _ourinlidjs.resolveAnyLidToJid.call(void 0, jid, m.groupMembers || []);
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

function savePanelConfig() {
  try {
    const configPath = _path2.default.join(process.cwd(), "config.js");
    let content = _fs2.default.readFileSync(configPath, "utf8");

    const ownerPanelsStr = JSON.stringify(_configjs2.default.pterodactyl.ownerPanels || []);
    content = content.replace(
      /ownerPanels:\s*\[.*?\]/s,
      `ownerPanels: ${ownerPanelsStr}`,
    );

    const sellersStr = JSON.stringify(_configjs2.default.pterodactyl.sellers || []);
    content = content.replace(/sellers:\s*\[.*?\]/s, `sellers: ${sellersStr}`);

    _fs2.default.writeFileSync(configPath, content, "utf8");
    return true;
  } catch (e) {
    console.error("[AddOwner] Failed to save panel config:", e.message);
    return false;
  }
}

function removeFromSellers(targetNumber) {
  if (!_configjs2.default.pterodactyl.sellers) return false;
  const idx = _configjs2.default.pterodactyl.sellers.findIndex(
    (s) => String(s).trim() === String(targetNumber).trim(),
  );
  if (idx !== -1) {
    _configjs2.default.pterodactyl.sellers.splice(idx, 1);
    return true;
  }
  return false;
}

function removeFromOwnerPanels(targetNumber) {
  if (!_configjs2.default.pterodactyl.ownerPanels) return false;
  const idx = _configjs2.default.pterodactyl.ownerPanels.findIndex(
    (s) => String(s).trim() === String(targetNumber).trim(),
  );
  if (idx !== -1) {
    _configjs2.default.pterodactyl.ownerPanels.splice(idx, 1);
    return true;
  }
  return false;
}

function toMentionJid(value) {
  const number = String(value || "").replace(/[^0-9]/g, "");
  return number ? `${number}@s.whatsapp.net` : null;
}

async function handler(m, { sock, jadibotId, isJadibot }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const cmd = m.command.toLowerCase();
  const groupMode = m.isGroup ? _botmodejs.getGroupMode.call(void 0, m.chat, db) : "private";
  const isCpanelMode = m.isGroup && groupMode === "cpanel";

  const isAdd = ["addowner", "addown", "setowner"].includes(cmd);
  const isDel = ["delowner", "dedown"].includes(cmd);
  const isList = ["ownerlist", "listowner"].includes(cmd);

  if (!_configjs2.default.pterodactyl) _configjs2.default.pterodactyl = {};
  if (!_configjs2.default.pterodactyl.ownerPanels) _configjs2.default.pterodactyl.ownerPanels = [];
  if (!_configjs2.default.pterodactyl.sellers) _configjs2.default.pterodactyl.sellers = [];
  if (!db.data.owner) db.data.owner = [];

  if (isList) {
    if (isJadibot && jadibotId) {
      const jbOwners = _ourinjadibotdatabasejs.getJadibotOwners.call(void 0, jadibotId);
      if (jbOwners.length === 0) {
        return m.reply(
          `📋 *ᴅᴀꜰᴛᴀʀ ᴏᴡɴᴇʀ ᴊᴀᴅɪʙᴏᴛ*\n\n> Belum ada owner terdaftar.\n> Gunakan \`${m.prefix}addowner\` untuk menambah.`,
        );
      }
      let txt = `📋 *DAFTAR OWNER JADIBOT* — ${jadibotId}\n\n`;
      const mentions = jbOwners.map(toMentionJid).filter(Boolean);
      jbOwners.forEach((s, i) => {
        const number = String(s || "").replace(/[^0-9]/g, "");
        const name = _configjs.getOwnerName.call(void 0, number);
        txt += `${i + 1}. 👑 @${number}${name !== "Owner" ? ` — *${name}*` : ""}\n`;
      });
      txt += `\nTotal: *${jbOwners.length}* owner`;
      return m.reply(txt, { mentions });
    } else if (isCpanelMode) {
      const panelOwners = _configjs2.default.pterodactyl.ownerPanels || [];
      const fullOwners = db.data.owner || [];
      const allOwners = [...new Set([...panelOwners, ...fullOwners])];

      if (allOwners.length === 0) {
        return m.reply(
          `📋 *ᴅᴀꜰᴛᴀʀ ᴏᴡɴᴇʀ ᴘᴀɴᴇʟ*\n\n> Belum ada owner panel terdaftar.`,
        );
      }
      let txt = `📋 *DAFTAR OWNER PANEL*\n\n`;
      const mentions = allOwners.map(toMentionJid).filter(Boolean);
      allOwners.forEach((s, i) => {
        const label =
          panelOwners.includes(s) && fullOwners.includes(s)
            ? "👑🖥️"
            : fullOwners.includes(s)
              ? "👑"
              : "🖥️";
        const number = String(s || "").replace(/[^0-9]/g, "");
        const name = _configjs.getOwnerName.call(void 0, number);
        txt += `${i + 1}. ${label} @${number}${name !== "Owner" ? ` — *${name}*` : ""}\n`;
      });
      txt += `\nTotal: *${allOwners.length}* owner | 👑 Full, 🖥️ Panel`;
      return m.reply(txt, { mentions });
    } else {
      const configOwners = (_optionalChain([_configjs2.default, 'access', _7 => _7.owner, 'optionalAccess', _8 => _8.number]) || []).map(String);
      const dbOwners = db.data.owner || [];
      const allOwners = [...new Set([...configOwners, ...dbOwners])];

      if (allOwners.length === 0) {
        return m.reply(`📋 *ᴅᴀꜰᴛᴀʀ ᴏᴡɴᴇʀ*\n\n> Belum ada owner terdaftar.`);
      }
      let txt = `📋 *DAFTAR OWNER*\n\n`;
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
      txt += `\nTotal: *${allOwners.length}* owner | ⭐ Main, 👑 Added`;
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
      `👑 *${isAdd ? "ADD" : "DEL"} OWNER*\n\n` +
        `Reply/tag/ketik nomor user\n` +
        `\`Contoh: ${m.prefix}${cmd} 6281234567890\`\n` +
        `\`Dengan nama: ${m.prefix}${cmd} 6281234567890 NamaOwner\``,
    );
  }

  if (targetNumber.length < 10 || targetNumber.length > 15) {
    return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Format nomor tidak valid`);
  }

  if (isJadibot && jadibotId) {
    if (isAdd) {
      if (_ourinjadibotdatabasejs.addJadibotOwner.call(void 0, jadibotId, targetNumber)) {
        await m.react("👑");
        return m.reply(
          `✅ Berhasil menambahkan *${targetNumber}* sebagai owner jadibot`,
        );
      } else {
        return m.reply(
          `❌ \`${targetNumber}\` sudah menjadi owner Jadibot ini.`,
        );
      }
    } else if (isDel) {
      if (_ourinjadibotdatabasejs.removeJadibotOwner.call(void 0, jadibotId, targetNumber)) {
        await m.react("✅");
        return m.reply(
          `✅ Berhasil menghapus *${targetNumber}* dari owner jadibot`,
        );
      } else {
        return m.reply(`❌ \`${targetNumber}\` bukan owner Jadibot ini.`);
      }
    }
    return;
  }

  if (isCpanelMode) {
    if (isAdd) {
      if (_configjs2.default.pterodactyl.ownerPanels.includes(targetNumber)) {
        return m.reply(`❌ \`${targetNumber}\` sudah menjadi owner panel.`);
      }

      let roleChanged = "";
      if (removeFromSellers(targetNumber)) {
        roleChanged = `\n> ⚡ Auto-upgrade dari Seller ke Owner Panel`;
      }

      _configjs2.default.pterodactyl.ownerPanels.push(targetNumber);
      if (savePanelConfig()) {
        await m.react("👑");
        return m.reply(
          `✅ Berhasil menambahkan *${targetNumber}* sebagai owner panel${roleChanged}`,
        );
      } else {
        _configjs2.default.pterodactyl.ownerPanels = _configjs2.default.pterodactyl.ownerPanels.filter(
          (s) => s !== targetNumber,
        );
        return m.reply(`❌ Gagal menyimpan ke config.js`);
      }
    } else if (isDel) {
      const ownerList = _configjs2.default.pterodactyl.ownerPanels || [];
      const found = ownerList.find(
        (o) => String(o).trim() === String(targetNumber).trim(),
      );
      if (!found) {
        return m.reply(
          `❌ \`${targetNumber}\` bukan owner panel.\n\n> Current list: ${ownerList.join(", ") || "empty"}`,
        );
      }
      _configjs2.default.pterodactyl.ownerPanels = ownerList.filter(
        (s) => String(s).trim() !== String(targetNumber).trim(),
      );
      if (savePanelConfig()) {
        await m.react("✅");
        return m.reply(
          `✅ Berhasil menghapus *${targetNumber}* dari owner panel`,
        );
      } else {
        return m.reply(`❌ Gagal menyimpan ke config.js`);
      }
    }
  } else {
    if (isAdd) {
      if (db.data.owner.includes(targetNumber)) {
        return m.reply(`❌ \`${targetNumber}\` sudah menjadi full owner.`);
      }

      let roleChanged = "";
      if (removeFromSellers(targetNumber)) {
        roleChanged = `\n> ⚡ Auto-upgrade dari Seller`;
        savePanelConfig();
      }
      if (removeFromOwnerPanels(targetNumber)) {
        roleChanged = `\n> ⚡ Auto-upgrade dari Panel Owner`;
        savePanelConfig();
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
        `✅ Berhasil menambahkan *${targetNumber}* sebagai full owner${customName ? ` (${customName})` : ""}${roleChanged}`,
      );
    } else if (isDel) {
      const index = db.data.owner.indexOf(targetNumber);
      if (index === -1) {
        return m.reply(`❌ \`${targetNumber}\` bukan full owner.`);
      }

      db.data.owner.splice(index, 1);
      const nameMap = db.setting("ownerNames") || {};
      delete nameMap[targetNumber];
      db.setting("ownerNames", nameMap);
      db.save();

      await m.react("✅");
      return m.reply(`✅ Berhasil menghapus *${targetNumber}* dari full owner`);
    }
  }
}






exports.config = pluginConfig; exports.handler = handler; exports.removeFromSellers = removeFromSellers; exports.removeFromOwnerPanels = removeFromOwnerPanels;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

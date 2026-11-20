"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourinautobackupjs = require('../../src/lib/ourin-auto-backup.js');
var _ourintimejs = require('../../src/lib/ourin-time.js'); var timeHelper = _interopRequireWildcard(_ourintimejs);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
  name: "autobackup",
  alias: ["backup", "ab"],
  category: "owner",
  description: "Kelola sistem auto backup",
  usage: ".autobackup <on/off/status/now> [interval]",
  example: ".autobackup on 5h",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const args = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3(), 'access', _4 => _4.split, 'call', _5 => _5(/\s+/)]) || [];
  const action = _optionalChain([args, 'access', _6 => _6[0], 'optionalAccess', _7 => _7.toLowerCase, 'call', _8 => _8()]);

  if (!action) {
    const status = _ourinautobackupjs.getBackupStatus.call(void 0, );
    const ownerNum = _optionalChain([_configjs2.default, 'access', _9 => _9.owner, 'optionalAccess', _10 => _10.number, 'optionalAccess', _11 => _11[0]]) || "No diset";

    let txt = `🗂️ *ᴀᴜᴛᴏ ʙᴀᴄᴋᴜᴘ sʏsᴛᴇᴍ*\n\n`;
    txt += `╭┈┈⬡「 📊 *sᴛᴀᴛᴜs* 」\n`;
    txt += `┃ 🔘 Status: ${status.enabled ? "✅ *ON*" : "❌ *OFF*"}\n`;
    txt += `┃ ⏱️ Interval: ${status.interval}\n`;
    txt += `┃ 📅 Last Backup: ${status.lastBackup ? timeHelper.fromTimestamp(status.lastBackup, "DD MMMM YYYY HH:mm:ss") : "-"}\n`;
    txt += `┃ #️⃣ Total: ${status.backupCount} backup\n`;
    txt += `┃ 📤Enviado a:${ownerNum}\n`;
    txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;

    txt += `*ᴄᴀʀᴀ ᴘᴀᴋᴀɪ:*\n`;
    txt += `> \`${m.prefix}autobackup on <interval>\`\n`;
    txt += `> \`${m.prefix}autobackup off\`\n`;
    txt += `> \`${m.prefix}autobackup status\`\n`;
    txt += `> \`${m.prefix}autobackup now\`\n\n`;

    txt += `*ꜰᴏʀᴍᴀᴛ ɪɴᴛᴇʀᴠᴀʟ:*\n`;
    txt += `> • \`5m\` = 5 menit\n`;
    txt += `> • \`1h\` = 1 jam\n`;
    txt += `> • \`6h\` = 6 jam\n`;
    txt += `> • \`1d\` = 1 hari\n\n`;

    txt += `*ᴄᴏɴᴛᴏʜ:*\n`;
    txt += `> \`${m.prefix}autobackkup en 6h\`- Retrocede cada seis horas.`;

    return m.reply(txt);
  }

  switch (action) {
    case "on":
    case "enable":
    case "start": {
      const interval = args[1];

      if (!interval) {
        return m.reply(
          `⚠️ *ɪɴᴛᴇʀᴠᴀʟ ᴅɪʙᴜᴛᴜʜᴋᴀɴ*\n\n` +
            `> \`${m.prefix}autobackup on <interval>\`\n\n` +
            `*ᴄᴏɴᴛᴏʜ:*\n` +
            `> \`${m.prefix}autobackkup en 30m\`- 30 minutos.\n` +
            `> \`${m.prefix}autobackkup en 6h\`- No, seis horas.\n` +
            `> \`${m.prefix}autobackend on 1 d\`- No un día.`,
        );
      }

      const result = _ourinautobackupjs.enableAutoBackup.call(void 0, interval, sock);

      if (!result.success) {
        return m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> ${result.error}`);
      }

      const ownerNum = _optionalChain([_configjs2.default, 'access', _12 => _12.owner, 'optionalAccess', _13 => _13.number, 'optionalAccess', _14 => _14[0]]) || "Propietario #1";

      await m.react("✅");
      return m.reply(
        `✅ *ᴀᴜᴛᴏ ʙᴀᴄᴋᴜᴘ ᴅɪᴀᴋᴛɪꜰᴋᴀɴ*\n\n` +
          `╭┈┈⬡「 ⚙️ *sᴇᴛᴛɪɴɢs* 」\n` +
          `┃ ⏱️ Interval: ${result.interval}\n` +
          `┃ 📤Enviado a:${ownerNum}\n` +
          `┃ 📦 Exclude: node_modules, .git, storages, dll\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `El primer Backup será enviado${result.interval}`,
      );
    }

    case "off":
    case "disable":
    case "stop": {
      _ourinautobackupjs.disableAutoBackup.call(void 0, );

      await m.react("✅");
      return m.reply(
        `❌ *ᴀᴜᴛᴏ ʙᴀᴄᴋᴜᴘ ᴅɪɴᴏɴᴀᴋᴛɪꜰᴋᴀɴ*\n\n` +
          `The backkup 's been stopped.\n` +
          `> Usa \`${m.prefix}autobackkup en<interval>\`Para reactivar.`,
      );
    }

    case "status":
    case "info": {
      const status = _ourinautobackupjs.getBackupStatus.call(void 0, );
      const ownerNum = _optionalChain([_configjs2.default, 'access', _15 => _15.owner, 'optionalAccess', _16 => _16.number, 'optionalAccess', _17 => _17[0]]) || "No diset";

      let txt = `🗂️ *sᴛᴀᴛᴜs ᴀᴜᴛᴏ ʙᴀᴄᴋᴜᴘ*\n\n`;
      txt += `╭┈┈⬡「 📊 *ɪɴꜰᴏ* 」\n`;
      txt += `┃ 🔘 Enabled: ${status.enabled ? "✅ Ya" : "❌ Tidak"}\n`;
      txt += `┃ ⏱️ Interval: ${status.interval}\n`;
      txt += `┃ 🔄 Running: ${status.isRunning ? "✅ Ya" : "❌ Tidak"}\n`;
      txt += `┃ 📅 Last: ${status.lastBackup ? timeHelper.fromTimestamp(status.lastBackup, "DD MMMM YYYY HH:mm:ss") : "-"}\n`;
      txt += `┃ #️⃣ Total: ${status.backupCount} backup\n`;
      txt += `┃ 📤 Objetivo: ${ownerNum}\n`;
      txt += `╰┈┈┈┈┈┈┈┈⬡`;

      return m.reply(txt);
    }

    case "now":
    case "manual":
    case "trigger": {
      await m.react("🕕");
      await m.reply(
        `🕕*ᴍᴇᴍʙᴜᴀᴛ ʙᴀᴄᴋᴜᴘ...\n\nPor favor, espera, haciendo un pastel de espalda.`,
      );

      try {
        await _ourinautobackupjs.triggerManualBackup.call(void 0, sock);
        await m.react("✅");
        return m.reply(
          `✅*ʙᴀᴄᴋᴜᴘSᴇʟᴇSᴀɪ*\n\n¡El respaldo ha sido enviado al dueño!`,
        );
      } catch (error) {
        await m.react('☢');
        await m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
      }
    }

    default:
      return m.reply(
        `⚠️ *ᴀᴄᴛɪᴏɴ ᴛɪᴅᴀᴋ ᴠᴀʟɪᴅ*\n\n` +
          `> Elige:\`on\`.\`apagado\`.\`estado\`, o\`Ahora\`\n` +
          `> Ejemplo:\`${m.prefix}autobackup on 6h\``,
      );
  }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

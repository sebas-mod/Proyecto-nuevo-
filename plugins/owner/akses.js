"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ms = require('ms'); var _ms2 = _interopRequireDefault(_ms);
const pluginConfig = {
  name: "akses",
  alias: [
    "addakses",
    "delakses",
    "listakses",
    "addaccess",
    "delaccess",
    "listaccess",
  ],
  category: "owner",
  description: "Grant temporary/permanent command access to users",
  usage: ".addakses <cmd> <duration> <user>",
  example: ".addakses addowner 30d @user",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, plugins }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const cmd = m.command.toLowerCase();
  const isAdd = ["addakses", "addaccess"].includes(cmd);
  const isDel = ["delakses", "delaccess"].includes(cmd);
  const isList = ["listakses", "listaccess"].includes(cmd);
  let target = _optionalChain([m, 'access', _ => _.mentionedJid, 'optionalAccess', _2 => _2[0]]);
  if (!target && m.quoted) target = m.quoted.sender;
  if (!target && m.args.length > 0) {
    for (const arg of m.args) {
      if (/^\d{5,15}$/.test(arg)) {
        target = arg + "@s.whatsapp.net";
        break;
      } else if (/^@\d+/.test(arg)) {
        target = arg.replace("@", "") + "@s.whatsapp.net";
        break;
      }
    }
  }
  let commandTarget = null;
  let durationTarget = null;
  if (isAdd) {
    if (!target)
      return m.reply(
        `❌* Objetivo invitado *\n\nTag user / Responder chat / Escribe el nútánánde objetivo`,
      );
    const cleanArgs = m.args.filter(
      (a) => !a.includes("@") && !/^\d{10,}$/.test(a),
    );
    if (cleanArgs.length < 2) {
      return m.reply(
        `⚠* Formatt Incorrecto*\n\n` +
          `Formato:\`${m.prefix}addakses <command> <durasi> <target>\`\n\n` +
          `*Ejemplo:*\n` +
          `> \`${m.prefix}addakses addowner 30d @ usuario\`(30 El)\n` +
          `> \`${m.prefix}addakses unban permanent @user\` (Selamanya)\n\n` +
          `* Soporte de Duración: * 1h, 1d, 30d, 1y`,
      );
    }
    commandTarget = cleanArgs[0].toLowerCase();
    durationTarget = cleanArgs[1].toLowerCase();
  }

  const user = db.getUser(target) || {};
  if (!user.access) user.access = [];
  if (isList) {
    if (!target) target = m.sender;
    const targetData = db.getUser(target) || {};
    const accessList = targetData.access || [];
    const now = Date.now();
    const activeAccess = accessList.filter(
      (a) => a.expired === null || a.expired > now,
    );
    if (activeAccess.length !== accessList.length) {
      targetData.access = activeAccess;
      db.setUser(target, targetData);
    }

    if (activeAccess.length === 0) {
      return m.reply(
        `📊 *ᴜsᴇʀ ᴀᴄᴄᴇss*\n\nTarget: @${target.split("@")[0]}\nEstado: * No hay acciones especiales *`,
        {
          mentions: sock.parseMention(`@${target.split("@")[0]}`),
        },
      );
    }

    let txt = `📊 *ᴜsᴇʀ ᴀᴄᴄᴇss*\n\n`;
    txt += `Objetivo: @${target.split("@")[0]}\n`;
    txt += `Total: *${activeAccess.length}* commands\n`;
    txt += `━━━━━━━━━━━━━━━\n\n`;

    activeAccess.forEach((acc, i) => {
      let expiredTxt = "♾️ Permanent";
      if (acc.expired) {
        const timeLeft = acc.expired - now;
        if (timeLeft > 0) {
          expiredTxt = "🕕 " + _ms2.default.call(void 0, timeLeft, { long: true });
        } else {
          expiredTxt = "🔴 Expired";
        }
      }

      txt += `${i + 1}. *${acc.cmd}*\n`;
      txt += `   └ ${expiredTxt}\n`;
    });

    return m.reply(txt, { mentions: [target] });
  }
  if (isAdd) {
    let expiredTime = null;
    if (durationTarget !== "permanent" && durationTarget !== "perm") {
      try {
        const durationMs = _ms2.default.call(void 0, durationTarget);
        if (!durationMs)
          return m.reply(`❌Formador de duración incorrecta! Uso: 1h, 1d, 30d`);
        expiredTime = Date.now() + durationMs;
      } catch (e) {
        return m.reply(`❌¡La duración del formato no se juega!`);
      }
    }

    const existingIdx = user.access.findIndex((a) => a.cmd === commandTarget);
    if (existingIdx !== -1) {
      user.access[existingIdx].expired = expiredTime;
      db.setUser(target, user);
      return m.reply(
        `✅ *ᴀᴋsᴇs ᴅɪᴘᴇʀʙᴀʀᴜɪ*\n\n` +
          `Comando:\`${commandTarget}\`\n` +
          `Duración: *${durationTarget}*\n` +
          `Objetivo: @${target.split("@")[0]}`,
      );
    }
    user.access.push({
      cmd: commandTarget,
      expired: expiredTime,
    });

    // console.log('[DEBUG AddAccess] Saving user with access:', JSON.stringify(user.access))
    db.setUser(target, user);
    // console.log('[DEBUG AddAccess] After save:', JSON.stringify(db.getUser(objetivo)?.access))

    await m.reply(
      `✅ *ᴀᴋsᴇs ᴅɪʙᴇʀɪᴋᴀɴ*\n\n` +
        `┃ 🔑 ᴄᴍᴅ: \`${commandTarget}\`\n` +
        `┃ ⏱️ ᴅᴜʀᴀsɪ: *${durationTarget}*\n` +
        `┃ 👤 ᴛᴀʀɢᴇᴛ: @${target.split("@")[0]}\n`,
      { mentions: [target] },
    );
  }
  if (isDel) {
    if (!target) return m.reply(`❌¡El usuario de la etiqueta que quiere estar cubierto por su accesorio!`);
    const now = Date.now();
    const activeAccess = user.access.filter(
      (a) => a.expired === null || a.expired > now,
    );
    let specificCmd = m.args.find((a) => !a.includes("@") && !/^\d+$/.test(a));
    if (specificCmd) {
      specificCmd = specificCmd.toLowerCase();
      const idx = user.access.findIndex((a) => a.cmd === specificCmd);
      if (idx === -1)
        return m.reply(`❌El usuario no tiene acción real\`${specificCmd}\``);

      user.access.splice(idx, 1);
      db.setUser(target, user);
      return m.reply(
        `✅ Akses \`${specificCmd}\`Sucesivamente revocado de @${target.split("@")[0]}`,
      );
    }

    if (activeAccess.length === 0) {
      return m.reply(`⚠Este Usuario no tiene acción real.`);
    }
    const rows = activeAccess.map((acc) => {
      const exp = acc.expired ? _ms2.default.call(void 0, acc.expired - now) : "Permanent";
      return {
        title: `Elimina:${acc.cmd}`,
        description: `Restante duración:${exp}`,
        id: `${m.prefix}delakses ${acc.cmd} ${target}`,
      };
    });
    const listMessage = {
      text: `🔓* CABUT ACCESS *\n\nSeleccione el comando de acciones para entrar desde @${target.split("@")[0]}`,
      title: "Manage Access",
      buttonText: "PILIH COMMAND",
      sections: [
        {
          title: "Active Access List",
          rows: rows,
        },
      ],
    };

    return sock.sendMessage(m.chat, listMessage, { quoted: m });
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

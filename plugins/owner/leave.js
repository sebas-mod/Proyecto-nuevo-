"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
  name: "leave",
  alias: ["leavegrup", "leavegroup", "keluar", "bye"],
  category: "owner",
  description: "# Sal del grupo #",
  usage: ".leave [link]",
  example: ".leave",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function extractInviteCode(text) {
  const patterns = [
    /chat\.whatsapp\.com\/([a-zA-Z0-9]{20,})/i,
    /wa\.me\/([a-zA-Z0-9]{20,})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1];
  }

  return null;
}

async function handler(m, { sock }) {
  const input = m.args.join(" ").trim();

  let targetGroupJid = null;
  let groupName = "";

  if (!input && m.isGroup) {
    targetGroupJid = m.chat;
    try {
      const meta = m.groupMetadata;
      groupName = meta.subject || "Este grupo";
    } catch (e) {
      groupName = "Este grupo";
    }
  } else if (input) {
    const inviteCode = await extractInviteCode(input);

    if (!inviteCode) {
      return m.reply(`❌*ɢᴀɢᴀʟ*\n\nLa invitación al enlace no es válida`);
    }

    try {
      const groupInfo = await sock.groupGetInviteInfo(inviteCode);
      targetGroupJid = groupInfo.id;
      groupName = groupInfo.subject || "Unknown";
    } catch (error) {
      return m.reply(
        `❌*ɢᴀɢᴀʟ*\n\n*No puedo tomar la información de grupos de enlaces*`,
      );
    }
  } else {
    return m.reply(
      `🚪 *ʟᴇᴀᴠᴇ ɢʀᴜᴘ*\n\n` +
        `╭┈┈⬡「 📋 *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ* 」\n` +
        `┃ ◦En el grupo:\`Vete.\`\n` +
        `┃ ◦Via enlace:\`Vete.<link>\`\n` +
        `╰┈┈⬡\n\n` +
        `\`Contoh: ${m.prefix}leave https://chat.whatsapp.com/xxx\``,
    );
  }

  if (!targetGroupJid) {
    return m.reply(`❌*ɢᴀɢᴀʟ*\n\nGrup no fue encontrado`);
  }

  await m.react("🕕");

  try {
    global.sewaLeaving = true;

    const saluranId = _optionalChain([_configjs2.default, 'access', _ => _.saluran, 'optionalAccess', _2 => _2.id]) || "120363400911374213@newsletter";
    const saluranName = _optionalChain([_configjs2.default, 'access', _3 => _3.saluran, 'optionalAccess', _4 => _4.name]) || _optionalChain([_configjs2.default, 'access', _5 => _5.bot, 'optionalAccess', _6 => _6.name]) || "Ourin-AI";

    if (m.isGroup && targetGroupJid === m.chat) {
      await sock.sendMessage(m.chat, {
        text:
          `👋 *ɢᴏᴏᴅʙʏᴇ*\n\n` +
          `Siento haber salido de este grupo.\n` +
          `¡Gracias a Dios por usar las botas!`,
        contextInfo: {
          forwardingScore: 9999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: saluranId,
            newsletterName: saluranName,
            serverMessageId: 127,
          },
        },
      });
    }

    await sock.groupLeave(targetGroupJid);

    global.sewaLeaving = false;

    if (!m.isGroup || targetGroupJid !== m.chat) {
      await m.react("✅");
      await m.reply(
        `✅ *ʙᴇʀʜᴀsɪʟ ᴋᴇʟᴜᴀʀ*\n\n` + `* Ha salido de:*${groupName}*`,
      );
    }
  } catch (error) {
    global.sewaLeaving = false;
    await m.react("☢");
    await m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

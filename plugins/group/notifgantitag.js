"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }



var _antitoxicjs = require('./antitoxic.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourincontextjs = require('../../src/lib/ourin-context.js');
const pluginConfig = {
  name: "notifgantitag",
  alias: ["notiflabel", "notiftag", "labeltag"],
  category: "group",
  description: "Mengatur notifikasi perubahan label/tag member",
  usage: ".notifgantitag <on/off>",
  example: ".notifgantitag on",
  isGroup: true,
  isAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};
async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const args = m.args || [];
  const sub = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);
  const sub2 = _optionalChain([args, 'access', _4 => _4[1], 'optionalAccess', _5 => _5.toLowerCase, 'call', _6 => _6()]);
  const groupData = db.getGroup(m.chat) || {};
  const currentStatus = groupData.notifLabelChange === true;
  if (sub === "on" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply(`❌¡Sólo el propietario puede usar está característica!`);
    }
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { notifLabelChange: true });
        count++;
      }
      m.react("✅");
      return m.reply(
        `✅ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ɢʟᴏʙᴀʟ ᴏɴ*\n\n` +
          `* Las notificaciones de la doble etiqueta están habilitadas en *${count}* grupo!`,
      );
    } catch (err) {
      m.react("☢");
      return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
  }
  if (sub === "off" && sub2 === "all") {
    if (!m.isOwner) {
      return m.reply(`❌¡Sólo el propietario puede usar está característica!`);
    }
    m.react("🕕");
    try {
      const groups = await sock.groupFetchAllParticipating();
      const groupIds = Object.keys(groups);
      let count = 0;
      for (const groupId of groupIds) {
        db.setGroup(groupId, { notifLabelChange: false });
        count++;
      }
      m.react("✅");
      return m.reply(
        `❌ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ɢʟᴏʙᴀʟ ᴏꜰꜰ*\n\n` +
          `*Las notificaciones de la doble etiqueta están desactivadas en *${count}* grupo!`,
      );
    } catch (err) {
      m.react("☢");
      return m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
  }
  if (sub === "on") {
    if (currentStatus) {
      return m.reply(
        `⚠️ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ᴀʟʀᴇᴀᴅʏ ᴀᴄᴛɪᴠᴇ*\n\n` +
          `> Status: *✅ ON*\n` +
          `El nuevo Notifkasi de la etiqueta ya está activo en este grupo.\n\n` +
          `*Usarlo*\`${m.prefix}notifgantitagón\`para desactivando._`,
      );
    }
    db.setGroup(m.chat, { notifLabelChange: true });
    return m.reply(
      `✅ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ᴀᴋᴛɪꜰ*\n\n` +
        `¡Al cambio de las notificaciones de fotos de etiquetas está habilitado!\n` +
        `Sí, te avisaré cuando el laboratorio cambie.\n\n` +
        `♪ ♪`,
    );
  }
  if (sub === "off") {
    if (!currentStatus) {
      return m.reply(
        `⚠️ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ᴀʟʀᴇᴀᴅʏ ɪɴᴀᴄᴛɪᴠᴇ*\n\n` +
          `> Status: *❌ OFF*\n` +
          `La etiqueta ' s negativa en este grupo.\n\n` +
          `*Usarlo*\`${m.prefix}notifgantitagón\`para activando._`,
      );
    }
    db.setGroup(m.chat, { notifLabelChange: false });
    return m.reply(
      `❌ *ɴᴏᴛɪꜰ ʟᴀʙᴇʟ ɴᴏɴᴀᴋᴛɪꜰ*\n\n` +
        `A la etiqueta las notificaciones de modificación de fotos fueron con éxito deshabilitados.`,
    );
  }
  m.reply(
    `🏷️ *ɴᴏᴛɪꜰ ɢᴀɴᴛɪ ᴛᴀɢ/ʟᴀʙᴇʟ*\n\n` +
      `> Status: *${currentStatus ? "✅ ON" : "❌ OFF"}*\n\n` +
      `\`\`\`━━━ ᴘɪʟɪʜᴀɴ ━━━\`\`\`\n` +
      `> \`${m.prefix}notifgantitag on\` → Aktifkan\n` +
      `> \`${m.prefix}notifgantitag off\` → Nonaktifkan\n` +
      `> \`${m.prefix}notifgantitagón\` →Global ON (propietario)\n` +
      `> \`${m.prefix}notifgantitag off al\` →Global OFF (propietario)\n\n` +
      `♪📋* Está característica dirá el momento: *\n` +
      `♪•Admin añadir etiqueta a miembro\n` +
      `♪•Admin desbloquea la etiqueta de la foto\n` +
      `> • Label member berubah`,
  );
}
async function handleLabelChange(msg, sock) {
  try {
    const db = _ourindatabasejs.getDatabase.call(void 0, );
    const protocolMessage = _optionalChain([msg, 'access', _7 => _7.message, 'optionalAccess', _8 => _8.protocolMessage]);
    if (!protocolMessage) return false;
    if (protocolMessage.type !== 30) return false;
    const memberLabel = protocolMessage.memberLabel;
    if (!memberLabel) return false;
    const groupJid = msg.key.remoteJid;
    if (!_optionalChain([groupJid, 'optionalAccess', _9 => _9.endsWith, 'call', _10 => _10("@g.us")])) return false;
    const groupData = db.getGroup(groupJid) || {};
    const participant = msg.key.participant || msg.participant || "Unknown";
    const label = memberLabel.label || "";
    if (groupData.antitoxic && label && label.trim()) {
      try {
        const toxicWords = groupData.toxicWords || _antitoxicjs.DEFAULT_TOXIC_WORDS;
        const toxicCheck = _antitoxicjs.isToxic.call(void 0, label, toxicWords);
        if (toxicCheck.toxic) {
          await sock.sendText(
            groupJid,
            `Hei @${participant.split("@")[0]}, Tag you 're pregnant with the word tox¡Cic!`,
            null,
            {
              mentions: [participant],
              contextInfo: {
                ..._ourincontextjs.saluranCtx.call(void 0, ),
                mentionedJid: [participant],
              },
            },
          );
          return true;
        }
      } catch (e) {}
    }
    if (groupData.notifLabelChange !== true) return false;
    let groupMeta = null;
    try {
      groupMeta = await sock.groupMetadata(groupJid);
    } catch (e2) {}
    let notifText = "";
    if (label && label.trim()) {
      notifText = `🎉 @${participant.split("@")[0]}ha convertido la etiqueta en *${label}*`;
    } else {
      notifText = `🥗 @${participant.split("@")[0]}ha borrado la etiqueta`;
    }
    console.log(notifText);
    await sock.sendText(groupJid, notifText, null, {
      mentions: [participant],
      contextInfo: {
        ..._ourincontextjs.saluranCtx.call(void 0, ),
        mentionedJid: [participant],
      },
    });
    return true;
  } catch (error) {
    console.error("[NotifLabelChange] Error:", error.message);
    return false;
  }
}
exports.config = pluginConfig; exports.handler = handler; exports.handleLabelChange = handleLabelChange;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

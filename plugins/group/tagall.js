"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


var _ourinlidjs = require('../../src/lib/ourin-lid.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
  name: "tagall",
  alias: ["all", "everyone"],
  category: "group",
  description: "Tag semua member grup",
  usage: ".tagall <pesan>",
  example: ".tagall Halo semua!",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 30,
  energi: 0,
  isEnabled: true,
  isAdmin: true,
  isBotAdmin: false,
};

async function handler(m, { sock }) {
  const text = m.text || "Tag All Members";

  try {
    const groupMeta = m.groupMetadata;
    const participants = groupMeta.participants || [];

    if (participants.length === 0) {
      await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Tidak ada member di grup ini.`);
      return;
    }

    const targetParticipants = participants.filter((participant) => {
      return _ourinlidjs.getParticipantJid.call(void 0, participant) !== m.sender;
    });

    if (targetParticipants.length === 0) {
      await m.reply(`❌ *ɢᴀɢᴀʟ*\n\n> Tidak ada member lain yang bisa di-tag.`);
      return;
    }

    const mentions = _ourinlidjs.getParticipantJids.call(void 0, targetParticipants);
    const memberList = targetParticipants
      .map((participant) => `@${_ourinlidjs.getParticipantJid.call(void 0, participant).split("@")[0]}`)
      .join("\n")
      .trim();

    await m.reply(
      `*Pesan:* ${text}\n\n` +
        `\`\`\`━━━ ${targetParticipants.length} MEMBER TOTAL ━━━\`\`\`\n` +
        memberList,
      { mentions: mentions },
    );
  } catch (error) {
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

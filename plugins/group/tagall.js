"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }


var _almikulidjs = require('../../src/lib/almiku-lid.js');
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
  name: "tagall",
  alias: ["all", "everyone"],
  category: "group",
  description: "Etiqueta todas las fotos de grupo",
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
      await m.reply(`❌*ɢᴀɢᴀʟ*\n\nNo hay foto en este grupo.`);
      return;
    }

    const targetParticipants = participants.filter((participant) => {
      return _almikulidjs.getParticipantJid.call(void 0, participant) !== m.sender;
    });

    if (targetParticipants.length === 0) {
      await m.reply(`❌*ɢᴀɢᴀʟ*\n\nNo hay otras fotos que etiquetar.`);
      return;
    }

    const mentions = _almikulidjs.getParticipantJids.call(void 0, targetParticipants);
    const memberList = targetParticipants
      .map((participant) => `@${_almikulidjs.getParticipantJid.call(void 0, participant).split("@")[0]}`)
      .join("\n")
      .trim();

    await m.reply(
      `*Mensaje:*${text}\n\n` +
        `\`\`\`━━━ ${targetParticipants.length} MEMBER TOTAL ━━━\`\`\`\n` +
        memberList,
      { mentions: mentions },
    );
  } catch (error) {
    m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

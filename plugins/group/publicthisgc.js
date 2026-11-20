"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);

const pluginConfig = {
  name: "publicthisgc",
  alias: ["publicgc", "publicgroup", "publicthisgroup"],
  category: "group",
  description: "Permitir modos públicos sólo en este grupo",
  usage: ".publicthisgc",
  example: ".publicthisgc",
  isOwner: true,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const selfGroups = db.setting("selfGroups") || [];
  const publicGroups = db.setting("publicGroups") || [];

  const isSelfGroup = selfGroups.includes(m.chat);
  const isPublicGroup = publicGroups.includes(m.chat);

  if (isPublicGroup && !isSelfGroup) {
    return m.reply(
      `ℹ️ *ɢʀᴜᴘ ɪɴɪ sᴜᴅᴀʜ ᴍᴏᴅᴇ ᴘᴜʙʟɪᴄ*\n\n` +
        `# Responde todas las fotos de este grupo\n\n` +
        `*Usarlo*${m.prefix}autothisgc para cerrar el acceso _`,
    );
  }

  const updatedSelf = selfGroups.filter((id) => id !== m.chat);
  db.setting("selfGroups", updatedSelf);

  if (!publicGroups.includes(m.chat)) {
    db.setting("publicGroups", [...publicGroups, m.chat]);
  }

  m.react("🌐");
  return m.reply(
    `🌐 *ᴍᴏᴅᴇ ᴘᴜʙʟɪᴄ ᴅɪᴀᴋᴛɪꜰᴋᴀsɪ*\n\n` +
      `*Ahora respondiendo a todas las fotos de este grupo*\n` +
      `# Modo de sobrescribir activo global para este grupo #\n\n` +
      `📋Otro Grupo no está afectado\n\n` +
      `*Usarlo*${m.prefix}autoestegc para cerrar acciones de nuevo _`,
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

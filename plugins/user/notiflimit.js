"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
    name: "notiflimit",
    alias: ["notifenergi"],
    category: "owner",
    description: "Activación o desactivación de las notificaciones de límite de potong globating.",
    usage: ".notiflimit",
    example: ".notiflimit",
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true,
};

async function handler(m, { sock }) {
    const db = _ourindatabasejs.getDatabase.call(void 0, );

    const currentStatus = _nullishCoalesce(db.setting("notiflimit"), () => ( false));
    db.setting("notiflimit", !currentStatus);

    const newStatus = db.setting("notiflimit") ? "AKTIF ✅" : "MATI ❌";

    await m.reply(`* Límite la notiFICACIÓN (GLOBAL) *\n\nEstado actual: *${newStatus}*\n\nCuando esté activo, el bot siempre notificará el límite del usuario cuando haya un corte en la función de arranque.`);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

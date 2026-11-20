"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikudatabasejs = require('../../src/lib/almiku-database.js');

const pluginConfig = {
  name: "checkban",
  alias: [],
  category: "owner",
  description: "Check actual ban state",
  usage: ".checkban",
  isOwner: true,
};

async function handler(m, { sock }) {
  const db = _almikudatabasejs.getDatabase.call(void 0, );
  const target = "628979985621@s.whatsapp.net";

  // Test logic from config.js directly
  const cleanNumber = target
    .split(":")[0]
    .split("@")[0]
    .replace(/[^0-9]/g, "");
  let bannedList = _configjs2.default.bannedUsers || [];
  const savedBanned = db.setting("bannedUsers") || [];

  const combined = [...new Set([...bannedList, ...savedBanned])];

  const isBannedDirect = combined.some((banned) => {
    const cleanBanned = banned
      .split(":")[0]
      .split("@")[0]
      .replace(/[^0-9]/g, "");
    return (
      cleanNumber === cleanBanned ||
      cleanNumber.endsWith(cleanBanned) ||
      cleanBanned.endsWith(cleanNumber)
    );
  });

  // Evaluate fully:
  const finalResult = _configjs2.default.isBanned(target);

  let dbStatus = db.setting("bannedUsers");

  await m.reply(`DEBUG BAN (${target})
cleanNumber: ${cleanNumber}
bannedList (config): ${JSON.stringify(bannedList)}
savedBanned (db): ${JSON.stringify(savedBanned)}
isBannedDirect: ${isBannedDirect}
config.isBanned(): ${finalResult}
isOwner(): ${_configjs2.default.isOwner(target)}`);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

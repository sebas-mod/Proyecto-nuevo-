"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _almikudatabasejs = require('../../src/lib/almiku-database.js');
var _configjs = require('../../config.js');
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
  name: "ganti-namaowner",
  alias: ["setnamaowner", "setnameowner", "setownername"],
  category: "owner",
  description: "Propietario Cambia ( principal o añadir )",
  usage: ".ganti-namaowner <número> <nombre nuevo>",
  example: ".ganti-namaowner 628xxx Fauzan",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock, config }) {
  const db = _almikudatabasejs.getDatabase.call(void 0, );
  const input = m.args;

  if (!input[0]) {
    const nameMap = db.setting("ownerNames") || {};
    const mainOwnerNum = _optionalChain([config, 'access', _ => _.owner, 'optionalAccess', _2 => _2.number, 'optionalAccess', _3 => _3[0]]) || "";
    const mainName = _optionalChain([config, 'access', _4 => _4.owner, 'optionalAccess', _5 => _5.name]) || "Propietario";
    let list = `👤 *ᴏᴡɴᴇʀ ɴᴀᴍᴇ ʟɪsᴛ*\n\n`;
    list += `👑Juega: *${mainName}* (${mainOwnerNum})\n`;
    const entries = Object.entries(nameMap);
    if (entries.length > 0) {
      entries.forEach(([num, name]) => {
        list += `👤 ${num}: *${name}*\n`;
      });
    } else {
      list += `\n*Hay un nombre personalizado para el propietario añadido*`;
    }
    list += `\n\n*Uso:*\n`;
    list += `\`${m.prefix}ganti-namaowner <número> <nombre>\`\n`;
    list += `\`${m.prefix}ganti-namaowner juega<nama>\` —Cambiar el nombre del propietario principal`;
    return m.reply(list);
  }

  if (input[0].toLowerCase() === "main") {
    const newName = input.slice(1).join(" ").trim();
    if (!newName) {
      return m.reply(
        `👤*ɢᴀɴᴛɪ ɴᴀᴍᴀ ᴏᴡɴᴇʀ ᴜᴛᴀᴍᴀ*\n\nNombre actual: *${_optionalChain([config, 'access', _6 => _6.owner, 'optionalAccess', _7 => _7.name]) || "-"}*\n\n\`${m.prefix}ganti-namaowner juega<nama baru>\``,
      );
    }
    try {
      const configPath = _path2.default.join(process.cwd(), "config.js");
      let configContent = _fs2.default.readFileSync(configPath, "utf8");
      configContent = configContent.replace(
        /owner:\s*\{[\s\S]*?name:\s*['"]([^'"]*)['"]/,
        (match, oldName) =>
          match
            .replace(`'${oldName}'`, `'${newName}'`)
            .replace(`"${oldName}"`, `'${newName}'`),
      );
      _fs2.default.writeFileSync(configPath, configContent);
      config.owner.name = newName;
      return m.reply(
        `✅*ʙᴇʀʜᴀSɪʟ*\n\nEl nombre del propietario principal se modifica a: *${newName}*`,
      );
    } catch (error) {
      return m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
    }
  }

  const targetNumber = input[0].replace(/[^0-9]/g, "");
  const newName = input.slice(1).join(" ").trim();

  if (!targetNumber || targetNumber.length < 10) {
    return m.reply(
      `❌*ɢᴀɢᴀʟ*\n\n# Número no es válido #\n\n\`${m.prefix}ganti-namaowner 628xxx NamaOwner\``,
    );
  }

  if (!newName) {
    const currentName = _configjs.getOwnerName.call(void 0, targetNumber);
    return m.reply(
      `👤 *ɴᴀᴍᴀ ᴏᴡɴᴇʀ*\n\n> ${targetNumber}: *${currentName}*\n\n\`${m.prefix}ganti-namaowner${targetNumber} <nama baru>\``,
    );
  }

  const nameMap = db.setting("ownerNames") || {};
  nameMap[targetNumber] = newName;
  db.setting("ownerNames", nameMap);

  return m.reply(
    `✅*ʙᴇʀʜᴀSɪʟ*\n\n*Nombre propietario*${targetNumber}* cambiado a: *${newName}*`,
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

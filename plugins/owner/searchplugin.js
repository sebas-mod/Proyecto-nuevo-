"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _ourinpluginsjs = require('../../src/lib/ourin-plugins.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
  name: "searchplugin",
  alias: ["splugin", "findplugin", "infoplugin"],
  category: "owner",
  description: "Busca y mostrar los plugins en el campo",
  usage: ".splugin <nama>",
  example: ".splugin sticker",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function findPluginInfo(name) {
  const allPlugins = _ourinpluginsjs.getAllPlugins.call(void 0, );

  for (const plugin of allPlugins) {
    if (!plugin.config) continue;

    const rawName = plugin.config.name;
    const pName = _optionalChain([(
      Array.isArray(rawName) ? rawName[0] : rawName
    ), 'optionalAccess', _ => _.toLowerCase, 'call', _2 => _2()]);
    const aliases = Array.isArray(plugin.config.alias)
      ? plugin.config.alias
      : plugin.config.alias
        ? [plugin.config.alias]
        : [];

    if (
      pName === name.toLowerCase() ||
      aliases.map((a) => _optionalChain([a, 'optionalAccess', _3 => _3.toLowerCase, 'call', _4 => _4()])).includes(name.toLowerCase())
    ) {
      return {
        ...plugin.config,
        filePath: plugin.filePath,
      };
    }
  }

  return null;
}

async function findPluginFromFile(pluginsDir, name) {
  const folders = _fs2.default
    .readdirSync(pluginsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const folder of folders) {
    const folderPath = _path2.default.join(pluginsDir, folder);
    const files = _fs2.default.readdirSync(folderPath).filter((f) => f.endsWith(".js"));

    for (const file of files) {
      const baseName = file.replace(".js", "");
      if (baseName.toLowerCase() === name.toLowerCase()) {
        const filePath = _path2.default.join(folderPath, file);
        try {
          const mod = await Promise.resolve().then(() => _interopRequireWildcard(require(`file://${filePath.replace(/\\/g, "/")}`)));
          return {
            ...mod.config,
            folder,
            file,
            filePath,
          };
        } catch (e) {
          return { folder, file, filePath, error: e.message };
        }
      }
    }
  }

  return null;
}

async function handler(m, { sock }) {
  const name = _optionalChain([m, 'access', _5 => _5.text, 'optionalAccess', _6 => _6.trim, 'call', _7 => _7()]);

  if (!name) {
    return m.reply(
      `🔍 *sᴇᴀʀᴄʜ ᴘʟᴜɢɪɴ*\n\n` +
        `Busca y mostrar el plugin en el campo\n\n` +
        `*ᴄᴏɴᴛᴏʜ:*\n` +
        `> \`${m.prefix}splugin sticker\`\n` +
        `> \`${m.prefix}splugin menu\``,
    );
  }

  m.react("🔍");

  try {
    let info = findPluginInfo(name);

    if (!info) {
      const pluginsDir = _path2.default.join(process.cwd(), "plugins");
      info = await findPluginFromFile(pluginsDir, name);
    }

    if (!info) {
      await m.react("❌");
      return m.reply(
        `❌ *ᴛɪᴅᴀᴋ ᴅɪᴛᴇᴍᴜᴋᴀɴ*\n\n> Plugin \`${name}\`no encontrado`,
      );
    }

    if (info.error) {
      await m.react("⚠️");
      return m.reply(
        `⚠️ *ᴘʟᴜɢɪɴ ᴇʀʀᴏʀ*\n\n` +
          `> Archivo:\`${info.file}\`\n` +
          `> Carpeta:\`${info.folder}\`\n` +
          `> Error: \`${info.error}\``,
      );
    }

    const aliases = Array.isArray(info.alias)
      ? info.alias.join(", ")
      : info.alias || "-";
    const isEnabled = info.isEnabled !== false ? "✅ Ya" : "❌No";
    const isOwner = info.isOwner ? "✅ Ya" : "❌No";
    const isPremium = info.isPremium ? "✅ Ya" : "❌No";
    const isGroup = info.isGroup ? "✅ Ya" : "❌No";
    const isAdmin = info.isAdmin ? "✅ Ya" : "❌No";

    await m.react("✅");
    return m.reply(
      `📋 *ɪɴꜰᴏ ᴘʟᴜɢɪɴ*\n\n` +
        `╭┈┈⬡「 📝 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ 📛 ɴᴀᴍᴀ: \`${info.name || "-"}\`\n` +
        `┃ 🏷️ ᴀʟɪᴀs: \`${aliases}\`\n` +
        `┃ 📁 ᴄᴀᴛᴇɢᴏʀʏ: \`${info.category || "-"}\`\n` +
        `┃ 📄 ᴅᴇsᴄ: ${info.description || "-"}\n` +
        `┃ 📝 ᴜsᴀɢᴇ: \`${info.usage || "-"}\`\n` +
        `┃ 📌 ᴇxᴀᴍᴘʟᴇ: \`${info.example || "-"}\`\n` +
        `╰┈┈⬡\n\n` +
        `╭┈┈⬡「 ⚙️ *sᴇᴛᴛɪɴɢs* 」\n` +
        `┃ 🔓 ᴇɴᴀʙʟᴇᴅ: ${isEnabled}\n` +
        `┃ 👑 ᴏᴡɴᴇʀ ᴏɴʟʏ: ${isOwner}\n` +
        `┃ 💎 ᴘʀᴇᴍɪᴜᴍ: ${isPremium}\n` +
        `┃ 👥 ɢʀᴏᴜᴘ ᴏɴʟʏ: ${isGroup}\n` +
        `┃ 🛡️ ᴀᴅᴍɪɴ ᴏɴʟʏ: ${isAdmin}\n` +
        `┃ ⏱️ ᴄᴏᴏʟᴅᴏᴡɴ: \`${info.cooldown || 0}s\`\n` +
        `┃ 🎫 ʟɪᴍɪᴛ: \`${info.limit || 0}\`\n` +
        `╰┈┈⬡`,
    );
  } catch (error) {
    console.log(error);
    await m.react("☢");
    await m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

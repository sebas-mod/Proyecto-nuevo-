"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
  name: "enableplugin",
  alias: ["eplugin", "pluginenable", "onplugin"],
  category: "owner",
  description: "Reenaje de plugins desactivados",
  usage: ".enableplugin <nama_plugin>",
  example: ".enableplugin sticker",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function findPluginFile(pluginName) {
  const pluginsDir = _path2.default.join(process.cwd(), "plugins");
  const categories = _fs2.default.readdirSync(pluginsDir).filter((f) => {
    return _fs2.default.statSync(_path2.default.join(pluginsDir, f)).isDirectory();
  });

  for (const category of categories) {
    const categoryPath = _path2.default.join(pluginsDir, category);
    const files = _fs2.default.readdirSync(categoryPath).filter((f) => f.endsWith(".js"));

    for (const file of files) {
      try {
        const filePath = _path2.default.join(categoryPath, file);
        const plugin = await Promise.resolve().then(() => _interopRequireWildcard(require(`file://${filePath.replace(/\\/g, "/")}`)));

        if (!plugin.config) continue;

        const name = Array.isArray(plugin.config.name)
          ? plugin.config.name[0]
          : plugin.config.name;

        const aliases = plugin.config.alias || [];

        if (name === pluginName || aliases.includes(pluginName)) {
          return { filePath, plugin, category, file };
        }
      } catch (e) {}
    }
  }

  return null;
}

async function handler(m, { sock }) {
  const args = m.args || [];
  const pluginName = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);

  if (!pluginName) {
    return m.reply(
      `🔌 *ᴇɴᴀʙʟᴇ ᴘʟᴜɢɪɴ*\n\n` +
        `Aquí.\n\n` +
        `*Ejemplo:*\n` +
        `> \`${m.prefix}enableplugin sticker\`\n` +
        `> \`${m.prefix}enableplugin tiktok\``,
    );
  }

  const found = await findPluginFile(pluginName);

  if (!found) {
    return m.reply(`❌ Plugin *${pluginName}* no encontrado!`);
  }

  const { filePath, plugin, category, file } = found;

  if (plugin.config.isEnabled !== false) {
    return m.reply(`⚠️ Plugin *${pluginName}* está en!`);
  }

  try {
    let content = _fs2.default.readFileSync(filePath, "utf-8");

    content = content.replace(/isEnabled:\s*false/i, "isEnabled: true");

    _fs2.default.writeFileSync(filePath, content);

    await m.reply(
      `✅ *ᴘʟᴜɢɪɴ ᴇɴᴀʙʟᴇᴅ*\n\n` +
        `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
        `┃ 📦 Plugin: *${plugin.config.name}*\n` +
        `┃ 📁 Category: *${category}*\n` +
        `┃ 📄Archivo: *${file}*\n` +
        `┃ 🟢 Status: *Enabled*\n` +
        `╰┈┈⬡\n\n` +
        `*Reiniciar bot o usar la recarga caliente para aplicar.*`,
    );
  } catch (error) {
    await m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

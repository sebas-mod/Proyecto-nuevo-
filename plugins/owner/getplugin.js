"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinbuilderjs = require('../../src/lib/ourin-builder.js');
const pluginConfig = {
  name: "getplugin",
  alias: ["gp", "getcode", "plugincode", "sourcecode"],
  category: "owner",
  description: "Dapatkan source code plugin",
  usage: ".getplugin <nama plugin>",
  example: ".getplugin menu",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function searchPlugin(name, pluginsDir) {
  const categories = _fs2.default.readdirSync(pluginsDir).filter((f) => {
    return _fs2.default.statSync(_path2.default.join(pluginsDir, f)).isDirectory();
  });

  for (const category of categories) {
    const categoryPath = _path2.default.join(pluginsDir, category);
    const files = _fs2.default.readdirSync(categoryPath).filter((f) => f.endsWith(".js"));

    for (const file of files) {
      const baseName = file.replace(".js", "").toLowerCase();
      if (baseName === name.toLowerCase()) {
        return {
          path: _path2.default.join(categoryPath, file),
          category,
          file,
        };
      }
    }
  }

  for (const category of categories) {
    const categoryPath = _path2.default.join(pluginsDir, category);
    const files = _fs2.default.readdirSync(categoryPath).filter((f) => f.endsWith(".js"));

    for (const file of files) {
      const filePath = _path2.default.join(categoryPath, file);
      try {
        const content = _fs2.default.readFileSync(filePath, "utf-8");
        const aliasMatch = content.match(/alias:\s*\[([^\]]+)\]/);
        if (aliasMatch) {
          const aliases = aliasMatch[1].match(/['"`]([^'"`]+)['"`]/g);
          if (aliases) {
            const cleanAliases = aliases.map((a) =>
              a.replace(/['"`]/g, "").toLowerCase(),
            );
            if (cleanAliases.includes(name.toLowerCase())) {
              return {
                path: filePath,
                category,
                file,
              };
            }
          }
        }
      } catch (e) { }
    }
  }

  return null;
}

function getSimilarPlugins(name, pluginsDir) {
  const results = [];
  const categories = _fs2.default.readdirSync(pluginsDir).filter((f) => {
    return _fs2.default.statSync(_path2.default.join(pluginsDir, f)).isDirectory();
  });

  for (const category of categories) {
    const categoryPath = _path2.default.join(pluginsDir, category);
    const files = _fs2.default.readdirSync(categoryPath).filter((f) => f.endsWith(".js"));

    for (const file of files) {
      const baseName = file.replace(".js", "").toLowerCase();
      if (
        baseName.includes(name.toLowerCase()) ||
        name.toLowerCase().includes(baseName)
      ) {
        results.push(`${category}/${file}`);
      }
    }
  }

  return results.slice(0, 5);
}

async function handler(m, { sock }) {
  if (!_configjs2.default.isOwner(m.sender)) {
    return m.reply("❌ *Owner Only!*");
  }

  const pluginName = _optionalChain([m, 'access', _ => _.args, 'optionalAccess', _2 => _2[0], 'optionalAccess', _3 => _3.trim, 'call', _4 => _4()]);

  if (!pluginName) {
    return m.reply(
      `Halo *${m.pushName}*, sepertinya kamu lupa memasukkan nama plugin yang ingin dicari.\n\n` +
      `Silakan gunakan format berikut:\n` +
      `- .getplugin <nama plugin>\n\n` +
      `Contoh penggunaan:\n` +
      `- .getplugin menu\n` +
      `- .getplugin sticker\n` +
      `- .getplugin game/tebakgambar`
    );
  }

  const pluginsDir = _path2.default.join(process.cwd(), "plugins");

  let pluginInfo = null;

  if (pluginName.includes("/")) {
    const [category, file] = pluginName.split("/");
    const filePath = _path2.default.join(
      pluginsDir,
      category,
      file.endsWith(".js") ? file : `${file}.js`,
    );
    if (_fs2.default.existsSync(filePath)) {
      pluginInfo = {
        path: filePath,
        category,
        file: file.endsWith(".js") ? file : `${file}.js`,
      };
    }
  } else {
    pluginInfo = await searchPlugin(pluginName, pluginsDir);
  }

  if (!pluginInfo) {
    const similar = getSimilarPlugins(pluginName, pluginsDir);
    let text = `Maaf ya *${m.pushName}*, plugin dengan nama *${pluginName}* tidak dapat ditemukan.\n\n`;

    if (similar.length > 0) {
      text += `Mungkin maksud kamu salah satu dari plugin ini:\n`;
      similar.forEach((s) => {
        text += `- ${s}\n`;
      });
    }

    return m.reply(text);
  }

  const code = _fs2.default.readFileSync(pluginInfo.path);

  return await sock.sendMessage(m.chat, {
    text: "Langsung aja, pencet tombol dibawah",
    footer: _configjs2.default.bot.name,
    interactiveButtons: [
      {
        name: "cta_copy",
        buttonParamsJson: JSON.stringify({
          display_text: "Salin Kode",
          copy_code: code.toString("utf-8")
        })
      }
    ]
  }, { quoted: m });
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

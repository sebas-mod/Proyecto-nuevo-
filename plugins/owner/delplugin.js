"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _ourinpluginsjs = require('../../src/lib/ourin-plugins.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "delplugin",
  alias: ["delpl", "hapusplugin", "removeplugin"],
  category: "owner",
  description: "Hapus plugin berdasarkan nama",
  usage: ".delplugin <nama>",
  example: ".delplugin bliblidl",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function findPluginFile(pluginsDir, name) {
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
        return { folder, file, path: _path2.default.join(folderPath, file) };
      }
    }
  }

  return null;
}

async function handler(m, { sock }) {
  const name = _optionalChain([m, 'access', _ => _.fullArgs, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]) || _optionalChain([m, 'access', _4 => _4.args, 'optionalAccess', _5 => _5[0]]);

  if (!name) {
    return m.reply(
      `Halo *${m.pushName}*, sepertinya kamu lupa memasukkan nama plugin yang ingin dihapus.\n\n` +
      `Silakan gunakan format perintah berikut:\n` +
      `- .delplugin <nama plugin>\n\n` +
      `Contoh penggunaan:\n` +
      `- .delplugin bliblidl`
    );
  }

  await m.react("🕕");

  try {
    const pluginsDir = _path2.default.join(process.cwd(), "plugins");
    const found = findPluginFile(pluginsDir, name);

    if (!found) {
      await m.react("❌");
      return m.reply(`Maaf *${m.pushName}*, plugin dengan nama ${name} tidak dapat ditemukan.`);
    }

    let unloadResult = { success: false };
    try {
      unloadResult = _ourinpluginsjs.unloadPlugin.call(void 0, found.path) || { success: true };
    } catch (e) {}

    _fs2.default.unlinkSync(found.path);

    await m.react("✅");
    let replyText =
      `Proses selesai! Plugin berhasil dihapus dari sistem.\n\n` +
      `- File: ${found.file}\n` +
      `- Folder: ${found.folder}\n` +
      `- Status Unload: ${unloadResult.success ? "Berhasil" : "Pending"}\n\n` +
      `Plugin tersebut sudah dihapus dan tidak aktif lagi.`;

    return m.reply(replyText);
  } catch (error) {
    await m.react("☢");
    await m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

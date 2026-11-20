"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _ourinpluginsjs = require('../../src/lib/ourin-plugins.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "addplugin",
  alias: ["addpl", "tambahplugin"],
  category: "owner",
  description: "Tambah plugin baru dari code yang di-reply",
  usage: ".addplugin [namafile] [folder]",
  example: ".addplugin bliblidl downloader",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function extractPluginInfo(code) {
  const info = { name: null, category: null };
  const nameMatch = code.match(/name:\s*['"`]([^'"`]+)['"]/i);
  if (nameMatch) info.name = nameMatch[1];
  const categoryMatch = code.match(/category:\s*['"`]([^'"`]+)['"]/i);
  if (categoryMatch) info.category = categoryMatch[1];
  return info;
}

async function handler(m, { sock }) {
  const quoted = m.quoted;

  if (!quoted) {
    return m.reply(
      `Halo *${m.pushName}*, sepertinya kamu belum mereply kode pluginnya.\n\n` +
      `Silakan reply kode plugin yang ingin ditambahkan dengan perintah:\n` +
      `- .addplugin (untuk deteksi otomatis)\n` +
      `- .addplugin <nama file> (untuk nama kustom)\n` +
      `- .addplugin <nama file> <folder> (untuk nama dan folder kustom)`
    );
  }

  let code = quoted.text || quoted.body || "";

  if (
    quoted.mimetype === "application/javascript" ||
    _optionalChain([quoted, 'access', _ => _.filename, 'optionalAccess', _2 => _2.endsWith, 'call', _3 => _3(".js")])
  ) {
    try {
      code = (await quoted.download()).toString();
    } catch (e) {
      return m.reply(`Maaf *${m.pushName}*, proses gagal karena file tidak dapat diunduh.`);
    }
  }

  if (!code || code.length < 50) {
    return m.reply(`Maaf *${m.pushName}*, proses gagal karena kode terlalu pendek atau tidak valid.`);
  }

  const hasExport = code.includes("module.exports") || code.includes("export ");
  const hasConfig = code.includes("pluginConfig") || code.includes("config");
  if (!hasExport || !hasConfig) {
    return m.reply(
      `Maaf *${m.pushName}*, proses gagal karena kode bukan format plugin yang valid. Pastikan ada export dan config di dalamnya.`
    );
  }

  const extracted = extractPluginInfo(code);
  const args = m.args;

  let fileName = args[0] || extracted.name;
  let folderName = args[1] || extracted.category;

  if (!fileName) {
    return m.reply(
      `Maaf *${m.pushName}*, aku tidak bisa mendeteksi nama pluginnya. Silakan gunakan perintah dengan format .addplugin <nama file>.`
    );
  }

  if (!folderName) folderName = "other";

  fileName = fileName.toLowerCase().replace(/[^a-z0-9\-_]/g, "");
  folderName = folderName.toLowerCase().replace(/[^a-z0-9\-_]/g, "");

  if (!fileName) {
    return m.reply(`Maaf *${m.pushName}*, proses gagal karena nama file tidak valid.`);
  }

  await m.react("🕕");

  try {
    const pluginsDir = _path2.default.join(process.cwd(), "plugins");
    const folderPath = _path2.default.join(pluginsDir, folderName);
    const filePath = _path2.default.join(folderPath, `${fileName}.js`);

    if (!_fs2.default.existsSync(folderPath)) {
      _fs2.default.mkdirSync(folderPath, { recursive: true });
    }

    if (_fs2.default.existsSync(filePath)) {
      await m.react("❌");
      return m.reply(
        `Maaf *${m.pushName}*, file ${fileName}.js sudah ada di folder ${folderName}.\n\n` +
        `💡 Tips: Gunakan perintah .ganticode ${fileName} ${folderName} jika kamu ingin mengganti kode plugin yang sudah ada.`
      );
    }

    _fs2.default.writeFileSync(filePath, code);

    let reloadResult = { success: false };
    try {
      reloadResult = (await _ourinpluginsjs.hotReloadPlugin.call(void 0, filePath)) || { success: true };
    } catch (e2) {}

    await m.react("✅");
    let replyText =
      `Proses selesai! Plugin berhasil ditambahkan ke dalam sistem.\n\n` +
      `- File: ${fileName}.js\n` +
      `- Folder: ${folderName}\n` +
      `- Ukuran: ${code.length} bytes\n` +
      `- Status Reload: ${reloadResult.success ? "Berhasil" : "Pending"}\n\n` +
      `Plugin sudah aktif dan siap digunakan, silakan dicoba ya!`;

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

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _ourinpluginsjs = require('../../src/lib/ourin-plugins.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "ganticode",
  alias: ["replaceplugin", "updateplugin", "gantiplugin"],
  category: "owner",
  description: "Plugins existentes del código Cambia",
  usage: ".ganticode [namafile] [folder]",
  example: ".ganticode ping main",
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
  const nameMatch = code.match(/name:\s*['"`]([^'"`]+)['"`]/i);
  if (nameMatch) info.name = nameMatch[1];
  const categoryMatch = code.match(/category:\s*['"`]([^'"`]+)['"`]/i);
  if (categoryMatch) info.category = categoryMatch[1];
  return info;
}

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
  const quoted = m.quoted;

  if (!quoted) {
    return m.reply(
      `Hola *${m.pushName}*, parece que aún no ha registrado las barras de plugin.\n\n` +
      `Por favor, responda un nuevo código de plug con comando:\n` +
      `-. ganticode (para autodetective )\n` +
      `- Ganticodo.<nama file>(para el nombre de kurstom )\n` +
      `- Ganticodo.<nama file> <folder>(para el nombre y la carpeta personalizados )\n\n` +
      `Relax, el viejo código se respaldará antes de que cambie.`
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
      return m.reply(`Lo siento *${m.pushName}*, el proceso falló porque el archivo no se podía descargar.`);
    }
  }

  if (!code || code.length < 50) {
    return m.reply(`Lo siento *${m.pushName}*, el proceso falló porque el código es corto o no válido.`);
  }

  const hasExport = code.includes("module.exports") || code.includes("export ");
  const hasConfig = code.includes("pluginConfig") || code.includes("config");
  if (!hasExport || !hasConfig) {
    return m.reply(
      `Lo siento *${m.pushName}*, proceso falló porque el código no es un formato de plugin válido.xEl eje y el config están dentro.`
    );
  }

  const extracted = extractPluginInfo(code);
  const args = m.args;

  let fileName = args[0] || extracted.name;
  let folderName = args[1] || extracted.category;

  if (!fileName) {
    return m.reply(
      `Lo siento *${m.pushName}*, No puedo detectar el nombre de los plugins.<nama file>.`
    );
  }

  fileName = fileName.toLowerCase().replace(/[^a-z0-9\-_]/g, "");

  if (!fileName) {
    return m.reply(`Lo siento *${m.pushName}*, el proceso falló porque el nombre del archivo era inválido.`);
  }

  await m.react("🕕");

  try {
    const pluginsDir = _path2.default.join(process.cwd(), "plugins");
    const existing = findPluginFile(pluginsDir, fileName);

    let filePath;
    let targetFolder;
    let isNewFile = false;
    let backupPath = null;
    let oldSize = 0;

    if (existing) {
      filePath = existing.path;
      targetFolder = existing.folder;
      oldSize = _fs2.default.statSync(filePath).size;

      const backupDir = _path2.default.join(process.cwd(), "backup", "plugins");
      if (!_fs2.default.existsSync(backupDir)) {
        _fs2.default.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, 19);
      backupPath = _path2.default.join(backupDir, `${fileName}_${timestamp}.js`);
      _fs2.default.copyFileSync(filePath, backupPath);
    } else {
      if (!folderName) folderName = "other";
      folderName = folderName.toLowerCase().replace(/[^a-z0-9\-_]/g, "");

      targetFolder = folderName;
      const folderPath = _path2.default.join(pluginsDir, targetFolder);

      if (!_fs2.default.existsSync(folderPath)) {
        _fs2.default.mkdirSync(folderPath, { recursive: true });
      }

      filePath = _path2.default.join(folderPath, `${fileName}.js`);
      isNewFile = true;
    }

    _fs2.default.writeFileSync(filePath, code);

    let reloadResult = { success: false };
    try {
      reloadResult = (await _ourinpluginsjs.hotReloadPlugin.call(void 0, filePath)) || { success: true };
    } catch (e2) {}

    await m.react("✅");

    let replyText =
      `¡Prosses completados!${isNewFile ? "ditambahkan" : "diperbarui"}.\n\n` +
      `- Archivo:${fileName}.js\n` +
      `- Carpeta:${targetFolder}\n` +
      `- Ukuran: ${code.length} bytes\n`;

    if (!isNewFile) {
      replyText += `- Antiguo 's rump:${oldSize} bytes\n`;
    }

    replyText +=
      `- Status Reload: ${reloadResult.success ? "Berhasil" : "Pending"}\n\n`;

    if (backupPath) {
      const relBackup = _path2.default.relative(process.cwd(), backupPath);
      replyText += `El archivo antiguo ha sido pegado con seguridad en la siguiente ubicación:\n${relBackup}\n\n`;
    }

    replyText += `Plugin está en y listo para usar, por favor, probátalo!`;

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

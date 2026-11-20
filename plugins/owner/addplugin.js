"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _almikupluginsjs = require('../../src/lib/almiku-plugins.js');
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);

const pluginConfig = {
  name: "addplugin",
  alias: ["addpl", "tambahplugin"],
  category: "owner",
  description: "Nueva adición del código recodificado-- respuesta",
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
      `Hola *${m.pushName}*, parece que aún no ha registrado los plugins.\n\n` +
      `Por favor, responda el código de plugins para ser extraído con el comando:\n` +
      `- Addplug (para autodec).\n` +
      `- Addplug.<nama file>(para el nombre de kurstom )\n` +
      `- Addplug.<nama file> <folder>(para nombres y gente personalizada)`
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

  if (!folderName) folderName = "other";

  fileName = fileName.toLowerCase().replace(/[^a-z0-9\-_]/g, "");
  folderName = folderName.toLowerCase().replace(/[^a-z0-9\-_]/g, "");

  if (!fileName) {
    return m.reply(`Lo siento *${m.pushName}*, el proceso falló porque el nombre del archivo era inválido.`);
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
        `Lo siento *${m.pushName}*, archivo${fileName}Así que está en la carpeta.${folderName}.\n\n` +
        `💡Consejos: Use el comando.${fileName} ${folderName}Si desea reemplazar el código de plugins existente.`
      );
    }

    _fs2.default.writeFileSync(filePath, code);

    let reloadResult = { success: false };
    try {
      reloadResult = (await _almikupluginsjs.hotReloadPlugin.call(void 0, filePath)) || { success: true };
    } catch (e2) {}

    await m.react("✅");
    let replyText =
      `Prosses complete! Plugin correctamente minada en el sistema.\n\n` +
      `- Archivo:${fileName}.js\n` +
      `- Carpeta:${folderName}\n` +
      `- Ukuran: ${code.length} bytes\n` +
      `- Status Reload: ${reloadResult.success ? "Berhasil" : "Pending"}\n\n` +
      `Plugin está en y listo para usar, por favor, probátalo!`;

    return m.reply(replyText);
  } catch (error) {
    await m.react("☢");
    await m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _url = require('url');
var _ourinpluginsjs = require('../../src/lib/ourin-plugins.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "gantiscraper",
  alias: ["replacescraper", "updatescraper", "gantiscrape"],
  category: "owner",
  description: "Código existente de src / raspador",
  usage: ".gantiscraper [namafile]",
  example: ".gantiscraper ig",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const SCRAPER_DIR = _path2.default.join(process.cwd(), "src", "scraper");
const PLUGINS_DIR = _path2.default.join(process.cwd(), "plugins");

function listScrapers() {
  if (!_fs2.default.existsSync(SCRAPER_DIR)) return [];
  return _fs2.default
    .readdirSync(SCRAPER_DIR)
    .filter((f) => f.endsWith(".js"))
    .map((f) => f.replace(".js", ""));
}

function findScraperFile(name) {
  const files = _fs2.default.readdirSync(SCRAPER_DIR).filter((f) => f.endsWith(".js"));

  for (const file of files) {
    if (file.replace(".js", "").toLowerCase() === name.toLowerCase()) {
      return { file, path: _path2.default.join(SCRAPER_DIR, file) };
    }
  }
  return null;
}

function walkJsFiles(dir) {
  if (!_fs2.default.existsSync(dir)) return [];

  const entries = _fs2.default.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = _path2.default.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkJsFiles(entryPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".js")) {
      files.push(entryPath);
    }
  }

  return files;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findDependentPluginFiles(scraperName) {
  const escapedName = escapeRegex(scraperName);
  const patterns = [
    new RegExp(`src[\\/]scraper[\\/]${escapedName}\\.js`, "i"),
    new RegExp(`scraper[\\/].*${escapedName}\\.js`, "i"),
  ];

  return walkJsFiles(PLUGINS_DIR).filter((filePath) => {
    const content = _fs2.default.readFileSync(filePath, "utf8");
    return patterns.some((pattern) => pattern.test(content));
  });
}

async function hotReloadScraperModule(filePath) {
  const fileUrl = _url.pathToFileURL.call(void 0, _path2.default.resolve(filePath)).href;
  await Promise.resolve().then(() => _interopRequireWildcard(require(`${fileUrl}?t=${Date.now()}`)));
  return { success: true };
}

async function hotReloadDependentPlugins(scraperName) {
  const dependentFiles = findDependentPluginFiles(scraperName);
  const results = [];

  for (const dependentFile of dependentFiles) {
    const reloadResult = await _ourinpluginsjs.hotReloadPlugin.call(void 0, dependentFile);
    results.push({
      file: _path2.default.relative(process.cwd(), dependentFile),
      success: !!_optionalChain([reloadResult, 'optionalAccess', _ => _.success]),
      error: _optionalChain([reloadResult, 'optionalAccess', _2 => _2.error]) || null,
    });
  }

  return results;
}

async function handler(m, { sock }) {
  const quoted = m.quoted;
  const args = m.args;

  if (_optionalChain([args, 'access', _3 => _3[0], 'optionalAccess', _4 => _4.toLowerCase, 'call', _5 => _5()]) === "list") {
    const scrapers = listScrapers();
    if (!scrapers.length) {
      return m.reply(`📂Siga src / scrapper vacio`);
    }

    let text = `📂*Registrate SCRAPER*\n\n` + `╭─〔 *src/scraper* 〕───⬣\n`;

    scrapers.forEach((s, i) => {
      const stat = _fs2.default.statSync(_path2.default.join(SCRAPER_DIR, `${s}.js`));
      text += `│ ${i + 1}. \`${s}.js\` (${(stat.size / 1024).toFixed(1)} KB)\n`;
    });

    text +=
      `╰───────⬡\n\n` +
      `Total: ${scrapers.length} scraper\n\n` +
      `> Usa \`${m.prefix}gangtiscrapper<nama>\`con el código de respuesta`;

    return m.reply(text);
  }

  if (!quoted) {
    return m.reply(
      `🔄*Cambia SCRAPER*\n\n` +
        `Responder código nuevo Scrapper con la leyenda:\n` +
        `\`${m.prefix}gangtiscrapper\`- Detector automático de expuerto\n` +
        `\`${m.prefix}gantiscrapper nombre de archivo\`- Nombre de archivo personalizado\n\n` +
        `📋* Mira la lista de los scriper: *\n` +
        `\`${m.prefix}gantiscraper list\`\n\n` +
        `⚠️ *Advertencia:*\nEl código antiguo será mochileado antes de que se cambie.`,
    );
  }

  let code = quoted.text || quoted.body || "";

  if (
    quoted.mimetype === "application/javascript" ||
    _optionalChain([quoted, 'access', _6 => _6.filename, 'optionalAccess', _7 => _7.endsWith, 'call', _8 => _8(".js")])
  ) {
    try {
      code = (await quoted.download()).toString();
    } catch (e) {
      return m.reply(`❌*Fallido*\n\nDescarga de Steer archivo`);
    }
  }

  if (!code || code.length < 30) {
    return m.reply(`❌*Fallido*\n\nEl código es bajo o inválido`);
  }

  const hasExport =
    code.includes("module.exports") ||
    code.includes("export ") ||
    code.includes("export default") ||
    code.includes("export {");

  if (!hasExport) {
    return m.reply(
      `❌*Fallido*\n\nEl código no es un formato válido Scrapper\nDebe no expuerto`,
    );
  }

  let fileName = args[0];

  if (!fileName) {
    const defaultMatch = code.match(
      /export\s+default\s+(?:async\s+)?function\s+(\w+)|export\s+default\s+(\w+)/,
    );
    if (defaultMatch) {
      fileName = defaultMatch[1] || defaultMatch[2];
    } else {
      const namedExport = code.match(
        /export\s+(?:async\s+)?function\s+(\w+)|export\s+const\s+(\w+)\s*=/,
      );
      if (namedExport) {
        fileName = namedExport[1] || namedExport[2];
      }
    }
  }

  if (!fileName) {
    return m.reply(
      `❌*Fallido*\n\nNo pude detectar el nombre de Scrapper.\nUsa\`${m.prefix}gantiscraper <namafile>\``,
    );
  }

  fileName = fileName.toLowerCase().replace(/[^a-z0-9\-_]/g, "");

  if (!fileName) {
    return m.reply(`❌*Fallido*\n\nNombre del archivo inválido`);
  }

  await m.react("🕕");

  try {
    if (!_fs2.default.existsSync(SCRAPER_DIR)) {
      _fs2.default.mkdirSync(SCRAPER_DIR, { recursive: true });
    }

    const existing = findScraperFile(fileName);
    let filePath = _path2.default.join(SCRAPER_DIR, `${fileName}.js`);
    let isNewFile = !existing;
    let backupPath = null;
    let oldSize = 0;

    if (existing) {
      filePath = existing.path;
      oldSize = _fs2.default.statSync(filePath).size;

      const backupDir = _path2.default.join(process.cwd(), "backup", "scraper");
      if (!_fs2.default.existsSync(backupDir)) {
        _fs2.default.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-")
        .slice(0, 19);
      backupPath = _path2.default.join(backupDir, `${fileName}_${timestamp}.js`);
      _fs2.default.copyFileSync(filePath, backupPath);
    }

    _fs2.default.writeFileSync(filePath, code);

    let scraperReload = { success: false };
    let pluginReloads = [];

    try {
      scraperReload = await hotReloadScraperModule(filePath);
      pluginReloads = await hotReloadDependentPlugins(fileName);
    } catch (reloadError) {
      if (backupPath && _fs2.default.existsSync(backupPath)) {
        _fs2.default.copyFileSync(backupPath, filePath);
      } else if (isNewFile && _fs2.default.existsSync(filePath)) {
        _fs2.default.unlinkSync(filePath);
      }
      throw reloadError;
    }

    await m.react("✅");

    let replyText =
      `✅ *SCRAPER ${isNewFile ? "DITAMBAH" : "DIGANTI"}*\n\n` +
      `╭─〔 *DETAIL* 〕───⬡\n` +
      `│Archivo:\`${fileName}.js\`\n` +
      `│Carpeta:\`src / raspadora\`\n` +
      `│ Size: \`${code.length} bytes\`\n`;

    if (!isNewFile) {
      replyText += `│ Old Size: \`${oldSize} bytes\`\n`;
    }

    replyText += `╰───────⬡\n\n`;

    if (backupPath) {
      const relBackup = _path2.default.relative(process.cwd(), backupPath);
      replyText += `💾 *Backup:*\n\`${relBackup}\`\n\n`;
    }

    const reloadSuccess = pluginReloads.filter((item) => item.success);
    const reloadFailed = pluginReloads.filter((item) => !item.success);

    replyText +=
      `🔄 *Hot Reload:*\n` +
      `- Scraper: ${scraperReload.success ? "✅ Sukses" : "⚠️ Pending"}\n` +
      `- Plugin Terdeteksi: ${pluginReloads.length}\n` +
      `- Reload Plugin:${reloadSuccess.length}\n` +
      `- Gaggle de Plugin:${reloadFailed.length}\n\n`;

    if (reloadSuccess.length) {
      replyText += `✅ *Plugin Reloaded:*\n`;
      replyText += reloadSuccess
        .slice(0, 10)
        .map((item) => `- \`${item.file}\``)
        .join("\n");
      replyText += `\n\n`;
    }

    if (reloadFailed.length) {
      replyText += `⚠♪ ♪ ♪ ♪ ♪\n`;
      replyText += reloadFailed
        .slice(0, 10)
        .map(
          (item) => `- \`${item.file}\`${item.error ? ` (${item.error})` : ""}`,
        )
        .join("\n");
      replyText += `\n\n`;
    }

    if (!pluginReloads.length) {
      replyText += `*No hay plugins largos que importan este raspador.*\n\n`;
    }

    if (reloadFailed.length > 0) {
      replyText += `⚠*Un poco de recarga falló, bot resorts podría ser necesario*`;
    } else {
      replyText += `¡Scrapper está activo y listo para usar!`;
    }

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

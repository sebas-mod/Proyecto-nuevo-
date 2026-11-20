"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _momenttimezone = require('moment-timezone'); var _momenttimezone2 = _interopRequireDefault(_momenttimezone);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _archiver = require('archiver'); var _archiver2 = _interopRequireDefault(_archiver);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
  name: "backupsc",
  alias: ["backup", "backupscript", "backupsource"],
  category: "owner",
  description: "Botín Skript backend en zhakk tack",
  usage: ".backupsc",
  example: ".backupsc",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  energi: 0,
  isEnabled: true,
};

const EXCLUDE_DIRS = new Set([
  "node_modules",
  ".git",
  "tmp",
  "temp",
  ".cache",
  ".npm",
  ".yarn",
  "dist",
  "coverage",
  "__pycache__",
  "build",
]);

const EXCLUDE_EXTENSIONS = new Set([
  ".zip",
  ".tar.gz",
  ".7z",
  ".mp4",
  ".mp3",
  ".wav",
  ".avi",
  ".mkv",
  ".ico",
  ".svg",
  ".traineddata",
  ".log",
  ".bak",
  ".lock",
]);

const EXCLUDE_FILES = new Set([
  ".env",
  ".env.local",
  "creds.json",
  "package-lock.json",
  "yarn.lock",
  ".npmrc",
  ".gitignore",
  "boot_final.log",
  "bot_log.txt",
  "error.txt",
  "changelog.txt",
  "UPDATE.txt",
  "CHANGELOG.md",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function shouldExclude(filePath, basePath) {
  const relativePath = _path2.default.relative(basePath, filePath);
  const parts = relativePath.split(_path2.default.sep);
  for (const part of parts) {
    if (EXCLUDE_DIRS.has(part)) return true;
  }
  const fileName = _path2.default.basename(filePath);
  if (EXCLUDE_FILES.has(fileName)) return true;
  const ext = _path2.default.extname(fileName).toLowerCase();
  if (EXCLUDE_EXTENSIONS.has(ext)) {
    const isAsset =
      relativePath.startsWith("assets" + _path2.default.sep) ||
      relativePath.startsWith("database" + _path2.default.sep);
    if (!isAsset) return true;
  }
  if (fileName.endsWith(".tar.gz")) return true;
  return false;
}

function getBackupOutputDir(projectRoot) {
  const backupDir = _path2.default.join(projectRoot, "backups", "script");
  if (!_fs2.default.existsSync(backupDir)) _fs2.default.mkdirSync(backupDir, { recursive: true });
  return backupDir;
}

async function handler(m, { sock }) {
  await m.react("🕕");
  await m.reply(
    `📦*ʙᴀᴄᴋᴜᴘSᴄʀɪᴘᴛ*\n\n- Procesando la espalda.\n- Por favor, espera un minuto.`,
  );
  try {
    const projectRoot = process.cwd();
    const timestamp = _momenttimezone2.default.call(void 0, ).tz("America/Argentina/Buenos_Aires").format("YYYY-MM-DD_HH-mm-ss");
    const botName =
      _optionalChain([_configjs2.default, 'access', _ => _.bot, 'optionalAccess', _2 => _2.name, 'optionalAccess', _3 => _3.replace, 'call', _4 => _4(/[^a-zA-Z0-9]/g, "")]) || "AlMikuBot";
    const zipFileName = `${botName}_backup_${timestamp}.zip`;
    const backupDir = getBackupOutputDir(projectRoot);
    const zipFilePath = _path2.default.join(backupDir, zipFileName);

    const output = _fs2.default.createWriteStream(zipFilePath);
    const archive = _archiver2.default.call(void 0, "zip", { zlib: { level: 9 } });
    let fileCount = 0;

    await new Promise((resolve, reject) => {
      let settled = false;
      const fail = (error) => {
        if (settled) return;
        settled = true;
        try {
          output.destroy();
        } catch (e) { }
        try {
          if (_fs2.default.existsSync(zipFilePath)) _fs2.default.unlinkSync(zipFilePath);
        } catch (e2) { }
        reject(error);
      };
      const succeed = () => {
        if (settled) return;
        settled = true;
        resolve();
      };
      output.on("error", fail);
      output.on("close", () => {
        try {
          if (!_fs2.default.existsSync(zipFilePath)) {
            fail(new Error("El archivo Bakup no se encontró después del proceso Z"));
            return;
          }
          const stats = _fs2.default.statSync(zipFilePath);
          if (stats.size <= 0) {
            fail(new Error("El archivo de horneo está vacío o 0KB"));
            return;
          }
          succeed();
        } catch (error) {
          fail(error);
        }
      });
      archive.on("error", reject);
      archive.on("warning", (error) => {
        if (_optionalChain([error, 'optionalAccess', _5 => _5.code]) !== "ENOENT") fail(error);
      });
      archive.pipe(output);

      function addDirectory(dirPath) {
        try {
          const items = _fs2.default.readdirSync(dirPath);
          for (const item of items) {
            const fullPath = _path2.default.join(dirPath, item);
            if (shouldExclude(fullPath, projectRoot)) continue;
            try {
              const stat = _fs2.default.statSync(fullPath);
              if (stat.isDirectory()) {
                addDirectory(fullPath);
              } else if (stat.isFile() && stat.size < MAX_FILE_SIZE) {
                const relativePath = _path2.default.relative(projectRoot, fullPath);
                archive.file(fullPath, { name: relativePath });
                fileCount += 1;
              }
            } catch (e3) { }
          }
        } catch (e4) { }
      }

      addDirectory(projectRoot);
      if (fileCount === 0) {
        fail(new Error("Ningún archivo entró en el backend del script"));
        return;
      }
      archive.finalize();
    });

    const stats = _fs2.default.statSync(zipFilePath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    const saluranId = _optionalChain([_configjs2.default, 'access', _6 => _6.saluran, 'optionalAccess', _7 => _7.id]) || "120363400911374213@newsletter";
    const saluranName = _optionalChain([_configjs2.default, 'access', _8 => _8.saluran, 'optionalAccess', _9 => _9.name]) || _optionalChain([_configjs2.default, 'access', _10 => _10.bot, 'optionalAccess', _11 => _11.name]) || "Al Miku-AI";

    await sock.sendMessage(
      m.chat,
      {
        document: _fs2.default.readFileSync(zipFilePath),
        fileName: zipFileName,
        mimetype: "application/zip",
        caption:
          `✅ *ʙᴀᴄᴋᴜᴘ sᴇʟᴇsᴀɪ*\n\n` +
          `╭┈┈⬡「 📋 *ᴅᴇᴛᴀɪʟ* 」\n` +
          `┃ 📝 ɴᴀᴍᴀ: \`${zipFileName}\`\n` +
          `┃ 📊 sɪᴢᴇ: \`${fileSizeMB} MB\`\n` +
          `┃ 📁 ꜰɪʟᴇ: \`${fileCount}\`\n` +
          `┃ 📅 ᴛᴀɴɢɢᴀʟ: \`${_momenttimezone2.default.call(void 0, ).tz("America/Argentina/Buenos_Aires").format("DD/MM/YYYY")}\`\n` +
          `╰┈┈⬡`,
        contextInfo: {
          forwardingScore: 9999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: saluranId,
            newsletterName: saluranName,
            serverMessageId: 127,
          },
        },
      },
      { quoted: m },
    );

    await m.react("✅");

    try {
      _fs2.default.unlinkSync(zipFilePath);
    } catch (e5) { }
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

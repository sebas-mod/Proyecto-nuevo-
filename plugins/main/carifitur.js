"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikuassetmanagerjs = require('../../src/lib/almiku-asset-manager.js');
var _almikujs = require('../../case/almiku.js');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
var _url = require('url');
// __filename provided by CJS
// __dirname provided by CJS
const pluginConfig = {
  name: "carifitur",
  alias: ["searchcmd", "findcmd", "cari", "search", "cf"],
  category: "main",
  description: "Búsqueda de palabras clave basadas en keyWord con detalles completos",
  usage: ".carifitur <keyword>",
  example: ".carifitur sticker",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};
function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}
function getSimilarity(str1, str2) {
  if (typeof str1 !== "string" || typeof str2 !== "string") return 0;
  const maxLen = Math.max(str1.length, str2.length);
  if (maxLen === 0) return 1;
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return (maxLen - distance) / maxLen;
}
function matchesKeyword(text, keyword) {
  if (!text || !keyword) return false;
  if (typeof text !== "string" || typeof keyword !== "string") return false;
  const textLower = text.toLowerCase();
  const keywordLower = keyword.toLowerCase();
  if (textLower.includes(keywordLower)) return true;
  if (keywordLower.includes(textLower)) return true;
  const words = textLower.split(/\s+/);
  for (const word of words) {
    if (word.includes(keywordLower) || keywordLower.includes(word)) return true;
  }
  const similarity = getSimilarity(textLower, keywordLower);
  if (similarity >= 0.6) return true;
  return false;
}
async function loadAllPlugins() {
  const plugins = [];
  const pluginsDir = _path2.default.join(__dirname, "..");
  try {
    const categories = _fs2.default.readdirSync(pluginsDir).filter((f) => {
      const stat = _fs2.default.statSync(_path2.default.join(pluginsDir, f));
      return stat.isDirectory();
    });
    for (const category of categories) {
      const categoryPath = _path2.default.join(pluginsDir, category);
      const files = _fs2.default
        .readdirSync(categoryPath)
        .filter((f) => f.endsWith(".js"));
      for (const file of files) {
        try {
          const plugin = await Promise.resolve().then(() => _interopRequireWildcard(require(
            `file://${_path2.default.join(categoryPath, file).replace(/\\/g, "/")}`
          )));
          if (plugin.config && plugin.config.name) {
            plugins.push({
              name: Array.isArray(plugin.config.name)
                ? plugin.config.name[0]
                : plugin.config.name,
              alias: plugin.config.alias || [],
              category: plugin.config.category || category,
              description: plugin.config.description || "No hay descripción",
              usage: plugin.config.usage || "",
              example: plugin.config.example || "",
              isEnabled: plugin.config.isEnabled !== false,
              isPremium: plugin.config.isPremium || false,
              isOwner: plugin.config.isOwner || false,
              cooldown: plugin.config.cooldown || 0,
              energi: plugin.config.energi || 0,
              isCase: false,
            });
          }
        } catch (e) { }
      }
    }
  } catch (e2) { }
  try {
    const caseCommands = _almikujs.getCaseCommands.call(void 0, );
    const caseAliases = {
      cping: ["cspeed", "clatency"],
      listallcase: ["lcase", "caselist", "allcase"],
      listallplugin: ["lplugin", "pluginlist", "allplugin"],
    };
    const caseDescriptions = {
      cping: "Cek ping case system",
      listallcase: "Lihat daftar semua case commands",
      listallplugin: "Lihat daftar semua plugin commands",
    };
    for (const [category, commands] of Object.entries(caseCommands)) {
      for (const cmd of commands) {
        plugins.push({
          name: cmd,
          alias: caseAliases[cmd] || [],
          category: category,
          description: caseDescriptions[cmd] || "Case command",
          usage: `.${cmd}`,
          example: `.${cmd}`,
          isEnabled: true,
          isPremium: false,
          isOwner: false,
          cooldown: 5,
          energi: 0,
          isCase: true,
        });
      }
    }
  } catch (e3) { }
  return plugins;
}
async function handler(m, { sock }) {
  const keyword = m.text;
  if (!keyword) {
    return m.reply(
      `🔍 *ᴄᴀʀɪ ꜰɪᴛᴜʀ*\n\n` +
      `╭┈┈⬡「 📋 *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ* 」\n` +
      `┃ \`${m.prefix}carifitur <keyword>\`\n` +
      `╰┈┈⬡\n\n` +
      `> Ejemplo:\n` +
      `\`${m.prefix}carifitur sticker\`\n` +
      `\`${m.prefix}carifitur download\`\n` +
      `\`${m.prefix}carifitur game\``,
    );
  }
  m.react("🕕");
  try {
    const allPlugins = await loadAllPlugins();
    const matches = [];
    for (const plugin of allPlugins) {
      if (!plugin.isEnabled) continue;
      let isMatch = false;
      let matchScore = 0;
      let matchReason = "";
      if (matchesKeyword(plugin.name, keyword)) {
        isMatch = true;
        matchScore = Math.max(
          matchScore,
          getSimilarity(plugin.name, keyword) * 1.2,
        );
        matchReason = "nama";
      }
      for (const alias of plugin.alias) {
        if (matchesKeyword(alias, keyword)) {
          isMatch = true;
          matchScore = Math.max(
            matchScore,
            getSimilarity(alias, keyword) * 1.1,
          );
          matchReason = matchReason || "alias";
        }
      }
      if (matchesKeyword(plugin.description, keyword)) {
        isMatch = true;
        matchScore = Math.max(
          matchScore,
          getSimilarity(plugin.description, keyword) * 0.8,
        );
        matchReason = matchReason || "deskripsi";
      }
      if (matchesKeyword(plugin.category, keyword)) {
        isMatch = true;
        matchScore = Math.max(
          matchScore,
          getSimilarity(plugin.category, keyword) * 0.7,
        );
        matchReason = matchReason || "kategori";
      }
      if (isMatch) {
        matches.push({ ...plugin, score: matchScore, matchReason });
      }
    }
    matches.sort((a, b) => b.score - a.score);
    if (matches.length === 0) {
      m.react("❌");
      return m.reply(
        `🔍*ʜᴀSɪʟ ᴘᴇɴᴄᴀʀɪᴀɴ*\n\n*No se encuentra característica con la palabra clave*\`${keyword}\``,
      );
    }
    const saluranId = _optionalChain([_configjs2.default, 'access', _ => _.saluran, 'optionalAccess', _2 => _2.id]) || "120363400911374213@newsletter";
    const saluranName = _optionalChain([_configjs2.default, 'access', _3 => _3.saluran, 'optionalAccess', _4 => _4.name]) || _optionalChain([_configjs2.default, 'access', _5 => _5.bot, 'optionalAccess', _6 => _6.name]) || "Al Miku-AI";
    let text = `🔍 *ʜᴀsɪʟ ᴘᴇɴᴄᴀʀɪᴀɴ: "${keyword}"*\n`;
    text += `*Encontrado*${matches.length}* fitur\n`;
    text += `Votar por uno de los comandos en el bayou:\n\n`;
    const topMatches = matches.slice(0, 15);
    for (let i = 0; i < Math.min(5, topMatches.length); i++) {
      const p = topMatches[i];
      const badges = [];
      if (p.isPremium) badges.push("💎");
      if (p.isOwner) badges.push("👑");
      text += `*${i + 1}. ${m.prefix}${p.name}* ${badges.join("")}\n`;
      text += `📁Categoría:\`${p.category}\`\n`;
      text += `📝 ${p.description.slice(0, 50)}${p.description.length > 50 ? "..." : ""}\n`;
      if (p.usage) text += `💡 Usage: \`${p.usage}\`\n`;
      if (p.cooldown > 0) text += `⏱️ Cooldown: ${p.cooldown}s\n`;
      text += `\n`;
    }
    if (topMatches.length > 5) {
      text += `_+${topMatches.length - 5}_ Otros resultados están disponibles`;
    }
    const buttons = topMatches.slice(0, 10).map((p, i) => ({
      title: `${m.prefix}${p.name}`,
      description: `${p.category} • ${p.description.slice(0, 40)}`,
      id: `${m.prefix}${p.name}`,
    }));
    m.react("✅");
    await sock.sendButton(
      m.chat,
      _almikuassetmanagerjs.getAssetBuffer.call(void 0, "almiku"),
      text,
      m,
      {
        buttons: [
          {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: "📋 Pilih Command",
              sections: [
                {
                  title: `*Para ser verdad*${keyword}"`,
                  rows: buttons,
                },
              ],
            }),
          },
        ],
      },
    );
  } catch (error) {
    m.react("☢");
    m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}
exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

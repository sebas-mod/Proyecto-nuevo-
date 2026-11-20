"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikutimejs = require('./almiku-time.js'); var timeHelper = _interopRequireWildcard(_almikutimejs);
/**
 * @typedef {Object} DashboardData
* @ proprie{string}UsuarioName - Nombre de usuario
* Perfil{string}Usuarios Estado - Usuario del estaya ( Propietario / Premium / Gratis )
* @ proprie{string}Modo - Bot de modo ( Publically / Self )
* @ proprie{number}total Usuarios - total de uso de botas
* @ proprie{number}UserLimit - Límite user
 */

/**
 * @typedef {Object} BotInfoData
* @ proprie{string}- Nombre del bot.
* @ proprie{string}develtner - Nombre del desarrollo
* Perfil{string}- Versión - Versión del bot
* @ proprie{string}- Hora de hacer el bot
* @ proprie{number}Total Características - total características
* @ proprie{string}Modo Modo bot
* @ proprie{string}Plataforma - Plataforma bot
 */

/**
 * @typedef {Object} UserProfileData
* @ proprie{string}nombre
* @ proprie{string}- El número de usuario
* Perfil{string}Akado - estado ( Propietario / Premium / Gratis )
* @ proprie{number}límite - límite se deja
* @ proprie{string}registro - Registro protegido
 */

/**
 * @typedef {Object} MenuCategory
* @ proprie{string}nombre - Categoría Nombre
* @ proprie{string}emoji - Emoji cathegori
* @ proprie{string}descripción - descripción del category
* @ promency { string } comandos - Array comando in thetheorem
 */

/**
* Caracter para el menú de estilo
 * @constant
 */
const CHARS = {
  cornerTopLeft: "╭",
  cornerTopRight: "╮",
  cornerBottomLeft: "╰",
  cornerBottomRight: "╯",
  horizontal: "─",
  vertical: "│",
  arrow: "➣",
  bullet: "◦",
  star: "✦",
  diamond: "◇",
  dot: "•",
  check: "",
  cross: "✗",
  line: "━",
};

/**
* Emoji to be so needy
 * @constant
 */
const EMOJIS = {
  dashboard: "📊",
  info: "ℹ️",
  user: "👤",
  bot: "🤖",
  owner: "👑",
  premium: "💎",
  free: "🆓",
  public: "🌐",
  self: "🔒",
  commands: "🖥️",
  utilities: "🔧",
  fun: "🎮",
  group: "👥",
  time: "⏰",
  uptime: "⏱️",
  version: "📌",
  speed: "⚡",
  limit: "📊",
  status: "📋",
  mode: "🔄",
  name: "📝",
  number: "📱",
  developer: "👨‍💻",
  total: "📈",
  tip: "💡",
  warning: "⚠️",
  success: "✅",
  error: "❌",
  loading: "🕕",
};

/**
* Tiempo de actualización de formato es una cadena de perfil muy baja
* @ param{number}ms - Tiempo de actualización en milisegundos
 * @returns {string} Formatted uptime string
 * @example
 * formatUptime(3661000); // "1h 1m 1s"
 * formatUptime(86400000); // "1d 0h 0m"
 */
function formatUptime(ms) {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(" ");
}

/**
* Formatt agigal to local form Indonesia
* @ param { Date }
 * @returns {string} Formatted date string
 * @example
 * formatDate(new Date()); // "17/12/2024, 12:30:45"
 */
function formatDate(date) {
  return timeHelper.fromTimestamp(date, "DD/MM/YYYY HH:mm:ss");
}

/**
* Número de teléfono de formato a un forte más legible
* @ param{string}- Número uno.
 * @returns {string} Formatted number
 * @example
 * formatNumber('6281234567890'); // '62 812-3456-7890'
 */
function formatNumber(number) {
  if (!number) return "";
  const cleaned = number.replace(/[^0-9]/g, "");
  if (cleaned.length < 10) return cleaned;

  if (cleaned.startsWith("62")) {
    const withoutCode = cleaned.slice(2);
    const formatted = withoutCode.replace(/(\d{3})(\d{4})(\d+)/, "$1-$2-$3");
    return `62 ${formatted}`;
  }

  return cleaned;
}

/**
* Archivo de tamaño de formato a un forte legible
* @ param{number}bytes - Ukuran en bytes
 * @returns {string} Formatted size string
 * @example
 * formatFileSize(1024); // "1.00 KB"
 * formatFileSize(1048576); // "1.00 MB"
 */
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
* Garis horizontal de la manta
* @ param{number}longitud - longitud
* @ param{string}•─- Un personaje para el garaje.
 * @returns {string} String garis
 */
function createLine(length = 20, char = CHARS.horizontal) {
  return char.repeat(length);
}

/**
* Crea header box
 * @param {string} title - Judul header
* @ param{number}*Mi anchura* *20*x
 * @returns {string} Header string
 * @example
 * createHeader('DASHBOARD');
 * // "╭─「 DASHBOARD 」─────╮"
 */
function createHeader(title, width = 20) {
  const titlePart = `${CHARS.horizontal}「 ${title} 」`;
  const remainingWidth = Math.max(0, width - titlePart.length - 2);
  return `${CHARS.cornerTopLeft}${titlePart}${createLine(remainingWidth)}${CHARS.cornerTopRight}`;
}

/**
* Crea footer box
* @ param{number}*Mi anchura* *20*x
 * @returns {string} Footer string
 * @example
 * createFooter(); // "╰────────────────────╯"
 */
function createFooter(width = 20) {
  return `${CHARS.cornerBottomLeft}${createLine(width)}${CHARS.cornerBottomRight}`;
}

/**
* Cuerpo de baris de barco con bala
* @ param{string}texT Text para bar
 * @param {string} [prefix='│'] - Prefix baris
* @ param{string}*Toletes*◦* * *Milona magra*
 * @returns {string} Formatted body line
 */
function createBodyLine(text, prefix = CHARS.vertical, bullet = CHARS.bullet) {
  return `${prefix} ${bullet} ${text}`;
}

/**
* Barco con flecha
 * @param {string} label - Label
* @ param{string}valor - valor
* @ devuelves{string}Línea formada con arraw
 * @example
* crearArrowLine ( Nombre de la Tierra, etc. )│ ➣Nombre: Al Miku-AI"
 */
function createArrowLine(label, value) {
  return `${CHARS.vertical} ${CHARS.arrow} ${label}: ${value}`;
}

/**
* Información de Crea dashboard
* @ param{DashboardData}datos - Datos para el panel de control
 * @returns {string} Formatted dashboard string
 */
function createDashboard(data) {
  const {
    userName = "User",
    userStatus = "Free User",
    mode = "Public",
    totalUsers = 0,
    userLimit = 25,
  } = data;

  const lines = [
    `${CHARS.cornerTopLeft}${CHARS.horizontal}「 ${EMOJIS.dashboard} DASHBOARD 」${CHARS.horizontal}`,
    `${CHARS.vertical}`,
    createArrowLine("Nombre", userName),
    createArrowLine("Status User", userStatus),
    createArrowLine("Mode", mode),
    createArrowLine("Usuario", totalUsers.toString()),
    createArrowLine("Límite", userLimit.toString()),
    `${CHARS.vertical}`,
    `${CHARS.cornerBottomLeft}${createLine(24)}`,
  ];

  return lines.join("\n");
}

/**
* Crea info del bot
* @ param{BotInfoData}datos - Datos de la infantería
* @ devuelves{string}Cuerda de información de bot con formato
 */
function createBotInfo(data) {
  const {
    botName = _optionalChain([_configjs2.default, 'access', _ => _.bot, 'optionalAccess', _2 => _2.name]) || "Al Miku-AI",
    developer = _optionalChain([_configjs2.default, 'access', _3 => _3.owner, 'optionalAccess', _4 => _4.name]) || "Propietario",
    version = _optionalChain([_configjs2.default, 'access', _5 => _5.bot, 'optionalAccess', _6 => _6.version]) || "1.0.0",
    uptime = "0s",
    totalFeatures = 0,
    mode = _configjs2.default.mode || "public",
    platform = "Node.js",
  } = data;

  const lines = [
    `${CHARS.horizontal}Información del Tejado${CHARS.horizontal}`,
    ``,
    `${CHARS.dot}Nombre - DOUBLE:${botName} 🌿`,
    `${CHARS.dot}Desarrollador:${developer}`,
    `${CHARS.dot} Mode : ${mode.charAt(0).toUpperCase() + mode.slice(1)}`,
    `${CHARS.dot} Version : ${version}`,
    `${CHARS.dot} Uptime : ${uptime}`,
    `${CHARS.dot}Total-Función:${totalFeatures}`,
    `${CHARS.dot} Platform : ${platform}`,
    ``,
  ];

  return lines.join("\n");
}

/**
* Perfil de usuario de carga
 * @param {UserProfileData} data - Data user profile
 * @returns {string} Formatted user profile string
 */
function createUserProfile(data) {
  const {
    name = "User",
    number = "",
    status = "Free",
    limit = 25,
    registeredAt = "",
  } = data;

  const statusEmoji =
    status === "Owner"
      ? EMOJIS.owner
      : status === "Premium"
        ? EMOJIS.premium
        : EMOJIS.free;

  const lines = [
    `【 USER PROFILE 】`,
    `${EMOJIS.name}Nombre:${name}`,
    `${EMOJIS.number}Número:${formatNumber(number)}`,
    `${statusEmoji} Status : ${status}`,
    `${EMOJIS.limit}Límite:${limit}`,
    ``,
  ];

  if (registeredAt) {
    lines.splice(5, 0, `${EMOJIS.time}Registrate:${registeredAt}`);
  }

  return lines.join("\n");
}

/**
* Crea estado del bot
* @ param{Object}data - Estado del bot de datos
* @ devuelves{string}Cuerda de estado de bot con formato
 */
function createBotStatus(data) {
  const {
    botName = _optionalChain([_configjs2.default, 'access', _7 => _7.bot, 'optionalAccess', _8 => _8.name]) || "Al Miku-AI",
    uptime = "0s",
    mode = "Public",
    totalCommands = 0,
    totalUsers = 0,
    speed = "0.00s",
  } = data;

  const lines = [
    `【BOT STATUS】`,
    `${EMOJIS.bot}* Gasps ]${botName}`,
    `${EMOJIS.uptime} Uptime   : ${uptime}`,
    `${EMOJIS.mode} Mode     : ${mode}`,
    `${EMOJIS.commands} Commands : ${totalCommands}función`,
    `${EMOJIS.user}Usuario:${totalUsers} users`,
    `${EMOJIS.speed} Speed    : ${speed}`,
    ``,
  ];

  return lines.join("\n");
}

/**
* Menú de Crea caegori
* @ param{MenuCategory}Categoría - Categoría Datos
* @ param{string}prefix- Prefi.xcomando
* @ devuelves{string}Menú de categoría con formato
 */
function createCategoryMenu(category, prefix = _optionalChain([_configjs2.default, 'access', _9 => _9.command, 'optionalAccess', _10 => _10.prefix]) || ".") {
  const { name, emoji, description = "", commands = [] } = category;

  if (commands.length === 0) {
    return "";
  }

  const header = `${emoji} *${name}*`;
  const commandList = commands
    .map((cmd) => `${CHARS.vertical} ${prefix}${cmd}`)
    .join("\n");
  const footer = `${CHARS.cornerBottomLeft}${createLine(15)}`;

  return `${header}\n${commandList}\n${footer}`;
}

/**
* Menú Crea camori con sub descripción
* @ param{Object}datos - Datos del menú de categoría
 * @returns {string} Formatted category section
 */
function createCategorySection(data) {
  const { emoji, title, command, description, prefix = "." } = data;

  const lines = [
    `${emoji} *${title}*`,
    `Escribe:${prefix}${command}`,
    `  ${CHARS.vertical} ( ${description} )`,
    ``,
  ];

  return lines.join("\n");
}

/**
* Menú principal de Crea completo
* @ param{Object}datos - Datos para reproducir el menú
* @ devuelves{string}Cuerda de menú principal con formato
 */
function createMainMenu(data) {
  const {
    greeting = "",
    userName = "User",
    userStatus = "Free User",
    categories = [],
    botInfo = {},
    prefix = _optionalChain([_configjs2.default, 'access', _11 => _11.command, 'optionalAccess', _12 => _12.prefix]) || ".",
  } = data;

  const parts = [];

  if (greeting) {
    parts.push(greeting);
    parts.push("");
  }

  parts.push(createDashboard({ userName, userStatus, ...data }));
  parts.push("");

  parts.push(createBotInfo(botInfo));
  parts.push("");

  for (const category of categories) {
    parts.push(
      createCategorySection({
        ...category,
        prefix,
      }),
    );
  }

  parts.push(`${EMOJIS.tip}* Consejos: * Si no sabes cómo utilizar`);
  parts.push(`Puedes consultar al dueño.`);
  parts.push(`${CHARS.vertical} Mode: ${data.mode || "Public"}`);

  return parts.join("\n");
}

/**
* Lista de comandos de carga para el cathegori especificado
* @ param{string}CategoríaName - Categori Nombre
 * @param {string[]} commands - Array comando
* @ param{string}prefix- Prefi.xcomando
* @ devuelves{string}Lista de comandos formateada
 */
function createCommandList(categoryName, commands, prefix = ".") {
  const emoji = _optionalChain([_configjs2.default, 'access', _13 => _13.categoryEmojis, 'optionalAccess', _14 => _14[categoryName.toLowerCase()]]) || "📋";

  const lines = [
    `${CHARS.cornerTopLeft}${CHARS.horizontal}❏ ${emoji} *${categoryName.toUpperCase()}*`,
    "",
  ];

  for (const cmd of commands) {
    lines.push(`${CHARS.vertical} ${prefix}${cmd}`);
  }

  lines.push("");
  lines.push(`${CHARS.cornerBottomLeft}${createLine(20)}`);

  return lines.join("\n");
}

/**
* Crea wait / mensaje de la loating
* @ param{string}# El momento en que espero #
 * @returns {string} Formatted wait message
 */
function createWaitMessage(message = "Tunggu sebentar...") {
  return `${EMOJIS.loading} *${message}*`;
}

/**
* Arrojar el mensaje del éxito
* @ param{string}*Espera que funcione*
 * @returns {string} Formatted success message
 */
function createSuccessMessage(message = "Exito!") {
  return `${EMOJIS.success} *${message}*`;
}

/**
* Mensaje de error de carga
* @ param{string}Mensaje
 * @returns {string} Formatted error message
 */
function createErrorMessage(message = "Se produjo un error!") {
  return `${EMOJIS.error} *${message}*`;
}

/**
* Mensajes de advertencia abiertos
* @ param{string}Mensaje - Psan warning
 * @returns {string} Formatted warning message
 */
function createWarningMessage(message) {
  return `${EMOJIS.warning} *${message}*`;
}

/**
* Consiguiendo tiempo basado en el pastoreo
 * @returns {string} Greeting message
 * @example
* Get Time Greeting ( ); / - Feliz Mañana Essence ( si día )
 */
function getTimeGreeting() {
  const hour = timeHelper.getHour();

  if (hour >= 4 && hour < 10) return "Buenos días🌅";
  if (hour >= 10 && hour < 15) return "Buenas tardes☀";
  if (hour >= 15 && hour < 18) return "Buenas tardes🌇";
  return "Buenas noches🌙";
}

/**
* Capitalizar cada palabra en la cuerda
* @ param{string}# String to the - capitalize #
 * @returns {string} Capitalized string
 * @example
 * capitalize('hello world'); // "Hello World"
 */
function capitalize(str) {
  if (!str) return "";
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
* Truncate texSi es demasiado largo
* @ param{string}texT Text a truncate
* @ param{number}max_ Full- Top de la línea
* @ param{string}*Suffi*x- Sí.xsi di-truncate
 * @returns {string} Truncated text
 */
function truncate(text, maxLength, suffix = "...") {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

exports.CHARS = CHARS; exports.EMOJIS = EMOJIS; exports.formatUptime = formatUptime; exports.formatDate = formatDate; exports.formatNumber = formatNumber; exports.formatFileSize = formatFileSize; exports.createLine = createLine; exports.createHeader = createHeader; exports.createFooter = createFooter; exports.createBodyLine = createBodyLine; exports.createArrowLine = createArrowLine; exports.createDashboard = createDashboard; exports.createBotInfo = createBotInfo; exports.createUserProfile = createUserProfile; exports.createBotStatus = createBotStatus; exports.createCategoryMenu = createCategoryMenu; exports.createCategorySection = createCategorySection; exports.createMainMenu = createMainMenu; exports.createCommandList = createCommandList; exports.createWaitMessage = createWaitMessage; exports.createSuccessMessage = createSuccessMessage; exports.createErrorMessage = createErrorMessage; exports.createWarningMessage = createWarningMessage; exports.getTimeGreeting = getTimeGreeting; exports.capitalize = capitalize; exports.truncate = truncate;
if (exports.default !== undefined) {
  if (typeof exports.default === 'object' && exports.default !== null) {
    module.exports = Object.assign(exports.default, exports);
  } else {
    module.exports = exports.default;
  }
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _os = require('os'); var _os2 = _interopRequireDefault(_os);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);

const pluginConfig = {
  name: "stats",
  alias: ["botstats", "status", "stat"],
  category: "main",
  description: "Asistir a las estadísticas del bot",
  usage: ".stats",
  example: ".stats",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(" ");
}

async function handler(m, { sock, db, uptime, config: botConfig }) {
  try {
    const users = _optionalChain([db, 'access', _ => _.db, 'optionalAccess', _2 => _2.data, 'optionalAccess', _3 => _3.users]) || {};
    const groups = _optionalChain([db, 'access', _4 => _4.db, 'optionalAccess', _5 => _5.data, 'optionalAccess', _6 => _6.groups]) || {};
    const memUsed = process.memoryUsage();
    const cpuUsage = _os2.default.loadavg()[0].toFixed(2);
    const totalMem = _os2.default.totalmem();
    const freeMem = _os2.default.freemem();
    const usedMem = totalMem - freeMem;

    const totalUsers = Object.keys(users).length;
    const totalGroups = Object.keys(groups).length;
    const premiumUsers = Object.values(users).filter((u) => u.premium).length;

    const statsObj = {
      bot: _optionalChain([botConfig, 'optionalAccess', _7 => _7.bot, 'optionalAccess', _8 => _8.name]) || "Al Miku-AI",
      version: `v${_optionalChain([botConfig, 'optionalAccess', _9 => _9.bot, 'optionalAccess', _10 => _10.version]) || "1.0.0"}`,
      uptime: formatUptime(uptime),
      database: {
        users: totalUsers,
        premium: premiumUsers,
        groups: totalGroups,
      },
      system: {
        platform: `${_os2.default.platform()} ${_os2.default.arch()}`,
        node: process.version,
        cpuLoad: `${cpuUsage}%`,
        ram: `${formatBytes(usedMem)} / ${formatBytes(totalMem)}`,
        heap: `${formatBytes(memUsed.heapUsed)} / ${formatBytes(memUsed.heapTotal)}`,
      },
      updated: new Date().toLocaleTimeString("es-AR", {
        timeZone: "America/Argentina/Buenos_Aires",
      }),
    };

    const table = [
      "📊* Estadísticas",
      "Key | Value",
      `•${statsObj.bot};;Version | ${statsObj.version};;Uptime | ${statsObj.uptime}`,
      `Users | ${statsObj.database.users}; Premium${statsObj.database.premium};;Groups | ${statsObj.database.groups}`,
      `Platform | ${statsObj.system.platform};;Node | ${statsObj.system.node};;CPU Load | ${statsObj.system.cpuLoad}`,
      `RAM | ${statsObj.system.ram};;Heap | ${statsObj.system.heap};;Updated | ${statsObj.updated}`,
    ];

    await sock.sendTableV2(m.chat, table, m, {
      title: "📊Está es la estadística de nuestro bot",
      footer: _optionalChain([botConfig, 'optionalAccess', _11 => _11.bot, 'optionalAccess', _12 => _12.name]),
    });
  } catch (error) {
    m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

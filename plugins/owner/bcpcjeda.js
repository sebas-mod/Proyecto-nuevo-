"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _almikudatabasejs = require('../../src/lib/almiku-database.js');

const pluginConfig = {
  name: 'bcpcjeda',
  alias: ['delaybcpc', 'jedabcpc', 'setjedabcpc'],
  category: 'owner',
  description: 'Atur jeda broadcast private chat',
  usage: '.bcpcjeda <waktu> (contoh: 5s, 2m, 1h)',
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true
}

function parseDelay(input) {
  if (!input) return null
  const match = input.match(/^(\d+)(s|m|h|d)$/i)
  if (!match) return null
  const val = parseInt(match[1])
  const unit = match[2].toLowerCase()
  switch (unit) {
    case 's': return val * 1000
    case 'm': return val * 60 * 1000
    case 'h': return val * 60 * 60 * 1000
    case 'd': return val * 24 * 60 * 60 * 1000
    default: return null
  }
}

function formatDelay(ms) {
  if (ms >= 86400000) return `${(ms / 86400000).toFixed(0)}el`
  if (ms >= 3600000) return `${(ms / 3600000).toFixed(0)}hora`
  if (ms >= 60000) return `${(ms / 60000).toFixed(0)}minuto`
  return `${(ms / 1000).toFixed(0)}segundo`
}

async function handler(m) {
  const db = _almikudatabasejs.getDatabase.call(void 0, )
  const input = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()])
  const current = db.setting('jedaBcpc') || 5000

  if (!input) {
    return m.reply(
      `⏱️ *JEDA BROADCAST PRIVATE*\n\n` +
      `Pausa actual: *${formatDelay(current)}* (${current}ms)\n\n` +
      `*Como usarlo:*\n` +
      `> \`${m.prefix}bcpcjeda <angka><satuan>\`\n\n` +
      `*SATUAN:*\n` +
      `• \`s\` — segundos\n• \`m\` — minutos\n• \`h\` — horas\n• \`d\` — días\n\n` +
      `*Ejemplo:*\n` +
      `> \`${m.prefix}bcpcjeda 5s\` → 5 detik\n` +
      `> \`${m.prefix}bcpcjeda 2m\` → 2 menit\n` +
      `> \`${m.prefix}bcpcjeda 1h\` →1 hora`
    )
  }

  const ms = parseDelay(input)
  if (!ms || ms < 1000) {
    return m.reply('❌ Format salah. Contoh: `5s`, `2m`, `1h`, `1d`')
  }

  const prev = current
  db.setting('jedaBcpc', ms)

  return m.reply(
    `✅* Difusión de pausas primate alterado *\n\n` +
    `Anterior: *${formatDelay(prev)}*\n` +
    `Ahora: *${formatDelay(ms)}*`
  )
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

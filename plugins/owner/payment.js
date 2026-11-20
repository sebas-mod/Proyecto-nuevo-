"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
  name: 'payment',
  alias: ['pay', 'qris'],
  category: 'owner',
  description: 'Menampilkan info payment',
  usage: '.payment',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true
}

function buildPaymentText(paymentCfg, customText, botName, ownerName) {
  const methods = (paymentCfg.methods || []).filter(m => m.number)
  const banks = (paymentCfg.banks || []).filter(b => b.number)

  if (customText) {
    return customText
      .replace(/\{botname\}/gi, botName)
      .replace(/\{owner\}/gi, ownerName)
      .replace(/\{methods\}/gi, methods.map(m => `• *${m.name}*: ${m.number} (${m.holder || m.name})`).join('\n'))
      .replace(/\{banks\}/gi, banks.map(b => `• *${b.name}*: ${b.number} (${b.holder || b.name})`).join('\n'))
      .replace(/\{qris\}/gi, paymentCfg.qrisUrl ? '✅ Tersedia' : '❌ Belum diatur')
  }

  let text = `💳 *P A Y M E N T*\n`
  text += `━━━━━━━━━━━━━━━━━━\n\n`

  if (methods.length > 0) {
    text += `📱 *E-Wallet:*\n`
    for (const m of methods) {
      text += `├─ • *${m.name}*\n`
      text += `│  \`${m.number}\`\n`
      if (m.holder) text += `│  a/n: ${m.holder}\n`
    }
    text += `\n`
  }

  if (banks.length > 0) {
    text += `🏦 *Bank Transfer:*\n`
    for (const b of banks) {
      text += `├─ • *${b.name}*\n`
      text += `│  \`${b.number}\`\n`
      if (b.holder) text += `│  a/n: ${b.holder}\n`
    }
    text += `\n`
  }

  if (paymentCfg.qrisUrl) {
    text += `📸 *QRIS:* Tersedia (lihat gambar)\n\n`
  }

  text += `━━━━━━━━━━━━━━━━━━\n`
  text += `> ${botName}`

  return text
}

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, )
  const paymentCfg = _configjs2.default.payment || {}
  const customText = db.setting('customPaymentText') || paymentCfg.customText || ''
  const botName = _optionalChain([_configjs2.default, 'access', _ => _.bot, 'optionalAccess', _2 => _2.name]) || 'Bot'
  const ownerName = _optionalChain([_configjs2.default, 'access', _3 => _3.owner, 'optionalAccess', _4 => _4.name]) || 'Owner'

  const text = buildPaymentText(paymentCfg, customText, botName, ownerName)

  if (paymentCfg.qrisUrl) {
    try {
      await sock.sendMessage(m.chat, {
        image: { url: paymentCfg.qrisUrl },
        caption: text
      }, { quoted: m })
      return
    } catch (e) {}
  }

  await sock.sendMessage(m.chat, { text }, { quoted: m })
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

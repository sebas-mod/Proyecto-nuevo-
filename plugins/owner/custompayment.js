"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
  name: 'custompayment',
  alias: ['setpayment', 'setpaytext'],
  category: 'owner',
  description: 'La textura personalizada para. Pagos con marcador de posición.',
  usage: '.custompayment <teks> / .custompayment reset',
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true
}

async function handler(m) {
  const db = _ourindatabasejs.getDatabase.call(void 0, )
  const input = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()])
  const current = db.setting('customPaymentText') || ''

  if (!input) {
    return m.reply(
      `📝 *CUSTOM PAYMENT TEXT*\n\n` +
      `Pruebas actuales:\n${current || '_(belum diatur, pakai default)_'}\n\n` +
      `* PLACEHOLDER SONNY:\n` +
      `• \`{botname}\` —El nombre del bot\n` +
      `• \`{owner}\` —Nombre propietario\n` +
      `• \`{methods}\` —Registrate e-wallet\n` +
      `• \`{banks}\` —Registrate banco\n` +
      `• \`{qris}\` — Status QRIS\n\n` +
      `*Ejemplo:*\n` +
      `> \`${m.prefix}custompayment Hola! Pagar a {methods}\`\n\n` +
      `> \`${m.prefix}custompayment restablecer\` —Regresar a predeterminado`
    )
  }

  if (input.toLowerCase() === 'reset') {
    db.setting('customPaymentText', '')
    return m.reply('✅ Teks custom payment direset ke default.')
  }

  db.setting('customPaymentText', input)
  return m.reply(`✅Tanques de pago personalizado ahorrado!\n\nVista previa:\n${input}`)
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

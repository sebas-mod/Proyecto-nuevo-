"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
    name: 'benefitpartner',
    alias: ['partnerbenefits', 'keuntunganpartner'],
    category: 'info',
    description: 'Mira la ventaja de ser un bot de socio',
    usage: '.benefitpartner',
    example: '.benefitpartner',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {

    const prefix = m.prefix || '.'

    let txt = `🤝 *BENEFIT PARTNER*\n\n`
    txt += `La ventaja de ser un socio${_optionalChain([_configjs2.default, 'access', _ => _.bot, 'optionalAccess', _2 => _2.name]) || 'Bot'}:\n\n`

    txt += `🔓*Akses Función*\n`
    txt += `├Todos los locales de la prima están abiertos\n`
    txt += `├ Energía & monedas unlimited\n`
    txt += `├Propietario de mando de acusado específico\n`
    txt += `└ Prioritas support\n\n`

    txt += `💎*Bono*\n`
    txt += `├+ 200. 000 EXP durante la activación\n`
    txt += `├+ 20. 000 Tela durante la actividad\n`
    txt += `├ Badge partner di profil\n`
    txt += `└ Akses early feature\n\n`

    txt += `💰* Cara So Partners *\n`
    txt += `├Contacta propietario:${_optionalChain([_configjs2.default, 'access', _3 => _3.owner, 'optionalAccess', _4 => _4.name]) || 'Owner'}\n`
    txt += `├Duración: 30 / 60 / 90 días\n`
    txt += `└Comando:\`${prefix}addpartner\`(propietario only)\n\n`

    txt += `📋*Comando Partner*\n`
    txt += `├ \`${prefix}cekpartner\` —Check statuspartner\n`
    txt += `├ \`${prefix}cekprem\` —Verificación de estado Premium\n`
    txt += `├ \`${prefix}ckowner\` — Comprueba role user\n`
    txt += `└ \`${prefix}listpartner\` —Registrate partner\n\n`

    txt += `*Propietario de Contacta para el próximo campo*`

    await m.reply(txt)
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

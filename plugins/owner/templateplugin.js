"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
    name: 'templateplugin',
    alias: ['tplplugin', 'plugin-template'],
    category: 'owner',
    description: 'Generar plantilla de plug ( Oferta solamente )',
    usage: '.templateplugin',
    example: '.templateplugin',
    isOwner: true,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 0,
    energi: 0,
    isEnabled: true
}
function handler(m, { sock }) {
    const template = `
const pluginConfig = {
    name: 'example',
    alias: ['ex'],
    category: 'general',
    description: 'Example plugin',
    usage: '.example',
    example: '.example',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
energía: 1,
    isEnabled: true
}
async function handler(m, { sock }) {
    try {
await m. respuesta ( xis es un ex¡Enchufe amplio!
    } catch (error) {
        console.error('Example Plugin Error:', error)
await m.responder('❌*Fallido*\\n\\n
    }
}
export { pluginConfig as config, handler }
`
    m.reply(`\`\`\`${template}\`\`\``)
}
exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

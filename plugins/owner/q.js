"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _util = require('util'); var _util2 = _interopRequireDefault(_util);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
    name: 'q',
    alias: ['quoted', 'inspect'],
    category: 'tools',
    description: 'Ambel JSON mensaje del mensaje redireccionado',
    usage: '.q (reply pesan)',
    isOwner: true,
    cooldown: 3,
    isEnabled: true
}

async function handler(m) {
    if (!m.quoted) {
        return m.reply('❌* Responder el mensaje que quieres insectos *')
    }

    try {
        const quoted = m.quoted || {}

        await m.reply(JSON.stringify(quoted, null, 2))
    } catch (err) {
        await m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almiku = require('almiku');
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
    name: 'ppcouple',
    alias: ['cp', 'ppcp'],
    category: 'random',
    description: 'Imagen aleatoria pp pareja',
    usage: '.ppcouple',
    isGroup: true,
    isBotAdmin: false,
    isAdmin: false,
    cooldown: 10,
    energi: 2,
    isEnabled: true
};

async function handler(m, { sock }) {
   try {
        const res = await _axios2.default.get(`https://api.deline.web.id/random/ppcouple`)
        const data = res.data.result
        const cowo = data.cowo
        const cewe = data.cewe
        await sock.sendMessage(m.chat, {
            albumMessage: [
                {
                    image: { url: cowo },
                },
                {
                    image: { url: cewe },
                }
            ]
        }, { quoted: m })
   } catch (error) {
    m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
   }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

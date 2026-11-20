"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
    name: ['disableenergi', 'enableenergi'],
    alias: ['offenergi', 'onenergi'],
    category: 'owner',
    description: 'Enable/disable sistem energi',
    usage: '.disableenergi atau .enableenergi',
    example: '.disableenergi',
    isOwner: true,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const db = _ourindatabasejs.getDatabase.call(void 0, )
    const cmd = m.command.toLowerCase()
    const isEnable = ['enableenergi', 'onenergi'].includes(cmd)

    db.setting('energi', isEnable)
    db.save()

    await m.react(isEnable ? '⚡' : '🔌')
    return m.reply(
        isEnable
            ? '⚡*ɪSᴛᴇᴍ ᴇɴᴇʀɢɪ ᴅɪᴀᴋᴛɪꜰᴋᴀɴ*\n\nPara ver al comandante ahora requiere energía.'
            : '🔌*ɪSᴛᴇᴍ ᴇɴᴇʀɢɪ ᴅɪɴᴏɴᴀᴋᴛɪꜰᴋᴀɴ*\n\nPara ordenar ya no requiere energía.'
    )
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

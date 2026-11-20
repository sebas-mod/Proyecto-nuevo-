"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);

const pluginConfig = {
  name: 'attp2',
  alias: ['attp2'],
  category: 'sticker',
  description: 'Buat sticker animasi teks',
  usage: '.attp2 <teks>',
  example: '.attp2 Halo dunia',
  cooldown: 5,
  energi: 2,
};

async function handler(m, { sock }) {
  const text = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]) || _optionalChain([m, 'access', _4 => _4.quoted, 'optionalAccess', _5 => _5.text, 'optionalAccess', _6 => _6.trim, 'call', _7 => _7()]);

  if (!text) {
    return m.reply(`⚠EveHarapeninthetexts!\nEjemplo:\`${m.prefix}${m.command}Hola a todos\``);
  }

  await m.react('🕕');

  try {
    const colors = encodeURIComponent(JSON.stringify(["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#00FFFF", "#FF00FF"]));
    const apiUrl = `https://api.neoxr.eu/api/attp2?text=${encodeURIComponent(text)}&color=${colors}&apikey=${_configjs2.default.APIkey.neoxr}`;

    const response = await _axios2.default.get(apiUrl);
    if (!response.data.status || !_optionalChain([response, 'access', _8 => _8.data, 'access', _9 => _9.data, 'optionalAccess', _10 => _10.url])) {
      return m.reply('❌Los luchadores hacen pegatinas, la posibilidad de límite de API al tanto.');
    }

    const stickerUrl = response.data.data.url;
    const stickerBuffer = await _axios2.default.get(stickerUrl, { responseType: 'arraybuffer' }).then(res => res.data);

    await sock.sendVideoAsSticker(m.chat, stickerBuffer, m, {
      packname: _configjs2.default.sticker.packname,
      author: _configjs2.default.sticker.author
    });

    await m.react('✅');
  } catch (error) {
    console.log(error)
    await m.react('☢');
    m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

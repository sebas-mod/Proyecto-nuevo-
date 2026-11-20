"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikuhttpjs = require('../../src/lib/almiku-http.js');
var _almikucontextjs = require('../../src/lib/almiku-context.js');
const pluginConfig = {
  name: "asupantiktok",
  alias: ["tiktokasupan", "ttasupan"],
  category: "asupan",
  description: "Video TikTok de nombre de usuario al azar o especificaciones",
  usage: ".asupantiktok [username]",
  example: ".asupantiktok natajadeh",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 15,
  energi: 2,
  isEnabled: true,
};

const usernames = [
  "natajadeh",
  "aletaanovianda",
  "faisafch",
  "0rbby",
  "cindyanastt",
  "awaa.an",
  "nadineabgail",
  "ciloqciliq",
  "carluskiey",
  "wuxiaturuxia",
  "joomblo",
  "hxszys",
  "indomeysleramu",
  "anindthrc",
  "m1cel",
  "chrislin.chrislin",
  "brocolee__",
  "dxzdaa",
  "toodlesprunky",
  "wasawho",
  "paphricia",
  "queenzlyjlita",
  "apol1yon",
  "eliceannabella",
  "aintyrbaby",
  "christychriselle",
  "natalienovita",
  "glennvmi",
  "_rgtaaa",
  "felicialrnz",
  "zahraazzhri",
  "mdy.li",
  "jeyiiiii_",
  "bbytiffs",
  "irenefennn",
  "mellyllyyy",
  "xsta_xstar",
  "n0_0ella",
  "kutubuku6690",
  "cesiann",
  "gaby.rosse",
  "charrvm_",
  "bilacml04",
  "whosyoraa",
  "ishaangelica",
  "heresthekei",
  "gemoy.douyin",
  "nathasyaest",
  "jasmine.mat",
  "akuallyaa",
  "meycoco22",
  "baby_sya66",
  "knzymyln__",
  "rin.channn",
  "audicamy",
  "franzeskaedelyn",
  "shiraishi.ito",
  "itsceceh",
  "senpai_cj7",
];

async function handler(m, { sock }) {
  const query =
    _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]) || usernames[Math.floor(Math.random() * usernames.length)];

  m.react("🕕");

  try {
    const { data } = await _almikuhttpjs.f.call(void 0, 
      `https://api.neoxr.eu/api/asupan?username=${query}&apikey=${_configjs2.default.APIkey.neoxr}`,
    );

    if (!data) {
      m.react("❌");
      return m.reply(`🚩Nombre de usuario No encontrado\n\n- Nombre de usuario:${query}`);
    }

    const video = data;

    m.react("✅");

    const videoUrl = video.video.url;

    await sock.sendMedia(m.chat, videoUrl, `${video.caption}`, m, {
      type: "video",
      contextInfo: _almikucontextjs.saluranCtx.call(void 0, ),
    });
  } catch (error) {
    m.react("❌");
    m.reply(`🚩Nombre de usuario No encontrado\n\n- Nombre de usuario:${query}`);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _momenttimezone = require('moment-timezone'); var _momenttimezone2 = _interopRequireDefault(_momenttimezone);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);




var _ourinsholatapijs = require('../../src/lib/ourin-sholat-api.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
var _ourincontextjs = require('../../src/lib/ourin-context.js');
const pluginConfig = {
  name: "jadwalsholat",
  alias: ["sholat", "prayertime", "jadwalsolat", "waktusolat", "waktusholat"],
  category: "religi",
  description: "Menampilkan jadwal sholat real-time dari myquran.com",
  usage: ".jadwalsholat <kota>",
  example: ".jadwalsholat Jakarta",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};
async function handler(m, { sock }) {
  const city = m.args.join(" ").trim() || "Jakarta";
  m.react("🕌");
  try {
    const kota = await _ourinsholatapijs.searchKota.call(void 0, city);
    if (!kota) {
      m.react("❌");
      return m.reply(
        `❌ *ɢᴀɢᴀʟ*\n\n> Kota "${city}" tidak ditemukan\n> Coba nama kabupaten/kota lain`,
      );
    }
    const jadwalData = await _ourinsholatapijs.getTodaySchedule.call(void 0, kota.id);
    const times = _ourinsholatapijs.extractPrayerTimes.call(void 0, jadwalData);
    const lokasi = jadwalData.lokasi || kota.lokasi;
    const daerah = jadwalData.daerah || "";
    const today = _momenttimezone2.default.tz("Asia/Jakarta").format("dddd, DD MMMM YYYY");
    const saluranId = _optionalChain([_configjs2.default, 'access', _ => _.saluran, 'optionalAccess', _2 => _2.id]) || "120363400911374213@newsletter";
    const saluranName = _optionalChain([_configjs2.default, 'access', _3 => _3.saluran, 'optionalAccess', _4 => _4.name]) || _optionalChain([_configjs2.default, 'access', _5 => _5.bot, 'optionalAccess', _6 => _6.name]) || "Ourin-AI";

    const caption = `🕌 *ᴊᴀᴅᴡᴀʟ sʜᴏʟᴀᴛ*
╭┈┈⬡「 📍 *${lokasi}* 」
┃ 📅 ${today}
┃ 🗺️ ${daerah}
╰┈┈⬡
╭┈┈⬡「 ⏰ *ᴡᴀᴋᴛᴜ sʜᴏʟᴀᴛ* 」
┃ 🌙 ɪᴍsᴀᴋ: \`${times.imsak}\`
┃ 🌅 sᴜʙᴜʜ: \`${times.subuh}\`
┃ ☀️ ᴛᴇʀʙɪᴛ: \`${times.terbit}\`
┃ 🌤️ ᴅʜᴜʜᴀ: \`${times.dhuha}\`
┃ 🌞 ᴅᴢᴜʜᴜʀ: \`${times.dzuhur}\`
┃ 🌇 ᴀsʜᴀʀ: \`${times.ashar}\`
┃ 🌆 ᴍᴀɢʜʀɪʙ: \`${times.maghrib}\`
┃ 🌃 ɪsʏᴀ: \`${times.isya}\`
╰┈┈⬡
> _Sumber: myquran.com | Jangan lupa sholat ya! 🤲_`;
    const adzanUrl = "https://files.catbox.moe/z2bj5s.mp3";
    let adzanBuffer;
    try {
      const res = await _axios2.default.get(adzanUrl, {
        responseType: "arraybuffer",
        timeout: 30000,
      });
      adzanBuffer = Buffer.from(res.data);
    } catch (e) {
      adzanBuffer = null;
    }
    const contextInfo = _ourincontextjs.saluranCtx.call(void 0, );
    if (adzanBuffer) {
      await sock.sendMessage(
        m.chat,
        {
          audio: adzanBuffer,
          mimetype: "audio/mpeg",
          ptt: false,
          contextInfo,
        },
        { quoted: m },
      );
      await sock.sendMessage(m.chat, { text: caption }, { quoted: m });
    } else {
      await sock.sendMessage(
        m.chat,
        { text: caption, contextInfo },
        { quoted: m },
      );
    }
    m.react("✅");
  } catch (error) {
    m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}
exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

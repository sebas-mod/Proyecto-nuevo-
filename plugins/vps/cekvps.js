"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _almikutimejs = require('../../src/lib/almiku-time.js'); var timeHelper = _interopRequireWildcard(_almikutimejs);
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
  name: ["cekvps", "cekdroplet", "vpsstatus", "infovps"],
  alias: [],
  category: "vps",
  description: "Cek detail VPS DigitalOcean",
  usage: ".cekvps <id>",
  example: ".cekvps 123456789",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function hasAccess(sender, isOwner) {
  if (isOwner) return true;
  const cleanSender = _optionalChain([sender, 'optionalAccess', _ => _.split, 'call', _2 => _2("@"), 'access', _3 => _3[0]]);
  if (!cleanSender) return false;
  const doConfig = _configjs2.default.digitalocean || {};
  return (
    (doConfig.sellers || []).includes(cleanSender) ||
    (doConfig.ownerPanels || []).includes(cleanSender)
  );
}

async function handler(m, { sock }) {
  const token = _optionalChain([_configjs2.default, 'access', _4 => _4.digitalocean, 'optionalAccess', _5 => _5.token]);

  if (!token) {
    return m.reply(`⚠️ *ᴅɪɢɪᴛᴀʟᴏᴄᴇᴀɴ ʙᴇʟᴜᴍ ᴅɪsᴇᴛᴜᴘ*`);
  }

  if (!hasAccess(m.sender, m.isOwner)) {
    return m.reply(`❌ *ᴀᴋsᴇs ᴅɪᴛᴏʟᴀᴋ*`);
  }

  const dropletId = _optionalChain([m, 'access', _6 => _6.text, 'optionalAccess', _7 => _7.trim, 'call', _8 => _8()]);
  if (!dropletId) {
    return m.reply(`⚠️ *ᴄᴀʀᴀ ᴘᴀᴋᴀɪ*\n\n> \`${m.prefix}cekvps <droplet_id>\``);
  }

  try {
    const response = await _axios2.default.get(
      `https://api.digitalocean.com/v2/droplets/${dropletId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    const droplet = response.data.droplet;
    const ip =
      _optionalChain([droplet, 'access', _9 => _9.networks, 'optionalAccess', _10 => _10.v4, 'optionalAccess', _11 => _11.find, 'call', _12 => _12((n) => n.type === "public"), 'optionalAccess', _13 => _13.ip_address]) || "-";
    const ipv6 = _optionalChain([droplet, 'access', _14 => _14.networks, 'optionalAccess', _15 => _15.v6, 'optionalAccess', _16 => _16[0], 'optionalAccess', _17 => _17.ip_address]) || "-";
    const status =
      droplet.status === "active" ? "🟢 Active" : "🔴 " + droplet.status;

    let txt = `📋 *ᴅᴇᴛᴀɪʟ ᴠᴘs*\n\n`;
    txt += `╭─「 🖥️ *ɪɴꜰᴏ* 」\n`;
    txt += `┃ 🆔 \`ɪᴅ\`: *${droplet.id}*\n`;
    txt += `┃ 🏷️ \`ɴᴀᴍᴇ\`: *${droplet.name}*\n`;
    txt += `┃ 📊 \`sᴛᴀᴛᴜs\`: *${status}*\n`;
    txt += `┃ 🌐 \`ɪᴘᴠ4\`: *${ip}*\n`;
    txt += `┃ 🌍 \`ɪᴘᴠ6\`: *${ipv6}*\n`;
    txt += `╰───────────────\n\n`;
    txt += `╭─「 🧠 *sᴘᴇᴄ* 」\n`;
    txt += `┃ 💾 \`ʀᴀᴍ\`: *${droplet.memory} MB*\n`;
    txt += `┃ ⚡ \`ᴄᴘᴜ\`: *${droplet.vcpus} vCPU*\n`;
    txt += `┃ 💿 \`ᴅɪsᴋ\`: *${droplet.disk} GB*\n`;
    txt += `┃ 🌏 \`ʀᴇɢɪᴏɴ\`: *${_optionalChain([droplet, 'access', _18 => _18.region, 'optionalAccess', _19 => _19.name]) || _optionalChain([droplet, 'access', _20 => _20.region, 'optionalAccess', _21 => _21.slug])}*\n`;
    txt += `┃ 💻 \`ᴏs\`: *${_optionalChain([droplet, 'access', _22 => _22.image, 'optionalAccess', _23 => _23.distribution])} ${_optionalChain([droplet, 'access', _24 => _24.image, 'optionalAccess', _25 => _25.name])}*\n`;
    txt += `╰───────────────\n\n`;
    txt += `> 📅 Created: ${timeHelper.fromTimestamp(droplet.created_at, "DD MMMM YYYY HH:mm:ss")}`;

    await m.reply(txt);
  } catch (err) {
    return m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
  }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

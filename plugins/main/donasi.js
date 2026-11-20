"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _nodefetch = require('node-fetch'); var _nodefetch2 = _interopRequireDefault(_nodefetch);
const pluginConfig = {
  name: "donasi",
  alias: ["donate", "donation", "support", "saweria", "trakteer"],
  category: "main",
  description: "Información donando para balancear el bot conQRIS",
  usage: ".donasi",
  example: ".donasi",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const botName = _optionalChain([_configjs2.default, 'access', _ => _.bot, 'optionalAccess', _2 => _2.name]) || "Ourin-AI";
  const ownerName = _optionalChain([_configjs2.default, 'access', _3 => _3.owner, 'optionalAccess', _4 => _4.name]) || "Propietario";
  const saluranId = _optionalChain([_configjs2.default, 'access', _5 => _5.saluran, 'optionalAccess', _6 => _6.id]) || "120363400911374213@newsletter";
  const saluranName = _optionalChain([_configjs2.default, 'access', _7 => _7.saluran, 'optionalAccess', _8 => _8.name]) || botName;

  const donasiConfig = _configjs2.default.donasi || {};
  const payments = donasiConfig.payment || [];
  const links = donasiConfig.links || [];
  const qrisUrl = donasiConfig.qris || "";
  const benefits = donasiConfig.benefits || [
    "Mendukung development",
    "El servidor es más estable",
    "Las nuevas características son más rápidas",
    "Priority support",
  ];

  let text = `DONACY TO Propietario${botName} 🙏`;

  if (payments.length > 0 || links.length > 0) {
    text += `Pembayaran\n`;
    for (const pay of payments) {
      text += `🏦 *${_optionalChain([pay, 'access', _9 => _9.name
, 'optionalAccess', _10 => _10.toLowerCase, 'call', _11 => _11()
, 'access', _12 => _12.split, 'call', _13 => _13("")
, 'access', _14 => _14.map, 'call', _15 => _15((c, i) => (i === 0 ? c.toUpperCase() : c))
, 'access', _16 => _16.join, 'call', _17 => _17("")])}*\n`;
      text += `◦ ${pay.number} (a/n ${pay.holder})\n`;
    }

    for (const link of links) {
      const icons = {
        saweria: "☕",
        trakteer: "🍵",
        paypal: "💰",
        default: "🔗",
      };
      const icon = icons[_optionalChain([link, 'access', _18 => _18.name, 'optionalAccess', _19 => _19.toLowerCase, 'call', _20 => _20()])] || icons.default;
      text += `${icon} *${link.name}*\n`;
      text += `${link.url}\n`;
    }
  } else {
    text += `╭┈┈⬡「 💳 *ᴘᴀʏᴍᴇɴᴛ* 」\n`;
    text += `┃\n`;
    text += `┃*No estoy configurado*\n`;
    text += `┃ > Edit config.donasi\n`;
    text += `┃\n`;
    text += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
  }

  text += `🎁 *ʙᴇɴᴇꜰɪᴛ*\n`;
  for (const benefit of benefits) {
    text += `◦ ${benefit}\n`;
  }
  text += `\n`;

  text += `Para cualquier donación vale mucho\n`;
  text += `Contact: @${_optionalChain([_configjs2.default, 'access', _21 => _21.owner, 'optionalAccess', _22 => _22.number, 'optionalAccess', _23 => _23[0]]) || "owner"}`;

  const copyButtons = payments.map((pay) => ({
    name: "cta_copy",
    buttonParamsJson: JSON.stringify({
      display_text: `📋 Copy No. ${pay.name}`,
      copy_code: pay.number,
    }),
  }));

  const contextInfo = {
    mentionedJid: _optionalChain([_configjs2.default, 'access', _24 => _24.owner, 'optionalAccess', _25 => _25.number, 'optionalAccess', _26 => _26[0]])
      ? [`${_configjs2.default.owner.number[0]}@s.whatsapp.net`]
      : [],
    forwardingScore: 9999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: 127,
    },
  };

  if (qrisUrl) {
    try {
      const response = await _nodefetch2.default.call(void 0, qrisUrl);
      const qrisBuffer = Buffer.from(await response.arrayBuffer());

      await sock.sendButton(m.chat, qrisBuffer, text, m, {
        buttons: copyButtons,
      });
    } catch (e) {
      await sock.sendButton(m.chat, null, text, m, {
        buttons: copyButtons,
      });
    }
  } else {
    await sock.sendMessage(
      m.chat,
      {
        text: text,
        footer: botName,
        contextInfo: contextInfo,
        interactiveButtons: copyButtons,
      },
      { quoted: m },
    );
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

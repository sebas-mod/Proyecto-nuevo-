"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _momenttimezone = require('moment-timezone'); var _momenttimezone2 = _interopRequireDefault(_momenttimezone);
var _awesomephonenumber = require('awesome-phonenumber'); var _awesomephonenumber2 = _interopRequireDefault(_awesomephonenumber);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
const pluginConfig = {
    name: 'wastalk',
    alias: ['whatsappstalk', 'stalkwa'],
    category: 'stalker',
    description: 'Stalk profile WhatsApp',
    usage: '.wastalk <nomor/tag>',
    example: '.wastalk 6281234567890',
    isGroup: false,
    isBotAdmin: false,
    isAdmin: false,
    cooldown: 5,
    energi: 2,
    isEnabled: true
};

let regionNames = new Intl.DisplayNames(['en'], {
    type: 'region'
});

async function handler(m, { sock }) {
    const text = m.text;
    let num = _optionalChain([m, 'access', _ => _.quoted, 'optionalAccess', _2 => _2.sender]) || _optionalChain([m, 'access', _3 => _3.mentionedJid, 'optionalAccess', _4 => _4[0]]) || text;
    console.log(num)
    if (!num) {
        return m.reply(`Example: ${m.prefix}${m.command} @tag / 628xxx`);
    }

    num = num.replace(/\D/g, '') + '@s.whatsapp.net';

    try {
        const onWa = await sock.onWhatsApp(num);
        if (!onWa || !_optionalChain([onWa, 'access', _5 => _5[0], 'optionalAccess', _6 => _6.exists])) {
            return m.reply('❌ User not exists on WhatsApp');
        }

        let img = 'https://telegra.ph/file/70e8de9b1879568954f09.jpg';
        try {
            img = await sock.profilePictureUrl(num, 'image');
        } catch (e) {}

        let bio = {};
        try {
            bio = await sock.fetchStatus(num);
        } catch (e) {}

        let name = 'Unknown';
        try {
            name = await sock.getName(num) || num.split('@')[0];
        } catch (e) {}

        let business = null;
        try {
            business = await sock.getBusinessProfile(num);
        } catch (e) {}

        let format, country;
        try {
            format = _awesomephonenumber2.default.call(void 0, `+${num.split('@')[0]}`);
            if (!format.isValid()) {
                console.log('PhoneNum invalid for:', num);
            }
            country = regionNames.of(format.getRegionCode('mobile'));
        } catch (e) {
            format = null;
            country = 'Unknown';
        }

        const formattedNumber = format ? format.getNumber('international') : num.split('@')[0];

        let res = `\t\t\t\t*▾ WHATSAPP ▾*\n\n` +
                  `*° Country :* ${country ? country.toUpperCase() : '-'}\n` +
                  `*° Name :* ${name}\n` +
                  `*°Número de formato: *${formattedNumber}\n` +
                  `*°Url Fuego: * wa. me /${num.split('@')[0]}\n` +
                  `*° Mentions :* @${num.split('@')[0]}\n` +
                  `*° Status :* ${_optionalChain([bio, 'optionalAccess', _7 => _7.status]) || '-'}\n` +
                  `*° Date Status :* ${_optionalChain([bio, 'optionalAccess', _8 => _8.setAt]) ? _momenttimezone2.default.call(void 0, bio.setAt).tz('Asia/Jakarta').format('LLLL') : '-'}\n\n`;

        if (business) {
            res += `\t\t\t\t*▾INFO BUSINESS▾*\n\n` +
                   `*° BusinessId :* ${business.wid}\n` +
                   `*°Sitio web: *${business.website ? business.website : '-'}\n` +
                   `*°Correo:*${business.email ? business.email : '-'}\n` +
                   `*° Category :* ${business.category}\n` +
                   `*° Address :* ${business.address ? business.address : '-'}\n` +
                   `*° Timezone :* ${_optionalChain([business, 'access', _9 => _9.business_hours, 'optionalAccess', _10 => _10.timezone]) ? business.business_hours.timezone : '-'}\n` +
                   `*° Description :* ${business.description ? business.description : '-'}`;
        } else {
            res += '*Standard WhatsApp Account*';
        }

        await sock.sendMessage(m.chat, {
            image: { url: img },
            caption: res,
            mentions: [num]
        }, { quoted: m });

    } catch (e) {
        console.error('WaStalk Error:', e);
        m.reply('❌ Failed to stalk user.');
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _axios = require('axios'); var _axios2 = _interopRequireDefault(_axios);
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
  name: "bluearchive-char",
  alias: ["bachar"],
  category: "info",
  description: "Lihat info character Blue Archive",
  usage: ".bluearchive-char <nama>",
  example: ".bluearchive-char shiroko",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 1,
  isEnabled: true,
};

class BluArchive {
  findUrl(input, urls) {
    const clean = input.toLowerCase().replace(/\s+/g, "_");
    if (urls.includes(clean)) return clean;

    const words = clean.split("_");
    const matches = urls.filter((url) =>
      words.every((word) => url.toLowerCase().includes(word)),
    );

    return matches.length > 0 ? matches[0] : null;
  }

  async list() {
    const { data } = await _axios2.default.get(
      "https://api.dotgg.gg/bluearchive/characters",
    );
    return data.map((item) => ({
      ...item,
      imgSmall: item.imgSmall
        ? "https://images.dotgg.gg/bluearchive/characters/" + item.imgSmall
        : null,
      img: item.img
        ? "https://images.dotgg.gg/bluearchive/characters/" + item.img
        : null,
    }));
  }

  async char(name) {
    const listc = await this.list();
    const urls = listc.map((c) => c.url);
    const foundUrl = this.findUrl(name, urls);

    if (!foundUrl) {
      const suggestions = urls
        .filter((u) => u.includes(name.toLowerCase().split(" ")[0]))
        .slice(0, 5);
      throw new Error(
        `Character "${name}No se ha encontrado.\n\nTal vez me refiero a:${suggestions.join(", ") || "tidak ada"}`,
      );
    }

    const { data } = await _axios2.default.get(
      `https://api.dotgg.gg/bluearchive/characters/${foundUrl}`,
    );
    return {
      ...data,
      imgSmall: data.imgSmall
        ? "https://images.dotgg.gg/bluearchive/characters/" + data.imgSmall
        : null,
      img: data.img
        ? "https://images.dotgg.gg/bluearchive/characters/" + data.img
        : null,
    };
  }
}

async function handler(m, { sock }) {
  const name = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]);

  if (!name) {
    return m.reply(
      `🎮 *ʙʟᴜᴇ ᴀʀᴄʜɪᴠᴇ ᴄʜᴀʀᴀᴄᴛᴇʀ*\n\n` +
        `Mira la información carácter Archivo Azul\n\n` +
        `> *Ejemplo:*\n` +
        `> ${m.prefix}bluearchive-char shiroko\n` +
        `> ${m.prefix}bachar hoshino\n` +
        `> ${m.prefix}ba aru`,
    );
  }

  await m.react("🕕");

  try {
    const ba = new BluArchive();
    const char = await ba.char(name);

    const saluranId = _optionalChain([_configjs2.default, 'access', _4 => _4.saluran, 'optionalAccess', _5 => _5.id]) || "120363400911374213@newsletter";
    const saluranName = _optionalChain([_configjs2.default, 'access', _6 => _6.saluran, 'optionalAccess', _7 => _7.name]) || _optionalChain([_configjs2.default, 'access', _8 => _8.bot, 'optionalAccess', _9 => _9.name]) || "Ourin-AI";

    let caption = `🎮 *${_optionalChain([char, 'access', _10 => _10.name, 'optionalAccess', _11 => _11.toUpperCase, 'call', _12 => _12()])}*\n\n`;

    if (char.bio) {
      caption += `> ${char.bio.substring(0, 200)}${char.bio.length > 200 ? "..." : ""}\n\n`;
    }

    caption += `╭┈┈⬡「 📋 *ᴘʀᴏꜰɪʟᴇ* 」\n`;
    if (_optionalChain([char, 'access', _13 => _13.profile, 'optionalAccess', _14 => _14.familyName]))
      caption += `┃ 👤 Family: *${char.profile.familyName}*\n`;
    if (_optionalChain([char, 'access', _15 => _15.profile, 'optionalAccess', _16 => _16.age])) caption += `┃ 🎂 Age: *${char.profile.age}*\n`;
    if (_optionalChain([char, 'access', _17 => _17.profile, 'optionalAccess', _18 => _18.height]))
      caption += `┃ 📏 Height: *${char.profile.height}*\n`;
    if (_optionalChain([char, 'access', _19 => _19.profile, 'optionalAccess', _20 => _20.school]))
      caption += `┃ 🏫 School: *${char.profile.school}*\n`;
    if (_optionalChain([char, 'access', _21 => _21.profile, 'optionalAccess', _22 => _22.club])) caption += `┃ 🎯 Club: *${char.profile.club}*\n`;
    if (_optionalChain([char, 'access', _23 => _23.profile, 'optionalAccess', _24 => _24.hobby])) caption += `┃ ⭐ Hobby: *${char.profile.hobby}*\n`;
    if (_optionalChain([char, 'access', _25 => _25.profile, 'optionalAccess', _26 => _26.CV])) caption += `┃ 🎤 CV: *${char.profile.CV}*\n`;
    caption += `╰┈┈┈┈┈┈┈┈⬡\n\n`;

    caption += `╭┈┈⬡「 ⚔️ *ʙᴀᴛᴛʟᴇ* 」\n`;
    if (char.type) caption += `┃ 🏷️ Type: *${char.type}*\n`;
    if (char.role) caption += `┃ 🎭 Role: *${char.role}*\n`;
    if (char.position) caption += `┃ 📍 Position: *${char.position}*\n`;
    if (_optionalChain([char, 'access', _27 => _27.profile, 'optionalAccess', _28 => _28.weaponType]))
      caption += `┃ 🔫 Weapon: *${char.profile.weaponType}*\n`;
    if (_optionalChain([char, 'access', _29 => _29.profile, 'optionalAccess', _30 => _30.weaponName]))
      caption += `┃ ⚔️ Weapon Name: *${char.profile.weaponName}*\n`;
    caption += `╰┈┈┈┈┈┈┈┈⬡\n\n`;

    if (char.skills && char.skills.length > 0) {
      caption += `╭┈┈⬡「 ✨ *sᴋɪʟʟs* 」\n`;
      for (const skill of char.skills.slice(0, 4)) {
        caption += `┃ 🔹 *${skill.name}* (${skill.type})\n`;
      }
      caption += `╰┈┈┈┈┈┈┈┈⬡`;
    }

    if (char.img) {
      await sock.sendMessage(
        m.chat,
        {
          image: { url: char.img },
          caption,
          contextInfo: {
            forwardingScore: 9999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: saluranId,
              newsletterName: saluranName,
              serverMessageId: 127,
            },
          },
        },
        { quoted: m },
      );
    } else {
      await m.reply(caption);
    }

    await m.react("✅");
  } catch (error) {
    await m.react("☢");
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

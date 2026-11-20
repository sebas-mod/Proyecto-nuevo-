"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinformatterjs = require('../../src/lib/ourin-formatter.js');
const pluginConfig = {
  name: "daily",
  alias: ["claim", "harian", "bonus"],
  category: "user",
  description: "Claim hadiah harian (Exp, Money, Potion)",
  usage: ".daily",
  example: ".daily",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

const DAILY_COOLDOWN = 24 * 60 * 60 * 1000;

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.cooldowns) user.cooldowns = {};
  const lastDaily = user.cooldowns.daily || 0;
  const now = Date.now();

  if (now - lastDaily < DAILY_COOLDOWN) {
    const remaining = lastDaily + DAILY_COOLDOWN - now;
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return m.reply(
      `🕕*ᴄᴏᴏʟᴅᴏᴡɴ*\n\n- Sí, hoy estás a la guardia.\n> 91; Gasps &#93;${hours}hora${minutes}minuto* otra vez.`,
    );
  }

  const expReward = Math.floor(Math.random() * 5000) + 1000;
  const moneyReward = Math.floor(Math.random() * 10000) + 5000;
  const potionReward = Math.floor(Math.random() * 3) + 1;

  if (!user.rpg) user.rpg = {};
  db.updateExp(m.sender, expReward);
  user.koin = (user.koin || 0) + moneyReward;

  if (!user.inventory) user.inventory = {};
  user.inventory.potion = (user.inventory.potion || 0) + potionReward;

  user.cooldowns.daily = now;
  db.save();

  const greeting = _ourinformatterjs.getTimeGreeting.call(void 0, );

  let txt = `🎉 *ᴅᴀɪʟʏ ᴄʟᴀɪᴍ sᴜᴋsᴇs*\n`;
  txt += `> ${greeting}, @${m.sender.split("@")[0]}\n\n`;
  txt += `╭┈┈⬡「 🎁 *ʀᴇᴡᴀʀᴅs* 」\n`;
  txt += `┃ 🚄 Exp: *+${expReward}*\n`;
  txt += `┃ 💰Monedas: *+${moneyReward.toLocaleString("id-ID")}*\n`;
  txt += `┃ 🥤 Potion: *+${potionReward}*\n`;
  txt += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
  txt += `¡No olvides la reclamación otra vez!`;

  await m.reply(txt, { mentions: [m.sender] });
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

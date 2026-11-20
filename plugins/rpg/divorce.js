"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
  name: "divorce",
  alias: ["cerai", "pisah"],
  category: "rpg",
  description: "Divorciado del partido",
  usage: ".divorce",
  example: ".divorce",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  if (!user.rpg.spouse) {
    return m.reply(`Un poco más alto.😂💔\nBusca era un compañero.\`(Marry @ USER)\``);
  }

  const spouseJid = user.rpg.spouse;
  const partner = db.getUser(spouseJid);

  const divorceCost = 25000;
  if ((user.koin || 0) < divorceCost) {
    return m.reply(`Az, ¡el precio del jefe de mahal cerai caprice!😭\nNecesto una carta de divorcio, dinero lu cuma${(user.koin || 0).toLocaleString("id-ID")}*.\n¡Tahan tiene que luchar con ella!`);
  }

  user.koin -= divorceCost;
  user.rpg.spouse = null;
  user.rpg.marriedAt = null;

  if (partner && partner.rpg) {
    partner.rpg.spouse = null;
    partner.rpg.marriedAt = null;
  }

  db.save();

  await m.react("💔");

  let txt = `⛈*La cruz está cerrada*⛈♪\n\n`;
  txt += `El martillo ha sido desechado con corazones pesados, relaciones entre los dos:\n`;
  txt += `💔 @${m.sender.split("@")[0]}\n`;
  txt += `¿Qué?\n`;
  txt += `💔 @${spouseJid.split("@")[0]}\n\n`;
  txt += `😭 *Oficial BERAKHIR! Ahora Ustedes Volver JOMBLO!* 😭\n\n`;
  txt += `💸Manner podría / rociar: * Rp-${divorceCost.toLocaleString("id-ID")}*\n\n`;
  txt += `Vete al infierno.. llanto sobre él en la esquina.🥀🚬`;

  await m.reply(txt, { mentions: [m.sender, spouseJid] });
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

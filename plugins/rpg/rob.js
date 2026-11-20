"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');
var _ourincontextjs = require('../../src/lib/ourin-context.js');

const pluginConfig = {
  name: "rob",
  alias: ["rampok", "mug"],
  category: "rpg",
  description: "Rampok otro jugador de dinero ( pimpyco )",
  usage: ".rob @user",
  example: ".rob @user",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 600,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );

  const target = _optionalChain([m, 'access', _ => _.mentionedJid, 'optionalAccess', _2 => _2[0]]) || _optionalChain([m, 'access', _3 => _3.quoted, 'optionalAccess', _4 => _4.sender]);

  if (!target) {
    return m.reply(`Hayo, ¿quién quiere dormir?🦹‍♂♪🔪\n¡Las etiquetas de destino deben ser arrastradas a la hartanya!\nEjemplo:\`. Rob @ usuario\``);
  }

  if (target === m.sender) {
    return m.reply(`Sakit jiwa lu? Masa ngerampok cartera propio! 😂❌`);
  }

  const robber = db.getUser(m.sender);
  const victim = db.getUser(target);

  if (!victim) {
    return m.reply(`¡Los objetivos del fugitivo te encontrarán en la base de datos!🏃💨`);
  }

  if ((victim.koin || 0) < 1000) {
    return m.reply(`Fontcolor = " # FFFF00 " Yalalah, goingyou pobre parah!😤`);
  }

  if (!robber.rpg) robber.rpg = {};
  robber.rpg.health = robber.rpg.health || 100;

  if (robber.rpg.health < 30) {
    return m.reply(`Hey jefe, usted todavía es un huesso y un huesso todavía una traké?🤒\nAl menos 30 hps, sangre cuma *${robber.rpg.health} HP*. Berobat sana!`);
  }

  await _ourincontextjs.sendRpgPreview.call(void 0, sock, m.chat, `* Ssssttt... * escondido en un callejón oscuro esperando que el objetivo pase..🦹‍♂♪🔪`, "🦹 BEGAL", "Beraksi!", { quoted: m });
  await new Promise((r) => setTimeout(r, 2500));

  const successRate = 0.4;
  const isSuccess = Math.random() < successRate;

  if (isSuccess) {
    const maxSteal = Math.floor((victim.koin || 0) * 0.3);
    const stolen = Math.floor(Math.random() * maxSteal) + 1000;

    victim.koin = (victim.koin || 0) - stolen;
    robber.koin = (robber.koin || 0) + stolen;

    const expGain = 300;
    await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, robber, expGain);

    db.save();

    let txt = `¿Qué?🦹‍♂♪💰\n\n`;
    txt += `Lo hiciste para asustarme.${target.split("@")[0]} hasta ngencing en pantalones!\n`;
    txt += `Resultado de la partitura: * + Rp${stolen.toLocaleString("id-ID")}*\n`;
    txt += `Bono EXP Begal: * +${expGain}*\n\n`;
    txt += `* Buru sod before the police come!!🚓💨`;

    await m.reply(txt, { mentions: [target] });
  } else {
    const fine = Math.floor(Math.random() * 10000) + 5000;
    const actualFine = Math.min(fine, robber.koin || 0);
    const healthLoss = 25;

    robber.koin = Math.max(0, (robber.koin || 0) - actualFine);
    robber.rpg.health = Math.max(0, robber.rpg.health - healthLoss);

    db.save();

    let txt = `GOBLOK! KETAHUAN WARGA!! 🚨🤬\n\n`;
    txt += `En lugar de ser golpeado por un dinero, ¡te vas a joder por un RT!\n`;
    txt += `💸Su dinero está dilatado RT: * - Rp${actualFine.toLocaleString("id-ID")}*\n`;
    txt += `🤕 Badan Ronda Belur: *-${healthLoss} HP*\n\n`;
    txt += `* MAMPUS LU, come bien don 't tonto por aquí!🤣`;

    await m.reply(txt);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');

const pluginConfig = {
  name: "arena",
  alias: ["pvp", "battle", "fight"],
  category: "rpg",
  description: "Bertarung di arena PvP",
  usage: ".arena <@user>",
  example: ".arena @user",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 180,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};

  const mentioned = _optionalChain([m, 'access', _ => _.mentionedJid, 'optionalAccess', _2 => _2[0]]) || _optionalChain([m, 'access', _3 => _3.quoted, 'optionalAccess', _4 => _4.sender]);
  if (!mentioned) {
    let txt = `⚔️ *ARENA GLADIATOR* ⚔️\n\n`;
    txt += `¡Desafíamos a tu amigo a duelo en arena!\n\n`;
    txt += `*Cara Menantang:*\n`;
    txt += `🗡️ \`${m.prefix}arena @user\`\n`;
    txt += `🗡*Le dije que le enviara un mensaje*\`${m.prefix}arena\`\n\n`;
    txt += `¿Q¿Ué?⚠Para ver cuidado, hermana, si quiere que su moneda sea 20 % menos.`;
    return m.reply(txt);
  }

  if (mentioned === m.sender) {
    return m.reply(`¿Quieres suicidarte?😂`);
  }

  const opponent = db.getUser(mentioned);
  if (!opponent) {
    return m.reply(`¡La fecha que etiquetaste no está registrada en nuestra base de datos todavía!`);
  }

  if (!opponent.rpg) opponent.rpg = {};

  const myHealth = user.rpg.health || 100;
  const myAttack = (user.rpg.attack || 10) + (user.level || 1) * 2;
  const myDefense = (user.rpg.defense || 5) + (user.level || 1);

  const oppHealth = opponent.rpg.health || 100;
  const oppAttack = (opponent.rpg.attack || 10) + (opponent.level || 1) * 2;
  const oppDefense = (opponent.rpg.defense || 5) + (opponent.level || 1);

  await m.react("⚔️");
  await m.reply(`⚔* COMMENTATOR ' s FIGHT!⚔♪\n\n@${m.sender.split("@")[0]}Arrastrar al lado @${mentioned.split("@")[0]}!\nFontcolor = " # FFFF00 " Ojalá successful si fontcolor = " # FFFF00 " hermana!🔥`, { mentions: [m.sender, mentioned] });
  await new Promise((r) => setTimeout(r, 2000));

  let myHp = myHealth;
  let oppHp = oppHealth;
  let round = 0;
  let battleLog = [];

  while (myHp > 0 && oppHp > 0 && round < 10) {
    round++;

    const myDmg = Math.max(5, myAttack - oppDefense + Math.floor(Math.random() * 10));
    oppHp -= myDmg;
    battleLog.push(`🔥Estás hundiendo contra el hombro:${myDmg} HP*`);

    if (oppHp <= 0) break;

    const oppDmg = Math.max(5, oppAttack - myDefense + Math.floor(Math.random() * 10));
    myHp -= oppDmg;
    battleLog.push(`💢- Y te voy a ganar.${oppDmg} HP*`);
  }

  const isWin = myHp > oppHp;

  let txt = `⚔♪ Tengo una pelea ♪⚔♪\n\n`;
  txt += `*📊Kondisi Final:*\n`;
  txt += `🧑Tu: *${Math.max(0, myHp)}/${myHealth} HP*\n`;
  txt += `👤Oponente: *${Math.max(0, oppHp)}/${oppHealth} HP*\n`;
  txt += `🔄Duración: *${round}Ronda*\n\n`;

  txt += `📜 *Cuplikan Lucha:*\n`;
  txt += battleLog
    .slice(-6)
    .map((l) => `> ${l}`)
    .join("\n");
  txt += `\n\n`;

  if (isWin) {
    const expReward = 300 + (opponent.level || 1) * 50;
    const goldReward = Math.floor((opponent.koin || 0) * 0.1);

    user.koin = (user.koin || 0) + goldReward;
    opponent.koin = Math.max(0, (opponent.koin || 0) - goldReward);

    await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expReward);

    txt += `🏆 *KEMENANGAN TELAH DIRAIH!* 🎉\n`;
    txt += `Es un regalo de Arena:\n`;
    txt += `✨ EXP: *+${expReward}*\n`;
    txt += `💰Tela Jarahan: * + Rp${goldReward.toLocaleString()}*`;

    await m.react("🏆");
  } else {
    const goldLoss = Math.floor((user.koin || 0) * 0.2);
    user.koin = Math.max(0, (user.koin || 0) - goldLoss);

    txt += `💀* Desde luego, estás cagando. *💔\n`;
    txt += `No te entristeces, hermana. ¡Lo intentaré de nuevo!\n`;
    txt += `💸 Monedas Terjatuh: *-Rp ${goldLoss.toLocaleString()}*`;

    await m.react("💀");
  }

  db.setUser(m.sender, user);
  db.setUser(mentioned, opponent);
  db.save();

  return m.reply(txt, { mentions: [m.sender, mentioned] });
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

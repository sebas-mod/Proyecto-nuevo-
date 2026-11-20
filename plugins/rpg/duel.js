"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');
var _ourincontextjs = require('../../src/lib/ourin-context.js');

const pluginConfig = {
  name: "duel",
  alias: ["pvp", "fight"],
  category: "rpg",
  description: "PvP duel con otro jugador",
  usage: ".duel @user <bet>",
  example: ".duel @user 5000",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 120,
  energi: 1,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const args = m.args || [];

  const target = _optionalChain([m, 'access', _ => _.mentionedJid, 'optionalAccess', _2 => _2[0]]) || _optionalChain([m, 'access', _3 => _3.quoted, 'optionalAccess', _4 => _4.sender]);
  const bet = parseInt(args[1]) || 1000;

  if (!target) {
    let txt = `⚔️ *DUEL TARUHAN* ⚔️\n\n`;
    txt += `¡El desafío de su amigo a duelo con la apuesta de su hermano!\n\n`;
    txt += `*Cara Menantang:*\n`;
    txt += `👉 \`.duel @user 5000\`\n`;
    txt += `_ ( Artinya le trajiste un duelo con apuestas Rp 5 ) _`;
    return m.reply(txt);
  }

  if (target === m.sender) {
    return m.reply(`¿Vas a luchar con el espejo?😂`);
  }

  if (bet < 1000) {
    return m.reply(`Apuesto a que eres un poco pequeño, hermano!💸`);
  }

  const player1 = db.getUser(m.sender);
  const player2 = db.getUser(target) || db.setUser(target);

  if ((player1.koin || 0) < bet) {
    return m.reply(`Ouch hermana,¡su saldo no es suficiente para poner en esa apuesta!\nTe Tela ahora: * Rp${(player1.koin || 0).toLocaleString("id-ID")}*`);
  }

  if ((player2.koin || 0) < bet) {
    return m.reply(`Bueno, hermano, parece que estás haciendo lo suficiente para está apuesta.`);
  }

  if (!player1.rpg) player1.rpg = {};
  if (!player2.rpg) player2.rpg = {};

  player1.rpg.health = player1.rpg.health || 100;
  player2.rpg.health = player2.rpg.health || 100;

  if (player1.rpg.health < 30) {
    return m.reply(`¡Espera, hermana!${player1.rpg.health}Al menos 30 hps deben hacer el duelo.💉`);
  }

  await _ourincontextjs.sendRpgPreview.call(void 0, sock, m.chat, `⚔* ¡DUEL STARTED!⚔♪\n\n@${m.sender.split("@")[0]}con un par de desafío @${target.split("@")[0]}!\n💰Tital Taruhan en Tengh: * Rp${(bet * 2).toLocaleString("id-ID")}*`, "⚔️ ARENA DUEL", "Bertarung!", { quoted: m });

  await new Promise((r) => setTimeout(r, 2000));

  const p1Power = (player1.rpg.level || 1) * 10 + Math.random() * 50;
  const p2Power = (player2.rpg.level || 1) * 10 + Math.random() * 50;

  const winner = p1Power > p2Power ? m.sender : target;
  const loser = winner === m.sender ? target : m.sender;
  const winnerData = winner === m.sender ? player1 : player2;
  const loserData = winner === m.sender ? player2 : player1;

  winnerData.koin = (winnerData.koin || 0) + bet;
  loserData.koin = (loserData.koin || 0) - bet;
  loserData.rpg.health = Math.max(0, (loserData.rpg.health || 100) - 20);

  const expGain = 500;
  await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, { ...m, sender: winner }, db, winnerData, expGain);

  db.save();

  let txt = `⚔# Oso en el corazón #⚔♪\n\n`;
  txt += `🏆*Ganador:* @${winner.split("@")[0]}\n`;
  txt += `💀*Perdiste:* @${loser.split("@")[0]}(Remolino de pico con Parah )\n\n`;
  txt += `🎁* El ganador de la derecha trae a casa: *\n`;
  txt += `♪💰Taruhan Oponente Dinero: * + Rp${bet.toLocaleString("id-ID")}*\n`;
  txt += `♪✨ Bono EXP Lucha: *+${expGain} EXP*`;

  await _ourincontextjs.sendRpgPreview.call(void 0, sock, m.chat, txt, "⚔️ ARENA DUEL", "Hasil Duel!", { quoted: m });
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

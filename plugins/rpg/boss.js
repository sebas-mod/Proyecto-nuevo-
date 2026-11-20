"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');

const pluginConfig = {
  name: "boss",
  alias: ["raidboss", "bigboss"],
  category: "rpg",
  description: "Pawan patrones para el gran premio",
  usage: ".boss",
  example: ".boss",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 600,
  energi: 3,
  isEnabled: true,
};

const BOSSES = [
  {
    name: "🐉 Elder Dragon",
    hp: 500,
    attack: 50,
    minLevel: 10,
    exp: 2000,
    gold: 5000,
    drops: ["dragonscale", "dragonbone"],
  },
  {
    name: "👹 Demon Lord",
    hp: 400,
    attack: 60,
    minLevel: 15,
    exp: 2500,
    gold: 7000,
    drops: ["demonsoul", "cursedgem"],
  },
  {
    name: "🧟 Undead King",
    hp: 350,
    attack: 45,
    minLevel: 8,
    exp: 1500,
    gold: 4000,
    drops: ["soulstone", "ancientbone"],
  },
  {
    name: "🦑 Kraken",
    hp: 600,
    attack: 40,
    minLevel: 12,
    exp: 2200,
    gold: 6000,
    drops: ["krakententacle", "seagem"],
  },
  {
    name: "🌋 Volcanic Titan",
    hp: 700,
    attack: 55,
    minLevel: 20,
    exp: 3000,
    gold: 10000,
    drops: ["titancore", "lavagem"],
  },
  {
    name: "❄️ Frost Queen",
    hp: 450,
    attack: 50,
    minLevel: 18,
    exp: 2800,
    gold: 8000,
    drops: ["frostheart", "icecrown"],
  },
  {
    name: "⚡ Thunder God",
    hp: 550,
    attack: 65,
    minLevel: 25,
    exp: 4000,
    gold: 15000,
    drops: ["thunderstone", "divinecore"],
  },
];

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};

  const userLevel = user.level || 1;
  const availableBosses = BOSSES.filter((b) => userLevel >= b.minLevel);

  if (availableBosses.length === 0) {
    const lowestBoss = BOSSES.reduce((a, b) => (a.minLevel < b.minLevel ? a : b));
    let txt = `Aduh hermano, Nivel que sigue siendo desiado bajo para un Jefe de la Reserva!😭\n\n`;
    txt += `Nivel que ahora: *${userLevel}*\n`;
    txt += `Minimal evel requerido: *${lowestBoss.minLevel}*\n\n`;
    txt += `💡Sooths:\`. mazmorra.\`.\`Pescados.\`, o\`. minería\`Lo siento, ¡ya llegué tarde!`;
    return m.reply(txt);
  }

  const staminaCost = 50;
  user.rpg.stamina = _nullishCoalesce(user.rpg.stamina, () => ( 100));

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`⚡¡¡La fuerza de Eh matasse a hermana!\n\nNecesito${staminaCost}Estabilización para el jefe.\nStamina que restante: *${user.rpg.stamina}*`);
  }

  user.rpg.stamina -= staminaCost;

  const boss = availableBosses[Math.floor(Math.random() * availableBosses.length)];

  await m.react("⚔️");
  let introTxt = `⚠️ *Advertencia BAHAYA!* ⚠♪\n\n`;
  introTxt += `Aura kegelapan menyelimuti arena... *${boss.name}* ha aparecido en tu cara!\n\n`;
  introTxt += `❤♪ Sangre BATS ♪${boss.hp} HP*\n`;
  introTxt += `⚔️ Fuerza: *${boss.attack} ATK*\n\n`;
  introTxt += `_Siapkan senjatamu hermano! Lucha comenzó..._`;
  
  await m.reply(introTxt);
  await new Promise((r) => setTimeout(r, 2500));

  const userAttack = (user.rpg.attack || 10) + userLevel * 3;
  const userDefense = (user.rpg.defense || 5) + userLevel * 2;
  const userMaxHp = (user.rpg.health || 100) + userLevel * 5;

  let userHp = userMaxHp;
  let bossHp = boss.hp;
  let round = 0;
  let battleLog = [];

  while (userHp > 0 && bossHp > 0 && round < 15) {
    round++;

    const playerDmg = Math.max(10, userAttack + Math.floor(Math.random() * 20) - 5);
    const critChance = Math.random();
    const finalPlayerDmg = critChance > 0.9 ? playerDmg * 2 : playerDmg;
    bossHp -= finalPlayerDmg;

    if (critChance > 0.9) {
      battleLog.push(`💥* CRITICAL HIT! * Ataque desactivando en: *${finalPlayerDmg} HP*`);
    } else {
      battleLog.push(`⚔Para ver que cortaste al jefe:${finalPlayerDmg} HP*`);
    }

    if (bossHp <= 0) break;

    const bossDmg = Math.max(10, boss.attack - userDefense + Math.floor(Math.random() * 15));
    userHp -= bossDmg;
    battleLog.push(`👹Jefe se atropellaron y retrocedieron: * -${bossDmg} HP*`);
  }

  await m.reply(
    `⚔La batalla está a punto de comenzar.\n\n${battleLog
      .slice(-6)
      .map((l) => `> ${l}`)
      .join("\n")}`,
  );
  await new Promise((r) => setTimeout(r, 1500));

  const isWin = bossHp <= 0;

  let txt = ``;

  if (isWin) {
    const expReward = boss.exp + Math.floor(Math.random() * 500);
    const goldReward = boss.gold + Math.floor(Math.random() * 2000);

    user.koin = (user.koin || 0) + goldReward;
    await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expReward);

    const droppedItems = [];
    for (const drop of boss.drops) {
      if (Math.random() > 0.5) {
        const qty = Math.floor(Math.random() * 3) + 1;
        user.inventory[drop] = (user.inventory[drop] || 0) + qty;
        droppedItems.push(`${drop} (x${qty})`);
      }
    }

    txt = `🏆* BOSS REST DISAPPEARED!🎉\n\n`;
    txt += `Gila, lo hacía al monstruo gigante${boss.name}* hermano!\n\n`;
    txt += `*🎁 Harta Karun Boss:*\n`;
    txt += `✨ EXP: *+${expReward.toLocaleString()}*\n`;
    txt += `💰Tela Oro: * + Rp${goldReward.toLocaleString()}*\n`;
    if (droppedItems.length > 0) {
      txt += `📦Lotería: *${droppedItems.join(", ")}*\n`;
    }
    txt += `\n♪❤Ayasa Sip Your HP: *${Math.max(0, userHp)}/${userMaxHp}*`;

    await m.react("🏆");
  } else {
    const goldLoss = Math.floor((user.koin || 0) * 0.15);
    user.koin = Math.max(0, (user.koin || 0) - goldLoss);
    user.rpg.health = Math.max(1, (user.rpg.health || 100) - 50);

    txt = `💀* Sí, estás jodido. *💔\n\n`;
    txt += `Tenaga *${boss.name}* El espectáculo es todavía demasiado grande para ti hermano!\n\n`;
    txt += `*Penalti Kekalahan:*\n`;
    txt += `💸 Monedas Terjatuh: *-Rp ${goldLoss.toLocaleString()}*\n`;
    txt += `❤️ HP Reducido: *-50 HP*\n\n`;
    txt += `♪💡- Intenta está aumentando su nivel y armas antes de que usted vuelva a luchar contra él!`;

    await m.react("💀");
  }

  db.save();
  return m.reply(txt);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

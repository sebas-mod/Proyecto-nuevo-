"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');

const pluginConfig = {
  name: "steal",
  alias: ["mencuri", "curi", "pickpocket"],
  category: "rpg",
  description: "Sello de NPC para oro",
  usage: ".steal",
  example: ".steal",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 300,
  energi: 2,
  isEnabled: true,
};

const TARGETS = [
  { name: "👨‍🌾 Petani Lengah", difficulty: 1, minGold: 50, maxGold: 150, catchChance: 10 },
  { name: "👨‍💼 Pedagang Keliling", difficulty: 2, minGold: 100, maxGold: 300, catchChance: 20 },
  { name: "🧙‍♂️ Penyihir Tua", difficulty: 3, minGold: 200, maxGold: 500, catchChance: 30 },
  { name: "⚔️ Ksatria Kerajaan", difficulty: 4, minGold: 300, maxGold: 800, catchChance: 40 },
  { name: "👑 Bangsawan Sombong", difficulty: 5, minGold: 500, maxGold: 1500, catchChance: 50 },
  { name: "🏰 Raja Tiran", difficulty: 6, minGold: 1000, maxGold: 3000, catchChance: 60 },
];

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};

  const staminaCost = 15;
  user.rpg.stamina = _nullishCoalesce(user.rpg.stamina, () => ( 100));

  if (user.rpg.stamina < staminaCost) {
    return m.reply(`Hadeh. ¿Quieres ser un ladrón?😴\nNecesito *${staminaCost}La fuerza hace ruido, tu cuma tiene *${user.rpg.stamina}*. Descanse en vamos!`);
  }

  user.rpg.stamina -= staminaCost;

  const userLevel = user.level || 1;
  const availableTargets = TARGETS.filter((t) => userLevel >= t.difficulty * 3);

  if (availableTargets.length === 0) {
    db.save();
    return m.reply(`Tu nivel sigue en el fritz.${userLevel}El mayor objetivo de todos, ¡dejen que mueras en una muerte ridícula!😂`);
  }

  const target = availableTargets[Math.floor(Math.random() * availableTargets.length)];

  await m.react("🥷");
  await m.reply(`*Ngendap-ngendap...* Memanjat tembok casa *${target.name}*... 🥷⚔️`);
  await new Promise((r) => setTimeout(r, 2500));

  const luckBonus = (user.rpg.luck || 5) * 2;
  const adjustedCatchChance = Math.max(5, target.catchChance - luckBonus);
  const isCaught = Math.random() * 100 < adjustedCatchChance;

  if (isCaught) {
    const goldLoss = Math.floor((user.koin || 0) * 0.1);
    const healthLoss = 10 + target.difficulty * 5;

    user.koin = Math.max(0, (user.koin || 0) - goldLoss);
    user.rpg.health = Math.max(1, (user.rpg.health || 100) - healthLoss);

    db.save();

    await m.react("💀");
    return m.reply(
      `SIAAALLLL!! KESANDUNG POT Flor!! 💥🚨\n\n` +
        `Si *${target.name}* Langsung se levanta y mukulin que abis @-@ abysan!\n\n` +
        `*Perdida:*\n` +
        `💸Dinero esparció: * - Rp${goldLoss.toLocaleString()}*\n` +
        `❤️ Kena Pukul: *-${healthLoss} HP*\n` +
        `⚡Espolvorador de resistencia: * -${staminaCost}*\n\n` +
        `* Consejos: * Bandidos Stat * Suerte * Déjame pisar tus pies, hermano!`
    );
  }

  const goldStolen = Math.floor(Math.random() * (target.maxGold - target.minGold)) + target.minGold;
  const expReward = 50 + target.difficulty * 30;

  user.koin = (user.koin || 0) + goldStolen;
  await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expReward);

  const bonusItem = Math.random() > 0.7;
  let bonusText = "";
  if (bonusItem) {
    const items = ["potion", "key", "gem", "ring"];
    const item = items[Math.floor(Math.random() * items.length)];
    user.inventory[item] = (user.inventory[item] || 0) + 1;
    bonusText = `\n📦Bono Jarahan: *${item} x1*`;
  }

  db.save();

  await m.react("💰");
  return m.reply(
    `¡Explosiones de NINJA!🥷✨\n\n` +
      `Has hecho bien para llegar a casa.${target.name}* sin ketahuan igual muy!\n\n` +
      `*Resultado Jarahan:*\n` +
      `💵 Oro Batangan: *+Rp ${goldStolen.toLocaleString()}*\n` +
      `✨ EXP Menyusup: *+${expReward}*` +
      `${bonusText}\n` +
      `⚡ Stamina: *-${staminaCost}*`
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

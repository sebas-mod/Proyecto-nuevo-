"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
  name: "quest",
  alias: ["misi", "mission", "bounty"],
  category: "rpg",
  description: "Día de la Ambulancia para reencarnar el bono",
  usage: ".quest",
  example: ".quest",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 0,
  energi: 0,
  isEnabled: true,
};

const QUESTS = [
  {
    id: "mining5",
    name: "Penambang Pemula",
    desc: "Mining 5 kali",
    target: 5,
    reward: { money: 10000, exp: 1000 },
  },
  {
    id: "fishing5",
    name: "Pemancing Handal",
    desc: "Fishing 5 kali",
    target: 5,
    reward: { money: 8000, exp: 800 },
  },
  {
    id: "adventure3",
    name: "Petualang Sejati",
    desc: "Adventure 3 kali",
    target: 3,
    reward: { money: 15000, exp: 1500 },
  },
  {
    id: "work10",
    name: "Pekerja Keras",
    desc: "Work 10 kali",
    target: 10,
    reward: { money: 20000, exp: 2000 },
  },
  {
    id: "hunt5",
    name: "Pemburu Ulung",
    desc: "Hunt 5 kali",
    target: 5,
    reward: { money: 12000, exp: 1200 },
  },
];

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.quest) user.quest = {};

  const args = m.args || [];
  const sub = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);

  if (sub === "claim") {
    const questId = args[1];
    if (!questId || !user.quest[questId]) {
      return m.reply(`Esa misiónónónónónónónónónónónónónónónónónónónón no está en su lista,¡¡Sí!📜❌`);
    }

    const quest = QUESTS.find((q) => q.id === questId);
    if (!quest) {
      return m.reply(`ID misinya incorrecto hermano! Comprueba otra vez papan bounty si! 🔍`);
    }

    if (user.quest[questId].progress < quest.target) {
      return m.reply(`¡Está misiónónónónónónónónónónónónónónónónónónónónónónón aún no ha terminado!\nSu progreso: *${user.quest[questId].progress}/${quest.target}* 🏃‍♂️💦`);
    }

    if (user.quest[questId].claimed) {
      return m.reply(`¡Está en la misiónónónónónónónónónónónónónónónónónónónónónónónón que tommasté, hermante!😒`);
    }

    user.koin = (user.koin || 0) + quest.reward.money;
    db.updateExp(m.sender, quest.reward.exp);
    user.quest[questId].claimed = true;

    db.save();
    let txt = `💰> #91; Misiónónónónónónónónónónónónónónónón Terminado!💰\n\n`;
    txt += `Lo hiciste.${quest.name}*!\n`;
    txt += `Este es un regalo para ti, hermana:\n`;
    txt += `💵Misi Vue: * + Rp${quest.reward.money.toLocaleString("id-ID")}*\n`;
    txt += `📈Bono de la EXP: * +${quest.reward.exp}*\n\n`;
    txt += `- = = Sincronización, corregido por elderman = = @ elder _ hombre👩‍💼`;
    return m.reply(txt);
  }

  if (sub === "take") {
    const questId = args[1];
    const quest = QUESTS.find((q) => q.id === questId);
    if (!quest) {
      return m.reply(`Obtener la lista completa de las listas.\`. búsqueda.\``);
    }

    if (user.quest[questId]) {
      return m.reply(`Tienes que trabajar con está misiónónónónónónónónónónónónónónón.⚔♪`);
    }

    user.quest[questId] = { progress: 0, claimed: false, takenAt: Date.now() };
    db.save();

    let txt = `📜* Misiónónónónónónónónónónónónónónónónónón Tomado!📜\n\n`;
    txt += `¡Tomate un papel de missionón de Papan Bounty!📜✨\n`;
    txt += `🎯 Objetivo: *${quest.name}* (${quest.desc})\n`;
    txt += `🎁Premio: *Rp${quest.reward.money.toLocaleString("id-ID")}* & *${quest.reward.exp} EXP*\n\n`;
    txt += `Ojalá lo hizo en el camino, hermana!💖`;
    return m.reply(txt);
  }

  let txt = `📌*El papel de la botella*📌\n\n`;
  txt += `Finalizar la asignación de hoy para obtener un regalo para Yuk yuk\n\n`;

  for (const quest of QUESTS) {
    const userQuest = user.quest[quest.id];
    let status = "📜 Tersedia";
    if (userQuest) {
      if (userQuest.claimed) {
        status = "✅Terminado";
      } else if (userQuest.progress >= quest.target) {
        status = "🎁 Siap Claim";
      } else {
        status = `🏃Placa de trabajo (${userQuest.progress}/${quest.target})`;
      }
    }

    txt += `🎯 *${quest.name}*\n`;
    txt += `   ├ Tugas: ${quest.desc}\n`;
    txt += `   ├ Reward: Rp ${quest.reward.money.toLocaleString("id-ID")} & ${quest.reward.exp} EXP\n`;
    txt += `   ├ Status: *${status}*\n`;
    txt += `   └Toma:\`${m.prefix}quest take ${quest.id}\`\n\n`;
  }

  txt += `♪💡Ya sabes, todo el tiempo, hemos terminado aquí.\`. reclamación de búsqueda.<id_misi>\``;

  await m.reply(txt);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

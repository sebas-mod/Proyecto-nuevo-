"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');

const pluginConfig = {
  name: "challenge",
  alias: ["daily", "dailychallenge", "tantangan"],
  category: "rpg",
  description: "Daily challenge untuk hadiah spesial",
  usage: ".challenge",
  example: ".challenge",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

const CHALLENGES = [
  { name: "⚔️ Kalahkan 5 Monster", type: "kill", target: 5, reward: { gold: 500, exp: 200 } },
  { name: "🎣 Tangkap 3 Ikan", type: "fish", target: 3, reward: { gold: 300, exp: 150 } },
  { name: "⛏️ Tambang 10 Ore", type: "mine", target: 10, reward: { gold: 400, exp: 180 } },
  { name: "🌱 Panen 5 Hasil Kebun", type: "harvest", target: 5, reward: { gold: 350, exp: 160 } },
  { name: "🧪 Racik 3 Potion", type: "craft", target: 3, reward: { gold: 450, exp: 190 } },
  { name: "💰 Kumpulkan 1000 Koin", type: "earn", target: 1000, reward: { gold: 500, exp: 250 } },
  { name: "🗺️ Selesaikan 2 Ekspedisi", type: "expedition", target: 2, reward: { gold: 600, exp: 300 } },
];

function getNewDailyChallenge() {
  return {
    ...CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)],
    progress: 0,
    date: new Date().toDateString(),
    claimed: false,
  };
}

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  const today = new Date().toDateString();

  if (!user.rpg.dailyChallenge || user.rpg.dailyChallenge.date !== today) {
    user.rpg.dailyChallenge = getNewDailyChallenge();
    db.save();
  }

  const challenge = user.rpg.dailyChallenge;
  const isComplete = challenge.progress >= challenge.target;

  const args = m.args || [];
  const action = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);

  if (action === "claim") {
    if (!isComplete) {
      return m.reply(`❌ Tantangannya belum selesai nih kak!\nProgress kamu baru: *${challenge.progress}/${challenge.target}*`);
    }

    if (challenge.claimed) {
      return m.reply(`Wah kak, hadiah untuk hari ini udah diambil! Tunggu tantangan baru besok ya! 😉`);
    }

    user.koin = (user.koin || 0) + challenge.reward.gold;
    await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, challenge.reward.exp);

    challenge.claimed = true;
    db.save();

    await m.react("🎉");
    return m.reply(
      `🎉 *TANTANGAN HARIAN SELESAI!!* 🎉\n\n` +
        `Kerja bagus kak! Ini hadiah dari Guild buat kamu:\n` +
        `💰 Koin: *+Rp ${challenge.reward.gold.toLocaleString()}*\n` +
        `✨ EXP: *+${challenge.reward.exp}*\n` +
        `\n\n` +
        `> _Tantangan baru akan diberikan besok pagi!_`
    );
  }

  let txt = `📋 *TANTANGAN HARIAN GUILD* 📋\n\n`;
  txt += `Selesaikan tugas khusus hari ini untuk dapet uang jajan tambahan kak!\n\n`;
  
  txt += `*Tugas Kamu Hari Ini:*\n`;
  txt += `🎯 *${challenge.name}*\n`;
  txt += `📊 Progress: *${challenge.progress}/${challenge.target}*\n`;
  txt += `Status: ${isComplete ? "✅ *BISA DICLAIM!*" : "⏳ _Sedang dikerjakan..._"}\n\n`;

  txt += `*🎁 Hadiah Tambahan:*\n`;
  txt += `💰 Koin: *Rp ${challenge.reward.gold.toLocaleString()}*\n`;
  txt += `✨ EXP: *${challenge.reward.exp}*\n\n`;

  if (isComplete && !challenge.claimed) {
    txt += `> 💡 Yuk buruan ketik \`${m.prefix}challenge claim\` untuk klaim hadiahnya kak!`;
  } else if (challenge.claimed) {
    txt += `> ✅ Kamu hebat! Hadiah sudah diambil. Besok ada misi baru lagi ya!`;
  } else {
    txt += `> Semangat kerjainnya kak! Kalau udah selesai nanti ambil hadiahnya.`;
  }

  return m.reply(txt);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

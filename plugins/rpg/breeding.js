"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinleveljs = require('../../src/lib/ourin-level.js');

const pluginConfig = {
  name: "breeding",
  alias: ["breed", "kawin", "petbreed"],
  category: "rpg",
  description: "Breeding pets untuk mendapat pet baru",
  usage: ".breeding @user",
  example: ".breeding @user",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 3600,
  energi: 3,
  isEnabled: true,
};

const BREEDING_RESULTS = {
  "cat+cat": ["cat", "cat", "lion"],
  "dog+dog": ["dog", "dog", "wolf"],
  "cat+dog": ["cat", "dog", "rabbit"],
  "bird+bird": ["bird", "bird", "phoenix"],
  "fish+fish": ["fish", "fish", "dragon"],
  "rabbit+rabbit": ["rabbit", "rabbit", "thunderbunny"],
  "cat+bird": ["cat", "bird", "phoenix"],
  "dog+rabbit": ["dog", "rabbit", "wolf"],
  default: ["cat", "dog", "bird", "fish", "rabbit"],
};

const PET_NAMES = {
  cat: "🐱 Kucing",
  dog: "🐕 Anjing",
  bird: "🐦 Burung",
  fish: "🐟 Ikan",
  rabbit: "🐰 Kelinci",
  lion: "🦁 Singa",
  wolf: "🐺 Serigala",
  phoenix: "🔥 Phoenix",
  dragon: "🐉 Naga",
  thunderbunny: "⚡ Thunder Bunny",
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  const mentioned = _optionalChain([m, 'access', _ => _.mentionedJid, 'optionalAccess', _2 => _2[0]]) || _optionalChain([m, 'access', _3 => _3.quoted, 'optionalAccess', _4 => _4.sender]);

  if (!mentioned) {
    return m.reply(
      `💕 *Peternakan & Kawin Silang* 💕\n\n` +
        `Sistem ini ngebolehin peliharaan kamu kawin sama peliharaan player lain!\nSiapa tau dapet keturunan langka! ✨\n\n` +
        `*Cara Pemakaian:*\n` +
        `👉 \`${m.prefix}breeding @user_target\`\n\n` +
        `*Syarat:* \n` +
        `1. Kamu & Target sama-sama punya pet\n` +
        `2. Kedua pet minimal Level 5\n` +
        `3. Biaya persalinan: *Rp 3.000*`
    );
  }

  if (mentioned === m.sender) {
    return m.reply(`Hayo, mau kawin sama diri sendiri? Nggak bisa dong! Tag temanmu! 😂❌`);
  }

  if (!user.rpg.pet) {
    return m.reply(`Kamu aja belum punya peliharaan kak! Beli dulu sana di \`${m.prefix}petshop\` 😭`);
  }

  const partner = db.getUser(mentioned);
  if (!_optionalChain([partner, 'optionalAccess', _5 => _5.rpg, 'optionalAccess', _6 => _6.pet])) {
    return m.reply(`Target yang kamu tag ternyata nggak punya peliharaan! Kasihan pet kamu dicuekin. 💔`);
  }

  const myPet = user.rpg.pet;
  const partnerPet = partner.rpg.pet;

  if ((myPet.level || 1) < 5) {
    return m.reply(`Pet kamu masih terlalu bocil buat kawin! Minimal *Level 5* kak (Sekarang Level ${myPet.level || 1}). 🐣`);
  }

  if ((partnerPet.level || 1) < 5) {
    return m.reply(`Pet pasanganmu masih terlalu kecil buat dikawinin! Minimal *Level 5* kak (Sekarang Level ${partnerPet.level || 1}). 🐣`);
  }

  const breedingCost = 3000;
  if ((user.koin || 0) < breedingCost) {
    return m.reply(`Uang kamu nggak cukup buat bayar dokter hewan kak! Butuh Rp ${breedingCost.toLocaleString()}. 😭`);
  }

  user.koin -= breedingCost;

  await m.react("💕");
  await m.reply(`Cieee, ${PET_NAMES[myPet.type]} kamu sama ${PET_NAMES[partnerPet.type]} temenmu lagi berduaan nih... 💕✨\nTunggu bentar ya, dokternya lagi meriksa persalinan!`);
  await new Promise((r) => setTimeout(r, 4000));

  const breedKey = [myPet.type, partnerPet.type].sort().join("+");
  const possibleResults = BREEDING_RESULTS[breedKey] || BREEDING_RESULTS["default"];
  const resultPetType = possibleResults[Math.floor(Math.random() * possibleResults.length)];

  const isRare = ["lion", "wolf", "phoenix", "dragon", "thunderbunny"].includes(resultPetType);

  if (!user.rpg.petStorage) user.rpg.petStorage = [];

  const newPet = {
    type: resultPetType,
    name: _optionalChain([PET_NAMES, 'access', _7 => _7[resultPetType], 'optionalAccess', _8 => _8.split, 'call', _9 => _9(" "), 'access', _10 => _10[1]]) || "Baby",
    level: 1,
    exp: 0,
    hunger: 100,
    stats: null,
    birthDate: Date.now(),
  };

  user.rpg.petStorage.push(newPet);

  const expReward = isRare ? 500 : 200;
  await _ourinleveljs.addExpWithLevelCheck.call(void 0, sock, m, db, user, expReward);
  db.save();

  await m.react(isRare ? "🎉" : "✅");

  let txt = `AWWW!! ADA KELAHIRAN BARU! 🍼✨\n\n`;
  if (isRare) {
    txt += `🎉 *LUCKY!! KETURUNAN LANGKA!!* 🎉\n`;
  }
  
  txt += `Selamat! Kamu berhasil menetaskan bayi:\n`;
  txt += `🐣 Spesies: *${PET_NAMES[resultPetType]}*\n\n`;
  
  txt += `Dapat EXP *+${expReward}*\n`;
  txt += `Biaya Bersalin: *Rp -${breedingCost.toLocaleString()}*\n\n`;
  
  txt += `*(Bayi peliharaanmu disimpan ke dalam Pet Storage. Total simpananmu: ${user.rpg.petStorage.length} ekor)*`;

  return m.reply(txt, { mentions: [m.sender, mentioned] });
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
  name: "petshop",
  alias: ["tokopet", "buypet", "belipet"],
  category: "rpg",
  description: "Beli pet dari toko",
  usage: ".petshop <buy> <pet>",
  example: ".petshop buy cat",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

const PETS_FOR_SALE = {
  cat: { name: "🐱 Kucing", price: 5000, desc: "Bawa hoki (Luck tinggi, Attack sedang)" },
  dog: { name: "🐕 Anjing", price: 6000, desc: "Penjaga setia (Attack tinggi, Defense bagus)" },
  bird: { name: "🐦 Burung", price: 4500, desc: "Lincah & Hoki (Luck sangat tinggi)" },
  fish: { name: "🐟 Ikan", price: 3000, desc: "Murah meriah (Bawa keberuntungan)" },
  rabbit: { name: "🐰 Kelinci", price: 5500, desc: "Mungil & gesit (Balance semua stats)" },
};

function handler(m) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};
  if (!user.inventory) user.inventory = {};

  const args = m.args || [];
  const action = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);
  const petKey = _optionalChain([args, 'access', _4 => _4[1], 'optionalAccess', _5 => _5.toLowerCase, 'call', _6 => _6()]);

  if (!action || action !== "buy") {
    let txt = `Halo Petualang! Selamat datang di Toko Hewan Peliharaan 🐾🏪\n`;
    txt += `Pilih teman petualanganmu yang lucu-lucu ini!\n\n`;
    
    txt += `*Daftar Peliharaan:*\n`;
    for (const [key, pet] of Object.entries(PETS_FOR_SALE)) {
      txt += `\n*${pet.name}*\n`;
      txt += `💰 Harga: Rp ${pet.price.toLocaleString()}\n`;
      txt += `📝 Sifat: ${pet.desc}\n`;
      txt += `👉 Adopsi: \`.petshop buy ${key}\`\n`;
    }
    
    txt += `\n\n💰 *Uang Kamu:* Rp ${(user.koin || 0).toLocaleString()}`;
    return m.reply(txt);
  }

  if (action === "buy") {
    if (!petKey) {
      return m.reply(`Hayo, mau adopsi hewan apa nih? Sebutin jenisnya dong! 😂\nContoh: \`${m.prefix}petshop buy cat\``);
    }

    if (user.rpg.pet) {
      return m.reply(`Waduh kak, kamu kan udah punya peliharaan! 😭\nKasihan nanti dia cemburu. Lepas dulu peliharaan lamamu atau coba sistem kawin silang (\`.breeding\`).`);
    }

    const petToBuy = PETS_FOR_SALE[petKey];
    if (!petToBuy) {
      return m.reply(`Maaf kak, hewan jenis itu lagi kosong atau emang nggak dijual di sini! ❌\nCek daftarnya lagi pake \`${m.prefix}petshop\``);
    }

    if ((user.koin || 0) < petToBuy.price) {
      return m.reply(`Aduh uangnya kurang nih buat biaya adopsi kak! 😭\nTotal biayanya Rp ${petToBuy.price.toLocaleString()} tapi uang kakak cuma Rp ${(user.koin || 0).toLocaleString()}`);
    }

    user.koin -= petToBuy.price;

    user.rpg.pet = {
      type: petKey,
      name: petToBuy.name.split(" ")[1] || "My Pet",
      level: 1,
      exp: 0,
      hunger: 80,
      stats: null,
    };

    db.save();

    return m.reply(
      `SELAMAT! 🎉🎉\n\n` +
        `Kamu resmi mengadopsi *${petToBuy.name}*!\n` +
        `💰 Biaya Adopsi: *Rp -${petToBuy.price.toLocaleString()}*\n\n` +
        `Dia udah gak sabar pengen jalan-jalan sama kamu. Jangan lupa kasih makan dan cek statusnya pakai \`${m.prefix}pet\` ya! 🐾✨`
    );
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

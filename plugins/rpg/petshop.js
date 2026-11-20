"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
  name: "petshop",
  alias: ["tokopet", "buypet", "belipet"],
  category: "rpg",
  description: "Comprar mascotas de la tienda",
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
  cat: { name: "🐱 Kucing", price: 5000, desc: "Hockey Bawa (Alta la suerte, medio de ataque )" },
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
    let txt = `¡Bienvenido a Tienda Animal Petrans!🐾🏪\n`;
    txt += `¡Elija su ridículo amigo de aventura!\n\n`;
    
    txt += `*Registrate Peliharaan:*\n`;
    for (const [key, pet] of Object.entries(PETS_FOR_SALE)) {
      txt += `\n*${pet.name}*\n`;
      txt += `💰Precio: Rp${pet.price.toLocaleString()}\n`;
      txt += `📝 Sifat: ${pet.desc}\n`;
      txt += `👉 Adopsi: \`.petshop buy ${key}\`\n`;
    }
    
    txt += `\n\n💰* Dinero You: * Rp${(user.koin || 0).toLocaleString()}`;
    return m.reply(txt);
  }

  if (action === "buy") {
    if (!petKey) {
      return m.reply(`¿Qué clase de adopción te gustaría?😂\nEjemplo:\`${m.prefix}petshop buy cat\``);
    }

    if (user.rpg.pet) {
      return m.reply(`¡Tienes una mascota!😭\nDeja ir a tu antigua mascota o prueba el sistema de matrimonio cruzado.\`. rompiendo\`).`);
    }

    const petToBuy = PETS_FOR_SALE[petKey];
    if (!petToBuy) {
      return m.reply(`Lo siento hermano, el genio está vacío o un ladrón está vendiendo aquí!❌\nVerifique la lista de nuevo,\`${m.prefix}petshop\``);
    }

    if ((user.koin || 0) < petToBuy.price) {
      return m.reply(`Aduh uangnya menos aquí crea coste adopsi hermano! 😭\nTotales ordinarios de Rp${petToBuy.price.toLocaleString()}Pero el nombre de mi hermano es Rp${(user.koin || 0).toLocaleString()}`);
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
      `Felicidades!🎉🎉\n\n` +
        `Usted es adoptado oficialmente *${petToBuy.name}*!\n` +
        `💰Coste Adopsi: * Rp-${petToBuy.price.toLocaleString()}*\n\n` +
        `Quiere salir contigo, no olvides comer y comprobar su estado.\`${m.prefix}pet\` ya! 🐾✨`
    );
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

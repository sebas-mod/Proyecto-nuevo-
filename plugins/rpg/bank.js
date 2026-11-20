"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
  name: "bank",
  alias: ["atm", "nabung", "deposit", "tarik", "withdraw"],
  category: "rpg",
  description: "Sistema bancario para almacenar dinero seguro desde la rampaok",
  usage: ".bank <deposit/withdraw> <jumlah>",
  example: ".bank deposit 10000",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const cleanJid = m.sender.replace(/@.+/g, "");

  let user = db.getUser(m.sender);
  if (!user) {
    user = db.setUser(m.sender, {});
  }

  if (!db.db.data.users[cleanJid].rpg) {
    db.db.data.users[cleanJid].rpg = {};
  }
  if (typeof db.db.data.users[cleanJid].rpg.bank !== "number") {
    db.db.data.users[cleanJid].rpg.bank = 0;
  }

  const currentBalance = db.db.data.users[cleanJid].koin || 0;
  const currentBank = db.db.data.users[cleanJid].rpg.bank || 0;

  const args = m.args || [];
  const action = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);
  const amountStr = args[1];

  if (action === "deposit" || action === "depo") {
    let amount = 0;
    if (amountStr === "all") {
      amount = currentBalance;
    } else {
      amount = parseInt(amountStr);
    }

    if (!amount || amount <= 0) return m.reply(`Vamos a la cima😂💸`);
    if (currentBalance < amount) return m.reply(`Eits, vat * efectivo * que canta bastante😭\nEn el lugar couma allí * Rp${currentBalance.toLocaleString("id-ID")}¡Trata de ganar dinero primero!🏃💨`);

    db.db.data.users[cleanJid].koin = currentBalance - amount;
    db.db.data.users[cleanJid].rpg.bank = currentBank + amount;

    await db.save();

    const newBank = db.db.data.users[cleanJid].rpg.bank;
    return m.reply(`¡Gracias por salvarme en RPG Banco!🏦💖\n\n✅Depósito éxitos: * Rp${amount.toLocaleString("id-ID")}*\n💳Tambanan Saldo: * Rp${newBank.toLocaleString("id-ID")}*\n\nEstamos a salvo, estamos a salvo!🔒✨`);
  }

  if (action === "withdraw" || action === "tarik") {
    let amount = 0;
    if (amountStr === "all") {
      amount = currentBank;
    } else {
      amount = parseInt(amountStr);
    }

    if (!amount || amount <= 0) return m.reply(`Vamos al viento😂💸`);
    if (currentBank < amount) return m.reply(`¡Bien hermano, tu saldo de ahorros es suficiente!😭\nEn la cuenta de cuma allí * Rp${currentBank.toLocaleString("id-ID")}¡No te jodas!🫣`);

    db.db.data.users[cleanJid].rpg.bank = currentBank - amount;
    db.db.data.users[cleanJid].koin = currentBalance + amount;

    await db.save();

    const newBalance = db.db.data.users[cleanJid].koin;
    return m.reply(`¡El dinero está en la mesa, hermana!🏧💸\n\n✅Requisitos: * Rp${amount.toLocaleString("id-ID")}*\n💰Efectivo Dinero: * Rp${newBalance.toLocaleString("id-ID")}*\n\nNo derrochador-derrochador pakainya si! 🛍♪✨`);
  }

  let txt = `Hola hermana, bienvenido a RPG Banco!🏦✨\n¿Quieres compobar el equilibrio o algo aí?\n\n`;
  txt += `💰Dinacho de martillo: * Rp${currentBalance.toLocaleString("id-ID")}*\n`;
  txt += `💳Tambanan Saldo: * Rp${currentBank.toLocaleString("id-ID")}*\n\n`;
  txt += `*Layanan Banco:*💁‍♀♪\n`;
  txt += `Ahorrar:\`.banco deposit<jumlah>\`\n`;
  txt += `Retirar tunai:\`.banco withdraw<jumlah>\`\n\n`;
  txt += `*🚀`;

  await m.reply(txt);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

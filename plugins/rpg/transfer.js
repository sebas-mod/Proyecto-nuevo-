"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
  name: "transfer",
  alias: ["tf", "kirim", "pay"],
  category: "rpg",
  description: "Transferir pour or item to another user",
  usage: ".transfer <money/nama_item> <jumlah> @user",
  example: ".transfer money 10000 @tag",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const sender = db.getUser(m.sender);

  const args = m.args || [];
  if (args.length < 3) {
    let txt = `🏦* Banco SENTRAL RPG *🏦\n\n`;
    txt += `Servir la entrega de Tela a Intern @-@ Player Articulo!\n\n`;
    txt += `*Formato Envio:*\n`;
    txt += `👉 \`. transferencia de dinero 10.000 @ usuario\`(Para Monedas)\n`;
    txt += `👉 \`. poción de transferencia 5 @ usuario\`(Para Objeto)\n`;
    return m.reply(txt);
  }

  const type = args[0].toLowerCase();
  const amount = parseInt(args[1]);
  const target = _optionalChain([m, 'access', _ => _.mentionedJid, 'optionalAccess', _2 => _2[0]]) || _optionalChain([m, 'access', _3 => _3.quoted, 'optionalAccess', _4 => _4.sender]);

  if (!target) {
    return m.reply(`¡El jefe es una etiqueta para entregar el plan!📦🔍`);
  }

  if (target === m.sender) {
    return m.reply(`Cortar la transferencia en su propio bolsillo?😂❌`);
  }

  if (!amount || amount <= 0) {
    return m.reply(`Hey jefe, ¿quieres enviar un viento a @-@ arriba?🌬♪`);
  }

  const recipient = db.getUser(target) || db.setUser(target);

  if (type === "money" || type === "balance" || type === "koin") {
    if ((sender.koin || 0) < amount) {
      return m.reply(`Transacción DITOLAK!❌\nSu saldo ATM es suficiente.${(sender.koin || 0).toLocaleString("id-ID")}* Mu TF: * Rp${amount.toLocaleString("id-ID")}* 💸`);
    }

    sender.koin -= amount;
    recipient.koin = (recipient.koin || 0) + amount;

    db.setUser(m.sender, sender);
    db.setUser(target, recipient);
    db.save();
    
    let txt = `💸* TRANSFERENCIA Ex¡Ito!💸\n\n`;
    txt += `El Banco Sentral ha enviado a Dana:\n`;
    txt += `💳 Nominal: *Rp ${amount.toLocaleString("id-ID")}*\n`;
    txt += `👤 Penerima: @${target.split("@")[0]}\n\n`;
    txt += `¡Gracias por utilizar el servicio de Bork!🏦✨`;

    return m.reply(txt, { mentions: [target] });
  } else {
    sender.inventory = sender.inventory || {};
    recipient.inventory = recipient.inventory || {};

    if ((sender.inventory[type] || 0) < amount) {
      return m.reply(`Paquete falló en el procesamiento!❌\nArticulo *${type}* En el granero te cuma allí *${sender.inventory[type] || 0}Quieres enviar${amount}* darimana? 📦`);
    }

    sender.inventory[type] -= amount;
    recipient.inventory[type] = (recipient.inventory[type] || 0) + amount;

    db.setUser(m.sender, sender);
    db.setUser(target, recipient);
    db.save();

    let txt = `📦> 91; ¡Pongamos los pantalones!📦\n\n`;
    txt += `Kurir logró entregar a los otros:\n`;
    txt += `🎁Lisi Pakeet: *${type}* (x${amount})\n`;
    txt += `👤 Penerima: @${target.split("@")[0]}\n\n`;
    txt += `> _"Paquete Pakeeetttt!!" - Kurir Bot_ 🛵💨`;

    return m.reply(txt, { mentions: [target] });
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _tempmailjs = require('../../src/scraper/tempmail.js');

const pluginConfig = {
  name: "tempmail",
  alias: ["tmpmail", "tmp", "trashmail"],
  category: "tools",
  description: "Buat email sementara & cek inbox",
  usage: ".tempmail create/inbox",
  example: ".tempmail create",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const option = _optionalChain([m, 'access', _ => _.text, 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3(), 'optionalAccess', _4 => _4.trim, 'call', _5 => _5()]);

  if (!option) {
    const saved = _optionalChain([db, 'access', _6 => _6.getUser, 'call', _7 => _7(m.sender), 'optionalAccess', _8 => _8.tempmail]);
    return m.reply(
      `📧 *Temp Mail*\n\n` +
        `Un campo de correo electrónico temporal que se puede enviar a usted.—fit crear una lista de cuentas sin el correo original.\n\n` +
        `*Uso:*\n` +
        `> *${m.prefix}tempmail crear *—Bikinis nuevo correo electrónico\n` +
        `> *${m.prefix}tempmail tempmailx*—Compruebe los mensajes entrantes\n\n` +
        (saved
          ? `Awish on correo: *${saved}*\n`
          : `*Tienes un correo, amigo*${m.prefix}tempmail create* dulu\n`) +
        `\nEstos correos electrónicos son un poco pervertidos, se puede perder a cualquier precio.`
    );
  }

  if (option === "create") {
    m.react("🕕");
    const result = await _tempmailjs.TempMailCreate.call(void 0, );

    if (!result.status) {
      m.react("☢");
      return m.reply(`❌*Agencia de correo electrónico de Fierce Bicin*\n\n♪${result.error}`);
    }

    const userData = db.getUser(m.sender) || {};
    userData.tempmail = result.email;
    db.setUser(m.sender, userData);

    m.react("✅");
    return m.reply(
      `📧* Correo electrónico de Aminal hecho!\n\n` +
        `♪📬Correo: *${result.email}*\n\n` +
        `Ahora puede utilizar este correo electrónico para hacer una lista de cualquier cosa.\n` +
        `Ver mensajes entrantes con *${m.prefix}tempmail inbox*\n\n` +
        `Este correo electrónico es para el registro, no lo utilice por razones importantes.`
    );
  }

  if (option === "inbox") {
    const saved = _optionalChain([db, 'access', _9 => _9.getUser, 'call', _10 => _10(m.sender), 'optionalAccess', _11 => _11.tempmail]);
    if (!saved) {
      m.react("❌");
      return m.reply(
        `❌* There 's emailed eels *\n\n` +
          `No ha podido enviar un correo electrónico en un tiempo.\n` +
          `Escribe *${m.prefix}tempmail create* antes.`
      );
    }

    m.react("🕕");
    const result = await _tempmailjs.TempMailInbox.call(void 0, saved);

    if (!result.status) {
      m.react("☢");
      return m.reply(`❌* Stenched Inbo Choksx*\n\n♪${result.error}`);
    }

    if (result.count === 0) {
      m.react("📭");
      return m.reply(
        `📭* InboxVacio*\n\n` +
          `Correos: *${saved}*\n\n` +
          `Le daré un mensaje más tarde.`
      );
    }

    let txt = `📬 *Inbox — ${result.count}Mensaje*\n\n`;
    txt += `Correos: *${saved}*\n\n`;

    for (const msg of result.messages) {
      txt += `*━━━━━━━━━━━━━━━━━━━━*\n`;
      txt += `♪📧De: *${msg.from}*\n`;
      txt += `> 📌 Subjek: *${msg.subject}*\n`;
      txt += `> 🕐 ${msg.created_at}\n`;
      txt += `> 📝 ${_optionalChain([msg, 'access', _12 => _12.body_text, 'optionalAccess', _13 => _13.substring, 'call', _14 => _14(0, 500)]) || "(tidak ada isi)"}\n\n`;
    }

    m.react("✅");
    return m.reply(txt.trim());
  }

  return m.reply(
    `❌Opsi inválido\n\n*Uso*${m.prefix}tempmail crear * o *${m.prefix}tempmail inbox*`
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

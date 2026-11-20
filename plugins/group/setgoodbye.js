"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
  name: "setgoodbye",
  alias: ["customgoodbye"],
  category: "group",
  description: "Set custom goodbye message",
  usage: ".setgoodbye <pesan>",
  example: ".setgoodbye Bye {user}, sampai jumpa lagi!",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  isAdmin: true,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const text = m.text || m.args.join(" ");

  if (!text) {
    return m.reply(
      `📝 *sᴇᴛ ɢᴏᴏᴅʙʏᴇ*\n\n` +
        `╭┈┈⬡「 📋 *ᴘʟᴀᴄᴇʜᴏʟᴅᴇʀ* 」\n` +
        `┃ ◦ \`{user}\`- El nombre del miembro\n` +
        `┃ ◦ \`{number}\`- Número\n` +
        `┃ ◦ \`{group}\`- Nombre del grupo\n` +
        `┃ ◦ \`{desc}\`- Decryption grup\n` +
        `┃ ◦ \`{count}\`- Por favor.\n` +
        `┃ ◦ \`{owner}\`- El nombre del propietario es grup\n` +
        `┃ ◦ \`{date}\`- Fecha (D/MMM / YYYY)\n` +
        `┃ ◦ \`{time}\`- Hora (HH: mm Walume )\n` +
        `┃ ◦ \`{day}\`- Día ( Lunes, ensalada, dll )\n` +
        `┃ ◦ \`{bot}\`- El nombre del bot.\n` +
        `┃ ◦ \`{prefix}\` - Prefix bot\n` +
        `╰┈┈⬡\n\n` +
        `\`Contoh:\`\n` +
        `\`${m.prefix}setgoodbye Bye {user}! 👋\`\n` +
        `\`Hasta el final del día{day}.{date}\``,
    );
  }

  db.setGroup(m.chat, { goodbyeMsg: text, goodbye: true, leave: true });
  db.save();

  m.react("✅");

  await m.reply(
    `✅Adiós manejado en el set para ser *${text}*\n¿Quieres restablecerte?${m.prefix}resetgoodbye`,
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

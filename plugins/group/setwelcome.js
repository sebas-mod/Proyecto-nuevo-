"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
const pluginConfig = {
  name: "setwelcome",
  alias: ["customwelcome"],
  category: "group",
  description: "Set custom welcome message",
  usage: ".setwelcome <pesan>",
  example: ".setwelcome Halo {user}, selamat datang di {group}!",
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
  const text = _optionalChain([m, 'access', _ => _.fullArgs, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]) || m.args.join(" ");

  if (!text) {
    return m.reply(
      `📝 *sᴇᴛ ᴡᴇʟᴄᴏᴍᴇ*\n\n` +
        `╭┈┈⬡「 📋 *ᴘʟᴀᴄᴇʜᴏʟᴅᴇʀ* 」\n` +
        `┃ ◦ \`{user}\`- El nombre del miembro\n` +
        `┃ ◦ \`{number}\`- Número\n` +
        `┃ ◦ \`{group}\`- Nombre del grupo\n` +
        `┃ ◦ \`{desc}\`- Decryption grup\n` +
        `┃ ◦ \`{count}\`- Ve a la cima.\n` +
        `┃ ◦ \`{owner}\`- El nombre del propietario es grup\n` +
        `┃ ◦ \`{date}\`- Fecha (D/MMM / YYYY)\n` +
        `┃ ◦ \`{time}\`- Hora (HH: mm Walume )\n` +
        `┃ ◦ \`{day}\`- Día ( Lunes, ensalada, dll )\n` +
        `┃ ◦ \`{bot}\`- El nombre del bot.\n` +
        `┃ ◦ \`{prefix}\` - Prefix bot\n` +
        `╰┈┈⬡\n\n` +
        `\`Contoh:\`\n` +
        `\`${m.prefix}setwelcome Hola{user}!👋\`\n` +
        `\`Bienvenido a {group} en {day}.{date}\``,
    );
  }

  db.setGroup(m.chat, { welcomeMsg: text, welcome: true });
  db.save();

  m.react("✅");

  await m.reply(
    `✅Welcomme manejado en conjunto para ser *${text}*\n¿Quieres restablecerte?${m.prefix}resetwelcome`,
  );
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

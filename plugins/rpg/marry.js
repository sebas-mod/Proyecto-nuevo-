"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
  name: "marry",
  alias: ["nikah", "wedding", "propose"],
  category: "rpg",
  description: "Menikahi player lain",
  usage: ".marry @user",
  example: ".marry @user",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 60,
  energi: 0,
  isEnabled: true,
};

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  const target = _optionalChain([m, 'access', _ => _.mentionedJid, 'optionalAccess', _2 => _2[0]]) || _optionalChain([m, 'access', _3 => _3.quoted, 'optionalAccess', _4 => _4.sender]);

  if (!target) {
    let txt = `💒* CATATES SIPIL RPG ]💒\n\n`;
    txt += `¿Quieres proponerle a un hombre?\n\n`;
    txt += `*Cara Melamar:*\n`;
    txt += `👉 \`${m.prefix}marry @user\`\n\n`;
    txt += `*Requisito:*\n`;
    txt += `💍Coste Nikah: * Rp 50. 000 *\n`;
    txt += `(Asegúrese de que todavía no tiene un socio! )`;
    return m.reply(txt);
  }

  if (target === m.sender) {
    return m.reply(`" ¿Quieres casarte? " Busca es el alma del niño. "😭💔`);
  }

  const partner = db.getUser(target) || db.setUser(target);
  if (!partner.rpg) partner.rpg = {};

  if (user.rpg.spouse) {
    return m.reply(`HEH! Lu ya tener pasangan si @${user.rpg.spouse.split("@")[0]}!\n¿Quieres un poco de poligami?\`Divorcio.\` 😡🔪`, { mentions: [user.rpg.spouse] });
  }

  if (partner.rpg.spouse) {
    return m.reply(`El interruptor no sangró.🥀\n@${target.split("@")[0]}¡Es sobre casarse con alguien más!\nSus pasos se detienen en la zona de amigos.`, { mentions: [target] });
  }

  const marriageCost = 50000;
  if ((user.koin || 0) < marriageCost) {
    return m.reply(`Dios mío.¿¿Cómo te lanzas a casarte conmigo?🤦‍♂♪\nCoste KUA y catering. 50, pero dinero lu cuma * Rp${(user.koin || 0).toLocaleString("id-ID")}*.\nTrabajar duro primero`);
  }

  user.koin -= marriageCost;
  user.rpg.spouse = target;
  user.rpg.marriedAt = Date.now();
  partner.rpg.spouse = m.sender;
  partner.rpg.marriedAt = Date.now();

  db.save();

  await m.react("💍");

  let txt = `💒*Anuncio PERNIKAHAN!!*💒\n\n`;
  txt += `Un servidor @-@ monitor saluda a:\n\n`;
  txt += `👨‍💼/👰 @${m.sender.split("@")[0]}\n`;
  txt += `           💖con💖\n`;
  txt += `👨‍💼/👰 @${target.split("@")[0]}\n\n`;
  txt += `🎉* Oficial REALIZADO EN PASHAN! ]🎉\n\n`;
  txt += `💍Coste Reception: * Rp -${marriageCost.toLocaleString("id-ID")}*\n\n`;
  txt += `- Ejecución botánica🥺💕`;

  await m.reply(txt, { mentions: [m.sender, target] });
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

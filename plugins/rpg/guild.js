"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');

const pluginConfig = {
  name: "guild",
  alias: ["clan", "team", "kelompok"],
  category: "rpg",
  description: "Sistem guild/clan",
  usage: ".guild <create/join/leave/info>",
  example: ".guild create DragonSlayers",
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const user = db.getUser(m.sender);

  if (!user.rpg) user.rpg = {};

  const args = m.args || [];
  const action = _optionalChain([args, 'access', _ => _[0], 'optionalAccess', _2 => _2.toLowerCase, 'call', _3 => _3()]);
  const guildName = args.slice(1).join(" ");

  const guilds = _optionalChain([db, 'access', _4 => _4.db, 'optionalAccess', _5 => _5.data, 'optionalAccess', _6 => _6.guilds]) || {};

  if (!action || !["create", "join", "leave", "info", "list", "members", "deposit"].includes(action)) {
    let txt = `🏰 *SERIKAT GUILD RPG* 🏰\n\n`;
    txt += `¡Levántate o ponte en una puta fila para conseguir tus malditos amigos!\n\n`;
    txt += `*Lista de comandos:*\n`;
    txt += `🗡️ \`${m.prefix}guild create <nama>\` (Bikin Guild)\n`;
    txt += `🛡️ \`${m.prefix}guild join <nama>\`(Unirse Guild)\n`;
    txt += `🏃 \`${m.prefix}licencia de gremio\`(Salir Guild)\n`;
    txt += `📜 \`${m.prefix}guild info\`( Chequear Stats Gushed )\n`;
    txt += `👥 \`${m.prefix}pelucas de gremio\`(Comprueba Miembro)\n`;
    txt += `💰 \`${m.prefix}depósito de gremio<amount>\`(Donación Kas)\n`;
    txt += `🏆 \`${m.prefix}guild list\` (Top Guilds)\n\n`;

    if (user.rpg.guildId) {
      const myGuild = guilds[user.rpg.guildId];
      txt += `📌 Status: Tergabung di *${_optionalChain([myGuild, 'optionalAccess', _7 => _7.name]) || "Unknown"}*`;
    } else {
      txt += `📌Estado: * El Jombo Guid ( Kagak Tener Temen ) *`;
    }
    return m.reply(txt);
  }

  if (action === "list") {
    const guildList = Object.values(guilds);
    if (guildList.length === 0) {
      return m.reply(`¡Hay un gremio en este servidor!\`${m.prefix}guild create <nama>\``);
    }

    let txt = `🏆* Registrate TOP GUILD*🏆\n\n`;
    for (const g of guildList.slice(0, 10)) {
      txt += `🏰 *${g.name}* (Lv. ${g.level || 1})\n`;
      txt += `👥 Member: ${_optionalChain([g, 'access', _8 => _8.members, 'optionalAccess', _9 => _9.length]) || 0}/50\n`;
      txt += `💰 Kas Kasir: Rp ${(g.treasury || 0).toLocaleString()}\n`;
      txt += `──────────────\n`;
    }
    return m.reply(txt);
  }

  if (action === "create") {
    if (user.rpg.guildId) {
      return m.reply(`¡Déjalo ahí si quieres comprar nuevos!`);
    }

    if (!guildName || guildName.length < 3) {
      return m.reply(`Nombre de un gremio mínimo * 3 letra * jefe!`);
    }

    if (guildName.length > 20) {
      return m.reply(`¡El nombre de un gremio representa 20 tops!`);
    }

    const existingGuild = Object.values(guilds).find((g) => g.name.toLowerCase() === guildName.toLowerCase());
    if (existingGuild) {
      return m.reply(`Bueno, nombre...${guildName}¡Encuentra un nombre más fresco!`);
    }

    const createCost = 10000;
    if ((user.koin || 0) < createCost) {
      return m.reply(`¿Miskin mait quiere ser una reina?`);
    }

    user.koin -= createCost;

    const guildId = `guild_${Date.now()}`;
    if (!db.db.data.guilds) db.db.data.guilds = {};

    db.db.data.guilds[guildId] = {
      id: guildId,
      name: guildName,
      leader: m.sender,
      members: [m.sender],
      treasury: 0,
      level: 1,
      exp: 0,
      createdAt: Date.now(),
    };

    user.rpg.guildId = guildId;
    db.save();

    let txt = `🎉* GUILD Oficial WENT!🎉\n\n`;
    txt += `Nombre de papá *${guildName}* ha sido puesto en el nuevo mercado!\n\n`;
    txt += `👑Lider: @${m.sender.split("@")[0]}\n`;
    txt += `💸Coste build: * - Rp${createCost.toLocaleString()}*\n\n`;
    txt += `* Dile a tus amigos que paguen por ello*\`- La culpa se une.${guildName}\`!_`;

    return m.reply(txt, { mentions: [m.sender] });
  }

  if (action === "join") {
    if (user.rpg.guildId) {
      return m.reply(`¡Tienes un grupo de chicos!`);
    }

    if (!guildName) {
      return m.reply(`¡La palabra " gremio " que quiere ser ingresada!\nEjemplo:\`${m.prefix}guild join DragonSlayers\``);
    }

    const targetGuild = Object.values(guilds).find((g) => g.name.toLowerCase() === guildName.toLowerCase());
    if (!targetGuild) {
      return m.reply(`Guild *${guildName}Typo @-@ san, ¿cuál es tu problema?`);
    }

    if (_optionalChain([targetGuild, 'access', _10 => _10.members, 'optionalAccess', _11 => _11.length]) >= 50) {
      return m.reply(`Lo siento hermano, Markas capacidad de gremio *${targetGuild.name}* ya full ( 50 / 50 )!`);
    }

    targetGuild.members = targetGuild.members || [];
    targetGuild.members.push(m.sender);
    user.rpg.guildId = targetGuild.id;
    db.save();

    return m.reply(`✅Lu es ahora miembro del gremio.${targetGuild.name}*! ⚔️`);
  }

  if (action === "leave") {
    if (!user.rpg.guildId) {
      return m.reply(`¿No has estado en un gremio en ningún lugar, quieres irte?😂`);
    }

    const myGuild = guilds[user.rpg.guildId];
    if (!myGuild) {
      user.rpg.guildId = null;
      db.save();
      return m.reply(`Te llenó mucho o a - * eliminar *. datos hasta @-@ restablecer.`);
    }

    if (myGuild.leader === m.sender && _optionalChain([myGuild, 'access', _12 => _12.members, 'optionalAccess', _13 => _13.length]) > 1) {
      return m.reply(`¿Quieres dejar a un miembro del equipo?😡`);
    }

    myGuild.members = (myGuild.members || []).filter((m) => m !== m.sender);

    if (myGuild.members.length === 0) {
      delete guilds[user.rpg.guildId];
    }

    const guildName = myGuild.name;
    user.rpg.guildId = null;
    db.save();

    return m.reply(`🏃Usted es el debacle del mercado${guildName}* y volver a ser un ronin sin un tuan!`);
  }

  if (action === "info") {
    if (!user.rpg.guildId) {
      return m.reply(`Lu no tener guild bos! Busca temen sana!`);
    }

    const myGuild = guilds[user.rpg.guildId];
    if (!myGuild) {
      return m.reply(`¡Los huéspedes no se encuentran!`);
    }

    let txt = `🏰* PAPANIA INFO GUILD *🏰\n\n`;
    txt += `👑Nombre: *${myGuild.name}*\n`;
    txt += `👤 Leader: @${_optionalChain([myGuild, 'access', _14 => _14.leader, 'optionalAccess', _15 => _15.split, 'call', _16 => _16("@"), 'access', _17 => _17[0]])}\n`;
    txt += `📊 Level: *${myGuild.level || 1}*\n`;
    txt += `👥Miembro: *${_optionalChain([myGuild, 'access', _18 => _18.members, 'optionalAccess', _19 => _19.length]) || 0}/50*\n`;
    txt += `💰Dinero${(myGuild.treasury || 0).toLocaleString()}*\n`;

    return m.reply(txt, { mentions: [myGuild.leader] });
  }

  if (action === "members") {
    if (!user.rpg.guildId) {
      return m.reply(`Cieee No tiene gremio..`);
    }

    const myGuild = guilds[user.rpg.guildId];
    if (!myGuild) {
      return m.reply(`¡Los huéspedes no se encuentran!`);
    }

    const memberList = (myGuild.members || [])
      .map((m, i) => {
        const isLeader = m === myGuild.leader ? " 👑" : " 🗡️";
        return `${i + 1}. @${m.split("@")[0]}${isLeader}`;
      })
      .join("\n");

    return m.reply(`👥*Registrate Miembro${myGuild.name}*\n\n${memberList}`, { mentions: myGuild.members });
  }

  if (action === "deposit") {
    if (!user.rpg.guildId) {
      return m.reply(`¿Dónde quieres donar?`);
    }

    const myGuild = guilds[user.rpg.guildId];
    if (!myGuild) {
      return m.reply(`¡Los huéspedes no se encuentran!`);
    }

    const amount = parseInt(args[1]) || 0;
    if (amount < 100) {
      return m.reply(`¡Al menos el dinero vale 100 dólares!`);
    }

    if ((user.koin || 0) < amount) {
      return m.reply(`¡Eres un poco corto para una donación!`);
    }

    user.koin -= amount;
    myGuild.treasury = (myGuild.treasury || 0) + amount;
    db.save();

    return m.reply(`✅(Explosiones de donación de alta calidad )\n\nAcabas de entrar.${amount.toLocaleString()}¡A la caja fuerte de Guid!\nTOTAL Ahora: * Rp${myGuild.treasury.toLocaleString()}* 🏰💰`);
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

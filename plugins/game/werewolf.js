"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
/**
*🐺WEREWOLF GAME
* Juegos de deducción de la sociedad para WhatsApp
 *
 * Based on reference: RTXZY-MD-pro/lib/werewolf.js
 * Enhanced for OurinAI
 */
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
  name: "werewolf",
  alias: ["ww", "wwgc"],
  category: "game",
  description: "Main Werewolf Game bersama player lain",
  usage: ".ww <create|join|start|vote|player|exit|delete>",
  example: ".ww create",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

if (!global.werewolfGames) global.werewolfGames = {};

let thumbWW = null;
let thumbNight = null;
let thumbDay = null;
let thumbWin = null;

try {
  const assetsPath = _path2.default.join(process.cwd(), "assets", "images");
  if (_fs2.default.existsSync(_path2.default.join(assetsPath, "ourin-games.jpg"))) {
    thumbWW = _fs2.default.readFileSync(_path2.default.join(assetsPath, "ourin-games.jpg"));
  }
  if (_fs2.default.existsSync(_path2.default.join(assetsPath, "ourin.jpg"))) {
    thumbNight = _fs2.default.readFileSync(_path2.default.join(assetsPath, "ourin.jpg"));
    thumbDay = _fs2.default.readFileSync(_path2.default.join(assetsPath, "ourin.jpg"));
  }
  if (_fs2.default.existsSync(_path2.default.join(assetsPath, "ourin-winner.jpg"))) {
    thumbWin = _fs2.default.readFileSync(_path2.default.join(assetsPath, "ourin-winner.jpg"));
  }
} catch (e) {
  console.log("[WW] Failed to load thumbnails:", e.message);
}

const ROLES = {
  werewolf: {
    emoji: "🐺",
    name: "Werewolf",
    team: "wolf",
    desc: "Bunuh warga tiap malam",
  },
  seer: {
    emoji: "🔮",
    name: "Seer",
    team: "village",
    desc: "Lihat role player tiap malam",
  },
  guardian: {
    emoji: "🛡️",
    name: "Guardian",
    team: "village",
    desc: "Lindungi player tiap malam",
  },
  sorcerer: {
    emoji: "🧙",
    name: "Sorcerer",
    team: "wolf",
    desc: "Busca sabe quién es Seer",
  },
  villager: {
    emoji: "👨‍🌾",
    name: "Villager",
    team: "village",
    desc: "Debate y votación de hombres lobo",
  },
};

const WIN_REWARD = { koin: 5000, exp: 1000 };
const MIN_PLAYERS = 4;
const MAX_PLAYERS = 15;
const PHASE_DURATION = {
  night: 60000, // 60 seconds
  day: 90000, // 90 seconds
};

function wwCtx(mentions) {
  const saluranId = _optionalChain([_configjs2.default, 'access', _ => _.saluran, 'optionalAccess', _2 => _2.id]) || "120363400911374213@newsletter";
  const saluranName = _optionalChain([_configjs2.default, 'access', _3 => _3.saluran, 'optionalAccess', _4 => _4.name]) || _optionalChain([_configjs2.default, 'access', _5 => _5.bot, 'optionalAccess', _6 => _6.name]) || "Ourin-AI";
  return {
    forwardingScore: 9999,
    isForwarded: true,
    mentionedJid: mentions,
    forwardedNewsletterMessageInfo: {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: 127,
    },
  };
}

async function sendWW(sock, jid, text, title, body, thumbBuffer, mentions) {
  const msgId = await sock.sendPreview(
    jid,
    {
      caption: `${_configjs2.default.info.website} ${text}`,
      url: `${_configjs2.default.info.website}`,
      title: title || "🐺 WEREWOLF",
      description: body || "Social deduction game!",
      jpegThumbnail: thumbBuffer || thumbWW,
      previewType: 0,
    },
    { contextInfo: wwCtx(mentions) },
  );
  return { key: { id: msgId, remoteJid: jid, fromMe: true } };
}

// Generate roles based on player count
function generateRoles(playerCount) {
  const roles = [];

  // Role distribution based on player count (from reference)
  if (playerCount === 4) {
    roles.push("werewolf", "seer", "guardian", "villager");
  } else if (playerCount === 5) {
    roles.push("werewolf", "seer", "guardian", "villager", "villager");
  } else if (playerCount === 6) {
    roles.push(
      "werewolf",
      "werewolf",
      "seer",
      "guardian",
      "villager",
      "villager",
    );
  } else if (playerCount === 7) {
    roles.push(
      "werewolf",
      "werewolf",
      "seer",
      "guardian",
      "villager",
      "villager",
      "villager",
    );
  } else if (playerCount === 8) {
    roles.push(
      "werewolf",
      "werewolf",
      "seer",
      "guardian",
      "villager",
      "villager",
      "villager",
      "villager",
    );
  } else if (playerCount === 9) {
    roles.push(
      "werewolf",
      "werewolf",
      "seer",
      "guardian",
      "sorcerer",
      "villager",
      "villager",
      "villager",
      "villager",
    );
  } else if (playerCount === 10) {
    roles.push(
      "werewolf",
      "werewolf",
      "seer",
      "guardian",
      "sorcerer",
      "villager",
      "villager",
      "villager",
      "villager",
      "villager",
    );
  } else if (playerCount === 11) {
    roles.push(
      "werewolf",
      "werewolf",
      "seer",
      "guardian",
      "guardian",
      "sorcerer",
      "villager",
      "villager",
      "villager",
      "villager",
      "villager",
    );
  } else if (playerCount >= 12) {
    roles.push(
      "werewolf",
      "werewolf",
      "seer",
      "guardian",
      "guardian",
      "sorcerer",
    );
    while (roles.length < playerCount) roles.push("villager");
  }

  // Shuffle roles
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }

  return roles;
}

// Get role description for PM
function getRoleDescription(role, prefix = ".") {
  const descriptions = {
    werewolf:
      `🐺 *WEREWOLF*\n\n` +
      `¡Eres un depredador nocturno!\n\n` +
      `╭┈┈⬡「 📋INFO」\n` +
      `┃ 🎯Siete: Bunuh todos los Village\n` +
      `┃ ⚔️ Skill: Bunuh 1 player cada noche\n` +
      `┃ 🕐Acciones: Día Noche\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `- Por la noche, amigo:\n` +
      `> \`${prefix}wnkill<nomor>\`En el bot de PM`,
    seer:
      `🔮 *SEER*\n\n` +
      `¡Puedes ver al identitario!\n\n` +
      `╭┈┈⬡「 📋INFO」\n` +
      `┃ 🎯Siete: Ayuda Villager\n` +
      `┃ 🔮Mira, es un primer @-@ player.\n` +
      `┃ 🕐Acciones: Día Noche\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `- Por la noche, amigo:\n` +
      `> \`${prefix}wsee<nomor>\`En el bot de PM`,
    guardian:
      `🛡️ *GUARDIAN*\n\n` +
      `¡Puedes proteger al jugador!\n\n` +
      `╭┈┈⬡「 📋INFO」\n` +
      `┃ 🎯Destino: Proteger el pueblo\n` +
      `┃ 🛡Habilidades: Proteger 1 jugador\n` +
      `┃ 🕐Acciones: Día Noche\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `- Por la noche, amigo:\n` +
      `> \`${prefix}wyprotect<nomor>\`En el bot de PM`,
    sorcerer:
      `🧙 *SORCERER*\n\n` +
      `¡Eres un hombre lobo!\n\n` +
      `╭┈┈⬡「 📋INFO」\n` +
      `┃ 🎯Siete: Werewolf ayuda gana\n` +
      `┃ 🔍Habilidades: Compruebe si el objetivo es Ser\n` +
      `┃ 🕐Acciones: Día Noche\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `- Por la noche, amigo:\n` +
      `> \`${prefix}wssorcerer<nomor>\`En el bot de PM`,
    villager:
      `👨‍🌾 *VILLAGER*\n\n` +
      `¡Eres ciudadano común!\n\n` +
      `╭┈┈⬡「 📋INFO」\n` +
      `┃ 🎯 Tujuan: Temukan Werewolf\n` +
      `┃ 🗳Votar por la tarde\n` +
      `┃ 🕐 Aksi: Mediodia el\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `¡Discuten y voten hombres lobos!\n` +
      `> \`${prefix}ww vote<nomor>\`en el grupo`,
  };
  return descriptions[role] || "Unknown Role";
}

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const args = m.args || [];
  const action = _optionalChain([args, 'access', _7 => _7[0], 'optionalAccess', _8 => _8.toLowerCase, 'call', _9 => _9()]);
  const target = args[1];
  const ww = global.werewolfGames;
  const prefix = m.prefix || _optionalChain([_configjs2.default, 'access', _10 => _10.command, 'optionalAccess', _11 => _11.prefix]) || ".";

  const commands = {
    create: async () => {
      if (ww[m.chat]) {
        const game = ww[m.chat];
        if (game.status === "waiting") {
          return m.reply(
            `❌* ROVE THE HUSBAND THERE *\n\n` +
              `Room todavía está esperando al jugador\n` +
              `Escribe\`${prefix}ww ensamblar\`para unirse\n` +
              `Host: @${game.owner.split("@")[0]}`,
            { mentions: [game.owner] },
          );
        }
        return m.reply(`❌Estoy esperando hasta que termine.`);
      }

      // Check if player already in another room
      const existingRoom = Object.entries(ww).find(([chatId, room]) =>
        room.players.some((p) => p.id === m.sender),
      );
      if (existingRoom) {
        return m.reply(`❌¡Todavía estás en el juego del otro grupo!`);
      }

      //Crear nueva sala de juego
      ww[m.chat] = {
        room: m.chat,
        owner: m.sender,
        status: "waiting",
        day: 0,
        phase: "lobby",
        players: [
          {
            id: m.sender,
            number: 1,
            role: null,
            alive: true,
            voted: false,
            skillUsed: false,
          },
        ],
        dead: [],
        votes: {},
        nightActions: {
          kill: null,
          protect: null,
          see: null,
          sorcerer: null,
        },
        createdAt: Date.now(),
        timeout: null,
      };

      await m.react("🐺");
      await m.reply(
        `🐺 *WEREWOLF GAME*\n\n` +
          `¡La habitación logró hacerlo!\n\n` +
          `╭┈┈⬡「 📋91; INFO ROWK」\n` +
          `┃ 👑 Host: @${m.sender.split("@")[0]}\n` +
          `┃ 👥 Player: 1/${MAX_PLAYERS}\n` +
          `┃ ⏱️ Min: ${MIN_PLAYERS} player\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `╭┈┈⬡「 🎮*CARA Juega*」\n` +
          `┃ ➕ \`${prefix}ww join\` - Gabung\n` +
          `┃ ▶️ \`${prefix}ww start\`- Starai ( host )\n` +
          `┃ 👥 \`${prefix}ww player\` - List player\n` +
          `┃ 🚪 \`${prefix}ww exit\` - Keluar\n` +
          `╰┈┈┈┈┈┈┈┈⬡`,
        { mentions: [m.sender] },
      );
    },

    join: async () => {
      if (!ww[m.chat]) {
        return m.reply(
          `❌¡Hay una habitación!\n> Escribe\`${prefix}ww crear\`para hacer una habitación`,
        );
      }

      if (ww[m.chat].status !== "waiting") {
        return m.reply(`❌¡El juego está encendido!`);
      }

      if (ww[m.chat].players.length >= MAX_PLAYERS) {
        return m.reply(`❌¡La habitación llena!x ${MAX_PLAYERS} player)`);
      }

      if (ww[m.chat].players.some((p) => p.id === m.sender)) {
        return m.reply(`❌¡Estás dentro!`);
      }

      const existingRoom = Object.entries(ww).find(
        ([chatId, room]) =>
          chatId !== m.chat && room.players.some((p) => p.id === m.sender),
      );
      if (existingRoom) {
        return m.reply(`❌¡Todavía estás en el juego del otro grupo!`);
      }

      ww[m.chat].players.push({
        id: m.sender,
        number: ww[m.chat].players.length + 1,
        role: null,
        alive: true,
        voted: false,
        skillUsed: false,
      });

      const playerList = ww[m.chat].players
        .map((p, i) => `${i + 1}. @${p.id.split("@")[0]}`)
        .join("\n");

      const canStart = ww[m.chat].players.length >= MIN_PLAYERS;

      await m.react("✅");
      await m.reply(
        `✅*PLAYER Unirse*\n\n` +
          `@${m.sender.split("@")[0]}entrar!\n\n` +
          `╭┈┈⬡「 👥 *PLAYER LIST* 」\n` +
          `${playerList
            .split("\n")
            .map((l) => `┃ ${l}`)
            .join("\n")}\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `Total: ${ww[m.chat].players.length}/${MIN_PLAYERS} (min)\n` +
          (canStart
            ? `✅Puede empieza!\`${prefix}ww start\``
            : `🕕Necesito${MIN_PLAYERS - ww[m.chat].players.length}player otra vez`),
        { mentions: ww[m.chat].players.map((p) => p.id) },
      );
    },

    start: async () => {
      if (!ww[m.chat]) {
        return m.reply(`❌¡Hay una habitación!`);
      }

      if (ww[m.chat].status !== "waiting") {
        return m.reply(`❌¡El juego está en movimiento!`);
      }

      if (ww[m.chat].owner !== m.sender && !_optionalChain([_configjs2.default, 'access', _12 => _12.isOwner, 'optionalCall', _13 => _13(m.sender)])) {
        return m.reply(`❌¡Sólo los anfitriones pueden cantar juego!`);
      }

      if (ww[m.chat].players.length < MIN_PLAYERS) {
        return m.reply(
          `❌ Minimal ${MIN_PLAYERS}¡Jugador!\nAquí hay un presente:${ww[m.chat].players.length} player`,
        );
      }

      // Generate and assign roles
      const roles = generateRoles(ww[m.chat].players.length);
      ww[m.chat].players.forEach((p, i) => {
        p.role = roles[i];
      });

      ww[m.chat].status = "playing";
      ww[m.chat].day = 1;
      ww[m.chat].phase = "night";

      // Send role to each player via PM
      for (const player of ww[m.chat].players) {
        try {
          await sendWW(
            sock,
            player.id,
            getRoleDescription(player.role, prefix),
            `${ROLES[player.role].emoji} ${ROLES[player.role].name}`,
            "Role tu!",
          );
        } catch (e) {
          console.log(`[WW] Failed to send role to ${player.id}:`, e.message);
        }
      }

      // Build player list
      const playerList = ww[m.chat].players
        .map((p, i) => `${i + 1}. @${p.id.split("@")[0]}`)
        .join("\n");

      // Count roles
      const roleCount = {};
      ww[m.chat].players.forEach((p) => {
        roleCount[p.role] = (roleCount[p.role] || 0) + 1;
      });
      const roleInfo = Object.entries(roleCount)
        .map(
          ([role, count]) =>
            `${ROLES[role].emoji} ${ROLES[role].name}: ${count}`,
        )
        .join("\n");

      await m.react("🌙");
      await m.reply(
        `🐺# 91 # # GAME STARTs # 93 #\n\n` +
          `🌙* Noche Day - 1 *\n\n` +
          `╭┈┈⬡「 👥 *PLAYERS* 」\n` +
          `${playerList
            .split("\n")
            .map((l) => `┃ ${l}`)
            .join("\n")}\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `╭┈┈⬡「 🎭 *ROLES* 」\n` +
          `${roleInfo
            .split("\n")
            .map((l) => `┃ ${l}`)
            .join("\n")}\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `📩¡Microsoft Chequea por el papel de Kayan!\n` +
          `🌙 Werewolf berburu...\n` +
          `⏱Hora de la noche:${PHASE_DURATION.night / 1000}segundo`,
        { mentions: ww[m.chat].players.map((p) => p.id) },
      );

      // Send night skill prompts to special roles
      await sendNightPrompts(m.chat, sock, prefix);

      // Set timeout for night phase
      ww[m.chat].timeout = setTimeout(() => {
        processNightActions(m.chat, sock, db, prefix);
      }, PHASE_DURATION.night);
    },

    vote: async () => {
      if (!ww[m.chat] || ww[m.chat].status !== "playing") {
        return m.reply(`❌¡No hay juego activo!`);
      }

      if (ww[m.chat].phase !== "day") {
        return m.reply(
          `❌¡Ahora no es el momento de votar!\n- > 91; Gasps &#93; - &#91; Gasps &#93;${ww[m.chat].phase === "night" ? "🌙 Malam" : ww[m.chat].phase}`,
        );
      }

      const player = ww[m.chat].players.find((p) => p.id === m.sender);
      if (!player) {
        return m.reply(`❌¡No eres el jugador en este juego!`);
      }

      if (!player.alive) {
        return m.reply(`❌¡Está muerto!`);
      }

      if (player.voted) {
        return m.reply(`❌Esperar la votación.`);
      }

      if (!target) {
        const alivePlayers = ww[m.chat].players.filter((p) => p.alive);
        const list = alivePlayers
          .map((p) => `${p.number}. @${p.id.split("@")[0]}`)
          .join("\n");
        return m.reply(
          `🗳️ *VOTING*\n\n` +
            `Escoge quien quieras liquidar:\n\n` +
            `${list}\n\n` +
            `Escribe:\`${prefix}ww vote <nomor>\``,
          { mentions: alivePlayers.map((p) => p.id) },
        );
      }

      const targetNum = parseInt(target);
      if (isNaN(targetNum)) {
        return m.reply(
          `❌¡Pon el número de jugador!\`${prefix}ww vote 2\``,
        );
      }

      const targetPlayer = ww[m.chat].players.find(
        (p) => p.number === targetNum,
      );
      if (!targetPlayer) {
        return m.reply(`❌Player número${targetNum}no encontrado!`);
      }

      if (!targetPlayer.alive) {
        return m.reply(`❌¡El jugador está muerto!`);
      }

      player.voted = true;
      ww[m.chat].votes[targetPlayer.id] =
        (ww[m.chat].votes[targetPlayer.id] || 0) + 1;

      const alivePlayers = ww[m.chat].players.filter((p) => p.alive);
      const votedCount = alivePlayers.filter((p) => p.voted).length;

      await m.react("🗳️");
      await m.reply(
        `🗳️ *VOTE TERCATAT*\n\n` +
          `@${m.sender.split("@")[0]} ➜ @${targetPlayer.id.split("@")[0]}\n\n` +
          `Progress: ${votedCount}/${alivePlayers.length}`,
        { mentions: [m.sender, targetPlayer.id] },
      );

      // Check if all votes are in
      if (votedCount >= alivePlayers.length) {
        if (ww[m.chat].timeout) clearTimeout(ww[m.chat].timeout);
        await executeVote(m.chat, sock, db, prefix);
      }
    },

    player: async () => {
      if (!ww[m.chat]) {
        return m.reply(`❌¡No hay juego en está habitación!`);
      }

      const playerList = ww[m.chat].players
        .map((p, i) => {
          const status = p.alive
            ? "✅"
            : `☠️ (${_optionalChain([ROLES, 'access', _14 => _14[p.role], 'optionalAccess', _15 => _15.name]) || "Unknown"})`;
          return `${p.number}. @${p.id.split("@")[0]} ${status}`;
        })
        .join("\n");

      const phaseEmoji =
        ww[m.chat].phase === "night"
          ? "🌙"
          : ww[m.chat].phase === "day"
            ? "☀️"
            : "🕕";

      await m.reply(
        `🐺 *WEREWOLF - STATUS*\n\n` +
          `╭┈┈⬡「 📊JUEGO INFO >」\n` +
          `┃ 📅 Day: ${ww[m.chat].day}\n` +
          `┃ ${phaseEmoji} Phase: ${ww[m.chat].phase}\n` +
          `┃ 👤 Alive: ${ww[m.chat].players.filter((p) => p.alive).length}\n` +
          `┃ ☠️ Dead: ${ww[m.chat].dead.length}\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `╭┈┈⬡「 👥 *PLAYERS* 」\n` +
          `${playerList
            .split("\n")
            .map((l) => `┃ ${l}`)
            .join("\n")}\n` +
          `╰┈┈┈┈┈┈┈┈⬡`,
        { mentions: ww[m.chat].players.map((p) => p.id) },
      );
    },

    exit: async () => {
      if (!ww[m.chat]) {
        return m.reply(`❌¡No hay juego en está habitación!`);
      }

      const playerIdx = ww[m.chat].players.findIndex((p) => p.id === m.sender);
      if (playerIdx === -1) {
        return m.reply(`❌¡No estás en este juego!`);
      }

      if (ww[m.chat].status === "playing") {
        return m.reply(`❌¡No puede salir cuando se está ejecutando el juego!`);
      }

      ww[m.chat].players.splice(playerIdx, 1);
      ww[m.chat].players.forEach((p, i) => (p.number = i + 1));

      if (ww[m.chat].players.length === 0) {
        if (ww[m.chat].timeout) clearTimeout(ww[m.chat].timeout);
        delete ww[m.chat];
        return m.reply(`🗑" Room was cut for being empty. "`);
      }

      //Transfer host si el propietario o se fue
      if (ww[m.chat].owner === m.sender && ww[m.chat].players.length > 0) {
        ww[m.chat].owner = ww[m.chat].players[0].id;
        await m.reply(
          `👋 @${m.sender.split("@")[0]}salir.\n` +
            `👑Nuevo anfitrión:${ww[m.chat].owner.split("@")[0]}`,
          { mentions: [m.sender, ww[m.chat].owner] },
        );
      } else {
        await m.reply(`👋 @${m.sender.split("@")[0]}Sal del juego.`, {
          mentions: [m.sender],
        });
      }
    },

    delete: async () => {
      if (!ww[m.chat]) {
        return m.reply(`❌¡No hay juego en está habitación!`);
      }

      const isOwner = ww[m.chat].owner === m.sender;
      const isBotOwner = _optionalChain([_configjs2.default, 'access', _16 => _16.isOwner, 'optionalCall', _17 => _17(m.sender)]);

      if (!isOwner && !isBotOwner) {
        return m.reply(`❌Sólo los anfitriones... o el dueño del bot puede memorizarlo!`);
      }

      if (ww[m.chat].timeout) clearTimeout(ww[m.chat].timeout);
      delete ww[m.chat];

      await m.react("🗑️");
      await m.reply(`🗑- ¡El juego eliminado!`);
    },
  };

  // Show help if no action
  if (!action || !commands[action]) {
    return m.reply(
      `🐺 *WEREWOLF GAME*\n\n` +
        `Juegos sociales buscando Werewolves!\n\n` +
        `╭┈┈⬡「 🎮 *COMMANDS* 」\n` +
        `┃ 🆕 \`${prefix}ww crear\`- Cuarto de barco.\n` +
        `┃ ➕ \`${prefix}ww join\` - Gabung\n` +
        `┃ ▶️ \`${prefix}ww start\`- Starai ( host )\n` +
        `┃ 🗳️ \`${prefix}ww vote <no>\` - Vote\n` +
        `┃ 👥 \`${prefix}ww player\` - List player\n` +
        `┃ 🚪 \`${prefix}ww exit\` - Keluar\n` +
        `┃ 🗑️ \`${prefix}ww delete\`- Sala de Elimina\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `╭┈┈⬡「 🎭 *ROLES* 」\n` +
        `┃ 🐺 Werewolf - Bunuh warga\n` +
        `┃ 🧙Hechicero - Busca Ser\n` +
        `┃ 🔮 Seer - Mira role\n` +
        `┃ 🛡️ Guardian - Lindungi\n` +
        `┃ 👨‍🌾 Villager - Vote werewolf\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `Min: ${MIN_PLAYERS} players | Max: ${MAX_PLAYERS} players`,
    );
  }

  try {
    await commands[action]();
  } catch (error) {
    console.error("[WEREWOLF ERROR]", error);
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

// Send night skill prompts to players
async function sendNightPrompts(chatId, sock, prefix) {
  const ww = global.werewolfGames;
  if (!ww[chatId]) return;

  const game = ww[chatId];
  const alivePlayers = game.players.filter((p) => p.alive);

  // Build player list for prompts
  let playerListNormal = "";
  let playerListWolf = "";

  alivePlayers.forEach((p) => {
    playerListNormal += `(${p.number}) @${p.id.split("@")[0]}\n`;
    const roleTag =
      p.role === "werewolf" || p.role === "sorcerer"
        ? ` [${ROLES[p.role].name}]`
        : "";
    playerListWolf += `(${p.number}) @${p.id.split("@")[0]}${roleTag}\n`;
  });

  const mentions = alivePlayers.map((p) => p.id);

  // Send prompts based on role
  for (const player of alivePlayers) {
    try {
      let text = "";

      switch (player.role) {
        case "werewolf":
          text =
            `🐺*Noche El*\n\n` +
            `¡El momento está en la caza!\n\n` +
            `${playerListWolf}\n` +
            `> Escribe\`${prefix}wnkill<nomor>\`para matar`;
          break;
        case "seer":
          text =
            `🔮*Noche El*\n\n` +
            `¿Quién quieres ver los rollos?\n\n` +
            `${playerListNormal}\n` +
            `> Escribe\`${prefix}wsee<nomor>\`para ver el papel`;
          break;
        case "guardian":
          text =
            `🛡♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪ ♪\n\n` +
            `¿Quién quieres proteger?\n\n` +
            `${playerListNormal}\n` +
            `> Escribe\`${prefix}wyprotect<nomor>\`para protegiendo`;
          break;
        case "sorcerer":
          text =
            `🧙*Noche El*\n\n` +
            `¡Busca sabe quién es Seer!\n\n` +
            `${playerListWolf}\n` +
            `> Escribe\`${prefix}wssorcerer<nomor>\`para comprobando`;
          break;
        case "villager":
          text =
            `👨‍🌾*Noche El*\n\n` +
            `Como guerrero, ten cuidado.\n` +
            `Tal vez usted es el próximo objetivo.\n\n` +
            `${playerListNormal}`;
          break;
      }

      if (text) {
        await sendWW(
          sock,
          player.id,
          text,
          "🌙 NIGHT",
          "Gunakan skillmu!",
          thumbNight,
          mentions,
        );
      }
    } catch (e) {
      console.log(`[WW] Failed to send prompt to ${player.id}:`, e.message);
    }
  }
}

// Process night actions
async function processNightActions(chatId, sock, db, prefix) {
  const ww = global.werewolfGames;
  if (!ww[chatId] || ww[chatId].phase !== "night") return;

  let killTarget = ww[chatId].nightActions.kill;
  const protectTarget = ww[chatId].nightActions.protect;

  let nightReport = `☀♪ Buenos días ♪${ww[chatId].day}*\n\n`;

  // Process kill if not protected
  if (killTarget && killTarget !== protectTarget) {
    const victim = ww[chatId].players.find((p) => p.id === killTarget);
    if (victim && victim.alive) {
      victim.alive = false;
      ww[chatId].dead.push(victim);
      nightReport += `☠️ @${victim.id.split("@")[0]}¡Encontrado muerto!\n`;
      nightReport += `> Role: ${ROLES[victim.role].emoji} ${ROLES[victim.role].name}\n\n`;
    }
  } else if (killTarget && killTarget === protectTarget) {
    nightReport += `🛡¡Los Guardianes han protegido con éxito el objetivo!\n`;
    nightReport += `Sí, no hay heridos está noche.\n\n`;
  } else {
    nightReport += `🌅El malestar silencioso.\n`;
    nightReport += `- No hay corrosión.\n\n`;
  }

  // Check win condition
  const winner = checkWinner(chatId);
  if (winner) {
    await sendWW(
      sock,
      chatId,
      nightReport,
      "☀️ DAY",
      "Pagi telah tiba...",
      thumbDay,
      ww[chatId].players.map((p) => p.id),
    );
    await endGame(chatId, sock, db, winner);
    return;
  }

  // Change phase to day
  ww[chatId].phase = "day";
  ww[chatId].votes = {};
  ww[chatId].nightActions = {
    kill: null,
    protect: null,
    see: null,
    sorcerer: null,
  };
  ww[chatId].players.forEach((p) => {
    p.voted = false;
    p.skillUsed = false;
  });

  const alivePlayers = ww[chatId].players.filter((p) => p.alive);
  const playerList = alivePlayers
    .map((p) => `${p.number}. @${p.id.split("@")[0]}`)
    .join("\n");

  nightReport += `╭┈┈⬡「 👥*PLAYER Vida*」\n`;
  nightReport += `${playerList
    .split("\n")
    .map((l) => `┃ ${l}`)
    .join("\n")}\n`;
  nightReport += `╰┈┈┈┈┈┈┈┈⬡\n\n`;
  nightReport += `> 🗳️ Waktunya voting!\n`;
  nightReport += `> Escribe\`${prefix}ww vote <nomor>\`\n`;
  nightReport += `♪⏱️ Tiempo:${PHASE_DURATION.day / 1000}segundo`;

  await sendWW(
    sock,
    chatId,
    nightReport,
    "☀️ DAY",
    "Voting time!",
    thumbDay,
    ww[chatId].players.map((p) => p.id),
  );

  ww[chatId].timeout = setTimeout(() => {
    executeVote(chatId, sock, db, prefix);
  }, PHASE_DURATION.day);
}

// Execute vote results
async function executeVote(chatId, sock, db, prefix) {
  const ww = global.werewolfGames;
  if (!ww[chatId] || ww[chatId].phase !== "day") return;

  let maxVotes = 0;
  let eliminated = null;
  let isTie = false;

  for (const [playerId, votes] of Object.entries(ww[chatId].votes)) {
    if (votes > maxVotes) {
      maxVotes = votes;
      eliminated = playerId;
      isTie = false;
    } else if (votes === maxVotes && maxVotes > 0) {
      isTie = true;
    }
  }

  let resultText = `⚖️ *Resultado VOTING*\n\n`;

  if (isTie || maxVotes === 0) {
    resultText += `🤷¡Nada se liquidó!\n`;
    resultText += `> ${isTie ? "Vote seri!" : "Tidak ada yang vote."}\n\n`;
  } else if (eliminated) {
    const player = ww[chatId].players.find((p) => p.id === eliminated);
    if (player) {
      player.alive = false;
      ww[chatId].dead.push(player);

      resultText += `⚰️ @${eliminated.split("@")[0]} dieliminasi!\n`;
      resultText += `> Role: ${ROLES[player.role].emoji} ${ROLES[player.role].name}\n`;
      resultText += `> Votes: ${maxVotes}\n\n`;
    }
  }

  // Check win condition
  const winner = checkWinner(chatId);
  if (winner) {
    await sendWW(
      sock,
      chatId,
      resultText,
      "⚖️ VOTING",
      "Hasil voting",
      thumbDay,
      eliminated ? [eliminated] : [],
    );
    await endGame(chatId, sock, db, winner);
    return;
  }

  // Change to night phase
  ww[chatId].phase = "night";
  ww[chatId].day++;
  ww[chatId].nightActions = {
    kill: null,
    protect: null,
    see: null,
    sorcerer: null,
  };
  ww[chatId].players.forEach((p) => {
    p.voted = false;
    p.skillUsed = false;
  });

  resultText += `🌙* WISH Noche TO -${ww[chatId].day}*\n\n`;
  resultText += `> Werewolf berburu...\n`;
  resultText += `*Los papeles especiales, ¡utiliza tus habilidades en el PM!*\n`;
  resultText += `♪⏱️ Tiempo:${PHASE_DURATION.night / 1000}segundo`;

  await sendWW(
    sock,
    chatId,
    resultText,
    "🌙 NIGHT",
    "Werewolf berburu...",
    thumbNight,
    eliminated ? [eliminated] : [],
  );

  // Send night prompts
  await sendNightPrompts(chatId, sock, prefix);

  ww[chatId].timeout = setTimeout(() => {
    processNightActions(chatId, sock, db, prefix);
  }, PHASE_DURATION.night);
}

// Check win condition
function checkWinner(chatId) {
  const ww = global.werewolfGames;
  if (!ww[chatId]) return null;

  const alivePlayers = ww[chatId].players.filter((p) => p.alive);
  const wolves = alivePlayers.filter((p) => _optionalChain([ROLES, 'access', _18 => _18[p.role], 'optionalAccess', _19 => _19.team]) === "wolf");
  const villagers = alivePlayers.filter(
    (p) => _optionalChain([ROLES, 'access', _20 => _20[p.role], 'optionalAccess', _21 => _21.team]) === "village",
  );

  if (wolves.length === 0) return "village";
  if (wolves.length >= villagers.length) return "wolf";

  return null;
}

//Fin de juego y dar advertencias
async function endGame(chatId, sock, db, winner) {
  const ww = global.werewolfGames;
  if (!ww[chatId]) return;

  if (ww[chatId].timeout) clearTimeout(ww[chatId].timeout);

  const winningTeam = winner === "wolf" ? "wolf" : "village";
  const winningPlayers = ww[chatId].players.filter(
    (p) => _optionalChain([ROLES, 'access', _22 => _22[p.role], 'optionalAccess', _23 => _23.team]) === winningTeam,
  );

  // Give rewards to winners
  for (const player of winningPlayers) {
    try {
      db.updateKoin(player.id, WIN_REWARD.koin);
      const user = db.getUser(player.id);
      if (user) {
        user.exp = (user.exp || 0) + WIN_REWARD.exp;
        db.setUser(player.id, user);
      }
    } catch (e) {
      console.log(`[WW] Failed to give reward to ${player.id}:`, e.message);
    }
  }

  const allPlayers = ww[chatId].players
    .map((p) => {
      const status = p.alive ? "✅" : "☠️";
      const isWinner = winningPlayers.some((w) => w.id === p.id) ? "🏆" : "";
      return `${status} @${p.id.split("@")[0]} - ${ROLES[p.role].emoji} ${ROLES[p.role].name} ${isWinner}`;
    })
    .join("\n");

  const endText =
    `🎉> 91; ¡Juego OVER!\n\n` +
    `${winner === "wolf" ? "🐺 *WEREWOLF MENANG!*" : "👨‍🌾 *VILLAGER MENANG!*"}\n\n` +
    `╭┈┈⬡「 👥*Todo PLAYER*」\n` +
    `${allPlayers
      .split("\n")
      .map((l) => `┃ ${l}`)
      .join("\n")}\n` +
    `╰┈┈┈┈┈┈┈┈⬡\n\n` +
    `╭┈┈⬡「 🎁*Premio*」\n` +
    `┃ 💰 +${WIN_REWARD.koin.toLocaleString()} Koin\n` +
    `┃ ⭐ +${WIN_REWARD.exp.toLocaleString()} EXP\n` +
    `╰┈┈┈┈┈┈┈┈⬡\n\n` +
    `♪ WP ♪ ♪ Jugar de nuevo ♪\`${_optionalChain([_configjs2.default, 'access', _24 => _24.command, 'optionalAccess', _25 => _25.prefix]) || "."}ww create\``;

  await sendWW(
    sock,
    chatId,
    endText,
    "🏆 GAME OVER",
    `${winner === "wolf" ? "Werewolf" : "Villager"} wins!`,
    thumbWin,
    ww[chatId].players.map((p) => p.id),
  );

  delete ww[chatId];
}

// Night action handler for PM commands
async function nightActionHandler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const ww = global.werewolfGames;
  const prefix = m.prefix || _optionalChain([_configjs2.default, 'access', _26 => _26.command, 'optionalAccess', _27 => _27.prefix]) || ".";

  //Encontrar el juego que este jugador está en
  const chatId = Object.keys(ww).find(
    (id) =>
      ww[id].players.some((p) => p.id === m.sender && p.alive) &&
      ww[id].phase === "night",
  );

  if (!chatId) {
    return m.reply(
      `❌¡No estás en un juego de hombres lobo o no en una noche de fase!`,
    );
  }

  const game = ww[chatId];
  const player = game.players.find((p) => p.id === m.sender);
  if (!player || !player.alive) {
    return m.reply(`❌¡Estás muerto o no eres un jugador!`);
  }

  // Check if skill already used
  if (player.skillUsed) {
    return m.reply(`❌¡Está noche has estado usando habilidades!`);
  }

  const cmd = _optionalChain([m, 'access', _28 => _28.command, 'optionalAccess', _29 => _29.toLowerCase, 'call', _30 => _30()]);
  const targetNum = parseInt(_optionalChain([m, 'access', _31 => _31.args, 'optionalAccess', _32 => _32[0]]));

  if (isNaN(targetNum)) {
    return m.reply(`❌Insertar el número de objetivo!\`${prefix}${cmd} 2\``);
  }

  const targetPlayer = game.players.find(
    (p) => p.number === targetNum && p.alive,
  );
  if (!targetPlayer) {
    return m.reply(`❌¡Los objetivos no son válidos ni muertos!`);
  }

  //Proceso basado en el comando y el papel
  if (cmd === "wwkill" && player.role === "werewolf") {
    if (targetPlayer.role === "werewolf" || targetPlayer.role === "sorcerer") {
      return m.reply(`❌¡No puede matar al equipo de sésamo!`);
    }
    game.nightActions.kill = targetPlayer.id;
    player.skillUsed = true;
    await m.reply(
      `🐺 *Objetivo TERPILIH*\n\n` +
        `Objetivo: @${targetPlayer.id.split("@")[0]}\n` +
        `Esperaba el fin de la noche.`,
      { mentions: [targetPlayer.id] },
    );
    return true;
  }

  if (cmd === "wwprotect" && player.role === "guardian") {
    game.nightActions.protect = targetPlayer.id;
    player.skillUsed = true;
    await m.reply(
      `🛡️ *Objetivo DILINDUNGI*\n\n` +
        `Protegiendo: @${targetPlayer.id.split("@")[0]}\n` +
        `Esperaba el fin de la noche.`,
      { mentions: [targetPlayer.id] },
    );
    return true;
  }

  if (cmd === "wwsee" && player.role === "seer") {
    const roleInfo = ROLES[targetPlayer.role];
    player.skillUsed = true;
    await m.reply(
      `🔮*Resultado PENGLIHATAN*\n\n` +
        `@${targetPlayer.id.split("@")[0]}es:\n` +
        `${roleInfo.emoji} *${roleInfo.name}*\n\n` +
        `> Team: ${roleInfo.team === "wolf" ? "🐺 Wolf" : "👨‍🌾 Village"}`,
      { mentions: [targetPlayer.id] },
    );
    return true;
  }

  if (cmd === "wwsorcerer" && player.role === "sorcerer") {
    const isSeer = targetPlayer.role === "seer";
    player.skillUsed = true;
    await m.reply(
      `🧙*Resultado INVESTIGASI*\n\n` +
        `@${targetPlayer.id.split("@")[0]}\n` +
        `${isSeer ? "✅ *adalah SEER!*" : "❌ *bukan Seer*"}\n\n` +
        `¡Ayúdenme a los hombres lobos!`,
      { mentions: [targetPlayer.id] },
    );
    return true;
  }

  //WWAKLE RALE FOR Comando
  return m.reply(
    `❌¡No tienes está habilidad!\nSu fiesta:${_optionalChain([ROLES, 'access', _33 => _33[player.role], 'optionalAccess', _34 => _34.name]) || "Unknown"}`,
  );
}

exports.config = pluginConfig; exports.handler = handler; exports.nightActionHandler = nightActionHandler; exports.ROLES = ROLES; exports.sendWW = sendWW;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

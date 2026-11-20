"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');




var _ouringameulartanggajs = require('../../src/lib/ourin-game-ulartangga.js');
var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);
const pluginConfig = {
  name: "ulartangga",
  alias: ["ut", "snakeladder", "sl"],
  category: "game",
  description: "Escaleras ulares principales con otro jugador con embarque visual",
  usage: ".ulartangga <create|join|start|info|exit|delete>",
  example: ".ulartangga create",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

if (!global.ulartanggaGames) global.ulartanggaGames = {};

const PLAYER_COLORS = ["🔴", "🟡", "🟢", "🔵"];
const PLAYER_NAMES = ["Merah", "Kuning", "Hijau", "Biru"];

const WIN_REWARD = { koin: 2000, exp: 1000, energi: 5 };

function uniqueMentions(mentions = []) {
  return [...new Set((mentions || []).filter(Boolean))];
}

let thumbUT = null;
try {
  const thumbPath = _path2.default.join(
    process.cwd(),
    "assets",
    "image",
    "ourin-games.jpg",
  );
  if (_fs2.default.existsSync(thumbPath)) {
    thumbUT = _fs2.default.readFileSync(thumbPath);
  }
} catch (e) { }

function utCtx(mentions) {
  const saluranId = _optionalChain([_configjs2.default, 'access', _ => _.saluran, 'optionalAccess', _2 => _2.id]) || "120363400911374213@newsletter";
  const saluranName = _optionalChain([_configjs2.default, 'access', _3 => _3.saluran, 'optionalAccess', _4 => _4.name]) || _optionalChain([_configjs2.default, 'access', _5 => _5.bot, 'optionalAccess', _6 => _6.name]) || "Ourin-AI";
  const normalizedMentions = uniqueMentions(mentions);
  return {
    forwardingScore: 9999,
    isForwarded: true,
    mentionedJid: normalizedMentions.length ? normalizedMentions : undefined,
    forwardedNewsletterMessageInfo: {
      newsletterJid: saluranId,
      newsletterName: saluranName,
      serverMessageId: 127,
    },
  };
}

async function sendUT(sock, jid, text, title, body, mentions, options) {
  const msgId = await sock.sendPreview(
    jid,
    {
      caption: `${_configjs2.default.info.website} ${text}`,
      url: `${_configjs2.default.info.website}`,
      title: title || "🐍🎲 ULAR TANGGA",
      description: body || "Permainan klasik!",
      jpegThumbnail: thumbUT,
      previewType: 0,
    },
    { contextInfo: utCtx(mentions), ...options },
  );
  return { key: { id: msgId, remoteJid: jid, fromMe: true } };
}

async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const args = m.args || [];
  const action = _optionalChain([args, 'access', _7 => _7[0], 'optionalAccess', _8 => _8.toLowerCase, 'call', _9 => _9()]);
  const ut = global.ulartanggaGames;
  const prefix = m.prefix || _optionalChain([_configjs2.default, 'access', _10 => _10.command, 'optionalAccess', _11 => _11.prefix]) || ".";

  const commands = {
    create: async () => {
      if (ut[m.chat]) {
        return sendUT(
          sock,
          m.chat,
          `❌* ROVE THE HUSBAND THERE *\n\n` +
          `Hay un juego en este gráfico.\n` +
          `> Host: @${ut[m.chat].host.split("@")[0]}\n` +
          `> Status: ${ut[m.chat].status}`,
          "🐍🎲 ULAR TANGGA",
          "Permainan klasik!",
          [ut[m.chat].host],
          { quoted: m },
        );
      }

      const mapConfig = _ouringameulartanggajs.getRandomMap.call(void 0, );

      ut[m.chat] = {
        date: Date.now(),
        status: "WAITING",
        host: m.sender,
        players: {},
        turn: 0,
        map: mapConfig.map,
        mapName: mapConfig.name,
        snakesLadders: mapConfig.snakesLadders,
        stabil_x: mapConfig.stabil_x,
        stabil_y: mapConfig.stabil_y,
      };
      ut[m.chat].players[m.sender] = { rank: "HOST", position: 1 };

      await m.react("🎲");
      await sendUT(
        sock,
        m.chat,
        `🐍🎲* ULar Escalera *\n\n` +
        `¡La habitación logró hacerlo!\n\n` +
        `╭┈┈⬡「 📋91; INFO ROWK」\n` +
        `┃ 👑 Host: @${m.sender.split("@")[0]}\n` +
        `┃ 👥 Players: 1/4\n` +
        `┃ 🗺️ Map: ${mapConfig.name}\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `╭┈┈⬡「 🎮 *COMMANDS* 」\n` +
        `┃ ➕ \`${prefix}ut join\` - Gabung\n` +
        `┃ ▶️ \`${prefix}ut start\` - Mulai\n` +
        `┃ ℹ️ \`${prefix}info out\`- Ayade de inforación\n` +
        `┃ 🚪 \`${prefix}ut exit\` - Keluar\n` +
        `╰┈┈┈┈┈┈┈┈⬡`,
        "🎲 ROOM CREATED",
        "Ayo bergabung!",
        [m.sender],
        { quoted: m },
      );
    },

    join: async () => {
      if (!ut[m.chat]) {
        return m.reply(
          `❌¡No hay juego!\n> Escribe\`${prefix}ut crear\`Para hacer una habitación.`,
        );
      }

      if (ut[m.chat].players[m.sender]) {
        return m.reply(`❌¡Ya estás en está habitación!`);
      }

      const playerCount = Object.keys(ut[m.chat].players).length;
      if (playerCount >= 4) {
        return m.reply(`❌¡La habitación está llena!x4 jugadores )`);
      }

      if (ut[m.chat].status === "PLAYING") {
        return m.reply(`❌Ame está en camino, ¡no puede unirse!`);
      }

      ut[m.chat].players[m.sender] = { rank: "MEMBER", position: 1 };

      const players = Object.keys(ut[m.chat].players);
      const playerList = players
        .map(
          (p, i) =>
            `${PLAYER_COLORS[i]} ${PLAYER_NAMES[i]}: @${p.split("@")[0]}`,
        )
        .join("\n");

      await m.react("✅");
      await sendUT(
        sock,
        m.chat,
        `✅*PLAYER Unirse*\n\n` +
        `@${m.sender.split("@")[0]}entrar!\n\n` +
        `╭┈┈⬡「 👥 *PLAYERS* 」\n` +
        `${playerList
          .split("\n")
          .map((l) => `┃ ${l}`)
          .join("\n")}\n` +
        `╰┈┈┈┈┈┈┈┈⬡\n\n` +
        `> Total: ${players.length}/4\n` +
        `> ${players.length >= 2 ? `✅ Bisa mulai! \`${prefix}ut start\`` : "🕕 Butuh 1 player lagi"}`,
        "👥 PLAYER JOINED",
        `${players.length}/4 players`,
        players,
        { quoted: m },
      );
    },

    start: async () => {
      if (!ut[m.chat]) {
        return m.reply(`❌¡No hay juego!`);
      }

      if (ut[m.chat].status === "PLAYING") {
        return m.reply(`❌¡El juego está encendido!`);
      }

      if (ut[m.chat].host !== m.sender && !_optionalChain([_configjs2.default, 'access', _12 => _12.isOwner, 'optionalCall', _13 => _13(m.sender)])) {
        return m.reply(`❌¡Sólo los anfitriones pueden empezar un juego!`);
      }

      const players = Object.keys(ut[m.chat].players);
      if (players.length < 2) {
        return m.reply(`❌¡Al menos 2 jugadores para jugar!`);
      }

      ut[m.chat].status = "PLAYING";
      ut[m.chat].turn = 0;

      const playerList = players
        .map(
          (p, i) =>
            `${PLAYER_COLORS[i]} ${PLAYER_NAMES[i]}: @${p.split("@")[0]}`,
        )
        .join("\n");

      // Draw initial board with all players at position 1
      const positions = players.map((p) => ut[m.chat].players[p].position);
      const boardImage = await _ouringameulartanggajs.drawBoard.call(void 0, 
        ut[m.chat].map,
        positions[0] || null,
        positions[1] || null,
        positions[2] || null,
        positions[3] || null,
        ut[m.chat].stabil_x,
        ut[m.chat].stabil_y,
      );

      await m.react("🎮");

      if (boardImage) {
        await sock.sendMessage(
          m.chat,
          {
            image: boardImage,
            caption:
              `🐍🎲*Juego Comenzó!*\n\n` +
              `╭┈┈⬡「 👥 *PLAYERS* 」\n` +
              `${playerList
                .split("\n")
                .map((l) => `┃ ${l}`)
                .join("\n")}\n` +
              `╰┈┈┈┈┈┈┈┈⬡\n\n` +
              `> 🎯 Giliran: @${players[0].split("@")[0]}\n` +
              `*Remojadlo para los dados*`,
            contextInfo: utCtx(players),
          },
          { quoted: m },
        );
      } else {
        await sendUT(
          sock,
          m.chat,
          `🐍🎲*Juego Comenzó!*\n\n` +
          `╭┈┈⬡「 👥 *PLAYERS* 」\n` +
          `${playerList
            .split("\n")
            .map((l) => `┃ ${l}`)
            .join("\n")}\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `> 🎯 Giliran: @${players[0].split("@")[0]}\n` +
          `*Remojadlo para los dados*`,
          "🎮 GAME STARTED",
          "Lempar dadu!",
          players,
          { quoted: m },
        );
      }
    },

    info: async () => {
      if (!ut[m.chat]) {
        return m.reply(`❌¡No hay juego!`);
      }

      const players = Object.keys(ut[m.chat].players);
      const playerList = players
        .map((p, i) => {
          const pos = ut[m.chat].players[p].position;
          return `${PLAYER_COLORS[i]} ${PLAYER_NAMES[i]}: @${p.split("@")[0]} - Pos: ${pos}`;
        })
        .join("\n");

      const currentTurn =
        ut[m.chat].status === "PLAYING"
          ? players[ut[m.chat].turn % players.length]
          : null;

      await sock.sendMessage(
        m.chat,
        {
          text:
            `🐍🎲91; INFO ROWK\n\n` +
            `╭┈┈⬡「 📋 *ROOM* 」\n` +
            `┃ 👑 Host: @${ut[m.chat].host.split("@")[0]}\n` +
            `┃ 📍 Status: ${ut[m.chat].status}\n` +
            `┃ 🗺️ Map: ${ut[m.chat].mapName}\n` +
            `┃ 👥 Players: ${players.length}/4\n` +
            `╰┈┈┈┈┈┈┈┈⬡\n\n` +
            `╭┈┈⬡「 👥 *PLAYERS* 」\n` +
            `${playerList
              .split("\n")
              .map((l) => `┃ ${l}`)
              .join("\n")}\n` +
            `╰┈┈┈┈┈┈┈┈⬡` +
            (currentTurn
              ? `\n\n> 🎯 Giliran: @${currentTurn.split("@")[0]}`
              : ""),
          contextInfo: utCtx(players),
        },
        { quoted: m },
      );
    },

    exit: async () => {
      if (!ut[m.chat]) {
        return m.reply(`❌¡No hay juego!`);
      }

      if (!ut[m.chat].players[m.sender]) {
        return m.reply(`❌¡No estás en este juego!`);
      }

      delete ut[m.chat].players[m.sender];
      await sendUT(
        sock,
        m.chat,
        `👋 @${m.sender.split("@")[0]}Fuera del juego.`,
        "🐍🎲 ULAR TANGGA",
        "Permainan klasik!",
        [m.sender],
        { quoted: m },
      );

      if (Object.keys(ut[m.chat].players).length === 0) {
        delete ut[m.chat];
        return m.reply(`🗑El cuarto de Ez fue interrumpido porque no había jugador.`);
      }

      if (!ut[m.chat].players[ut[m.chat].host]) {
        const newHost = Object.keys(ut[m.chat].players)[0];
        ut[m.chat].host = newHost;
        ut[m.chat].players[newHost].rank = "HOST";
        await sendUT(
          sock,
          m.chat,
          `👑 Host dipindahkan ke @${newHost.split("@")[0]}`,
          "🐍🎲 ULAR TANGGA",
          "Permainan klasik!",
          [newHost],
          { quoted: m },
        );
      }

      // Fix turn if playing
      if (ut[m.chat].status === "PLAYING") {
        const players = Object.keys(ut[m.chat].players);
        ut[m.chat].turn = ut[m.chat].turn % players.length;
        await sendUT(
          sock,
          m.chat,
          `> Giliran: @${players[ut[m.chat].turn].split("@")[0]}\n> Escribe *kocok*`,
          "🐍🎲 ULAR TANGGA",
          "Permainan klasik!",
          [players[ut[m.chat].turn]],
        );
      }
    },

    delete: async () => {
      if (!ut[m.chat]) {
        return m.reply(`❌¡No hay juego!`);
      }

      if (ut[m.chat].host !== m.sender && !_optionalChain([_configjs2.default, 'access', _14 => _14.isOwner, 'optionalCall', _15 => _15(m.sender)])) {
        return m.reply(`❌¡Sólo el anfitrión puede borrar la habitación!`);
      }

      delete ut[m.chat];
      await m.react("🗑️");
      await m.reply(`🗑¡Esz Room entró!`);
    },
  };

  if (!action || !commands[action]) {
    return sendUT(
      sock,
      m.chat,
      `🐍🎲* ULar Escalera *\n\n` +
      `¡Un clásico juego de aventura!\n` +
      `Arriba la escalera, hinari ular, hasta 100!\n\n` +
      `╭┈┈⬡「 🎮 *COMMANDS* 」\n` +
      `┃ 🎲 \`${prefix}ut crear\`- Cuarto de barco.\n` +
      `┃ ➕ \`${prefix}ut join\`- Booger de la habitación\n` +
      `┃ ▶️ \`${prefix}ut start\`- Empieza juego\n` +
      `┃ ℹ️ \`${prefix}info out\`- Ayade de inforación\n` +
      `┃ 🚪 \`${prefix}ut exit\` - Keluar\n` +
      `┃ 🗑️ \`${prefix}ut delete\`- Sala de Elimina\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `╭┈┈⬡「 🏆*Premio*」\n` +
      `┃ 💰 +${WIN_REWARD.koin.toLocaleString()} Koin\n` +
      `┃ ⭐ +${WIN_REWARD.exp.toLocaleString()} EXP\n` +
      `┃ ⚡ +${WIN_REWARD.energi} Energi\n` +
      `╰┈┈┈┈┈┈┈┈⬡\n\n` +
      `> Min 2 player, Max 4 player`,
      "🐍🎲 ULAR TANGGA",
      "Ayo main!",
      [],
      { quoted: m },
    );
  }

  try {
    await commands[action]();
  } catch (error) {
    console.error("[ULARTANGGA ERROR]", error);
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

// ==================== Answer Handler (for "kocok") ====================
async function answerHandler(m, sock) {
  if (!m.body) return false;

  const text = m.body.trim().toLowerCase();
  if (text !== "kocok") return false;

  const ut = global.ulartanggaGames;
  if (!ut[m.chat]) return false;
  if (ut[m.chat].status !== "PLAYING") return false;

  const players = Object.keys(ut[m.chat].players);
  if (!players.includes(m.sender)) return false;

  const currentTurn = ut[m.chat].turn % players.length;
  if (players.indexOf(m.sender) !== currentTurn) {
    await m.reply(
      `❌No es giliranmu!\n> Giliran: @${players[currentTurn].split("@")[0]}`,
      {
        mentions: [players[currentTurn]],
      },
    );
    return true;
  }

  const db = _ourindatabasejs.getDatabase.call(void 0, );

  // Roll dice
  const dadu = Math.floor(Math.random() * 6) + 1;
  const DICE_EMOJI = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];

  // Send dice sticker
  try {
    const diceUrl = _ouringameulartanggajs.DICE_STICKERS[dadu - 1];
    await sock.sendMessage(
      m.chat,
      {
        sticker: { url: diceUrl },
        contextInfo: utCtx(),
      },
      { quoted: m },
    );
  } catch (e) {
    // Fallback: just react with dice emoji
    await m.react(DICE_EMOJI[dadu - 1]);
  }

  const oldPos = ut[m.chat].players[m.sender].position;
  let newPos = oldPos + dadu;

  // Bounce back if over 100
  if (newPos > 100) {
    newPos = 100 - (newPos - 100);
  }

  // Check snake/ladder
  let event = "";
  const snakesLadders = ut[m.chat].snakesLadders;
  if (snakesLadders[newPos]) {
    const destination = snakesLadders[newPos];
    if (destination > newPos) {
      event = `\n🪜# Sube por las escaleras!`;
    } else {
      event = `\n🐍¡¡Kena ular!`;
    }
    newPos = destination;
  }

  ut[m.chat].players[m.sender].position = newPos;

  const playerIdx = players.indexOf(m.sender);
  const color = PLAYER_COLORS[playerIdx];
  const name = PLAYER_NAMES[playerIdx];

  // Check win condition
  if (newPos === 100) {
    // Give rewards
    try {
      db.updateKoin(m.sender, WIN_REWARD.koin);
      db.updateEnergi(m.sender, WIN_REWARD.energi);
      const userData = db.getUser(m.sender) || {};
      userData.exp = (userData.exp || 0) + WIN_REWARD.exp;
      db.setUser(m.sender, userData);
    } catch (e) {
      console.log("[UT] Failed to give reward:", e.message);
    }

    // Draw final board
    const positions = players.map(
      (p) => _optionalChain([ut, 'access', _16 => _16[m.chat], 'access', _17 => _17.players, 'access', _18 => _18[p], 'optionalAccess', _19 => _19.position]) || null,
    );
    const boardImage = await _ouringameulartanggajs.drawBoard.call(void 0, 
      ut[m.chat].map,
      positions[0] || null,
      positions[1] || null,
      positions[2] || null,
      positions[3] || null,
      ut[m.chat].stabil_x,
      ut[m.chat].stabil_y,
    );

    await m.react("🎉");

    if (boardImage) {
      await sock.sendMessage(m.chat, {
        image: boardImage,
        caption:
          `🎉*Ganador!*\n\n` +
          `${color} @${m.sender.split("@")[0]} hasta a 100!\n\n` +
          `╭┈┈⬡「 🎁*Premio*」\n` +
          `┃ 💰 +${WIN_REWARD.koin.toLocaleString()} Koin\n` +
          `┃ ⭐ +${WIN_REWARD.exp.toLocaleString()} EXP\n` +
          `┃ ⚡ +${WIN_REWARD.energi} Energi\n` +
          `╰┈┈┈┈┈┈┈┈⬡\n\n` +
          `♪ WP ♪ ♪ Jugar de nuevo ♪\`- ut crear\``,
        contextInfo: utCtx([m.sender]),
      });
    } else {
      await sendUT(
        sock,
        m.chat,
        `🎉*Ganador!*\n\n` +
        `${color} @${m.sender.split("@")[0]} hasta a 100!\n\n` +
        `╭┈┈⬡「 🎁*Premio*」\n` +
        `┃ 💰 +${WIN_REWARD.koin.toLocaleString()} Koin\n` +
        `┃ ⭐ +${WIN_REWARD.exp.toLocaleString()} EXP\n` +
        `┃ ⚡ +${WIN_REWARD.energi} Energi\n` +
        `╰┈┈┈┈┈┈┈┈⬡`,
        "🏆 WINNER!",
        `${name}ganaste!`,
        [m.sender],
      );
    }

    delete ut[m.chat];
    return true;
  }

  //Continuar juego
  ut[m.chat].turn++;
  const nextTurn = ut[m.chat].turn % players.length;
  const nextPlayer = players[nextTurn];

  // Draw updated board
  const positions = players.map((p) => _optionalChain([ut, 'access', _20 => _20[m.chat], 'access', _21 => _21.players, 'access', _22 => _22[p], 'optionalAccess', _23 => _23.position]) || null);
  const boardImage = await _ouringameulartanggajs.drawBoard.call(void 0, 
    ut[m.chat].map,
    positions[0] || null,
    positions[1] || null,
    positions[2] || null,
    positions[3] || null,
    ut[m.chat].stabil_x,
    ut[m.chat].stabil_y,
  );

  if (boardImage) {
    await sock.sendMessage(m.chat, {
      image: boardImage,
      caption:
        `🎲 *DADU: ${dadu}* ${DICE_EMOJI[dadu - 1]}\n\n` +
        `${color} ${name}: *${oldPos}* → *${newPos}*${event}\n\n` +
        `> 🎯 Giliran: @${nextPlayer.split("@")[0]}\n` +
        `> Escribe *kocok*`,
      contextInfo: utCtx([nextPlayer]),
    });
  } else {
    await sendUT(
      sock,
      m.chat,
      `🎲 *DADU: ${dadu}* ${DICE_EMOJI[dadu - 1]}\n\n` +
      `${color} ${name}: *${oldPos}* → *${newPos}*${event}\n\n` +
      `> 🎯 Giliran: @${nextPlayer.split("@")[0]}\n` +
      `> Escribe *kocok*`,
      "🎲 GILIRAN",
      PLAYER_NAMES[nextTurn],
      [nextPlayer],
    );
  }

  return true;
}

exports.config = pluginConfig; exports.handler = handler; exports.answerHandler = answerHandler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinutilsjs = require('../../src/lib/ourin-utils.js');
const pluginConfig = {
  name: "tictactoe",
  alias: ["ttt", "xo"],
  category: "game",
  description: "TicTacToe principal con otro jugador",
  usage: ".tictactoe [room name] atau .ttt",
  example: ".tictactoe",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 0,
  isEnabled: true,
};

const boardSymbols = {
  X: "❌",
  O: "⭕",
  1: "1️⃣",
  2: "2️⃣",
  3: "3️⃣",
  4: "4️⃣",
  5: "5️⃣",
  6: "6️⃣",
  7: "7️⃣",
  8: "8️⃣",
  9: "9️⃣",
};

class TicTacToe {
  constructor(playerX = "x", playerO = "o") {
    this.playerX = playerX;
    this.playerO = playerO;
    this._currentTurn = false;
    this._x = 0;
    this._o = 0;
    this.turns = 0;
  }

  get board() {
    return this._x | this._o;
  }

  get currentTurn() {
    return this._currentTurn ? this.playerO : this.playerX;
  }

  get enemyTurn() {
    return this._currentTurn ? this.playerX : this.playerO;
  }

  static check(state) {
    for (let combo of [7, 56, 73, 84, 146, 273, 292, 448])
      if ((state & combo) === combo) return true;
    return false;
  }

  static toBinary(x = 0, y = 0) {
    if (x < 0 || x > 2 || y < 0 || y > 2) throw new Error("invalid position");
    return 1 << (x + 3 * y);
  }

  turn(player = 0, x = 0, y) {
    if (this.board === 511) return -3;
    let pos = 0;
    if (y == null) {
      if (x < 0 || x > 8) return -1;
      pos = 1 << x;
    } else {
      if (x < 0 || x > 2 || y < 0 || y > 2) return -1;
      pos = TicTacToe.toBinary(x, y);
    }
    if (this._currentTurn ^ player) return -2;
    if (this.board & pos) return 0;
    this[this._currentTurn ? "_o" : "_x"] |= pos;
    this._currentTurn = !this._currentTurn;
    this.turns++;
    return 1;
  }

  static render(boardX = 0, boardO = 0) {
    let x = parseInt(boardX.toString(2), 4);
    let y = parseInt(boardO.toString(2), 4) * 2;
    return [...(x + y).toString(4).padStart(9, "0")]
      .reverse()
      .map((value, index) => (value == 1 ? "X" : value == 2 ? "O" : ++index));
  }

  render() {
    return TicTacToe.render(this._x, this._o);
  }

  get winner() {
    let x = TicTacToe.check(this._x);
    let o = TicTacToe.check(this._o);
    return x ? this.playerX : o ? this.playerO : false;
  }
}

if (!global.tictactoeGames) global.tictactoeGames = {};

function isRateLimitError(error) {
  const message = String(_optionalChain([error, 'optionalAccess', _ => _.message]) || "").toLowerCase();
  return (
    message.includes("rate-overlimit") ||
    message.includes("rate overlimit") ||
    message.includes("ratelimit") ||
    message.includes("rate límite")
  );
}

function normalizeMentions(text, extraMentions = []) {
  const parsed = _ourinutilsjs.parseMention.call(void 0, text).map((number) => `${number}@s.whatsapp.net`);
  const all = [...parsed, ...(extraMentions || [])].filter(Boolean);
  return [...new Set(all)];
}

async function sendWithRetry(action) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (!isRateLimitError(error) || attempt === 2) {
        throw error;
      }
      await _ourinutilsjs.delay.call(void 0, 1200 * Math.pow(2, attempt));
    }
  }
  throw lastError;
}

async function safeReply(m, text, options = {}) {
  const mentions = normalizeMentions(text, options.mentions || []);
  const replyOptions = { ...options, mentions };
  try {
    return await sendWithRetry(() => m.reply(text, replyOptions));
  } catch (error) {
    if (isRateLimitError(error)) return null;
    throw error;
  }
}

async function safeReact(m, emoji) {
  try {
    await sendWithRetry(() => m.react(emoji));
  } catch (error) {}
}
async function handler(m, { sock }) {
  const db = _ourindatabasejs.getDatabase.call(void 0, );
  const args = m.args || [];
  const roomName = args.join(" ").trim();

  //Compruebe si el jugador alreacy en un juego
  const existingRoom = Object.values(global.tictactoeGames).find(
    (room) =>
      room.id.startsWith("ttt_") &&
      [room.game.playerX, room.game.playerO].filter(Boolean).includes(m.sender),
  );

  if (existingRoom) {
    return safeReply(
      m,
      `❌¡Todavía estás en el juego!\n\n` +
        `Para terminar tu juego o tu perra para ser una perra.`,
    );
  }

  // Find waiting room or create new
  let room = Object.values(global.tictactoeGames).find(
    (r) =>
      r.state === "WAITING" &&
      r.chat === m.chat &&
      (roomName ? r.name === roomName : true),
  );

  if (room) {
    // Join existing room
    room.game.playerO = m.sender;
    room.state = "PLAYING";

    const board = renderBoard(room.game.render());

    const txt =
      `🎮 *ᴛɪᴄ ᴛᴀᴄ ᴛᴏᴇ*\n\n` +
      `¡Los socios encontrados!\n\n` +
      `❌ @${room.game.playerX.split("@")[0]}\n` +
      `⭕ @${room.game.playerO.split("@")[0]}\n\n` +
      `${board}\n\n` +
      `> Giliran: @${room.game.currentTurn.split("@")[0]}\n` +
      `*Responde este mensaje con un mensaje @-@ 9*\n` +
      `# Mierda @-@ daisy #`;

    await safeReact(m, "🎮");
    await safeReply(m, txt, {
      mentions: [room.game.playerX, room.game.playerO],
    });
  } else {
    // Create new room
    const roomId = "ttt_" + Date.now();

    global.tictactoeGames[roomId] = {
      id: roomId,
      chat: m.chat,
      name: roomName || null,
      game: new TicTacToe(m.sender, null),
      state: "WAITING",
      createdAt: Date.now(),
    };

    await safeReact(m, "🕕");
    await safeReply(
      m,
      `🎮 *ᴛɪᴄ ᴛᴀᴄ ᴛᴏᴇ*\n\n` +
        `¡Se está haciendo la habitación!\n\n` +
        `> Escribe\`Tictactoe.${roomName ? " " + roomName : ""}\`para join\n` +
        `*La habitación e*xmetida en 5 minutos`,
    );

    // Auto delete after 5 min
    setTimeout(() => {
      if (_optionalChain([global, 'access', _2 => _2.tictactoeGames, 'access', _3 => _3[roomId], 'optionalAccess', _4 => _4.state]) === "WAITING") {
        delete global.tictactoeGames[roomId];
      }
    }, 300000);
  }
}

// ==================== Answer Handler ====================
async function answerHandler(m, sock) {
  if (!m.body) return false;

  const text = m.body.trim().toLowerCase();

  //*Encontrar un jugador* *con algunas manos* *alguna partida*
  const room = Object.values(global.tictactoeGames).find(
    (r) =>
      r.state === "PLAYING" &&
      r.chat === m.chat &&
      [r.game.playerX, r.game.playerO].filter(Boolean).includes(m.sender),
  );

  if (!room) return false;

  const db = _ourindatabasejs.getDatabase.call(void 0, );

  // Handle surrender
  if (text === "nyerah" || text === "surrender" || text === "give up") {
    const winner =
      m.sender === room.game.playerX ? room.game.playerO : room.game.playerX;
    const loser = m.sender;

    // Reward winner
    const winnerData = db.getUser(winner) || {};
    winnerData.koin = (winnerData.koin || 0) + 500;
    db.setUser(winner, winnerData);

    await safeReact(m, "🏳️");
    await safeReply(
      m,
      `🏳️ *Rendirse!*\n\n` +
        `@${loser.split("@")[0]}rendirse!\n` +
        `@${winner.split("@")[0]}Ganar! + Rp 50000`,
      { mentions: [winner, loser] },
    );

    delete global.tictactoeGames[room.id];
    return true;
  }

  //Compruebe si movimiento válido
  const move = parseInt(text);
  if (isNaN(move) || move < 1 || move > 9) return false;

  // Check if it's player's turn
  if (room.game.currentTurn !== m.sender) {
    await safeReply(m, "❌ Bukan giliranmu!");
    return true;
  }

  // Make move
  const player = room.game.playerX === m.sender ? 0 : 1;
  const result = room.game.turn(player, move - 1);

  if (result === 0) {
    await safeReply(m, "❌¡La posición está cubierta!");
    return true;
  }

  if (result === -1) {
    await safeReply(m, "❌¡Posición inválida!");
    return true;
  }

  const board = renderBoard(room.game.render());
  const winner = room.game.winner;
  const isTie = room.game.board === 511 && !winner;

  if (winner) {
    const loser =
      winner === room.game.playerX ? room.game.playerO : room.game.playerX;

    // Reward winner
    const winnerData = db.getUser(winner) || {};
    winnerData.koin = (winnerData.koin || 0) + 1000;
    db.setUser(winner, winnerData);

    await safeReact(m, "🎉");
    await safeReply(
      m,
      `🎉* ¡Juego OVER!\n\n` +
        `${board}\n\n` +
        `🏆 @${winner.split("@")[0]}¡Voy a ganar!`,
      { mentions: [winner, loser] },
    );

    delete global.tictactoeGames[room.id];
    return true;
  }

  if (isTie) {
    await safeReact(m, "🤝");
    await safeReply(
      m,
      `🤝 *SERI!*\n\n` + `${board}\n\n` + `- ¡No hay ganadores!`,
      { mentions: [room.game.playerX, room.game.playerO] },
    );

    delete global.tictactoeGames[room.id];
    return true;
  }

  //Continuar juego
  await safeReply(
    m,
    `🎮 *ᴛɪᴄ ᴛᴀᴄ ᴛᴏᴇ*\n\n` +
      `${board}\n\n` +
      `> Giliran: @${room.game.currentTurn.split("@")[0]}`,
    { mentions: [room.game.currentTurn] },
  );

  return true;
}

// ==================== Helper ====================
function renderBoard(arr) {
  const cells = arr.map((cell) => boardSymbols[String(cell)] || cell);
  return `┌───┬───┬───┐
│ ${cells[0]} │ ${cells[1]} │ ${cells[2]} │
├───┼───┼───┤
│ ${cells[3]} │ ${cells[4]} │ ${cells[5]} │
├───┼───┼───┤
│ ${cells[6]} │ ${cells[7]} │ ${cells[8]} │
└───┴───┴───┘`;
}

exports.config = pluginConfig; exports.handler = handler; exports.answerHandler = answerHandler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
  name: 'gamenew',
  alias: ['newgame', 'youhugame'],
  category: 'main',
  description: 'Menú Youhu juego para Al Miku',
  usage: '.gamenew',
  example: '.gamenew',
  isOwner: false,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 3,
  energi: 0,
  isEnabled: true,
};

async function handler(m) {
  const p = m.prefix || '.';
  return m.reply(`╭─「 🎮CENTER DEL JUEGO」
│
│  01  ♟️  Chess
│      └─ ${p}chess
│
│  02  🦖  Dino
│      └─ ${p}dino
│
│  03  🏎️  MBIM
│      └─ ${p}mbim
│
│  04  🚀  Plane
│      └─ ${p}plane
│
│  05  ❌⭕  Tic Tac Toe
│      └─ ${p}ttc
│
╰─「 AL MIKU GAMES 」`);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

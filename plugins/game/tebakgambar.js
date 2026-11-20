"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ouringamesjs = require('../../src/lib/ourin-games.js');

_ouringamesjs.games.register('tebakgambar', {
    alias: ['tg', 'guessimage'],
    emoji: '🖼️',
    title: 'TEBAK GAMBAR',
    description: 'Tebak kata dari gambar',
    timeout: 90000,
    hasImage: true,
    questionField: null,
    hintCount: 3
})

const { config: pluginConfig, handler, answerHandler } = _ouringamesjs.games.createPlugin('tebakgambar')
exports.config = pluginConfig; exports.handler = handler; exports.answerHandler = answerHandler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

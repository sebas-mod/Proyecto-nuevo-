"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ouringamesjs = require('../../src/lib/ourin-games.js');

_ouringamesjs.games.register('tebakhewan', {
    alias: ['th', 'guessanimal'],
    emoji: '🐾',
    title: 'TEBAK HEWAN',
    description: 'Tebak nama hewan',
})

const { config: pluginConfig, handler, answerHandler } = _ouringamesjs.games.createPlugin('tebakhewan')
exports.config = pluginConfig; exports.handler = handler; exports.answerHandler = answerHandler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

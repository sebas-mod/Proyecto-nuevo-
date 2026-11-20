"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ouringamesjs = require('../../src/lib/ourin-games.js');

_ouringamesjs.games.register('tebakmakanan', {
    alias: ['makanan', 'food'],
    emoji: '🍲',
    title: 'TEBAK MAKANAN',
    description: 'Tebak nama makanan',
    hasImage: true
})

const { config: pluginConfig, handler, answerHandler } = _ouringamesjs.games.createPlugin('tebakmakanan')
exports.config = pluginConfig; exports.handler = handler; exports.answerHandler = answerHandler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ouringamesjs = require('../../src/lib/ourin-games.js');

_ouringamesjs.games.register('tebakepep', {
    alias: ['tebakff', 'tebakfreefire'],
    emoji: '🔫',
    title: 'TEBAK EPEP',
    description: 'Tebak karakter Free Fire',
    hasImage: true
})

const { config: pluginConfig, handler, answerHandler } = _ouringamesjs.games.createPlugin('tebakepep')
exports.config = pluginConfig; exports.handler = handler; exports.answerHandler = answerHandler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ouringamesjs = require('../../src/lib/ourin-games.js');

_ouringamesjs.games.register('tebakjkt48', {
    alias: ['jkt48', 'jkt'],
    emoji: '🎀',
    title: 'TEBAK JKT48',
    description: 'Tebak member JKT48',
    hasImage: true
})

const { config: pluginConfig, handler, answerHandler } = _ouringamesjs.games.createPlugin('tebakjkt48')
exports.config = pluginConfig; exports.handler = handler; exports.answerHandler = answerHandler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

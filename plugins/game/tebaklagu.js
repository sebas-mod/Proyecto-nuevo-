"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ouringamesjs = require('../../src/lib/ourin-games.js');

_ouringamesjs.games.register('tebaklagu', {
    alias: ['tl', 'guesssong'],
    emoji: '🎵',
    title: 'TEBAK LAGU',
    description: 'Tebak judul lagu'
})

const { config: pluginConfig, handler, answerHandler } = _ouringamesjs.games.createPlugin('tebaklagu')
exports.config = pluginConfig; exports.handler = handler; exports.answerHandler = answerHandler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

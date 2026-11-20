"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ouringamesjs = require('../../src/lib/ourin-games.js');

_ouringamesjs.games.register('tebaknegara', {
    alias: ['tn', 'guesscountry'],
    emoji: '🌍',
    title: 'TEBAK NEGARA',
    description: 'Tebak nama negara'
})

const { config: pluginConfig, handler, answerHandler } = _ouringamesjs.games.createPlugin('tebaknegara')
exports.config = pluginConfig; exports.handler = handler; exports.answerHandler = answerHandler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

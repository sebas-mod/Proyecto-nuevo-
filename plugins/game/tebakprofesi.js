"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ouringamesjs = require('../../src/lib/ourin-games.js');

_ouringamesjs.games.register('tebakprofesi', {
    alias: ['tp', 'guessjob'],
    emoji: '👨‍💼',
    title: 'TEBAK PROFESI',
    description: 'Adivina el nombre de la profesión.'
})

const { config: pluginConfig, handler, answerHandler } = _ouringamesjs.games.createPlugin('tebakprofesi')
exports.config = pluginConfig; exports.handler = handler; exports.answerHandler = answerHandler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

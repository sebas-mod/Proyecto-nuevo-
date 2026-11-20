"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ouringamesjs = require('../../src/lib/ourin-games.js');

_ouringamesjs.games.register('siapakahaku', {
    alias: ['siapa', 'whoami'],
    emoji: '🎭',
    title: 'SIAPAKAH AKU',
    description: 'Adivina de la descripción'
})

const { config: pluginConfig, handler, answerHandler } = _ouringamesjs.games.createPlugin('siapakahaku')
exports.config = pluginConfig; exports.handler = handler; exports.answerHandler = answerHandler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

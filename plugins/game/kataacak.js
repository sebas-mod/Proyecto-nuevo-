"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ouringamesjs = require('../../src/lib/ourin-games.js');

_ouringamesjs.games.register('kataacak', {
    alias: ['ka', 'acakkata'],
    emoji: '🔤',
    title: 'KATA ACAK',
    description: 'Susun huruf acak'
})

const { config: pluginConfig, handler, answerHandler } = _ouringamesjs.games.createPlugin('kataacak')
exports.config = pluginConfig; exports.handler = handler; exports.answerHandler = answerHandler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

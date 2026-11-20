"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ouringamesjs = require('../../src/lib/ourin-games.js');

_ouringamesjs.games.register('tebaktebakan', {
    alias: ['tbt', 'tebak2an', 'receh'],
    emoji: '😄',
    title: 'TEBAK-TEBAKAN',
    description: 'Tebak-tebakan receh'
})

const { config: pluginConfig, handler, answerHandler } = _ouringamesjs.games.createPlugin('tebaktebakan')
exports.config = pluginConfig; exports.handler = handler; exports.answerHandler = answerHandler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

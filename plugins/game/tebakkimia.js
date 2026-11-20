"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ouringamesjs = require('../../src/lib/ourin-games.js');

_ouringamesjs.games.register('tebakkimia', {
    alias: ['kimia', 'chemistry', 'unsur'],
    emoji: '🧪',
    title: 'TEBAK KIMIA',
    description: 'Tebak unsur kimia',
    questionField: 'unsur',
    answerField: 'lambang'
})

const { config: pluginConfig, handler, answerHandler } = _ouringamesjs.games.createPlugin('tebakkimia')
exports.config = pluginConfig; exports.handler = handler; exports.answerHandler = answerHandler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _almikuhttpjs = require('../../src/lib/almiku-http.js');
var _almikuerrorjs = require('../../src/lib/almiku-error.js'); var _almikuerrorjs2 = _interopRequireDefault(_almikuerrorjs);
const pluginConfig = {
    name: 'muslimai',
    alias: ['islamai', 'quranai'],
    category: 'ai',
    description: 'AI para preguntar sobre Islam y AlQUrano',
    usage: '.muslimai <pertanyaan>',
    example: '.muslimai ¿Qué es el ayuno?',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 1,
    isEnabled: true
}

class MuslimAI {
    constructor() {
        this.url = "https://www.muslimai.io/api/chat";
        this.headers = { "Content-Type": "application/json" };
    }

    _id() {
        return "019e7d1d-e8a4-702d-96b8-defd87522114";
    }

    _body(q) {
        return JSON.stringify({
            query: q,
            distinctId: this._id()
        });
    }

    _opts(q) {
        return {
            method: "POST",
            headers: this.headers,
            body: this._body(q)
        };
    }

    _parse(res) {
        let txt = "";
        for (const l of res.split("\n")) {
            try {
                const p = JSON.parse(l);
                if (p.type === "text") txt += p.data;
            } catch (e) {}
        }
        return txt || res;
    }

    async chat(q) {
        const req = await fetch(this.url, this._opts(q));
        const res = await req.text();
        return this._parse(res);
    }
}

async function handler(m, { sock }) {
    const text = m.args.join(' ')
    if (!text) {
        return m.reply(`☪ᴍᴜSʟɪᴍ ᴀɪ*\n\nHe aquí una pregunta sobre el Islam\n\n\`Ejemplo:${m.prefix}¿Qué es un shoalat?\``)
    }

    m.react('🕕')

    try {
        const data = await new MuslimAI().chat(`${text}`)
        let response = `${data}`

        m.react('✅')
        await m.reply(response)

    } catch (error) {
        m.react('☢')
        m.reply(_almikuerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName))
    }
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

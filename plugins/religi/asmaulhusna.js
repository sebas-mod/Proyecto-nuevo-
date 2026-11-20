"use strict";Object.defineProperty(exports, "__esModule", {value: true});var _ouringamedatajs = require('../../src/lib/ourin-game-data.js');
const pluginConfig = {
    name: 'asmaulhusna',
    alias: ['asmaul', 'husna', '99names'],
    category: 'religi',
    description: '99 El nombre de Alá ( Asmaul Husna )',
    usage: '.asmaulhusna [nomor/nama]',
    example: '.asmaulhusna 1\n.asmaulhusna ar rahman',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 3,
    energi: 0,
    isEnabled: true
};

async function handler(m) {
    const query = m.args.join(' ').trim();
    
    let name;
    
    if (!query) {
        name = _ouringamedatajs.getRandomItem.call(void 0, 'asmaulhusna.json');
    } else if (/^\d+$/.test(query)) {
        const index = parseInt(query);
        if (index < 1 || index > 99) {
            await m.reply('❌¡Los nomores deben ser entre 1 y 99!');
            return;
        }
        name = _ouringamedatajs.getItemByIndex.call(void 0, 'asmaulhusna.json', index);
    } else if (query.toLowerCase() === 'all' || query.toLowerCase() === 'semua') {
        const allNames = _ouringamedatajs.getAllData.call(void 0, 'asmaulhusna.json');
        let text = `☪️ *ASMAUL HUSNA*\n`;
        text += `99 El nombre de Dios es SWT\n\n`;
        text += `\`\`\``;
        
        for (const n of allNames.slice(0, 33)) {
            text += `${n.index}. ${n.latin}\n`;
        }
        
        text += `\`\`\`\n`;
        text += `Haalman 1 / 3\n\n`;
        text += `*Uso.*`;
        
        await m.reply(text);
        return;
    } else {
        name = _ouringamedatajs.searchItem.call(void 0, 'asmaulhusna.json', query, 'latin');
    }
    
    if (!name) {
        await m.reply('❌¡El nombre no fue encontrado!\nIntenta nominal 1 - 99 o latin _ nombre');
        return;
    }
    
    let text = `☪️ *ASMAUL HUSNA*\n\n`;
    text += `\`\`\``;
    text += `📍Número:${name.index}\n`;
    text += `🔤 Latin : ${name.latin}\n`;
    text += `📜 Arab  : ${name.arabic}`;
    text += `\`\`\`\n\n`;
    text += `> 🇮🇩 Arti (ID): ${name.translation_id}\n`;
    text += `> 🇬🇧 Arti (EN): ${name.translation_en}`;
    
    await m.reply(text);
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

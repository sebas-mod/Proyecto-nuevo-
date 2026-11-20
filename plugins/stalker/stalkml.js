"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }var _nodefetch = require('node-fetch'); var _nodefetch2 = _interopRequireDefault(_nodefetch);

const pluginConfig = {
    name: 'stalkml',
    alias: ['mlstalk', 'ceknickml', 'nickml'],
    category: 'stalker',
    description: 'Saber el nombre / el apodo de la cuenta Mobile Legends se basa en id y Servidor.',
    usage: '.stalkml <id> | <server>',
    example: '.stalkml 1264042367 | 15139',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 2,
    isEnabled: true
};

const REGION_MAP = {
  "1":"Indonesia","2":"Indonesia","3":"Indonesia","4":"Indonesia",
  "5":"Indonesia","6":"Indonesia","7":"Indonesia","8":"Indonesia","9":"Indonesia",
  "10":"Malaysia / SG / BN","11":"Philippines","12":"Thailand",
  "13":"Vietnam","14":"Cambodia","15":"Myanmar","16":"Laos",
  "17":"Timor-Leste","19":"Middle East","20":"North America",
  "21":"Europe","22":"South America",
};

function getRegion(sid) {
  const s = String(sid);
  return _nullishCoalesce(_nullishCoalesce(REGION_MAP[s.slice(0, 2)], () => ( REGION_MAP[s.slice(0, 1)])), () => ( "Unknown"));
}

async function handler(m, { text }) {
    if (!text) {
        return m.reply(
            `🎮 *STALKER MOBILE LEGENDS* 🎮\n\n` +
            `Está función le ayudará a rastrear e identificar el apodo o el nombre de la cuenta de alguien de Mobile Legends utilizando su id y Servidor.\n\n` +
            `*Como usarlo:*\n` +
            `- Escribe\`${m.prefix}stalkml <ID> | <Server>\`\n` +
            `- Ejemplo:\`${m.prefix}stalkml 1264042367 | 15139\`\n\n` +
            `Para la separación D y servidor también puede utilizar el espaciado o el formato de los signos de jaula como 1264042367 ( 15139 ).`
        );
    }

    try {
        await m.react('🕕');

        let userId = "";
        let serverId = "";

        if (text.includes('|')) {
            const parts = text.split('|').map(v => v.trim());
            userId = parts[0];
            serverId = parts[1];
        } else if (text.includes('(') && text.includes(')')) {
            const match = text.match(/(\d+)\s*\(\s*(\d+)\s*\)/);
            if (match) {
                userId = match[1];
                serverId = match[2];
            } else {
                const pureNumbers = text.replace(/[^\d]/g, '');
                if (pureNumbers.length > 4) {
                    serverId = pureNumbers.slice(-4);
                    userId = pureNumbers.slice(0, -4);
                }
            }
        } else {
            const parts = text.split(/\s+/).filter(v => v.trim().length > 0);
            if (parts.length >= 2) {
                userId = parts[0];
                serverId = parts[1];
            } else {
                const pureNumbers = text.replace(/[^\d]/g, '');
                if (pureNumbers.length > 4) {
                    serverId = pureNumbers.slice(-4);
                    userId = pureNumbers.slice(0, -4);
                } else {
                    userId = pureNumbers;
                }
            }
        }

        if (!userId || !serverId) {
            await m.react('❌');
            return m.reply(`❌*Formato Incorrecto*\n\nAsegúrese de poner en el ID completo y servidor.\nEjemplo:\`${m.prefix}stalkml 1264042367 | 15139\``);
        }

        const res = await _nodefetch2.default.call(void 0, `https://api.isan.eu.org/nickname/ml?id=${userId}&servidor=${serverId}`, { 
            headers: { "User-Agent": "StalkML/1.0", "Accept": "application/json" },
            timeout: 10000
        });

        const json = await res.json();

        if (json.success) {
            const region = getRegion(serverId);
            
            let caption = `🎮 *MOBILE LEGENDS STALKER* 🎮\n\n`;
            caption += `Búsqueda sucedida! Aft es una cuenta de detalle que trazaste:\n\n`;
            caption += `👤 *Nickname:* ${json.name}\n`;
            caption += `🆔 *User ID:* ${userId}\n`;
            caption += `🌐*Servidor ID:*${serverId}\n`;
            caption += `🗺️ *Region:* ${region}\n`;

            await m.reply(caption);
            await m.react('✅');
        } else {
            await m.react('❌');
            return m.reply(`❌> 91; No se ha encontrado en el sitio > 93;\n\nLo siento, el sistema no pudo encontrar una cuenta con id *${userId}Y Servidor${serverId}* Asegúrese de que el id y el servidor estén marcados correctamente.`);
        }
    } catch (e) {
        console.error(e);
        await m.react('❌');
        m.reply(`❌*FILED THROUSTAND SHE END *\n\nLo sentimos, el erosá teniendo un desglose mientras llama Fuego para rastrear la cuenta.`);
    }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

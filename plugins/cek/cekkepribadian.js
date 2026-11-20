"use strict";Object.defineProperty(exports, "__esModule", {value: true});const pluginConfig = {
    name: 'cekkepribadian',
    alias: ['kepribadian', 'personality'],
    category: 'cek',
    description: 'Verifica tu personalidad',
    usage: '.cekkepribadian <nama>',
    example: '.cekkepribadian Budi',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

const personalities = [
    { type: 'INTJ', title: 'The Architect', desc: 'Visión, estrategas, e independiente' },
    { type: 'INTP', title: 'The Logician', desc: 'Analítico, inovalente, y curioso' },
    { type: 'ENTJ', title: 'The Commander', desc: 'Firma, ambisio, y el líder de la naturaleza.' },
    { type: 'ENTP', title: 'The Debater', desc: 'Cerdas, preguntas, y mucho desafío.' },
    { type: 'INFJ', title: 'The Advocate', desc: 'Idols, un sabio, y un lleno de cuatroía' },
    { type: 'INFP', title: 'The Mediator', desc: 'Creativo, idealista, dedicado' },
    { type: 'ENFJ', title: 'The Protagonist', desc: 'Karismatik, inspirar y cuidar' },
    { type: 'ENFP', title: 'The Campaigner', desc: 'Antusias, creativa, y socializada' },
    { type: 'ISTJ', title: 'The Logistician', desc: 'Responsable, práctico, y minucioso' },
    { type: 'ISFJ', title: 'The Defender', desc: 'Cada, soporte, y confiable' },
    { type: 'ESTJ', title: 'The Executive', desc: 'Organizado, determinado, y tradicional' },
    { type: 'ESFJ', title: 'The Consul', desc: '* Mind, socials, and leales *' },
    { type: 'ISTP', title: 'The Virtuoso', desc: 'Flexible, observvan, y práctica' },
    { type: 'ISFP', title: 'The Adventurer', desc: 'Artistics, sensibilidad, y espontáneamente' },
    { type: 'ESTP', title: 'The Entrepreneur', desc: 'Energik, perceptivo, y tantalize' },
    { type: 'ESFP', title: 'The Entertainer', desc: 'Espontáneo, enérgico y divertido' }
]

async function handler(m) {
        const mentioned = m.mentionedJid[0] || m.sender

        const p = personalities[Math.floor(Math.random() * personalities.length)]
    
    let txt = mentioned === m.sender ? `Hola @${mentioned.split('@')[0]}
    
Tu tasa de personalidad${p.type} - ${p.title}*
\`\`\`${p.desc}\`\`\`` : `Usted quiere comprobar la personalidad @${mentioned.split('@')[0]} yak? 
    
Su personalidad es *${p.type} - ${p.title}*
\`\`\`${p.desc}\`\`\``
    
    await m.reply(txt, { mentions: [mentioned] })
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

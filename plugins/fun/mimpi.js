"use strict";Object.defineProperty(exports, "__esModule", {value: true});/**
 * Mimpi / Dream World - Fun dream interpretation generator
 * Ported from RTXZY-MD-pro
 */

const pluginConfig = {
    name: 'mimpi',
    alias: ['dream', 'dreamworld'],
    category: 'fun',
    description: 'Examine el mundo bajo el nombre del mimpmimu',
    usage: '.mimpi <nama>',
    example: '.mimpi Keisya',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 15,
    energi: 1,
    isEnabled: true
}

const DREAM_LEVELS = ['Lucid ✨', 'Mystic 🌟', 'Ethereal 💫', 'Divine 🌙', 'Legendary 🎇']
const DREAM_QUALITIES = ['Peaceful 😌', 'Adventure 🚀', 'Mystical 🔮', 'Prophecy 📖', 'Epic 🗺️']

const ELEMENTS = [
    '🌊 Lautan Kristal Bercahaya',
    '🌈 Pelangi Mengambang',
    '🌺 Taman Melayang',
    '⭐ Konstelasi Hidup',
    '🌙Mes Kembar',
    '🏰 Kastil Awan',
    '🌋 Gunung Prisma',
    '🎭 Theater Bayangan'
]

const EVENTS = [
    '🦋@-@ I @-@ @-@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@',
    '🎭 Topeng menari sendiri',
    '🌊 Hujan bintang jatuh ke laut',
    '🎪 Parade makhluk ajaib',
    '🌺 Bunga bernyanyi lagu kuno',
    '🎨 Lukisan menjadi hidup',
    '🎵 Musik terlihat sebagai warna',
    '⚡ Petir membentuk tangga ke langit'
]

const ENCOUNTERS = [
    '🐉 Naga Pelangi Bijaksana',
    '🧙‍♂️ Penyihir Bintang',
    '🦊 Rubah Spirit Sembilan Ekor',
    '🧝‍♀️ Peri Pembawa Mimpi',
    '🦁 Singa Kristal',
    '🐋 Paus Terbang Mistis',
    '🦅Pajaro PhoenixTiempo',
    '🐢 Kura-kura Pembawa Dunia',
    '🦄 Unicorn Dimensi'
]

const POWERS = [
    '✨Mengendalikan Tiempo',
    '🌊Habla con Element.',
    '🎭 Shapeshifting',
    '🌈 Manipulasi Realitas',
    '👁️ Penglihatan Masa Depan',
    '🎪 Teleportasi Dimensi',
    '🌙 Penyembuhan Spiritual',
    '⚡ Energi Kosmik'
]

const MESSAGES = [
    'Su viaje traerá un cambio de tamaño.',
    'El secreto kuno se revelará en poco tiempo',
    'El poder oculto se levantará pronto.',
    'Takdir baru menanti di horizon',
    'Las conexiones espirituales serán fuertes',
    'Una transformación masiva está a punto de ocurrir.',
    'El divorcio vendrá de la Arah sin amasar',
    'La importante misión se iniciará pronto'
]

function generateDream(seed) {
    const seedNum = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0)
    
    const pick = (arr) => arr[seedNum % arr.length]
    const pickMulti = (arr, count) => {
        const shuffled = [...arr].sort(() => Math.random() - 0.5)
        return shuffled.slice(0, count)
    }
    
    return {
        level: pick(DREAM_LEVELS),
        quality: pick(DREAM_QUALITIES),
        elements: pickMulti(ELEMENTS, 3),
        events: pickMulti(EVENTS, 2),
        encounters: pickMulti(ENCOUNTERS, 2),
        powers: pickMulti(POWERS, 2),
        message: pick(MESSAGES)
    }
}

async function handler(m, { sock }) {
    const args = m.args || []
    let name = args.join(' ') || m.pushName || m.sender.split('@')[0]
    
    await m.react('🌙')
    await m.reply('🌙 *Memasuki alam mimpi...*')
    await new Promise(r => setTimeout(r, 1500))
    
    const dream = generateDream(name)
    
    let txt = `╭═══❯ *🌙 DREAM WORLD* ❮═══\n`
    txt += `│ 👤 *Explorer:* ${name}\n`
    txt += `│ ⭐ *Level:* ${dream.level}\n`
    txt += `│ 💫 *Quality:* ${dream.quality}\n`
    txt += `│ 🌈 *Elements:*\n`
    for (const el of dream.elements) {
        txt += `│ ├ ${el}\n`
    }
    txt += `│ 🎪 *Events:*\n`
    for (const ev of dream.events) {
        txt += `│ ├ ${ev}\n`
    }
    txt += `│ 🌟 *Encounters:*\n`
    for (const enc of dream.encounters) {
        txt += `│ ├ ${enc}\n`
    }
    txt += `│ 💫 *Powers:*\n`
    for (const pow of dream.powers) {
        txt += `│ ├ ${pow}\n`
    }
    txt += `│ 🔮 *Message:*\n`
    txt += `│ ${dream.message}\n`
    txt += `╰════════════════════`
    
    await m.reply(txt)
}

exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

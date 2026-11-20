"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _fs = require('fs'); var _fs2 = _interopRequireDefault(_fs);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _googlettsapi = require('google-tts-api'); var _googlettsapi2 = _interopRequireDefault(_googlettsapi);
const pluginConfig = {
    name: 'cekkhodam',
    alias: ['khodam', 'cekhodam'],
    category: 'fun',
    description: 'Mira el khodam tú mismo o otros',
    usage: '.cekkhodam atau reply pesan seseorang',
    example: '.cekkhodam',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 10,
    energi: 1,
    isEnabled: true
}
const KHODAMS = [
    { name: "Harimau Putih", meaning: "Eres fuerte y bien moda como un harimau, porque tu predecesor heredó mucho poder sobre ti." },
    { name: "Lampu Tertidur", meaning: "Es como el sueño, pero siempre está dando su luz cálida" },
    { name: "Panda Ompong", meaning: "Eres horrenda y siempre exitosa, haciendo que la gente sonríe a tu raro." },
    { name: "Bebek Karet", meaning: "Siempre estás tranquilo y alegre, capaz de manejar una ola de problemas con una sonrisa." },
    { name: "Ninja Turtle", meaning: "Estás infundida y sofocada, lista para proteger el impuro con tu fuerza de combate." },
    { name: "Kucing Kulkas", meaning: "Eres misteriosa y siempre en lugares que no son bienvenidos." },
    { name: "Sabun Wangi", meaning: "Llevas tu dulce y dulce fragancia dondequiera que estés." },
    { name: "Semut Kecil", meaning: "Usted es un trabajador duro y siempre puede ser utilizado en cualquier situación." },
    { name: "Cupcake Pelangi", meaning: "Eres una manesa y una atleta, siempre con alegría y alegría." },
    { name: "Robot Mini", meaning: "Usted ' es sofisticado y siempre listo para ayudar con la alta inteligencia tecnológica ." },
    { name: "Ikan Terbang", meaning: "Eres único y lleno de sorpresas, superando siempre los límites." },
    { name: "Ayam Goreng", meaning: "Siempre te tratan y te esperan personas, llenas de crueldad a cada paso." },
    { name: "Kecoa Terbang", meaning: "Siempre sorprende y no puede permitirse llenar una habitación." },
    { name: "Kambing Ngebor", meaning: "Eres único y siempre dejas que la gente se ría de tu comportamiento extraño." },
    { name: "Kerupuk Renyah", meaning: "Siempre dices algo más divertido y cortés." },
    { name: "Celengan Babi", meaning: "Siempre tienes una sorpresa." },
    { name: "Lemari Tua", meaning: "Estás lleno de historias y recuerdos." },
    { name: "Kopi Susu", meaning: "Eres dulce y siempre estás emocionado por la gente que te rodea." },
    { name: "Sapu Lidi", meaning: "Eres fuerte y siempre se te puede permitir limpiar el desastre." },
    { name: "Indomie Goreng", meaning: "\" Pide siempre una taza de vino y felicidad. \"" },
    { name: "Es Krim Meleleh", meaning: "Siempre derretir algo con su sabor dulce." },
    { name: "Bakso Ulet", meaning: "Siempre persistente y redondo en la cara de problemas." },
    { name: "Lem Super", meaning: "La silueta pegajosa en situaciones complejas" },
    { name: "Kecap Manis", meaning: "Siempre dar un toque dulce en la vida" },
    { name: "Sabun Mandi", meaning: "Y limpio y fragante." },
    { name: "Kopi Tumpah", meaning: "Siempre emocionado, pero eres un desastre" },
    { name: "Kucing Kampung", meaning: "Solo y lleno de aventura" },
    { name: "Jamu Pahit", meaning: "Selalu memberi kekuatan meski tak enak di awal" },
    { name: "Teh Celup", meaning: "Selalu memberikan rasa hangat di hati" },
    { name: "Motor Astrea", meaning: "Y el banco." },
    { name: "Mie Instan", meaning: "Siempre apurate y relajate" },
    { name: "Bolu Kukus", meaning: "Suave y dulce y dulce" },
    { name: "Tahu Bulat", meaning: "Selalu enak di segala suasana" },
    { name: "Nasi Uduk", meaning: "Siempre coque en todo el tiempo" },
    { name: "Singa Bermahkota", meaning: "Naciste un líder, poseído de la fuerza y la sabiduría de un rey." },
    { name: "Macan Kumbang", meaning: "Eres misteriosa y a vapor, como un macan que siempre ha visto pero siempre está vigilante." },
    { name: "Kuda Emas", meaning: "Eres preciosa y puntiaguda, lista para correr para tener éxito." },
    { name: "Elang Biru", meaning: "Usted tiene una visión aguda y puede ver la oportunidad de lejos." },
    { name: "Naga Pelangi", meaning: "Eres duro y tienes la fuerza para proteger y atacar." },
    { name: "Gajah Putih", meaning: "Eres sabio y poderoso, emblema de coraje y coraje." },
    { name: "Banteng Sakti", meaning: "Eres un hombre apasionado y apasionado, sin miedo que enfrenta un desafío." },
    { name: "Kipas Angin", meaning: "Selalu memberikan angin segar" },
    { name: "Rice Cooker", meaning: "Cocinar arroz con sabor perfecto" },
    { name: "Honda Beat", meaning: "Selalu lincah di jalanan" },
    { name: "Sandal Jepit", meaning: "Relájate y relájate." },
    { name: "Bantal Guling", meaning: "Selalu nyaman di pelukan" },
    { name: "Anjing Pelacak", meaning: "Siempre estás tan dedicado y dedicado, siempre encuentras una manera de tu causa." }
]
function getRandomKhodam() {
    const idx = Math.floor(Math.random() * KHODAMS.length)
    return KHODAMS[idx]
}
async function handler(m, { sock }) {
    let targetJid = m.sender
    let targetName = m.pushName || m.sender.split('@')[0]
    if (m.quoted) {
        targetJid = m.quoted.sender
        targetName = m.quoted.pushName || targetJid.split('@')[0]
    } else if (_optionalChain([m, 'access', _ => _.mentionedJid, 'optionalAccess', _2 => _2[0]])) {
        targetJid = m.mentionedJid[0]
        targetName = targetJid.split('@')[0]
    } else if(m.text) {
        targetName = m.text
    }
    const khodam = getRandomKhodam()
    let txt = `Hola hermano${targetName || ""}Tu Khodam es${khodam.name}Este Khodam tiene un significado:${khodam.meaning}`
    try {
        const audioUrl = _googlettsapi2.default.getAudioUrl(txt, { lang: 'id', slow: false, host: 'https://translate.google.com' });
        await sock.sendMessage(m.chat, { audio: { url: audioUrl }, mimetype: 'audio/mpeg' }, { quoted: m });
    } catch (e) {
        m.reply(txt);
    }
}
exports.config = pluginConfig; exports.handler = handler;
if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

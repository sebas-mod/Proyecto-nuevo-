"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }var _ourindatabasejs = require('../../src/lib/ourin-database.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: ["tod", "spin", "putarbotol"],
  alias: ["todgame"],
  category: "fun",
  description: "Jugar la Verdad o el Rebaño con amigos, grupo en @ - @ leyes!",
  usage: ".tod",
  example: ".tod",
  isOwner: false,
  isPremium: false,
  isGroup: true,
  isPrivate: false,
  cooldown: 5,
  energi: 1,
  isEnabled: true,
};

const truths = [
  "¿Quién fue la última persona que conversaste antes de este mensaje?",
  "¿Cuál es el secreto más grande que nunca le has dicho a nadie en este grupo?",
  "Si se le permite casarse con uno de estos clientes del grupo, ¿quién elegirá?",
  "¿Alguna vez te ha gustado alguien en este grupo pero no ha tenido las bolas para revelarlas?",
  "¿Cuál es la cosa más vergonzosa que te ha pasado en público?",
  "Haz tres cosas que más odias de ti mismo.",
  "Si pudieras volver a tiempo, ¿qué vergüenza querrías cambiar?",
  "¿Quién es tu manteno más hermoso?",
  "¿Alguna vez le has mentido a un padre de una escuela?",
  "¿Cuál es la cosa más ridícula que has visto en tu historia en la búsqueda de Google?",
  "¿Quién es el más divertido @-@ como miembro de este grupo?",
  "El último lugar en el que lloraste fue ¿por qué razón?",
  "¿Cuántas cuentas de saldo están en su cuenta ahora?",
  "¿Alguna vez has conocido el atascamiento de alguien?",
  "¿Cuál es la mentira más grande que le has dicho a tu mejor amigo?"
];

const dares = [
  "¡Tu autofotografía con la más fea gash está ahora en el grupo!",
  "La Nota de Voz cantando el coro de mi canción de canto Cinco estaba enamorada pero todos los cascos vocales se convirtieron en",
  "¡Chota tu mantán ahora, di que lo siento aún te amo y luego captura de pantalla y envíalo al grupo!",
  "Pakai foto profil wajah jelekmu selama 1 jam penuh!",
  "Me encanta tanto... y lo dejo ir por 30 minutos.",
  "Ksena VN mujer que Mewing sigma skibidi con un tono series a grupo.",
  "Las cinco pegatinas más absurdas que tienes en este grupo ahora mismo.",
  "Etiqueta uno de los adminidores grupo y diga a su culo feo hoy.",
  "Tu bio @-@ doc se convirtió en una mentira. Yo era un imbécil por un día.",
  "¡El ángulo más obsceno del grupo más genial @-@ miembro de combate!",
  "Buat 1 puisi alay tentang ayam goreng, bacakan lewat VN!",
  "Soy un niño de verdad y etiquetaré a tres tipos en este grupo.",
  "¡Mantén tu nombre completo en la voz de la vocalización VN!",
  "Escoge uno de los números en la forma aleatoria de tu contacto, chat por 10 veces, screenshot por aquí!",
  "Así que tome está foto del perfil de bot como su perfil de WhatsApp durante 30 minutos."
];

async function handler(m, { sock }) {
  try {
    const cmd = m.command.toLowerCase();
    if (cmd === "tod" || cmd === "spin" || cmd === "putarbotol") {
      const groupMetadata = await sock.groupMetadata(m.chat);
      const participants = groupMetadata.participants;
      const randomMember = participants[Math.floor(Math.random() * participants.length)];
      const targetJid = randomMember.jid;
      const isTruth = Math.random() > 0.5;
      let typeLabel = "";
      let challengeText = "";

      if (isTruth) {
        typeLabel = "🗣- ♪ VERDAD ♪🗣♪\n_ ( Debe respondió con una respuesta muy honesta! ) _";
        challengeText = truths[Math.floor(Math.random() * truths.length)];
      } else {
        typeLabel = "🔥DARE🔥\n¡Debe hacer, shrieba a grupo!";
        challengeText = dares[Math.floor(Math.random() * dares.length)];
      }

      let text = `🍾*BOTOL Reproducido!*🍾\n\n`;
      text += `Las torceduras de botella en el medio de tu cuerpo..\n`;
      text += `Sus rondas están disminuyendo, y deja de apuntar a..\n\n`;
      text += `👉 @${targetJid.split('@')[0]} 👈\n\n`;
      text += `${typeLabel}\n\n`;
      text += `*Desafio/Pregunta:*\n👉 ${challengeText}`;

      return m.reply(text, { mentions: [targetJid] });
    }
  } catch (error) {
    console.error("[ToD Plugin Error]", error);
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

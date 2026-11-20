"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "confess",
  alias: ["confession", "menfess", "anonim"],
  category: "fun",
  description: "Mensaje de correo a alguien.",
  usage: ".confess nomor|pesan",
  example: ".confess 6281234567890|Hai, aku suka kamu!",
  isOwner: false,
  isPremium: true,
  isGroup: false,
  isPrivate: false,
  cooldown: 60,
  energi: 1,
  isEnabled: true,
};

if (!global.confessData) global.confessData = new Map();

async function handler(m, { sock }) {
  const input = _optionalChain([m, 'access', _ => _.fullArgs, 'optionalAccess', _2 => _2.trim, 'call', _3 => _3()]) || _optionalChain([m, 'access', _4 => _4.text, 'optionalAccess', _5 => _5.trim, 'call', _6 => _6()]);

  if (!input || !input.includes("|")) {
    let txt = `💌 *LAYANAN MENFESS ANONIM* 💌\n\n`;
    txt += `¿Enviarás mensajes secretos a un gigante o a un amigo sin saberlo?\n\n`;
    txt += `*Como usarlo:*\n`;
    txt += `👉 \`${m.prefix}confess número|mensaje\`\n\n`;
    txt += `*Ejemplo:*\n`;
    txt += `> \`${m.prefix}¡Me encanta tu sonrisa!\`\n\n`;
    txt += `♪🤫Relájate, tu identidad es 100% segura y bien @-@ hecha!`;
    return m.reply(txt);
  }

  const [rawNumber, ...messageParts] = input.split("|");
  const message = messageParts.join("|").trim();

  if (!rawNumber || !message) {
    return m.reply(`¡El hermano no tiene forma!😅\n\nIntenta tik gini:\`${m.prefix}confess número|mensaje\``);
  }

  let targetNumber = rawNumber.trim().replace(/[^0-9]/g, "");

  if (targetNumber.startsWith("0")) {
    targetNumber = "62" + targetNumber.slice(1);
  }

  if (targetNumber.length < 10 || targetNumber.length > 15) {
    return m.reply(`El número de puntos que entraste no es válido,🤔`);
  }

  const targetJid = targetNumber + "@s.whatsapp.net";
  const senderNumber = m.sender.split("@")[0];

  if (targetNumber === senderNumber) {
    return m.reply(`Lo siento por mí mismo, hermana.😂`);
  }

  try {
    const [onWa] = await sock.onWhatsApp(targetNumber);
    if (!_optionalChain([onWa, 'optionalAccess', _7 => _7.exists])) {
      return m.reply(`Bueno, hermana, núnúme\`${targetNumber}\`¡No está registrado en WhatsApp!😔`);
    }
  } catch (e) {}

  if (message.length < 5) {
    return m.reply(`El menseje es corto, hermana! 5 segundos mínimo, permítáme hacerlo más importante.📝`);
  }

  if (message.length > 1000) {
    return m.reply(`Wah pesannya kepanjangan hermano! Maksimal 1000 caracter si biar bacanya no pusing. 📜`);
  }

  const confessText = `💌* ¡Hay un servicio secreto hecho por usted! >💌\n\n` +
    `Alguien ha estado en silencio enviándote mensajes.\n\n` +
    `💬*Isi Mensaje:*\n` +
    `\`\`\`${message}\`\`\`\n\n` +
    `♪🔒Para que Mensaje enviara de manera anónima.\n` +
    `♪✉¡No puedes pedirme que me des la vuelta!`;

  try {
    const sentMsg = await sock.sendMessage(targetJid, {
      text: confessText,
      contextInfo: {
        forwardingScore: 99,
        isForwarded: true,
      },
    });

    global.confessData.set(sentMsg.key.id, {
      senderJid: m.sender,
      senderChat: m.chat,
      targetJid: targetJid,
      createdAt: Date.now(),
    });

    setTimeout(() => {
      global.confessData.delete(sentMsg.key.id);
    }, 24 * 60 * 60 * 1000);

    let successTxt = `✅* MESFESS SLAMS SLAPPING *✅\n\n`;
    successTxt += `♪📱Enviado a:\`${targetNumber}\`\n`;
    successTxt += `♪🔒Su identidad es segura. ¡Sexos!\n\n`;
    successTxt += `Cocinaré mi camino aquí.😉`;
    await m.reply(successTxt);
  } catch (error) {
    m.reply(_ourinerrorjs2.default.call(void 0, m.prefix, m.command, m.pushName));
  }
}

async function replyHandler(m, { sock }) {
  if (!m.quoted) return false;

  const quotedId = _optionalChain([m, 'access', _8 => _8.quoted, 'optionalAccess', _9 => _9.id]) || _optionalChain([m, 'access', _10 => _10.quoted, 'optionalAccess', _11 => _11.key, 'optionalAccess', _12 => _12.id]);
  if (!quotedId) return false;

  const confessInfo = global.confessData.get(quotedId);
  if (!confessInfo) return false;

  if (m.sender !== confessInfo.targetJid) return false;

  const replyMessage = _optionalChain([m, 'access', _13 => _13.body, 'optionalAccess', _14 => _14.trim, 'call', _15 => _15()]);
  if (!replyMessage) return false;

  const saluranId = _optionalChain([_configjs2.default, 'access', _16 => _16.saluran, 'optionalAccess', _17 => _17.id]) || "120363400911374213@newsletter";
  const saluranName = _optionalChain([_configjs2.default, 'access', _18 => _18.saluran, 'optionalAccess', _19 => _19.name]) || _optionalChain([_configjs2.default, 'access', _20 => _20.bot, 'optionalAccess', _21 => _21.name]) || "Ourin-AI";

  const replyText = `💌* NO REFECTO FEESS Aquí Hermano! ]💌\n\n` +
    `El hombre que envió tadis hace un rato nueva votación su mensaje:\n\n` +
    `💬*Isi Respuesta:*\n` +
    `\`\`\`${replyMessage}\`\`\`\n\n` +
    `♪🔒Relájate, tu identidad sigue siendo segura!`;

  try {
    await sock.sendMessage(confessInfo.senderChat, {
      text: replyText,
      contextInfo: {
        forwardingScore: 9999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: saluranId,
          newsletterName: saluranName,
          serverMessageId: 127,
        },
      },
    });

    await sock.sendMessage(m.chat, {
      text: `✅Te conseguiré la entrega secreta.`,
    });

    global.confessData.delete(quotedId);
    return true;
  } catch (error) {
    return false;
  }
}

exports.config = pluginConfig; exports.handler = handler; exports.replyHandler = replyHandler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}

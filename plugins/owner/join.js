"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }var _configjs = require('../../config.js'); var _configjs2 = _interopRequireDefault(_configjs);
var _ourincontextjs = require('../../src/lib/ourin-context.js');
var _ourinerrorjs = require('../../src/lib/ourin-error.js'); var _ourinerrorjs2 = _interopRequireDefault(_ourinerrorjs);

const pluginConfig = {
  name: "join",
  alias: ["joingrup", "joingroup", "gabung"],
  category: "owner",
  description: "* Entrada al grupo mediante enlace, invitación, respuesta de apoyo*",
  usage: ".join <link> / .join (reply pesan berisi link)",
  example: ".join https://chat.whatsapp.com/xxx",
  isOwner: true,
  isPremium: false,
  isGroup: false,
  isPrivate: false,
  cooldown: 10,
  energi: 0,
  isEnabled: true,
};

function extractAllInviteCodes(text) {
  if (!text) return [];
  const codes = [];
  const seen = new Set();

  const patterns = [
    /chat\.whatsapp\.com\/([a-zA-Z0-9]{20,})/gi,
    /invite\.whatsapp\.com\/([a-zA-Z0-9]{20,})/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const code = match[1];
      if (!seen.has(code)) {
        seen.add(code);
        codes.push(code);
      }
    }
  }

  return codes;
}

async function joinGroup(sock, inviteCode) {
  try {
    const groupInfo = await sock.groupGetInviteInfo(inviteCode);
    if (!groupInfo) return { success: false, error: "Can 't retrieve group inho" };

    const botJid = _optionalChain([sock, 'access', _ => _.user, 'optionalAccess', _2 => _2.id, 'optionalAccess', _3 => _3.replace, 'call', _4 => _4(/:.*@/, "@")]) || "";
    const isMember = _optionalChain([groupInfo, 'access', _5 => _5.participants, 'optionalAccess', _6 => _6.some, 'call', _7 => _7(
      (p) => p.id === botJid || _optionalChain([p, 'access', _8 => _8.id, 'optionalAccess', _9 => _9.includes, 'call', _10 => _10(_optionalChain([sock, 'access', _11 => _11.user, 'optionalAccess', _12 => _12.id, 'optionalAccess', _13 => _13.split, 'call', _14 => _14(":"), 'access', _15 => _15[0]]))]),
    )]);

    if (isMember) {
      return {
        success: false,
        alreadyMember: true,
        subject: groupInfo.subject || "Unknown",
      };
    }

    await sock.groupAcceptInvite(inviteCode);
    return {
      success: true,
      subject: groupInfo.subject || "Unknown",
      members: groupInfo.size || _optionalChain([groupInfo, 'access', _16 => _16.participants, 'optionalAccess', _17 => _17.length]) || 0,
      owner: _optionalChain([groupInfo, 'access', _18 => _18.owner, 'optionalAccess', _19 => _19.split, 'call', _20 => _20("@"), 'access', _21 => _21[0]]) || "Unknown",
    };
  } catch (error) {
    let errorMsg = error.message || "Enlace inválido";
    if (errorMsg.includes("not-authorized")) errorMsg = "El enlace ya no es válido o exPillada";
    else if (errorMsg.includes("gone") || errorMsg.includes("item-not-found") || errorMsg.includes("404")) errorMsg = "Grupo no encontract (lo siento / si revolcar enlacce )";
    else if (errorMsg.includes("conflict")) errorMsg = "Lo siento.";
    else errorMsg = "El enlace no es válido o bot está en la unión";
    return { success: false, error: errorMsg };
  }
}

async function handler(m, { sock }) {
  const input = m.args.join(" ").trim();
  let sourceText = input;

  if (!input && m.quoted) {
    sourceText = m.quoted.body || m.quoted.text || m.quoted.contentText || "";
  }

  if (!sourceText) {
    return m.reply(
      `🔗*Join Grupo*\n\n` +
        `Para unirse al grupo de enlaces desprevenido le invitamos a pescar.\n\n` +
        `*Uso:*\n` +
        `> *${m.prefix}únete<link>*—" Nunca te olvidaré. "\n` +
        `> *${m.prefix}únete a * (respuestas de mensajes )—Únase a los enlaces en la respuesta del mensaje\n\n` +
        `*Ejemplo:*\n` +
        `> *${m.prefix}join https://chat.whatsapp.com/xxx*\n` +
        `Responder mensaje el agradecimiento y luego el imbécil${m.prefix}join*\n\n` +
        `* Detectará todos los enlaces del grupo en el mensaje y se unirá uno por uno*`
    );
  }

  const inviteCodes = extractAllInviteCodes(sourceText);

  if (inviteCodes.length === 0) {
    return m.reply(
      `❌No Enlace del grupo\n\n` +
        `* No se puede encontrar un enlace que invite al grupo en el mensaje.*\n\n` +
        `* Fata siguiente línea: *\n` +
        `> *https://chat.whatsapp.com/xxx*\n` +
        `> *https://invite.whatsapp.com/xxx*`
    );
  }

  m.react("🕕");

  if (inviteCodes.length === 1) {
    const result = await joinGroup(sock, inviteCodes[0]);

    if (result.alreadyMember) {
      m.react("❌");
      return m.reply(
        `❌* Ha pasado un tiempo *\n\n# Ya te unes al grupo #${result.subject}*`
      );
    }

    if (!result.success) {
      m.react("❌");
      return m.reply(`❌*Fallido Join*\n\n♪${result.error}`);
    }

    m.react("✅");
    const ctx = _ourincontextjs.saluranCtx.call(void 0, );
    return m.reply(
      `✅*Exito Join!*\n\n` +
        `♪🏠Nombre: *${result.subject}*\n` +
        `> 👥 Member: *${result.members}*\n` +
        `♪👤Propietario: *${result.owner}*`,
      { contextInfo: ctx }
    );
  }

  let resultText =
    `🔗 *Multi Join — ${inviteCodes.length}Enlace Terdeteksi*\n\n` +
    `Nos uniremos a todos los grupos uno por uno.\n\n`;

  let successCount = 0;
  let alreadyCount = 0;
  let failedCount = 0;

  for (let i = 0; i < inviteCodes.length; i++) {
    const result = await joinGroup(sock, inviteCodes[i]);

    if (result.alreadyMember) {
      alreadyCount++;
      resultText += `*${i + 1}.* ${result.subject} — ⚠# Ya photo\n`;
    } else if (result.success) {
      successCount++;
      resultText += `*${i + 1}.* ${result.subject} — ✅Exito join\n`;
    } else {
      failedCount++;
      resultText += `*${i + 1}.* ${inviteCodes[i].substring(0, 12)}... — ❌ ${result.error}\n`;
    }

    if (i < inviteCodes.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  resultText +=
    `\n*Resultado:*\n` +
    `♪✅Exito: *${successCount}*\n` +
    `♪⚠*Ya photo:*${alreadyCount}*\n` +
    `♪❌Fallido: *${failedCount}*\n` +
    `> 📊 Total: *${inviteCodes.length}*`;

  m.react(successCount > 0 ? "✅" : "❌");
  return m.reply(resultText);
}

exports.config = pluginConfig; exports.handler = handler;

if (exports.default && typeof exports.default === 'object') {
  module.exports = exports.default;
  module.exports.default = exports.default;
}
